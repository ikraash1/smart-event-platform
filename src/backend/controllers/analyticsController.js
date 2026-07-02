const asyncHandler = require('express-async-handler');
const analyticsEngine = require('../utils/analyticsEngine');

// @desc    Get admin platform-wide analytics overview
// @route   GET /api/analytics/admin/overview
// @access  Private/Admin
const getAdminOverview = asyncHandler(async (req, res) => {
  const overview = await analyticsEngine.getPlatformOverview();
  res.json({ success: true, overview });
});

// @desc    Get organizer-scoped analytics overview
// @route   GET /api/analytics/organizer/overview
// @access  Private/Organizer,Admin
const getOrganizerOverview = asyncHandler(async (req, res) => {
  const organizerId = req.user.role === 'admin' && req.query.organizerId ? req.query.organizerId : req.user._id;
  const overview = await analyticsEngine.getOrganizerOverview(organizerId);
  res.json({ success: true, overview });
});

// @desc    Get most popular events (optionally scoped to organizer)
// @route   GET /api/analytics/popular-events
// @access  Private/Organizer,Admin
const getPopularEvents = asyncHandler(async (req, res) => {
  const organizerId = req.user.role === 'admin' ? req.query.organizerId || null : req.user._id;
  const limit = Number(req.query.limit) || 5;
  const events = await analyticsEngine.getPopularEvents(limit, organizerId);
  res.json({ success: true, events });
});

// @desc    Get booking counts grouped by category
// @route   GET /api/analytics/bookings-by-category
// @access  Private/Organizer,Admin
const getBookingsByCategory = asyncHandler(async (req, res) => {
  const organizerId = req.user.role === 'admin' ? req.query.organizerId || null : req.user._id;
  const data = await analyticsEngine.getBookingsByCategory(organizerId);
  res.json({ success: true, data });
});

// @desc    Get daily attendance trend
// @route   GET /api/analytics/attendance-trend
// @access  Private/Organizer,Admin
const getAttendanceTrend = asyncHandler(async (req, res) => {
  const organizerId = req.user.role === 'admin' ? req.query.organizerId || null : req.user._id;
  const days = Number(req.query.days) || 14;
  const data = await analyticsEngine.getAttendanceTrend(days, organizerId);
  res.json({ success: true, data });
});

// @desc    Get daily booking/revenue trend
// @route   GET /api/analytics/booking-trend
// @access  Private/Organizer,Admin
const getBookingTrend = asyncHandler(async (req, res) => {
  const organizerId = req.user.role === 'admin' ? req.query.organizerId || null : req.user._id;
  const days = Number(req.query.days) || 14;
  const data = await analyticsEngine.getBookingTrend(days, organizerId);
  res.json({ success: true, data });
});

// @desc    Get top engaged users (admin only)
// @route   GET /api/analytics/user-engagement
// @access  Private/Admin
const getUserEngagement = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const data = await analyticsEngine.getUserEngagementScores(limit);
  res.json({ success: true, data });
});

module.exports = {
  getAdminOverview,
  getOrganizerOverview,
  getPopularEvents,
  getBookingsByCategory,
  getAttendanceTrend,
  getBookingTrend,
  getUserEngagement,
};
