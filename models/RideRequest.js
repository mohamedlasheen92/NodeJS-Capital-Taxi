const mongoose = require('mongoose');

const rideRequestSchema = new mongoose.Schema({
  pickupLocation: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  dropoffLocation: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  requestedAt: { type: Date, default: Date.now },
  rideRequestStatus: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
});


rideRequestSchema.index({ pickupLocation: "2dsphere" });
rideRequestSchema.index({ dropoffLocation: "2dsphere" });



const RideRequest = mongoose.model('RideRequest', rideRequestSchema);
module.exports = RideRequest;