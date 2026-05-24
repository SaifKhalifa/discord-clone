const express = require("express");
const {
  getChannels,
  createChannel
} = require("../controllers/channelController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getChannels);
router.post("/", createChannel);

module.exports = router;
