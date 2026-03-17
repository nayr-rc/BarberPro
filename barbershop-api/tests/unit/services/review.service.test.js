jest.mock('../../../src/client', () => ({
  review: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
}));

const prisma = require('../../../src/client');
const reviewService = require('../../../src/services/review.service');

describe('review.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createReview maps legacy serviceType to serviceTypeId', async () => {
    prisma.review.create.mockResolvedValue({ id: 'review-1' });

    await reviewService.createReview({
      userId: 'user-1',
      barberId: 'barber-1',
      serviceType: 'service-1',
      appointmentId: 'appointment-1',
      name: 'Cliente',
      rating: 5,
      title: 'Excelente',
      text: 'Ótimo atendimento',
      appointmentDateTime: new Date().toISOString(),
    });

    expect(prisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ serviceTypeId: 'service-1' }),
      })
    );
  });

  test('getReviews normalizes legacy filter and paginates output', async () => {
    prisma.review.findMany.mockResolvedValue([{ id: 'review-1' }]);
    prisma.review.count.mockResolvedValue(1);

    const result = await reviewService.getReviews(
      { barberId: 'barber-1', serviceType: 'service-1' },
      { page: 2, limit: 1, sortBy: 'createdAt:desc', populate: 'user,serviceType' }
    );

    expect(prisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { barberId: 'barber-1', serviceTypeId: 'service-1' },
        include: { user: true, serviceType: true },
      })
    );
    expect(result).toEqual({
      results: [{ id: 'review-1' }],
      page: 2,
      limit: 1,
      totalPages: 1,
      totalResults: 1,
    });
  });

  test('updateReviewById maps legacy serviceType key', async () => {
    prisma.review.update.mockResolvedValue({ id: 'review-1' });

    await reviewService.updateReviewById('review-1', {
      serviceType: 'service-2',
      title: 'Atualizado',
    });

    expect(prisma.review.update).toHaveBeenCalledWith({
      where: { id: 'review-1' },
      data: {
        title: 'Atualizado',
        serviceTypeId: 'service-2',
      },
    });
  });
});
