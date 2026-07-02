const asyncHandler = require('express-async-handler');
const { getRecommendationsForUser, getTrendingEvents } = require('../utils/recommendationEngine');

// @desc    Get personalized event recommendations for the logged-in user
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const recommendations = await getRecommendationsForUser(req.user, limit);

  // Fall back to trending events if personalization has nothing to show
  // (e.g. brand-new account with no interests or booking history yet)
  if (recommendations.length === 0) {
    const trending = await getTrendingEvents(limit);
    return res.json({
      success: true,
      recommendations: trending.map((event) => ({ event, score: null, reasons: null })),
      fallback: 'trending',
    });
  }

  res.json({ success: true, recommendations, fallback: null });
});

// @desc    Get globally trending events (no auth required)
// @route   GET /api/recommendations/trending
// @access  Public
const getTrending = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 10;
  const events = await getTrendingEvents(limit);
  res.json({ success: true, events });
});

module.exports = { getRecommendations, getTrending };
