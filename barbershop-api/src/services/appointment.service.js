const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const prisma = require('../client');

/**
 * Create an appointment
 * @param {Object} appointmentBody
 * @returns {Promise<Object>}
 */
const createAppointment = async (appointmentBody) => {
  const { drinks, ...data } = appointmentBody;

  return prisma.appointment.create({
    data: {
      ...data,
      drinks: drinks ? {
        connect: drinks.map(id => ({ id }))
      } : undefined
    }
  });
};

/**
 * Query for appointments
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<Object>}
 */
const queryAppointments = async (filter, options = {}) => {
  const { limit = 10, page = 1, sortBy, populate } = options;
  const skip = (page - 1) * limit;

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
    where: filter,
    take: limit,
    skip,
    orderBy,
    include: Object.keys(include).length > 0 ? include : undefined,
  });

  const totalResults = await prisma.appointment.count({ where: filter });
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

  const { drinks, ...data } = updateBody;

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      ...data,
      drinks: drinks ? {
        set: drinks.map(id => ({ id }))
      } : undefined
    }
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
    data: { status: 'Paid' }
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
