/**
 * Investment Routes
 * 
 * Defines API endpoints for investment management and tracking
 */

const express = require('express');
const investmentController = require('../controllers/investment-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

// All investment routes require authentication
router.use(authController.protect);

// Routes for all authenticated users
router.get('/my-investments', investmentController.getMyInvestments);
router.get('/:id', investmentController.getInvestment);
router.post('/', investmentController.createInvestment);

// Admin-only routes
router.use(authController.restrictTo('admin'));
router.get('/dashboard/stats', investmentController.getInvestmentDashboard);
router.patch('/:id/status', investmentController.updateInvestmentStatus);
router.post('/:id/roi-payment', investmentController.addROIPayment);

module.exports = router;