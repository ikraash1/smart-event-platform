const express = require('express');
const {
  createBooking,
  getMyBookings,
  getOrganizerBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate, bookingValidation } = require('../middleware/validateMiddleware');

const router = express.Router();

router.post('/', protect, bookingValidation, validate, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/organizer', protect, authorize('organizer', 'admin'), getOrganizerBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
