import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';

// Define extended request that includes the user from JWT payload
interface AuthenticatedRequest extends Request {
  jwtPayload?: {
    id: number;
    username: string;
    role: string;
  };
  user?: User;
}

/**
 * Middleware to protect routes based on user roles
 * @param roles Array of roles allowed to access the route
 * @returns Middleware function
 */
export const protectRole = (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Check if user exists from JWT or session
  const user = req.jwtPayload || req.user;
  
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (!roles.includes(user.role)) {
    return res.status(403).json({ message: 'Unauthorized: Insufficient permissions' });
  }
  
  next();
};

/**
 * Middleware to ensure user is authenticated
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.jwtPayload || req.user;
  
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  next();
};