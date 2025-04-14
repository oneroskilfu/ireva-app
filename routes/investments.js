const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const { protect, admin } = require('../middleware/auth');

// All routes require authentication and admin rights
router.use(protect, admin);

// GET all investments
router.get('/', investmentController.getInvestments);

// GET investment by ID
router.get('/:id', investmentController.getInvestmentById);

// POST create new investment
router.post('/', investmentController.createInvestment);

// PUT update investment status
router.put('/:id/status', investmentController.updateInvestmentStatus);

module.exports = router;