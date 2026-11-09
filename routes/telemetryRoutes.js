const express = require('express');
const router = express.Router();
const { addTelemetryData, syncISPUData, getTelemetryByStation } = require('../controllers/telemetryController');

router.post('/', addTelemetryData);
router.post('/sync-ispu', syncISPUData);
router.get('/:stationId', getTelemetryByStation);

module.exports = router;