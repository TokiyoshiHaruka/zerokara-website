const bcrypt = require("bcryptjs");

const pool = require("./db");
const { ensureSchema } = require("./schema");

const adminUser = {
  username: process.env.ZERO_ADMIN_USERNAME || "admin",
  displayName: process.env.ZERO_ADMIN_DISPLAY_NAME || "ZERO Admin",
  role: "admin",
  password: process.env.ZERO_ADMIN_PASSWORD
};

async function seedAdmin() {
  if (!adminUser.password) {
    throw new Error("ZERO_ADMIN_PASSWORD is required when seeding the first admin user.");
  }

  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [adminUser.username]
    );

    if (rows.length > 0) {
      console.log(`[INIT-DB] admin user already exists: ${adminUser.username}`);
      return;
    }

    const hash = await bcrypt.hash(adminUser.password, 10);
    await conn.query(
      `INSERT INTO users (username, display_name, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [adminUser.username, adminUser.displayName, hash, adminUser.role]
    );

    console.log(`[INIT-DB] admin user created: ${adminUser.username}`);
  } finally {
    conn.release();
  }
}

async function init() {
  await ensureSchema();
  await seedAdmin();
}

init()
  .then(() => {
    console.log("[INIT-DB] schema ready.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[INIT-DB] failed.", error);
    process.exit(1);
  });
