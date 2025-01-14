const express = require('express');
const { createRideRequest, respondToRideRequest, getRideRequests, getTrips, getTrip, updateTripToComplete } = require('../controllers/rideRequestController');
const { verifyUserAuth, verifyUserRoles } = require('../controllers/authController');
const { verifyDriverAuth, verifyDriverRoles } = require('../controllers/driverAuthController');
const { rideRequestValidator, respondToRideRequestValidator, updateTripToCompleteValidator } = require('../utils/validation/tripValidation');
const router = express.Router()

router.post('/rideRequest', verifyUserAuth, verifyUserRoles('rider'), rideRequestValidator, createRideRequest)
router.post('/respondToRide', verifyDriverAuth, verifyDriverRoles('driver'), respondToRideRequestValidator, respondToRideRequest)
router.get('/requests', verifyUserAuth, verifyUserRoles('admin'), getRideRequests)
router.get('/', verifyUserAuth, verifyUserRoles('admin'), getTrips)
router.get('/:id', verifyUserAuth, verifyUserRoles('admin'), getTrip)
router.put('/:id', updateTripToCompleteValidator, updateTripToComplete)

module.exports = router;