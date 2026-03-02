const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

const { appointmentService, userService, serviceService } = require('../services');
const { sendAppointmentNotificationToUser, sendAppointmentNotificationToBarber } = require('./notification.controller');

const removeUndefined = (object) => {
  const sanitized = { ...object };
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });

  return sanitized;
};

const createAppointment = catchAsync(async (req, res) => {
  const userPayload = {
    userId: req.body.userId || req.user.id,
    email: req.body.email || req.user.email,
    firstName: req.body.firstName || req.user.firstName,
    lastName: req.body.lastName || req.user.lastName,
    contactNumber: req.body.contactNumber || req.user.contactNumber,
  };

  const appointment = await appointmentService.createAppointment(removeUndefined({ ...req.body, ...userPayload }));

  const barberDetails = await userService.getUserById(appointment.preferredHairdresserId);
  const serviceDetails = await serviceService.getServiceById(appointment.serviceTypeId);

  await sendAppointmentNotificationToUser({
    userId: appointment.userId,
    type: 'confirmed',
    appointmentDetails: appointment,
    barberDetails,
    serviceDetails,
    notificationType: 'confirmation',
  });

  // Notify the barber
  await sendAppointmentNotificationToBarber({
    barberId: appointment.preferredHairdresserId,
    type: 'new',
    appointmentDetails: appointment,
    userDetails: req.user,
    serviceDetails,
    notificationType: 'new_appointment',
  });

  res.status(httpStatus.CREATED).send(appointment);
});

const getAppointments = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'userId',
    'preferredHairdresserId',
    'preferredHairdresser',
    'serviceCategoryId',
    'serviceCategory',
    'serviceTypeId',
    'serviceType',
    'status',
    'paymentStatus',
  ]);
  const options = pick(req.query, ['sortBy', 'populate', 'page', 'limit']);

  const result = await appointmentService.queryAppointments(filter, options);
  res.send(result);
});

const getAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(req.params.appointmentId);
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  }
  res.send(appointment);
});

const updateAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.updateAppointmentById(req.params.appointmentId, req.body);

  const barberDetails = await userService.getUserById(appointment.preferredHairdresserId);
  const serviceDetails = await serviceService.getServiceById(appointment.serviceTypeId);

  let notificationType = 'update';
  let type = 'updated';

  if (req.body.status === 'Cancelled') {
    notificationType = 'cancellation';
    type = 'cancelled';
  } else if (req.body.status === 'Past') {
    notificationType = 'feedback';
    type = 'feedback';
  }

  const isUserAction = req.user.id === appointment.userId;

  // Notify the user
  await sendAppointmentNotificationToUser({
    userId: appointment.userId,
    type,
    appointmentDetails: appointment,
    barberDetails,
    serviceDetails,
    notificationType,
  });

  // Notify the barber
  await sendAppointmentNotificationToBarber({
    barberId: appointment.preferredHairdresserId,
    type: isUserAction ? 'user_updated' : 'barber_updated',
    appointmentDetails: appointment,
    userDetails: req.user,
    serviceDetails,
    notificationType: 'appointment_updated',
  });

  res.send(appointment);
});

const deleteAppointment = catchAsync(async (req, res) => {
  await appointmentService.deleteAppointmentById(req.params.appointmentId);
  res.status(httpStatus.NO_CONTENT).send();
});

const payAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.payAppointmentById(req.params.appointmentId);
  res.send(appointment);
});

module.exports = {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  payAppointment,
};
