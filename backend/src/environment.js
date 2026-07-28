const fs = require("node:fs");
const path = require("node:path");

const dotenv = require("dotenv");

const REPOSITORY_ROOT = path.resolve(__dirname, "..", "..");
const ROOT_ENV_PATH = path.join(REPOSITORY_ROOT, ".env");
const REPOSITORY_MARKERS = [
  ".env.example",
  "docker-compose.yml",
  path.join("backend", "package.json")
];

function hasRepositoryMarkers(repositoryRoot) {
  return REPOSITORY_MARKERS.every((marker) => fs.existsSync(path.join(repositoryRoot, marker)));
}

function loadEnvironment(environmentFile = ROOT_ENV_PATH, processEnvironment = process.env) {
  const result = dotenv.config({
    path: environmentFile,
    processEnv: processEnvironment,
    override: false,
    quiet: true
  });

  if (result.error) {
    if (result.error.code === "ENOENT") {
      return { loaded: false, path: environmentFile };
    }
    throw result.error;
  }

  return { loaded: true, path: environmentFile };
}

function loadRepositoryEnvironment({
  repositoryRoot = REPOSITORY_ROOT,
  processEnvironment = process.env
} = {}) {
  const environmentFile = path.join(repositoryRoot, ".env");
  if (!hasRepositoryMarkers(repositoryRoot)) {
    return {
      loaded: false,
      path: environmentFile,
      reason: "repository-markers-missing"
    };
  }

  return loadEnvironment(environmentFile, processEnvironment);
}

module.exports = {
  REPOSITORY_ROOT,
  ROOT_ENV_PATH,
  hasRepositoryMarkers,
  loadEnvironment,
  loadRepositoryEnvironment
};
