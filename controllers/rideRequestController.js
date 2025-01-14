const geolib = require('geolib');

const Driver = require("../models/Driver")
const RideRequest = require("../models/RideRequest")
const Trip = require("../models/Trip")
const CustomError = require("../utils/customError");
const User = require('../models/User');

/**
 * @description Create a new ride request and assign it to the nearest available driver
 * @route POST /trips/ride-request
 * @access Private/Rider
 */
const createRideRequest = async (req, res, next) => {
  const { pickupLocation, dropoffLocation, userId } = req.body

  if (!pickupLocation || !dropoffLocation || !userId)
    return next(new CustomError('Missing required fields.', 400))


  // Find the nearest available driver using geospatial query
  const nearestDriver = await Driver.findOne({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [pickupLocation.coordinates[0], pickupLocation.coordinates[1]]
        }
      }
    },
    isAvailable: true,
  })
  if (!nearestDriver)
    return next(new CustomError('No available drivers near your pickup location.', 404))

  //Create a new ride request
  const newRideRequest = await RideRequest.create({
    pickupLocation,
    dropoffLocation,
    userId,
    driverId: nearestDriver._id,
  })

  // Notify the driver (for now, just a response)
  // Return the ride request and driver details
  res.status(200).json({
    message: "Ride request created and driver assigned.",
    rideRequest: newRideRequest,
    driver: nearestDriver
  })
}


/**
 * @description Get ride requests, optionally filtered by driver ID
 * @route GET /ride-request/requests
 * @access Private/Admin
 */
const getRideRequests = async (req, res, next) => {
  const filterObj = {}
  if (req.body.driverId) filterObj.driverId = req.body.driverId
  const rideRequests = await RideRequest.find(filterObj)
  res.status(200).json({ count: rideRequests.length, data: rideRequests })
}


/**
 * @description Respond to a ride request by accepting or rejecting it and create a trip if accepted
 * @route POST /ride-request/respondToRide
 * @access Private/Driver
 */
const respondToRideRequest = async (req, res, next) => {
  const { rideRequestId, status } = req.body;

  if (!rideRequestId || !['accepted', 'rejected'].includes(status))
    return next(new CustomError('Invalid status or missing required fields.', 400))

  const rideRequest = await RideRequest.findById(rideRequestId)
  if (!rideRequest)
    return next(new CustomError(`No Ride Request for this id ${rideRequestId}`, 404))

  if (status === 'rejected') {
    rideRequest.rideRequestStatus = 'rejected'
    await rideRequest.save()
    return res.status(200).json({ message: 'Ride request rejected.' })
  }
  //Calc Distance using geolib
  const distance = geolib.getDistance(
    rideRequest.pickupLocation.coordinates,
    rideRequest.dropoffLocation.coordinates
  ) / 1000  // Convert meters to kilometers


  // If accepted, Mark the driver as no available, create a trip
  req.driver.isAvailable = false;
  await req.driver.save();

  const trip = await Trip.create({
    pickupLocation: rideRequest.pickupLocation,
    dropoffLocation: rideRequest.dropoffLocation,
    fare: 100,  // Default for now
    status: 'ongoing',
    paymentStatus: 'pending',
    paymentMethod: 'cash',  // Default for now
    distance,
    estimatedTime: 15, // Default for now
    driverId: rideRequest.driverId,
    userId: rideRequest.userId,
  })

  rideRequest.rideRequestStatus = 'accepted'
  rideRequest.driverId = trip.driverId
  await rideRequest.save()

  return res.status(200).json({ message: 'Ride request accepted.', trip })
}

/**
 * @description Retrieve all trips and return them with their count
 * @route GET /ride-request/trips
 * @access Private/Admin
 */
const getTrips = async (req, res, next) => {
  const trips = await Trip.find({})
  res.status(200).json({
    count: trips.length,
    data: trips,
  })
}


/**
 * @description Retrieve a specific trip by ID
 * @route GET /ride-request/trips/:id
 * @access Private/Admin
 */
const getTrip = async (req, res, next) => {
  const trip = await Trip.findById(req.params.id)
  if (!trip)
    return next(new CustomError(`No document for this id ${req.params.id}`, 404))

  res.status(200).json({ data: trip })
}

/**
 * @description Update a specific trip as completed
 * @route PUT /ride-request/trips/:id
 */
const updateTripToComplete = async (req, res, next) => {
  const trip = await Trip.findByIdAndUpdate(req.params.id, {
    status: 'completed',
  }, { new: true })
  if (!trip)
    return next(new CustomError(`No document for this id ${req.params.id}`, 404))

  res.status(200).json({ message: 'Trip completed.', trip })
}

module.exports = {
  createRideRequest,
  respondToRideRequest,
  getRideRequests,
  getTrips,
  getTrip,
  updateTripToComplete,

}