const express = require('express');
const {
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.put('/profile', protect, updateProfile);

router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id', protect, authorize('admin'), updateUserByAdmin);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
