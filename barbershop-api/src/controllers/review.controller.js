const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const { reviewService } = require('../services');
const { sanitizeReview, sanitizePaginatedResults } = require('../utils/sanitizeResponse');

const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview({
    ...req.body,
    // Fix: Never trust frontend for identity, always use token user ID unless admin
    userId: req.user.role === 'admin' ? req.body.userId || req.user.id : req.user.id,
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
  res.status(httpStatus.OK).send(sanitizePaginatedResults(reviews, sanitizeReview));
});

const getReview = catchAsync(async (req, res) => {
  const review = await reviewService.getReviewById(req.params.reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  res.status(httpStatus.OK).send(sanitizeReview(review));
});

const updateReview = catchAsync(async (req, res) => {
  const existingReview = await reviewService.getReviewById(req.params.reviewId);
  if (!existingReview) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  if (req.user && req.user.role !== 'admin' && existingReview.userId !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Você não tem permissão para alterar esta avaliação');
  }

  const review = await reviewService.updateReviewById(req.params.reviewId, req.body);
  res.status(httpStatus.OK).send(sanitizeReview(review));
});

const deleteReview = catchAsync(async (req, res) => {
  const existingReview = await reviewService.getReviewById(req.params.reviewId);
  if (!existingReview) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  if (req.user && req.user.role !== 'admin' && existingReview.userId !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Você não tem permissão para deletar esta avaliação');
  }

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
