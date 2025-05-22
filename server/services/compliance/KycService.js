/**
 * KYC Service
 * 
 * Handles KYC verification and document management processes
 * for the multi-tenant iREVA platform.
 */

const { db } = require('../../db');
const { eq, and, or, desc, isNull, gte, lte } = require('drizzle-orm');
const { randomUUID } = require('crypto');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Import schema
// In a real implementation, this would use dynamic imports or a different approach
// to handle potential ESM/CommonJS compatibility issues
const schemaKyc = require('../../../shared/schema-kyc');

// Configuration for file storage
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../../uploads');
const KYC_DOCUMENTS_DIR = path.join(UPLOAD_DIR, 'kyc-documents');

// Configuration for external API integrations
const TRULIOO_API_KEY = process.env.TRULIOO_API_KEY;
const TRULIOO_API_URL = process.env.TRULIOO_API_URL;
const SMILE_IDENTITY_API_KEY = process.env.SMILE_IDENTITY_API_KEY;
const SMILE_IDENTITY_API_URL = process.env.SMILE_IDENTITY_API_URL;

// Helper function to generate secure directory path for tenant isolation
const getTenantDocumentPath = (tenantId) => {
  // Create a secure hash of the tenant ID to use as a directory name
  // This ensures tenant isolation even at the filesystem level
  const hash = crypto.createHash('sha256').update(tenantId).digest('hex').substring(0, 16);
  return path.join(KYC_DOCUMENTS_DIR, hash);
};

class KycService {
  /**
   * Initialize the KYC service and ensure required directories exist
   */
  static async initialize() {
    try {
      // Ensure base upload directory exists
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      
      // Ensure KYC documents directory exists
      await fs.mkdir(KYC_DOCUMENTS_DIR, { recursive: true });
      
      console.log('KYC service initialized successfully');
    } catch (error) {
      console.error('Error initializing KYC service:', error);
      throw error;
    }
  }

