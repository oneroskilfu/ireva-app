import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../auth-jwt';
import { getKYCStatus, submitKYC, getKYCDocument, getPendingKYC, verifyKYC } from '../controllers/kycController';

const router = express.Router();

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Get user ID from JWT token
    const userId = req.user?.id;
    if (!userId) {
      return cb(new Error('User not authenticated'), '');
    }
    
    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', 'kyc', userId.toString());
    fs.mkdirSync(uploadDir, { recursive: true });
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow images and PDFs
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 3 // Maximum 3 files (ID, selfie, proof of address)
  },
  fileFilter: fileFilter
});

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get user's KYC status
router.get('/status', getKYCStatus);

// Submit KYC application
router.post(
  '/submit',
  upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 }
  ]),
  submitKYC
);

// Get KYC document (for authorized users only)
router.get('/document/:kycId/:documentType', getKYCDocument);

// Admin routes
router.get('/pending', getPendingKYC);
router.post('/:kycId/verify', verifyKYC);

export default router;