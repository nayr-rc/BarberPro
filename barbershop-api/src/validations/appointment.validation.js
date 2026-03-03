const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAppointment = {
  body: Joi.object()
    .keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      guestName: Joi.string(),
      contactNumber: Joi.string(),
      guestPhone: Joi.string(),
      email: Joi.string().email(),
      preferredHairdresserId: Joi.string().custom(objectId),
      preferredHairdresser: Joi.string().custom(objectId),
      barberId: Joi.string().custom(objectId),
      serviceCategoryId: Joi.string().custom(objectId),
      serviceCategory: Joi.string().custom(objectId),
      serviceTypeId: Joi.string().custom(objectId),
      serviceType: Joi.string().custom(objectId),
      serviceId: Joi.string().custom(objectId),
      additionalNotes: Joi.string().allow('').optional(),
      userId: Joi.string().custom(objectId),
      appointmentDateTime: Joi.date(),
      datetimeStart: Joi.date(),
      status: Joi.string().valid('Upcoming', 'Past', 'Cancelled').default('Upcoming'),
      paymentStatus: Joi.string().valid('Pending', 'Paid', 'Failed', 'Refunded'),
      drinks: Joi.array().items(Joi.string().custom(objectId)),
      drinkIds: Joi.array().items(Joi.string().custom(objectId)),
    })
    .or('preferredHairdresserId', 'preferredHairdresser', 'barberId')
    .or('serviceTypeId', 'serviceType', 'serviceId')
    .or('appointmentDateTime', 'datetimeStart'),
};

const createPublicAppointment = {
  body: Joi.object().keys({
    barberId: Joi.string().custom(objectId).required(),
    serviceId: Joi.string().custom(objectId).required(),
    datetimeStart: Joi.date().required(),
    guestName: Joi.string().required(),
    guestPhone: Joi.string().required(),
    email: Joi.string().email().allow(''),
    additionalNotes: Joi.string().allow(''),
  }),
};

const updateAppointment = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      firstName: Joi.string(),
      lastName: Joi.string(),
      guestName: Joi.string(),
      contactNumber: Joi.string(),
      guestPhone: Joi.string(),
      email: Joi.string().email(),
      preferredHairdresserId: Joi.string().custom(objectId),
      preferredHairdresser: Joi.string().custom(objectId),
      barberId: Joi.string().custom(objectId),
      serviceCategoryId: Joi.string().custom(objectId),
      serviceCategory: Joi.string().custom(objectId),
      serviceTypeId: Joi.string().custom(objectId),
      serviceType: Joi.string().custom(objectId),
      serviceId: Joi.string().custom(objectId),
      additionalNotes: Joi.string().allow(''),
      userId: Joi.string().custom(objectId),
      appointmentDateTime: Joi.date(),
      datetimeStart: Joi.date(),
      status: Joi.string().valid('Upcoming', 'Past', 'Cancelled'),
      paymentStatus: Joi.string().valid('Pending', 'Paid', 'Failed', 'Refunded'),
      drinks: Joi.array().items(Joi.string().custom(objectId)),
      drinkIds: Joi.array().items(Joi.string().custom(objectId)),
    })
    .min(1),
};

const deleteAppointment = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId),
  }),
};

const getAppointment = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId).required(),
  }),
};

const payAppointment = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId).required(),
  }),
};

const getAppointments = {
  query: Joi.object().keys({
    preferredHairdresserId: Joi.string().custom(objectId),
    preferredHairdresser: Joi.string().custom(objectId),
    serviceCategoryId: Joi.string().custom(objectId),
    serviceCategory: Joi.string().custom(objectId),
    serviceTypeId: Joi.string().custom(objectId),
    serviceType: Joi.string().custom(objectId),
    userId: Joi.string().custom(objectId),
    status: Joi.string().valid('Upcoming', 'Past', 'Cancelled'),
    paymentStatus: Joi.string().valid('Pending', 'Paid', 'Failed', 'Refunded'),
    populate: Joi.string(),
    sortBy: Joi.string(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
  }),
};

module.exports = {
  createAppointment,
  createPublicAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointment,
  payAppointment,
  getAppointments,
};
