const prisma = require('../client');

const createServiceCategory = async (serviceCategoryBody) => {
  return prisma.serviceCategory.create({
    data: serviceCategoryBody
  });
};

const getServiceCategories = async (filter, options) => {
  const { limit = 10, page = 1, sortBy } = options;
  const skip = (page - 1) * limit;

  return prisma.serviceCategory.findMany({
    where: filter,
    take: limit,
    skip,
  });
};

const getServiceCategoryById = async (id) => {
  return prisma.serviceCategory.findUnique({
    where: { id }
  });
};

const updateServiceCategoryById = async (categoryId, updateBody) => {
  return prisma.serviceCategory.update({
    where: { id: categoryId },
    data: updateBody
  });
};

const deleteServiceCategoryById = async (categoryId) => {
  // Check if there are any services associated with this category
  const associatedServices = await prisma.service.count({
    where: { categoryId: categoryId }
  });

  if (associatedServices > 0) {
    throw new Error('Cannot delete service category with associated services. Please delete the services first.');
  }

  return prisma.serviceCategory.delete({
    where: { id: categoryId }
  });
};

module.exports = {
  createServiceCategory,
  getServiceCategories,
  getServiceCategoryById,
  updateServiceCategoryById,
  deleteServiceCategoryById,
};
