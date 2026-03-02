const prisma = require('../client');

const createReview = async (reviewBody) => {
  return prisma.review.create({
    data: reviewBody
  });
};

const getReviews = async (filter, options) => {
  const { limit = 10, page = 1, sortBy, populate } = options;
  const skip = (page - 1) * limit;

  let include = {};
  if (populate) {
    populate.split(' ').forEach(p => {
      if (p === 'userId') include.user = true;
      if (p === 'barberId') include.barber = true;
      if (p === 'serviceType') include.serviceType = true;
      if (p === 'appointmentId') include.appointment = true;
    });
  }

  return prisma.review.findMany({
    where: filter,
    take: limit,
    skip,
    include: Object.keys(include).length > 0 ? include : undefined,
  });
};

const getReviewById = async (id) => {
  return prisma.review.findUnique({
    where: { id },
    include: {
      user: true,
      barber: true,
      serviceType: true,
      appointment: true,
    }
  });
};

const updateReviewById = async (reviewId, updateBody) => {
  return prisma.review.update({
    where: { id: reviewId },
    data: updateBody
  });
};

const deleteReviewById = async (reviewId) => {
  return prisma.review.delete({
    where: { id: reviewId }
  });
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReviewById,
  deleteReviewById,
};
