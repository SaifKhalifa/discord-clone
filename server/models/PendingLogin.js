const mongoose = require("mongoose");

const pendingLoginSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  csrfTokenHash: {
    type: String,
    required: true
  },
  existingSessionHash: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: ""
  },
  userAgent: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0
  },
  consumedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("PendingLogin", pendingLoginSchema);
