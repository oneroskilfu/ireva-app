import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is an admin
 * Expects the user to be authenticated first
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Check if user is an admin
  // We now check both isAdmin boolean and role field for backward compatibility
  // This handles cases where older data might only have one of these fields
  const user = req.user as Express.User;
  
  if (user.isAdmin || user.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ message: 'Forbidden - Admin access required' });
}