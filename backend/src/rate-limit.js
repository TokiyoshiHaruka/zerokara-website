const { rateLimit } = require("express-rate-limit");

const GENERAL_LIMIT_MESSAGE = {
  error: "Too many requests. Please try again later."
};
const LOGIN_LIMIT_MESSAGE = {
  error: "Too many failed login attempts. Please try again later."
};

function parseTrustProxyHops(rawValue) {
  const value = rawValue == null ? "" : String(rawValue);
  const trimmed = value.trim();
  if (trimmed === "") return 0;
  if (!/^(?:0|[1-9]|10)$/.test(trimmed)) {
    throw new Error(
      "TRUST_PROXY_HOPS must be a canonical integer from 0 through 10."
    );
  }
  return Number(trimmed);
}

function createGeneralRateLimiter(overrides = {}) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: GENERAL_LIMIT_MESSAGE,
    skip: (request) => request.path === "/health" || request.path === "/api/health",
    ...overrides
  });
}

function createLoginRateLimiter(overrides = {}) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: LOGIN_LIMIT_MESSAGE,
    ...overrides
  });
}

const generalRateLimiter = createGeneralRateLimiter();
const loginRateLimiter = createLoginRateLimiter();

module.exports = {
  createGeneralRateLimiter,
  createLoginRateLimiter,
  generalRateLimiter,
  loginRateLimiter,
  parseTrustProxyHops
};
