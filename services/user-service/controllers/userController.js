const bcrypt = require("bcryptjs");

const { pool } = require("../db");

/* =========================================================
   GET PROFILE
========================================================= */

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        created_at
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

/* =========================================================
   UPDATE PROFILE
========================================================= */

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update",
      });
    }

    const normalizedEmail = email
      ? email.trim().toLowerCase()
      : null;

    if (normalizedEmail) {
      const existingUser = await pool.query(
        `
        SELECT id
        FROM users
        WHERE email = $1
        AND id != $2
        `,
        [normalizedEmail, req.user.id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    const result = await pool.query(
      `
      UPDATE users
      SET
        name = COALESCE($1, name),
        email = COALESCE($2, email)
      WHERE id = $3
      RETURNING
        id,
        name,
        email,
        created_at
      `,
      [
        name ? name.trim() : null,
        normalizedEmail,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};