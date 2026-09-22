const pool = require("../config/db");

const createTeam = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const userId = req.user.id;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const teamResult = await client.query(
        `INSERT INTO teams (name, created_by)
         VALUES ($1, $2)
         RETURNING id, name, created_by, created_at`,
        [name, userId]
      );

      const team = teamResult.rows[0];

      await client.query(
        `INSERT INTO team_members (team_id, user_id, role)
         VALUES ($1, $2, 'owner')
         ON CONFLICT (team_id, user_id) DO NOTHING`,
        [team.id, userId]
      );

      await client.query("COMMIT");

      res.status(201).json({
        message: "Team created successfully",
        team,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({ message: "Failed to create team" });
  }
};

const getMyTeams = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.name, t.created_by, t.created_at, tm.role
       FROM teams t
       INNER JOIN team_members tm ON tm.team_id = t.id
       WHERE tm.user_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.json({ teams: result.rows });
  } catch (error) {
    console.error("Get teams error:", error);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
};

const getTeamMembers = async (req, res) => {
  try {
    const teamId = Number(req.params.teamId);
    const userId = req.user.id;

    const membership = await pool.query(
      `SELECT role FROM team_members
       WHERE team_id = $1 AND user_id = $2`,
      [teamId, userId]
    );

    if (!membership.rows.length) {
      return res.status(403).json({
        message: "You are not a member of this team",
      });
    }

    const result = await pool.query(
      `SELECT tm.id, tm.user_id, tm.role, tm.joined_at,
              u.name, u.email
       FROM team_members tm
       LEFT JOIN users u ON u.id = tm.user_id
       WHERE tm.team_id = $1
       ORDER BY tm.joined_at ASC`,
      [teamId]
    );

    res.json({ members: result.rows });
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({ message: "Failed to fetch team members" });
  }
};

module.exports = {
  createTeam,
  getMyTeams,
  getTeamMembers,
};
