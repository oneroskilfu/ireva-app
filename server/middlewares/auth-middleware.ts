import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Define UserPayload schema with Zod for validation
const userPayloadSchema = z.object({
  id: z.string().uuid(), // Ensures the ID is a valid UUID
  email: z.string().email(), // Validates proper email format
  role: z.enum(['admin', 'investor']), // Restricts to only valid roles
  verified: z.boolean() // Makes sure verified is a boolean
});

// Type definition using Zod inference
export type UserPayload = z.infer<typeof userPayloadSchema>;

// Extend Express Request interface to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Configuration options
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';

/**
 * Middleware to authenticate requests using JWT tokens
 * Extracts token from Authorization header, verifies it, and attaches the payload to the request
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  // Get the auth header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required. No token provided.' 
    });
  }

  // Check if it follows Bearer token format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid authorization format. Use Bearer {token}' 
    });
  }

  const token = parts[1];

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET) as unknown;
    
    // Validate the token payload against our schema
    const validationResult = userPayloadSchema.safeParse(decoded);
    
    if (!validationResult.success) {
      // Token payload doesn't match our expected structure
      console.error('JWT payload validation failed:', validationResult.error.format());
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token payload structure' 
      });
    }
    
    // Add the validated user payload to the request
    req.user = validationResult.data;
    
    // Continue to the next middleware/route handler
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
        message: 'Invalid token' 
      });
    } else {
      console.error('JWT verification error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal authentication error' 
      });
    }
  }
}

/**
 * Middleware to check if user has required role
 * Must be used after authenticateJWT middleware
 */
export function requireRole(role: UserPayload['role'] | UserPayload['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // First check if user exists (authenticateJWT middleware should be run first)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Check if user has the required role
    const roles = Array.isArray(role) ? role : [role];
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${Array.isArray(role) ? role.join(' or ') : role}` 
      });
    }

    // User has required role, proceed
    next();
  };
}

/**
 * Middleware to check if user is verified
 * Must be used after authenticateJWT middleware
 */
export function requireVerified(req: Request, res: Response, next: NextFunction) {
  // First check if user exists (authenticateJWT middleware should be run first)
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Check if user is verified
  if (!req.user.verified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Account verification required to access this resource' 
    });
  }

  // User is verified, proceed
  next();
}

/**
 * Optional JWT authentication middleware
 * Will attach user to request if valid token is provided, but won't reject the request if token is missing
 */
export function optionalJWT(req: Request, res: Response, next: NextFunction) {
  // Get the auth header
  const authHeader = req.headers.authorization;
  
  // If no auth header, just continue (no user will be attached)
  if (!authHeader) {
    return next();
  }

  // Check if it follows Bearer token format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next(); // Invalid format, but we don't reject - it's optional
  }

  const token = parts[1];

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET) as unknown;
    
    // Validate the token payload against our schema
    const validationResult = userPayloadSchema.safeParse(decoded);
    
    if (validationResult.success) {
      // Add the validated user payload to the request
      req.user = validationResult.data;
    }
    
    // Continue regardless of token validity
    next();
  } catch (error) {
    // Just continue without user on any error since this is optional auth
    next();
  }
}