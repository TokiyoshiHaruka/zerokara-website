const express = require("express");

const db = require("../db");
const { authRequired, adminRequired } = require("../middleware/auth");

const router = express.Router();

function mapBug(row) {
  return {
    id: row.id,
    bug_id: row.bug_id,
    project: row.project,
    severity: row.severity,
    title: row.title,
    steps: row.steps || "",
    expected: row.expected || "",
    actual: row.actual || "",
    reporter: row.reporter || "",
    status: row.status || "Pending",
    handler: row.handler || "",
    solution: row.solution || "",
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

router.get(["/admin/bugs/stats/overview", "/bugs/stats/overview"], authRequired, adminRequired, async (req, res) => {
  try {
    const [totalRows] = await db.execute("SELECT COUNT(*) AS count FROM bugs");
    const [severityRows] = await db.execute("SELECT severity, COUNT(*) AS count FROM bugs GROUP BY severity");
    const [statusRows] = await db.execute("SELECT status, COUNT(*) AS count FROM bugs GROUP BY status");
    res.json({ success: true, data: { total: totalRows[0]?.count || 0, bySeverity: severityRows, byStatus: statusRows } });
  } catch (error) {
    console.error("[BUGS] overview failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get(["/admin/bugs", "/bugs"], authRequired, adminRequired, async (req, res) => {
  try {
    const { project, severity, status } = req.query;
    let query = "SELECT * FROM bugs WHERE 1=1";
    const params = [];
    if (project) { query += " AND project = ?"; params.push(project); }
    if (severity) { query += " AND severity = ?"; params.push(severity); }
    if (status) { query += " AND status = ?"; params.push(status); }
    query += " ORDER BY created_at DESC";
    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows.map(mapBug) });
  } catch (error) {
    console.error("[BUGS] list failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get(["/admin/bugs/:id", "/bugs/:id"], authRequired, adminRequired, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM bugs WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: "Bug not found" });
    res.json({ success: true, data: mapBug(rows[0]) });
  } catch (error) {
    console.error("[BUGS] detail failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/bugs", async (req, res) => {
  try {
    const { project, severity, title, steps, expected = "", actual = "", reporter } = req.body || {};
    if (!project || !severity || !title || !steps || !reporter) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const [countRows] = await db.execute("SELECT COUNT(*) AS count FROM bugs");
    const bugNumber = String((countRows[0]?.count || 0) + 1).padStart(3, "0");
    const bugId = `BUG-${bugNumber}`;

    const [result] = await db.execute(
      `INSERT INTO bugs (bug_id, project, severity, title, steps, expected, actual, reporter, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [bugId, project, severity, title, steps, expected, actual, reporter, "Pending"]
    );

    res.json({ success: true, data: { id: result.insertId, bug_id: bugId } });
  } catch (error) {
    console.error("[BUGS] create failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put(["/admin/bugs/:id", "/bugs/:id"], authRequired, adminRequired, async (req, res) => {
  try {
    const { severity, status, handler, solution } = req.body || {};
    const updates = [];
    const params = [];
    if (severity) { updates.push("severity = ?"); params.push(severity); }
    if (status) { updates.push("status = ?"); params.push(status); }
    if (typeof handler === "string") { updates.push("handler = ?"); params.push(handler); }
    if (typeof solution === "string") { updates.push("solution = ?"); params.push(solution); }
    if (!updates.length) return res.json({ success: true, message: "No changes" });
    updates.push("updated_at = NOW()");
    params.push(req.params.id);
    await db.execute(`UPDATE bugs SET ${updates.join(", ")} WHERE id = ?`, params);
    res.json({ success: true });
  } catch (error) {
    console.error("[BUGS] update failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete(["/admin/bugs/:id", "/bugs/:id"], authRequired, adminRequired, async (req, res) => {
  try {
    await db.execute("DELETE FROM bugs WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error("[BUGS] delete failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
