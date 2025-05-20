import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../shared/schema';

// Middleware to check if user is authenticated for API routes
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Middleware to check if user has admin or super_admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    // For HTML routes, send JSON response for API calls
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    // For HTML routes, serve the login page
    return res.sendFile(process.cwd() + '/server/public/direct-login.html');
  }
  
  const user = req.user as Express.User;
  if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  
  next();
};

// Middleware to check if user can access investor dashboard
export const requireInvestor = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    // For HTML routes, send JSON response for API calls
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    // For HTML routes, serve the login page
    return res.sendFile(process.cwd() + '/server/public/direct-login.html');
  }
  
  // Any authenticated user can access investor pages (including admins)
  next();
};

// Factory function to create role-based middleware
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }
    
    const user = req.user as Express.User;
    if (!roles.includes(user.role)) {
      return res.status(403).send('Access denied. Insufficient privileges.');
    }
    
    next();
  };
};