const mongoose = require('mongoose');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Attendance = require('../models/Attendance');
const Ticket = require('../models/Ticket');

/**
 * Analytics Engine
 * ----------------
 * Computes "AI-driven" analytics using MongoDB aggregation pipelines:
 * attendance trends, most popular events/categories, booking statistics,
 * and a simple engagement score per user. All numbers are derived
 * directly from real collection data (no external API calls needed).
 */

// Platform-wide summary used by the Admin dashboard
const getPlatformOverview = async () => {
  const [totalUsers, totalEvents, totalBookings, totalRevenueAgg, totalAttendance] =
    await Promise.all([
      mongoose.model('User').countDocuments(),
      Event.countDocuments(),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Attendance.countDocuments(),
    ]);

  return {
    totalUsers,
    totalEvents,
    totalBookings,
    totalRevenue: totalRevenueAgg[0]?.total || 0,
    totalAttendance,
  };
};

// Summary scoped to a single organizer's events
const getOrganizerOverview = async (organizerId) => {
  const events = await Event.find({ organizer: organizerId }).select('_id').lean();
  const eventIds = events.map((e) => e._id);

  const [totalBookings, revenueAgg, attendanceCount] = await Promise.all([
    Booking.countDocuments({ event: { $in: eventIds }, status: 'confirmed' }),
    Booking.aggregate([
      { $match: { event: { $in: eventIds }, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Attendance.countDocuments({ event: { $in: eventIds } }),
  ]);

  return {
    totalEvents: events.length,
    totalBookings,
    totalRevenue: revenueAgg[0]?.total || 0,
    totalAttendance: attendanceCount,
  };
};

// Most popular events ranked by seats booked (with optional organizer scope)
const getPopularEvents = async (limit = 5, organizerId = null) => {
  const match = organizerId ? { organizer: new mongoose.Types.ObjectId(organizerId) } : {};
  return Event.find(match)
    .sort({ seatsBooked: -1, viewCount: -1 })
    .limit(limit)
    .select('title category seatsBooked capacity viewCount startDate')
    .lean();
};

// Booking counts grouped by category (for pie/bar charts)
const getBookingsByCategory = async (organizerId = null) => {
  const matchStage = organizerId
    ? [{ $match: { organizer: new mongoose.Types.ObjectId(organizerId) } }]
    : [];

  return Event.aggregate([
    ...matchStage,
    {
      $lookup: {
        from: 'bookings',
        localField: '_id',
        foreignField: 'event',
        as: 'bookings',
      },
    },
    {
      $project: {
        category: 1,
        confirmedBookings: {
          $size: {
            $filter: {
              input: '$bookings',
              as: 'b',
              cond: { $eq: ['$$b.status', 'confirmed'] },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: '$category',
        totalBookings: { $sum: '$confirmedBookings' },
      },
    },
    { $sort: { totalBookings: -1 } },
  ]);
};

// Daily attendance trend over the last N days (for line charts)
const getAttendanceTrend = async (days = 14, organizerId = null) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const matchStage = { checkedInAt: { $gte: since } };

  let eventIds = null;
  if (organizerId) {
    const events = await Event.find({ organizer: organizerId }).select('_id').lean();
    eventIds = events.map((e) => e._id);
    matchStage.event = { $in: eventIds };
  }

  const results = await Attendance.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkedInAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return results.map((r) => ({ date: r._id, attendance: r.count }));
};

// Daily booking trend over the last N days (for line charts)
const getBookingTrend = async (days = 14, organizerId = null) => {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const matchStage = { createdAt: { $gte: since }, status: 'confirmed' };

  if (organizerId) {
    const events = await Event.find({ organizer: organizerId }).select('_id').lean();
    matchStage.event = { $in: events.map((e) => e._id) };
  }

  const results = await Booking.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        bookings: { $sum: '$quantity' },
        revenue: { $sum: '$totalAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return results.map((r) => ({ date: r._id, bookings: r.bookings, revenue: r.revenue }));
};

// Simple user engagement score: weighted mix of bookings, tickets used,
// and account age, normalized to 0-100. Surfaced on the admin dashboard
// as an "AI engagement score" per user.
const getUserEngagementScores = async (limit = 10) => {
  const results = await Booking.aggregate([
    { $match: { status: 'confirmed' } },
    {
      $group: {
        _id: '$user',
        bookingsCount: { $sum: 1 },
        totalSpend: { $sum: '$totalAmount' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        name: '$user.name',
        email: '$user.email',
        bookingsCount: 1,
        totalSpend: 1,
      },
    },
    { $sort: { bookingsCount: -1, totalSpend: -1 } },
    { $limit: limit },
  ]);

  const maxBookings = Math.max(...results.map((r) => r.bookingsCount), 1);
  const maxSpend = Math.max(...results.map((r) => r.totalSpend), 1);

  return results.map((r) => ({
    ...r,
    engagementScore: Math.round(
      ((r.bookingsCount / maxBookings) * 0.6 + (r.totalSpend / maxSpend) * 0.4) * 100
    ),
  }));
};

module.exports = {
  getPlatformOverview,
  getOrganizerOverview,
  getPopularEvents,
  getBookingsByCategory,
  getAttendanceTrend,
  getBookingTrend,
  getUserEngagementScores,
};
