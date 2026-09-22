const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const teamRoutes = require("./routes/teamRoutes");
const invitationRoutes = require("./routes/invitationRoutes");

const app = express();
const PORT = Number(process.env.PORT || 5004);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      created_by INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS team_members (
      id SERIAL PRIMARY KEY,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL,
      role VARCHAR(20) DEFAULT 'member',
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(team_id, user_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS invitations (
      id SERIAL PRIMARY KEY,
      team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      invited_by INTEGER NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ service: "team-service", status: "healthy", database: "connected" });
  } catch (error) {
    res.status(503).json({ service: "team-service", status: "unhealthy", database: "disconnected", message: error.message });
  }
});

app.use("/api/teams", teamRoutes);
app.use("/api/invitations", invitationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled Team Service error:", error);
  res.status(500).json({ message: "Internal server error" });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`TaskFlow Team Service running on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Team database initialization failed:", error);
    process.exit(1);
  });
