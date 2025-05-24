/**
 * Investment Routes Module
 * 
 * Defines all API endpoints related to investment functionality:
 * - Getting investment portfolio summary
 * - Retrieving performance metrics
 * - Calculating ROI data
 * - Managing individual investments
 */

const express = require('express');
const investmentController = require('../controllers/investment-controller');
const securityMiddleware = require('../middleware/security-middleware');

const router = express.Router();

// Apply authentication middleware to all investment routes
router.use(securityMiddleware.verifyToken);

// Get portfolio summary
router.get(
  '/portfolio-summary', 
  securityMiddleware.checkPermission('investments', 'read_own'),
  investmentController.getPortfolioSummary
);

// Get performance data
router.get(
  '/performance', 
  securityMiddleware.checkPermission('investments', 'read_own'),
  investmentController.getPerformanceData
);

// Get ROI data
router.get(
  '/roi', 
  securityMiddleware.checkPermission('investments', 'read_own'),
  investmentController.getROIData
);

// Get a specific investment
router.get(
  '/:id', 
  securityMiddleware.checkPermission('investments', 'read_own'),
  securityMiddleware.verifyOwnership('id', 'userId'),
  investmentController.getInvestment
);

// Export investments data as CSV
router.get(
  '/export-csv', 
  securityMiddleware.checkPermission('investments', 'read_own'),
  investmentController.exportInvestmentsCSV
);

module.exports = router;