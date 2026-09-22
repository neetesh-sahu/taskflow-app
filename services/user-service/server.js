const express = require("express");
const cors = require("cors");

require("dotenv").config();

const { pool, initDB } = require("./db");

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    res.json({
      success: true,
      service: "user-service",
      status: "healthy",
      database: "PostgreSQL connected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: "user-service",
      status: "unhealthy",
      database: "PostgreSQL disconnected",
    });
  }
});

/* =========================================================
   USER ROUTES
========================================================= */

app.use("/api/users", userRoutes);

/* =========================================================
   404
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "User Service route not found",
  });
});

/* =========================================================
   SERVER
========================================================= */

const PORT = process.env.PORT || 5003;

const startServer = async () => {
  try {
    await initDB();

    app.listen(PORT, () => {
      console.log(
        `User Service running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "User Service startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();