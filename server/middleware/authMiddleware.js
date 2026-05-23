const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Session = require("../models/Session");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "username email activeSessionId"
    );

    if (!user || user.activeSessionId !== decoded.sid) {
      return res.status(401).json({ message: "Session expired. Please login." });
    }

    const session = await Session.findOne({
      user: user._id,
      sessionId: decoded.sid
    }).select("sessionId");

    if (!session) {
      return res.status(401).json({ message: "Session expired. Please login." });
    }

    await Session.updateOne(
      { user: user._id, sessionId: decoded.sid },
      { $set: { lastSeenAt: new Date() } }
    );

    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      sessionId: decoded.sid
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
