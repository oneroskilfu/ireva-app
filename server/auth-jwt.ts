import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { users } from '../shared/schema';
import bcrypt from 'bcrypt';

// JWT Secret (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'ireva-development-secret-key';
const JWT_EXPIRES_IN = '24h';

// User interface (simplified version)
interface User {
  id: number;
  username: string;
  email: string;
  role: "investor" | "admin" | "super_admin" | null;
  password?: string;
  status?: "active" | "inactive" | "suspended" | "deactivated" | null;
  [key: string]: any; // Allow for additional properties - Required to work with Drizzle schema
}

// JWT payload interface
interface JwtPayload {
  userId: number;
  username: string;
  email: string;
  role: "investor" | "admin" | "super_admin" | null;
  iat?: number;
  exp?: number;
}

// Extending Express Request type to include user and jwtPayload
declare global {
  namespace Express {
    interface Request {
      user?: User;
      jwtPayload?: JwtPayload;
    }
  }
}

// Function to set up JWT authentication
export function setupJwtAuth(app: any) {
  console.log('Setting up JWT authentication routes');
  
  // Login route
  app.post('/api/auth/jwt/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, email));
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // In a production app, we'd use bcrypt to compare passwords
      // const passwordMatch = await bcrypt.compare(password, user.password);
      // For development, we'll do a simpler check
      const passwordMatch = password === user.password;
      
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Return user info and token
      res.status(200).json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });
  
  // Register route
  app.post('/api/auth/jwt/register', async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password are required' });
      }
      
      // Check if user already exists
      const existingUserByEmail = await db.select().from(users).where(eq(users.email, email));
      if (existingUserByEmail.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      
      const existingUserByUsername = await db.select().from(users).where(eq(users.username, username));
      if (existingUserByUsername.length > 0) {
        return res.status(400).json({ error: 'Username already in use' });
      }
      
      // In production, hash the password
      // const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user with required fields
      const now = new Date();
      const [newUser] = await db.insert(users).values({
        username,
        email,
        password, // would be hashedPassword in production
        role: 'investor', // Default role for new users
        status: 'active',
        phoneNumber: '',
        firstName: '',
        lastName: '',
        createdAt: now,
        updatedAt: now
      }).returning();
      
      // Generate JWT token
      const token = generateToken(newUser);
      
      // Return user info and token
      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });
  
  // Refresh token route
  app.post('/api/auth/jwt/refresh', verifyToken, (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Generate a new token
    const token = generateToken(req.user);
    
    res.status(200).json({ token });
  });
  
  // Get current user route
  app.get('/api/auth/jwt/me', verifyToken, (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.status(200).json({ user: req.user });
  });
}

// Generate JWT token
function generateToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Middleware to verify JWT token
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  // Allow development mode
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    // Set mock user for development with all required fields
    req.user = {
      id: 1,
      username: 'dev_user',
      email: 'dev@example.com',
      role: 'admin',
      password: 'dev_password',
      status: 'active',
      // Add any other required fields
      phoneNumber: '',
      firstName: 'Dev',
      lastName: 'User',
      createdAt: new Date()
    };
    req.jwtPayload = {
      userId: 1,
      username: 'dev_user',
      email: 'dev@example.com',
      role: 'admin'
    };
    return next();
  }
  
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Set JWT payload on request
    req.jwtPayload = decoded;
    
    // Set user on request with required fields
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      password: 'jwt-secure', // Password isn't included in JWT for security
      status: 'active',
      phoneNumber: '',
      firstName: '',
      lastName: '',
      createdAt: new Date()
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Middleware to ensure user is authenticated as admin
export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  // Allow development mode
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    // Set mock admin user for development with all required fields
    req.user = {
      id: 1,
      username: 'dev_admin',
      email: 'admin@example.com',
      role: 'admin',
      password: 'admin_password',
      status: 'active',
      // Add any other required fields
      phoneNumber: '',
      firstName: 'Dev',
      lastName: 'Admin',
      createdAt: new Date()
    };
    return next();
  }
  
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check if user is an admin
  const role = req.user.role;
  if (role !== 'admin' && role !== 'super_admin') {
    return res.status(403).json({ error: 'Not authorized. Admin role required.' });
  }

  next();
}

// Middleware to ensure user is authenticated as super admin
export function ensureSuperAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check if user is a super admin
  const role = req.user.role;
  if (role !== 'super_admin') {
    return res.status(403).json({ error: 'Not authorized. Super admin role required.' });
  }

  next();
}

// General authentication middleware
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip authentication for certain paths
  const publicPaths = [
    '/api/auth/jwt/login',
    '/api/auth/jwt/register',
    '/api/documents',
    '/api/faq',
    '/api/properties'
  ];
  
  if (req.method === 'GET' || publicPaths.includes(req.path)) {
    return next();
  }
  
  // Allow development mode
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    // Set mock user for development with all required fields
    req.user = {
      id: 1,
      username: 'dev_user',
      email: 'dev@example.com',
      role: 'admin',
      password: 'dev_password',
      status: 'active',
      // Add any other required fields
      phoneNumber: '',
      firstName: 'Dev',
      lastName: 'User',
      createdAt: new Date()
    };
    return next();
  }
  
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Set user on request with required fields
    req.user = {
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      password: 'jwt-secure', // Password isn't included in JWT for security
      status: 'active',
      phoneNumber: '',
      firstName: '',
      lastName: '',
      createdAt: new Date()
    };
    
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export default {
  ensureAdmin,
  ensureSuperAdmin,
  verifyToken,
  authMiddleware,
  setupJwtAuth,
  generateToken
};