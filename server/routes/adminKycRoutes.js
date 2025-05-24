const express = require('express');
const { 
  getAllKYCApplications, 
  verifyKYCApplication,
  updateKYCStatus,
  getAllKYCs  // Aliased function name
} = require('../controllers/kycController');
const { ensureAdmin } = require('../auth-jwt');

const router = express.Router();

// Protect all routes with admin middleware
router.use(ensureAdmin);

// Admin KYC routes
router.get('/', getAllKYCApplications);  // Original route - paginated and filtered
router.get('/all', getAllKYCs);          // Simple route that returns all KYCs
router.patch('/:id/verify', verifyKYCApplication);
router.put('/:id', updateKYCStatus);     // Alternate route with different naming

module.exports = router;