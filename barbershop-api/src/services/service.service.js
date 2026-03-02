const prisma = require('../client');

const createService = async (serviceBody) => {
  const { category, ...data } = serviceBody;
  return prisma.service.create({
    data: {
      ...data,
      category: {
        connect: { id: category }
      }
    }
  });
};

const getServices = async (filter, options) => {
  const { limit = 10, page = 1, sortBy, populate } = options;
  const skip = (page - 1) * limit;

  let include = {};
  if (populate === 'category') include.category = true;

  return prisma.service.findMany({
    where: filter,
    take: limit,
    skip,
    include: Object.keys(include).length > 0 ? include : undefined,
  });
};

const getServiceById = async (id) => {
  return prisma.service.findUnique({
    where: { id },
    include: { category: true }
  });
};

const updateServiceById = async (serviceId, updateBody) => {
  return prisma.service.update({
    where: { id: serviceId },
    data: updateBody
  });
};

const deleteServiceById = async (serviceId) => {
  return prisma.service.delete({
    where: { id: serviceId }
  });
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateServiceById,
  deleteServiceById,
};
