const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const setupSocket = require("./socket/socketHandler");
const Channel = require("./models/Channel");
const { app, clientUrl } = require("./app");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);

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
