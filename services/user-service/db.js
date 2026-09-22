const { Pool } = require("pg");

require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const initDB = async () => {
  try {
    await pool.query("SELECT 1");

    console.log("User Service: PostgreSQL connected");
  } catch (error) {
    console.error(
      "User Service DB error:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  pool,
  initDB,
};