  /**
   * Get a KYC verification by ID
   * 
   * @param {string} id - Verification ID
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object|null>} Verification or null if not found
   */
  static async getKycVerificationById(id, tenantId) {
    try {
      const query = db.select().from(schemaKyc.kycVerifications).where(eq(schemaKyc.kycVerifications.id, id));
      
      // Add tenant filter if provided
      if (tenantId) {
        query.where(eq(schemaKyc.kycVerifications.tenantId, tenantId));
      }
      
      const [verification] = await query.limit(1);
      return verification || null;
    } catch (error) {
      console.error(`Error getting KYC verification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get KYC verification by user ID
   * 
   * @param {number} userId - User ID
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object|null>} Verification or null if not found
   */
  static async getKycVerificationByUserId(userId, tenantId) {
    try {
      const query = db.select()
        .from(schemaKyc.kycVerifications)
        .where(eq(schemaKyc.kycVerifications.userId, userId))
        .orderBy(desc(schemaKyc.kycVerifications.createdAt));
      
      // Add tenant filter if provided
      if (tenantId) {
        query.where(eq(schemaKyc.kycVerifications.tenantId, tenantId));
      }
      
      const [verification] = await query.limit(1);
      return verification || null;
    } catch (error) {
      console.error(`Error getting KYC verification for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new KYC verification for a user
   * 
   * @param {number} userId - User ID
   * @param {string} level - Verification level (BASIC, INTERMEDIATE, ADVANCED)
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object>} Created verification
   */
  static async createKycVerification(userId, level, tenantId) {
    try {
      const [verification] = await db.insert(schemaKyc.kycVerifications)
        .values({
          id: randomUUID(),
          userId,
          level: level || 'BASIC',
          status: 'NOT_STARTED',
          riskLevel: 'LOW',
          createdAt: new Date(),
          updatedAt: new Date(),
          ...(tenantId && { tenantId }),
        })
        .returning();
      
      return verification;
    } catch (error) {
      console.error(`Error creating KYC verification for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update a KYC verification
   * 
   * @param {string} id - Verification ID
   * @param {object} updates - Fields to update
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object>} Updated verification
   */
  static async updateKycVerification(id, updates, tenantId) {
    try {
      // Ensure updatedAt is set
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };
      
      const query = db.update(schemaKyc.kycVerifications)
        .set(updateData)
        .where(eq(schemaKyc.kycVerifications.id, id));
      
      // Add tenant filter if provided
      if (tenantId) {
        query.where(eq(schemaKyc.kycVerifications.tenantId, tenantId));
      }
      
      const [updatedVerification] = await query.returning();
      
      return updatedVerification;
    } catch (error) {
      console.error(`Error updating KYC verification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get documents for a KYC verification
   * 
   * @param {string} kycVerificationId - Verification ID
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<Array<object>>} Array of documents
   */
  static async getVerificationDocuments(kycVerificationId, tenantId) {
    try {
      const query = db.select()
        .from(schemaKyc.kycDocuments)
        .where(eq(schemaKyc.kycDocuments.kycVerificationId, kycVerificationId))
        .orderBy(desc(schemaKyc.kycDocuments.createdAt));
      
      // Add tenant filter if provided
      if (tenantId) {
        query.where(eq(schemaKyc.kycDocuments.tenantId, tenantId));
      }
      
      const documents = await query;
      return documents;
    } catch (error) {
      console.error(`Error getting documents for KYC verification ${kycVerificationId}:`, error);
      throw error;
    }
  }

  /**
   * Get a document by ID
   * 
   * @param {string} id - Document ID
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object|null>} Document or null if not found
   */
  static async getDocumentById(id, tenantId) {
    try {
      const query = db.select()
        .from(schemaKyc.kycDocuments)
        .where(eq(schemaKyc.kycDocuments.id, id));
      
      // Add tenant filter if provided
      if (tenantId) {
        query.where(eq(schemaKyc.kycDocuments.tenantId, tenantId));
      }
      
      const [document] = await query.limit(1);
      return document || null;
    } catch (error) {
      console.error(`Error getting document ${id}:`, error);
      throw error;
    }
  }

  /**
   * Upload a KYC document
   * 
   * @param {string} kycVerificationId - Verification ID
   * @param {object} documentData - Document metadata
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - Original file name
   * @param {string} mimeType - File MIME type
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object>} Created document
   */
  static async uploadKycDocument(kycVerificationId, documentData, fileBuffer, fileName, mimeType, tenantId) {
    try {
      // Get verification to ensure it exists and to get the tenant ID if not provided
      const verification = await this.getKycVerificationById(kycVerificationId, tenantId);
      
      if (!verification) {
        throw new Error(`KYC verification ${kycVerificationId} not found`);
      }
      
      // Use verification's tenant ID if not provided
      tenantId = tenantId || verification.tenantId;
      
      // Create a secure directory for the tenant if it doesn't exist
      const tenantDocDir = getTenantDocumentPath(tenantId);
      await fs.mkdir(tenantDocDir, { recursive: true });
      
      // Generate a unique file name
      const fileId = randomUUID();
      const secureFileName = `${fileId}${path.extname(fileName)}`;
      const filePath = path.join(tenantDocDir, secureFileName);
      
      // Calculate file hash for integrity verification
      const fileHash = crypto
        .createHash('sha256')
        .update(fileBuffer)
        .digest('hex');
      
      // Generate encryption key and IV
      const encryptionKey = crypto.randomBytes(32);
      const iv = crypto.randomBytes(16);
      
      // Encrypt the file
      const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
      const encryptedBuffer = Buffer.concat([
        iv, // Prepend IV to encrypted data
        cipher.update(fileBuffer),
        cipher.final(),
      ]);
      
      // Save the encrypted file
      await fs.writeFile(filePath, encryptedBuffer);
      
      // Create document record in database
      const [document] = await db.insert(schemaKyc.kycDocuments)
        .values({
          id: fileId,
          kycVerificationId,
          type: documentData.type || 'OTHER',
          status: 'PENDING',
          documentNumber: documentData.documentNumber,
          issuingCountry: documentData.issuingCountry,
          issuingAuthority: documentData.issuingAuthority,
          issueDate: documentData.issueDate ? new Date(documentData.issueDate) : null,
          expiryDate: documentData.expiryDate ? new Date(documentData.expiryDate) : null,
          fileHash,
          fileUrl: filePath,
          fileEncryptionKey: encryptionKey.toString('hex'),
          metadata: documentData.metadata || {},
          createdAt: new Date(),
          updatedAt: new Date(),
          tenantId,
        })
        .returning();
      
      // Update verification status if it was NOT_STARTED
      if (verification.status === 'NOT_STARTED') {
        await this.updateKycVerification(kycVerificationId, {
          status: 'IN_PROGRESS',
          updatedAt: new Date(),
        }, tenantId);
      }
      
      return document;
    } catch (error) {
      console.error(`Error uploading document for KYC verification ${kycVerificationId}:`, error);
      throw error;
    }
  }

  /**
   * Generate a signed URL for accessing a document
   * 
   * @param {string} documentId - Document ID
   * @param {number} expiryMinutes - URL expiry in minutes
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<string>} Signed URL
   */
  static async generateDocumentSignedUrl(documentId, expiryMinutes = 15, tenantId) {
    try {
      // Get document to ensure it exists and to get the tenant ID if not provided
      const document = await this.getDocumentById(documentId, tenantId);
      
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }
      
      // Use document's tenant ID if not provided
      tenantId = tenantId || document.tenantId;
      
      // Simple implementation of signed URL for demo purposes
      // In a real implementation, this would use a more secure mechanism
      const expires = Date.now() + (expiryMinutes * 60 * 1000);
      const signature = crypto
        .createHmac('sha256', process.env.FILE_SIGNATURE_SECRET || 'default-secret')
        .update(`${documentId}:${expires}:${tenantId}`)
        .digest('hex');
      
      // Return signed URL
      return `/api/kyc/documents/${documentId}/content?signature=${signature}&expires=${expires}`;
    } catch (error) {
      console.error(`Error generating signed URL for document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Validate a document signed URL
   * 
   * @param {string} documentId - Document ID
   * @param {string} signature - URL signature
   * @param {number} expires - Expiry timestamp
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<boolean>} Whether URL is valid
   */
  static async validateDocumentSignedUrl(documentId, signature, expires, tenantId) {
    try {
      // Get document to ensure it exists and to get the tenant ID if not provided
      const document = await this.getDocumentById(documentId, tenantId);
      
      if (!document) {
        return false;
      }
      
      // Use document's tenant ID if not provided
      tenantId = tenantId || document.tenantId;
      
      // Check if URL has expired
      if (Date.now() > expires) {
        return false;
      }
      
      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.FILE_SIGNATURE_SECRET || 'default-secret')
        .update(`${documentId}:${expires}:${tenantId}`)
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error(`Error validating signed URL for document ${documentId}:`, error);
      return false;
    }
  }

  /**
   * Get document content
   * 
   * @param {string} documentId - Document ID
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<{buffer: Buffer, mimeType: string}>} Document content and MIME type
   */
  static async getDocumentContent(documentId, tenantId) {
    try {
      // Get document to ensure it exists and to get the tenant ID if not provided
      const document = await this.getDocumentById(documentId, tenantId);
      
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }
      
      // Use document's tenant ID if not provided
      tenantId = tenantId || document.tenantId;
      
      // Read encrypted file
      const encryptedData = await fs.readFile(document.fileUrl);
      
      // Extract IV and encrypted content
      const iv = encryptedData.slice(0, 16);
      const encryptedBuffer = encryptedData.slice(16);
      
      // Decrypt file
      const encryptionKey = Buffer.from(document.fileEncryptionKey, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
      const buffer = Buffer.concat([
        decipher.update(encryptedBuffer),
        decipher.final(),
      ]);
      
      // Determine MIME type from file extension
      const ext = path.extname(document.fileUrl).toLowerCase();
      let mimeType = 'application/octet-stream';
      
      if (ext === '.pdf') mimeType = 'application/pdf';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';
      
      return { buffer, mimeType };
    } catch (error) {
      console.error(`Error getting document content for ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Review a document (approve or reject)
   * 
   * @param {string} documentId - Document ID
   * @param {string} status - New status (APPROVED, REJECTED)
   * @param {object} options - Additional options
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object>} Updated document
   */
  static async reviewDocument(documentId, status, options = {}, tenantId) {
    try {
      // Get document to ensure it exists and to get the tenant ID if not provided
      const document = await this.getDocumentById(documentId, tenantId);
      
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }
      
      // Use document's tenant ID if not provided
      tenantId = tenantId || document.tenantId;
      
      // Update document status
      const updateData = {
        status,
        reviewedBy: options.reviewedBy,
        rejectionReason: status === 'REJECTED' ? options.rejectionReason : null,
        updatedAt: new Date(),
      };
      
      const [updatedDocument] = await db.update(schemaKyc.kycDocuments)
        .set(updateData)
        .where(eq(schemaKyc.kycDocuments.id, documentId))
        .returning();
      
      // Check if all documents for the verification are APPROVED or REJECTED
      const documents = await this.getVerificationDocuments(document.kycVerificationId, tenantId);
      
      const allApproved = documents.every(doc => doc.status === 'APPROVED');
      const anyRejected = documents.some(doc => doc.status === 'REJECTED');
      
      // Update verification status if needed
      let updateVerification = null;
      
      if (anyRejected) {
        updateVerification = {
          status: 'REQUIRES_ADDITIONAL_INFO',
          additionalInfoRequired: 'One or more documents were rejected. Please upload new documents.',
          updatedAt: new Date(),
        };
      } else if (allApproved) {
        updateVerification = {
          status: 'PENDING_REVIEW',
          updatedAt: new Date(),
        };
      }
      
      if (updateVerification) {
        await this.updateKycVerification(document.kycVerificationId, updateVerification, tenantId);
      }
      
      return updatedDocument;
    } catch (error) {
      console.error(`Error reviewing document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Verify identity with Trulioo (mock implementation)
   * 
   * @param {string} kycVerificationId - Verification ID
   * @param {object} userData - User data for verification
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<{success: boolean, errorMessage?: string}>} Verification result
   */
  static async verifyIdentityWithTrulioo(kycVerificationId, userData, tenantId) {
    try {
      // Get verification to ensure it exists and to get the tenant ID if not provided
      const verification = await this.getKycVerificationById(kycVerificationId, tenantId);
      
      if (!verification) {
        throw new Error(`KYC verification ${kycVerificationId} not found`);
      }
      
      // Use verification's tenant ID if not provided
      tenantId = tenantId || verification.tenantId;
      
      // Mock implementation for demo purposes
      // In a real implementation, this would call the Trulioo API
      
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      const updateData = {
        status: success ? 'PENDING_REVIEW' : 'REQUIRES_ADDITIONAL_INFO',
        additionalInfoRequired: !success ? 'Identity verification failed with Trulioo. Please try again or use a different verification method.' : null,
        updatedAt: new Date(),
      };
      
      await this.updateKycVerification(kycVerificationId, updateData, tenantId);
      
      return {
        success,
        errorMessage: success ? null : 'Identity verification failed',
      };
    } catch (error) {
      console.error(`Error verifying identity with Trulioo for KYC verification ${kycVerificationId}:`, error);
      throw error;
    }
  }

  /**
   * Verify identity with Smile Identity (mock implementation)
   * 
   * @param {string} kycVerificationId - Verification ID
   * @param {object} userData - User data for verification
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<{success: boolean, errorMessage?: string}>} Verification result
   */
  static async verifyIdentityWithSmileIdentity(kycVerificationId, userData, tenantId) {
    try {
      // Get verification to ensure it exists and to get the tenant ID if not provided
      const verification = await this.getKycVerificationById(kycVerificationId, tenantId);
      
      if (!verification) {
        throw new Error(`KYC verification ${kycVerificationId} not found`);
      }
      
      // Use verification's tenant ID if not provided
      tenantId = tenantId || verification.tenantId;
      
      // Mock implementation for demo purposes
      // In a real implementation, this would call the Smile Identity API
      
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      const updateData = {
        status: success ? 'PENDING_REVIEW' : 'REQUIRES_ADDITIONAL_INFO',
        additionalInfoRequired: !success ? 'Identity verification failed with Smile Identity. Please try again or use a different verification method.' : null,
        updatedAt: new Date(),
      };
      
      await this.updateKycVerification(kycVerificationId, updateData, tenantId);
      
      return {
        success,
        errorMessage: success ? null : 'Identity verification failed',
      };
    } catch (error) {
      console.error(`Error verifying identity with Smile Identity for KYC verification ${kycVerificationId}:`, error);
      throw error;
    }
  }

  /**
   * Create a risk flag
   * 
   * @param {string} kycVerificationId - Verification ID
   * @param {number} userId - User ID
   * @param {object} flagData - Flag data
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object>} Created flag
   */
  static async createRiskFlag(kycVerificationId, userId, flagData, tenantId) {
    try {
      // Get verification to ensure it exists and to get the tenant ID if not provided
      const verification = await this.getKycVerificationById(kycVerificationId, tenantId);
      
      if (!verification) {
        throw new Error(`KYC verification ${kycVerificationId} not found`);
      }
      
      // Use verification's tenant ID if not provided
      tenantId = tenantId || verification.tenantId;
      
      // Create flag
      const [flag] = await db.insert(schemaKyc.riskFlags)
        .values({
          id: randomUUID(),
          kycVerificationId,
          userId,
          type: flagData.type,
          severity: flagData.severity,
          description: flagData.description,
          evidence: flagData.evidence || {},
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
          tenantId,
        })
        .returning();
      
      // Update verification risk level based on new flag severity
      const newRiskLevel = this.calculateRiskLevel(verification.riskLevel, flagData.severity);
      
      if (newRiskLevel !== verification.riskLevel) {
        await this.updateKycVerification(kycVerificationId, {
          riskLevel: newRiskLevel,
          updatedAt: new Date(),
        }, tenantId);
      }
      
      return flag;
    } catch (error) {
      console.error(`Error creating risk flag for KYC verification ${kycVerificationId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate new risk level based on current level and new flag severity
   * 
   * @param {string} currentRiskLevel - Current risk level
   * @param {string} flagSeverity - New flag severity
   * @returns {string} New risk level
   */
  static calculateRiskLevel(currentRiskLevel, flagSeverity) {
    const riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const currentIndex = riskLevels.indexOf(currentRiskLevel);
    const flagIndex = riskLevels.indexOf(flagSeverity);
    
    // Use the higher risk level
    return riskLevels[Math.max(currentIndex, flagIndex)];
  }

  /**
   * Get risk flags for a verification
   * 
   * @param {string} kycVerificationId - Verification ID
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<Array<object>>} Risk flags
   */
  static async getVerificationRiskFlags(kycVerificationId, tenantId) {
    try {
      const query = db.select()
        .from(schemaKyc.riskFlags)
        .where(eq(schemaKyc.riskFlags.kycVerificationId, kycVerificationId))
        .orderBy(desc(schemaKyc.riskFlags.createdAt));
      
      // Add tenant filter if provided
      if (tenantId) {
        query.where(eq(schemaKyc.riskFlags.tenantId, tenantId));
      }
      
      const flags = await query;
      return flags;
    } catch (error) {
      console.error(`Error getting risk flags for KYC verification ${kycVerificationId}:`, error);
      throw error;
    }
  }

  /**
   * Get risk flags with pagination
   * 
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @param {string} [severity] - Filter by severity
   * @param {string} [status] - Filter by status
   * @param {string} [search] - Search term
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<{flags: Array<object>, pagination: object}>} Flags with pagination
   */
  static async getRiskFlags(page = 1, limit = 10, severity = null, status = null, search = null, tenantId = null) {
    try {
      const offset = (page - 1) * limit;
      
      // Build query
      let query = db.select({
        ...schemaKyc.riskFlags,
      })
        .from(schemaKyc.riskFlags)
        .orderBy(desc(schemaKyc.riskFlags.createdAt));
      
      // Add filters
      if (severity) {
        query = query.where(eq(schemaKyc.riskFlags.severity, severity));
      }
      
      if (status) {
        query = query.where(eq(schemaKyc.riskFlags.status, status));
      }
      
      // Add tenant filter if provided
      if (tenantId) {
        query = query.where(eq(schemaKyc.riskFlags.tenantId, tenantId));
      }
      
      // TODO: Implement search functionality
      
      // Get total count for pagination
      const countQuery = db.select({ count: sql`COUNT(*)` })
        .from(schemaKyc.riskFlags);
      
      // Copy filters to count query
      if (severity) {
        countQuery.where(eq(schemaKyc.riskFlags.severity, severity));
      }
      
      if (status) {
        countQuery.where(eq(schemaKyc.riskFlags.status, status));
      }
      
      if (tenantId) {
        countQuery.where(eq(schemaKyc.riskFlags.tenantId, tenantId));
      }
      
      const [countResult] = await countQuery;
      const total = parseInt(countResult?.count || '0');
      
      // Get paginated results
      const flags = await query.limit(limit).offset(offset);
      
      return {
        flags,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting risk flags:', error);
      throw error;
    }
  }

  /**
   * Resolve a risk flag
   * 
   * @param {string} flagId - Flag ID
   * @param {object} resolutionData - Resolution data
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object>} Updated flag
   */
  static async resolveRiskFlag(flagId, resolutionData, tenantId) {
    try {
      // Get flag to ensure it exists and to get the tenant ID if not provided
      const flag = await this.getRiskFlagById(flagId, tenantId);
      
      if (!flag) {
        throw new Error(`Risk flag ${flagId} not found`);
      }
      
      // Use flag's tenant ID if not provided
      tenantId = tenantId || flag.tenantId;
      
      // Update flag
      const updateData = {
        status: resolutionData.status,
        resolutionNotes: resolutionData.resolutionNotes,
        resolvedBy: resolutionData.resolvedBy,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      };
      
      const [updatedFlag] = await db.update(schemaKyc.riskFlags)
        .set(updateData)
        .where(eq(schemaKyc.riskFlags.id, flagId))
        .returning();
      
      return updatedFlag;
    } catch (error) {
      console.error(`Error resolving risk flag ${flagId}:`, error);
      throw error;
    }
  }

  /**
   * Get a risk flag by ID
   * 
   * @param {string} id - Flag ID
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object|null>} Flag or null if not found
   */
  static async getRiskFlagById(id, tenantId) {
    try {
      const query = db.select()
        .from(schemaKyc.riskFlags)
        .where(eq(schemaKyc.riskFlags.id, id));
      
      // Add tenant filter if provided
      if (tenantId) {
        query.where(eq(schemaKyc.riskFlags.tenantId, tenantId));
      }
      
      const [flag] = await query.limit(1);
      return flag || null;
    } catch (error) {
      console.error(`Error getting risk flag ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all KYC verifications with pagination
   * 
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @param {string} [status] - Filter by status
   * @param {string} [search] - Search term
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<{verifications: Array<object>, pagination: object}>} Verifications with pagination
   */
  static async getAllVerifications(page = 1, limit = 10, status = null, search = null, tenantId = null) {
    try {
      const offset = (page - 1) * limit;
      
      // Build query
      let query = db.select()
        .from(schemaKyc.kycVerifications)
        .orderBy(desc(schemaKyc.kycVerifications.createdAt));
      
      // Add filters
      if (status) {
        query = query.where(eq(schemaKyc.kycVerifications.status, status));
      }
      
      // Add tenant filter if provided
      if (tenantId) {
        query = query.where(eq(schemaKyc.kycVerifications.tenantId, tenantId));
      }
      
      // TODO: Implement search functionality
      
      // Get total count for pagination
      const countQuery = db.select({ count: sql`COUNT(*)` })
        .from(schemaKyc.kycVerifications);
      
      // Copy filters to count query
      if (status) {
        countQuery.where(eq(schemaKyc.kycVerifications.status, status));
      }
      
      if (tenantId) {
        countQuery.where(eq(schemaKyc.kycVerifications.tenantId, tenantId));
      }
      
      const [countResult] = await countQuery;
      const total = parseInt(countResult?.count || '0');
      
      // Get paginated results
      const verifications = await query.limit(limit).offset(offset);
      
      return {
        verifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting all verifications:', error);
      throw error;
    }
  }

  /**
   * Get pending KYC verifications with pagination
   * 
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<{verifications: Array<object>, pagination: object}>} Verifications with pagination
   */
  static async getPendingVerifications(page = 1, limit = 10, tenantId = null) {
    return this.getAllVerifications(page, limit, 'PENDING_REVIEW', null, tenantId);
  }

  /**
   * Get transactions by user ID
   * 
   * @param {number} userId - User ID
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<Array<object>>} Transactions
   */
  static async getTransactionsByUserId(userId, tenantId) {
    try {
      // This is a placeholder function that would interact with a transactions table
      // In a real implementation, this would be more sophisticated
      return [];
    } catch (error) {
      console.error(`Error getting transactions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   * 
   * @param {string} id - Transaction ID
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object|null>} Transaction or null if not found
   */
  static async getTransactionById(id, tenantId) {
    try {
      // This is a placeholder function that would interact with a transactions table
      // In a real implementation, this would be more sophisticated
      return null;
    } catch (error) {
      console.error(`Error getting transaction ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get suspicious transactions with pagination
   * 
   * @param {number} page - Page number
   * @param {number} limit - Results per page
   * @param {number} [minRiskScore] - Minimum risk score
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<{transactions: Array<object>, pagination: object}>} Transactions with pagination
   */
  static async getSuspiciousTransactions(page = 1, limit = 10, minRiskScore = 70, tenantId = null) {
    try {
      const offset = (page - 1) * limit;
      
      // Build query
      let query = db.select()
        .from(schemaKyc.suspiciousTransactions)
        .where(gte(schemaKyc.suspiciousTransactions.riskScore, minRiskScore))
        .orderBy(desc(schemaKyc.suspiciousTransactions.riskScore), desc(schemaKyc.suspiciousTransactions.createdAt));
      
      // Add tenant filter if provided
      if (tenantId) {
        query = query.where(eq(schemaKyc.suspiciousTransactions.tenantId, tenantId));
      }
      
      // Get total count for pagination
      const countQuery = db.select({ count: sql`COUNT(*)` })
        .from(schemaKyc.suspiciousTransactions)
        .where(gte(schemaKyc.suspiciousTransactions.riskScore, minRiskScore));
      
      if (tenantId) {
        countQuery.where(eq(schemaKyc.suspiciousTransactions.tenantId, tenantId));
      }
      
      const [countResult] = await countQuery;
      const total = parseInt(countResult?.count || '0');
      
      // Get paginated results
      const transactions = await query.limit(limit).offset(offset);
      
      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting suspicious transactions:', error);
      throw error;
    }
  }

  /**
   * Review a suspicious transaction
   * 
   * @param {string} transactionId - Transaction ID
   * @param {object} reviewData - Review data
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object>} Updated transaction
   */
  static async reviewTransaction(transactionId, reviewData, tenantId) {
    try {
      // Get transaction to ensure it exists and to get the tenant ID if not provided
      const transaction = await this.getSuspiciousTransactionById(transactionId, tenantId);
      
      if (!transaction) {
        throw new Error(`Suspicious transaction ${transactionId} not found`);
      }
      
      // Use transaction's tenant ID if not provided
      tenantId = tenantId || transaction.tenantId;
      
      // Update transaction
      const updateData = {
        status: reviewData.approved ? 'approved' : 'rejected',
        approved: reviewData.approved,
        reviewNotes: reviewData.reviewNotes,
        reviewedBy: reviewData.reviewedBy,
        reviewedAt: new Date(),
      };
      
      const [updatedTransaction] = await db.update(schemaKyc.suspiciousTransactions)
        .set(updateData)
        .where(eq(schemaKyc.suspiciousTransactions.id, transactionId))
        .returning();
      
      return updatedTransaction;
    } catch (error) {
      console.error(`Error reviewing suspicious transaction ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Get a suspicious transaction by ID
   * 
   * @param {string} id - Transaction ID
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object|null>} Transaction or null if not found
   */
  static async getSuspiciousTransactionById(id, tenantId) {
    try {
      const query = db.select()
        .from(schemaKyc.suspiciousTransactions)
        .where(eq(schemaKyc.suspiciousTransactions.id, id));
      
      // Add tenant filter if provided
      if (tenantId) {
        query.where(eq(schemaKyc.suspiciousTransactions.tenantId, tenantId));
      }
      
      const [transaction] = await query.limit(1);
      return transaction || null;
    } catch (error) {
      console.error(`Error getting suspicious transaction ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get compliance summary
   * 
   * @param {string} [tenantId] - Tenant ID for multi-tenant support
   * @returns {Promise<object>} Compliance summary
   */
  static async getComplianceSummary(tenantId) {
    try {
      // Build query for KYC stats
      let kycQuery = db.select({
        total: sql`COUNT(*)`,
        approved: sql`SUM(CASE WHEN ${schemaKyc.kycVerifications.status} = 'APPROVED' THEN 1 ELSE 0 END)`,
        pending: sql`SUM(CASE WHEN ${schemaKyc.kycVerifications.status} = 'PENDING_REVIEW' THEN 1 ELSE 0 END)`,
        rejected: sql`SUM(CASE WHEN ${schemaKyc.kycVerifications.status} = 'REJECTED' THEN 1 ELSE 0 END)`,
        requiresInfo: sql`SUM(CASE WHEN ${schemaKyc.kycVerifications.status} = 'REQUIRES_ADDITIONAL_INFO' THEN 1 ELSE 0 END)`,
        expired: sql`SUM(CASE WHEN ${schemaKyc.kycVerifications.status} = 'EXPIRED' THEN 1 ELSE 0 END)`,
        inProgress: sql`SUM(CASE WHEN ${schemaKyc.kycVerifications.status} = 'IN_PROGRESS' THEN 1 ELSE 0 END)`,
        notStarted: sql`SUM(CASE WHEN ${schemaKyc.kycVerifications.status} = 'NOT_STARTED' THEN 1 ELSE 0 END)`,
      })
        .from(schemaKyc.kycVerifications);
      
      // Add tenant filter if provided
      if (tenantId) {
        kycQuery = kycQuery.where(eq(schemaKyc.kycVerifications.tenantId, tenantId));
      }
      
      // Build query for risk flags
      let flagsQuery = db.select({
        total: sql`COUNT(*)`,
        open: sql`SUM(CASE WHEN ${schemaKyc.riskFlags.status} = 'open' THEN 1 ELSE 0 END)`,
        resolved: sql`SUM(CASE WHEN ${schemaKyc.riskFlags.status} = 'resolved' THEN 1 ELSE 0 END)`,
        dismissed: sql`SUM(CASE WHEN ${schemaKyc.riskFlags.status} = 'dismissed' THEN 1 ELSE 0 END)`,
        critical: sql`SUM(CASE WHEN ${schemaKyc.riskFlags.severity} = 'CRITICAL' THEN 1 ELSE 0 END)`,
        high: sql`SUM(CASE WHEN ${schemaKyc.riskFlags.severity} = 'HIGH' THEN 1 ELSE 0 END)`,
        medium: sql`SUM(CASE WHEN ${schemaKyc.riskFlags.severity} = 'MEDIUM' THEN 1 ELSE 0 END)`,
        low: sql`SUM(CASE WHEN ${schemaKyc.riskFlags.severity} = 'LOW' THEN 1 ELSE 0 END)`,
      })
        .from(schemaKyc.riskFlags);
      
      // Add tenant filter if provided
      if (tenantId) {
        flagsQuery = flagsQuery.where(eq(schemaKyc.riskFlags.tenantId, tenantId));
      }
      
      // Build query for suspicious transactions
      let transactionsQuery = db.select({
        total: sql`COUNT(*)`,
        pending: sql`SUM(CASE WHEN ${schemaKyc.suspiciousTransactions.status} = 'pending_review' THEN 1 ELSE 0 END)`,
        approved: sql`SUM(CASE WHEN ${schemaKyc.suspiciousTransactions.status} = 'approved' THEN 1 ELSE 0 END)`,
        rejected: sql`SUM(CASE WHEN ${schemaKyc.suspiciousTransactions.status} = 'rejected' THEN 1 ELSE 0 END)`,
        highRisk: sql`SUM(CASE WHEN ${schemaKyc.suspiciousTransactions.riskScore} >= 80 THEN 1 ELSE 0 END)`,
        mediumRisk: sql`SUM(CASE WHEN ${schemaKyc.suspiciousTransactions.riskScore} >= 60 AND ${schemaKyc.suspiciousTransactions.riskScore} < 80 THEN 1 ELSE 0 END)`,
        lowRisk: sql`SUM(CASE WHEN ${schemaKyc.suspiciousTransactions.riskScore} < 60 THEN 1 ELSE 0 END)`,
      })
        .from(schemaKyc.suspiciousTransactions);
      
      // Add tenant filter if provided
      if (tenantId) {
        transactionsQuery = transactionsQuery.where(eq(schemaKyc.suspiciousTransactions.tenantId, tenantId));
      }
      
      // Execute queries in parallel
      const [kycStats, flagStats, transactionStats] = await Promise.all([
        kycQuery.then(results => results[0]),
        flagsQuery.then(results => results[0]),
        transactionsQuery.then(results => results[0]),
      ]);
      
      // Calculate KYC completion rate
      const totalKyc = parseInt(kycStats.total || '0');
      const approvedKyc = parseInt(kycStats.approved || '0');
      const kycCompletionRate = totalKyc > 0 ? (approvedKyc / totalKyc) * 100 : 0;
      
      // Calculate flag resolution rate
      const totalFlags = parseInt(flagStats.total || '0');
      const resolvedFlags = parseInt(flagStats.resolved || '0') + parseInt(flagStats.dismissed || '0');
      const flagResolutionRate = totalFlags > 0 ? (resolvedFlags / totalFlags) * 100 : 0;
      
      // Build summary
      return {
        kyc: {
          total: totalKyc,
          approved: parseInt(kycStats.approved || '0'),
          pending: parseInt(kycStats.pending || '0'),
          rejected: parseInt(kycStats.rejected || '0'),
          requiresInfo: parseInt(kycStats.requiresInfo || '0'),
          expired: parseInt(kycStats.expired || '0'),
          inProgress: parseInt(kycStats.inProgress || '0'),
          notStarted: parseInt(kycStats.notStarted || '0'),
          completionRate: kycCompletionRate.toFixed(2),
        },
        riskFlags: {
          total: totalFlags,
          open: parseInt(flagStats.open || '0'),
          resolved: parseInt(flagStats.resolved || '0'),
          dismissed: parseInt(flagStats.dismissed || '0'),
          critical: parseInt(flagStats.critical || '0'),
          high: parseInt(flagStats.high || '0'),
          medium: parseInt(flagStats.medium || '0'),
          low: parseInt(flagStats.low || '0'),
          resolutionRate: flagResolutionRate.toFixed(2),
        },
        suspiciousTransactions: {
          total: parseInt(transactionStats.total || '0'),
          pending: parseInt(transactionStats.pending || '0'),
          approved: parseInt(transactionStats.approved || '0'),
          rejected: parseInt(transactionStats.rejected || '0'),
          highRisk: parseInt(transactionStats.highRisk || '0'),
          mediumRisk: parseInt(transactionStats.mediumRisk || '0'),
          lowRisk: parseInt(transactionStats.lowRisk || '0'),
        },
      };
    } catch (error) {
      console.error('Error getting compliance summary:', error);
      throw error;
    }
  }
}

// Initialize on module load
if (!process.env.SKIP_KYC_INIT) {
  KycService.initialize().catch(error => {
    console.error('Failed to initialize KYC service:', error);
  });
}

module.exports = KycService;