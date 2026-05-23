require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const channelRoutes = require("./routes/channelRoutes");
const messageRoutes = require("./routes/messageRoutes");
const setupSocket = require("./socket/socketHandler");
const Channel = require("./models/Channel");

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/messages", messageRoutes);

setupSocket(io);

const defaultChannels = [
  { name: "general", description: "General chat" },
  { name: "gaming", description: "Games, streams, and party chat" },
  { name: "study", description: "Study sessions and focus time" },
  { name: "music", description: "Share playlists and tracks" },
  { name: "random", description: "Off-topic and random talk" }
];

const seedDefaultChannels = async () => {
  for (const channel of defaultChannels) {
    const existing = await Channel.findOne({ name: channel.name });
    if (!existing) {
      await Channel.create(channel);
    }
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedDefaultChannels();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();
