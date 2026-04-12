// src/server.js
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const activityRoutes = require("./routes/activities");
const adminUsersRoutes = require("./routes/admin-users");
const scheduleEventsRoutes = require("./routes/schedule-events");
const statsRoutes = require("./routes/stats");
const bugsRoutes = require("./routes/bugs");
const { ensureSchema } = require("./schema");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(authRoutes);
app.use(activityRoutes);
app.use(adminUsersRoutes);
app.use(scheduleEventsRoutes);
app.use(statsRoutes);
app.use("/api", bugsRoutes);

function healthHandler(req, res) {
  res.json({ ok: true, time: new Date().toISOString() });
}

app.get("/api/health", healthHandler);
app.get("/health", healthHandler);

async function start() {
  await ensureSchema();
  app.listen(PORT, () => {
    console.log(`ZERO API listening on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error("[ZERO API] failed to start", error);
  process.exit(1);
});
