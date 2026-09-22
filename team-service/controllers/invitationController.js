const crypto = require("crypto");
const pool = require("../config/db");

const createInvitation = async (req, res) => {
  try {
    const teamId = Number(req.params.teamId);
    const email = String(req.body.email || "").trim().toLowerCase();
    const userId = req.user.id;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const membership = await pool.query(
      `SELECT role FROM team_members
       WHERE team_id = $1 AND user_id = $2`,
      [teamId, userId]
    );

    if (!membership.rows.length) {
      return res.status(403).json({ message: "You are not a member of this team" });
    }

    if (membership.rows[0].role !== "owner") {
      return res.status(403).json({ message: "Only the team owner can send invitations" });
    }

    const teamResult = await pool.query(
      "SELECT id, name FROM teams WHERE id = $1",
      [teamId]
    );

    if (!teamResult.rows.length) {
      return res.status(404).json({ message: "Team not found" });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = $1",
      [email]
    );

    if (existingUser.rows.length) {
      const member = await pool.query(
        `SELECT id FROM team_members
         WHERE team_id = $1 AND user_id = $2`,
        [teamId, existingUser.rows[0].id]
      );

      if (member.rows.length) {
        return res.status(409).json({ message: "User is already a team member" });
      }
    }

    const pending = await pool.query(
      `SELECT id FROM invitations
       WHERE team_id = $1
         AND LOWER(email) = $2
         AND status = 'pending'
         AND expires_at > NOW()`,
      [teamId, email]
    );

    if (pending.rows.length) {
      return res.status(409).json({ message: "An invitation is already pending for this email" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const result = await pool.query(
      `INSERT INTO invitations
       (team_id, email, invited_by, token, status, expires_at)
       VALUES ($1, $2, $3, $4, 'pending', $5)
       RETURNING id, team_id, email, token, status, expires_at, created_at`,
      [teamId, email, userId, token, expiresAt]
    );

    res.status(201).json({
      message: "Invitation created successfully",
      team: teamResult.rows[0],
      invitation: result.rows[0],
      inviteUrl: `http://127.0.0.1:5173/invite/${token}`,
    });
  } catch (error) {
    console.error("Create invitation error:", error);
    res.status(500).json({ message: "Failed to create invitation" });
  }
};

const getInvitation = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.id, i.email, i.status, i.expires_at,
              t.id AS team_id, t.name AS team_name
       FROM invitations i
       INNER JOIN teams t ON t.id = i.team_id
       WHERE i.token = $1`,
      [req.params.token]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    const invitation = result.rows[0];

    if (invitation.status !== "pending") {
      return res.status(400).json({ message: `Invitation is already ${invitation.status}` });
    }

    if (new Date(invitation.expires_at) < new Date()) {
      await pool.query("UPDATE invitations SET status = 'expired' WHERE id = $1", [invitation.id]);
      return res.status(400).json({ message: "Invitation has expired" });
    }

    res.json({ invitation });
  } catch (error) {
    console.error("Get invitation error:", error);
    res.status(500).json({ message: "Failed to get invitation" });
  }
};

const acceptInvitation = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const invitationResult = await client.query(
      "SELECT * FROM invitations WHERE token = $1 FOR UPDATE",
      [req.params.token]
    );

    if (!invitationResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Invitation not found" });
    }

    const invitation = invitationResult.rows[0];

    if (invitation.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: `Invitation is already ${invitation.status}` });
    }

    if (new Date(invitation.expires_at) < new Date()) {
      await client.query("UPDATE invitations SET status = 'expired' WHERE id = $1", [invitation.id]);
      await client.query("COMMIT");
      return res.status(400).json({ message: "Invitation has expired" });
    }

    const userResult = await client.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [req.user.id]
    );

    if (!userResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "This invitation was sent to a different email address" });
    }

    await client.query(
      `INSERT INTO team_members (team_id, user_id, role)
       VALUES ($1, $2, 'member')
       ON CONFLICT (team_id, user_id) DO NOTHING`,
      [invitation.team_id, req.user.id]
    );

    await client.query(
      "UPDATE invitations SET status = 'accepted' WHERE id = $1",
      [invitation.id]
    );

    await client.query("COMMIT");

    res.json({
      message: "Invitation accepted successfully",
      teamId: invitation.team_id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Accept invitation error:", error);
    res.status(500).json({ message: "Failed to accept invitation" });
  } finally {
    client.release();
  }
};

module.exports = {
  createInvitation,
  getInvitation,
  acceptInvitation,
};
