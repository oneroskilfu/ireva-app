const jwt = require('jsonwebtoken');
const { db } = require('../db');
const { users } = require('../../shared/schema');
const { eq } = require('drizzle-orm');

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'ireva_secret_jwt_key';

/**
 * Verifies JWT token from request headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user data to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Middleware to ensure the user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const ensureAdmin = async (req, res, next) => {
  // First verify the token
  verifyToken(req, res, async () => {
    try {
      // Check if user is admin or super_admin
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied: Admin role required' });
      }
      
      // If token is old, get the latest user role from database
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user.id),
        columns: {
          role: true
        }
      });
      
      if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        return res.status(403).json({ message: 'Access denied: Admin role required' });
      }
      
      next();
    } catch (error) {
      console.error('Admin verification error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
};

/**
 * Middleware to ensure the user has super_admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const ensureSuperAdmin = async (req, res, next) => {
  // First verify the token
  verifyToken(req, res, async () => {
    try {
      // Check if user is super_admin
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied: Super Admin role required' });
      }
      
      // If token is old, get the latest user role from database
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user.id),
        columns: {
          role: true
        }
      });
      
      if (!user || user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied: Super Admin role required' });
      }
      
      next();
    } catch (error) {
      console.error('Super admin verification error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
};

module.exports = {
  verifyToken,
  ensureAdmin,
  ensureSuperAdmin
};