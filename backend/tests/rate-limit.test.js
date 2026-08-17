const assert = require("node:assert/strict");
const { once } = require("node:events");
const test = require("node:test");
const express = require("express");

const {
  createGeneralRateLimiter,
  createLoginRateLimiter,
  parseTrustProxyHops
} = require("../src/rate-limit");

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

test("parses only canonical trusted proxy hop counts", () => {
  assert.equal(parseTrustProxyHops(undefined), 0);
  assert.equal(parseTrustProxyHops(""), 0);
  assert.equal(parseTrustProxyHops(" \t "), 0);
  assert.equal(parseTrustProxyHops("0"), 0);
  assert.equal(parseTrustProxyHops(" 1 "), 1);
  assert.equal(parseTrustProxyHops("10"), 10);

  for (const value of ["00", "01", "+1", "-1", "1.0", "1e1", "1 0", "11", "value"]) {
    assert.throws(
      () => parseTrustProxyHops(value),
      /TRUST_PROXY_HOPS must be a canonical integer from 0 through 10/
    );
  }
});

test("general limiter bounds requests and emits only draft-8 headers", async (t) => {
  const app = express();
  app.use(createGeneralRateLimiter({ windowMs: 60_000, limit: 2 }));
  app.get("/resource", (_request, response) => response.json({ ok: true }));
  const origin = await listen(app, t);

  assert.equal((await drain(await fetch(`${origin}/resource`))).status, 200);
  assert.equal((await drain(await fetch(`${origin}/resource`))).status, 200);
  const limited = await fetch(`${origin}/resource`);

  assert.equal(limited.status, 429);
  assert.deepEqual(await limited.json(), {
    error: "Too many requests. Please try again later."
  });
  for (const header of ["RateLimit", "RateLimit-Policy", "Retry-After"]) {
    assert.notEqual(limited.headers.get(header), null, `${header} must be present`);
  }
  for (const header of ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]) {
    assert.equal(limited.headers.get(header), null, `${header} must be absent`);
  }
});

test("general limiter skips both health paths", async (t) => {
  const app = express();
  app.use(createGeneralRateLimiter({ windowMs: 60_000, limit: 1 }));
  app.get(["/health", "/api/health"], (_request, response) => response.json({ ok: true }));
  app.get("/resource", (_request, response) => response.json({ ok: true }));
  const origin = await listen(app, t);

  for (const path of ["/health", "/api/health", "/health", "/api/health"]) {
    assert.equal((await drain(await fetch(`${origin}${path}`))).status, 200);
  }
  assert.equal((await drain(await fetch(`${origin}/resource`))).status, 200);
  assert.equal((await drain(await fetch(`${origin}/resource`))).status, 429);
});

test("login limiter counts failures and skips successful responses", async (t) => {
  const app = express();
  app.use("/login", createLoginRateLimiter({ windowMs: 60_000, limit: 1 }));
  app.get("/login", (request, response) => {
    response.sendStatus(request.query.ok === "1" ? 200 : 401);
  });
  const origin = await listen(app, t);

  assert.equal((await drain(await fetch(`${origin}/login?ok=1`))).status, 200);
  assert.equal((await drain(await fetch(`${origin}/login`))).status, 401);
  const limited = await fetch(`${origin}/login`);

  assert.equal(limited.status, 429);
  assert.deepEqual(await limited.json(), {
    error: "Too many failed login attempts. Please try again later."
  });
  for (const header of ["RateLimit", "RateLimit-Policy", "Retry-After"]) {
    assert.notEqual(limited.headers.get(header), null, `${header} must be present`);
  }
  for (const header of ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]) {
    assert.equal(limited.headers.get(header), null, `${header} must be absent`);
  }
});
