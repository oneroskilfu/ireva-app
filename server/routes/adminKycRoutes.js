const express = require('express');
const { 
  getAllKYCApplications, 
  verifyKYCApplication 
} = require('../controllers/kycController');
const { ensureAdmin } = require('../auth-jwt');

const router = express.Router();

// Protect all routes with admin middleware
router.use(ensureAdmin);

// Admin KYC routes
router.get('/', getAllKYCApplications);
router.patch('/:id/verify', verifyKYCApplication);

module.exports = router;