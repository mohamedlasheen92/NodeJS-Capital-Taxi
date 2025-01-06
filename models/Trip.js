const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  pickupLocation: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  dropoffLocation: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  fare: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "ongoing", "completed"],
    required: true,
  },
  requestedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  paymentStatus: { type: String, enum: ["pending", "paid"], required: true },
  paymentMethod: {
    type: String,
    enum: ["cash", "credit_card"],
    required: true,
  },
  distance: { type: Number, required: true },
  estimatedTime: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
});

tripSchema.index({ pickupLocation: "2dsphere" });
tripSchema.index({ dropoffLocation: "2dsphere" });

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;