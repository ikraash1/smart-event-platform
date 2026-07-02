const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Verifies the JWT sent in the Authorization header (Bearer token) and
 * attaches the authenticated user document to req.user. Rejects the
 * request with 401 if the token is missing, invalid, expired, or the
 * referenced user no longer exists / has been deactivated.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user no longer exists');
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error('Account has been deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed or expired');
  }
});

module.exports = { protect };
