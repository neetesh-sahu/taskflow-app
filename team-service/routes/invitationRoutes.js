const express = require("express");
const auth = require("../middleware/auth");
const {
  getInvitation,
  acceptInvitation,
} = require("../controllers/invitationController");

const router = express.Router();

router.get("/:token", getInvitation);
router.post("/:token/accept", auth, acceptInvitation);

module.exports = router;
