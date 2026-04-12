const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "zero-dev-secret-change-me";
const TOKEN_EXPIRES = "7d";

function authRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const token = auth.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin permission required." });
  }
  next();
}

module.exports = { authRequired, adminRequired, JWT_SECRET, TOKEN_EXPIRES };
