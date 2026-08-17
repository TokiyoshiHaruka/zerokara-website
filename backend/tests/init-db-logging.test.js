const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const source = fs.readFileSync(
  path.resolve(__dirname, "..", "src", "init-db.js"),
  "utf8"
);

test("initializer logs status without the configured administrator username", () => {
  assert.doesNotMatch(source, /console\.(?:log|info|warn|error)\([^\n]*adminUser\.username/);
  assert.match(source, /console\.log\("\[INIT-DB\] admin user already exists\."\);/);
  assert.match(source, /console\.log\("\[INIT-DB\] admin user created\."\);/);
  assert.match(source, /console\.error\("\[INIT-DB\] failed\."\s*,\s*error\);/);
});
