/**
 * KYC Service
 * 
 * Handles KYC verification processes, document management, and integration
 * with third-party identity verification providers.
 * 
 * Features:
 * - Secure document storage with encryption at rest
 * - Integration with identity verification services (Trulioo, Smile Identity)
 * - Risk assessment and flagging system
 * - Compliance tracking and reporting
 */

const crypto = require('crypto');
const { randomUUID } = require('crypto');
const { db } = require('../../db');
const { eq, and, or, desc, sql } = require('drizzle-orm');
const axios = require('axios');
const { 
  kycVerifications, 
  kycDocuments, 
  kycVerificationAttempts,
  kycRiskFlags,
  amlTransactionMonitoring,
  KycStatusEnum,
  DocumentStatusEnum,
  VerificationMethodEnum,
  RiskLevelEnum,
  FlagTypeEnum
} = require('../../../shared/schema-kyc');

// For file encryption/decryption
const algorithm = 'aes-256-gcm';
const masterKeyId = process.env.KYC_ENCRYPTION_MASTER_KEY_ID || 'master-key-1';
const masterKey = process.env.KYC_ENCRYPTION_MASTER_KEY;

// Third-party API configurations
const truliooConfig = {
  baseUrl: process.env.TRULIOO_API_URL,
  apiKey: process.env.TRULIOO_API_KEY,
};

const smileIdentityConfig = {
  baseUrl: process.env.SMILE_IDENTITY_API_URL,
  apiKey: process.env.SMILE_IDENTITY_API_KEY,
  partnerId: process.env.SMILE_IDENTITY_PARTNER_ID,
};

