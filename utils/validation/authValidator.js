const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/User");

const signupValidator = [
  check('name')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters'),

  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .custom(async (value) => {
      // Check if email already exists in the database
      const user = await User.findOne({ email: value })
      if (user)
        throw new Error('Email already exists');

      return true
    }),

  check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .custom((value, { req }) => {
      // Compare password and confirm password
      if (value !== req.body.passConfirm)
        throw new Error('Passwords do not match. Please confirm your password');

      return true
    }),

  check('passConfirm')
    .notEmpty().withMessage('Confirm password is required'),

  check('phone')
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('ar-EG')
    .withMessage('Please enter a valid mobile phone number in Egyptian format')
    .custom(async (value) => {
      // Check if phone number already exists in the database
      const user = await User.findOne({ phone: value })
      if (user)
        throw new Error('Phone number already exists');

      return true

    }),

  validatorMiddleware
]

module.exports = {
  signupValidator
}