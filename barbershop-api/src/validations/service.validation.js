const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createService = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
    durationMinutes: Joi.number().integer().min(15).max(240).default(30),
    category: Joi.string().custom(objectId),
    categoryId: Joi.string().custom(objectId),
    barberId: Joi.string().custom(objectId),
  }),
};

const getServices = {
  query: Joi.object().keys({
    title: Joi.string(),
    category: Joi.string().custom(objectId),
    categoryId: Joi.string().custom(objectId),
    barberId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    populate: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getService = {
  params: Joi.object().keys({
    serviceId: Joi.string().custom(objectId),
  }),
};

const updateService = {
  params: Joi.object().keys({
    serviceId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      description: Joi.string(),
      price: Joi.number(),
      durationMinutes: Joi.number().integer().min(15).max(240),
      category: Joi.string().custom(objectId),
      categoryId: Joi.string().custom(objectId),
      barberId: Joi.string().custom(objectId),
    })
    .min(1),
};

const deleteService = {
  params: Joi.object().keys({
    serviceId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
};
