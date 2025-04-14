const express = require('express');
const router = express.Router();
const { calculateROI, getInvestmentReturns } = require('../controllers/roiController');

router.get('/', getInvestmentReturns);
router.post('/calculate', calculateROI);

module.exports = router;