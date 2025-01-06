const express = require('express');
const { createRideRequest, respondToRideRequest, getRideRequests } = require('../controllers/rideRequestController');
const { verifyUserAuth, verifyUserRoles } = require('../controllers/authController');
const { verifyDriverAuth, verifyDriverRoles } = require('../controllers/driverAuthController');
const router = express.Router()

router.post('/', verifyUserAuth, verifyUserRoles('rider'), createRideRequest)
router.post('/respondToRide', verifyDriverAuth, verifyDriverRoles('driver'), respondToRideRequest)
router.get('/requests', verifyUserAuth, verifyUserRoles('admin'), getRideRequests)




module.exports = router;