const asyncHandler = require('express-async-handler');
const Ticket = require('../models/Ticket');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const { verifyTicketCode } = require('../utils/qrCodeUtil');

// @desc    Get all tickets for the logged-in user
// @route   GET /api/tickets/my
// @access  Private
const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id })
    .populate('event', 'title startDate venue coverImage')
    .sort({ createdAt: -1 });

  res.json({ success: true, tickets });
});

// @desc    Get a single ticket by ID (owner, organizer of the event, or admin)
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate('event').populate('user', 'name email');

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  const isOwner = String(ticket.user._id) === String(req.user._id);
  const isOrganizer = String(ticket.event.organizer) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isOrganizer && !isAdmin) {
    res.status(403);
    throw new Error('Not authorized to view this ticket');
  }

  res.json({ success: true, ticket });
});

// @desc    Verify a scanned QR ticket code and check the attendee in
// @route   POST /api/tickets/verify
// @access  Private/Organizer,Admin
const verifyTicket = asyncHandler(async (req, res) => {
  const { ticketCode } = req.body;

  if (!ticketCode) {
    res.status(400);
    throw new Error('A ticket code is required');
  }

  if (!verifyTicketCode(ticketCode)) {
    return res.status(400).json({
      success: false,
      valid: false,
      message: 'Invalid or tampered ticket code',
    });
  }

  const ticket = await Ticket.findOne({ ticketCode })
    .populate('event', 'title startDate venue organizer')
    .populate('user', 'name email avatar');

  if (!ticket) {
    return res.status(404).json({
      success: false,
      valid: false,
      message: 'Ticket not found',
    });
  }

  const isOrganizer = String(ticket.event.organizer) === String(req.user._id);
  if (req.user.role !== 'admin' && !isOrganizer) {
    res.status(403);
    throw new Error('Not authorized to verify tickets for this event');
  }

  if (ticket.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      valid: false,
      message: 'This ticket has been cancelled',
      ticket,
    });
  }

  if (ticket.status === 'used') {
    return res.status(400).json({
      success: false,
      valid: false,
      message: `Ticket already used at ${ticket.usedAt}`,
      ticket,
    });
  }

  ticket.status = 'used';
  ticket.usedAt = new Date();
  await ticket.save();

  await Attendance.create({
    event: ticket.event._id,
    ticket: ticket._id,
    user: ticket.user._id,
    verifiedBy: req.user._id,
    method: 'qr_scan',
  });

  res.json({
    success: true,
    valid: true,
    message: 'Ticket verified - entry granted',
    ticket,
  });
});

// @desc    Manually check in an attendee without scanning (fallback)
// @route   POST /api/tickets/:id/manual-checkin
// @access  Private/Organizer,Admin
const manualCheckIn = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate('event', 'organizer');

  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  const isOrganizer = String(ticket.event.organizer) === String(req.user._id);
  if (req.user.role !== 'admin' && !isOrganizer) {
    res.status(403);
    throw new Error('Not authorized to check in attendees for this event');
  }

  if (ticket.status !== 'valid') {
    res.status(400);
    throw new Error(`Ticket cannot be checked in (status: ${ticket.status})`);
  }

  ticket.status = 'used';
  ticket.usedAt = new Date();
  await ticket.save();

  await Attendance.create({
    event: ticket.event._id,
    ticket: ticket._id,
    user: ticket.user,
    verifiedBy: req.user._id,
    method: 'manual',
  });

  res.json({ success: true, message: 'Attendee checked in manually', ticket });
});

module.exports = { getMyTickets, getTicketById, verifyTicket, manualCheckIn };
