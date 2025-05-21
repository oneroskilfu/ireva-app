/**
 * KYC Controller
 * 
 * Handles HTTP requests related to KYC verification and document management
 * for the multi-tenant iREVA platform.
 */

const KycService = require('../services/compliance/KycService');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tempDir = path.join(__dirname, '../../temp-uploads');
    try {
      await fs.mkdir(tempDir, { recursive: true });
      cb(null, tempDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    // Generate a secure random filename to prevent path traversal attacks
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${randomName}${ext}`);
  }
});

// Configure upload middleware with file size and type restrictions
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types for KYC documents
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'image/heic', // iPhone photos
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

// Helper to clean up temporary files
async function cleanupTempFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.warn(`Failed to clean up temp file ${filePath}:`, err);
  }
}

// Helper to get the tenant ID from request
function getTenantId(req) {
  return req.tenantId; // Set by tenant middleware
}

/**
 * Controller methods
 */
const kycController = {
  /**
   * Get KYC status for the authenticated user
   */
  async getUserKycStatus(req, res) {
    try {
      const userId = req.user.id;
      const tenantId = getTenantId(req);
      
      const kycVerification = await KycService.getKycVerificationByUserId(userId, tenantId);
      
      if (!kycVerification) {
        return res.json({
          status: 'NOT_STARTED',
          level: null,
          message: 'KYC verification has not been started.'
        });
      }
      
      // Get documents if verification is in progress
      let documents = [];
      if (['IN_PROGRESS', 'PENDING_REVIEW', 'REQUIRES_ADDITIONAL_INFO'].includes(kycVerification.status)) {
        documents = await KycService.getVerificationDocuments(kycVerification.id, tenantId);
        
        // Remove sensitive information
        documents = documents.map(doc => ({
          id: doc.id,
          type: doc.type,
          status: doc.status,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          documentNumber: doc.documentNumber,
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          issuingCountry: doc.issuingCountry,
          issuingAuthority: doc.issuingAuthority,
          rejectionReason: doc.rejectionReason,
        }));
      }
      
      return res.json({
        id: kycVerification.id,
        status: kycVerification.status,
        level: kycVerification.level,
        lastVerifiedAt: kycVerification.lastVerifiedAt,
        expiresAt: kycVerification.expiresAt,
        additionalInfoRequired: kycVerification.additionalInfoRequired,
        createdAt: kycVerification.createdAt,
        updatedAt: kycVerification.updatedAt,
        documents
      });
    } catch (error) {
      console.error('Error getting user KYC status:', error);
      return res.status(500).json({ error: 'Failed to get KYC status.' });
    }
  },
  
  /**
   * Start KYC verification process for the authenticated user
   */
  async startKycVerification(req, res) {
    try {
      const userId = req.user.id;
      const tenantId = getTenantId(req);
      const { level } = req.body;
      
      // Check if KYC verification already exists
      const existingVerification = await KycService.getKycVerificationByUserId(userId, tenantId);
      
      if (existingVerification) {
        // If verification is already complete, reject starting a new one
        if (existingVerification.status === 'APPROVED') {
          return res.status(400).json({
            error: 'KYC verification is already approved.',
            verification: existingVerification
          });
        }
        
        // If verification was rejected or requires additional info, allow restarting
        if (['REJECTED', 'REQUIRES_ADDITIONAL_INFO'].includes(existingVerification.status)) {
          const updatedVerification = await KycService.updateKycVerification(
            existingVerification.id,
            {
              status: 'IN_PROGRESS',
              level: level || existingVerification.level,
              updatedAt: new Date()
            },
            tenantId
          );
          
          return res.json({
            message: 'KYC verification restarted successfully.',
            verification: updatedVerification
          });
        }
        
        // If verification is in progress, return current status
        return res.json({
          message: 'KYC verification is already in progress.',
          verification: existingVerification
        });
      }
      
      // Create new KYC verification
      const verification = await KycService.createKycVerification(userId, level, tenantId);
      
      return res.status(201).json({
        message: 'KYC verification started successfully.',
        verification
      });
    } catch (error) {
      console.error('Error starting KYC verification:', error);
      return res.status(500).json({ error: 'Failed to start KYC verification.' });
    }
  },
  
  /**
   * Upload document for KYC verification
   */
  uploadDocument: [
    // First middleware: handle file upload
    (req, res, next) => {
      upload.single('document')(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            // Multer error (file size, etc.)
            return res.status(400).json({ error: `Upload error: ${err.message}` });
          } else {
            // Other errors
            return res.status(400).json({ error: err.message });
          }
        }
        next();
      });
    },
    
    // Second middleware: process the uploaded file
    async (req, res) => {
      try {
        // Ensure file was uploaded
        if (!req.file) {
          return res.status(400).json({ error: 'No document file provided.' });
        }
        
        const userId = req.user.id;
        const tenantId = getTenantId(req);
        const { verificationId, documentType, documentNumber, issuingCountry, issuingAuthority, issueDate, expiryDate } = req.body;
        
        // Validate required fields
        if (!verificationId || !documentType) {
          await cleanupTempFile(req.file.path);
          return res.status(400).json({ error: 'Verification ID and document type are required.' });
        }
        
        // Verify the verification ID belongs to the current user
        const verification = await KycService.getKycVerificationById(verificationId, tenantId);
        
        if (!verification) {
          await cleanupTempFile(req.file.path);
          return res.status(404).json({ error: 'KYC verification not found.' });
        }
        
        if (verification.userId !== userId) {
          await cleanupTempFile(req.file.path);
          return res.status(403).json({ error: 'You are not authorized to upload documents for this verification.' });
        }
        
        // Prepare document metadata
        const documentData = {
          type: documentType,
          documentNumber,
          issuingCountry,
          issuingAuthority,
          issueDate,
          expiryDate,
          metadata: {}
        };
        
        // Read file
        const fileBuffer = await fs.readFile(req.file.path);
        
        // Upload document to KYC service
        const document = await KycService.uploadKycDocument(
          verificationId,
          documentData,
          fileBuffer,
          req.file.originalname,
          req.file.mimetype,
          tenantId
        );
        
        // Clean up temporary file
        await cleanupTempFile(req.file.path);
        
        // Return response without sensitive data
        return res.status(201).json({
          message: 'Document uploaded successfully.',
          document: {
            id: document.id,
            type: document.type,
            status: document.status,
            documentNumber: document.documentNumber,
            issuingCountry: document.issuingCountry,
            issuingAuthority: document.issuingAuthority,
            issueDate: document.issueDate,
            expiryDate: document.expiryDate,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt
          }
        });
      } catch (error) {
        // Clean up temporary file if it exists
        if (req.file) {
          await cleanupTempFile(req.file.path);
        }
        
        console.error('Error uploading document:', error);
        return res.status(500).json({ error: 'Failed to upload document.' });
      }
    }
  ],
  
  /**
   * Get document by ID
   */
  async getDocument(req, res) {
    try {
      const userId = req.user.id;
      const tenantId = getTenantId(req);
      const { documentId } = req.params;
      
      const document = await KycService.getDocumentById(documentId, tenantId);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found.' });
      }
      
      // Verify the document belongs to the current user or admin
      const verification = await KycService.getKycVerificationById(document.kycVerificationId, tenantId);
      
      if (!verification) {
        return res.status(404).json({ error: 'KYC verification not found.' });
      }
      
      // Allow access if the user is the owner or an admin
      const isAdmin = req.user.role === 'admin';
      const isOwner = verification.userId === userId;
      
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'You are not authorized to access this document.' });
      }
      
      // Return document metadata without sensitive information
      return res.json({
        id: document.id,
        type: document.type,
        status: document.status,
        documentNumber: document.documentNumber,
        issuingCountry: document.issuingCountry,
        issuingAuthority: document.issuingAuthority,
        issueDate: document.issueDate,
        expiryDate: document.expiryDate,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        kycVerificationId: document.kycVerificationId,
        rejectionReason: document.rejectionReason
      });
    } catch (error) {
      console.error('Error getting document:', error);
      return res.status(500).json({ error: 'Failed to get document.' });
    }
  },
  
  /**
   * Get document content
   */
  async getDocumentContent(req, res) {
    try {
      const userId = req.user.id;
      const tenantId = getTenantId(req);
      const { documentId } = req.params;
      const { signature, expires } = req.query;
      
      // Check if document exists
      const document = await KycService.getDocumentById(documentId, tenantId);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found.' });
      }
      
      // Option 1: Access via signed URL (anyone with the signed URL can access)
      if (signature && expires) {
        const isValid = await KycService.validateDocumentSignedUrl(documentId, signature, expires, tenantId);
        
        if (!isValid) {
          return res.status(403).json({ error: 'Invalid or expired signature.' });
        }
      } else {
        // Option 2: Access via authentication
        // Verify the document belongs to the current user or admin
        const verification = await KycService.getKycVerificationById(document.kycVerificationId, tenantId);
        
        if (!verification) {
          return res.status(404).json({ error: 'KYC verification not found.' });
        }
        
        // Allow access if the user is the owner or an admin
        const isAdmin = req.user.role === 'admin';
        const isOwner = verification.userId === userId;
        
        if (!isAdmin && !isOwner) {
          return res.status(403).json({ error: 'You are not authorized to access this document.' });
        }
      }
      
      // Get document content
      const { buffer, mimeType } = await KycService.getDocumentContent(documentId, tenantId);
      
      // Send document content
      res.set('Content-Type', mimeType);
      res.set('Content-Disposition', `inline; filename="${document.type.toLowerCase()}.${mimeType.split('/')[1]}"`);
      return res.send(buffer);
    } catch (error) {
      console.error('Error getting document content:', error);
      return res.status(500).json({ error: 'Failed to get document content.' });
    }
  },
  
  /**
   * Generate a signed URL for document access
   */
  async generateDocumentSignedUrl(req, res) {
    try {
      const userId = req.user.id;
      const tenantId = getTenantId(req);
      const { documentId } = req.params;
      const { expiryMinutes } = req.body;
      
      // Check if document exists
      const document = await KycService.getDocumentById(documentId, tenantId);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found.' });
      }
      
      // Verify the document belongs to the current user or admin
      const verification = await KycService.getKycVerificationById(document.kycVerificationId, tenantId);
      
      if (!verification) {
        return res.status(404).json({ error: 'KYC verification not found.' });
      }
      
      // Allow access if the user is the owner or an admin
      const isAdmin = req.user.role === 'admin';
      const isOwner = verification.userId === userId;
      
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: 'You are not authorized to generate a signed URL for this document.' });
      }
      
      // Generate signed URL
      const signedUrl = await KycService.generateDocumentSignedUrl(documentId, expiryMinutes || 15, tenantId);
      
      return res.json({
        signedUrl,
        expiresIn: expiryMinutes ? `${expiryMinutes} minutes` : '15 minutes'
      });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return res.status(500).json({ error: 'Failed to generate signed URL.' });
    }
  },
  
  /**
   * Submit KYC verification for review
   */
  async submitVerification(req, res) {
    try {
      const userId = req.user.id;
      const tenantId = getTenantId(req);
      const { verificationId } = req.params;
      
      // Verify the verification ID belongs to the current user
      const verification = await KycService.getKycVerificationById(verificationId, tenantId);
      
      if (!verification) {
        return res.status(404).json({ error: 'KYC verification not found.' });
      }
      
      if (verification.userId !== userId) {
        return res.status(403).json({ error: 'You are not authorized to submit this verification.' });
      }
      
      // Check verification status
      if (verification.status !== 'IN_PROGRESS') {
        return res.status(400).json({
          error: `Verification cannot be submitted because it is in ${verification.status} status.`,
          verification
        });
      }
      
      // Get documents
      const documents = await KycService.getVerificationDocuments(verificationId, tenantId);
      
      // Check if documents have been uploaded
      if (documents.length === 0) {
        return res.status(400).json({
          error: 'No documents have been uploaded. Please upload required documents before submitting.',
          verification
        });
      }
      
      // Update verification status to PENDING_REVIEW
      const updatedVerification = await KycService.updateKycVerification(
        verificationId,
        {
          status: 'PENDING_REVIEW',
          updatedAt: new Date()
        },
        tenantId
      );
      
      return res.json({
        message: 'KYC verification submitted for review successfully.',
        verification: updatedVerification
      });
    } catch (error) {
      console.error('Error submitting verification:', error);
      return res.status(500).json({ error: 'Failed to submit verification.' });
    }
  },
  
  /**
   * For admin: Get all KYC verifications with pagination
   */
  async getAllVerifications(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to access this resource.' });
      }
      
      const tenantId = getTenantId(req);
      const { page = 1, limit = 10, status } = req.query;
      
      // Get verifications
      const { verifications, pagination } = await KycService.getAllVerifications(
        parseInt(page),
        parseInt(limit),
        status,
        null,
        tenantId
      );
      
      return res.json({ verifications, pagination });
    } catch (error) {
      console.error('Error getting all verifications:', error);
      return res.status(500).json({ error: 'Failed to get verifications.' });
    }
  },
  
  /**
   * For admin: Get pending KYC verifications
   */
  async getPendingVerifications(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to access this resource.' });
      }
      
      const tenantId = getTenantId(req);
      const { page = 1, limit = 10 } = req.query;
      
      // Get pending verifications
      const { verifications, pagination } = await KycService.getPendingVerifications(
        parseInt(page),
        parseInt(limit),
        tenantId
      );
      
      return res.json({ verifications, pagination });
    } catch (error) {
      console.error('Error getting pending verifications:', error);
      return res.status(500).json({ error: 'Failed to get pending verifications.' });
    }
  },
  
  /**
   * For admin: Review a document
   */
  async reviewDocument(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to access this resource.' });
      }
      
      const tenantId = getTenantId(req);
      const { documentId } = req.params;
      const { status, rejectionReason } = req.body;
      
      // Validate input
      if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Valid status (APPROVED or REJECTED) is required.' });
      }
      
      if (status === 'REJECTED' && !rejectionReason) {
        return res.status(400).json({ error: 'Rejection reason is required when rejecting a document.' });
      }
      
      // Review document
      const document = await KycService.reviewDocument(
        documentId,
        status,
        {
          reviewedBy: req.user.id,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null
        },
        tenantId
      );
      
      return res.json({
        message: `Document ${status.toLowerCase()} successfully.`,
        document
      });
    } catch (error) {
      console.error('Error reviewing document:', error);
      return res.status(500).json({ error: 'Failed to review document.' });
    }
  },
  
  /**
   * For admin: Review a KYC verification
   */
  async reviewVerification(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to access this resource.' });
      }
      
      const tenantId = getTenantId(req);
      const { verificationId } = req.params;
      const { status, rejectionReason, additionalInfoRequired, expiryDate } = req.body;
      
      // Validate input
      if (!status || !['APPROVED', 'REJECTED', 'REQUIRES_ADDITIONAL_INFO'].includes(status)) {
        return res.status(400).json({ error: 'Valid status (APPROVED, REJECTED, or REQUIRES_ADDITIONAL_INFO) is required.' });
      }
      
      if (status === 'REJECTED' && !rejectionReason) {
        return res.status(400).json({ error: 'Rejection reason is required when rejecting a verification.' });
      }
      
      if (status === 'REQUIRES_ADDITIONAL_INFO' && !additionalInfoRequired) {
        return res.status(400).json({ error: 'Additional information required message is required when requesting additional information.' });
      }
      
      // Prepare update data
      const updateData = {
        status,
        reviewedBy: req.user.id,
        lastVerifiedAt: status === 'APPROVED' ? new Date() : null,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        additionalInfoRequired: status === 'REQUIRES_ADDITIONAL_INFO' ? additionalInfoRequired : null,
        expiresAt: status === 'APPROVED' && expiryDate ? new Date(expiryDate) : null,
        updatedAt: new Date()
      };
      
      // Update verification status
      const verification = await KycService.updateKycVerification(verificationId, updateData, tenantId);
      
      return res.json({
        message: `KYC verification ${status.toLowerCase()} successfully.`,
        verification
      });
    } catch (error) {
      console.error('Error reviewing verification:', error);
      return res.status(500).json({ error: 'Failed to review verification.' });
    }
  },
  
  /**
   * For admin: Get risk flags with pagination
   */
  async getRiskFlags(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to access this resource.' });
      }
      
      const tenantId = getTenantId(req);
      const { page = 1, limit = 10, severity, status } = req.query;
      
      // Get risk flags
      const { flags, pagination } = await KycService.getRiskFlags(
        parseInt(page),
        parseInt(limit),
        severity,
        status,
        null,
        tenantId
      );
      
      return res.json({ flags, pagination });
    } catch (error) {
      console.error('Error getting risk flags:', error);
      return res.status(500).json({ error: 'Failed to get risk flags.' });
    }
  },
  
  /**
   * For admin: Resolve a risk flag
   */
  async resolveRiskFlag(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to access this resource.' });
      }
      
      const tenantId = getTenantId(req);
      const { flagId } = req.params;
      const { status, resolutionNotes } = req.body;
      
      // Validate input
      if (!status || !['resolved', 'dismissed'].includes(status)) {
        return res.status(400).json({ error: 'Valid status (resolved or dismissed) is required.' });
      }
      
      if (!resolutionNotes) {
        return res.status(400).json({ error: 'Resolution notes are required.' });
      }
      
      // Resolve flag
      const flag = await KycService.resolveRiskFlag(
        flagId,
        {
          status,
          resolutionNotes,
          resolvedBy: req.user.id
        },
        tenantId
      );
      
      return res.json({
        message: `Risk flag ${status} successfully.`,
        flag
      });
    } catch (error) {
      console.error('Error resolving risk flag:', error);
      return res.status(500).json({ error: 'Failed to resolve risk flag.' });
    }
  },
  
  /**
   * For admin: Get compliance summary
   */
  async getComplianceSummary(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'You are not authorized to access this resource.' });
      }
      
      const tenantId = getTenantId(req);
      
      // Get compliance summary
      const summary = await KycService.getComplianceSummary(tenantId);
      
      return res.json(summary);
    } catch (error) {
      console.error('Error getting compliance summary:', error);
      return res.status(500).json({ error: 'Failed to get compliance summary.' });
    }
  }
};

module.exports = kycController;