const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "taskflow",
  user: process.env.DB_USER || "taskflow",
  password: process.env.DB_PASSWORD || "taskflow_password",
});

pool.on("error", (error) => {
  console.error("❌ Team Service PostgreSQL error:", error);
});

module.exports = pool;
