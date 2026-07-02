const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'pending'],
      default: 'confirmed',
    },
    paymentMethod: {
      type: String,
      enum: ['free', 'card', 'bank_transfer', 'cash'],
      default: 'free',
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1 });
bookingSchema.index({ event: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
