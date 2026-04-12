// src/routes/users.js
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { authRequired, adminRequired } = require("../middleware/auth");

const router = express.Router();

/**
 * 取得所有使用者（管理員專用）
 */
router.get("/api/users", authRequired, adminRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, username, display_name, role, created_at FROM users ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("[USERS] list error:", err);
    res.status(500).json({ error: "伺服器錯誤" });
  }
});

/**
 * 新增使用者（管理員）
 */
router.post("/api/users", authRequired, adminRequired, async (req, res) => {
  const { username, display_name, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "缺少帳號或密碼" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
      INSERT INTO users (username, display_name, password_hash, role)
      VALUES (?, ?, ?, ?)
    `,
      [username, display_name || "", hash, role || "member"]
    );

    res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error("[USERS] create error:", err);
    res.status(500).json({ error: "新增失敗" });
  }
});

/**
 * 更新使用者（允許修改：display_name, password, role）
 */
router.put("/api/users/:id", authRequired, adminRequired, async (req, res) => {
  const { id } = req.params;
  const { display_name, password, role } = req.body;

  try {
    // 先准备 SQL
    const fields = [];
    const values = [];

    if (display_name !== undefined) {
      fields.push("display_name = ?");
      values.push(display_name);
    }

    if (role !== undefined) {
      fields.push("role = ?");
      values.push(role);
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      fields.push("password_hash = ?");
      values.push(hash);
    }

    if (fields.length === 0) {
      return res.json({ ok: true });
    }

    values.push(id);

    await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("[USERS] update error:", err);
    res.status(500).json({ error: "更新失敗" });
  }
});

/**
 * 刪除使用者（管理員）
 */
router.delete(
  "/api/users/:id",
  authRequired,
  adminRequired,
  async (req, res) => {
    const { id } = req.params;

    try {
      await pool.query("DELETE FROM users WHERE id = ?", [id]);
      res.json({ ok: true });
    } catch (err) {
      console.error("[USERS] delete error:", err);
      res.status(500).json({ error: "刪除失敗" });
    }
  }
);

module.exports = router;
