import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserPayload } from '../../shared/types/user-payload';

// Define UserPayload schema with Zod for validation
const userPayloadSchema = z.object({
  id: z.string().uuid(), // Ensures the ID is a valid UUID
  username: z.string().min(1), // Username is required
  email: z.string().email(), // Validates proper email format
  role: z.enum(['admin', 'investor']), // Restricts to only valid roles
  verified: z.boolean() // Makes sure verified is a boolean
});

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRATION = '24h';

// Extend Express Request interface to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

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
      message: 'Authentication required' 
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
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token payload' 
      });
    }
    
    // Attach validated user to request
    req.user = validationResult.data;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired', 
        code: 'TOKEN_EXPIRED' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
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

/**
 * Middleware to check if user has required role
 * @param role Required role or array of roles
 */
export function requireRole(requiredRoles: string | string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Permission denied' 
      });
    }

    next();
  };
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown;
    const validationResult = userPayloadSchema.safeParse(decoded);
    return validationResult.success ? validationResult.data : null;
  } catch (error) {
    return null;
  }
}

// Re-export for external use
export { userPayloadSchema };