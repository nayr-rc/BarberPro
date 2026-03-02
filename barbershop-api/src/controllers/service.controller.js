const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const { serviceService } = require('../services');

const createService = catchAsync(async (req, res) => {
  const service = await serviceService.createService(req.body);
  res.status(httpStatus.CREATED).send(service);
});

const getServices = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['title', 'category', 'categoryId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const services = await serviceService.getServices(filter, options);
  res.status(httpStatus.OK).send(services);
});

const getService = catchAsync(async (req, res) => {
  const service = await serviceService.getServiceById(req.params.serviceId);
  if (!service) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Service not found');
  }

  res.status(httpStatus.OK).send(service);
});

const updateService = catchAsync(async (req, res) => {
  const service = await serviceService.updateServiceById(req.params.serviceId, req.body);
  res.status(httpStatus.OK).send(service);
});

const deleteService = catchAsync(async (req, res) => {
  await serviceService.deleteServiceById(req.params.serviceId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
};
