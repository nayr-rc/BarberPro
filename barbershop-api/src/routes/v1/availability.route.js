const express = require('express');
const availabilityController = require('../../controllers/availability.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/', availabilityController.getAvailability);
router.post('/', auth(), availabilityController.updateAvailability);

module.exports = router;
