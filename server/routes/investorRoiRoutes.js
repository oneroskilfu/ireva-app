const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const investorRoiController = require('../controllers/investorRoiController');

// All routes require authentication
router.use(authMiddleware);

// Get ROI summary statistics for an investor
router.get('/stats', investorRoiController.getRoiStats);

// Get ROI chart data for an investor
router.get('/chart', investorRoiController.getRoiChartData);

// Get ROI transactions for an investor
router.get('/transactions', investorRoiController.getRoiTransactions);

// Get investment performance metrics
router.get('/performance', investorRoiController.getInvestmentPerformance);

module.exports = router;