const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const prisma = require('../client');

const splitName = (name) => {
  if (!name || typeof name !== 'string') {
    return { firstName: undefined, lastName: undefined };
  }

  const [firstName, ...rest] = name.trim().split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' ') || '-',
  };
};

const normalizeAppointmentFilter = (filter = {}) => {
  const normalizedFilter = {
    ...filter,
    preferredHairdresserId: filter.preferredHairdresserId || filter.preferredHairdresser,
    serviceCategoryId: filter.serviceCategoryId || filter.serviceCategory,
    serviceTypeId: filter.serviceTypeId || filter.serviceType,
  };

  delete normalizedFilter.preferredHairdresser;
  delete normalizedFilter.serviceCategory;
  delete normalizedFilter.serviceType;

  Object.keys(normalizedFilter).forEach((key) => {
    if (normalizedFilter[key] === undefined) {
      delete normalizedFilter[key];
    }
  });

  return normalizedFilter;
};

const normalizeAppointmentPayload = async (appointmentBody) => {
  const {
    preferredHairdresser,
    preferredHairdresserId,
    barberId,
    serviceCategory,
    serviceCategoryId,
    serviceType,
    serviceTypeId,
    serviceId,
    guestName,
    guestPhone,
    datetimeStart,
    drinkIds,
    drinks,
    ...rest
  } = appointmentBody;

  const namesFromGuest = splitName(guestName);

  const normalizedPayload = {
    ...rest,
    firstName: rest.firstName || namesFromGuest.firstName,
    lastName: rest.lastName || namesFromGuest.lastName,
    contactNumber: rest.contactNumber || guestPhone,
    preferredHairdresserId: preferredHairdresserId || preferredHairdresser || barberId,
    serviceCategoryId: serviceCategoryId || serviceCategory,
    serviceTypeId: serviceTypeId || serviceType || serviceId,
    appointmentDateTime: rest.appointmentDateTime || datetimeStart,
    drinks: drinks || drinkIds,
  };

  if (!normalizedPayload.serviceCategoryId && normalizedPayload.serviceTypeId) {
    const relatedService = await prisma.service.findUnique({
      where: { id: normalizedPayload.serviceTypeId },
      select: { categoryId: true },
    });

    if (relatedService) {
      normalizedPayload.serviceCategoryId = relatedService.categoryId;
    }
  }

  return normalizedPayload;
};

const assertRequiredCreateFields = (appointmentBody) => {
  const requiredFields = [
    'firstName',
    'lastName',
    'contactNumber',
    'email',
    'userId',
    'preferredHairdresserId',
    'serviceCategoryId',
    'serviceTypeId',
    'appointmentDateTime',
  ];

  const missingFields = requiredFields.filter((field) => !appointmentBody[field]);

  if (missingFields.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Missing required appointment fields: ${missingFields.join(', ')}`);
  }
};

/**
 * Create an appointment
 * @param {Object} appointmentBody
 * @returns {Promise<Object>}
 */
const createAppointment = async (appointmentBody) => {
  const normalizedPayload = await normalizeAppointmentPayload(appointmentBody);
  assertRequiredCreateFields(normalizedPayload);
  const { drinks: drinkIds, ...data } = normalizedPayload;

  return prisma.appointment.create({
    data: {
      ...data,
      drinks: drinkIds
        ? {
            connect: drinkIds.map((id) => ({ id })),
          }
        : undefined,
    },
  });
};

/**
 * Query for appointments
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<Object>}
 */
const queryAppointments = async (filter, options = {}) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const { sortBy, populate } = options;
  const skip = (page - 1) * limit;
  const whereFilter = normalizeAppointmentFilter(filter);

  let include = {};
  if (populate) {
    populate.split(',').forEach((p) => {
      const field = p.trim();
      if (field === 'preferredHairdresser') include.preferredHairdresser = true;
      if (field === 'serviceCategory') include.serviceCategory = true;
      if (field === 'serviceType') include.serviceType = true;
      if (field === 'drinks') include.drinks = true;
      if (field === 'user') include.user = true;
    });
  }

  let orderBy = {};
  if (sortBy) {
    const [field, order] = sortBy.split(':');
    orderBy[field] = order || 'asc';
  } else {
    orderBy = { appointmentDateTime: 'asc' };
  }

  const results = await prisma.appointment.findMany({
    where: whereFilter,
    take: limit,
    skip,
    orderBy,
    include: Object.keys(include).length > 0 ? include : undefined,
  });

  const totalResults = await prisma.appointment.count({ where: whereFilter });
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Get appointment by id
 * @param {string} id
 * @returns {Promise<Object>}
 */
const getAppointmentById = async (id) => {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      preferredHairdresser: true,
      serviceCategory: true,
      serviceType: true,
      drinks: true,
      user: true
    }
  });
};

/**
 * Update appointment by id
 * @param {string} appointmentId
 * @param {Object} updateBody
 * @returns {Promise<Object>}
 */
const updateAppointmentById = async (appointmentId, updateBody) => {
  const appointment = await getAppointmentById(appointmentId);
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  }

  const normalizedPayload = await normalizeAppointmentPayload(updateBody);
  const { drinks: drinkIds, ...data } = normalizedPayload;

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      ...data,
      drinks: drinkIds
        ? {
            set: drinkIds.map((id) => ({ id })),
          }
        : undefined,
    },
  });
};

/**
 * Delete appointment by id
 * @param {string} appointmentId
 * @returns {Promise<Object>}
 */
const deleteAppointmentById = async (appointmentId) => {
  const appointment = await getAppointmentById(appointmentId);
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  }
  await prisma.appointment.delete({
    where: { id: appointmentId }
  });
  return appointment;
};

/**
 * Pay appointment by id
 * @param {string} appointmentId
 * @returns {Promise<Object>}
 */
const payAppointmentById = async (appointmentId) => {
  const appointment = await getAppointmentById(appointmentId);
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  }
  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { paymentStatus: 'Paid' },
  });
};

module.exports = {
  createAppointment,
  queryAppointments,
  getAppointmentById,
  updateAppointmentById,
  deleteAppointmentById,
  payAppointmentById,
};
