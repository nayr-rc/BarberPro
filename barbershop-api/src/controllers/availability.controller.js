const httpStatus = require('http-status');
const { startOfDay, endOfDay, addMinutes, isAfter, isBefore, parseISO } = require('date-fns');
const catchAsync = require('../utils/catchAsync');
const prisma = require('../client');
const ApiError = require('../utils/ApiError');

const getAvailability = catchAsync(async (req, res) => {
  const { barberId, date } = req.query;
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

  let currentSlot = startOfDay(selectedDate);
  currentSlot = addMinutes(currentSlot, startH * 60 + startM);
  const workEnd = addMinutes(startOfDay(selectedDate), endH * 60 + endM);

  // Fetch all appointments for the day
  const appointments = await prisma.appointment.findMany({
    where: {
      preferredHairdresserId: barberId,
      appointmentDateTime: {
        gte: startOfDay(selectedDate),
        lte: endOfDay(selectedDate),
      },
      status: { not: 'Cancelled' },
    },
  });

  const availableSlots = [];
  const now = new Date();

  while (isBefore(currentSlot, workEnd)) {
    const slotEnd = addMinutes(currentSlot, 30);
    const isPast = isAfter(now, currentSlot);
    const currentSlotTime = currentSlot.getTime();
    const isTaken = appointments.some((app) => {
      const appDate = new Date(app.appointmentDateTime);
      return appDate.getTime() === currentSlotTime;
    });

    if (!isPast && !isTaken) {
      availableSlots.push({
        start: currentSlot.toISOString(),
        end: slotEnd.toISOString(),
      });
    }
    currentSlot = slotEnd;
  }

  res.send({
    barber: {
      id: barber.id,
      firstName: barber.firstName,
      lastName: barber.lastName,
      email: barber.email,
      googleCalendarId: 'primary', // mock
    },
    availableSlots,
    schedule: parsedWorkingHours,
  });
});

const updateAvailability = catchAsync(async (req, res) => {
  const { barberId, workingHours } = req.body;

  // Check if the user trying to update is the barber themselves (security check added)
  if (req.user && req.user.role !== 'admin' && req.user.id !== barberId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Você só pode alterar sua própria agenda');
  }

  const barber = await prisma.user.findUnique({ where: { id: barberId } });
  if (!barber) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Barbeiro não encontrado');
  }

  const updatedBarber = await prisma.user.update({
    where: { id: barberId },
    data: {
      workingHours: JSON.stringify(workingHours),
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
