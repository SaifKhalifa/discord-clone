const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Session = require("../models/Session");
const PendingLogin = require("../models/PendingLogin");
const { generateRandomToken, hashToken } = require("../utils/token");

const PENDING_LOGIN_TTL_MINUTES = 7;

const generateToken = (user, sessionId) =>
  jwt.sign(
    { id: user._id, username: user.username, email: user.email, sid: sessionId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const getClientMeta = (req) => ({
  ipAddress: req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "",
  userAgent: req.get("user-agent") || ""
});

const buildSessionSummary = (session) => ({
  id: session._id.toString(),
  ipAddress: session.ipAddress,
  userAgent: session.userAgent,
  createdAt: session.createdAt,
  lastSeenAt: session.lastSeenAt
});

const isAllowedOrigin = (req) => {
  const origin = req.get("origin");
  if (!origin) {
    return true;
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  return origin === clientUrl;
};

const createSession = async (user, req, expectedActiveSessionHash = null) => {
  const sessionId = generateRandomToken(24);
  const sessionIdHash = hashToken(sessionId);
  const { ipAddress, userAgent } = getClientMeta(req);
  const now = new Date();

  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id, activeSessionId: expectedActiveSessionHash },
    { $set: { activeSessionId: sessionIdHash, lastLoginAt: now } },
    { new: true }
  );

  if (!updatedUser) {
    return { conflict: true };
  }

  try {
    await Session.create({
      user: user._id,
      sessionIdHash,
      ipAddress,
      userAgent,
      lastSeenAt: now
    });
  } catch (err) {
    await User.updateOne(
      { _id: user._id, activeSessionId: sessionIdHash },
      { $set: { activeSessionId: expectedActiveSessionHash } }
    );
    throw err;
  }

  return { sessionId, sessionIdHash, user: updatedUser };
};

const createPendingLogin = async (user, req, existingSessionHash) => {
  const pendingLoginToken = generateRandomToken(32);
  const csrfToken = generateRandomToken(24);
  const expiresAt = new Date(
    Date.now() + PENDING_LOGIN_TTL_MINUTES * 60 * 1000
  );
  const { ipAddress, userAgent } = getClientMeta(req);

  await PendingLogin.create({
    user: user._id,
    tokenHash: hashToken(pendingLoginToken),
    csrfTokenHash: hashToken(csrfToken),
    existingSessionHash,
    ipAddress,
    userAgent,
    expiresAt
  });

  return { pendingLoginToken, csrfToken, expiresAt };
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
        message:
          "Your session was signed out because a new login was confirmed.",
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

  const result = await createSession(user, req, null);
  if (result.conflict) {
    return res.status(409).json({ message: "Login already active." });
  }
  const token = generateToken(user, result.sessionId);

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
    const existingSession = await Session.findOne({
      user: user._id,
      sessionIdHash: user.activeSessionId
    }).select("ipAddress userAgent createdAt lastSeenAt");

    if (existingSession) {
      await PendingLogin.deleteMany({ user: user._id, consumedAt: null });
      const pending = await createPendingLogin(user, req, user.activeSessionId);
      return res.status(409).json({
        code: "SESSION_CONFLICT",
        message:
          "You are already signed in on another device or browser.",
        pendingLoginToken: pending.pendingLoginToken,
        csrfToken: pending.csrfToken,
        expiresAt: pending.expiresAt,
        existingSession: buildSessionSummary(existingSession)
      });
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { activeSessionId: null } }
    );
  }

  await PendingLogin.deleteMany({ user: user._id });

  const sessionResult = await createSession(user, req, null);
  if (sessionResult.conflict) {
    const latestUser = await User.findById(user._id).select("activeSessionId");
    const activeSessionHash = latestUser?.activeSessionId;
    if (activeSessionHash) {
      const existingSession = await Session.findOne({
        user: user._id,
        sessionIdHash: activeSessionHash
      }).select("ipAddress userAgent createdAt lastSeenAt");

      if (existingSession) {
        await PendingLogin.deleteMany({ user: user._id, consumedAt: null });
        const pending = await createPendingLogin(user, req, activeSessionHash);
        return res.status(409).json({
          code: "SESSION_CONFLICT",
          message:
            "You are already signed in on another device or browser.",
          pendingLoginToken: pending.pendingLoginToken,
          csrfToken: pending.csrfToken,
          expiresAt: pending.expiresAt,
          existingSession: buildSessionSummary(existingSession)
        });
      }
    }

    return res.status(409).json({
      message: "Login already active. Please try again."
    });
  }

  const token = generateToken(sessionResult.user, sessionResult.sessionId);
  await Session.deleteMany({
    user: user._id,
    sessionIdHash: { $ne: sessionResult.sessionIdHash }
  });
  await disconnectStaleSockets(
    req,
    user._id.toString(),
    sessionResult.sessionId
  );

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
    sessionIdHash: req.user.sessionIdHash
  }).select("ipAddress userAgent createdAt lastSeenAt");

  if (!session) {
    return res.status(404).json({ message: "Session not found." });
  }

  return res.json(buildSessionSummary(session));
};

