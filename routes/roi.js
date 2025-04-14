const express = require('express');
const router = express.Router();
const roiController = require('../controllers/roiController');

// POST calculate ROI for a potential investment
router.post('/calculate', roiController.calculateROI);

// GET returns for all investments
router.get('/investment-returns', roiController.getInvestmentReturns);

module.exports = router;