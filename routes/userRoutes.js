const express = require('express');
const { getUsers, createUser, getUser, updateUser, deleteUser, changeUserPassword } = require('../controllers/userController');
const { createUserValidator, getUserValidator, updateUserValidator, deleteUserValidator, changeUserPasswordValidator } = require('../utils/validation/userValidator');

const router = express.Router();


router.patch('/changePassword/:id', changeUserPasswordValidator, changeUserPassword)


router.route('/')
  .get(getUsers)
  .post(createUserValidator, createUser)


router.route('/:id')
  .get(getUserValidator, getUser)
  .patch(updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser)

module.exports = router;