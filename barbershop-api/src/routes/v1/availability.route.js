const express = require('express');
const availabilityController = require('../../controllers/availability.controller');
const auth = require('../../middlewares/auth');
const checkSubscription = require('../../middlewares/checkSubscription');

const router = express.Router();

router.get('/', availabilityController.getAvailability);
router.post('/', auth(), checkSubscription, availabilityController.updateAvailability);

module.exports = router;
