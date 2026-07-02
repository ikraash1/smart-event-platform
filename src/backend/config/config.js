module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ROLES: {
    ADMIN: 'admin',
    ORGANIZER: 'organizer',
    ATTENDEE: 'attendee',
  },
  EVENT_CATEGORIES: [
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
  BOOKING_STATUS: {
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    PENDING: 'pending',
  },
  TICKET_STATUS: {
    VALID: 'valid',
    USED: 'used',
    CANCELLED: 'cancelled',
  },
};
