const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const { reviewService } = require('../services');

const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview({
    ...req.body,
    serviceTypeId: req.body.serviceTypeId || req.body.serviceType,
  });
  res.status(httpStatus.CREATED).send(review);
});

const getReviews = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'userId',
    'barberId',
    'serviceTypeId',
    'serviceType',
    'appointmentId',
    'name',
    'rating',
    'title',
    'text',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const reviews = await reviewService.getReviews(filter, options);
  res.status(httpStatus.OK).send(reviews);
});

const getReview = catchAsync(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  res.status(httpStatus.OK).send(review);
});

const updateReview = catchAsync(async (req, res) => {
  const review = await reviewService.updateReviewById(req.params.reviewId, req.body);
  res.status(httpStatus.OK).send(review);
});

const deleteReview = catchAsync(async (req, res) => {
  await reviewService.deleteReviewById(req.params.reviewId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
};
