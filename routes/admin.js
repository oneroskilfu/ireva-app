const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const kycController = require('../controllers/kycController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.post('/login', adminController.loginAdmin);

// Protected routes (require admin authentication)
router.get('/dashboard', protect, admin, adminController.getDashboardData);
router.get('/user-growth', protect, admin, adminController.getUserGrowth);
router.get('/investment-trends', protect, admin, adminController.getInvestmentTrends);

// KYC management routes
router.get('/kyc', protect, admin, kycController.getKYCRequests);
router.put('/kyc/:id/approve', protect, admin, kycController.approveKYC);
router.put('/kyc/:id/reject', protect, admin, kycController.rejectKYC);

module.exports = router;