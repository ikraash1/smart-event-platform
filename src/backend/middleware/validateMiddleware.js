const { validationResult, body } = require('express-validator');

/**
 * Runs after a chain of express-validator checks. If any failed, responds
 * with 400 and a list of field-level error messages instead of letting
 * the request continue into the controller.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Reusable validation chains
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'organizer', 'attendee']).withMessage('Invalid role'),
];

const loginValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('venue').trim().notEmpty().withMessage('Venue is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
];

const bookingValidation = [
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  eventValidation,
  bookingValidation,
};
