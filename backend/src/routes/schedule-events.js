const express = require("express");

const pool = require("../db");
const { authRequired, adminRequired } = require("../middleware/auth");

const router = express.Router();

function mapRow(row) {
  return {
    id: row.id,
    eventDate: row.event_date,
    eventTime: row.event_time,
    title: row.title,
    detail: row.detail || "",
    category: row.category || "other",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizePayload(body = {}) {
  const rawCategory = String(body.category || "other").trim();
  return {
    eventDate: String(body.eventDate || "").trim(),
    eventTime: String(body.eventTime || "").trim(),
    title: String(body.title || "").trim(),
    detail: String(body.detail || "").trim(),
    category: ["meeting", "event", "other"].includes(rawCategory) ? rawCategory : "other"
  };
}

async function listScheduleEvents() {
  const [rows] = await pool.query(
    `SELECT * FROM schedule_events ORDER BY event_date DESC, event_time DESC, id DESC`
  );
  return rows.map(mapRow);
}

router.get(["/api/schedule-events", "/schedule-events"], async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=120, stale-while-revalidate=300");
    const year = Number(req.query.year);
    const month = Number(req.query.month);
    let rows;

    if (year && month) {
      [rows] = await pool.query(
        `SELECT * FROM schedule_events
         WHERE YEAR(event_date) = ? AND MONTH(event_date) = ?
         ORDER BY event_date ASC, event_time ASC, id ASC`,
        [year, month]
      );
    } else {
      [rows] = await pool.query(
        `SELECT * FROM schedule_events
         ORDER BY event_date ASC, event_time ASC, id ASC`
      );
    }

    res.json({ items: rows.map(mapRow) });
  } catch (error) {
    console.error("[SCHEDULE] public list error:", error);
    res.status(500).json({ error: "Failed to load schedule events." });
  }
});

router.get(["/api/admin/schedule-events", "/admin/schedule-events"], authRequired, adminRequired, async (req, res) => {
  try {
    res.json({ items: await listScheduleEvents() });
  } catch (error) {
    console.error("[SCHEDULE] admin list error:", error);
    res.status(500).json({ error: "Failed to load schedule events." });
  }
});

router.get(["/api/admin/schedule-events/:id", "/admin/schedule-events/:id"], authRequired, adminRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid schedule id." });

    const [rows] = await pool.query("SELECT * FROM schedule_events WHERE id = ? LIMIT 1", [id]);
    if (!rows.length) return res.status(404).json({ error: "Schedule event not found." });
    res.json({ item: mapRow(rows[0]) });
  } catch (error) {
    console.error("[SCHEDULE] detail error:", error);
    res.status(500).json({ error: "Failed to load schedule event." });
  }
});

router.post(["/api/admin/schedule-events", "/admin/schedule-events"], authRequired, adminRequired, async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    if (!payload.eventDate || !payload.title) {
      return res.status(400).json({ error: "Date and title are required." });
    }

    await pool.query(
      `INSERT INTO schedule_events (event_date, event_time, title, detail, category)
       VALUES (?, ?, ?, ?, ?)`,
      [
        payload.eventDate,
        payload.eventTime || null,
        payload.title,
        payload.detail || null,
        payload.category
      ]
    );

    res.status(201).json({ items: await listScheduleEvents() });
  } catch (error) {
    console.error("[SCHEDULE] create error:", error);
    res.status(500).json({ error: "Failed to create schedule event." });
  }
});

router.put(["/api/admin/schedule-events/:id", "/admin/schedule-events/:id"], authRequired, adminRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid schedule id." });

    const payload = normalizePayload(req.body);
    if (!payload.eventDate || !payload.title) {
      return res.status(400).json({ error: "Date and title are required." });
    }

    await pool.query(
      `UPDATE schedule_events
       SET event_date = ?, event_time = ?, title = ?, detail = ?, category = ?
       WHERE id = ?`,
      [
        payload.eventDate,
        payload.eventTime || null,
        payload.title,
        payload.detail || null,
        payload.category,
        id
      ]
    );

    res.json({ items: await listScheduleEvents() });
  } catch (error) {
    console.error("[SCHEDULE] update error:", error);
    res.status(500).json({ error: "Failed to update schedule event." });
  }
});

router.delete(["/api/admin/schedule-events/:id", "/admin/schedule-events/:id"], authRequired, adminRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid schedule id." });

    await pool.query("DELETE FROM schedule_events WHERE id = ?", [id]);
    res.json({ items: await listScheduleEvents() });
  } catch (error) {
    console.error("[SCHEDULE] delete error:", error);
    res.status(500).json({ error: "Failed to delete schedule event." });
  }
});

module.exports = router;
