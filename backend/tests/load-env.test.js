const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const backendRoot = path.resolve(__dirname, "..");
const repositoryRoot = path.resolve(backendRoot, "..");
const environmentPath = path.join(backendRoot, "src", "environment.js");
const preloadPath = path.join(backendRoot, "src", "load-env.js");
const packageJson = require("../package.json");

test("backend commands preload the repository environment loader", () => {
  for (const command of ["start", "init-db", "ensure-schema"]) {
    assert.match(
      packageJson.scripts[command],
      /^node --require \.\/src\/load-env\.js /,
      `${command} must load the shared environment boundary before its entry point`
    );
  }
});

test("the default environment file is the repository root .env", () => {
  const { ROOT_ENV_PATH } = require(environmentPath);

  assert.equal(ROOT_ENV_PATH, path.join(repositoryRoot, ".env"));
});

test("an environment file does not override values supplied by the process", (t) => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "zero-env-test-"));
  const environmentFile = path.join(temporaryDirectory, ".env");
  const originalFileValue = process.env.ZERO_ENV_TEST_FILE_VALUE;
  const originalProcessValue = process.env.ZERO_ENV_TEST_PROCESS_VALUE;
  const originalEmptyValue = process.env.ZERO_ENV_TEST_EMPTY_VALUE;

  fs.writeFileSync(
    environmentFile,
    [
      "ZERO_ENV_TEST_FILE_VALUE=from-file",
      "ZERO_ENV_TEST_PROCESS_VALUE=from-file",
      "ZERO_ENV_TEST_EMPTY_VALUE=from-file",
      ""
    ].join("\n"),
    "utf8"
  );
  delete process.env.ZERO_ENV_TEST_FILE_VALUE;
  process.env.ZERO_ENV_TEST_PROCESS_VALUE = "from-process";
  process.env.ZERO_ENV_TEST_EMPTY_VALUE = "";

  t.after(() => {
    if (originalFileValue === undefined) delete process.env.ZERO_ENV_TEST_FILE_VALUE;
    else process.env.ZERO_ENV_TEST_FILE_VALUE = originalFileValue;

    if (originalProcessValue === undefined) delete process.env.ZERO_ENV_TEST_PROCESS_VALUE;
    else process.env.ZERO_ENV_TEST_PROCESS_VALUE = originalProcessValue;

    if (originalEmptyValue === undefined) delete process.env.ZERO_ENV_TEST_EMPTY_VALUE;
    else process.env.ZERO_ENV_TEST_EMPTY_VALUE = originalEmptyValue;

    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  const { loadEnvironment } = require(environmentPath);
  const result = loadEnvironment(environmentFile);

  assert.deepEqual(result, { loaded: true, path: environmentFile });
  assert.equal(process.env.ZERO_ENV_TEST_FILE_VALUE, "from-file");
  assert.equal(process.env.ZERO_ENV_TEST_PROCESS_VALUE, "from-process");
  assert.equal(process.env.ZERO_ENV_TEST_EMPTY_VALUE, "");
});

test("a missing optional environment file is not an error", () => {
  const { loadEnvironment } = require(environmentPath);
  const missingPath = path.join(os.tmpdir(), `missing-zero-env-${process.pid}`, ".env");

  assert.deepEqual(loadEnvironment(missingPath), {
    loaded: false,
    path: missingPath
  });
});

test("environment read errors other than a missing file are rethrown", () => {
  const { loadEnvironment } = require(environmentPath);

  assert.throws(
    () => loadEnvironment(backendRoot),
    (error) => error && error.code === "EISDIR"
  );
});

test("a standalone backend deployment does not probe a parent .env file", (t) => {
  const standaloneRoot = fs.mkdtempSync(path.join(os.tmpdir(), "zero-standalone-test-"));
  const processEnvironment = {};
  fs.writeFileSync(path.join(standaloneRoot, ".env"), "ZERO_UNRELATED_VALUE=must-not-load\n", "utf8");
  t.after(() => fs.rmSync(standaloneRoot, { recursive: true, force: true }));

  const { loadRepositoryEnvironment } = require(environmentPath);
  const result = loadRepositoryEnvironment({
    repositoryRoot: standaloneRoot,
    processEnvironment
  });

  assert.deepEqual(result, {
    loaded: false,
    path: path.join(standaloneRoot, ".env"),
    reason: "repository-markers-missing"
  });
  assert.deepEqual(processEnvironment, {});
});

test("the preload boundary works from an unrelated working directory", (t) => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "zero-preload-test-"));
  const fixtureSource = path.join(fixtureRoot, "backend", "src");
  const unrelatedDirectory = path.join(fixtureRoot, "unrelated-working-directory");
  fs.mkdirSync(fixtureSource, { recursive: true });
  fs.mkdirSync(unrelatedDirectory);
  fs.writeFileSync(path.join(fixtureRoot, ".env.example"), "", "utf8");
  fs.writeFileSync(path.join(fixtureRoot, "docker-compose.yml"), "services: {}\n", "utf8");
  fs.writeFileSync(path.join(fixtureRoot, "backend", "package.json"), "{}\n", "utf8");
  fs.writeFileSync(
    path.join(fixtureRoot, ".env"),
    "ZERO_CHILD_FILE_VALUE=from-file\nZERO_CHILD_PROCESS_VALUE=from-file\n",
    "utf8"
  );
  fs.copyFileSync(environmentPath, path.join(fixtureSource, "environment.js"));
  fs.copyFileSync(preloadPath, path.join(fixtureSource, "load-env.js"));
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }));

  const childEnvironment = {
    ...process.env,
    NODE_PATH: path.join(backendRoot, "node_modules"),
    ZERO_CHILD_PROCESS_VALUE: "from-process"
  };
  delete childEnvironment.ZERO_CHILD_FILE_VALUE;

  const assertionScript = [
    "const assert = require('node:assert/strict');",
    "assert.equal(process.env.ZERO_CHILD_FILE_VALUE, 'from-file');",
    "assert.equal(process.env.ZERO_CHILD_PROCESS_VALUE, 'from-process');"
  ].join(" ");
  const result = require("node:child_process").spawnSync(
    process.execPath,
    ["--require", path.join(fixtureSource, "load-env.js"), "-e", assertionScript],
    {
      cwd: unrelatedDirectory,
      env: childEnvironment,
      encoding: "utf8"
    }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
});
