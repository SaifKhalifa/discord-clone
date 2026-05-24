const crypto = require("crypto");

const generateRandomToken = (size = 24) =>
  crypto.randomBytes(size).toString("hex");

const hashToken = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

module.exports = {
  generateRandomToken,
  hashToken
};
