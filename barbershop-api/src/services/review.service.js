const prisma = require('../client');

const createReview = async (reviewBody) => {
  const { serviceType, ...data } = reviewBody;

  return prisma.review.create({
    data: {
      ...data,
      serviceTypeId: data.serviceTypeId || serviceType,
    },
  });
};

const getReviews = async (filter, options) => {
  const { limit = 10, page = 1, sortBy, populate } = options;
  const skip = (page - 1) * limit;
  const whereFilter = {
    ...filter,
    serviceTypeId: filter.serviceTypeId || filter.serviceType,
  };

  delete whereFilter.serviceType;
  if (!whereFilter.serviceTypeId) {
    delete whereFilter.serviceTypeId;
  }

  const include = {};
  if (populate) {
    populate.split(',').forEach((p) => {
      const field = p.trim();
      if (field === 'user') include.user = true;
      if (field === 'barber') include.barber = true;
      if (field === 'serviceType') include.serviceType = true;
      if (field === 'appointment') include.appointment = true;
    });
  }

  const orderBy = {};
  if (sortBy) {
    const [field, order] = sortBy.split(':');
    orderBy[field] = order || 'asc';
  }

  const results = await prisma.review.findMany({
    where: whereFilter,
    take: limit,
    skip,
    orderBy: Object.keys(orderBy).length ? orderBy : undefined,
    include: Object.keys(include).length > 0 ? include : undefined,
  });

  const totalResults = await prisma.review.count({ where: whereFilter });
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

const getReviewById = async (id) => {
  return prisma.review.findUnique({
    where: { id },
    include: {
      user: true,
      barber: true,
      serviceType: true,
      appointment: true,
    },
  });
};

const updateReviewById = async (reviewId, updateBody) => {
  const { serviceType, ...data } = updateBody;

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      ...data,
      ...(data.serviceTypeId || serviceType ? { serviceTypeId: data.serviceTypeId || serviceType } : {}),
    },
  });
};

const deleteReviewById = async (reviewId) => {
  return prisma.review.delete({
    where: { id: reviewId },
  });
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReviewById,
  deleteReviewById,
};
