import { Request, Response, NextFunction } from 'express';
import { kycService } from '../services/kyc-verification-service';
import { db } from '../db';
import { sql } from 'drizzle-orm';

// Logger for KYC and crypto activities
export interface CryptoActivityLog {
  id: string;
  userId: number;
  activityType: string; // 'kyc_submission', 'kyc_verification', 'crypto_payment', etc.
  details: any;
  timestamp: Date;
  ip: string;
  country?: string;
  userAgent?: string;
}

// Create an in-memory store for logs
const activityLogs: CryptoActivityLog[] = [];

/**
 * Log crypto-related activity for auditing purposes
 */
export async function logCryptoActivity(
  req: Request,
  userId: number,
  activityType: string,
  details: any = {}
): Promise<CryptoActivityLog> {
  const activityLog: CryptoActivityLog = {
    id: crypto.randomUUID(),
    userId,
    activityType,
    details,
    timestamp: new Date(),
    ip: req.ip,
    country: req.headers['cf-ipcountry'] as string | undefined || 'Unknown',
    userAgent: req.headers['user-agent'] as string
  };

  activityLogs.push(activityLog);

  // In a real implementation, write this to the database
  // This would use something like db.insert(activityLogsTable).values(activityLog)
  console.log(`Logged crypto activity: ${activityType} for user ${userId}`);

  return activityLog;
}

/**
 * Middleware to check if a user has completed KYC requirements for crypto
 */
export async function requireCryptoKyc(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Invalid user session' });
  }

  try {
    const isCryptoVerified = await kycService.isUserCryptoKycVerified(userId);
    
    if (!isCryptoVerified) {
      // Log the failed attempt
      await logCryptoActivity(req, userId, 'crypto_access_denied', {
        reason: 'KYC not completed'
      });
      
      return res.status(403).json({ 
        error: 'Crypto KYC verification required',
        message: 'You must complete advanced KYC verification before using crypto payments',
        kycRequirements: kycService.getCryptoKycRequirements(),
        kycStatus: (await kycService.getUserKycProfile(userId))?.status || 'not_started'
      });
    }
    
    await logCryptoActivity(req, userId, 'crypto_access_granted');
    next();
  } catch (error) {
    console.error('Error in KYC middleware:', error);
    res.status(500).json({ error: 'Failed to verify KYC status' });
  }
}

/**
 * Middleware to check if user's location is allowed for crypto transactions
 */
export async function checkGeographicRestrictions(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Invalid user session' });
  }

  // Get country either from user profile, headers, or IP geolocation
  const userProfile = await kycService.getUserKycProfile(userId);
  // Try CF headers first (if behind Cloudflare)
  const countryFromHeaders = req.headers['cf-ipcountry'] as string;
  const country = userProfile?.country || countryFromHeaders || 'Unknown';
  
  if (kycService.isCountryRestricted(country)) {
    await logCryptoActivity(req, userId, 'geo_restricted', {
      country,
      ip: req.ip
    });
    
    return res.status(451).json({
      error: 'Geographic restriction',
      message: 'Crypto transactions are not available in your country due to regulatory requirements'
    });
  }
  
  // Add country to request for later use
  (req as any).userCountry = country;
  next();
}

/**
 * Get activity logs for a user
 */
export async function getUserActivityLogs(userId: number): Promise<CryptoActivityLog[]> {
  return activityLogs.filter(log => log.userId === userId);
}

/**
 * Get all activity logs (admin function)
 */
export async function getAllActivityLogs(): Promise<CryptoActivityLog[]> {
  return [...activityLogs];
}