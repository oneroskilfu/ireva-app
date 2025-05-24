/**
 * KYC Routes
 * 
 * API routes for KYC (Know Your Customer) verification processes.
 * Handles document uploads, verification status, and compliance checks.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const KycController = require('../controllers/kyc-controller');
const { requireAuth } = require('../middleware/auth-middleware');
const { requireAdminRole } = require('../middleware/role-middleware');

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory for encryption
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only certain file types
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Only JPEG, PNG, and PDF are allowed.'), false);
    }
  }
});

// User KYC Routes
router.get('/verification/:id', requireAuth, KycController.getKycVerification);
router.get('/verification/user/:userId', requireAuth, KycController.getKycVerificationByUserId);
router.post('/verification/initiate', requireAuth, KycController.initiateKyc);
router.post('/documents/upload', requireAuth, upload.single('file'), KycController.uploadDocument);
router.get('/documents/:id/signed-url', requireAuth, KycController.getDocumentSignedUrl);
router.post('/verification/identity/manual', requireAuth, KycController.submitManualIdentityVerification);
router.post('/verification/identity/trulioo', requireAuth, KycController.verifyIdentityWithTrulioo);
router.post('/verification/identity/smile', requireAuth, KycController.verifyIdentityWithSmileIdentity);
router.get('/verification/status', requireAuth, KycController.getUserVerificationStatus);

// Admin KYC Routes
router.get('/admin/verifications', requireAuth, requireAdminRole, KycController.getAllVerifications);
router.get('/admin/verifications/pending', requireAuth, requireAdminRole, KycController.getPendingVerifications);
router.get('/admin/documents/:id', requireAuth, requireAdminRole, KycController.getDocument);
router.post('/admin/documents/:id/review', requireAuth, requireAdminRole, KycController.reviewDocument);
router.post('/admin/verification/:id/review', requireAuth, requireAdminRole, KycController.reviewVerification);
router.get('/admin/risk-flags', requireAuth, requireAdminRole, KycController.getRiskFlags);
router.post('/admin/risk-flags/:id/resolve', requireAuth, requireAdminRole, KycController.resolveRiskFlag);

// Compliance monitoring routes
router.get('/admin/compliance/summary', requireAuth, requireAdminRole, KycController.getComplianceSummary);
router.get('/admin/compliance/suspicious-transactions', requireAuth, requireAdminRole, KycController.getSuspiciousTransactions);
router.post('/admin/compliance/transactions/:id/review', requireAuth, requireAdminRole, KycController.reviewTransaction);

// Sanctions and PEP screening routes
router.post('/screening/pep', requireAuth, KycController.screenPEP);
router.post('/screening/sanctions', requireAuth, KycController.screenSanctions);
router.get('/admin/compliance/screening-results', requireAuth, requireAdminRole, KycController.getScreeningResults);

module.exports = router;