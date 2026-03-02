const httpStatus = require('http-status');

jest.mock('../../../src/client', () => ({
  serviceCategory: {
    findMany: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
  service: {
    count: jest.fn(),
  },
}));

const prisma = require('../../../src/client');
const serviceCategoryService = require('../../../src/services/serviceCategory.service');

describe('serviceCategory.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getServiceCategories returns paginated response', async () => {
    prisma.serviceCategory.findMany.mockResolvedValue([{ id: 'category-1' }]);
    prisma.serviceCategory.count.mockResolvedValue(1);

    const result = await serviceCategoryService.getServiceCategories({ name: 'Cabelo' }, { page: 1, limit: 5 });

    expect(prisma.serviceCategory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { name: 'Cabelo' }, take: 5, skip: 0 })
    );
    expect(result).toEqual({
      results: [{ id: 'category-1' }],
      page: 1,
      limit: 5,
      totalPages: 1,
      totalResults: 1,
    });
  });

  test('deleteServiceCategoryById throws bad request when category has associated services', async () => {
    prisma.service.count.mockResolvedValue(2);

    await expect(serviceCategoryService.deleteServiceCategoryById('category-1')).rejects.toMatchObject({
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Cannot delete service category with associated services. Please delete the services first.',
    });
  });

  test('deleteServiceCategoryById deletes category when there are no associated services', async () => {
    prisma.service.count.mockResolvedValue(0);
    prisma.serviceCategory.delete.mockResolvedValue({ id: 'category-1' });

    const result = await serviceCategoryService.deleteServiceCategoryById('category-1');

    expect(prisma.serviceCategory.delete).toHaveBeenCalledWith({ where: { id: 'category-1' } });
    expect(result).toEqual({ id: 'category-1' });
  });
});
