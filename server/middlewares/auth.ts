import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth-jwt';
import { UserPayload } from '../../shared/types/user-payload';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// This augments the existing Express.Request interface
// The user property already exists in auth-jwt.ts with a different type
// So we'll use userPayload instead
declare global {
  namespace Express {
    interface Request {
      userPayload?: UserPayload;
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  // Allow skipping in development mode
  if (process.env.NODE_ENV === 'development') {
    // Set mock payload
    req.userPayload = {
      userId: '00000000-0000-0000-0000-000000000001',
      role: 'admin',
      email: 'dev@example.com',
      fullName: 'Dev User'
    };
    
    // Fetch and set a full user record if needed
    return db.select()
      .from(users)
      .where(eq(users.id, req.userPayload.userId))
      .then(([user]) => {
        if (user) {
          req.user = user;
        }
        next();
      })
      .catch(error => {
        console.log('Development mode - using mock data without database lookup');
        next();
      });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];

  try {
    // Verify and validate token using Zod schema
    const decoded = verifyToken(token);
    
    // Set the verified token payload
    req.userPayload = decoded;
    
    // Fetch the full user record if needed
    db.select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .then(([user]) => {
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
        next();
      })
      .catch(error => {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'Server error during authentication' });
      });
  } catch (err) {
    console.error('Token validation error:', err);
    res.status(403).json({ message: 'Invalid token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check from JWT payload first (safer)
  if (!req.userPayload) return res.status(401).json({ message: 'Authentication required' });
  
  if (req.userPayload.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// For backward compatibility, map super_admin to admin since we only have investor and admin now
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check from JWT payload first (safer)
  if (!req.userPayload) return res.status(401).json({ message: 'Authentication required' });
  
  if (req.userPayload.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

// Compatibility with existing routes
export const ensureAuthenticated = authenticateJWT;