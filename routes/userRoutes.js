const express = require('express');
const { getUsers, createUser, getUser, updateUser, deleteUser, changeUserPassword, getLoggedUserData, updateLoggedUserPassword, updateLoggedUserData } = require('../controllers/userController');
const { createUserValidator, getUserValidator, updateUserValidator, deleteUserValidator, changeUserPasswordValidator, updateLoggedUserPasswordValidator, updateLoggedUserDataValidator } = require('../utils/validation/userValidator');

const authRoutes = require('./authRoutes');
const { verifyUserAuth, verifyUserRoles } = require('../controllers/authController');

const router = express.Router();

router.use('/auth', authRoutes)

// *** LOGGED USERS ***
router.get('/getMe', verifyUserAuth, getLoggedUserData, getUser)
router.patch('/updatePassword', verifyUserAuth, updateLoggedUserPasswordValidator, updateLoggedUserPassword)
router.patch('/updateMe', verifyUserAuth, updateLoggedUserDataValidator, updateLoggedUserData)


// *** ADMINS ***
router.patch('/changePassword/:id', verifyUserAuth, verifyUserRoles('admin'), changeUserPasswordValidator, changeUserPassword)

router.route('/')
  .get(verifyUserAuth, verifyUserRoles('admin'), getUsers)
  .post(verifyUserAuth, verifyUserRoles('admin'), createUserValidator, createUser)


router.route('/:id')
  .get(verifyUserAuth, verifyUserRoles('admin'), getUserValidator, getUser)
  .patch(verifyUserAuth, verifyUserRoles('admin'), updateUserValidator, updateUser)
  .delete(verifyUserAuth, verifyUserRoles('admin'), deleteUserValidator, deleteUser)

module.exports = router;