const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, interests } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Prevent self-registration as admin; admins must be promoted by an
  // existing admin via the user management endpoint.
  const safeRole = role === 'organizer' ? 'organizer' : 'attendee';

  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
    interests: Array.isArray(interests) ? interests : [],
  });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    token,
    user,
  });
});

// @desc    Authenticate user & return token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated. Contact an administrator.');
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);

  res.json({
    success: true,
    token,
    user,
  });
});

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { registerUser, loginUser, getMe };
