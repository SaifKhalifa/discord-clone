const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const User = require("../models/User");
const Session = require("../models/Session");
const { hashToken } = require("../utils/token");

const authenticateSocket = async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("auth_missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "username activeSessionId"
    );
    const sessionIdHash = hashToken(decoded.sid);

    if (!user || user.activeSessionId !== sessionIdHash) {
      return next(new Error("auth_invalid_session"));
    }

    const session = await Session.findOne({
      user: user._id,
      sessionIdHash
    }).select("sessionIdHash");

    if (!session) {
      return next(new Error("auth_invalid_session"));
    }

    socket.user = { id: user._id.toString(), username: user.username };
    socket.data.sessionId = decoded.sid;
    return next();
  } catch (err) {
    return next(new Error("auth_invalid"));
  }
};

const setupSocket = (io) => {
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user.id}`);

    socket.on("join_channel", ({ channelId }) => {
      if (!channelId) {
        return;
      }

      if (socket.data.channelId) {
        socket.leave(socket.data.channelId);
        socket.to(socket.data.channelId).emit("user_left", {
          user: socket.user,
          channelId: socket.data.channelId
        });
      }

      socket.join(channelId);
      socket.data.channelId = channelId;
      socket.to(channelId).emit("user_joined", {
        user: socket.user,
        channelId
      });
    });

    socket.on("leave_channel", ({ channelId }) => {
      const target = channelId || socket.data.channelId;
      if (!target) {
        return;
      }

      socket.leave(target);
      socket.to(target).emit("user_left", { user: socket.user, channelId: target });

      if (socket.data.channelId === target) {
        socket.data.channelId = null;
      }
    });

    socket.on("send_message", async ({ channelId, content }) => {
      const trimmed = content?.trim();
      if (!channelId || !trimmed) {
        socket.emit("error_message", {
          message: "Message content and channel are required."
        });
        return;
      }

      try {
        const message = await Message.create({
          content: trimmed,
          sender: socket.user.id,
          channel: channelId
        });
        const populated = await message.populate("sender", "username");
        io.to(channelId).emit("receive_message", populated);
      } catch (err) {
        socket.emit("error_message", { message: "Failed to send message." });
      }
    });

    socket.on("disconnect", () => {
      if (socket.data.channelId) {
        socket.to(socket.data.channelId).emit("user_left", {
          user: socket.user,
          channelId: socket.data.channelId
        });
      }
    });
  });
};

module.exports = setupSocket;
