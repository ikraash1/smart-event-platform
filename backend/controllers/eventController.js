const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const Attendance = require('../models/Attendance');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Organizer,Admin
const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, organizer: req.user._id });
  res.status(201).json({ success: true, event });
});

// @desc    Get events with search, filters, pagination
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    status,
    organizer,
    upcoming,
    minPrice,
    maxPrice,
    sortBy = 'startDate',
    order = 'asc',
    page = 1,
    limit = 12,
  } = req.query;

  const query = {};

  if (search) {
    query.$text = { $search: search };
  }
  if (category) query.category = category;
  if (organizer) query.organizer = organizer;
  if (status) {
    query.status = status;
  } else if (!organizer) {
    query.status = 'published';
  }
  if (upcoming === 'true') {
    query.startDate = { $gte: new Date() };
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortOrder = order === 'desc' ? -1 : 1;

  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('organizer', 'name email avatar')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit)),
    Event.countDocuments(query),
  ]);

  res.json({
    success: true,
    events,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Get single event by ID, increments view count
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { $inc: { viewCount: 1 } },
    { new: true }
  ).populate('organizer', 'name email avatar bio');

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  res.json({ success: true, event });
});

// @desc    Update an event (owner organizer or admin only)
// @route   PUT /api/events/:id
// @access  Private/Organizer,Admin
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (req.user.role !== 'admin' && String(event.organizer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to update this event');
  }

  const disallowed = ['seatsBooked', 'organizer', 'viewCount'];
  disallowed.forEach((field) => delete req.body[field]);

  Object.assign(event, req.body);
  const updated = await event.save();

  res.json({ success: true, event: updated });
});

// @desc    Delete an event (owner organizer or admin only)
// @route   DELETE /api/events/:id
// @access  Private/Organizer,Admin
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (req.user.role !== 'admin' && String(event.organizer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to delete this event');
  }

  const bookingIds = await Booking.find({ event: event._id }).select('_id');
  await Ticket.deleteMany({ event: event._id });
  await Attendance.deleteMany({ event: event._id });
  await Booking.deleteMany({ event: event._id });
  await event.deleteOne();

  res.json({ success: true, message: 'Event and related bookings deleted' });
});

// @desc    Get list of distinct categories with counts (for filter UI)
// @route   GET /api/events/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Event.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  res.json({ success: true, categories });
});

// @desc    Get attendee list for an event (organizer/admin only)
// @route   GET /api/events/:id/attendees
// @access  Private/Organizer,Admin
const getEventAttendees = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (req.user.role !== 'admin' && String(event.organizer) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to view attendees for this event');
  }

  const bookings = await Booking.find({ event: event._id, status: 'confirmed' })
    .populate('user', 'name email phone avatar')
    .sort({ createdAt: -1 });

  const attendance = await Attendance.find({ event: event._id }).select('ticket');
  const checkedInTicketIds = new Set(attendance.map((a) => String(a.ticket)));

  const tickets = await Ticket.find({ event: event._id }).select('booking status');
  const ticketsByBooking = {};
  tickets.forEach((t) => {
    const key = String(t.booking);
    ticketsByBooking[key] = ticketsByBooking[key] || [];
    ticketsByBooking[key].push({
      checkedIn: checkedInTicketIds.has(String(t._id)),
      status: t.status,
    });
  });

  const attendees = bookings.map((b) => ({
    booking: b._id,
    user: b.user,
    quantity: b.quantity,
    bookingReference: b.bookingReference,
    tickets: ticketsByBooking[String(b._id)] || [],
  }));

  res.json({ success: true, attendees, total: attendees.length });
});

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getCategories,
  getEventAttendees,
};
