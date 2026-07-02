const jwt = require('jsonwebtoken');

/**
 * Signs a JWT embedding the user's id and role. The role is included so
 * client-side UI can branch without an extra round trip, though the
 * server middleware always re-checks the role from the database.
 */
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
