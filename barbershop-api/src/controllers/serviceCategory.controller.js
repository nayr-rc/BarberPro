const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const { serviceCategoryService } = require('../services');

const createServiceCategory = catchAsync(async (req, res) => {
  const serviceCategory = await serviceCategoryService.createServiceCategory(req.body);
  res.status(httpStatus.CREATED).send(serviceCategory);
});

const getServiceCategories = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const serviceCategories = await serviceCategoryService.getServiceCategories(filter, options);
  res.status(httpStatus.OK).send(serviceCategories);
});

const getServiceCategory = catchAsync(async (req, res) => {
  const serviceCategory = await serviceCategoryService.getServiceCategoryById(req.params.categoryId);
  if (!serviceCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service category not found');
  }

  res.status(httpStatus.OK).send(serviceCategory);
});

const updateServiceCategory = catchAsync(async (req, res) => {
  const serviceCategory = await serviceCategoryService.updateServiceCategoryById(req.params.categoryId, req.body);
  res.status(httpStatus.OK).send(serviceCategory);
});

const deleteServiceCategory = catchAsync(async (req, res) => {
  await serviceCategoryService.deleteServiceCategoryById(req.params.categoryId);
  res.status(httpStatus.NO_CONTENT).send();
});
module.exports = {
  createServiceCategory,
  getServiceCategories,
  getServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
};
