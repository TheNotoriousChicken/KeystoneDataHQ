const jwt = require('jsonwebtoken');

// Generate a signed refresh token. Uses a separate secret if provided, otherwise falls back to JWT_SECRET.
function generateRefreshToken(payload) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  const expiresIn = '14d';
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyRefreshToken(token) {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
}

module.exports = { generateRefreshToken, verifyRefreshToken };
