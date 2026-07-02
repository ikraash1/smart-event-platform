const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Update own profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, phone, bio, avatar, interests, password } = req.body;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (interests !== undefined) user.interests = interests;
  if (password) user.password = password; // pre-save hook rehashes it

  const updated = await user.save();
  res.json({ success: true, user: updated });
});

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    users,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc    Update a user's role or active status (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { role, isActive, name } = req.body;
  if (role) user.role = role;
  if (typeof isActive === 'boolean') user.isActive = isActive;
  if (name) user.name = name;

  const updated = await user.save();
  res.json({ success: true, user: updated });
});

// @desc    Delete a user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (String(user._id) === String(req.user._id)) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  await user.deleteOne();
  res.json({ success: true, message: 'User deleted successfully' });
});

module.exports = {
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
};
