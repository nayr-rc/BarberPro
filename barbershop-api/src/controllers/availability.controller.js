const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { User, Appointment } = require('../models');
const ApiError = require('../utils/ApiError');
const { startOfDay, endOfDay, addMinutes, isAfter, isBefore, parseISO } = require('date-fns');

const getAvailability = catchAsync(async (req, res) => {
    const { barberId, date } = req.query;
    const selectedDate = date ? parseISO(date) : new Date();

    const barber = await User.findById(barberId);
    if (!barber || barber.role !== 'barber') {
        throw new ApiError(httpStatus.NOT_FOUND, 'Barbeiro não encontrado');
    }

    // Default or Custom Working Hours
    const dayOfWeek = selectedDate.getDay();
    let config = barber.workingHours?.find(h => h.dayId === dayOfWeek);

    // If no config found, or it's closed, return early
    if (config && !config.isOpen) {
        return res.send({
            barber: { id: barber._id, firstName: barber.firstName, lastName: barber.lastName },
            availableSlots: [],
            schedule: barber.workingHours || []
        });
    }

    // Define working hours for the day
    const [startH, startM] = (config?.startTime || '09:00').split(':').map(Number);
    const [endH, endM] = (config?.endTime || '19:00').split(':').map(Number);

    let currentSlot = startOfDay(selectedDate);
    currentSlot = addMinutes(currentSlot, startH * 60 + startM);
    const workEnd = addMinutes(startOfDay(selectedDate), endH * 60 + endM);

    // Fetch all appointments
    const appointments = await Appointment.find({
        preferredHairdresser: barberId,
        appointmentDateTime: {
            $gte: startOfDay(selectedDate),
            $lte: endOfDay(selectedDate),
        },
        status: { $ne: 'Cancelled' },
    });

    const availableSlots = [];
    const now = new Date();

    while (isBefore(currentSlot, workEnd)) {
        const slotEnd = addMinutes(currentSlot, 30);
        const isPast = isAfter(now, currentSlot);
        const isTaken = appointments.some(app => {
            const appDate = new Date(app.appointmentDateTime);
            return appDate.getTime() === currentSlot.getTime();
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
            id: barber._id,
            firstName: barber.firstName,
            lastName: barber.lastName,
            googleCalendarId: 'primary' // mock
        },
        availableSlots,
        schedule: barber.workingHours || []
    });
});

const updateAvailability = catchAsync(async (req, res) => {
    const { barberId, workingHours } = req.body;
    const barber = await User.findById(barberId);
    if (!barber) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Barbeiro não encontrado');
    }

    barber.workingHours = workingHours;
    await barber.save();

    res.send({ message: 'Agenda atualizada com sucesso', workingHours: barber.workingHours });
});

module.exports = {
    getAvailability,
    updateAvailability,
};
