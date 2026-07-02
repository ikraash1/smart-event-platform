const express = require('express');
const {
  getMyTickets,
  getTicketById,
  verifyTicket,
  manualCheckIn,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/my', protect, getMyTickets);
router.post('/verify', protect, authorize('organizer', 'admin'), verifyTicket);
router.get('/:id', protect, getTicketById);
router.post('/:id/manual-checkin', protect, authorize('organizer', 'admin'), manualCheckIn);

module.exports = router;
