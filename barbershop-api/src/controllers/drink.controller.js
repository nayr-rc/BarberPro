const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { Drink } = require('../models');
const ApiError = require('../utils/ApiError');

const createDrink = catchAsync(async (req, res) => {
    const drink = await Drink.create(req.body);
    res.status(httpStatus.CREATED).send(drink);
});

const getDrinks = catchAsync(async (req, res) => {
    const drinks = await Drink.find({ active: true });
    res.send(drinks);
});

const updateDrink = catchAsync(async (req, res) => {
    const drink = await Drink.findById(req.params.drinkId);
    if (!drink) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Drink not found');
    }
    Object.assign(drink, req.body);
    await drink.save();
    res.send(drink);
});

const deleteDrink = catchAsync(async (req, res) => {
    const drink = await Drink.findById(req.params.drinkId);
    if (!drink) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Drink not found');
    }
    await drink.remove();
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createDrink,
    getDrinks,
    updateDrink,
    deleteDrink,
};
