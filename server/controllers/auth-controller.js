/**
 * Authentication Controller
 * 
 * Handles user authentication, registration, and session management
 * with proper security practices and intuitive error handling.
 */

const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { eq } = require('drizzle-orm');
const { db } = require('../db.cjs');
const { users } = require('../../shared/schema');

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'ireva-super-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const COOKIE_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Helper for password hashing
const scryptAsync = promisify(crypto.scrypt);

/**
 * Hash a password using scrypt with salt
 */
const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${derivedKey.toString('hex')}.${salt}`;
};

/**
 * Compare password with stored hash
 */
const comparePasswords = async (suppliedPassword, storedPassword) => {
  const [hash, salt] = storedPassword.split('.');
  const suppliedHash = await scryptAsync(suppliedPassword, salt, 64);
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(suppliedHash)
  );
};

/**
 * Create JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Create and send token as cookie with enhanced security
 */
const createSendToken = async (user, statusCode, req, res) => {
  // Import security middleware
  const securityMiddleware = require('../middleware/security-middleware');
  
  // Get device fingerprint or generate one if not provided
  const deviceFingerprint = req.headers['x-device-fingerprint'] || 
                          crypto.createHash('sha256')
                                .update(`${req.headers['user-agent']}${req.ip}`)
                                .digest('hex');
  
  // Generate secure token with fingerprinting
  const { token, sessionId } = securityMiddleware.generateSecureToken(user.id, deviceFingerprint);
  
  // Create secure cookie with enhanced protection
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + COOKIE_EXPIRES_IN),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict', // Enhanced from 'lax' to 'strict' for better CSRF protection
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined
  });
  
  // Store device info for audit and security purposes
  try {
    // Extract basic device info from user agent
    const deviceInfo = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      os: parseUserAgent(req.headers['user-agent']).os,
      browser: parseUserAgent(req.headers['user-agent']).browser
    };
    
    // Update session with device info
    const { sessions } = require('../../shared/schema');
    await db.update(sessions)
      .set({ 
        deviceInfo,
        updatedAt: new Date()
      })
      .where(eq(sessions.id, sessionId));
      
    // Create audit log for successful login/token creation
    securityMiddleware.auditLog('AUTHENTICATION_SUCCESS')(req, res, () => {});
    
  } catch (error) {
    console.error('Error updating session with device info:', error);
  }
  
  // Remove password and sensitive data from output
  const userWithoutSensitiveData = { ...user };
  delete userWithoutSensitiveData.password;
  delete userWithoutSensitiveData.passwordResetToken;
  delete userWithoutSensitiveData.passwordResetExpires;
  
  // Send response with fingerprint for subsequent requests
  res.status(statusCode).json({
    status: 'success',
    token,
    sessionId,
    fingerprint: deviceFingerprint,
    data: {
      user: userWithoutSensitiveData
    }
  });
};

/**
 * Parse basic device info from user agent string
 */
function parseUserAgent(userAgent = '') {
  const result = {
    browser: 'Unknown',
    os: 'Unknown'
  };
  
  if (!userAgent) return result;
  
  // Simple parsing for browser
  if (userAgent.includes('Firefox')) {
    result.browser = 'Firefox';
  } else if (userAgent.includes('Chrome')) {
    result.browser = 'Chrome';
  } else if (userAgent.includes('Safari')) {
    result.browser = 'Safari';
  } else if (userAgent.includes('Edge')) {
    result.browser = 'Edge';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    result.browser = 'Internet Explorer';
  }
  
  // Simple parsing for OS
  if (userAgent.includes('Windows')) {
    result.os = 'Windows';
  } else if (userAgent.includes('Mac OS')) {
    result.os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    result.os = 'Linux';
  } else if (userAgent.includes('Android')) {
    result.os = 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    result.os = 'iOS';
  }
  
  return result;
};

/**
 * Register new user
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, username, role = 'investor' } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !username) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }
    
    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }
    
    // Check if username is taken
    const existingUsername = await db.select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    
    if (existingUsername.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'This username is already taken'
      });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create preferences object
    const preferences = {
      notifications: {
        email: true,
        sms: false,
        inApp: true
      },
      investmentPreferences: [],
      theme: 'light'
    };
    
    // Create user
    const [newUser] = await db.insert(users)
      .values({
        name,
        email,
        username,
        password: hashedPassword,
        role,
        preferences,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    // Create wallet for the user
    const { wallets } = require('../../shared/schema');
    await db.insert(wallets)
      .values({
        userId: newUser.id,
        balance: '0',
        currency: 'USD',
        lastUpdated: new Date()
      });
    
    // Create and send token
    createSendToken(newUser, 201, req, res);
  } catch (error) {
    console.error('Registration error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Log in user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }
    
    // Find user by email
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    // Check if user exists and password is correct
    if (!user || !(await comparePasswords(password, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }
    
    // Create and send token
    createSendToken(user, 200, req, res);
  } catch (error) {
    console.error('Login error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to log in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Log out user
 */
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({ status: 'success' });
};

/**
 * Middleware to protect routes
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if token exists in headers or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access.'
      });
    }
    
    // Verify token
    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
    
    // Check if user still exists
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.'
      });
    }
    
    // Check if user changed password after the token was issued
    // (Would implement if we tracked password change timestamps)
    
    // Grant access to protected route
    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    console.error('Auth protection error:', error);
    
    res.status(401).json({
      status: 'error',
      message: 'Invalid token or session expired',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Restrict to certain roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }
    
    next();
  };
};

/**
 * Get current user
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // User should be attached to req from the protect middleware
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in'
      });
    }
    
    // Remove password from output
    const userWithoutPassword = { ...req.user };
    delete userWithoutPassword.password;
    
    // Get user wallet balance
    const { wallets } = require('../../shared/schema');
    const [userWallet] = await db.select()
      .from(wallets)
      .where(eq(wallets.userId, req.user.id))
      .limit(1);
    
    // Add wallet info if it exists
    if (userWallet) {
      userWithoutPassword.wallet = {
        balance: userWallet.balance,
        currency: userWallet.currency
      };
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update current user
 */
exports.updateCurrentUser = async (req, res) => {
  try {
    // Disallow password updates through this route
    if (req.body.password) {
      return res.status(400).json({
        status: 'error',
        message: 'This route is not for password updates. Please use /updatePassword.'
      });
    }
    
    // Filter out fields that shouldn't be updated
    const filteredBody = {};
    const allowedFields = ['name', 'email', 'phone', 'address', 'profileImage'];
    
    Object.keys(req.body).forEach(field => {
      if (allowedFields.includes(field)) {
        filteredBody[field] = req.body[field];
      }
    });
    
    filteredBody.updatedAt = new Date();
    
    // Update user
    const [updatedUser] = await db.update(users)
      .set(filteredBody)
      .where(eq(users.id, req.user.id))
      .returning();
    
    // Remove password from output
    const userWithoutPassword = { ...updatedUser };
    delete userWithoutPassword.password;
    
    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update password
 */
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    
    // Check if all fields exist
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide currentPassword, newPassword, and newPasswordConfirm'
      });
    }
    
    // Check if new passwords match
    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({
        status: 'error',
        message: 'New passwords do not match'
      });
    }
    
    // Get user with current password
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);
    
    // Check if current password is correct
    if (!(await comparePasswords(currentPassword, user.password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Your current password is incorrect'
      });
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password
    const [updatedUser] = await db.update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.user.id))
      .returning();
    
    // Create and send token
    createSendToken(updatedUser, 200, req, res);
  } catch (error) {
    console.error('Update password error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Check if user is authenticated (for frontend)
 */
exports.isAuthenticated = async (req, res) => {
  try {
    let token;
    
    // Check if token exists in headers or cookies
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    
    if (!token) {
      return res.status(200).json({
        status: 'success',
        authenticated: false
      });
    }
    
    // Verify token
    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
    
    // Check if user still exists
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);
    
    if (!user) {
      return res.status(200).json({
        status: 'success',
        authenticated: false
      });
    }
    
    // User is authenticated
    res.status(200).json({
      status: 'success',
      authenticated: true,
      role: user.role
    });
  } catch (error) {
    res.status(200).json({
      status: 'success',
      authenticated: false
    });
  }
};

/**
 * Request password reset
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide your email address'
      });
    }
    
    // Find user by email
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'There is no user with that email address'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    const passwordResetExpires = new Date(
      Date.now() + 10 * 60 * 1000 // 10 minutes
    );
    
    // Save reset token to user
    await db.update(users)
      .set({
        passwordResetToken,
        passwordResetExpires,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));
    
    // Send email with reset token (implement email sending here)
    // For now, just return the token in development mode
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email',
      ...(process.env.NODE_ENV === 'development' ? { resetToken } : {})
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to process password reset request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Reset password with token
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;
    
    if (!password || !passwordConfirm) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide password and passwordConfirm'
      });
    }
    
    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: 'error',
        message: 'Passwords do not match'
      });
    }
    
    // Hash token for comparison with stored token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with token that has not expired
    const [user] = await db.select()
      .from(users)
      .where(eq(users.passwordResetToken, hashedToken))
      .where(eq(users.passwordResetExpires, new Date()) > Date.now())
      .limit(1);
    
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is invalid or has expired'
      });
    }
    
    // Update password
    const hashedPassword = await hashPassword(password);
    
    await db.update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));
    
    // Log the user in
    const [updatedUser] = await db.select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
    
    createSendToken(updatedUser, 200, req, res);
  } catch (error) {
    console.error('Reset password error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user preferences
 */
exports.updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide preferences to update'
      });
    }
    
    // Get current user preferences
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);
    
    const currentPreferences = user.preferences || {
      notifications: {
        email: true,
        sms: false,
        inApp: true
      },
      investmentPreferences: [],
      theme: 'light'
    };
    
    // Merge with new preferences
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences,
      // For nested objects, merge them explicitly
      notifications: {
        ...currentPreferences.notifications,
        ...(preferences.notifications || {})
      }
    };
    
    // Update user
    const [updatedUser] = await db.update(users)
      .set({
        preferences: updatedPreferences,
        updatedAt: new Date()
      })
      .where(eq(users.id, req.user.id))
      .returning();
    
    // Remove password from output
    const userWithoutPassword = { ...updatedUser };
    delete userWithoutPassword.password;
    
    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};