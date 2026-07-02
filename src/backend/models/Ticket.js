const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketCode: {
      // Unique signed code embedded inside the QR image, verified at the gate
      type: String,
      required: true,
      unique: true,
    },
    qrCodeImage: {
      // Base64 data URL of the generated QR code
      type: String,
      required: true,
    },
    seatNumber: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['valid', 'used', 'cancelled'],
      default: 'valid',
    },
    usedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

ticketSchema.index({ event: 1 });
ticketSchema.index({ user: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
