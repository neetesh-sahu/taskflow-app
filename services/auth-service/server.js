const express = require("express");
const cors = require("cors");

require("dotenv").config();

const { pool, initDB } = require("./db");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      service: "auth-service",
      status: "healthy",
      database: "PostgreSQL connected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: "auth-service",
      status: "unhealthy",
      database: "PostgreSQL disconnected",
    });
  }
});

app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Auth Service route not found",
  });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await initDB();

    app.listen(PORT, () => {
      console.log(
        `Auth Service running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Auth Service startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();