const express = require("express");
const {
  getMessages,
  createMessage
} = require("../controllers/messageController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/:channelId", getMessages);
router.post("/", createMessage);

module.exports = router;
