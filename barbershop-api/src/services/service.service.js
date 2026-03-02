const prisma = require('../client');

const createService = async (serviceBody) => {
  const { category, categoryId, ...data } = serviceBody;
  const resolvedCategoryId = categoryId || category;

  return prisma.service.create({
    data: {
      ...data,
      category: {
        connect: { id: resolvedCategoryId },
      },
    },
  });
};

const getServices = async (filter, options) => {
  const { limit = 10, page = 1, sortBy, populate } = options;
  const skip = (page - 1) * limit;
  const whereFilter = {
    ...filter,
    categoryId: filter.categoryId || filter.category,
  };

  delete whereFilter.category;
  if (!whereFilter.categoryId) {
    delete whereFilter.categoryId;
  }

  const include = {};
  if (populate === 'category') include.category = true;

  const orderBy = {};
  if (sortBy) {
    const [field, order] = sortBy.split(':');
    orderBy[field] = order || 'asc';
  }

  const results = await prisma.service.findMany({
    where: whereFilter,
    take: limit,
    skip,
    orderBy: Object.keys(orderBy).length ? orderBy : undefined,
    include: Object.keys(include).length > 0 ? include : undefined,
  });

  const totalResults = await prisma.service.count({ where: whereFilter });
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

const getServiceById = async (id) => {
  return prisma.service.findUnique({
    where: { id },
    include: { category: true },
  });
};

const updateServiceById = async (serviceId, updateBody) => {
  const { category, categoryId, ...data } = updateBody;
  const resolvedCategoryId = categoryId || category;

  return prisma.service.update({
    where: { id: serviceId },
    data: {
      ...data,
      ...(resolvedCategoryId ? { categoryId: resolvedCategoryId } : {}),
    },
  });
};

const deleteServiceById = async (serviceId) => {
  return prisma.service.delete({
    where: { id: serviceId },
  });
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateServiceById,
  deleteServiceById,
};
