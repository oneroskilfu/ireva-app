// server/middleware/adminAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define a custom Request interface to include the decoded user
interface AuthenticatedRequest extends Request {
  admin?: any;
}

export const adminAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get the auth header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    // Extract the token from the Authorization header (Bearer token)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. Invalid token format.' });
    }
    
    // Verify the token
    const secret = process.env.JWT_SECRET || 'ireva-admin-secret-key';
    const decoded = jwt.verify(token, secret);
    
    // Check if the user is an admin
    if (!decoded || !(decoded as any).isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    
    // Add the decoded admin to the request object
    req.admin = decoded;
    
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};