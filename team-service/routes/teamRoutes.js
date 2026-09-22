const express = require("express");
const auth = require("../middleware/auth");
const {
  createTeam,
  getMyTeams,
  getTeamMembers,
} = require("../controllers/teamController");
const { createInvitation } = require("../controllers/invitationController");

const router = express.Router();

router.get("/", auth, getMyTeams);
router.post("/", auth, createTeam);
router.get("/:teamId/members", auth, getTeamMembers);
router.post("/:teamId/invite", auth, createInvitation);

module.exports = router;
