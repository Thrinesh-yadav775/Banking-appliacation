const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlacklistedToken = mongoose.model("blacklistedtoken", blacklistedTokenSchema);

async function blacklistToken(token) {
  const decoded = jwt.decode(token);
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + 24 * 60 * 60 * 1000);
  await BlacklistedToken.create({ token, expiresAt });
}

async function isTokenBlacklisted(token) {
  const found = await BlacklistedToken.findOne({ token });
  return !!found;
}

module.exports = { BlacklistedToken, blacklistToken, isTokenBlacklisted };
