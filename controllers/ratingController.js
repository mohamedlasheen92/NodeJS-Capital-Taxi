const Review = require("../models/Review")
const CustomError = require("../utils/customError")

const setIdsToFilterObj = (req, res, next) => {
  let filterObj = {};
  if (req.body.driverId)
    filterObj.driverId = req.body.driverId;

  if (req.body.riderId)
    filterObj.riderId = req.body.riderId;

  req.filterObj = filterObj;
  next();
}

/**
 * @description Retrieve all reviews and return them with their count
 * @route GET /reviews
 * @access Public
 */
const getReviews = async (req, res, next) => {
  let filters = {}
  if (req.filterObj) {
    filters = req.filterObj;
  }
  const reviews = await Review.find(req.filterObj)
  res.status(200).json({
    count: reviews.length,
    data: reviews,
  })
}

/**
 * @description Retrieve a single review by its ID
 * @route GET /reviews/:id
 * @access Public
 */
const getReview = async (req, res, next) => {
  const { id } = req.params.id;
  const review = await Review.findById(id);
  if (!review)
    return next(new CustomError(`No Review found with id ${id}`), 404);

  res.status(200).json({
    data: review,
  });
}

/**
 * @description Create a new review and return the created review
 * @route POST /reviews
 * @access Public
 */
const createReview = async (req, res, next) => {
  const newReview = await Review.create(req.body)
  res.status(201).json({
    data: newReview,
  });
}

/**
 * @description Update a review by its ID and return the updated review
 * @route PUT /reviews/:id
 * @access Public
 */
const updateReview = async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findOneAndUpdate(
    { _id: id },
    req.body,
    { new: true }
  );

  // Trigger "save" event when update review
  review.save()

  if (!review)
    return next(new ApiError(`No review with Id ${id}`, 404));

  res.status(200).json({ data: review });

}

/**
 * @description Delete a review by its ID
 * @route DELETE /reviews/:id
 * @access Public
 */
const deleteReview = async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findOneAndDelete({ _id: id });
  if (!review)
    return next(new ApiError(`No review with Id ${id}`, 404));

  res.status(204).send();
}

module.exports = {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
  setIdsToFilterObj,

};
