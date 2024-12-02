const bcrypt = require('bcrypt');
const CustomError = require("../utils/customError")

const Driver = require("../models/Driver")


// *** ADMINS ***

/**
 * @description Retrieve all drivers
 * @route GET /api/v1/drivers
 * @access Private (Admin only)
 */
const getDrivers = async (req, res, next) => {
  const drivers = await Driver.find({})
  res.status(200).json({ count: drivers.length, data: drivers })
}

/**
 * @description Retrieve a specific driver by ID
 * @route GET /api/v1/drivers/:id
 * @access Private (Admin only)
 */
const getDriver = async (req, res, next) => {
  const driver = await Driver.findById(req.params.id)
  if (!driver)
    return next(new CustomError(`No document for this id ${req.params.id}`, 404))

  res.status(200).json({ data: driver })
}

/**
 * @description Create a new driver
 * @route POST /api/v1/drivers
 * @access Private (Admin only)
 */
const createDriver = async (req, res, next) => {
  const newDriver = await Driver.create(req.body)
  res.status(201).json({ data: newDriver })
}

/**
 * @description Update driver details by ID
 * @route PUT /api/v1/drivers/:id
 * @access Private (Admin only)
 */
const updateDriver = async (req, res, next) => {
  const driver = await Driver.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    email: req.body.email,
    // role: req.body.role,
    phone: req.body.phone,
    // profileImage: req.body.profileImage
  }, { new: true })
  if (!driver)
    return next(new CustomError(`No driver for this id ${req.params.id}`, 404))

  res.status(200).json({ data: driver })
}

/**
 * @description Delete driver by ID
 * @route DELETE /api/v1/drivers/:id
 * @access Private (Admin only)
 */
const deleteDriver = async (req, res, next) => {
  const driver = await Driver.findByIdAndDelete(req.params.id)
  if (!driver)
    return next(new CustomError(`No document for this id ${req.params.id}`, 404))

  res.status(204).send()
}

/** 
 * @description Change driver's password by ID
 * @route PUT /api/v1/drivers/changePassword/:id
 * @access Private (Admin only) 
 */
const changeDriverPassword = async (req, res, next) => {
  const driver = await Driver.findByIdAndUpdate(req.params.id, {
    password: await bcrypt.hash(req.body.newPassword, Number(process.env.SALT_ROUNDS))
  }, { new: true })
  if (!driver)
    return next(new CustomError(`No document for this id ${req.params.id}`, 404))

  res.status(200).json({ message: 'Password updated successfully', data: driver })
}


// *** LOGGED DRIVERS ***

/**
 * @description Middleware to set the ID parameter to the logged-in driver's ID
 * @route Middleware
 * @access Private
 */
const getLoggedDriverData = async (req, res, next) => {
  req.params.id = req.driver._id

  next()
}

/**
 * @description Update the logged-in driver's password and generate a new JWT token
 * @route PATCH /api/v1/drivers/updatePassword
 * @access Private
 */
const updateLoggedDriverPassword = async (req, res, next) => {
  const driver = await Driver.findByIdAndUpdate(req.driver._id, {
    password: await bcrypt.hash(req.body.newPassword, Number(process.env.SALT_ROUNDS)),
    passwordChangedAt: Date.now()
  }, { new: true })

  const token = await driver.generateJWT()

  res.status(200).json({ message: 'Password updated successfully', data: driver, token })
}

const updateLoggedDriverData = async (req, res, next) => {
  const updatedDriver = await Driver.findByIdAndUpdate(req.driver._id, {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    // profileImage: req.body.profileImage
  }, { new: true })

  if (!updatedDriver)
    return next(new CustomError(`No document for this id ${req.driver._id}`, 404))

  res.status(200).json({ message: 'Driver data updated successfully', data: updatedDriver })
}

module.exports = {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  changeDriverPassword,
  getLoggedDriverData,
  updateLoggedDriverPassword,
  updateLoggedDriverData
}