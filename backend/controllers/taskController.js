const { pool } = require("../db");

// GET all tasks
const getTasks = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        title,
        description,
        status,
        priority,
        due_date,
        created_at,
        updated_at
      FROM tasks
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.json({
      success: true,
      tasks: result.rows,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

// GET single task
const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        description,
        status,
        priority,
        due_date,
        created_at,
        updated_at
      FROM tasks
      WHERE id = $1 AND user_id = $2
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Get task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch task",
    });
  }
};

// CREATE task
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      due_date,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO tasks
        (user_id, title, description, status, priority, due_date)
      VALUES
        ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        title,
        description,
        status,
        priority,
        due_date,
        created_at,
        updated_at
      `,
      [
        req.user.id,
        title.trim(),
        description || "",
        status || "pending",
        priority || "medium",
        due_date || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};

// UPDATE task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      status,
      priority,
      due_date,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE tasks
      SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        priority = COALESCE($4, priority),
        due_date = COALESCE($5, due_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND user_id = $7
      RETURNING
        id,
        title,
        description,
        status,
        priority,
        due_date,
        created_at,
        updated_at
      `,
      [
        title,
        description,
        status,
        priority,
        due_date,
        id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      task: result.rows[0],
    });
  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};

// DELETE task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM tasks
      WHERE id = $1 AND user_id = $2
      RETURNING id
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete task",
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};