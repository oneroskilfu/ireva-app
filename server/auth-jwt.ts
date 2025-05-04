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
  
  try {
    // Validate payload against schema to ensure type safety
    userPayloadSchema.parse(payload);

    // Generate and return the token
    return jwt.sign(payload, String(JWT_SECRET), { expiresIn: JWT_EXPIRES_IN });
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate authentication token');
  }
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
    
    // Verify token with proper typing
    const decoded = jwt.verify(token, String(JWT_SECRET));

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
    
    // Also assign to jwtPayload for compatibility with existing code
    req.jwtPayload = validationResult.data;
    
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
 * Authentication middleware
 * Alias for verifyToken middleware for backward compatibility
 */
export const authMiddleware = verifyToken;

/**
 * JWT Authentication setup function
 * This is a no-op function kept for backward compatibility
 * The actual authentication middleware is exported directly
 */
export function setupJwtAuth() {
  // Auth middleware is now exported directly
  console.log("JWT Authentication middleware is active");
}

/**
 * Token verification endpoint handler
 * Verifies the JWT token and returns the user payload
 * Used for auto-login on the client
 */
export function verifyTokenHandler(req: Request, res: Response) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with proper typing
    const decoded = jwt.verify(token, String(JWT_SECRET));

    // Validate the payload structure using Zod
    const validationResult = userPayloadSchema.safeParse(decoded);
    
    if (!validationResult.success) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token structure' 
      });
    }

    const user = validationResult.data;
    
    // Check if token is about to expire and should be refreshed
    const shouldRefresh = isTokenExpiringSoon(decoded as jwt.JwtPayload);

    // Return user data for auto-login
    return res.status(200).json({
      success: true,
      user,
      // Optionally issue a fresh token if the current one is expiring soon
      ...(shouldRefresh && {
        token: generateToken(
          user.id,
          user.email,
          user.role,
          user.verified
        )
      })
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify token'
    });
  }
}

/**
 * Helper function to check if token is expiring soon
 * Returns true if token will expire within 15 minutes
 */
function isTokenExpiringSoon(payload: jwt.JwtPayload): boolean {
  if (!payload.exp) return false;
  
  const expiryTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  // Token expiry threshold: 15 minutes (900,000 ms)
  return (expiryTime - currentTime) < 15 * 60 * 1000;
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