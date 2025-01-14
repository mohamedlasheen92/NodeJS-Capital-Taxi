const mongoose = require("mongoose");
const Driver = require("./Driver");

const reviewSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true,
  },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
});

reviewSchema.statics.calcReviewStatistics = async function (driverId) {
  const result = await this.aggregate([
    { $match: { driverId: driverId } },
    { $group: { _id: "$driverId", ratingsAverage: { $avg: "$rating" }, ratingsQuantity: { $sum: 1 } } },
  ])

  console.log(result);

  if (result.length > 0) {
    await Driver.findByIdAndUpdate(driverId, {
      ratingsAverage: result[0].ratingsAverage,
      ratingsQuantity: result[0].ratingsQuantity,
    })
  } else {
    await Driver.findByIdAndUpdate(driverId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
    })
  }
}

reviewSchema.post('save', async function (doc) {
  await this.constructor.calcReviewStatistics(doc.driverId)
})
// reviewSchema.post('findOneAndDelete', async (doc) => {
//   doc.constructor.calcReviewStatistics(doc.driverId)
// })


const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;