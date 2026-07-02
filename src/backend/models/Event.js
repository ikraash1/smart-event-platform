const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: 5000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Technology',
        'Business',
        'Music',
        'Sports',
        'Education',
        'Health',
        'Art & Culture',
        'Networking',
        'Food & Drink',
        'Other',
      ],
    },
    tags: {
      type: [String],
      default: [],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
    },
    address: {
      type: String,
      default: '',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    onlineLink: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 1,
    },
    seatsBooked: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'published',
    },
    // Denormalized counter, updated whenever a booking/view happens, used
    // for fast "popular events" sorting without aggregation on every request
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ category: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });

eventSchema.virtual('seatsAvailable').get(function () {
  return Math.max(this.capacity - this.seatsBooked, 0);
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
