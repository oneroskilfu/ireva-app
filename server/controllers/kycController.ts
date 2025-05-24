import { Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import KYC from '../models/KYCSchema';
import User from '../models/User';

// Get user's KYC status
export const getKYCStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    // For SQL users, use the numeric ID directly
    // For MongoDB collection, try to find by an alternative method - username
    // First, get the user to find their username
    const user = await User.findOne({ userId: userId }).select('kycStatus kycSubmittedAt kycVerifiedAt kycRejectionReason username');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Check if the user has already submitted KYC using username instead of ID
    const kyc = await KYC.findOne({ username: user.username });
    
    res.json({
      kycStatus: user?.kycStatus || 'not_started',
      kycSubmittedAt: user?.kycSubmittedAt,
      kycVerifiedAt: user?.kycVerifiedAt,
      kycRejectionReason: user?.kycRejectionReason,
      submission: kyc ? {
        id: kyc._id,
        status: kyc.status,
        documents: {
          idDocument: kyc.documents.idDocument ? {
            type: kyc.documents.idDocument.type,
            verificationStatus: kyc.documents.idDocument.verificationStatus
          } : null,
          selfie: kyc.documents.selfie ? {
            verificationStatus: kyc.documents.selfie.verificationStatus
          } : null,
          proofOfAddress: kyc.documents.proofOfAddress ? {
            type: kyc.documents.proofOfAddress.type,
            verificationStatus: kyc.documents.proofOfAddress.verificationStatus
          } : null
        },
        submittedAt: kyc.submittedAt,
        processedAt: kyc.processedAt
      } : null
    });
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    res.status(500).json({
      message: 'Failed to fetch KYC status',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Submit KYC application
export const submitKYC = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { personalInfo, documentTypes } = req.body;
    
    // Validate required fields
    if (!personalInfo || !personalInfo.dateOfBirth || !personalInfo.nationality ||
        !personalInfo.residentialAddress || !personalInfo.city || !personalInfo.state) {
      res.status(400).json({ message: 'Missing required personal information' });
      return;
    }

    // Check if files were uploaded (handled by multer middleware)
    if (!req.files || Object.keys(req.files).length === 0) {
      res.status(400).json({ message: 'No documents uploaded' });
      return;
    }
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    // Check for required ID document
    if (!files.idDocument || files.idDocument.length === 0) {
      res.status(400).json({ message: 'ID document is required' });
      return;
    }
    
    // Get user info first to get username
    const user = await User.findOne({ userId: userId });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Check if the user already has a KYC submission
    const existingKYC = await KYC.findOne({ username: user.username });
    
    if (existingKYC && existingKYC.status === 'pending') {
      res.status(400).json({ message: 'You already have a pending KYC application' });
      return;
    }
    
    // Prepare documents object
    const documents: any = {
      idDocument: {
        type: documentTypes.idDocument,
        url: `/uploads/kyc/${userId}/${files.idDocument[0].filename}`,
        uploadedAt: new Date(),
        verificationStatus: 'pending'
      }
    };
    
    // Add selfie if provided
    if (files.selfie && files.selfie.length > 0) {
      documents.selfie = {
        url: `/uploads/kyc/${userId}/${files.selfie[0].filename}`,
        uploadedAt: new Date(),
        verificationStatus: 'pending'
      };
    }
    
    // Add proof of address if provided
    if (files.proofOfAddress && files.proofOfAddress.length > 0) {
      documents.proofOfAddress = {
        type: documentTypes.proofOfAddress,
        url: `/uploads/kyc/${userId}/${files.proofOfAddress[0].filename}`,
        uploadedAt: new Date(),
        verificationStatus: 'pending'
      };
    }
    
    // Create or update KYC submission
    let kyc;
    
    if (existingKYC) {
      // Update existing KYC
      kyc = await KYC.findByIdAndUpdate(
        existingKYC._id,
        {
          status: 'pending',
          userId: userId, // Update numeric ID just in case
          username: user.username, // Update username just in case
          documents,
          personalInfo,
          submittedAt: new Date(),
          processedAt: undefined,
          processedBy: undefined,
          rejectionReason: undefined,
          verificationAttempts: existingKYC.verificationAttempts + 1,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        },
        { new: true }
      );
    } else {
      // Create new KYC
      kyc = await KYC.create({
        user: new mongoose.Types.ObjectId(), // Create a dummy ObjectId
        userId: userId, // Store the numeric ID
        username: user.username, // Store the username for lookups
        status: 'pending',
        documents,
        personalInfo,
        submittedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }
    
    // Update user's KYC status directly with user object
    if (user) {
      user.kycStatus = 'pending';
      user.kycSubmittedAt = new Date();
      user.kycVerifiedAt = undefined;
      user.kycRejectionReason = undefined;
      await user.save();
    }
    
    res.status(201).json({
      message: 'KYC application submitted successfully',
      kyc: {
        id: kyc._id,
        status: kyc.status,
        submittedAt: kyc.submittedAt
      }
    });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({
      message: 'Failed to submit KYC application',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get KYC document (for authorized users only)
export const getKYCDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { kycId, documentType } = req.params;
    
    // Find the KYC
    const kyc = await KYC.findById(kycId);
    
    if (!kyc) {
      res.status(404).json({ message: 'KYC not found' });
      return;
    }
    
    // Get user to check username
    const user = await User.findOne({ userId: req.user?.id });
    
    // Check if user is authorized (owns the KYC or is admin) - comparing by username instead of id
    if (user && user.username !== kyc.username && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to access this document' });
      return;
    }
    
    // Get the document URL
    let documentUrl;
    
    switch (documentType) {
      case 'idDocument':
        documentUrl = kyc.documents.idDocument.url;
        break;
      case 'selfie':
        documentUrl = kyc.documents.selfie?.url;
        break;
      case 'proofOfAddress':
        documentUrl = kyc.documents.proofOfAddress?.url;
        break;
      default:
        res.status(400).json({ message: 'Invalid document type' });
        return;
    }
    
    if (!documentUrl) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }
    
    // Convert URL to file path
    const filePath = path.join(process.cwd(), documentUrl.replace(/^\/uploads/, 'uploads'));
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'Document file not found' });
      return;
    }
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error fetching KYC document:', error);
    res.status(500).json({
      message: 'Failed to fetch KYC document',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Admin: Get pending KYC submissions
export const getPendingKYC = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only allow admins to access this endpoint
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to access this resource' });
      return;
    }
    
    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Get pending KYC submissions
    const kycs = await KYC.find({ status: 'pending' })
      .populate('user', 'username email firstName lastName phoneNumber')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await KYC.countDocuments({ status: 'pending' });
    
    res.json({
      kycs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pending KYC submissions:', error);
    res.status(500).json({
      message: 'Failed to fetch pending KYC submissions',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Admin: Verify or reject KYC
export const verifyKYC = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only allow admins to access this endpoint
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to perform this action' });
      return;
    }
    
    const { kycId } = req.params;
    const { status, rejectionReason, adminNotes } = req.body;
    
    // Validate status
    if (status !== 'approved' && status !== 'rejected') {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }
    
    // If rejecting, require a reason
    if (status === 'rejected' && !rejectionReason) {
      res.status(400).json({ message: 'Rejection reason is required' });
      return;
    }
    
    // Find the KYC
    const kyc = await KYC.findById(kycId);
    
    if (!kyc) {
      res.status(404).json({ message: 'KYC not found' });
      return;
    }
    
    // Update the KYC
    kyc.status = status;
    kyc.processedAt = new Date();
    kyc.processedBy = new mongoose.Types.ObjectId(req.user?.id);
    
    if (status === 'rejected') {
      kyc.rejectionReason = rejectionReason;
    }
    
    if (adminNotes) {
      kyc.adminNotes = adminNotes;
    }
    
    await kyc.save();
    
    // Get the user by username instead of ID
    const user = await User.findOne({ username: kyc.username });
    
    if (user) {
      // Update user's KYC status
      user.kycStatus = status;
      user.kycVerifiedAt = status === 'approved' ? new Date() : undefined;
      user.kycRejectionReason = status === 'rejected' ? rejectionReason : undefined;
      await user.save();
    }
    
    res.json({
      message: `KYC ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      kyc
    });
  } catch (error) {
    console.error('Error processing KYC verification:', error);
    res.status(500).json({
      message: 'Failed to process KYC verification',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};