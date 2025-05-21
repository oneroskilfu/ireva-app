/**
 * Two-Factor Authentication Controller
 * 
 * Handles operations related to 2FA including:
 * - Generating 2FA secrets
 * - Verifying 2FA tokens
 * - Enabling/disabling 2FA for a user
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { eq } = require('drizzle-orm');
const { db } = require('../db.cjs');
const { users, securitySettings } = require('../../shared/schema');
const securityMiddleware = require('../middleware/security-middleware');

/**
 * Generate 2FA secret for a user
 */
exports.generate2FASecret = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user already has 2FA enabled
    const [userSecurity] = await db.select()
      .from(securitySettings)
      .where(eq(securitySettings.userId, userId))
      .limit(1);
    
    if (userSecurity && userSecurity.mfaEnabled) {
      return res.status(400).json({
        status: 'error',
        message: '2FA is already enabled for this account'
      });
    }
    
    // Get user details
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Generate new secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `iREVA:${user.email}`
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    // Store the secret temporarily (will be confirmed after verification)
    let securityRecord;
    
    if (userSecurity) {
      // Update existing record
      await db.update(securitySettings)
        .set({
          mfaSecret: secret.base32,
          mfaEnabled: false, // Not enabled until verified
          updatedAt: new Date()
        })
        .where(eq(securitySettings.userId, userId));
      
      securityRecord = {
        ...userSecurity,
        mfaSecret: secret.base32,
        mfaEnabled: false
      };
    } else {
      // Create new security record
      const [newRecord] = await db.insert(securitySettings)
        .values({
          userId,
          mfaSecret: secret.base32,
          mfaEnabled: false,
          loginAttempts: 0,
          accountLocked: false,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      securityRecord = newRecord;
    }
    
    // Create audit log
    await securityMiddleware.auditLog('2FA_SECRET_GENERATED')(req, res, () => {});
    
    res.status(200).json({
      status: 'success',
      data: {
        qrCodeUrl,
        secret: secret.base32, // Only share this in setup phase
        otpauthUrl: secret.otpauth_url
      }
    });
  } catch (error) {
    console.error('Error generating 2FA secret:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while generating 2FA secret'
    });
  }
};

/**
 * Verify and enable 2FA for a user
 */
exports.verify2FAToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is required'
      });
    }
    
    // Get user's security settings
    const [userSecurity] = await db.select()
      .from(securitySettings)
      .where(eq(securitySettings.userId, userId))
      .limit(1);
    
    if (!userSecurity || !userSecurity.mfaSecret) {
      return res.status(400).json({
        status: 'error',
        message: '2FA has not been set up for this account'
      });
    }
    
    // Verify token
    const verified = speakeasy.totp.verify({
      secret: userSecurity.mfaSecret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow for 1 time step before/after (for clock sync issues)
    });
    
    if (!verified) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid token. Please try again.'
      });
    }
    
    // Enable 2FA
    await db.update(securitySettings)
      .set({
        mfaEnabled: true,
        updatedAt: new Date()
      })
      .where(eq(securitySettings.userId, userId));
    
    // Create audit log
    await securityMiddleware.auditLog('2FA_ENABLED')(req, res, () => {});
    
    res.status(200).json({
      status: 'success',
      message: '2FA has been successfully enabled'
    });
  } catch (error) {
    console.error('Error verifying 2FA token:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while verifying 2FA token'
    });
  }
};

/**
 * Disable 2FA for a user
 */
exports.disable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Token and password are required'
      });
    }
    
    // Get user details
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // Check password
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid password'
      });
    }
    
    // Get user's security settings
    const [userSecurity] = await db.select()
      .from(securitySettings)
      .where(eq(securitySettings.userId, userId))
      .limit(1);
    
    if (!userSecurity || !userSecurity.mfaEnabled) {
      return res.status(400).json({
        status: 'error',
        message: '2FA is not enabled for this account'
      });
    }
    
    // Verify token
    const verified = speakeasy.totp.verify({
      secret: userSecurity.mfaSecret,
      encoding: 'base32',
      token: token,
      window: 1
    });
    
    if (!verified) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid token. Please try again.'
      });
    }
    
    // Disable 2FA
    await db.update(securitySettings)
      .set({
        mfaEnabled: false,
        mfaSecret: null,
        updatedAt: new Date()
      })
      .where(eq(securitySettings.userId, userId));
    
    // Create audit log
    await securityMiddleware.auditLog('2FA_DISABLED')(req, res, () => {});
    
    res.status(200).json({
      status: 'success',
      message: '2FA has been successfully disabled'
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while disabling 2FA'
    });
  }
};

/**
 * Validate 2FA token during login
 */
exports.validate2FALogin = async (req, res) => {
  try {
    const { userId, token } = req.body;
    
    if (!userId || !token) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and token are required'
      });
    }
    
    // Get user's security settings
    const [userSecurity] = await db.select()
      .from(securitySettings)
      .where(eq(securitySettings.userId, userId))
      .limit(1);
    
    if (!userSecurity || !userSecurity.mfaEnabled || !userSecurity.mfaSecret) {
      return res.status(400).json({
        status: 'error',
        message: '2FA is not enabled for this account'
      });
    }
    
    // Verify token
    const verified = speakeasy.totp.verify({
      secret: userSecurity.mfaSecret,
      encoding: 'base32',
      token: token,
      window: 1
    });
    
    if (!verified) {
      // Increment failed login attempts
      await db.update(securitySettings)
        .set({
          loginAttempts: userSecurity.loginAttempts + 1,
          lastFailedLogin: new Date(),
          // If too many failed attempts, lock account
          accountLocked: userSecurity.loginAttempts >= 4, // Lock after 5 attempts (0-based)
          updatedAt: new Date()
        })
        .where(eq(securitySettings.userId, userId));
      
      // Create audit log
      await securityMiddleware.auditLog('2FA_LOGIN_FAILED')(req, res, () => {});
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid 2FA token',
        lockedOut: userSecurity.loginAttempts >= 4
      });
    }
    
    // Reset failed login attempts on success
    await db.update(securitySettings)
      .set({
        loginAttempts: 0,
        updatedAt: new Date()
      })
      .where(eq(securitySettings.userId, userId));
    
    // Create audit log
    await securityMiddleware.auditLog('2FA_LOGIN_SUCCESS')(req, res, () => {});
    
    // Proceed with login
    res.status(200).json({
      status: 'success',
      message: '2FA validation successful'
    });
  } catch (error) {
    console.error('Error validating 2FA login:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while validating 2FA'
    });
  }
};

/**
 * Get 2FA status for a user
 */
exports.get2FAStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's security settings
    const [userSecurity] = await db.select()
      .from(securitySettings)
      .where(eq(securitySettings.userId, userId))
      .limit(1);
    
    const has2FA = userSecurity && userSecurity.mfaEnabled;
    
    res.status(200).json({
      status: 'success',
      data: {
        mfaEnabled: has2FA,
        accountLocked: userSecurity?.accountLocked || false
      }
    });
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while retrieving 2FA status'
    });
  }
};