const express = require('express');
const {
  getAdminOverview,
  getOrganizerOverview,
  getPopularEvents,
  getBookingsByCategory,
  getAttendanceTrend,
  getBookingTrend,
  getUserEngagement,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/admin/overview', protect, authorize('admin'), getAdminOverview);
router.get('/organizer/overview', protect, authorize('organizer', 'admin'), getOrganizerOverview);
router.get('/popular-events', protect, authorize('organizer', 'admin'), getPopularEvents);
router.get('/bookings-by-category', protect, authorize('organizer', 'admin'), getBookingsByCategory);
router.get('/attendance-trend', protect, authorize('organizer', 'admin'), getAttendanceTrend);
router.get('/booking-trend', protect, authorize('organizer', 'admin'), getBookingTrend);
router.get('/user-engagement', protect, authorize('admin'), getUserEngagement);

module.exports = router;
