const httpStatus = require('http-status');
const { randomUUID } = require('crypto');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');
const { sanitizeAppointment, sanitizePaginatedResults } = require('../utils/sanitizeResponse');

const { appointmentService, userService, serviceService } = require('../services');
const { sendAppointmentNotificationToUser, sendAppointmentNotificationToBarber } = require('./notification.controller');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const removeUndefined = (object) => {
  const sanitized = { ...object };
  Object.keys(sanitized).forEach((key) => {
    if (sanitized[key] === undefined) {
      delete sanitized[key];
    }
  });

  return sanitized;
};

const splitGuestName = (name) => {
  const [firstName, ...rest] = String(name || '')
    .trim()
    .split(/\s+/);
  return {
    firstName: firstName || 'Cliente',
    lastName: rest.join(' ') || '-',
  };
};

const APPOINTMENT_CREATE_FIELDS = [
  'preferredHairdresserId',
  'preferredHairdresser',
  'barberId',
  'serviceCategoryId',
  'serviceCategory',
  'serviceTypeId',
  'serviceType',
  'serviceId',
  'additionalNotes',
  'appointmentDateTime',
  'datetimeStart',
  'drinks',
  'drinkIds',
];

const ADMIN_APPOINTMENT_UPDATE_FIELDS = [
  'firstName',
  'lastName',
  'contactNumber',
  'email',
  'preferredHairdresserId',
  'preferredHairdresser',
  'barberId',
  'serviceCategoryId',
  'serviceCategory',
  'serviceTypeId',
  'serviceType',
  'serviceId',
  'additionalNotes',
  'appointmentDateTime',
  'datetimeStart',
  'status',
  'drinks',
  'drinkIds',
];

const BARBER_APPOINTMENT_UPDATE_FIELDS = ['status', 'additionalNotes'];
const CUSTOMER_APPOINTMENT_UPDATE_FIELDS = ['status', 'additionalNotes'];

const assertCanAccessAppointment = (appointment, user) => {
  if (appointment.userId === user.id || appointment.preferredHairdresserId === user.id) {
    return;
  }

  throw new ApiError(httpStatus.FORBIDDEN, 'Acesso negado');
};

const assertCanManageAppointmentPayment = (appointment, user) => {
  if (appointment.preferredHairdresserId === user.id) {
    return;
  }

  throw new ApiError(httpStatus.FORBIDDEN, 'Acesso negado');
};

const scopeAppointmentFilter = (filter, user) => {
  if (user.role === 'barber') {
    return {
      ...filter,
      preferredHairdresserId: user.id,
      preferredHairdresser: undefined,
      userId: undefined,
    };
  }

  return {
    ...filter,
    userId: user.id,
    preferredHairdresserId: undefined,
    preferredHairdresser: undefined,
  };
};

const getCreateAppointmentPayload = (req) => {
  const basePayload = pick(req.body, APPOINTMENT_CREATE_FIELDS);

  if (req.user.role === 'admin') {
    return {
      ...basePayload,
      userId: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      contactNumber: req.user.contactNumber,
      status: 'Upcoming',
    };
  }

  return {
    ...basePayload,
    userId: req.user.id,
    email: req.user.email,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    contactNumber: req.user.contactNumber,
    status: 'Upcoming',
  };
};

const getUpdateAppointmentPayload = (req) => {
  if (req.user.role === 'admin') {
    return pick(req.body, ADMIN_APPOINTMENT_UPDATE_FIELDS);
  }

  if (req.user.role === 'barber') {
    return pick(req.body, BARBER_APPOINTMENT_UPDATE_FIELDS);
  }

  const payload = pick(req.body, CUSTOMER_APPOINTMENT_UPDATE_FIELDS);

  if (payload.status && payload.status !== 'Cancelled') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Clientes so podem cancelar o proprio agendamento');
  }

  return payload;
};

