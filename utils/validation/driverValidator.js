const { check } = require("express-validator");
const Driver = require("../../models/Driver");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

// *** ADMINS ***
const createDriverValidator = [
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
      const driver = await Driver.findOne({ phone: value })
      if (driver)
        throw new Error('Phone number already exists');

      return true

    }),

  check('role')
    .optional()
    .isIn(['driver']).withMessage("Invalid role. Role must be driver"),

  // check('profileImage').optional(),

  validatorMiddleware
]

const updateDriverValidator = [
  check('id').isMongoId().withMessage('Invalid driver ID format. Please provide a valid ID'),
  check('name')
    .optional()
    .isLength({ min: 3, max: 20 }).withMessage('Drivername must be between 3 and 20 characters'),

  check('email')
    .optional()
    .isEmail().withMessage('Please enter a valid email address')
    .custom(async (value) => {
      // Check if email already exists in the database
      const driver = await Driver.findOne({ email: value })
      if (driver)
        throw new Error('Email already exists');

      return true
    }),

  check('phone')
    .optional()
    .isMobilePhone('ar-EG')
    .withMessage('Please enter a valid mobile phone number in Egyptian format'),

  check('profileImage').optional(),


  validatorMiddleware
]

const getDriverValidator = [
  check('id')
    .isMongoId().withMessage('Invalid driver ID format. Please provide a valid ID'),

  validatorMiddleware
]

const deleteDriverValidator = [
  check('id')
    .isMongoId().withMessage('Invalid driver ID format. Please provide a valid ID'),

  validatorMiddleware
]

const changeDriverPasswordValidator = [
  check('id').isMongoId().withMessage('Invalid driver ID format. Please provide a valid ID'),
  check('currentPassword')
    .notEmpty().withMessage('Current password is required')
    .custom(async (value, { req }) => {
      // Check if there is a driver with that ID and Current password is correct
      const driver = await Driver.findById(req.params.id)
      if (!driver)
        throw new Error(`There's no document for this id ${req.params.id}`)

      if (!(await driver.comparePassword(value)))
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

// *** LOGGED DRIVERS ***
const updateLoggedDriverPasswordValidator = [
  check('currentPassword')
    .notEmpty().withMessage('Current password is required')
    .custom(async (value, { req }) => {
      //Check if the current password is correct
      const driver = await Driver.findById(req.driver._id)
      if (!driver)
        throw new Error('No driver associated with this ID. The account may have been removed')

      if (!(await driver.comparePassword(value)))
        throw new Error('Current password is incorrect');

      return true
    }),

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
    .notEmpty().withMessage('Confirm new password is required'),


  validatorMiddleware
]

const updateLoggedDriverDataValidator = [
  check('name')
    .optional()
    .isLength({ min: 3, max: 20 }).withMessage('Drivername must be between 3 and 20 characters'),

  check('email')
    .optional()
    .isEmail().withMessage('Please enter a valid email address')
    .custom(async (value) => {
      // Check if email already exists in the database
      const driver = await Driver.findOne({ email: value })
      if (driver)
        throw new Error('Email already exists');

      return true
    }),

  check('phone')
    .optional()
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


module.exports = {
  createDriverValidator,
  updateDriverValidator,
  getDriverValidator,
  deleteDriverValidator,
  changeDriverPasswordValidator,
  updateLoggedDriverPasswordValidator,
  updateLoggedDriverDataValidator
}