const prisma = require('../client');

const getOrCreateDefaultCategory = async () => {
  let defaultCategory = await prisma.serviceCategory.findFirst({
    where: { name: 'Geral' },
  });

  if (!defaultCategory) {
    defaultCategory = await prisma.serviceCategory.create({
      data: { name: 'Geral' },
    });
  }

  return defaultCategory;
};

const createService = async (serviceBody) => {
  const { category, categoryId, barberId, ...data } = serviceBody;
  let resolvedCategoryId = categoryId || category;

  if (!resolvedCategoryId) {
    const defaultCategory = await getOrCreateDefaultCategory();
    resolvedCategoryId = defaultCategory.id;
  }

  return prisma.service.create({
    data: {
      ...data,
      category: {
        connect: { id: resolvedCategoryId },
      },
      ...(barberId ? { barber: { connect: { id: barberId } } } : {}),
    },
  });
};

const getServices = async (filter, options) => {
  const { limit = 10, page = 1, sortBy, populate } = options;
  const skip = (page - 1) * limit;
  const whereFilter = {
    ...filter,
    categoryId: filter.categoryId || filter.category,
    barberId: filter.barberId,
  };

  delete whereFilter.category;
  if (!whereFilter.categoryId) {
    delete whereFilter.categoryId;
  }

  const include = {};
  if (populate === 'category') include.category = true;
  if (populate === 'barber') include.barber = true;
  if (populate === 'category,barber' || populate === 'barber,category') {
    include.category = true;
    include.barber = true;
  }

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
  const { category, categoryId, barberId, ...data } = updateBody;
  const resolvedCategoryId = categoryId || category;

  let barberRelationUpdate = {};
  if (barberId !== undefined) {
    barberRelationUpdate = barberId ? { barber: { connect: { id: barberId } } } : { barber: { disconnect: true } };
  }

  return prisma.service.update({
    where: { id: serviceId },
    data: {
      ...data,
      ...(resolvedCategoryId ? { category: { connect: { id: resolvedCategoryId } } } : {}),
      ...barberRelationUpdate,
    },
  });
};

const deleteServiceById = async (serviceId) => {
  return prisma.service.delete({
    where: { id: serviceId },
  });
};

const findOrCreatePublicService = async ({ title, price = 0, durationMinutes = 30, barberId = null }) => {
  const normalizedTitle = String(title || '').trim();
  if (!normalizedTitle) {
    return null;
  }

  const existingService = await prisma.service.findFirst({
    where: {
      title: normalizedTitle,
      barberId,
    },
  });

  if (existingService) {
    return existingService;
  }

  const defaultCategory = await getOrCreateDefaultCategory();

  return prisma.service.create({
    data: {
      title: normalizedTitle,
      description: 'Serviço criado automaticamente para agendamento público',
      price: Number(price) || 0,
      durationMinutes: Number(durationMinutes) || 30,
      category: {
        connect: { id: defaultCategory.id },
      },
      ...(barberId ? { barber: { connect: { id: barberId } } } : {}),
    },
  });
};

module.exports = {
  createService,
  getServices,
  getServiceById,
  updateServiceById,
  deleteServiceById,
  findOrCreatePublicService,
};
