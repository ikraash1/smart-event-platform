const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, registerValidation, loginValidation } = require('../middleware/validateMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, registerValidation, validate, registerUser);
router.post('/login', authLimiter, loginValidation, validate, loginUser);
router.get('/me', protect, getMe);

module.exports = router;
