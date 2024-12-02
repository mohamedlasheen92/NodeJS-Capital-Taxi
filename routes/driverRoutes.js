const express = require('express');
const { getDrivers, createDriver, getDriver, updateDriver, deleteDriver, changeDriverPassword, getLoggedDriverData, updateLoggedDriverPassword, updateLoggedDriverData, } = require('../controllers/driverController');
const { createDriverValidator, getDriverValidator, updateDriverValidator, deleteDriverValidator, changeDriverPasswordValidator, updateLoggedDriverPasswordValidator, updateLoggedDriverDataValidator } = require('../utils/validation/driverValidator');

const authRoutes = require('./driverAuthRoutes');
const { verifyDriverRoles, verifyDriverAuthAdmin, verifyDriverAuth } = require('../controllers/driverAuthController');

const router = express.Router();

router.use('/auth', authRoutes)

// *** LOGGED DRIVERS ***
router.get('/getMe', verifyDriverAuth, getLoggedDriverData, getDriver)
router.patch('/updatePassword', verifyDriverAuth, updateLoggedDriverPasswordValidator, updateLoggedDriverPassword)
router.patch('/updateMe', verifyDriverAuth, updateLoggedDriverDataValidator, updateLoggedDriverData)


// *** ADMINS ***
router.patch('/changePassword/:id', verifyDriverAuthAdmin, verifyDriverRoles('admin'), changeDriverPasswordValidator, changeDriverPassword)

router.route('/')
  .get(verifyDriverAuthAdmin, verifyDriverRoles('admin'), getDrivers)
  .post(verifyDriverAuthAdmin, verifyDriverRoles('admin'), createDriverValidator, createDriver)


router.route('/:id')
  .get(verifyDriverAuthAdmin, verifyDriverRoles('admin'), getDriverValidator, getDriver)
  .patch(verifyDriverAuthAdmin, verifyDriverRoles('admin'), updateDriverValidator, updateDriver)
  .delete(verifyDriverAuthAdmin, verifyDriverRoles('admin'), deleteDriverValidator, deleteDriver)

module.exports = router;