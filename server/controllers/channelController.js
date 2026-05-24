const Channel = require("../models/Channel");

const getChannels = async (req, res) => {
  const channels = await Channel.find().sort({ name: 1 });
  return res.json(channels);
};

const createChannel = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Channel name is required." });
  }

  const existing = await Channel.findOne({ name });
  if (existing) {
    return res.status(400).json({ message: "Channel already exists." });
  }

  const channel = await Channel.create({ name, description });
  return res.status(201).json(channel);
};

module.exports = {
  getChannels,
  createChannel
};
