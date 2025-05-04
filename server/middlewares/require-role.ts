import { Request, Response, NextFunction } from 'express';
import { UserPayload } from '../../shared/types/user-payload';

/**
 * Middleware to check if user has required role
 * This middleware expects req.user to be set by previous auth middleware
 * 
 * Usage examples:
 *   router.get('/admin-route', requireRole('admin'), adminController);
 *   router.get('/investor-route', requireRole('investor'), investorController);
 *   router.get('/either-route', requireRole(['admin', 'investor']), controller);
 */
export function requireRole(role: 'admin' | 'investor' | Array<'admin' | 'investor'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    // First check if user exists in request (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Check if user has the required role
    const roles = Array.isArray(role) ? role : [role];
    
    if (!roles.includes(req.user.role as 'admin' | 'investor')) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${Array.isArray(role) ? role.join(' or ') : role}` 
      });
    }

    // User has required role, proceed
    next();
  };
}