const logout = async (req, res) => {
  const { id, sessionIdHash } = req.user;

  await Session.deleteOne({ user: id, sessionIdHash });
  await User.updateOne(
    { _id: id, activeSessionId: sessionIdHash },
    { $set: { activeSessionId: null } }
  );

  const io = req.app.get("io");
  if (io) {
    const sockets = await io.in(`user:${id}`).fetchSockets();
    for (const socket of sockets) {
      if (socket.data.sessionId === req.user.sessionId) {
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

const confirmLogin = async (req, res) => {
  const { pendingLoginToken, csrfToken, decision } = req.body;
  if (!pendingLoginToken || !csrfToken || !decision) {
    return res.status(400).json({ message: "Missing confirmation details." });
  }

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ message: "Invalid request origin." });
  }

  const now = new Date();
  const pending = await PendingLogin.findOne({
    tokenHash: hashToken(pendingLoginToken),
    consumedAt: null,
    expiresAt: { $gt: now }
  });

  if (!pending) {
    return res.status(410).json({
      message:
        "This login confirmation has expired. Please login again."
    });
  }

  if (pending.csrfTokenHash !== hashToken(csrfToken)) {
    return res.status(403).json({ message: "Invalid confirmation token." });
  }

  const consumed = await PendingLogin.findOneAndUpdate(
    {
      tokenHash: pending.tokenHash,
      csrfTokenHash: pending.csrfTokenHash,
      consumedAt: null,
      expiresAt: { $gt: now }
    },
    { $set: { consumedAt: now } },
    { new: true }
  );

  if (!consumed) {
    return res.status(410).json({
      message:
        "This login confirmation has expired. Please login again."
    });
  }

  if (decision === "keep") {
    return res.json({
      status: "cancelled",
      message: "Login cancelled. Your existing session is still active."
    });
  }

  if (decision !== "continue") {
    return res.status(400).json({ message: "Invalid confirmation choice." });
  }

  const user = await User.findById(pending.user);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const sessionId = generateRandomToken(24);
  const sessionIdHash = hashToken(sessionId);
  const { ipAddress, userAgent } = getClientMeta(req);

  const updatedUser = await User.findOneAndUpdate(
    { _id: user._id, activeSessionId: pending.existingSessionHash },
    { $set: { activeSessionId: sessionIdHash, lastLoginAt: now } },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(409).json({
      message: "Session state changed. Please login again."
    });
  }

  try {
    await Session.create({
      user: user._id,
      sessionIdHash,
      ipAddress,
      userAgent,
      lastSeenAt: now
    });
  } catch (err) {
    await User.updateOne(
      { _id: user._id, activeSessionId: sessionIdHash },
      { $set: { activeSessionId: pending.existingSessionHash } }
    );
    throw err;
  }

  await Session.deleteMany({
    user: user._id,
    sessionIdHash: { $ne: sessionIdHash }
  });
  await disconnectStaleSockets(req, user._id.toString(), sessionId);

  const token = generateToken(updatedUser, sessionId);
  return res.json({
    token,
    user: { id: user._id, username: user.username, email: user.email }
  });
};

const listSessions = async (req, res) => {
  const sessions = await Session.find({ user: req.user.id })
    .sort({ lastSeenAt: -1 })
    .select("sessionIdHash ipAddress userAgent createdAt lastSeenAt");

  const data = sessions.map((session) => ({
    id: session._id.toString(),
    ipAddress: session.ipAddress,
    userAgent: session.userAgent,
    createdAt: session.createdAt,
    lastSeenAt: session.lastSeenAt,
    isCurrent: session.sessionIdHash === req.user.sessionIdHash
  }));

  return res.json({ sessions: data });
};

const revokeSession = async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ message: "Session id is required." });
  }

  const session = await Session.findOne({
    _id: sessionId,
    user: req.user.id
  }).select("sessionIdHash");

  if (!session) {
    return res.status(404).json({ message: "Session not found." });
  }

  if (session.sessionIdHash === req.user.sessionIdHash) {
    return res
      .status(400)
      .json({ message: "Cannot revoke the current session." });
  }

  await Session.deleteOne({ _id: sessionId, user: req.user.id });

  return res.json({ message: "Session revoked." });
};

module.exports = {
  register,
  login,
  confirmLogin,
  listSessions,
  revokeSession,
  me,
  getSession,
  logout
};
