/**
 * Middleware to verify JWT token
 * Extracts token from Authorization header and verifies it
 * If valid, attaches the decoded user data to req.user
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - verify token and attach user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Get token from cookie (if implemented)
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      
      // Check if user still exists
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. User no longer exists.'
        });
      }
      
      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please authenticate again.'
      });
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

/**
 * Optional protection - doesn't require authentication but attaches user if token is valid
 */
const optionalProtect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Get token from cookie (if implemented)
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }
    
    // If no token, continue without attaching user
    if (!token) {
      return next();
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      
      // Attach user to request object if found
      if (user) {
        req.user = user;
      }
      
      next();
    } catch (error) {
      // Invalid token but we don't reject the request
      next();
    }
  } catch (error) {
    console.error('Error in optional auth middleware:', error);
    // Continue anyway since this is optional authentication
    next();
  }
};

/**
 * Check if user is verified (email or phone)
 */
const requireVerification = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Check if user has verified either email or phone
  if (!req.user.isEmailVerified && !req.user.isPhoneVerified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required. Please verify your email or phone number.'
    });
  }
  
  next();
};

/**
 * Check if user has completed KYC
 */
const requireKyc = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // Check if user has completed KYC
  if (req.user.kycStatus !== 'approved') {
    return res.status(403).json({
      success: false,
      message: 'KYC verification required for this action',
      kycStatus: req.user.kycStatus
    });
  }
  
  next();
};

module.exports = {
  protect,
  optionalProtect,
  requireVerification,
  requireKyc
};