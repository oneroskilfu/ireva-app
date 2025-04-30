import { Request, Response, NextFunction } from 'express';

// Extending Express Request type to include user and jwtPayload
declare global {
  namespace Express {
    interface Request {
      user?: any;
      jwtPayload?: any;
    }
  }
}

// Function to set up JWT authentication
export function setupJwtAuth(app: any) {
  console.log('Setting up JWT authentication routes');
  
  // Add routes for login, token refresh, etc.
  app.post('/api/auth/jwt/login', (req: Request, res: Response) => {
    // In a real implementation, this would validate credentials and issue a JWT
    res.status(200).json({ token: 'sample-jwt-token' });
  });
  
  app.post('/api/auth/jwt/refresh', (req: Request, res: Response) => {
    res.status(200).json({ token: 'refreshed-jwt-token' });
  });
}

// Middleware to ensure user is authenticated as admin
export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check if user is an admin
  const role = req.user?.role;
  if (role !== 'admin' && role !== 'super_admin') {
    return res.status(403).json({ error: 'Not authorized. Admin role required.' });
  }

  next();
}

// Middleware to ensure user is authenticated as super admin
export function ensureSuperAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check if user is a super admin
  const role = req.user?.role;
  if (role !== 'super_admin') {
    return res.status(403).json({ error: 'Not authorized. Super admin role required.' });
  }

  next();
}

// Middleware to verify JWT token
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  // Implementation would normally extract and verify JWT
  // For now, we'll just set a placeholder jwtPayload
  req.jwtPayload = req.user;
  next();
}

// General authentication middleware
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export default {
  ensureAdmin,
  ensureSuperAdmin,
  verifyToken,
  authMiddleware,
  setupJwtAuth
};