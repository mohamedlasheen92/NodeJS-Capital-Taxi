const bcrypt = require('bcrypt');
const CustomError = require("../utils/customError")

const User = require("../models/User")


// *** ADMINS ***

/**
 * @description Retrieve all users
 * @route GET /api/v1/users
 * @access Private (Admin only)
 */
const getUsers = async (req, res, next) => {
  const users = await User.find({})
  res.status(200).json({ count: users.length, data: users })
}

/**
 * @description Retrieve a specific user by ID
 * @route GET /api/v1/users/:id
 * @access Private (Admin only)
 */
const getUser = async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user)
    return next(new CustomError(`No document for this id ${req.params.id}`, 404))

  res.status(200).json({ data: user })
}

/**
 * @description Create a new user
 * @route POST /api/v1/users
 * @access Private (Admin only)
 */
const createUser = async (req, res, next) => {
  const newUser = await User.create(req.body)
  res.status(201).json({ data: newUser })
}

/**
 * @description Update user details by ID
 * @route PUT /api/v1/users/:id
 * @access Private (Admin only)
 */
const updateUser = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    phone: req.body.phone,
    profileImage: req.body.profileImage
  }, { new: true })
  if (!user)
    return next(new CustomError(`No user for this id ${req.params.id}`, 404))

  res.status(200).json({ data: user })
}

/**
 * @description Delete user by ID
 * @route DELETE /api/v1/users/:id
 * @access Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id)
  if (!user)
    return next(new CustomError(`No document for this id ${req.params.id}`, 404))

  res.status(204).send()
}

/** 
 * @description Change user's password by ID
 * @route PUT /api/v1/users/changePassword/:id
 * @access Private (Admin only) 
 */
const changeUserPassword = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, {
    password: await bcrypt.hash(req.body.newPassword, Number(process.env.SALT_ROUNDS))
  }, { new: true })
  if (!user)
    return next(new CustomError(`No document for this id ${req.params.id}`, 404))

  res.status(200).json({ message: 'Password updated successfully', data: user })
}


// *** LOGGED USERS ***

/**
 * @description Middleware to set the ID parameter to the logged-in user's ID
 * @route Middleware
 * @access Private
 */
const getLoggedUserData = async (req, res, next) => {
  req.params.id = req.user._id

  next()
}

/**
 * @description Update the logged-in user's password and generate a new JWT token
 * @route PATCH /api/v1/users/updatePassword
 * @access Private
 */
const updateLoggedUserPassword = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, {
    password: await bcrypt.hash(req.body.newPassword, Number(process.env.SALT_ROUNDS)),
    passwordChangedAt: Date.now()
  }, { new: true })

  const token = await user.generateJWT()

  res.status(200).json({ message: 'Password updated successfully', data: user, token })
}

const updateLoggedUserData = async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.user._id, {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    profileImage: req.body.profileImage
  }, { new: true })

  if (!updatedUser)
    return next(new CustomError(`No document for this id ${req.user._id}`, 404))

  res.status(200).json({ message: 'User data updated successfully', data: updatedUser })
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData
}