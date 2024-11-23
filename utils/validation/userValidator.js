const { check } = require("express-validator");
const User = require("../../models/User");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const createUserValidator = [
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

  check('role')
    .optional()
    .isIn(['admin', 'rider']).withMessage("Invalid role. Please select either 'admin' or 'rider'"),

  check('profileImage').optional(),

  validatorMiddleware
]

const updateUserValidator = [
  check('id').isMongoId().withMessage('Invalid user ID format. Please provide a valid ID'),
  check('name')
    .optional()
    .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters'),

  check('email')
    .optional()
    .isEmail().withMessage('Please enter a valid email address')
    .custom(async (value) => {
      // Check if email already exists in the database
      const user = await User.findOne({ email: value })
      if (user)
        throw new Error('Email already exists');

      return true
    }),

  check('phone')
    .optional()
    .isMobilePhone('ar-EG')
    .withMessage('Please enter a valid mobile phone number in Egyptian format'),

  check('profileImage').optional(),

  check('role')
    .optional()
    .isIn(['admin', 'rider']).withMessage("Invalid role. Please select either 'admin' or 'rider'"),

  validatorMiddleware
]

const getUserValidator = [
  check('id')
    .isMongoId().withMessage('Invalid user ID format. Please provide a valid ID'),

  validatorMiddleware
]


const deleteUserValidator = [
  check('id')
    .isMongoId().withMessage('Invalid user ID format. Please provide a valid ID'),

  validatorMiddleware
]

const changeUserPasswordValidator = [
  check('id').isMongoId().withMessage('Invalid user ID format. Please provide a valid ID'),
  check('currentPassword')
    .notEmpty().withMessage('Current password is required')
    .custom(async (value, { req }) => {
      // Check if there is a user with that ID and Current password is correct
      const user = await User.findById(req.params.id)
      if (!user)
        throw new Error(`There's no document for this id ${req.params.id}`)

      if (!(await user.comparePassword(value)))
        throw new Error('Current password is incorrect');

      return true
    }),
  check('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .custom((value, { req }) => {
      // Compare new password and confirm password
      if (value !== req.body.newPassConfirm)
        throw new Error('Passwords do not match. Please confirm your new password');

      return true
    }),
  check('newPassConfirm')
    .notEmpty().withMessage('Confirm new password is required'),


  validatorMiddleware
]



module.exports = {
  createUserValidator,
  updateUserValidator,
  getUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
}