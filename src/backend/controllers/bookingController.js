const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const { generateTicketCode, generateQRCodeImage } = require('../utils/qrCodeUtil');

// @desc    Create a booking for an event and generate QR tickets
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const { eventId, quantity = 1, paymentMethod = 'free' } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  if (event.status !== 'published') {
    res.status(400);
    throw new Error('This event is not open for booking');
  }

  if (new Date(event.startDate) < new Date()) {
    res.status(400);
    throw new Error('Cannot book an event that has already started');
  }

  const seatsAvailable = event.capacity - event.seatsBooked;
  if (quantity > seatsAvailable) {
    res.status(400);
    throw new Error(`Only ${seatsAvailable} seat(s) remaining for this event`);
  }

  const totalAmount = event.price * quantity;
  const bookingReference = `BK-${uuidv4().slice(0, 8).toUpperCase()}`;

  const booking = await Booking.create({
    user: req.user._id,
    event: event._id,
    quantity,
    totalAmount,
    paymentMethod: event.price > 0 ? paymentMethod : 'free',
    bookingReference,
  });

  event.seatsBooked += quantity;
  await event.save();

  // Generate one QR ticket per seat purchased
  const tickets = [];
  for (let i = 0; i < quantity; i += 1) {
    const ticketCode = generateTicketCode();
    const qrCodeImage = await generateQRCodeImage(ticketCode);
    const ticket = await Ticket.create({
      booking: booking._id,
      event: event._id,
      user: req.user._id,
      ticketCode,
      qrCodeImage,
      seatNumber: i + 1,
    });
    tickets.push(ticket);
  }

  res.status(201).json({ success: true, booking, tickets });
});

// @desc    Get bookings for the logged-in user
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('event', 'title startDate endDate venue coverImage category price')
    .sort({ createdAt: -1 });

  res.json({ success: true, bookings });
});

// @desc    Get all bookings for events owned by the logged-in organizer
// @route   GET /api/bookings/organizer
// @access  Private/Organizer,Admin
const getOrganizerBookings = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id }).select('_id');
  const eventIds = events.map((e) => e._id);

  const bookings = await Booking.find({ event: { $in: eventIds } })
    .populate('event', 'title startDate venue')
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, bookings });
});

// @desc    Get single booking with its tickets
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('event');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const isOwner = String(booking.user) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view this booking');
  }

  const tickets = await Ticket.find({ booking: booking._id });

  res.json({ success: true, booking, tickets });
});

// @desc    Cancel a booking (releases seats, voids tickets)
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const isOwner = String(booking.user) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  if (booking.status === 'cancelled') {
    res.status(400);
    throw new Error('Booking is already cancelled');
  }

  booking.status = 'cancelled';
  await booking.save();

  await Ticket.updateMany({ booking: booking._id }, { status: 'cancelled' });

  const event = await Event.findById(booking.event);
  if (event) {
    event.seatsBooked = Math.max(event.seatsBooked - booking.quantity, 0);
    await event.save();
  }

  res.json({ success: true, message: 'Booking cancelled successfully' });
});

module.exports = {
  createBooking,
  getMyBookings,
  getOrganizerBookings,
  getBookingById,
  cancelBooking,
};
