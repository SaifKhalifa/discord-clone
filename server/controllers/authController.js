const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Session = require("../models/Session");

const generateToken = (user, sessionId) =>
  jwt.sign(
    { id: user._id, username: user.username, email: user.email, sid: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const createSession = async (user, req) => {
  const sessionId = crypto.randomBytes(24).toString("hex");
  const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "";
  const userAgent = req.get("user-agent") || "";

  await Session.create({
    user: user._id,
    sessionId,
    ipAddress,
    userAgent
  });

  user.activeSessionId = sessionId;
  user.lastLoginAt = new Date();
  await user.save();

  return sessionId;
};

const disconnectStaleSockets = async (req, userId, currentSessionId) => {
  const io = req.app.get("io");
  if (!io) {
    return;
  }

  const sockets = await io.in(`user:${userId}`).fetchSockets();
  for (const socket of sockets) {
    if (socket.data.sessionId !== currentSessionId) {
      socket.emit("error_message", {
        message: "Your session was closed because you signed in elsewhere.",
        code: "SESSION_REVOKED"
      });
      socket.disconnect(true);
    }
  }
};

const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username }]
  });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists." });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    username,
    email: email.toLowerCase(),
    password: hashedPassword
  });

  const sessionId = await createSession(user, req);
  const token = generateToken(user, sessionId);

  return res.status(201).json({
    token,
    user: { id: user._id, username: user.username, email: user.email }
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  if (user.activeSessionId) {
    await Session.deleteOne({
      user: user._id,
      sessionId: user.activeSessionId
    });
  }

  const sessionId = await createSession(user, req);
  const token = generateToken(user, sessionId);
  await Session.deleteMany({ user: user._id, sessionId: { $ne: sessionId } });
  await disconnectStaleSockets(req, user._id.toString(), sessionId);

  return res.json({
    token,
    user: { id: user._id, username: user.username, email: user.email }
  });
};

const me = async (req, res) => {
  return res.json({ user: req.user });
};

const getSession = async (req, res) => {
  const session = await Session.findOne({
    user: req.user.id,
    sessionId: req.user.sessionId
  }).select("sessionId ipAddress userAgent createdAt lastSeenAt");

  if (!session) {
    return res.status(404).json({ message: "Session not found." });
  }

  return res.json(session);
};

const logout = async (req, res) => {
  const { id, sessionId } = req.user;

  await Session.deleteOne({ user: id, sessionId });
  await User.updateOne(
    { _id: id, activeSessionId: sessionId },
    { $set: { activeSessionId: null } }
  );

  const io = req.app.get("io");
  if (io) {
    const sockets = await io.in(`user:${id}`).fetchSockets();
    for (const socket of sockets) {
      if (socket.data.sessionId === sessionId) {
        socket.emit("error_message", {
          message: "You have been logged out.",
          code: "SESSION_LOGOUT"
        });
        socket.disconnect(true);
      }
    }
  }

  return res.json({ message: "Logged out." });
};

module.exports = {
  register,
  login,
  me,
  getSession,
  logout
};
