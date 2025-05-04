import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../../shared/types/user-payload';

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';

/**
 * Middleware to authenticate users using JWT
 * Validates the authorization token and attaches the user payload to the request object
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required. No valid token provided.'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    
    // Attach user payload to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired', 
        expired: true
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token'
      });
    }
    
    console.error('JWT verification error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed'
    });
  }
}

export default requireAuth;