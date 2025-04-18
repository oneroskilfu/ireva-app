import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { db } from '../db';
import { kycSubmissions, KycStatus, InsertKycSubmission } from '../models/KYCSchema';
import { eq } from 'drizzle-orm';
import { users } from '@shared/schema';

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Make sure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filter for allowed file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and PDF files are allowed.'));
  }
};

// Create multer upload object
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max size
  }
});

// Submit KYC
export const submitKYC = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    
    // Check if user already has a pending or verified KYC
    const existingKYC = await db.select()
      .from(kycSubmissions)
      .where(eq(kycSubmissions.userId, userId))
      .limit(1);

    if (existingKYC.length > 0) {
      const status = existingKYC[0].status;
      if (status === KycStatus.PENDING) {
        return res.status(400).json({ error: 'You already have a pending KYC submission' });
      }
      if (status === KycStatus.VERIFIED) {
        return res.status(400).json({ error: 'Your KYC is already verified' });
      }
    }

    // Validate request body
    const { fullName, address, idNumber } = req.body;
    
    if (!fullName || !address || !idNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'Files are required' });
    }

    // Get file paths
    const files = req.files as Express.Multer.File[];
    const selfieFile = files.find(f => f.fieldname === 'selfie');
    const idDocFile = files.find(f => f.fieldname === 'idDoc');

    if (!selfieFile || !idDocFile) {
      return res.status(400).json({ error: 'Both selfie and ID document are required' });
    }

    const selfiePath = `/uploads/${selfieFile.filename}`;
    const idDocPath = `/uploads/${idDocFile.filename}`;

    // Create KYC submission record
    const kycData: InsertKycSubmission = {
      userId,
      fullName,
      address,
      idType: req.body.idType || 'national_id',
      idNumber,
      selfieUrl: selfiePath,
      idDocUrl: idDocPath,
      status: KycStatus.PENDING
    };

    const [newKyc] = await db.insert(kycSubmissions)
      .values(kycData)
      .returning();

    // Update user's KYC status
    await db.update(users)
      .set({ kycStatus: KycStatus.PENDING, kycSubmittedAt: new Date() })
      .where(eq(users.id, userId));

    res.status(200).json({
      message: 'KYC submitted successfully',
      kyc: {
        id: newKyc.id,
        status: newKyc.status,
        submittedAt: newKyc.submittedAt
      }
    });
  } catch (error) {
    console.error('KYC Error:', error);
    res.status(500).json({ error: 'Server error during KYC submission' });
  }
};

// Get KYC status
export const getKYCStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    
    // Get user KYC status from users table first
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user has not started KYC
    if (user.kycStatus === KycStatus.NOT_STARTED) {
      return res.status(200).json({ status: KycStatus.NOT_STARTED });
    }

    // Get KYC submission details
    const [kyc] = await db.select()
      .from(kycSubmissions)
      .where(eq(kycSubmissions.userId, userId))
      .orderBy(kycSubmissions.submittedAt)
      .limit(1);

    if (!kyc) {
      return res.status(200).json({ status: KycStatus.NOT_STARTED });
    }

    // Return KYC status info
    res.status(200).json({
      status: kyc.status,
      submittedAt: kyc.submittedAt,
      verifiedAt: kyc.verifiedAt,
      rejectionReason: kyc.rejectionReason,
      submission: {
        fullName: kyc.fullName,
        idType: kyc.idType,
        idNumber: kyc.idNumber
      }
    });
  } catch (error) {
    console.error('Error getting KYC status:', error);
    res.status(500).json({ message: 'Server error getting KYC status' });
  }
};

// Admin: Get all pending KYC submissions
export const getPendingKYC = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const pendingSubmissions = await db.select({
      id: kycSubmissions.id,
      userId: kycSubmissions.userId,
      fullName: kycSubmissions.fullName,
      idType: kycSubmissions.idType,
      status: kycSubmissions.status,
      submittedAt: kycSubmissions.submittedAt,
      username: users.username,
      email: users.email
    })
    .from(kycSubmissions)
    .innerJoin(users, eq(kycSubmissions.userId, users.id))
    .where(eq(kycSubmissions.status, KycStatus.PENDING));

    res.status(200).json(pendingSubmissions);
  } catch (error) {
    console.error('Error getting pending KYC submissions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin: Verify/reject KYC submission
export const verifyKYC = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const { action, rejectionReason } = req.body;

    if (!userId || !action) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
    }

    if (action === 'reject' && !rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const userIdNum = parseInt(userId);

    // Update KYC submission status
    if (action === 'approve') {
      await db.update(kycSubmissions)
        .set({
          status: KycStatus.VERIFIED,
          verifiedAt: new Date(),
          verifiedBy: req.user.id,
        })
        .where(eq(kycSubmissions.userId, userIdNum));

      // Update user KYC status
      await db.update(users)
        .set({
          kycStatus: KycStatus.VERIFIED,
          kycVerifiedAt: new Date()
        })
        .where(eq(users.id, userIdNum));

      // Return success response
      res.status(200).json({
        message: 'KYC approved successfully',
        userId: userIdNum,
        status: KycStatus.VERIFIED
      });
    } else {
      await db.update(kycSubmissions)
        .set({
          status: KycStatus.REJECTED,
          rejectionReason,
        })
        .where(eq(kycSubmissions.userId, userIdNum));

      // Update user KYC status
      await db.update(users)
        .set({
          kycStatus: KycStatus.REJECTED,
          kycRejectionReason: rejectionReason
        })
        .where(eq(users.id, userIdNum));

      // Return success response
      res.status(200).json({
        message: 'KYC rejected',
        userId: userIdNum,
        status: KycStatus.REJECTED,
        rejectionReason
      });
    }
  } catch (error) {
    console.error('Error verifying KYC:', error);
    res.status(500).json({ error: 'Server error during KYC verification' });
  }
};