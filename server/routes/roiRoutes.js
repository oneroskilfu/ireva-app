const express = require('express');
const router = express.Router();
const {
  getROIDashboardStats,
  getROIChartData,
  getROITableData,
  triggerROIPayout
} = require('../controllers/roiController');

// Routes
router.get('/stats', getROIDashboardStats);
router.get('/chart', getROIChartData);
router.get('/table', getROITableData);
router.post('/payout', triggerROIPayout);

module.exports = router;