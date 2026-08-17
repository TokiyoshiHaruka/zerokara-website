const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const activityRoutes = require("./routes/activities");
const adminUsersRoutes = require("./routes/admin-users");
const scheduleEventsRoutes = require("./routes/schedule-events");
const statsRoutes = require("./routes/stats");
const bugsRoutes = require("./routes/bugs");
const {
  generalRateLimiter,
  parseTrustProxyHops
} = require("./rate-limit");

function healthHandler(_request, response) {
  response.json({ ok: true, time: new Date().toISOString() });
}

function createApp(options = {}) {
  const app = express();
  const trustProxy = options.trustProxy ?? parseTrustProxyHops(process.env.TRUST_PROXY_HOPS);
  const generalLimiter = options.generalLimiter ?? generalRateLimiter;

  app.set("trust proxy", trustProxy);
  app.use(cors());
  app.use(generalLimiter);
  app.use(express.json());
  app.use(authRoutes);
  app.use(activityRoutes);
  app.use(adminUsersRoutes);
  app.use(scheduleEventsRoutes);
  app.use(statsRoutes);
  app.use("/api", bugsRoutes);
  app.get("/api/health", healthHandler);
  app.get("/health", healthHandler);

  return app;
}

module.exports = { createApp };
