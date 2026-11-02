const express = require('express');
const router = express.Router();
const {
    analyzeAndEscalate,
    getDashboardOverview,
    approveTaskDispatch
} = require('../controllers/dashboardController');

router.post('/analyze', analyzeAndEscalate);
router.get('/overview', getDashboardOverview);
router.patch('/warnings/:id/approve', approveTaskDispatch);

module.exports = router;