const getGuestIdentity = async ({ guestName, guestPhone, email }) => {
  const normalizedEmail = email ? String(email).trim().toLowerCase() : '';
  const parsedName = splitGuestName(guestName);

  if (normalizedEmail) {
    const existingUser = await userService.getUserByEmail(normalizedEmail);
    if (existingUser) {
      return {
        userId: existingUser.id,
        email: normalizedEmail,
        firstName: parsedName.firstName,
        lastName: parsedName.lastName,
        contactNumber: guestPhone,
      };
    }
  }

  const fallbackEmail = normalizedEmail || `guest-${Date.now()}-${Math.floor(Math.random() * 10000)}@barberpro.local`;
  const generatedPassword = `Guest${randomUUID().replace(/-/g, '').slice(0, 10)}1`;

  const createdGuest = await userService.createUser({
    firstName: parsedName.firstName,
    lastName: parsedName.lastName,
    contactNumber: guestPhone,
    email: fallbackEmail,
    password: generatedPassword,
    role: 'customer',
  });

  return {
    userId: createdGuest.id,
    email: normalizedEmail || createdGuest.email,
    firstName: parsedName.firstName,
    lastName: parsedName.lastName,
    contactNumber: guestPhone,
  };
};

const createAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.createAppointment(removeUndefined(getCreateAppointmentPayload(req)));

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

  res.status(httpStatus.CREATED).send(sanitizeAppointment(appointment));
});

const createPublicAppointment = catchAsync(async (req, res) => {
  const {
    barberId,
    serviceId,
    serviceName,
    servicePrice,
    serviceDurationMinutes,
    datetimeStart,
    guestName,
    guestPhone,
    email,
    additionalNotes,
  } = req.body;

  const barber = await userService.getUserById(barberId);
  if (barber.role !== 'barber') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Profissional inválido para agendamento');
  }

  let resolvedService = null;
  if (serviceId && UUID_REGEX.test(serviceId)) {
    resolvedService = await serviceService.getServiceById(serviceId);

    if (resolvedService && resolvedService.barberId && resolvedService.barberId !== barberId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Serviço não pertence ao profissional selecionado');
    }
  }

  if (!resolvedService && serviceName) {
    resolvedService = await serviceService.findOrCreatePublicService({
      title: serviceName,
      price: servicePrice,
      durationMinutes: serviceDurationMinutes,
      barberId,
    });
  }

  const service = resolvedService;
  if (!service) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Serviço não encontrado');
  }

  const guestIdentity = await getGuestIdentity({ guestName, guestPhone, email });

  const appointment = await appointmentService.createAppointment({
    ...guestIdentity,
    barberId,
    serviceId: service.id,
    serviceCategoryId: service.categoryId,
    datetimeStart,
    additionalNotes,
    status: 'Upcoming',
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

  if (req.user && req.user.role !== 'admin') {
    if (req.user.role === 'barber') {
      filter.preferredHairdresserId = req.user.id;
    } else {
      filter.userId = req.user.id;
    }
  }

  const options = pick(req.query, ['sortBy', 'populate', 'page', 'limit']);

  const scopedFilter = scopeAppointmentFilter(filter, req.user);
  const result = await appointmentService.queryAppointments(scopedFilter, options);
  res.send(sanitizePaginatedResults(result, sanitizeAppointment));
});

const getAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(req.params.appointmentId);
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Agendamento não encontrado');
  }
  assertCanAccessAppointment(appointment, req.user);
  res.send(sanitizeAppointment(appointment));
});

const updateAppointment = catchAsync(async (req, res) => {
  const existingAppointment = await appointmentService.getAppointmentById(req.params.appointmentId);
  if (!existingAppointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Agendamento não encontrado');
  }

  assertCanAccessAppointment(existingAppointment, req.user);

  const payload = getUpdateAppointmentPayload(req);
  if (Object.keys(payload).length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Nenhum campo permitido para atualizacao foi enviado');
  }

  const appointment = await appointmentService.updateAppointmentById(req.params.appointmentId, payload);

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

  res.send(sanitizeAppointment(appointment));
});

const deleteAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(req.params.appointmentId);
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Agendamento não encontrado');
  }

  assertCanAccessAppointment(appointment, req.user);
  await appointmentService.deleteAppointmentById(req.params.appointmentId);
  res.status(httpStatus.NO_CONTENT).send();
});

const payAppointment = catchAsync(async (req, res) => {
  const existingAppointment = await appointmentService.getAppointmentById(req.params.appointmentId);
  if (!existingAppointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Agendamento não encontrado');
  }

  assertCanManageAppointmentPayment(existingAppointment, req.user);
  const appointment = await appointmentService.payAppointmentById(req.params.appointmentId);
  res.send(sanitizeAppointment(appointment));
});

const getWhatsappLink = catchAsync(async (req, res) => {
  const link = await appointmentService.getWhatsappLinkForAppointment(req.params.appointmentId);
  res.send({ link });
});

module.exports = {
  createAppointment,
  createPublicAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  payAppointment,
  getWhatsappLink,
};
