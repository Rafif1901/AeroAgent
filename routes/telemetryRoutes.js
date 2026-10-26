const express = require('express');
const router = express.Router();
const { addTelemetryData, getTelemetryByStation } = require('../controllers/telemetryController');

router.post('/', addTelemetryData);
router.get('/:stationId', getTelemetryByStation);

module.exports = router;