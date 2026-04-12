const express = require("express");
const fs = require("fs");

const pool = require("../db");
const { authRequired, adminRequired } = require("../middleware/auth");

const router = express.Router();
const LOG_PATH = process.env.NGINX_ACCESS_LOG || "/opt/1panel/www/sites/zerokara.pro/log/access.log";

router.get(["/api/admin/stats/summary", "/admin/stats/summary"], authRequired, adminRequired, async (req, res) => {
  try {
    const [activityRows] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
         SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft
       FROM activities`
    ).catch(() => [[{}]]);
    const [userRows] = await pool.query("SELECT role FROM users ORDER BY id ASC").catch(() => [[]]);
    const [scheduleRows] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN event_date >= CURDATE() THEN 1 ELSE 0 END) AS upcoming
       FROM schedule_events`
    ).catch(() => [[{}]]);
    const [bugRows] = await pool.query(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status = 'Fixing' THEN 1 ELSE 0 END) AS fixing
       FROM bugs`
    ).catch(() => [[{}]]);

    const activity = activityRows[0] || {};
    const schedule = scheduleRows[0] || {};
    const bug = bugRows[0] || {};
    const users = { total: userRows.length, byRole: { admin: 0, member: 0, other: 0 } };

    userRows.forEach((row) => {
      const role = String(row.role || "").toLowerCase();
      if (role === "admin") users.byRole.admin += 1;
      else if (role === "member") users.byRole.member += 1;
      else users.byRole.other += 1;
    });

    res.json({
      activities: {
        total: Number(activity.total || 0),
        published: Number(activity.published || 0),
        draft: Number(activity.draft || 0)
      },
      users,
      schedules: {
        total: Number(schedule.total || 0),
        upcoming: Number(schedule.upcoming || 0)
      },
      bugs: {
        total: Number(bug.total || 0),
        pending: Number(bug.pending || 0),
        fixing: Number(bug.fixing || 0)
      }
    });
  } catch (error) {
    console.error("[STATS] summary error:", error);
    res.status(500).json({ error: "Failed to load summary." });
  }
});

router.get(["/api/admin/stats/visits", "/admin/stats/visits"], authRequired, adminRequired, async (req, res) => {
  try {
    if (!fs.existsSync(LOG_PATH)) {
      return res.json({ today: 0, uniqueToday: 0, last24h: [], paths: [] });
    }

    const content = fs.readFileSync(LOG_PATH, "utf8");
    const lines = content.split("\n").filter((line) => line.trim());
    const now = new Date();
    const todayKey = formatDateKey(now);
    const pathCounts = {};
    const todayIps = new Set();
    const last24hBuckets = new Array(24).fill(0);
    let todayTotal = 0;

    for (const line of lines) {
      const match = line.match(/^(\S+) - - \[([^\]]+)\] "(\S+) ([^ ]+) [^"]*" (\d{3}) (\d+) "([^"]*)" "([^"]*)" "([^"]+)"?$/);
      if (!match) continue;

      const method = match[3];
      const reqPath = match[4];
      if (method !== "GET") continue;
      if (!(reqPath === "/" || reqPath.endsWith(".html"))) continue;

      const date = parseNginxTime(match[2]);
      if (!date) continue;
      const realIp = match[9] || match[1];
      const dateKey = formatDateKey(date);

      if (dateKey === todayKey) {
        todayTotal += 1;
        todayIps.add(realIp);
      }

      const diffMs = now - date;
      if (diffMs >= 0 && diffMs <= 24 * 60 * 60 * 1000) {
        last24hBuckets[date.getHours()] += 1;
      }

      pathCounts[reqPath] = (pathCounts[reqPath] || 0) + 1;
    }

    const last24h = last24hBuckets.map((count, hour) => ({
      hour: String(hour).padStart(2, "0"),
      count
    }));

    const paths = Object.entries(pathCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([path, count]) => ({ path, count }));

    res.json({
      today: todayTotal,
      uniqueToday: todayIps.size,
      last24h,
      paths
    });
  } catch (error) {
    console.error("[STATS] visits error:", error);
    res.status(500).json({ error: "Failed to load visit stats." });
  }
});

router.get(["/api/admin/stats/logs", "/admin/stats/logs"], authRequired, adminRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, type, message, created_at
       FROM system_logs
       ORDER BY created_at DESC
       LIMIT 12`
    ).catch((error) => {
      if (error.code === "ER_NO_SUCH_TABLE") return [[]];
      throw error;
    });

    res.json({
      items: rows.map((row) => ({
        id: row.id,
        type: row.type || "SYSTEM",
        message: row.message || "",
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    console.error("[STATS] logs error:", error);
    res.status(500).json({ error: "Failed to load logs." });
  }
});

router.post(["/api/admin/stats/logs", "/admin/stats/logs"], authRequired, adminRequired, async (req, res) => {
  try {
    const type = String(req.body?.type || "SYSTEM").trim();
    const message = String(req.body?.message || "").trim();
    if (!message) return res.status(400).json({ error: "Message is required." });

    await pool.query(
      `INSERT INTO system_logs (type, message, created_at) VALUES (?, ?, NOW())`,
      [type || "SYSTEM", message]
    ).catch((error) => {
      if (error.code === "ER_NO_SUCH_TABLE") return null;
      throw error;
    });

    res.status(201).json({ ok: true });
  } catch (error) {
    console.error("[STATS] log create error:", error);
    res.status(500).json({ error: "Failed to create log entry." });
  }
});

function parseNginxTime(raw) {
  try {
    const [datePart] = raw.split(" ");
    const [dayText, monthText, rest] = datePart.split("/");
    const monthMap = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    const month = monthMap[monthText];
    if (month == null) return null;

    const firstColon = rest.indexOf(":");
    const year = Number(rest.slice(0, firstColon));
    const [hour, minute, second] = rest.slice(firstColon + 1).split(":").map(Number);
    return new Date(year, month, Number(dayText), hour, minute, second);
  } catch {
    return null;
  }
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

module.exports = router;
