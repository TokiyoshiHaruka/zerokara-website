const assert = require("node:assert/strict");
const { once } = require("node:events");
const test = require("node:test");

const { createApp } = require("../src/app");
const { createGeneralRateLimiter } = require("../src/rate-limit");

function noLimit(_request, _response, next) {
  next();
}

async function listen(app, t) {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const address = server.address();
  return `http://127.0.0.1:${address.port}`;
}

async function drain(response) {
  await response.arrayBuffer();
  return response;
}

test("production composition limits before JSON parsing and skips health", async (t) => {
  const app = createApp({
    trustProxy: 0,
    generalLimiter: createGeneralRateLimiter({ windowMs: 60_000, limit: 1 })
  });
  app.post("/test/body", (request, response) => response.json({ body: request.body }));
  const origin = await listen(app, t);

  for (const path of ["/health", "/api/health", "/health", "/api/health"]) {
    assert.equal((await drain(await fetch(`${origin}${path}`))).status, 200);
  }

  const first = await fetch(`${origin}/test/body`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}"
  });
  assert.equal(first.status, 200);
  assert.deepEqual(await first.json(), { body: {} });

  const limited = await fetch(`${origin}/test/body`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{"
  });
  assert.equal(limited.status, 429);
  assert.deepEqual(await limited.json(), {
    error: "Too many requests. Please try again later."
  });
});

async function observeIp(trustProxy, t) {
  const app = createApp({ trustProxy, generalLimiter: noLimit });
  app.get("/test/ip", (request, response) => response.json({ ip: request.ip }));
  const origin = await listen(app, t);
  const response = await fetch(`${origin}/test/ip`, {
    headers: { "X-Forwarded-For": "198.51.100.40" }
  });
  assert.equal(response.status, 200);
  return (await response.json()).ip;
}

test("trusted proxy hop count controls the resolved client address", async (t) => {
  assert.notEqual(await observeIp(0, t), "198.51.100.40");
  assert.equal(await observeIp(1, t), "198.51.100.40");
});

test("both real login paths enforce the failed-attempt budget", async (t) => {
  const app = createApp({ trustProxy: 1, generalLimiter: noLimit });
  const origin = await listen(app, t);
  const paths = [
    { path: "/api/login", ip: "198.51.100.50" },
    { path: "/login", ip: "198.51.100.51" }
  ];

  for (const { path, ip } of paths) {
    const options = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Forwarded-For": ip
      },
      body: "{}"
    };

    for (let attempt = 0; attempt < 10; attempt += 1) {
      assert.equal((await drain(await fetch(`${origin}${path}`, options))).status, 400);
    }

    const limited = await fetch(`${origin}${path}`, options);
    assert.equal(limited.status, 429);
    assert.deepEqual(await limited.json(), {
      error: "Too many failed login attempts. Please try again later."
    });
  }
});
