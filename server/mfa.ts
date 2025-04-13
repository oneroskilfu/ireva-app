import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { User } from '@shared/schema';
import session from 'express-session';

// Extend express-session with our custom data
declare module 'express-session' {
  interface SessionData {
    mfaStatus?: {
      userId: number;
      status: MFAVerificationStatus;
      verifiedAt?: string;
    };
    verificationCode?: {
      code: string;
      expiresAt: number;
    };
    mfaSetup?: {
      secret?: string;
      method?: string;
      code?: string;
      expiresAt: number;
    };
  }
}

// Generate a random 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate a unique TOTP secret for app-based auth
export function generateTOTPSecret(username: string): { secret: string; otpauth_url: string } {
  const generated = speakeasy.generateSecret({
    name: `InvestProperty:${username}`,
    issuer: 'InvestProperty',
  });
  
  return {
    secret: generated.base32,
    otpauth_url: generated.otpauth_url || ''
  };
}

// Generate QR code for TOTP setup
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    return await qrcode.toDataURL(otpauthUrl);
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error}`);
  }
}

// Validate TOTP token
export function validateTOTP(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1, // Allow 1 period before and after for clock drift
  });
}

// Generate backup codes (one-time use)
export function generateBackupCodes(count = 10): string[] {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate a 10-character alphanumeric code
    codes.push(crypto.randomBytes(5).toString('hex').toUpperCase());
  }
  return codes;
}

// Verify if a backup code is valid and mark it as used
export function verifyBackupCode(user: User, code: string): boolean {
  if (!user.mfaBackupCodes) return false;
  
  try {
    const backupCodes = JSON.parse(user.mfaBackupCodes) as string[];
    const codeIndex = backupCodes.indexOf(code);
    
    if (codeIndex === -1) return false;
    
    // Remove the used code
    backupCodes.splice(codeIndex, 1);
    
    // Save the updated backup codes
    storage.updateUser(user.id, { mfaBackupCodes: JSON.stringify(backupCodes) });
    
    return true;
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return false;
  }
}

// Session MFA verification status enum
export enum MFAVerificationStatus {
  NOT_REQUIRED = 'not_required',
  PENDING = 'pending',
  VERIFIED = 'verified'
}

// Add MFA verification data to session
export function addMFAVerificationToSession(req: Request, userId: number, status: MFAVerificationStatus) {
  if (!req.session) {
    throw new Error('Session is not available');
  }
  
  req.session.mfaStatus = {
    userId,
    status,
    verifiedAt: status === MFAVerificationStatus.VERIFIED ? new Date().toISOString() : undefined,
  };
}

// Get MFA verification status from session
export function getMFAVerificationFromSession(req: Request): {
  userId?: number;
  status: MFAVerificationStatus;
  verifiedAt?: string;
} {
  if (!req.session?.mfaStatus) {
    return { status: MFAVerificationStatus.NOT_REQUIRED };
  }
  
  return req.session.mfaStatus;
}

// Middleware to require MFA verification
export async function requireMFAVerification(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const user = req.user as User;
  
  // Skip MFA check if user hasn't enabled it
  if (!user.mfaEnabled) {
    return next();
  }
  
  const mfaStatus = getMFAVerificationFromSession(req);
  
  // If MFA is verified and for the current user, continue
  if (
    mfaStatus.status === MFAVerificationStatus.VERIFIED &&
    mfaStatus.userId === user.id
  ) {
    return next();
  }
  
  // Otherwise, MFA verification is required
  return res.status(403).json({
    error: 'MFA verification required',
    mfaRequired: true,
  });
}

// Send verification code (through SMS or email)
export async function sendVerificationCode(
  user: User,
  method: 'sms' | 'email',
  code: string
): Promise<boolean> {
  // In a real implementation, this would send an SMS or email
  // For now, we'll just log the code
  console.log(`[${method.toUpperCase()} VERIFICATION] Code for ${user.username}: ${code}`);
  
  return true;
}

// Initiate MFA verification process
export async function initiateMFAVerification(
  req: Request,
  res: Response
): Promise<Response> {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const user = req.user as User;
  const { method } = req.body;
  
  if (!user.mfaEnabled) {
    return res.status(400).json({ error: 'MFA is not enabled for this user' });
  }
  
  if (method !== 'app' && method !== 'sms' && method !== 'email' && method !== 'backup') {
    return res.status(400).json({ error: 'Invalid verification method' });
  }
  
  // Set MFA verification status to pending
  addMFAVerificationToSession(req, user.id, MFAVerificationStatus.PENDING);
  
  if (method === 'app') {
    // For app-based verification, we don't need to send a code
    return res.status(200).json({ success: true, method: 'app' });
  } else if (method === 'backup') {
    // For backup codes, we don't need to send anything
    return res.status(200).json({ success: true, method: 'backup' });
  } else {
    // For SMS or email, generate and send a verification code
    const verificationCode = generateOTP();
    
    // Store the code in session
    req.session.verificationCode = {
      code: verificationCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };
    
    // Send the code
    const sent = await sendVerificationCode(user, method, verificationCode);
    
    if (!sent) {
      return res.status(500).json({ error: `Failed to send verification code via ${method}` });
    }
    
    return res.status(200).json({
      success: true,
      method,
      message: `Verification code sent via ${method}`,
    });
  }
}

// Verify MFA code
export async function verifyMFACode(
  req: Request,
  res: Response
): Promise<Response> {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const user = req.user as User;
  const { code, method } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Verification code is required' });
  }
  
  if (!user.mfaEnabled) {
    return res.status(400).json({ error: 'MFA is not enabled for this user' });
  }
  
  let isValid = false;
  
  switch (method) {
    case 'app':
      if (!user.mfaSecret) {
        return res.status(400).json({ error: 'TOTP is not set up for this user' });
      }
      isValid = validateTOTP(code, user.mfaSecret);
      break;
      
    case 'sms':
    case 'email':
      if (!req.session.verificationCode) {
        return res.status(400).json({ error: 'No verification code has been sent' });
      }
      
      if (Date.now() > req.session.verificationCode.expiresAt) {
        return res.status(400).json({ error: 'Verification code has expired' });
      }
      
      isValid = req.session.verificationCode.code === code;
      
      // Clear the verification code from session
      delete req.session.verificationCode;
      break;
      
    case 'backup':
      isValid = verifyBackupCode(user, code);
      break;
      
    default:
      return res.status(400).json({ error: 'Invalid verification method' });
  }
  
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }
  
  // Mark MFA as verified
  addMFAVerificationToSession(req, user.id, MFAVerificationStatus.VERIFIED);
  
  // Update the last verified timestamp
  await storage.updateUser(user.id, { mfaLastVerified: new Date() });
  
  return res.status(200).json({ success: true });
}

// Set up MFA for a user
export async function setupMFA(
  req: Request,
  res: Response
): Promise<Response> {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const user = req.user as User;
  const { method, code } = req.body;
  
  if (method !== 'app' && method !== 'sms' && method !== 'email') {
    return res.status(400).json({ error: 'Invalid MFA method' });
  }
  
  if (method === 'app') {
    // For app-based MFA, we need to verify the setup
    if (!req.session.mfaSetup) {
      // If there's no setup in progress, start a new one
      const secret = generateTOTPSecret(user.username);
      const qrCode = await generateQRCode(secret.otpauth_url);
      
      // Store the secret in session temporarily
      req.session.mfaSetup = {
        secret: secret.secret,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      };
      
      return res.status(200).json({
        step: 'setup',
        qrCode,
        secret: secret.secret, // This should be shown to the user for manual entry
      });
    } else {
      // If setup is in progress, verify the code
      if (!code) {
        return res.status(400).json({ error: 'Verification code is required' });
      }
      
      if (Date.now() > req.session.mfaSetup.expiresAt) {
        delete req.session.mfaSetup;
        return res.status(400).json({ error: 'MFA setup has expired, please start again' });
      }
      
      const secretKey = req.session.mfaSetup.secret || '';
      const isValid = validateTOTP(code, secretKey);
      
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }
      
      // Generate backup codes
      const backupCodes = generateBackupCodes();
      
      // Update user with MFA settings
      await storage.updateUser(user.id, {
        mfaEnabled: true,
        mfaPrimaryMethod: 'app',
        mfaSecret: secretKey,
        mfaBackupCodes: JSON.stringify(backupCodes),
      });
      
      // Clear setup from session
      delete req.session.mfaSetup;
      
      // Update user object in memory (safely handling possible undefined)
      const updatedUser = await storage.getUser(user.id);
      if (updatedUser) {
        req.user = updatedUser;
      }
      
      return res.status(200).json({
        success: true,
        step: 'complete',
        backupCodes,
      });
    }
  } else if (method === 'sms' || method === 'email') {
    // For SMS or email MFA, we need to verify the contact method first
    if (!req.session.mfaSetup) {
      // Check if the user has the required contact information
      if (method === 'sms' && !user.phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required for SMS verification' });
      }
      
      if (method === 'email' && !user.email) {
        return res.status(400).json({ error: 'Email is required for email verification' });
      }
      
      // Generate verification code
      const verificationCode = generateOTP();
      
      // Store the code in session
      req.session.mfaSetup = {
        method,
        code: verificationCode,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      };
      
      // Send the verification code
      const sent = await sendVerificationCode(user, method, verificationCode);
      
      if (!sent) {
        delete req.session.mfaSetup;
        return res.status(500).json({ error: `Failed to send verification code via ${method}` });
      }
      
      return res.status(200).json({
        step: 'verify',
        message: `Verification code sent via ${method}`,
      });
    } else {
      // If verification is in progress, verify the code
      if (!code) {
        return res.status(400).json({ error: 'Verification code is required' });
      }
      
      if (Date.now() > req.session.mfaSetup.expiresAt) {
        delete req.session.mfaSetup;
        return res.status(400).json({ error: 'Verification has expired, please start again' });
      }
      
      if (req.session.mfaSetup.code !== code) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }
      
      // Generate backup codes
      const backupCodes = generateBackupCodes();
      
      // Get method from setup (ensuring it's a valid MFA method)
      const setupMethod = req.session.mfaSetup.method as 'email' | 'sms' | 'app' | 'none';
      const primaryMethod = (setupMethod === 'email' || setupMethod === 'sms' || setupMethod === 'app') 
        ? setupMethod 
        : 'email'; // Default to email if somehow invalid
      
      // Update user with MFA settings
      await storage.updateUser(user.id, {
        mfaEnabled: true,
        mfaPrimaryMethod: primaryMethod,
        mfaBackupCodes: JSON.stringify(backupCodes),
      });
      
      // Clear setup from session
      delete req.session.mfaSetup;
      
      // Update user object in memory (safely handling possible undefined)
      const updatedUser = await storage.getUser(user.id);
      if (updatedUser) {
        req.user = updatedUser;
      }
      
      return res.status(200).json({
        success: true,
        step: 'complete',
        backupCodes,
      });
    }
  }
  
  return res.status(400).json({ error: 'Invalid request' });
}

// Disable MFA for a user
export async function disableMFA(
  req: Request,
  res: Response
): Promise<Response> {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const user = req.user as User;
  
  if (!user.mfaEnabled) {
    return res.status(400).json({ error: 'MFA is not enabled for this user' });
  }
  
  // Disable MFA
  await storage.updateUser(user.id, {
    mfaEnabled: false,
    mfaPrimaryMethod: 'none',
    mfaSecondaryMethod: 'none',
    mfaSecret: null,
    mfaBackupCodes: null,
  });
  
  // Update user object in memory (safely handling possible undefined)
  const updatedUser = await storage.getUser(user.id);
  if (updatedUser) {
    req.user = updatedUser;
  }
  
  return res.status(200).json({ success: true });
}