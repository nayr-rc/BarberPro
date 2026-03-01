const Joi = require('joi');

const createDrink = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        price: Joi.number().required(),
        active: Joi.boolean(),
    }),
};

const updateDrink = {
    params: Joi.object().keys({
        drinkId: Joi.string().required(),
    }),
    body: Joi.object().keys({
        name: Joi.string(),
        price: Joi.number(),
        active: Joi.boolean(),
    }),
};

module.exports = {
    createDrink,
    updateDrink,
};
