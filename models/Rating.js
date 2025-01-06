const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
});



const Rating = mongoose.model('Rating', ratingSchema);
module.exports = Rating;