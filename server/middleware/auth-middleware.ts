/**
 * Authentication Middleware
 * 
 * This middleware handles authentication requirements for API routes.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require authentication
 * Checks if a user is logged in and redirects to login if not
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  next();
}

/**
 * Middleware to check if a user has admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const user = req.user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}