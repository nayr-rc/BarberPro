const httpStatus = require('http-status');
const prisma = require('../client');
const ApiError = require('../utils/ApiError');

const createServiceCategory = async (serviceCategoryBody) => {
  return prisma.serviceCategory.create({
    data: serviceCategoryBody,
  });
};

const getServiceCategories = async (filter, options) => {
  const { limit = 10, page = 1, sortBy } = options;
  const skip = (page - 1) * limit;

  const orderBy = {};
  if (sortBy) {
    const [field, order] = sortBy.split(':');
    orderBy[field] = order || 'asc';
  }

  const results = await prisma.serviceCategory.findMany({
    where: filter,
    take: limit,
    skip,
    orderBy: Object.keys(orderBy).length ? orderBy : undefined,
  });

  const totalResults = await prisma.serviceCategory.count({ where: filter });
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

const getServiceCategoryById = async (id) => {
  return prisma.serviceCategory.findUnique({
    where: { id },
  });
};

const updateServiceCategoryById = async (categoryId, updateBody) => {
  return prisma.serviceCategory.update({
    where: { id: categoryId },
    data: updateBody,
  });
};

const deleteServiceCategoryById = async (categoryId) => {
  // Check if there are any services associated with this category
  const associatedServices = await prisma.service.count({
    where: { categoryId },
  });

  if (associatedServices > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete service category with associated services. Please delete the services first.'
    );
  }

  return prisma.serviceCategory.delete({
    where: { id: categoryId },
  });
};

module.exports = {
  createServiceCategory,
  getServiceCategories,
  getServiceCategoryById,
  updateServiceCategoryById,
  deleteServiceCategoryById,
};
