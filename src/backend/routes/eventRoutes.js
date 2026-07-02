const express = require('express');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getCategories,
  getEventAttendees,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate, eventValidation } = require('../middleware/validateMiddleware');

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.get('/:id/attendees', protect, authorize('organizer', 'admin'), getEventAttendees);

router.post('/', protect, authorize('organizer', 'admin'), eventValidation, validate, createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);

module.exports = router;
