const express = require("express");
const bcrypt = require("bcryptjs");

const pool = require("../db");
const { authRequired, adminRequired } = require("../middleware/auth");

const router = express.Router();

function mapUser(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name || "",
    role: row.role || "member",
    createdAt: row.created_at
  };
}

async function listUsers() {
  const [rows] = await pool.query(
    "SELECT id, username, display_name, role, created_at FROM users ORDER BY id ASC"
  );
  return rows.map(mapUser);
}

router.get(["/api/admin/users", "/admin/users", "/admin-users"], authRequired, adminRequired, async (req, res) => {
  try {
    res.json({ items: await listUsers() });
  } catch (error) {
    console.error("[ADMIN-USERS] list error:", error);
    res.status(500).json({ error: "Failed to load users." });
  }
});

router.post(["/api/admin/users", "/admin/users", "/admin-users"], authRequired, adminRequired, async (req, res) => {
  try {
    const username = String(req.body?.username || "").trim();
    const displayName = String(req.body?.displayName || req.body?.display_name || "").trim();
    const role = String(req.body?.role || "member").trim() === "admin" ? "admin" : "member";
    const password = String(req.body?.password || "");

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    if (existing.length) {
      return res.status(409).json({ error: "Username already exists." });
    }

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, display_name, password_hash, role) VALUES (?, ?, ?, ?)",
      [username, displayName || username, hash, role]
    );

    res.status(201).json({ items: await listUsers() });
  } catch (error) {
    console.error("[ADMIN-USERS] create error:", error);
    res.status(500).json({ error: "Failed to create user." });
  }
});

router.put(["/api/admin/users/:id", "/admin/users/:id", "/admin-users/:id"], authRequired, adminRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid user id." });

    const fields = [];
    const values = [];
    const nextUsername = String(req.body?.username || "").trim();
    const nextDisplayName = req.body?.displayName ?? req.body?.display_name;
    const nextRole = req.body?.role;
    const nextPassword = String(req.body?.password || "");

    if (nextUsername) {
      const [duplicate] = await pool.query(
        "SELECT id FROM users WHERE username = ? AND id <> ? LIMIT 1",
        [nextUsername, id]
      );
      if (duplicate.length) {
        return res.status(409).json({ error: "Username already exists." });
      }
      fields.push("username = ?");
      values.push(nextUsername);
    }

    if (typeof nextDisplayName === "string") {
      fields.push("display_name = ?");
      values.push(nextDisplayName.trim());
    }

    if (typeof nextRole === "string") {
      fields.push("role = ?");
      values.push(nextRole === "admin" ? "admin" : "member");
    }

    if (nextPassword.trim()) {
      const hash = await bcrypt.hash(nextPassword, 10);
      fields.push("password_hash = ?");
      values.push(hash);
    }

    if (!fields.length) {
      return res.json({ items: await listUsers() });
    }

    values.push(id);
    await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

    res.json({ items: await listUsers() });
  } catch (error) {
    console.error("[ADMIN-USERS] update error:", error);
    res.status(500).json({ error: "Failed to update user." });
  }
});

router.delete(["/api/admin/users/:id", "/admin/users/:id", "/admin-users/:id"], authRequired, adminRequired, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid user id." });
    if (req.user?.id === id) {
      return res.status(400).json({ error: "You cannot delete the account currently in use." });
    }

    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ items: await listUsers() });
  } catch (error) {
    console.error("[ADMIN-USERS] delete error:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
});

module.exports = router;
