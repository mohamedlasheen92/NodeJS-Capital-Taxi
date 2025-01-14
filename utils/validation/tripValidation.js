const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/User");
const Trip = require("../../models/Trip");

const rideRequestValidator = [
  check('pickupLocation')
    .notEmpty().withMessage('Pickup location is required')
    .custom((value) => {
      if (!value.type || value.type !== 'Point' || !value.coordinates || value.coordinates.length !== 2) {
        throw new Error('Invalid pickup location format. It should be a GeoJSON Point with coordinates.');
      }
      return true;
    }),

  check('dropoffLocation')
    .notEmpty().withMessage('Dropoff location is required')
    .custom((value) => {
      if (!value.type || value.type !== 'Point' || !value.coordinates || value.coordinates.length !== 2) {
        throw new Error('Invalid dropoff location format. It should be a GeoJSON Point with coordinates.');
      }
      return true;
    }),

  check('userId')
    .notEmpty().withMessage('User ID is required')
    .isMongoId().withMessage('Invalid User ID format')
    .custom(async (value) => {
      //Check if there is already a user with this ID
      const user = await User.findById(value);
      if (!user)
        throw new Error('There is no user with this ID');

      return true;
    }),

  validatorMiddleware
];

const respondToRideRequestValidator = [
  check('rideRequestId')
    .notEmpty().withMessage('Ride request ID is required')
    .isMongoId().withMessage('Invalid Ride request ID format')
    .custom(async (value) => {
      // Check if there is already a ride request with this ID
      const rideRequest = await RideRequest.findById(value);
      if (!rideRequest)
        throw new Error('There is no ride request with this ID');

      return true;
    }),

  check('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['accepted', 'rejected']).withMessage('Invalid status. Status must be either "accepted" or "rejected"'),

  validatorMiddleware
];

const updateTripToCompleteValidator = [
  check('id')
    .isMongoId().withMessage('Invalid trip ID format. Please provide a valid ID')
    .custom(async (value) => {
      // Check if there is already a trip with this ID
      const trip = await Trip.findById(value);
      if (!trip)
        throw new Error('There is no trip with this ID');
    })
]


module.exports = {
  rideRequestValidator,
  respondToRideRequestValidator,
  updateTripToCompleteValidator,
}
