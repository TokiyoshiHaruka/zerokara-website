const express = require("express");

const pool = require("../db");
const { authRequired, adminRequired } = require("../middleware/auth");

const router = express.Router();

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    titleJa: row.title_ja || "",
    titleZh: row.title_zh || "",
    titleEn: row.title_en || "",
    summaryJa: row.summary_ja || "",
    summaryZh: row.summary_zh || "",
    summaryEn: row.summary_en || "",
    bodyMdJa: row.body_md_ja || "",
    bodyMdZh: row.body_md_zh || "",
    bodyMdEn: row.body_md_en || "",
    coverImage: row.cover_image || "",
    status: row.status || "draft",
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizePayload(body = {}) {
  const status = String(body.status || "draft") === "published" ? "published" : "draft";
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
  return {
    slug: String(body.slug || "").trim(),
    titleJa: String(body.titleJa || "").trim(),
    titleZh: String(body.titleZh || "").trim(),
    titleEn: String(body.titleEn || "").trim(),
    summaryJa: String(body.summaryJa || "").trim(),
    summaryZh: String(body.summaryZh || "").trim(),
    summaryEn: String(body.summaryEn || "").trim(),
    bodyMdJa: String(body.bodyMdJa || ""),
    bodyMdZh: String(body.bodyMdZh || ""),
    bodyMdEn: String(body.bodyMdEn || ""),
    coverImage: String(body.coverImage || "").trim(),
    status,
    sortOrder
  };
}

async function listActivities() {
  const [rows] = await pool.query(
    `SELECT * FROM activities ORDER BY sort_order ASC, updated_at DESC, id DESC`
  );
  return rows.map(mapRow);
}

router.get(["/api/admin/activities", "/admin/activities"], authRequired, adminRequired, async (req, res) => {
  try {
    res.json({ items: await listActivities() });
  } catch (error) {
    console.error("[ACTIVITIES] list error:", error);
    res.status(500).json({ error: "Failed to load activities." });
  }
});

router.get(["/api/admin/activities/:id", "/admin/activities/:id"], authRequired, adminRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid activity id." });

    const [rows] = await pool.query("SELECT * FROM activities WHERE id = ? LIMIT 1", [id]);
    if (!rows.length) return res.status(404).json({ error: "Activity not found." });
    res.json({ item: mapRow(rows[0]) });
  } catch (error) {
    console.error("[ACTIVITIES] detail error:", error);
    res.status(500).json({ error: "Failed to load activity detail." });
  }
});

router.post(["/api/admin/activities", "/admin/activities"], authRequired, adminRequired, async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    if (!payload.slug || !payload.titleJa) {
      return res.status(400).json({ error: "Slug and Japanese title are required." });
    }

    await pool.query(
      `INSERT INTO activities (
        slug, title_ja, title_zh, title_en,
        summary_ja, summary_zh, summary_en,
        body_md_ja, body_md_zh, body_md_en,
        cover_image, status, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.slug,
        payload.titleJa,
        payload.titleZh || null,
        payload.titleEn || null,
        payload.summaryJa || null,
        payload.summaryZh || null,
        payload.summaryEn || null,
        payload.bodyMdJa || null,
        payload.bodyMdZh || null,
        payload.bodyMdEn || null,
        payload.coverImage || null,
        payload.status,
        payload.sortOrder
      ]
    );

    res.status(201).json({ items: await listActivities() });
  } catch (error) {
    console.error("[ACTIVITIES] create error:", error);
    res.status(500).json({ error: "Failed to create activity." });
  }
});

router.put(["/api/admin/activities/:id", "/admin/activities/:id"], authRequired, adminRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid activity id." });

    const payload = normalizePayload(req.body);
    if (!payload.slug || !payload.titleJa) {
      return res.status(400).json({ error: "Slug and Japanese title are required." });
    }

    await pool.query(
      `UPDATE activities SET
        slug = ?, title_ja = ?, title_zh = ?, title_en = ?,
        summary_ja = ?, summary_zh = ?, summary_en = ?,
        body_md_ja = ?, body_md_zh = ?, body_md_en = ?,
        cover_image = ?, status = ?, sort_order = ?
      WHERE id = ?`,
      [
        payload.slug,
        payload.titleJa,
        payload.titleZh || null,
        payload.titleEn || null,
        payload.summaryJa || null,
        payload.summaryZh || null,
        payload.summaryEn || null,
        payload.bodyMdJa || null,
        payload.bodyMdZh || null,
        payload.bodyMdEn || null,
        payload.coverImage || null,
        payload.status,
        payload.sortOrder,
        id
      ]
    );

    res.json({ items: await listActivities() });
  } catch (error) {
    console.error("[ACTIVITIES] update error:", error);
    res.status(500).json({ error: "Failed to update activity." });
  }
});

router.delete(["/api/admin/activities/:id", "/admin/activities/:id"], authRequired, adminRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid activity id." });

    await pool.query("DELETE FROM activities WHERE id = ?", [id]);
    res.json({ items: await listActivities() });
  } catch (error) {
    console.error("[ACTIVITIES] delete error:", error);
    res.status(500).json({ error: "Failed to delete activity." });
  }
});

router.get(["/api/public/activities", "/public/activities"], async (req, res) => {
  try {
    res.set("Cache-Control", "public, max-age=120, stale-while-revalidate=300");
    const [rows] = await pool.query(
      `SELECT * FROM activities
       WHERE status = 'published'
       ORDER BY sort_order ASC, updated_at DESC, id DESC`
    );
    res.json({ items: rows.map(mapRow) });
  } catch (error) {
    console.error("[ACTIVITIES] public list error:", error);
    res.status(500).json({ error: "Failed to load public activities." });
  }
});

module.exports = router;
