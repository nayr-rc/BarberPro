const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const drinkValidation = require('../../validations/drink.validation');
const drinkController = require('../../controllers/drink.controller');

const router = express.Router();

router
    .route('/')
    .post(auth('manageServices'), validate(drinkValidation.createDrink), drinkController.createDrink)
    .get(drinkController.getDrinks);

router
    .route('/:drinkId')
    .patch(auth('manageServices'), validate(drinkValidation.updateDrink), drinkController.updateDrink)
    .delete(auth('manageServices'), drinkController.deleteDrink);

module.exports = router;