class KycService {
  /**
   * Create a new KYC verification record for a user
   * 
   * @param {number} userId - User ID
   * @param {string} level - KYC verification level
   * @returns {Promise<object>} The created KYC verification record
   */
  static async createKycVerification(userId, level = 'STANDARD') {
    try {
      const [verification] = await db
        .insert(kycVerifications)
        .values({
          userId,
          status: KycStatusEnum.NOT_STARTED,
          level,
          riskLevel: RiskLevelEnum.LOW,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return verification;
    } catch (error) {
      console.error('Error creating KYC verification:', error);
      throw error;
    }
  }

  /**
   * Get KYC verification record by ID
   * 
   * @param {string} id - KYC verification ID
   * @returns {Promise<object|null>} KYC verification record or null if not found
   */
  static async getKycVerificationById(id) {
    try {
      const [verification] = await db
        .select()
        .from(kycVerifications)
        .where(eq(kycVerifications.id, id));

      return verification || null;
    } catch (error) {
      console.error(`Error getting KYC verification with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get KYC verification record by user ID
   * 
   * @param {number} userId - User ID
   * @returns {Promise<object|null>} KYC verification record or null if not found
   */
  static async getKycVerificationByUserId(userId) {
    try {
      const [verification] = await db
        .select()
        .from(kycVerifications)
        .where(eq(kycVerifications.userId, userId))
        .orderBy(desc(kycVerifications.createdAt))
        .limit(1);

      return verification || null;
    } catch (error) {
      console.error(`Error getting KYC verification for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Update KYC verification status
   * 
   * @param {string} id - KYC verification ID
   * @param {object} updateData - Data to update
   * @returns {Promise<object>} Updated KYC verification record
   */
  static async updateKycVerification(id, updateData) {
    try {
      const [verification] = await db
        .update(kycVerifications)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(kycVerifications.id, id))
        .returning();

      return verification;
    } catch (error) {
      console.error(`Error updating KYC verification with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Process KYC document upload
   * This method handles the storage and encryption of KYC documents
   * 
   * @param {string} kycVerificationId - KYC verification ID
   * @param {object} documentData - Document metadata (type, number, etc.)
   * @param {Buffer} fileBuffer - Raw file data
   * @param {string} fileName - Original file name
   * @param {string} mimeType - File MIME type
   * @returns {Promise<object>} Created KYC document record
   */
  static async uploadKycDocument(kycVerificationId, documentData, fileBuffer, fileName, mimeType) {
    try {
      // Generate encryption key for this document
      const encryptionKey = crypto.randomBytes(32);
      const encryptionKeyId = `doc-key-${randomUUID()}`;
      
      // Store encryption key securely (in a real system, this would use a key management service)
      // For demo purposes, we're encrypting the document key with a master key
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(algorithm, Buffer.from(masterKey, 'hex'), iv);
      let encryptedKey = cipher.update(encryptionKey);
      encryptedKey = Buffer.concat([encryptedKey, cipher.final()]);
      const authTag = cipher.getAuthTag();
      
      // For a real implementation, store this securely:
      // encryptedKeyData = { iv: iv.toString('hex'), encryptedKey: encryptedKey.toString('hex'), authTag: authTag.toString('hex'), keyId: encryptionKeyId }
      
      // Encrypt the file
      const fileIv = crypto.randomBytes(16);
      const fileCipher = crypto.createCipheriv(algorithm, encryptionKey, fileIv);
      let encryptedFile = fileCipher.update(fileBuffer);
      encryptedFile = Buffer.concat([encryptedFile, fileCipher.final()]);
      const fileAuthTag = fileCipher.getAuthTag();
      
      // Calculate MD5 hash of original file for integrity verification
      const md5Hash = crypto
        .createHash('md5')
        .update(fileBuffer)
        .digest('hex');
      
      // In a real implementation, store the encrypted file in secure storage
      // For demo purposes, we'll create a placeholder path
      const encryptedPath = `encrypted/${kycVerificationId}/${encryptionKeyId}/${fileName}`;
      
      // In a real implementation, you would upload the encrypted file to storage:
      // await storageProvider.uploadFile(encryptedPath, Buffer.concat([fileIv, encryptedFile, fileAuthTag]));
      
      // Store the document metadata and encryption details in the database
      const [document] = await db
        .insert(kycDocuments)
        .values({
          kycVerificationId,
          type: documentData.type,
          documentNumber: documentData.documentNumber,
          issuingCountry: documentData.issuingCountry,
          issuingAuthority: documentData.issuingAuthority,
          issueDate: documentData.issueDate ? new Date(documentData.issueDate) : null,
          expiryDate: documentData.expiryDate ? new Date(documentData.expiryDate) : null,
          encryptedPath,
          encryptionKeyId: encryptionKeyId,
          mimeType,
          fileSize: fileBuffer.length,
          md5Hash,
          status: DocumentStatusEnum.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      // Update KYC verification status if it's the first document
      const kycVerification = await this.getKycVerificationById(kycVerificationId);
      if (kycVerification && kycVerification.status === KycStatusEnum.NOT_STARTED) {
        await this.updateKycVerification(kycVerificationId, {
          status: KycStatusEnum.IN_PROGRESS,
        });
      }
      
      return document;
    } catch (error) {
      console.error('Error uploading KYC document:', error);
      throw error;
    }
  }

  /**
   * Generate a secure signed URL for document download
   * This creates a time-limited, authenticated URL for accessing encrypted documents
   * 
   * @param {string} documentId - KYC document ID
   * @param {number} expiryMinutes - URL expiry time in minutes
   * @returns {Promise<string>} Signed URL for document access
   */
  static async generateDocumentSignedUrl(documentId, expiryMinutes = 15) {
    try {
      // Get document details
      const [document] = await db
        .select()
        .from(kycDocuments)
        .where(eq(kycDocuments.id, documentId));
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      // In a real implementation, generate a signed URL using your storage provider
      // For demo purposes, we'll create a placeholder signed URL
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);
      
      const payload = {
        documentId,
        path: document.encryptedPath,
        expiry: expiryTime.getTime(),
      };
      
      // Sign the payload
      const hmac = crypto.createHmac('sha256', masterKey);
      const signature = hmac.update(JSON.stringify(payload)).digest('hex');
      
      // In a real implementation, your storage provider API would handle this
      // Return a placeholder signed URL
      return `/api/kyc/documents/${documentId}?signature=${signature}&expiry=${expiryTime.getTime()}`;
    } catch (error) {
      console.error(`Error generating signed URL for document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Review and update document status
   * 
   * @param {string} documentId - KYC document ID
   * @param {string} status - New status
   * @param {object} reviewData - Review details
   * @returns {Promise<object>} Updated document
   */
  static async reviewDocument(documentId, status, reviewData = {}) {
    try {
      const { reviewedBy, rejectionReason } = reviewData;
      
      const [document] = await db
        .update(kycDocuments)
        .set({
          status,
          reviewedBy,
          rejectionReason: status === DocumentStatusEnum.REJECTED ? rejectionReason : null,
          verifiedAt: status === DocumentStatusEnum.APPROVED ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(kycDocuments.id, documentId))
        .returning();
      
      // Update KYC verification status if all documents are approved
      if (status === DocumentStatusEnum.APPROVED) {
        const [allDocumentsCount] = await db
          .select({ count: sql`count(*)` })
          .from(kycDocuments)
          .where(eq(kycDocuments.kycVerificationId, document.kycVerificationId));
        
        const [approvedDocumentsCount] = await db
          .select({ count: sql`count(*)` })
          .from(kycDocuments)
          .where(
            and(
              eq(kycDocuments.kycVerificationId, document.kycVerificationId),
              eq(kycDocuments.status, DocumentStatusEnum.APPROVED)
            )
          );
        
        if (Number(approvedDocumentsCount.count) === Number(allDocumentsCount.count)) {
          await this.updateKycVerification(document.kycVerificationId, {
            status: KycStatusEnum.APPROVED,
            lastVerifiedAt: new Date(),
            reviewedBy,
          });
        }
      } else if (status === DocumentStatusEnum.REJECTED) {
        // If any document is rejected, update KYC verification status
        await this.updateKycVerification(document.kycVerificationId, {
          status: KycStatusEnum.REJECTED,
          rejectionReason,
          reviewedBy,
        });
      }
      
      return document;
    } catch (error) {
      console.error(`Error reviewing document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Verify identity using Trulioo's GlobalGateway API
   * 
   * @param {string} kycVerificationId - KYC verification ID
   * @param {object} userData - User data for verification
   * @returns {Promise<object>} Verification attempt record with result
   */
  static async verifyIdentityWithTrulioo(kycVerificationId, userData) {
    try {
      // Prepare verification data for Trulioo API
      const verificationData = {
        CountryCode: userData.countryCode,
        DataFields: {
          PersonInfo: {
            FirstGivenName: userData.firstName,
            FirstSurName: userData.lastName,
            BirthDate: userData.dateOfBirth,
            Gender: userData.gender
          },
          Location: {
            BuildingNumber: userData.addressBuildingNumber,
            Street: userData.addressStreet,
            City: userData.addressCity,
            StateProvinceCode: userData.addressState,
            PostalCode: userData.addressPostalCode,
            CountryCode: userData.countryCode
          },
          Communication: {
            EmailAddress: userData.email,
            MobileNumber: userData.phoneNumber
          },
          Document: {
            DocumentType: userData.documentType,
            DocumentNumber: userData.documentNumber,
            DocumentFrontImage: userData.documentFrontImage,
            DocumentBackImage: userData.documentBackImage,
            DocumentIssuingAuthority: userData.documentAuthority,
            DocumentIssueDate: userData.documentIssueDate,
            DocumentExpiryDate: userData.documentExpiryDate
          }
        },
        ConsentForDataSources: ["Trulioo", "Credit", "Government"]
      };
      
      // Generate a request ID
      const requestId = `trulioo-${randomUUID()}`;
      
      let truliooResponse;
      let success = false;
      let errorMessage = null;
      
      try {
        // Make API call to Trulioo (in a real implementation)
        const response = await axios.post(
          `${truliooConfig.baseUrl}/verifications/v1/verify`,
          verificationData,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-trulioo-api-key': truliooConfig.apiKey
            }
          }
        );
        
        truliooResponse = response.data;
        
        // Analyze the response
        if (truliooResponse.Record && truliooResponse.Record.RecordStatus === 'match') {
          success = true;
        } else {
          errorMessage = 'Identity verification failed: No match found';
        }
      } catch (apiError) {
        console.error('Trulioo API error:', apiError);
        truliooResponse = apiError.response?.data || { error: 'API connection error' };
        errorMessage = `API error: ${apiError.message}`;
      }
      
      // Record verification attempt
      const [attempt] = await db
        .insert(kycVerificationAttempts)
        .values({
          kycVerificationId,
          provider: 'trulioo',
          requestId,
          requestType: 'identity_verification',
          requestData: verificationData,
          responseData: truliooResponse,
          responseCode: truliooResponse.TransactionRecordID || 'error',
          success,
          errorMessage,
          createdAt: new Date(),
        })
        .returning();
      
      // Update KYC verification status based on result
      if (success) {
        await this.updateKycVerification(kycVerificationId, {
          status: KycStatusEnum.APPROVED,
          verificationMethod: VerificationMethodEnum.THIRD_PARTY,
          lastVerifiedAt: new Date(),
        });
      } else {
        await this.updateKycVerification(kycVerificationId, {
          status: KycStatusEnum.REJECTED,
          rejectionReason: errorMessage,
        });
      }
      
      return attempt;
    } catch (error) {
      console.error('Error verifying identity with Trulioo:', error);
      throw error;
    }
  }

  /**
   * Verify identity using Smile Identity API
   * 
   * @param {string} kycVerificationId - KYC verification ID
   * @param {object} userData - User data for verification
   * @returns {Promise<object>} Verification attempt record with result
   */
  static async verifyIdentityWithSmileIdentity(kycVerificationId, userData) {
    try {
      // Prepare verification data for Smile Identity API
      const verificationData = {
        partner_id: smileIdentityConfig.partnerId,
        job_id: `smile-${randomUUID()}`,
        job_type: 5, // Document Verification with Liveness Check
        user_id: `user-${userData.userId}`,
        first_name: userData.firstName,
        last_name: userData.lastName,
        country: userData.countryCode,
        id_type: userData.documentType,
        id_number: userData.documentNumber,
        images: [
          {
            image_type_id: 0, // Selfie
            image: userData.selfieImage
          },
          {
            image_type_id: 1, // ID Card Front
            image: userData.documentFrontImage
          },
          {
            image_type_id: 2, // ID Card Back
            image: userData.documentBackImage
          }
        ]
      };
      
      // Generate a request ID
      const requestId = `smile-${randomUUID()}`;
      
      let smileResponse;
      let success = false;
      let errorMessage = null;
      
      try {
        // Make API call to Smile Identity (in a real implementation)
        const response = await axios.post(
          `${smileIdentityConfig.baseUrl}/v1/id_verification`,
          verificationData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${smileIdentityConfig.apiKey}`
            }
          }
        );
        
        smileResponse = response.data;
        
        // Analyze the response
        if (smileResponse.result && smileResponse.result.ResultText === 'VERIFIED') {
          success = true;
        } else {
          errorMessage = `Identity verification failed: ${smileResponse.result?.ResultText || 'Unknown error'}`;
        }
      } catch (apiError) {
        console.error('Smile Identity API error:', apiError);
        smileResponse = apiError.response?.data || { error: 'API connection error' };
        errorMessage = `API error: ${apiError.message}`;
      }
      
      // Record verification attempt
      const [attempt] = await db
        .insert(kycVerificationAttempts)
        .values({
          kycVerificationId,
          provider: 'smile_identity',
          requestId,
          requestType: 'identity_verification',
          requestData: verificationData,
          responseData: smileResponse,
          responseCode: smileResponse.job_complete ? 'completed' : 'failed',
          success,
          errorMessage,
          createdAt: new Date(),
        })
        .returning();
      
      // Update KYC verification status based on result
      if (success) {
        await this.updateKycVerification(kycVerificationId, {
          status: KycStatusEnum.APPROVED,
          verificationMethod: VerificationMethodEnum.THIRD_PARTY,
          lastVerifiedAt: new Date(),
        });
      } else {
        await this.updateKycVerification(kycVerificationId, {
          status: KycStatusEnum.REJECTED,
          rejectionReason: errorMessage,
        });
      }
      
      return attempt;
    } catch (error) {
      console.error('Error verifying identity with Smile Identity:', error);
      throw error;
    }
  }

  /**
   * Create a risk flag for a user
   * 
   * @param {string} kycVerificationId - KYC verification ID
   * @param {number} userId - User ID
   * @param {object} flagData - Flag data
   * @returns {Promise<object>} Created risk flag
   */
  static async createRiskFlag(kycVerificationId, userId, flagData) {
    try {
      const [flag] = await db
        .insert(kycRiskFlags)
        .values({
          kycVerificationId,
          userId,
          type: flagData.type,
          severity: flagData.severity || RiskLevelEnum.MEDIUM,
          description: flagData.description,
          evidence: flagData.evidence || {},
          status: 'open',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // If it's a high-risk flag, update the KYC verification risk level
      if (flagData.severity === RiskLevelEnum.HIGH || flagData.severity === RiskLevelEnum.CRITICAL) {
        await this.updateKycVerification(kycVerificationId, {
          riskLevel: flagData.severity,
        });
      }

      return flag;
    } catch (error) {
      console.error('Error creating risk flag:', error);
      throw error;
    }
  }

  /**
   * Resolve a risk flag
   * 
   * @param {string} flagId - Risk flag ID
   * @param {object} resolutionData - Resolution data
   * @returns {Promise<object>} Updated risk flag
   */
  static async resolveRiskFlag(flagId, resolutionData) {
    try {
      const { resolvedBy, resolutionNotes, status } = resolutionData;

      const [flag] = await db
        .update(kycRiskFlags)
        .set({
          status,
          resolvedBy,
          resolutionNotes,
          resolutionDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(kycRiskFlags.id, flagId))
        .returning();

      // If all flags are resolved, update the KYC verification risk level
      const remainingFlags = await db
        .select()
        .from(kycRiskFlags)
        .where(
          and(
            eq(kycRiskFlags.kycVerificationId, flag.kycVerificationId),
            eq(kycRiskFlags.status, 'open')
          )
        );

      if (remainingFlags.length === 0) {
        await this.updateKycVerification(flag.kycVerificationId, {
          riskLevel: RiskLevelEnum.LOW,
        });
      }

      return flag;
    } catch (error) {
      console.error(`Error resolving risk flag ${flagId}:`, error);
      throw error;
    }
  }

  /**
   * Monitor a transaction for AML compliance
   * 
   * @param {number} userId - User ID
   * @param {object} transactionData - Transaction data
   * @returns {Promise<object>} Transaction monitoring record
   */
  static async monitorTransaction(userId, transactionData) {
    try {
      // Calculate risk score based on transaction attributes
      let riskScore = 0;
      let anomalyDetails = {};
      const flags = [];

      // Check transaction amount thresholds
      if (transactionData.amount >= 10000) {
        riskScore += 20;
        flags.push('large_transaction');
      }

      // Check for suspicious source/destination
      if (transactionData.sourceType === 'crypto_wallet' || 
          transactionData.destinationType === 'crypto_wallet') {
        riskScore += 15;
        flags.push('crypto_involved');
      }

      // Check user transaction history (example)
      const userTransactions = await db
        .select()
        .from(amlTransactionMonitoring)
        .where(eq(amlTransactionMonitoring.userId, userId))
        .orderBy(desc(amlTransactionMonitoring.createdAt))
        .limit(10);

      // Check for rapid succession of transactions
      if (userTransactions.length > 0) {
        const lastTransaction = userTransactions[0];
        const timeDiff = new Date() - new Date(lastTransaction.createdAt);
        
        // If less than 1 hour between transactions
        if (timeDiff < 60 * 60 * 1000 && transactionData.amount > 1000) {
          riskScore += 25;
          flags.push('rapid_succession');
          anomalyDetails.previousTransactionId = lastTransaction.transactionId;
          anomalyDetails.timeBetweenMinutes = Math.floor(timeDiff / (60 * 1000));
        }
      }

      // Check for unusual transaction amount compared to user history
      if (userTransactions.length > 0) {
        const averageAmount = userTransactions.reduce((sum, tx) => sum + tx.amount, 0) / userTransactions.length;
        if (transactionData.amount > averageAmount * 5) {
          riskScore += 20;
          flags.push('unusual_amount');
          anomalyDetails.averageAmount = averageAmount;
          anomalyDetails.amountMultiplier = (transactionData.amount / averageAmount).toFixed(2);
        }
      }

      // Record the monitoring data
      const [monitoring] = await db
        .insert(amlTransactionMonitoring)
        .values({
          userId,
          transactionId: transactionData.transactionId,
          transactionType: transactionData.transactionType,
          amount: transactionData.amount,
          currency: transactionData.currency || 'USD',
          sourceType: transactionData.sourceType,
          sourceIdentifier: transactionData.sourceIdentifier,
          destinationType: transactionData.destinationType,
          destinationIdentifier: transactionData.destinationIdentifier,
          riskScore,
          isHighRisk: riskScore >= 50,
          isSuspicious: riskScore >= 70,
          anomalyDetails: {
            flags,
            ...anomalyDetails
          },
          createdAt: new Date(),
        })
        .returning();
      
      // If transaction is suspicious, create a risk flag
      if (monitoring.isSuspicious) {
        // Get user's KYC verification
        const kycVerification = await this.getKycVerificationByUserId(userId);
        
        if (kycVerification) {
          await this.createRiskFlag(kycVerification.id, userId, {
            type: FlagTypeEnum.TRANSACTION_ANOMALY,
            severity: monitoring.riskScore >= 90 ? RiskLevelEnum.CRITICAL : RiskLevelEnum.HIGH,
            description: `Suspicious transaction detected: ${flags.join(', ')}`,
            evidence: {
              transactionId: transactionData.transactionId,
              amount: transactionData.amount,
              riskScore: monitoring.riskScore,
              flags,
              ...anomalyDetails
            }
          });
        }
      }

      return monitoring;
    } catch (error) {
      console.error('Error monitoring transaction:', error);
      throw error;
    }
  }

  /**
   * Get user compliance summary
   * 
   * @param {number} userId - User ID
   * @returns {Promise<object>} Compliance summary
   */
  static async getUserComplianceSummary(userId) {
    try {
      // Get KYC verification
      const kycVerification = await this.getKycVerificationByUserId(userId);
      
      // Get documents
      const documents = kycVerification ? await db
        .select()
        .from(kycDocuments)
        .where(eq(kycDocuments.kycVerificationId, kycVerification.id)) : [];
      
      // Get risk flags
      const flags = kycVerification ? await db
        .select()
        .from(kycRiskFlags)
        .where(eq(kycRiskFlags.kycVerificationId, kycVerification.id)) : [];
      
      // Get recent transactions
      const transactions = await db
        .select()
        .from(amlTransactionMonitoring)
        .where(eq(amlTransactionMonitoring.userId, userId))
        .orderBy(desc(amlTransactionMonitoring.createdAt))
        .limit(5);
      
      // Calculate compliance status
      let complianceStatus = 'unknown';
      let complianceDetails = {};
      
      if (kycVerification) {
        complianceStatus = kycVerification.status;
        complianceDetails = {
          level: kycVerification.level,
          riskLevel: kycVerification.riskLevel,
          lastVerified: kycVerification.lastVerifiedAt,
          documentsVerified: documents.filter(d => d.status === DocumentStatusEnum.APPROVED).length,
          documentsRejected: documents.filter(d => d.status === DocumentStatusEnum.REJECTED).length,
          documentsPending: documents.filter(d => d.status === DocumentStatusEnum.PENDING).length,
          openFlags: flags.filter(f => f.status === 'open').length,
          highRiskFlags: flags.filter(f => f.severity === RiskLevelEnum.HIGH || f.severity === RiskLevelEnum.CRITICAL).length,
        };
      }
      
      return {
        userId,
        kycVerification,
        documents: documents.map(d => ({
          id: d.id,
          type: d.type,
          status: d.status,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })),
        flags: flags.map(f => ({
          id: f.id,
          type: f.type,
          severity: f.severity,
          status: f.status,
          description: f.description,
          createdAt: f.createdAt,
        })),
        recentTransactions: transactions.map(t => ({
          transactionId: t.transactionId,
          type: t.transactionType,
          amount: t.amount,
          currency: t.currency,
          riskScore: t.riskScore,
          isHighRisk: t.isHighRisk,
          createdAt: t.createdAt,
        })),
        complianceStatus,
        complianceDetails,
      };
    } catch (error) {
      console.error(`Error getting compliance summary for user ${userId}:`, error);
      throw error;
    }
  }
}

module.exports = KycService;