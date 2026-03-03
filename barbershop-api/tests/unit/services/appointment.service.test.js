const httpStatus = require('http-status');

jest.mock('../../../src/client', () => ({
  appointment: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  service: {
    findUnique: jest.fn(),
  },
}));

const prisma = require('../../../src/client');
const appointmentService = require('../../../src/services/appointment.service');

describe('appointment.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createAppointment normalizes legacy payload keys', async () => {
    prisma.service.findUnique.mockResolvedValue({ categoryId: 'category-1' });
    prisma.appointment.findFirst.mockResolvedValue(null);
    prisma.appointment.create.mockResolvedValue({ id: 'appointment-1' });

    await appointmentService.createAppointment({
      firstName: 'Joao',
      lastName: 'Silva',
      contactNumber: '11999999999',
      email: 'joao@barber.com',
      userId: 'user-1',
      preferredHairdresser: 'barber-1',
      serviceType: 'service-1',
      appointmentDateTime: new Date().toISOString(),
      drinkIds: ['drink-1'],
    });

    expect(prisma.appointment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          preferredHairdresserId: 'barber-1',
          serviceTypeId: 'service-1',
          serviceCategoryId: 'category-1',
          drinks: {
            connect: [{ id: 'drink-1' }],
          },
        }),
      })
    );
  });

  test('createAppointment throws bad request when required fields are missing', async () => {
    await expect(appointmentService.createAppointment({ firstName: 'Joao' })).rejects.toMatchObject({
      statusCode: httpStatus.BAD_REQUEST,
    });
  });

  test('createAppointment throws conflict when slot already reserved', async () => {
    prisma.service.findUnique.mockResolvedValue({ categoryId: 'category-1' });
    prisma.appointment.findFirst.mockResolvedValue({ id: 'existing-appointment' });

    await expect(
      appointmentService.createAppointment({
        firstName: 'Joao',
        lastName: 'Silva',
        contactNumber: '11999999999',
        email: 'joao@barber.com',
        userId: 'user-1',
        preferredHairdresser: 'barber-1',
        serviceType: 'service-1',
        appointmentDateTime: new Date().toISOString(),
      })
    ).rejects.toMatchObject({ statusCode: httpStatus.CONFLICT });
  });

  test('queryAppointments normalizes legacy filters', async () => {
    prisma.appointment.findMany.mockResolvedValue([]);
    prisma.appointment.count.mockResolvedValue(0);

    await appointmentService.queryAppointments(
      {
        preferredHairdresser: 'barber-1',
        serviceCategory: 'category-1',
        serviceType: 'service-1',
      },
      { page: 1, limit: 10 }
    );

    expect(prisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          preferredHairdresserId: 'barber-1',
          serviceCategoryId: 'category-1',
          serviceTypeId: 'service-1',
        },
      })
    );
  });

  test('payAppointmentById updates paymentStatus', async () => {
    prisma.appointment.findUnique.mockResolvedValue({ id: 'appointment-1' });
    prisma.appointment.update.mockResolvedValue({ id: 'appointment-1', paymentStatus: 'Paid' });

    const result = await appointmentService.payAppointmentById('appointment-1');

    expect(prisma.appointment.update).toHaveBeenCalledWith({
      where: { id: 'appointment-1' },
      data: { paymentStatus: 'Paid' },
    });
    expect(result.paymentStatus).toBe('Paid');
  });
});
