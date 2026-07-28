const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const sourceRoot = path.resolve(__dirname, "..", "src");

function findJavaScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findJavaScriptFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".js") ? [entryPath] : [];
  });
}

test("all backend source files pass the Node.js syntax check", () => {
  const sourceFiles = findJavaScriptFiles(sourceRoot);
  assert.ok(sourceFiles.length > 0, "expected backend JavaScript source files");

  for (const sourceFile of sourceFiles) {
    const result = spawnSync(process.execPath, ["--check", sourceFile], {
      encoding: "utf8"
    });

    assert.equal(
      result.status,
      0,
      `${path.relative(sourceRoot, sourceFile)} failed syntax validation:\n${result.stderr}`
    );
  }
});
