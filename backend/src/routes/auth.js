const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { JWT_SECRET, TOKEN_EXPIRES } = require("../middleware/auth");
const { loginRateLimiter } = require("../rate-limit");

const router = express.Router();

async function loginHandler(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  try {
    const identifier = String(username).trim();
    const [rows] = await pool.query(
      `SELECT id, username, display_name, password_hash, role
       FROM users
       WHERE username = ? OR display_name = ?
       LIMIT 1`,
      [identifier, identifier]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        role: user.role
      }
    });
  } catch (err) {
    console.error("[ZERO-LOGIN] login failed", err);
    return res.status(500).json({ error: "Server error" });
  }
}

router.post("/api/login", loginRateLimiter, loginHandler);
router.post("/login", loginRateLimiter, loginHandler);

module.exports = router;
