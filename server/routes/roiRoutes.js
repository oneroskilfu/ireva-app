const express = require('express');
const router = express.Router();
const { 
  calculateAndDistributeROI, 
  getROISummary, 
  getProjectROIDistributions, 
  getInvestorROIDistributions 
} = require('../controllers/roiController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Admin route to distribute ROI for a project
router.post('/distribute', verifyToken, isAdmin, calculateAndDistributeROI);

// Get ROI summary for admins
router.get('/summary', verifyToken, isAdmin, getROISummary);

// Get ROI distributions for a specific project
router.get('/project/:projectId', verifyToken, getProjectROIDistributions);

// Get ROI distributions for a specific investor
router.get('/investor/:investorId', verifyToken, getInvestorROIDistributions);

module.exports = router;