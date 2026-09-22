const express = require("express");

const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getTasks);

router.get("/:id", getTask);

router.post("/", createTask);

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);

module.exports = router;