const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checkedInAt: {
      type: Date,
      default: Date.now,
    },
    verifiedBy: {
      // The organizer/admin user who scanned the ticket
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    method: {
      type: String,
      enum: ['qr_scan', 'manual'],
      default: 'qr_scan',
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ event: 1 });
attendanceSchema.index({ ticket: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
