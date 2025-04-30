import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to ensure that a user is authenticated
 */
export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized - Please login to access this resource' });
};

/**
 * Middleware to ensure that an authenticated user has admin role
 */
export const ensureAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized - Please login to access this resource' });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden - Admin access required' });
  }
  
  next();
};

/**
 * Middleware to ensure that an authenticated user has super admin role
 */
export const ensureSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized - Please login to access this resource' });
  }
  
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden - Super Admin access required' });
  }
  
  next();
};