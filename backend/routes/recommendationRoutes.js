const express = require('express');
const { getRecommendations, getTrending } = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/trending', getTrending);
router.get('/', protect, getRecommendations);

module.exports = router;
