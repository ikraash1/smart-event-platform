const mongoose = require('mongoose');

/**
 * Stores periodic, pre-computed analytics snapshots so dashboards can
 * render trend charts without re-aggregating the entire bookings/attendance
 * history on every page load. Snapshots are generated per event per day.
 */
const analyticsSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    bookingsCount: {
      type: Number,
      default: 0,
    },
    ticketsSold: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    attendanceCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

analyticsSchema.index({ event: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
