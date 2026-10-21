const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/metrics', protect, adminOnly, getDashboardMetrics);

module.exports = router;
