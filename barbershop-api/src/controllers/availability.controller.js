const httpStatus = require('http-status');
const { startOfDay, endOfDay, addMinutes, isAfter, isBefore, parseISO } = require('date-fns');
const catchAsync = require('../utils/catchAsync');
const prisma = require('../client');
const ApiError = require('../utils/ApiError');

const getAvailability = catchAsync(async (req, res) => {
  const { barberId, date, serviceId, serviceDurationMinutes } = req.query;
  const selectedDate = date ? parseISO(date) : new Date();

  const barber = await prisma.user.findUnique({
    where: { id: barberId },
  });

  if (!barber || barber.role !== 'barber') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Barbeiro não encontrado');
  }

  // Parse working hours since Prisma stores it as String? for SQLite compatibility
  let parsedWorkingHours = [];
  if (barber.workingHours) {
    try {
      parsedWorkingHours = JSON.parse(barber.workingHours);
    } catch (error) {
      parsedWorkingHours = [];
    }
  }

  // Default or Custom Working Hours
  const dayOfWeek = selectedDate.getDay();
  const config = parsedWorkingHours.find((h) => h.dayId === dayOfWeek);

  // If no config found, or it's closed, return early
  if (config && !config.isOpen) {
    return res.send({
      barber: { id: barber.id, firstName: barber.firstName, lastName: barber.lastName },
      availableSlots: [],
      schedule: parsedWorkingHours,
    });
  }

  // Define working hours for the day
  const [startH, startM] = (config && config.startTime ? config.startTime : '09:00').split(':').map(Number);
  const [endH, endM] = (config && config.endTime ? config.endTime : '19:00').split(':').map(Number);

  // Use Brazil midnight (America/Sao_Paulo = UTC-3) as the base for slot calculation.
  // Without this, startOfDay() would return UTC midnight, shifting all slots by +3h.
  const brMidnight = (() => {
    const d = new Date(selectedDate);
    // Build "YYYY-MM-DDT00:00:00" in Sao Paulo time, then parse as UTC offset
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(d);
    const get = (type) => parts.find((p) => p.type === type)?.value || '00';
    // e.g. "2026-04-12T00:00:00-03:00"
    return new Date(`${get('year')}-${get('month')}-${get('day')}T00:00:00-03:00`);
  })();

  let currentSlot = addMinutes(brMidnight, startH * 60 + startM);
  const workEnd = addMinutes(brMidnight, endH * 60 + endM);

  let selectedServiceDuration = Number(serviceDurationMinutes) || 30;
  const isServiceIdUuid =
    typeof serviceId === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(serviceId);

  if (isServiceIdUuid) {
    const selectedService = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { durationMinutes: true },
    });

    if (selectedService && selectedService.durationMinutes) {
      selectedServiceDuration = selectedService.durationMinutes;
    }
  }

  // Fetch all appointments for the day
  const appointments = await prisma.appointment.findMany({
    where: {
      preferredHairdresserId: barberId,
      appointmentDateTime: {
        gte: startOfDay(selectedDate),
        lte: endOfDay(selectedDate),
      },
      status: 'Upcoming',
    },
    include: {
      serviceType: {
        select: { durationMinutes: true },
      },
    },
  });

  const availableSlots = [];
  const now = new Date();

  while (isBefore(currentSlot, workEnd)) {
    const slotStart = new Date(currentSlot);
    const slotEnd = addMinutes(currentSlot, selectedServiceDuration);
    const isPast = isAfter(now, currentSlot);
    let isTaken = false;

    for (let i = 0; i < appointments.length; i += 1) {
      const app = appointments[i];
      const appStart = new Date(app.appointmentDateTime);
      const appDuration = app.serviceType && app.serviceType.durationMinutes ? app.serviceType.durationMinutes : 30;
      const appEnd = addMinutes(appStart, appDuration);

      if (slotStart < appEnd && slotEnd > appStart) {
        isTaken = true;
        break;
      }
    }

    const exceedsWorkingHours = isAfter(slotEnd, workEnd);

    if (!isPast && !isTaken && !exceedsWorkingHours) {
      availableSlots.push({
        start: currentSlot.toISOString(),
        end: slotEnd.toISOString(),
      });
    }
    currentSlot = addMinutes(currentSlot, 30);
  }

  res.send({
    barber: {
      id: barber.id,
      firstName: barber.firstName,
      lastName: barber.lastName,
      email: barber.email,
    },
    availableSlots,
    schedule: parsedWorkingHours,
    slotDurationMinutes: selectedServiceDuration,
  });
});

const updateAvailability = catchAsync(async (req, res) => {
  const { barberId, workingHours } = req.body;

  if (!barberId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'barberId é obrigatório');
  }

  if (!Array.isArray(workingHours) || workingHours.length !== 7) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'workingHours deve conter os 7 dias da semana');
  }

  const dayIds = new Set();
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const normalizedWorkingHours = workingHours.map((dayConfig) => {
    const dayId = Number(dayConfig?.dayId);
    const isOpen = Boolean(dayConfig?.isOpen);
    const startTime = String(dayConfig?.startTime || '09:00');
    const endTime = String(dayConfig?.endTime || '19:00');

    if (!Number.isInteger(dayId) || dayId < 0 || dayId > 6) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'dayId inválido em workingHours');
    }

    if (dayIds.has(dayId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Não pode haver dayId duplicado em workingHours');
    }
    dayIds.add(dayId);

    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Horários devem estar no formato HH:mm');
    }

    if (isOpen && startTime >= endTime) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Hora inicial deve ser menor que hora final nos dias abertos');
    }

    return {
      dayId,
      isOpen,
      startTime,
      endTime,
    };
  });

  if (dayIds.size !== 7) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'workingHours deve incluir todos os dias (0 a 6)');
  }

  // Check if the user trying to update is the barber themselves (security check added)
  if (req.user && req.user.role !== 'admin' && req.user.id !== barberId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Você só pode alterar sua própria agenda');
  }

  const barber = await prisma.user.findUnique({ where: { id: barberId } });
  if (!barber || barber.role !== 'barber') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Barbeiro não encontrado');
  }

  const updatedBarber = await prisma.user.update({
    where: { id: barberId },
    data: {
      workingHours: JSON.stringify(normalizedWorkingHours),
    },
  });

  res.send({
    message: 'Agenda atualizada com sucesso',
    workingHours: JSON.parse(updatedBarber.workingHours),
  });
});

module.exports = {
  getAvailability,
  updateAvailability,
};
