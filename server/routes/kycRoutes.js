const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  submitKYC, 
  uploadDocument, 
  getKYCStatus 
} = require('../controllers/kycController');
const { authMiddleware } = require('../auth-jwt');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter to validate uploads
const fileFilter = (req, file, cb) => {
  // Accept only images and PDFs
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and PDF files are allowed'), false);
  }
};

// Initialize multer with config
const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

const router = express.Router();

// Protect all routes in this router
router.use(authMiddleware);

// KYC routes
router.post('/submit', submitKYC);
router.post('/upload-document', upload.single('document'), uploadDocument);
router.get('/status', getKYCStatus);

module.exports = router;