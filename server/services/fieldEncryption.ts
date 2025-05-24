/**
 * Field-level Encryption Service
 * 
 * This service provides JWT-based field-level encryption for sensitive data
 * to ensure that even if the database is compromised, sensitive information 
 * remains protected.
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db';
import { sql } from 'drizzle-orm';

// Environment variables or configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-change-in-production';

// Initialize encryption tracking table
export async function initializeEncryption() {
  // Create encryption_keys table to track key versions
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS encryption_keys (
      id SERIAL PRIMARY KEY,
      key_identifier VARCHAR(100) NOT NULL UNIQUE,
      version INTEGER NOT NULL,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      rotated_at TIMESTAMP WITH TIME ZONE
    )
  `);
  
  // Create encrypted_field_audit table for compliance tracking
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS encrypted_field_audit (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entity_type VARCHAR(100) NOT NULL,
      entity_id VARCHAR(100) NOT NULL,
      field_name VARCHAR(100) NOT NULL,
      access_type VARCHAR(20) NOT NULL,
      accessed_by UUID,
      accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      key_version INTEGER,
      reason VARCHAR(200)
    )
  `);
  
  // Ensure we have a current encryption key
  const [currentKey] = await db.execute(sql`
    SELECT * FROM encryption_keys 
    WHERE active = TRUE 
    ORDER BY version DESC 
    LIMIT 1
  `);
  
  if (!currentKey) {
    // Create initial encryption key
    await db.execute(sql`
      INSERT INTO encryption_keys (key_identifier, version, active)
      VALUES ('main', 1, TRUE)
    `);
  }
  
  console.log('Field-level encryption system initialized');
}

/**
 * Encrypt a sensitive field and return a JWT
 */
export function encryptField(value: any, entityType: string, fieldName: string): string {
  if (value === null || value === undefined) {
    return null;
  }
  
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Convert value to string
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    // Create cipher using key and iv
    const cipher = crypto.createCipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    );
    
    // Encrypt the value
    let encrypted = cipher.update(stringValue, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag for GCM mode
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Create payload with encrypted data and metadata
    const payload = {
      data: encrypted,
      iv: iv.toString('hex'),
      authTag,
      meta: {
        entityType,
        fieldName,
        encryptedAt: Date.now(),
        version: 1
      }
    };
    
    // Create JWT with the payload
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: '100y' // Very long expiry for database storage
    });
  } catch (error) {
    console.error('Field encryption error:', error);
    throw new Error(`Failed to encrypt field ${fieldName}`);
  }
}

/**
 * Decrypt a JWT-encrypted field
 */
export function decryptField(
  encryptedToken: string, 
  entityType: string, 
  entityId: string,
  fieldName: string,
  userId?: string,
  reason?: string
): any {
  if (!encryptedToken) {
    return null;
  }
  
  try {
    // Verify and decode the JWT
    const payload = jwt.verify(encryptedToken, JWT_SECRET);
    
    if (typeof payload !== 'object' || !payload.data || !payload.iv || !payload.authTag) {
      throw new Error('Invalid encrypted token format');
    }
    
    // Extract encryption details
    const { data, iv, authTag, meta } = payload as any;
    
    // Create decipher with explicit auth tag length for GCM mode
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      Buffer.from(iv, 'hex'),
      { authTagLength: 16 } // Explicitly specify 16-byte auth tag length for AES-256-GCM
    );
    
    // Set auth tag
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    // Decrypt data
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Log access for audit
    logFieldAccess(entityType, entityId, fieldName, 'read', userId, meta.version, reason)
      .catch(error => console.error('Failed to log field access:', error));
    
    // Try to parse as JSON if it looks like an object
    if (decrypted.startsWith('{') || decrypted.startsWith('[')) {
      try {
        return JSON.parse(decrypted);
      } catch (e) {
        // If parsing fails, return as string
        return decrypted;
      }
    }
    
    return decrypted;
  } catch (error) {
    console.error('Field decryption error:', error);
    throw new Error(`Failed to decrypt field ${fieldName}`);
  }
}

/**
 * Log access to encrypted fields for audit purposes
 */
async function logFieldAccess(
  entityType: string,
  entityId: string,
  fieldName: string,
  accessType: 'read' | 'write',
  userId?: string,
  keyVersion?: number,
  reason?: string
) {
  try {
    await db.execute(sql`
      INSERT INTO encrypted_field_audit (
        entity_type, entity_id, field_name, access_type, accessed_by, key_version, reason
      ) VALUES (
        ${entityType}, ${entityId}, ${fieldName}, ${accessType}, ${userId || null}, ${keyVersion || null}, ${reason || null}
      )
    `);
  } catch (error) {
    console.error('Failed to log encrypted field access:', error);
  }
}

/**
 * Encrypt multiple fields in an object
 */
export function encryptFields(
  data: Record<string, any>,
  entityType: string,
  fieldsToEncrypt: string[]
): Record<string, any> {
  const result = { ...data };
  
  for (const field of fieldsToEncrypt) {
    if (result[field] !== undefined) {
      result[field] = encryptField(result[field], entityType, field);
    }
  }
  
  return result;
}

/**
 * Decrypt multiple fields in an object
 */
export function decryptFields(
  data: Record<string, any>,
  entityType: string,
  entityId: string,
  fieldsToDecrypt: string[],
  userId?: string,
  reason?: string
): Record<string, any> {
  const result = { ...data };
  
  for (const field of fieldsToDecrypt) {
    if (result[field]) {
      try {
        result[field] = decryptField(result[field], entityType, entityId, field, userId, reason);
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error);
        // Leave as encrypted
      }
    }
  }
  
  return result;
}

/**
 * Rotate encryption keys
 */
export async function rotateEncryptionKeys() {
  // In a real implementation, this would:
  // 1. Create a new encryption key
  // 2. Re-encrypt all sensitive data with the new key
  // 3. Mark the old key as inactive
  
  try {
    // Get current key version
    const [currentKey] = await db.execute(sql`
      SELECT * FROM encryption_keys 
      WHERE active = TRUE 
      ORDER BY version DESC 
      LIMIT 1
    `);
    
    if (!currentKey) {
      throw new Error('No active encryption key found');
    }
    
    const newVersion = currentKey.version + 1;
    
    // Mark current key as inactive
    await db.execute(sql`
      UPDATE encryption_keys
      SET active = FALSE, rotated_at = NOW()
      WHERE id = ${currentKey.id}
    `);
    
    // Create new key
    await db.execute(sql`
      INSERT INTO encryption_keys (key_identifier, version, active)
      VALUES ('main', ${newVersion}, TRUE)
    `);
    
    // In a production system, we would then re-encrypt all sensitive data
    console.log(`Encryption key rotated to version ${newVersion}`);
    
    return newVersion;
  } catch (error) {
    console.error('Failed to rotate encryption keys:', error);
    throw error;
  }
}

/**
 * Example usage with user financials
 */
export function encryptFinancialData(financialData: any): any {
  const sensitiveFields = ['annualIncome', 'netWorth', 'sourceOfWealth', 'totalInvestments'];
  
  return encryptFields(financialData, 'investorFinancials', sensitiveFields);
}

export function decryptFinancialData(
  encryptedData: any, 
  entityId: string, 
  userId?: string,
  reason?: string
): any {
  const sensitiveFields = ['annualIncome', 'netWorth', 'sourceOfWealth', 'totalInvestments'];
  
  return decryptFields(
    encryptedData, 
    'investorFinancials', 
    entityId, 
    sensitiveFields, 
    userId,
    reason
  );
}