/**
 * KYC Controller
 * 
 * Handles the business logic for KYC verification processes,
 * including document uploads, identity verification, and compliance checks.
 */

const KycService = require('../services/compliance/KycService');
const SanctionsService = require('../services/compliance/SanctionsService');
const { KycStatusEnum, DocumentStatusEnum } = require('../../shared/schema-kyc');

class KycController {
  /**
   * Get KYC verification by ID
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getKycVerification(req, res) {
    try {
      const verificationId = req.params.id;
      
      // Ensure user can only access their own verification or admin can access any
      const verification = await KycService.getKycVerificationById(verificationId);
      
      if (!verification) {
        return res.status(404).json({
          success: false,
          message: 'KYC verification not found',
        });
      }
      
      // If not admin, check if user is accessing their own verification
      if (req.user.role !== 'admin' && verification.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
      
      // Get related documents
      const documents = await KycService.getVerificationDocuments(verificationId);
      
      return res.status(200).json({
        success: true,
        data: {
          verification,
          documents,
        },
      });
    } catch (error) {
      console.error('Error fetching KYC verification:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch KYC verification',
        error: error.message,
      });
    }
  }
  
  /**
   * Get KYC verification by user ID
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getKycVerificationByUserId(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      
      // Ensure user can only access their own verification or admin can access any
      if (req.user.role !== 'admin' && userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
      
      const verification = await KycService.getKycVerificationByUserId(userId);
      
      if (!verification) {
        return res.status(200).json({
          success: true,
          data: null,
          message: 'No KYC verification found for this user',
        });
      }
      
      // Get related documents
      const documents = await KycService.getVerificationDocuments(verification.id);
      
      return res.status(200).json({
        success: true,
        data: {
          verification,
          documents,
        },
      });
    } catch (error) {
      console.error('Error fetching KYC verification by user ID:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch KYC verification',
        error: error.message,
      });
    }
  }
  
  /**
   * Initiate KYC verification process for a user
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async initiateKyc(req, res) {
    try {
      const { level } = req.body;
      const userId = req.user.id;
      
      // Check if user already has an active verification
      const existingVerification = await KycService.getKycVerificationByUserId(userId);
      
      if (existingVerification && 
          ![KycStatusEnum.REJECTED, KycStatusEnum.EXPIRED].includes(existingVerification.status)) {
        return res.status(400).json({
          success: false,
          message: 'User already has an active KYC verification',
          data: existingVerification,
        });
      }
      
      // Create new KYC verification
      const verification = await KycService.createKycVerification(userId, level);
      
      return res.status(201).json({
        success: true,
        message: 'KYC verification initiated successfully',
        data: verification,
      });
    } catch (error) {
      console.error('Error initiating KYC verification:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate KYC verification',
        error: error.message,
      });
    }
  }
  
  /**
   * Upload KYC document
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }
      
      const { kycVerificationId } = req.body;
      const documentData = JSON.parse(req.body.documentData || '{}');
      const fileBuffer = req.file.buffer;
      const fileName = req.file.originalname;
      const mimeType = req.file.mimetype;
      
      // Verify that the KYC verification belongs to the user
      const verification = await KycService.getKycVerificationById(kycVerificationId);
      
      if (!verification) {
        return res.status(404).json({
          success: false,
          message: 'KYC verification not found',
        });
      }
      
      if (verification.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
      
      // Upload document
      const document = await KycService.uploadKycDocument(
        kycVerificationId,
        documentData,
        fileBuffer,
        fileName,
        mimeType
      );
      
      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          documentId: document.id,
          type: document.type,
          status: document.status,
        },
      });
    } catch (error) {
      console.error('Error uploading KYC document:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload document',
        error: error.message,
      });
    }
  }
  
  /**
   * Get signed URL for document access
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getDocumentSignedUrl(req, res) {
    try {
      const documentId = req.params.id;
      const expiryMinutes = parseInt(req.query.expiryMinutes) || 15;
      
      // Verify user has access to this document
      const document = await KycService.getDocumentById(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }
      
      const verification = await KycService.getKycVerificationById(document.kycVerificationId);
      
      // Only allow access to owner or admin
      if (verification.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
      
      // Generate signed URL
      const signedUrl = await KycService.generateDocumentSignedUrl(documentId, expiryMinutes);
      
      return res.status(200).json({
        success: true,
        data: {
          signedUrl,
          expiresIn: `${expiryMinutes} minutes`,
        },
      });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate signed URL',
        error: error.message,
      });
    }
  }
  
  /**
   * Submit manual identity verification
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async submitManualIdentityVerification(req, res) {
    try {
      const { kycVerificationId, userData } = req.body;
      
      // Verify that the KYC verification belongs to the user
      const verification = await KycService.getKycVerificationById(kycVerificationId);
      
      if (!verification) {
        return res.status(404).json({
          success: false,
          message: 'KYC verification not found',
        });
      }
      
      if (verification.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
      
      // Update verification status
      const updatedVerification = await KycService.updateKycVerification(kycVerificationId, {
        status: KycStatusEnum.PENDING_REVIEW,
        updatedAt: new Date(),
      });
      
      return res.status(200).json({
        success: true,
        message: 'Identity verification submitted for review',
        data: updatedVerification,
      });
    } catch (error) {
      console.error('Error submitting identity verification:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit identity verification',
        error: error.message,
      });
    }
  }
  
  /**
   * Verify identity with Trulioo
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async verifyIdentityWithTrulioo(req, res) {
    try {
      const { kycVerificationId, userData } = req.body;
      
      // Verify that the KYC verification belongs to the user
      const verification = await KycService.getKycVerificationById(kycVerificationId);
      
      if (!verification) {
        return res.status(404).json({
          success: false,
          message: 'KYC verification not found',
        });
      }
      
      if (verification.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
      
      // Verify identity
      const verificationAttempt = await KycService.verifyIdentityWithTrulioo(kycVerificationId, userData);
      
      return res.status(200).json({
        success: verificationAttempt.success,
        message: verificationAttempt.success 
          ? 'Identity verified successfully' 
          : 'Identity verification failed',
        data: {
          verificationId: kycVerificationId,
          success: verificationAttempt.success,
          errorMessage: verificationAttempt.errorMessage,
        },
      });
    } catch (error) {
      console.error('Error verifying identity with Trulioo:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify identity',
        error: error.message,
      });
    }
  }
  
  /**
   * Verify identity with Smile Identity
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async verifyIdentityWithSmileIdentity(req, res) {
    try {
      const { kycVerificationId, userData } = req.body;
      
      // Verify that the KYC verification belongs to the user
      const verification = await KycService.getKycVerificationById(kycVerificationId);
      
      if (!verification) {
        return res.status(404).json({
          success: false,
          message: 'KYC verification not found',
        });
      }
      
      if (verification.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
      
      // Verify identity
      const verificationAttempt = await KycService.verifyIdentityWithSmileIdentity(kycVerificationId, userData);
      
      return res.status(200).json({
        success: verificationAttempt.success,
        message: verificationAttempt.success 
          ? 'Identity verified successfully' 
          : 'Identity verification failed',
        data: {
          verificationId: kycVerificationId,
          success: verificationAttempt.success,
          errorMessage: verificationAttempt.errorMessage,
        },
      });
    } catch (error) {
      console.error('Error verifying identity with Smile Identity:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify identity',
        error: error.message,
      });
    }
  }
  
  /**
   * Get user verification status
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getUserVerificationStatus(req, res) {
    try {
      const userId = req.user.id;
      
      // Get user's verification
      const verification = await KycService.getKycVerificationByUserId(userId);
      
      if (!verification) {
        return res.status(200).json({
          success: true,
          data: {
            status: 'not_started',
            message: 'KYC verification not started',
            isVerified: false,
          },
        });
      }
      
      // Get verification status message
      let statusMessage = '';
      let isVerified = false;
      
      switch (verification.status) {
        case KycStatusEnum.NOT_STARTED:
          statusMessage = 'KYC verification not started';
          break;
        case KycStatusEnum.IN_PROGRESS:
          statusMessage = 'KYC verification in progress';
          break;
        case KycStatusEnum.PENDING_REVIEW:
          statusMessage = 'KYC verification pending review';
          break;
        case KycStatusEnum.APPROVED:
          statusMessage = 'KYC verification approved';
          isVerified = true;
          break;
        case KycStatusEnum.REJECTED:
          statusMessage = verification.rejectionReason || 'KYC verification rejected';
          break;
        case KycStatusEnum.REQUIRES_ADDITIONAL_INFO:
          statusMessage = verification.additionalInfoRequired || 'Additional information required';
          break;
        case KycStatusEnum.EXPIRED:
          statusMessage = 'KYC verification expired';
          break;
        default:
          statusMessage = 'Unknown status';
      }
      
      return res.status(200).json({
        success: true,
        data: {
          verificationId: verification.id,
          status: verification.status,
          message: statusMessage,
          isVerified,
          expiresAt: verification.expiresAt,
          lastVerifiedAt: verification.lastVerifiedAt,
          level: verification.level,
        },
      });
    } catch (error) {
      console.error('Error getting user verification status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get verification status',
        error: error.message,
      });
    }
  }
  
  /**
   * Get all KYC verifications (admin only)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getAllVerifications(req, res) {
    try {
      // Parse query parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const search = req.query.search;
      
      // Get verifications with pagination
      const result = await KycService.getAllVerifications(page, limit, status, search);
      
      return res.status(200).json({
        success: true,
        data: result.verifications,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error getting all verifications:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get verifications',
        error: error.message,
      });
    }
  }
  
  /**
   * Get pending KYC verifications (admin only)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getPendingVerifications(req, res) {
    try {
      // Parse query parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      // Get pending verifications
      const result = await KycService.getPendingVerifications(page, limit);
      
      return res.status(200).json({
        success: true,
        data: result.verifications,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error getting pending verifications:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get pending verifications',
        error: error.message,
      });
    }
  }
  
  /**
   * Get document by ID (admin only)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getDocument(req, res) {
    try {
      const documentId = req.params.id;
      
      // Get document
      const document = await KycService.getDocumentById(documentId);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }
      
      // Generate signed URL
      const signedUrl = await KycService.generateDocumentSignedUrl(documentId, 60);
      
      return res.status(200).json({
        success: true,
        data: {
          document,
          signedUrl,
        },
      });
    } catch (error) {
      console.error('Error getting document:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get document',
        error: error.message,
      });
    }
  }
  
  /**
   * Review document (admin only)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async reviewDocument(req, res) {
    try {
      const documentId = req.params.id;
      const { status, rejectionReason } = req.body;
      
      // Validate status
      if (!Object.values(DocumentStatusEnum).includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
        });
      }
      
      // If rejecting, require a reason
      if (status === DocumentStatusEnum.REJECTED && !rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required',
        });
      }
      
      // Review document
      const document = await KycService.reviewDocument(documentId, status, {
        reviewedBy: req.user.id,
        rejectionReason,
      });
      
      return res.status(200).json({
        success: true,
        message: `Document ${status.toLowerCase()}`,
        data: document,
      });
    } catch (error) {
      console.error('Error reviewing document:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to review document',
        error: error.message,
      });
    }
  }
  
  /**
   * Review verification (admin only)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async reviewVerification(req, res) {
    try {
      const verificationId = req.params.id;
      const { status, rejectionReason, additionalInfoRequired, notes } = req.body;
      
      // Validate status
      if (!Object.values(KycStatusEnum).includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
        });
      }
      
      // If rejecting, require a reason
      if (status === KycStatusEnum.REJECTED && !rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required',
        });
      }
      
      // If requiring additional info, require details
      if (status === KycStatusEnum.REQUIRES_ADDITIONAL_INFO && !additionalInfoRequired) {
        return res.status(400).json({
          success: false,
          message: 'Additional information requirements must be specified',
        });
      }
      
      // Update verification
      const updateData = {
        status,
        reviewedBy: req.user.id,
        lastVerifiedAt: status === KycStatusEnum.APPROVED ? new Date() : undefined,
        rejectionReason: status === KycStatusEnum.REJECTED ? rejectionReason : undefined,
        additionalInfoRequired: status === KycStatusEnum.REQUIRES_ADDITIONAL_INFO ? additionalInfoRequired : undefined,
        notes,
      };
      
      const verification = await KycService.updateKycVerification(verificationId, updateData);
      
      // If approved, check if we need to set an expiration date
      if (status === KycStatusEnum.APPROVED && !verification.expiresAt) {
        // Set expiration date (e.g., 1 year from now)
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        
        await KycService.updateKycVerification(verificationId, {
          expiresAt,
        });
      }
      
      return res.status(200).json({
        success: true,
        message: `Verification ${status.toLowerCase()}`,
        data: verification,
      });
    } catch (error) {
      console.error('Error reviewing verification:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to review verification',
        error: error.message,
      });
    }
  }
  
  /**
   * Get risk flags (admin only)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getRiskFlags(req, res) {
    try {
      // Parse query parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const severity = req.query.severity;
      const status = req.query.status || 'open';
      const search = req.query.search;
      
      // Get risk flags
      const result = await KycService.getRiskFlags(page, limit, severity, status, search);
      
      return res.status(200).json({
        success: true,
        data: result.flags,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error getting risk flags:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get risk flags',
        error: error.message,
      });
    }
  }
  
  /**
   * Resolve risk flag (admin only)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async resolveRiskFlag(req, res) {
    try {
      const flagId = req.params.id;
      const { status, resolutionNotes } = req.body;
      
      // Validate status
      if (!['resolved', 'dismissed', 'investigating'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
        });
      }
      
      // Require resolution notes
      if (!resolutionNotes) {
        return res.status(400).json({
          success: false,
          message: 'Resolution notes are required',
        });
      }
      
      // Resolve flag
      const flag = await KycService.resolveRiskFlag(flagId, {
        status,
        resolutionNotes,
        resolvedBy: req.user.id,
      });
      
      return res.status(200).json({
        success: true,
        message: `Flag marked as ${status}`,
        data: flag,
      });
    } catch (error) {
      console.error('Error resolving risk flag:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to resolve risk flag',
        error: error.message,
      });
    }
  }
  
  /**
   * Get compliance summary (admin only)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getComplianceSummary(req, res) {
    try {
      // Get compliance summary
      const summary = await KycService.getComplianceSummary();
      
      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Error getting compliance summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get compliance summary',
        error: error.message,
      });
    }
  }
  
  /**
   * Get suspicious transactions (admin only)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getSuspiciousTransactions(req, res) {
    try {
      // Parse query parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const minRiskScore = parseInt(req.query.minRiskScore) || 70;
      
      // Get suspicious transactions
      const result = await KycService.getSuspiciousTransactions(page, limit, minRiskScore);
      
      return res.status(200).json({
        success: true,
        data: result.transactions,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error getting suspicious transactions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get suspicious transactions',
        error: error.message,
      });
    }
  }
  
  /**
   * Review transaction (admin only)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async reviewTransaction(req, res) {
    try {
      const transactionId = req.params.id;
      const { approved, reviewNotes } = req.body;
      
      // Validate inputs
      if (approved === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Approval status is required',
        });
      }
      
      if (!reviewNotes) {
        return res.status(400).json({
          success: false,
          message: 'Review notes are required',
        });
      }
      
      // Review transaction
      const transaction = await KycService.reviewTransaction(transactionId, {
        approved,
        reviewNotes,
        reviewedBy: req.user.id,
      });
      
      // If not approved, create a risk flag
      if (!approved) {
        const amlTransaction = await KycService.getTransactionById(transactionId);
        const verification = await KycService.getKycVerificationByUserId(amlTransaction.userId);
        
        if (verification) {
          await KycService.createRiskFlag(verification.id, amlTransaction.userId, {
            type: 'transaction_flagged',
            severity: 'HIGH',
            description: `Transaction ${transactionId} flagged by compliance officer: ${reviewNotes}`,
            evidence: {
              transactionId,
              amount: amlTransaction.amount,
              currency: amlTransaction.currency,
              reviewedBy: req.user.id,
              reviewNotes,
            },
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        message: approved ? 'Transaction approved' : 'Transaction flagged',
        data: transaction,
      });
    } catch (error) {
      console.error('Error reviewing transaction:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to review transaction',
        error: error.message,
      });
    }
  }
  
  /**
   * Screen for Politically Exposed Persons (PEP)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async screenPEP(req, res) {
    try {
      const { kycVerificationId, userData } = req.body;
      
      // Verify that the KYC verification belongs to the user
      const verification = await KycService.getKycVerificationById(kycVerificationId);
      
      if (!verification) {
        return res.status(404).json({
          success: false,
          message: 'KYC verification not found',
        });
      }
      
      if (verification.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
      
      // Perform PEP screening
      const result = await SanctionsService.screenPEP(userData, verification.id, verification.userId);
      
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error performing PEP screening:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to perform PEP screening',
        error: error.message,
      });
    }
  }
  
  /**
   * Screen against sanctions lists
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async screenSanctions(req, res) {
    try {
      const { kycVerificationId, userData } = req.body;
      
      // Verify that the KYC verification belongs to the user
      const verification = await KycService.getKycVerificationById(kycVerificationId);
      
      if (!verification) {
        return res.status(404).json({
          success: false,
          message: 'KYC verification not found',
        });
      }
      
      if (verification.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
      
      // Perform sanctions screening
      const result = await SanctionsService.screenSanctions(userData, verification.id, verification.userId);
      
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error performing sanctions screening:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to perform sanctions screening',
        error: error.message,
      });
    }
  }
  
  /**
   * Get screening results (admin only)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getScreeningResults(req, res) {
    try {
      // Parse query parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const type = req.query.type; // 'pep' or 'sanctions'
      const matchStatus = req.query.matchStatus; // 'match', 'no_match', 'potential_match'
      
      // Get screening results
      const result = await SanctionsService.getScreeningResults(page, limit, type, matchStatus);
      
      return res.status(200).json({
        success: true,
        data: result.screenings,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error getting screening results:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get screening results',
        error: error.message,
      });
    }
  }
}

module.exports = KycController;