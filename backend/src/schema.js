const pool = require("./db");

async function ensureColumn(conn, table, column, definition) {
  const [rows] = await conn.query(
    `SELECT 1
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1`,
    [table, column]
  );
  if (!rows.length) {
    await conn.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

async function ensureSchema() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        display_name VARCHAR(128) NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin','member') NOT NULL DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(128) UNIQUE,
        title_ja VARCHAR(255) NULL,
        title_zh VARCHAR(255) NULL,
        title_en VARCHAR(255) NULL,
        summary_ja TEXT NULL,
        summary_zh TEXT NULL,
        summary_en TEXT NULL,
        body_md_ja MEDIUMTEXT NULL,
        body_md_zh MEDIUMTEXT NULL,
        body_md_en MEDIUMTEXT NULL,
        cover_image VARCHAR(255) NULL,
        status ENUM('draft','published') NOT NULL DEFAULT 'draft',
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS schedule_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_date DATE NOT NULL,
        event_time TIME NULL,
        title VARCHAR(255) NOT NULL,
        detail TEXT NULL,
        category ENUM('meeting','event','other') NOT NULL DEFAULT 'other',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS bugs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bug_id VARCHAR(32) NOT NULL UNIQUE,
        project VARCHAR(128) NOT NULL,
        severity ENUM('P0','P1','P2','P3') NOT NULL DEFAULT 'P3',
        title VARCHAR(255) NOT NULL,
        steps TEXT NOT NULL,
        expected TEXT NULL,
        actual TEXT NULL,
        reporter VARCHAR(128) NOT NULL,
        status ENUM('Pending','Confirmed','Fixing','Fixed','Deferred','Duplicate') NOT NULL DEFAULT 'Pending',
        handler VARCHAR(128) NULL,
        solution TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(64) NOT NULL DEFAULT 'SYSTEM',
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await ensureColumn(conn, "users", "display_name", "VARCHAR(128) NULL AFTER username");
    await ensureColumn(conn, "users", "role", "ENUM('admin','member') NOT NULL DEFAULT 'member' AFTER password_hash");
    await ensureColumn(conn, "users", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

    await ensureColumn(conn, "activities", "slug", "VARCHAR(128) NULL");
    await ensureColumn(conn, "activities", "title_ja", "VARCHAR(255) NULL");
    await ensureColumn(conn, "activities", "title_zh", "VARCHAR(255) NULL");
    await ensureColumn(conn, "activities", "title_en", "VARCHAR(255) NULL");
    await ensureColumn(conn, "activities", "summary_ja", "TEXT NULL");
    await ensureColumn(conn, "activities", "summary_zh", "TEXT NULL");
    await ensureColumn(conn, "activities", "summary_en", "TEXT NULL");
    await ensureColumn(conn, "activities", "body_md_ja", "MEDIUMTEXT NULL");
    await ensureColumn(conn, "activities", "body_md_zh", "MEDIUMTEXT NULL");
    await ensureColumn(conn, "activities", "body_md_en", "MEDIUMTEXT NULL");
    await ensureColumn(conn, "activities", "cover_image", "VARCHAR(255) NULL");
    await ensureColumn(conn, "activities", "status", "ENUM('draft','published') NOT NULL DEFAULT 'draft'");
    await ensureColumn(conn, "activities", "sort_order", "INT NOT NULL DEFAULT 0");
    await ensureColumn(conn, "activities", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    await ensureColumn(conn, "activities", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

    await ensureColumn(conn, "schedule_events", "event_date", "DATE NULL");
    await ensureColumn(conn, "schedule_events", "title", "VARCHAR(255) NULL");
    await ensureColumn(conn, "schedule_events", "event_time", "TIME NULL AFTER event_date");
    await ensureColumn(conn, "schedule_events", "detail", "TEXT NULL AFTER title");
    await ensureColumn(conn, "schedule_events", "category", "ENUM('meeting','event','other') NOT NULL DEFAULT 'other' AFTER detail");
    await ensureColumn(conn, "schedule_events", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    await ensureColumn(conn, "schedule_events", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

    await ensureColumn(conn, "bugs", "bug_id", "VARCHAR(32) NULL");
    await ensureColumn(conn, "bugs", "project", "VARCHAR(128) NULL");
    await ensureColumn(conn, "bugs", "severity", "ENUM('P0','P1','P2','P3') NOT NULL DEFAULT 'P3'");
    await ensureColumn(conn, "bugs", "title", "VARCHAR(255) NULL");
    await ensureColumn(conn, "bugs", "steps", "TEXT NULL");
    await ensureColumn(conn, "bugs", "expected", "TEXT NULL");
    await ensureColumn(conn, "bugs", "actual", "TEXT NULL");
    await ensureColumn(conn, "bugs", "reporter", "VARCHAR(128) NULL");
    await ensureColumn(conn, "bugs", "status", "ENUM('Pending','Confirmed','Fixing','Fixed','Deferred','Duplicate') NOT NULL DEFAULT 'Pending'");
    await ensureColumn(conn, "bugs", "handler", "VARCHAR(128) NULL AFTER status");
    await ensureColumn(conn, "bugs", "solution", "TEXT NULL AFTER handler");
    await ensureColumn(conn, "bugs", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    await ensureColumn(conn, "bugs", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

    await ensureColumn(conn, "system_logs", "type", "VARCHAR(64) NOT NULL DEFAULT 'SYSTEM'");
    await ensureColumn(conn, "system_logs", "message", "TEXT NULL");
    await ensureColumn(conn, "system_logs", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  } finally {
    conn.release();
  }
}

module.exports = { ensureSchema };
