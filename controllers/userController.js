const bcrypt = require('bcrypt');
const CustomError = require("../utils/customError")

const User = require("../models/User")


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



module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserPassword,

}