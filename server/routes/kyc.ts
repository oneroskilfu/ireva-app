import express, { Router } from 'express';
import { submitKYC, getKYCStatus, getPendingKYC, verifyKYC, upload } from '../controllers/kycController';
import authMiddleware from '../middleware/authMiddleware';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';

const router: Router = express.Router();

// User routes
router.post('/submit', 
  authMiddleware, 
  upload.fields([
    { name: 'selfie', maxCount: 1 },
    { name: 'idDoc', maxCount: 1 }
  ]),
  submitKYC
);

router.get('/status', 
  authMiddleware, 
  getKYCStatus
);

// Admin routes
// Get all submitted KYCs (matching expected GET /api/kyc/all)
router.get('/all', 
  authMiddleware, 
  getPendingKYC
);

// Also keep /pending for backwards compatibility
router.get('/pending', 
  authMiddleware, 
  getPendingKYC
);

// Update KYC status (matching expected PUT /api/kyc/status/:id)
router.put('/status/:userId', 
  authMiddleware, 
  verifyKYC
);

// Also keep the POST endpoint for backwards compatibility
router.post('/:userId/verify', 
  authMiddleware, 
  verifyKYC
);

// Serve KYC document files
router.get('/:userId/files/:fileType', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Only allow admins or the owner to view their own files
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && 
        req.user.id !== parseInt(req.params.userId)) {
      return res.status(403).json({ error: 'Not authorized to access this resource' });
    }
    
    const userId = req.params.userId;
    const fileType = req.params.fileType;
    
    if (fileType !== 'selfie' && fileType !== 'idDoc') {
      return res.status(400).json({ error: 'Invalid file type requested' });
    }
    
    // In a real system we'd look up the file path from the database
    // Here we'll just use the uploads directory
    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // This is a simplified way to find the file
    // In a production app, you'd store the filenames in the database
    const files = fs.readdirSync(uploadDir);
    const userFile = files.find(f => f.startsWith(`${fileType}-`) && f.includes(userId));
    
    if (!userFile) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const filePath = path.join(uploadDir, userFile);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving KYC file:', error);
    res.status(500).json({ error: 'Error serving file' });
  }
});

export default router;