import crypto from 'crypto';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Data Protection Service
 * Provides utilities for protecting sensitive user data, implementing
 * privacy best practices, and complying with data protection regulations
 */
class DataProtectionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly encryptionKey: Buffer;
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;

  constructor() {
    // In production, this would come from a secure environment variable
    // For development, we're using a static key - NEVER do this in production
    const key = process.env.DATA_ENCRYPTION_KEY || 'this_is_a_development_key_do_not_use_in_production';
    this.encryptionKey = crypto.scryptSync(key, 'salt', 32);
  }

  /**
   * Encrypt sensitive data
   * @param data Data to encrypt
   * @returns Encrypted data as a hex string
   */
  public encrypt(data: string): string {
    try {
      // Generate a random initialization vector
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create a new cipher using the algorithm, key, and iv
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
      
      // Update the cipher with the data and then finalize it
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get the authentication tag
      const tag = cipher.getAuthTag();
      
      // Return the IV, encrypted data, and authentication tag as a single string
      return iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   * @param encryptedData Encrypted data as a hex string
   * @returns Decrypted data
   */
  public decrypt(encryptedData: string): string {
    try {
      // Split the encrypted data into its components
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const tag = Buffer.from(parts[2], 'hex');
      
      // Create a decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      
      // Set the authentication tag
      decipher.setAuthTag(tag);
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash data for storage (one-way)
   * @param data Data to hash
   * @returns Hashed data
   */
  public hash(data: string): string {
    try {
      // Generate a salt
      const salt = crypto.randomBytes(this.saltLength).toString('hex');
      
      // Create a hash with the salt
      const hash = crypto
        .createHmac('sha512', salt)
        .update(data)
        .digest('hex');
      
      // Return salt and hash
      return `${salt}:${hash}`;
    } catch (error) {
      console.error('Hashing error:', error);
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Verify hashed data
   * @param data Plain data to verify
   * @param hashedData Previously hashed data
   * @returns True if the data matches the hash
   */
  public verifyHash(data: string, hashedData: string): boolean {
    try {
      // Split the hashed data into salt and hash
      const [salt, originalHash] = hashedData.split(':');
      
      // Create a hash with the same salt
      const hash = crypto
        .createHmac('sha512', salt)
        .update(data)
        .digest('hex');
      
      // Compare the hashes
      return hash === originalHash;
    } catch (error) {
      console.error('Hash verification error:', error);
      return false;
    }
  }

  /**
   * Anonymize user data (for GDPR compliance)
   * @param userId User ID to anonymize
   */
  public async anonymizeUser(userId: number): Promise<void> {
    try {
      const anonymousPrefix = 'anon_' + crypto.randomBytes(8).toString('hex');
      
      await db.update(users)
        .set({
          email: `${anonymousPrefix}@anonymized.com`,
          username: anonymousPrefix,
          fullName: 'Anonymized User',
          phone: null,
          address: null,
          kycDocuments: null,
          profilePicture: null,
          anonymized: true,
          anonymizedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('User anonymization error:', error);
      throw new Error('Failed to anonymize user data');
    }
  }

  /**
   * Export user data in a portable format (for GDPR compliance)
   * @param userId User ID to export data for
   */
  public async exportUserData(userId: number): Promise<object> {
    try {
      // Get user data
      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!userData) {
        throw new Error('User not found');
      }
      
      // Format data for export
      // Exclude sensitive fields like password
      const { password, ...exportableData } = userData;
      
      return {
        userData: exportableData,
        exportDate: new Date(),
        format: 'JSON',
      };
    } catch (error) {
      console.error('Data export error:', error);
      throw new Error('Failed to export user data');
    }
  }

  /**
   * Detect PII (Personally Identifiable Information) in data
   * @param data Data to scan for PII
   */
  public detectPII(data: string): {
    containsPII: boolean;
    detectedPII: string[];
  } {
    // PII patterns to check for
    const patterns = {
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      phone: /(\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})/g,
      creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
      ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
      // Add more patterns as needed
    };
    
    const detectedPII: string[] = [];
    let containsPII = false;
    
    // Check each pattern
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(data)) {
        detectedPII.push(type);
        containsPII = true;
      }
    }
    
    return {
      containsPII,
      detectedPII,
    };
  }

  /**
   * Get GDPR compliance status for a user
   * @param userId User ID to check compliance for
   */
  public async getUserComplianceStatus(userId: number): Promise<{
    dataRetentionCompliant: boolean;
    consentRecorded: boolean;
    lastConsentDate?: Date;
    dataProcessingPurposes: string[];
    dataSharing: boolean;
    missingRequirements: string[];
  }> {
    try {
      // Get user data
      const [userData] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!userData) {
        throw new Error('User not found');
      }
      
      // Check compliance status
      const missingRequirements: string[] = [];
      
      // Check if user has given consent
      const consentRecorded = !!userData.consentDate;
      if (!consentRecorded) {
        missingRequirements.push('User consent not recorded');
      }
      
      // Check data retention policy compliance
      // Assume we keep user data for max 2 years without activity
      const dataRetentionCompliant = true; // Placeholder logic
      if (!dataRetentionCompliant) {
        missingRequirements.push('Data retention period exceeded');
      }
      
      return {
        dataRetentionCompliant,
        consentRecorded,
        lastConsentDate: userData.consentDate,
        dataProcessingPurposes: ['account_management', 'kyc_verification', 'investment_processing'],
        dataSharing: false, // Assuming we don't share data with third parties
        missingRequirements,
      };
    } catch (error) {
      console.error('Compliance check error:', error);
      throw new Error('Failed to check compliance status');
    }
  }
}

export const dataProtectionService = new DataProtectionService();