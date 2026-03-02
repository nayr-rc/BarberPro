jest.mock('../../../src/client', () => ({
  service: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const prisma = require('../../../src/client');
const serviceService = require('../../../src/services/service.service');

describe('service.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createService maps categoryId to relation connect', async () => {
    prisma.service.create.mockResolvedValue({ id: 'service-1' });

    await serviceService.createService({
      title: 'Corte',
      description: 'Corte clássico',
      price: 45,
      categoryId: 'category-1',
    });

    expect(prisma.service.create).toHaveBeenCalledWith({
      data: {
        title: 'Corte',
        description: 'Corte clássico',
        price: 45,
        category: {
          connect: { id: 'category-1' },
        },
      },
    });
  });

  test('getServices normalizes category filter and returns pagination payload', async () => {
    prisma.service.findMany.mockResolvedValue([{ id: 'service-1' }]);
    prisma.service.count.mockResolvedValue(1);

    const result = await serviceService.getServices(
      { title: 'Corte', category: 'category-1' },
      { page: 1, limit: 10, populate: 'category' }
    );

    expect(prisma.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { title: 'Corte', categoryId: 'category-1' },
        include: { category: true },
      })
    );
    expect(result).toEqual({
      results: [{ id: 'service-1' }],
      page: 1,
      limit: 10,
      totalPages: 1,
      totalResults: 1,
    });
  });

  test('updateServiceById accepts legacy category key', async () => {
    prisma.service.update.mockResolvedValue({ id: 'service-1' });

    await serviceService.updateServiceById('service-1', {
      title: 'Corte + Barba',
      category: 'category-2',
    });

    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { id: 'service-1' },
      data: {
        title: 'Corte + Barba',
        categoryId: 'category-2',
      },
    });
  });
});
