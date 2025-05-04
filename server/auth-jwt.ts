import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { UserPayload, userPayloadSchema } from '../shared/types/user-payload';
import { z } from 'zod';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Middleware to ensure user is an admin
 * Must be used after verifyToken middleware
 */
export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  // User is an admin, proceed
  next();
}

/**
 * Middleware to ensure user is a super admin
 * Must be used after verifyToken middleware
 * 
 * Note: This is a placeholder since the UserPayload only supports 'admin' and 'investor' roles.
 * In a real implementation, you would add 'super_admin' to the role enum.
 */
export function ensureSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // This is just a placeholder - in a real implementation, 
  // you would check for an actual 'super_admin' role
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }

  // User is assumed to be a super admin if they are an admin
  next();
}

/**
 * Generate JWT token with user payload
 * 
 * @param userId - The user's UUID
 * @param email - The user's email
 * @param role - The user's role ('admin' or 'investor')
 * @param verified - Whether the user is verified
 * @returns JWT token string
 */
export function generateToken(
  id: string,
  email: string,
  role: 'admin' | 'investor',
  verified: boolean
): string {
  // Create the payload object
  const payload: UserPayload = {
    id,
    email,
    role,
    verified
  };
  
  // Validate payload against schema to ensure type safety
  userPayloadSchema.parse(payload);

  // Generate and return the token
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token and attach user payload to request
 * Used as middleware in protected routes
 */
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. No valid token provided.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Validate the payload structure using Zod
    const validationResult = userPayloadSchema.safeParse(decoded);
    
    if (!validationResult.success) {
      console.error('JWT payload validation failed:', validationResult.error.format());
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token structure' 
      });
    }

    // Attach validated user payload to request
    req.user = validationResult.data;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired', 
        expired: true
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token signature'
      });
    }
    
    console.error('JWT verification error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed'
    });
  }
}

/**
 * Refresh token endpoint handler
 * Generates a new token if the current one is valid but approaching expiration
 */
export function refreshToken(req: Request, res: Response) {
  try {
    // User must be authenticated to refresh token
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Generate a new token with the same payload
    const newToken = generateToken(
      req.user.id,
      req.user.email,
      req.user.role,
      req.user.verified
    );
    
    // Return the new token
    return res.status(200).json({
      success: true,
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
}