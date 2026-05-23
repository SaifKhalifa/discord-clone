const Message = require("../models/Message");

const getMessages = async (req, res) => {
  const { channelId } = req.params;

  const messages = await Message.find({ channel: channelId })
    .populate("sender", "username email")
    .sort({ createdAt: 1 });

  return res.json(messages);
};

const createMessage = async (req, res) => {
  const { content, channelId } = req.body;

  if (!content || !channelId) {
    return res.status(400).json({ message: "Content and channel required." });
  }

  const message = await Message.create({
    content,
    channel: channelId,
    sender: req.user.id
  });

  const populated = await message.populate("sender", "username");

  return res.status(201).json(populated);
};

module.exports = {
  getMessages,
  createMessage
};
