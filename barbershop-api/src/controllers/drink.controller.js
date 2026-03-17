const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const prisma = require('../client');
const ApiError = require('../utils/ApiError');

const createDrink = catchAsync(async (req, res) => {
    const drink = await prisma.drink.create({
        data: req.body
    });
    res.status(httpStatus.CREATED).send(drink);
});

const getDrinks = catchAsync(async (req, res) => {
    const drinks = await prisma.drink.findMany({
        where: { active: true }
    });
    res.send(drinks);
});

const updateDrink = catchAsync(async (req, res) => {
    const drink = await prisma.drink.findUnique({
        where: { id: req.params.drinkId }
    });
    if (!drink) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Drink not found');
    }
    const updatedDrink = await prisma.drink.update({
        where: { id: req.params.drinkId },
        data: req.body
    });
    res.send(updatedDrink);
});

const deleteDrink = catchAsync(async (req, res) => {
    const drink = await prisma.drink.findUnique({
        where: { id: req.params.drinkId }
    });
    if (!drink) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Drink not found');
    }
    await prisma.drink.delete({
        where: { id: req.params.drinkId }
    });
    res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
    createDrink,
    getDrinks,
    updateDrink,
    deleteDrink,
};
