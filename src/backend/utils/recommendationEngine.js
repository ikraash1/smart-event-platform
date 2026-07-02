const Event = require('../models/Event');
const Booking = require('../models/Booking');

/**
 * Recommendation Engine
 * ----------------------
 * A locally computed, explainable scoring system (no paid external AI API
 * required). For each candidate event we combine four weighted signals:
 *
 *   1. Interest match   - overlap between the user's stated interests/tags
 *                          and the event's category + tags
 *   2. History match    - similarity to categories the user has booked
 *                          before (a simple collaborative-style signal)
 *   3. Popularity        - normalized booking + view counts, so trending
 *                          events surface even for new users
 *   4. Recency/fit       - events starting soon are boosted slightly over
 *                          far-future events, and past events are excluded
 *
 * Score = 0.35*interest + 0.30*history + 0.25*popularity + 0.10*recency
 *
 * This keeps the "AI" deterministic, transparent and fast (no external
 * API latency or cost), which is appropriate for a student/portfolio
 * project while still being a genuine personalization algorithm.
 */

const scoreInterestMatch = (event, interests) => {
  if (!interests || interests.length === 0) return 0;
  const eventTokens = [event.category, ...(event.tags || [])].map((t) => t.toLowerCase());
  const interestTokens = interests.map((t) => t.toLowerCase());
  const matches = eventTokens.filter((t) => interestTokens.includes(t)).length;
  return Math.min(matches / Math.max(interestTokens.length, 1), 1);
};

const scoreHistoryMatch = (event, bookedCategoryCounts) => {
  const total = Object.values(bookedCategoryCounts).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  const count = bookedCategoryCounts[event.category] || 0;
  return count / total;
};

const scorePopularity = (event, maxBookings, maxViews) => {
  const bookingScore = maxBookings > 0 ? event.seatsBooked / maxBookings : 0;
  const viewScore = maxViews > 0 ? event.viewCount / maxViews : 0;
  return bookingScore * 0.7 + viewScore * 0.3;
};

const scoreRecency = (event) => {
  const now = Date.now();
  const start = new Date(event.startDate).getTime();
  const daysAway = (start - now) / (1000 * 60 * 60 * 24);
  if (daysAway < 0) return 0;
  if (daysAway <= 7) return 1;
  if (daysAway <= 30) return 0.6;
  return 0.3;
};

/**
 * Returns the top N recommended events for a given user.
 */
const getRecommendationsForUser = async (user, limit = 10) => {
  const now = new Date();

  const [events, pastBookings] = await Promise.all([
    Event.find({ status: 'published', startDate: { $gte: now } }).lean(),
    Booking.find({ user: user._id, status: { $ne: 'cancelled' } }).populate('event').lean(),
  ]);

  if (events.length === 0) return [];

  const bookedEventIds = new Set(
    pastBookings.filter((b) => b.event).map((b) => String(b.event._id))
  );

  const bookedCategoryCounts = {};
  pastBookings.forEach((b) => {
    if (!b.event) return;
    bookedCategoryCounts[b.event.category] = (bookedCategoryCounts[b.event.category] || 0) + 1;
  });

  const maxBookings = Math.max(...events.map((e) => e.seatsBooked || 0), 1);
  const maxViews = Math.max(...events.map((e) => e.viewCount || 0), 1);

  const scored = events
    .filter((e) => !bookedEventIds.has(String(e._id))) // don't recommend events already booked
    .map((event) => {
      const interestScore = scoreInterestMatch(event, user.interests);
      const historyScore = scoreHistoryMatch(event, bookedCategoryCounts);
      const popularityScore = scorePopularity(event, maxBookings, maxViews);
      const recencyScore = scoreRecency(event);

      const finalScore =
        interestScore * 0.35 + historyScore * 0.3 + popularityScore * 0.25 + recencyScore * 0.1;

      return {
        event,
        score: Number(finalScore.toFixed(4)),
        reasons: {
          interestScore: Number(interestScore.toFixed(2)),
          historyScore: Number(historyScore.toFixed(2)),
          popularityScore: Number(popularityScore.toFixed(2)),
          recencyScore: Number(recencyScore.toFixed(2)),
        },
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
};

/**
 * Returns globally trending events (used as a fallback for brand-new
 * users with no interests/history yet, e.g. on the public homepage).
 */
const getTrendingEvents = async (limit = 10) => {
  const now = new Date();
  return Event.find({ status: 'published', startDate: { $gte: now } })
    .sort({ seatsBooked: -1, viewCount: -1 })
    .limit(limit)
    .lean();
};

module.exports = { getRecommendationsForUser, getTrendingEvents };
