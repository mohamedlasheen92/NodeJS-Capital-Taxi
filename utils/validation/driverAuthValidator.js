const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Driver = require("../../models/Driver");

const signupValidator = [
  check('name')
    .notEmpty().withMessage('Driver name is required')
    .isLength({ min: 3, max: 20 }).withMessage('Driver name must be between 3 and 20 characters'),

  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .custom(async (value) => {
      // Check if email already exists in the database
      const driver = await Driver.findOne({ email: value })
      if (driver)
        throw new Error('Email already exists');

      return true
    }),

  check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .custom((value, { req }) => {
      // Compare password and confirm password
      if (value !== req.body.passwordConfirm)
        throw new Error('Passwords do not match. Please confirm your password');

      return true
    }),

  check('passwordConfirm')
    .notEmpty().withMessage('Confirm password is required'),

  check('phone')
    .notEmpty().withMessage('Phone number is required')
    .isMobilePhone('ar-EG')
    .withMessage('Please enter a valid mobile phone number in Egyptian format')
    .custom(async (value) => {
      // Check if phone number already exists in the database
      const driver = await Driver.findOne({ phone: value })
      if (driver)
        throw new Error('Phone number already exists');

      return true

    }),

  validatorMiddleware
]

const loginValidator = [
  check('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address'),

  check('password')
    .notEmpty().withMessage('Password is required'),

  validatorMiddleware
]

const resetPasswordValidator = [
  check('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .custom((value, { req }) => {
      // Compare new password and confirm password
      if (value !== req.body.passwordConfirm)
        throw new Error('Passwords do not match. Please confirm your new password');

      return true
    }),

  check('passwordConfirm')
    .notEmpty().withMessage('Confirm password is required'),

  validatorMiddleware
]

module.exports = {
  signupValidator,
  loginValidator,
  resetPasswordValidator
}