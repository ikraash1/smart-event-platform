const express = require('express');
const { getEventAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventAttendance);

module.exports = router;
