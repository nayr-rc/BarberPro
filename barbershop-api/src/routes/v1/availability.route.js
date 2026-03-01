const express = require('express');
const availabilityController = require('../../controllers/availability.controller');

const router = express.Router();

router.get('/', availabilityController.getAvailability);
router.post('/', availabilityController.updateAvailability);

module.exports = router;
