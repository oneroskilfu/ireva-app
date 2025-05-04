import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to protect routes based on user role
 * 
 * @param role - The role required to access the route ('admin' or 'investor')
 * @returns A middleware function that checks if the user has the required role
 * 
 * Example usage:
 * ```
 * app.get('/api/admin/dashboard', requireAuth, requireRole('admin'), adminController.getDashboard);
 * ```
 */
export function requireRole(role: 'admin' | 'investor') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${role.charAt(0).toUpperCase() + role.slice(1)} privileges required.`
      });
    }

    next();
  };
}

/**
 * Middleware to protect routes for admin users
 * This is a convenience wrapper around requireRole('admin')
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware to protect routes for investor users
 * This is a convenience wrapper around requireRole('investor')
 */
export const requireInvestor = requireRole('investor');

/**
 * Middleware to ensure the user is verified
 * Must be used after authentication middleware
 */
export function requireVerified(req: Request, res: Response, next: NextFunction) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!user.verified) {
    return res.status(403).json({
      success: false,
      message: 'Account verification required. Please verify your account first.'
    });
  }

  next();
}

export default requireRole;