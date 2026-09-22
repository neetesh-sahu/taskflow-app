const express = require("express");
const cors = require("cors");

require("dotenv").config();

const { pool, initDB } = require("./db");

const taskRoutes = require("./routes/taskRoutes");

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
      service: "task-service",
      status: "healthy",
      database: "PostgreSQL connected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      service: "task-service",
      status: "unhealthy",
      database: "PostgreSQL disconnected",
    });
  }
});

/* =========================================================
   TASK ROUTES
========================================================= */

app.use("/api/tasks", taskRoutes);

/* =========================================================
   404
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Task Service route not found",
  });
});

/* =========================================================
   SERVER
========================================================= */

const PORT = process.env.PORT || 5002;

const startServer = async () => {
  try {
    await initDB();

    app.listen(PORT, () => {
      console.log(
        `Task Service running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Task Service startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();