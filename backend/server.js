const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || "taskflow_super_secret_key_change_this_later";

const pool = new Pool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "taskflow",
  user: process.env.DB_USER || "taskflow",
  password: process.env.DB_PASSWORD || "taskflow_password",
});

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  created_at: user.created_at,
});

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

const auth = (req, res, next) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token required",
    });
  }

  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT,
      password TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      priority VARCHAR(20) DEFAULT 'medium',
      status VARCHAR(30) DEFAULT 'pending',
      due_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id INTEGER`);
  await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS title VARCHAR(255)`);
  await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''`);
  await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium'`);
  await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'pending'`);
  await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE`);
  await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
  await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)`);
}

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      success: true,
      service: "api-gateway",
      status: "healthy",
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      service: "api-gateway",
      status: "unhealthy",
      database: "disconnected",
      message: error.message,
    });
  }
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = $1",
      [email]
    );

    if (existing.rows.length) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, password)
       VALUES ($1, $2, $3, $3)
       RETURNING id, name, email, created_at`,
      [name, email, hash]
    );

    const user = result.rows[0];

    res.status(201).json({
      message: "Account created successfully",
      user: publicUser(user),
      token: signToken(user),
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Unable to create account" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, password, created_at
       FROM users
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    let valid = false;

    if (user.password_hash) {
      valid = await bcrypt.compare(password, user.password_hash);
    } else if (user.password) {
      valid = user.password.startsWith("$2")
        ? await bcrypt.compare(password, user.password)
        : password === user.password;
    }

    if (!valid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: publicUser(user),
      token: signToken(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Unable to login" });
  }
});

app.get("/api/auth/profile", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: publicUser(result.rows[0]) });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Unable to load profile" });
  }
});

app.get("/api/tasks", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, priority, status, due_date, created_at, updated_at
       FROM tasks
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ tasks: result.rows });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Unable to load tasks" });
  }
});

app.post("/api/tasks", auth, async (req, res) => {
  try {
    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim();
    const priority = String(req.body.priority || "medium").toLowerCase();
    const status = String(req.body.status || "pending").toLowerCase();
    const dueDate = req.body.due_date || null;

    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, priority, status, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, title, description, priority, status, dueDate]
    );

    res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Unable to create task" });
  }
});

app.put("/api/tasks/:id", auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim();
    const priority = String(req.body.priority || "medium").toLowerCase();
    const status = String(req.body.status || "pending").toLowerCase();
    const dueDate = req.body.due_date || null;

    if (!Number.isInteger(id) || !title) {
      return res.status(400).json({ message: "Valid task id and title are required" });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           priority = $3,
           status = $4,
           due_date = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title, description, priority, status, dueDate, id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ task: result.rows[0] });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ message: "Unable to update task" });
  }
});

app.delete("/api/tasks/:id", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM tasks
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [Number(req.params.id), req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ message: "Unable to delete task" });
  }
});

app.put("/api/users/profile", auth, async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const duplicate = await pool.query(
      `SELECT id FROM users WHERE LOWER(email) = $1 AND id <> $2`,
      [email, req.user.id]
    );

    if (duplicate.rows.length) {
      return res.status(409).json({ message: "That email is already in use" });
    }

    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, name, email, created_at`,
      [name, email, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    res.json({
      message: "Profile updated successfully",
      user: publicUser(user),
      token: signToken(user),
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Unable to update profile" });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, _req, res, _next) => {
  console.error("Unhandled server error:", error);
  res.status(500).json({ message: "Internal server error" });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`TaskFlow backend running on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});
