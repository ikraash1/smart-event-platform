const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');

// @desc    Get attendance records for a specific event
// @route   GET /api/attendance/event/:eventId
// @access  Private/Organizer,Admin
const getEventAttendance = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const isOrganizer = String(event.organizer) === String(req.user._id);
  if (req.user.role !== 'admin' && !isOrganizer) {
    res.status(403);
    throw new Error('Not authorized to view attendance for this event');
  }

  const records = await Attendance.find({ event: event._id })
    .populate('user', 'name email avatar')
    .populate('verifiedBy', 'name')
    .sort({ checkedInAt: -1 });

  res.json({
    success: true,
    total: records.length,
    capacity: event.capacity,
    attendanceRate: event.seatsBooked > 0 ? Number(((records.length / event.seatsBooked) * 100).toFixed(1)) : 0,
    records,
  });
});

module.exports = { getEventAttendance };
