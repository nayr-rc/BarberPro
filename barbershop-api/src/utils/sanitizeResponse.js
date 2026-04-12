const omitFields = (record, fields) => {
  if (!record || typeof record !== 'object') {
    return record;
  }

  const sanitized = { ...record };
  fields.forEach((field) => {
    if (field in sanitized) {
      delete sanitized[field];
    }
  });

  return sanitized;
};

const sanitizeUser = (user) => {
  return omitFields(user, ['password', 'pushSubscription']);
};

const sanitizeAppointment = (appointment) => {
  if (!appointment) {
    return appointment;
  }

  return {
    ...appointment,
    user: sanitizeUser(appointment.user),
    preferredHairdresser: sanitizeUser(appointment.preferredHairdresser),
  };
};

const sanitizeReview = (review) => {
  if (!review) {
    return review;
  }

  return {
    ...review,
    user: sanitizeUser(review.user),
    barber: sanitizeUser(review.barber),
    appointment: sanitizeAppointment(review.appointment),
  };
};

const sanitizeService = (service) => {
  if (!service) {
    return service;
  }

  return {
    ...service,
    barber: sanitizeUser(service.barber),
  };
};

const sanitizePaginatedResults = (payload, sanitizer) => {
  if (!payload || !Array.isArray(payload.results)) {
    return payload;
  }

  return {
    ...payload,
    results: payload.results.map((entry) => sanitizer(entry)),
  };
};

module.exports = {
  sanitizeUser,
  sanitizeAppointment,
  sanitizeReview,
  sanitizeService,
  sanitizePaginatedResults,
};
