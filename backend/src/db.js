// src/db.js
const mysql = require("mysql2/promise");

const {
  DB_HOST,
  MYSQL_HOST,
  DB_HOST_CANDIDATES = "",
  DB_PORT = process.env.MYSQL_PORT || "3306",
  DB_NAME = process.env.MYSQL_DATABASE || "zero_site",
  DB_USER = process.env.MYSQL_USER || "zero_user",
  DB_PASS = process.env.MYSQL_PASSWORD || "",
} = process.env;

function uniqueHosts(list) {
  return Array.from(new Set(list.filter(Boolean).map((item) => String(item).trim()).filter(Boolean)));
}

const hostCandidates = uniqueHosts([
  DB_HOST,
  MYSQL_HOST,
  ...String(DB_HOST_CANDIDATES || "").split(","),
  "mysqla",
  "zero-db",
  "127.0.0.1",
  "localhost"
]);

const baseConfig = {
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4"
};

const pools = hostCandidates.map((host) => ({
  host,
  pool: mysql.createPool({ ...baseConfig, host })
}));

let activeEntry = null;
let announcedHost = false;

async function getPool() {
  if (activeEntry) return activeEntry.pool;

  let lastError = null;
  for (const entry of pools) {
    try {
      const connection = await entry.pool.getConnection();
      connection.release();
      activeEntry = entry;
      if (!announcedHost) {
        console.log(`[ZERO DB] connected via host: ${entry.host}`);
        announcedHost = true;
      }
      return entry.pool;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to connect to database with configured hosts.");
}

module.exports = {
  async query(...args) {
    const pool = await getPool();
    return pool.query(...args);
  },
  async execute(...args) {
    const pool = await getPool();
    return pool.execute(...args);
  },
  async getConnection() {
    const pool = await getPool();
    return pool.getConnection();
  }
};
