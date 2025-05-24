import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// JWT secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'ireva_real_estate_secret_key';

// Define JWT payload interface
export interface IrevaJwtPayload {
  id: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Define request with jwt payload property
export type RequestWithJwt = Request & {
  jwtPayload?: IrevaJwtPayload;
};

/**
 * Middleware to verify JWT token
 */
export function verifyToken(req: RequestWithJwt, res: Response, next: NextFunction) {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as IrevaJwtPayload;
    req.jwtPayload = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Middleware to protect routes based on user roles
 * @param roles - Array of allowed roles for the route
 */
export function protect(roles: string[] = []) {
  return (req: RequestWithJwt, res: Response, next: NextFunction) => {
    // First verify token
    verifyToken(req, res, (err) => {
      if (err) {
        return next(err);
      }

      // If no roles specified, just verify authentication
      if (roles.length === 0) {
        return next();
      }

      // Check if user role is in the allowed roles
      const userRole = req.jwtPayload?.role;
      
      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ 
          message: 'Access denied. Insufficient permissions.',
          userRole,
          requiredRoles: roles
        });
      }

      next();
    });
  };
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: RequestWithJwt, res: Response, next: NextFunction) {
  return protect(['admin', 'super_admin'])(req, res, next);
}

/**
 * Middleware to require super admin role
 */
export function requireSuperAdmin(req: RequestWithJwt, res: Response, next: NextFunction) {
  return protect(['super_admin'])(req, res, next);
}

/**
 * Helper function to generate JWT token
 */
export function generateToken(user: { id: number; username: string; role: string }): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      role: user.role || 'user'
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}