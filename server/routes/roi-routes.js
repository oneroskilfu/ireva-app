const express = require('express');
const router = express.Router();
const roiController = require('../controllers/roiController');
const { verifyToken } = require('../auth-jwt');
const { ensureAdmin } = require('../middleware/authMiddleware');

// Admin route to calculate and distribute ROI
router.post('/distribute', verifyToken, ensureAdmin, roiController.calculateAndDistributeROI);

// Get ROI distribution history for a specific project
router.get('/project/:projectId', verifyToken, ensureAdmin, roiController.getProjectROIHistory);

// Get ROI distribution history for a specific investor
router.get('/investor/:investorId', verifyToken, roiController.getInvestorROIHistory);

// Get ROI summary statistics for admin dashboard
router.get('/summary', verifyToken, ensureAdmin, roiController.getRoiSummary);

module.exports = router;