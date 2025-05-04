import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { users } from '../shared/schema';
import bcrypt from 'bcrypt';
import { UserPayload, userPayloadSchema } from '../shared/types/user-payload';

// JWT Secret (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'ireva-development-secret-key';
const JWT_EXPIRES_IN = '7d'; // Extended to 7 days

// User interface matching database schema
interface User {
  id: string; // UUID format
  username: string;
  email: string;
  password?: string;
  role: "investor" | "admin" | "super_admin" | null;
  status: "active" | "inactive" | "suspended" | "deactivated" | null;
  phoneNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  profileImage?: string | null;
  kycStatus?: string | null;
  kycTier?: string | null;
  kycDocuments?: any | null;
  kycSubmittedAt?: Date | null;
  kycVerifiedAt?: Date | null;
  kycRejectionReason?: string | null;
  isPhoneVerified?: boolean | null;
  accreditationLevel?: string | null;
  accreditationDocuments?: any | null;
  accreditationVerifiedAt?: Date | null;
  investmentPreferences?: any | null;
  totalInvested?: number | null;
  totalEarnings?: number | null;
  rewardsPoints?: number | null;
  badges?: any | null;
  referredBy?: string | null;
  referralCode?: string | null;
  referralBonus?: number | null;
  referrals?: any | null;
  referralRewards?: number | null;
  notificationPreferences?: any | null;
  directMessageEnabled?: boolean | null;
  lastLoginAt?: Date | null;
  lastActiveAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Remove this duplicate import as we already imported it at the top

// JWT payload interface based on our shared type
interface JwtPayload extends UserPayload {
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
      
      // Generate JWT token with standardized payload
      const fullName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : undefined;
      
      const token = generateToken(user.id, user.role, user.email, fullName);
      
      // Create a UserPayload object for consistent response format
      const userPayload: UserPayload = {
        userId: user.id,
        email: user.email,
        role: user.role || 'investor',
        fullName,
        isVerified: user.kycStatus === 'approved',
        avatarUrl: user.profileImage,
        phoneNumber: user.phoneNumber
      };
      
      // Return consistent payload with token
      res.status(200).json({
        token,
        user: userPayload
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
        bio: null,
        profileImage: null,
        kycStatus: 'not_started',
        kycTier: 'basic',
        kycDocuments: null,
        kycSubmittedAt: null,
        kycVerifiedAt: null,
        kycRejectionReason: null,
        isPhoneVerified: false,
        accreditationLevel: null,
        accreditationDocuments: null,
        accreditationVerifiedAt: null,
        investmentPreferences: null,
        totalInvested: 0,
        totalEarnings: 0,
        rewardsPoints: 0,
        badges: null,
        referredBy: null,
        referralCode: null,
        referralBonus: 0,
        referrals: null,
        referralRewards: 0,
        notificationPreferences: null,
        directMessageEnabled: true,
        lastLoginAt: null,
        lastActiveAt: null,
        createdAt: now,
        updatedAt: now
      }).returning();
      
      // Generate JWT token with standardized payload
      const token = generateToken(newUser.id, newUser.role, newUser.email);
      
      // Create a UserPayload object for consistent response format
      const userPayload: UserPayload = {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role || 'investor',
        fullName: undefined,
        isVerified: false,
        avatarUrl: null,
        phoneNumber: newUser.phoneNumber
      };
      
      // Return consistent payload with token
      res.status(201).json({
        token,
        user: userPayload
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
    
    // Generate a new token with standardized payload
    const fullName = req.user.firstName && req.user.lastName 
      ? `${req.user.firstName} ${req.user.lastName}` 
      : undefined;
    
    const token = generateToken(req.user.id, req.user.role, req.user.email, fullName);
    
    res.status(200).json({ token });
  });
  
  // Get current user route
  app.get('/api/auth/jwt/me', verifyToken, (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Generate fullName from first and last name if available
    const fullName = req.user.firstName && req.user.lastName 
      ? `${req.user.firstName} ${req.user.lastName}` 
      : undefined;
      
    // Create a UserPayload object for consistent response format
    const userPayload: UserPayload = {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role || 'investor',
      fullName,
      isVerified: req.user.kycStatus === 'approved',
      avatarUrl: req.user.profileImage,
      phoneNumber: req.user.phoneNumber
    };
    
    res.status(200).json({ user: userPayload });
  });
}

// Generate JWT token using our standardized UserPayload
export function generateToken(userId: string, role: 'investor' | 'admin' | 'super_admin' | null, email: string, fullName?: string, isVerified?: boolean, avatarUrl?: string | null, phoneNumber?: string | null): string {
  // Create a strictly typed payload conforming to UserPayload interface
  const payload: UserPayload = {
    userId,
    email,
    // If null, default to 'investor'
    role: role || 'investor',
    fullName,
    isVerified,
    avatarUrl,
    phoneNumber
  };
  
  // Validate payload using Zod schema before signing
  try {
    // This will throw if validation fails
    const validatedPayload = userPayloadSchema.parse(payload);
    return jwt.sign(validatedPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch (error) {
    console.error('JWT payload validation failed:', error);
    throw new Error('Failed to generate token: invalid payload');
  }
}

// Middleware to verify JWT token
export function verifyToken(req: Request, res: Response, next: NextFunction) {
  // Allow development mode
  if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    // Set mock user for development with all required fields
    req.user = {
      id: '00000000-0000-0000-0000-000000000001', // UUID format
      username: 'dev_user',
      email: 'dev@example.com',
      role: 'admin',
      password: 'dev_password',
      status: 'active',
      phoneNumber: '',
      firstName: 'Dev',
      lastName: 'User',
      bio: null,
      profileImage: null,
      kycStatus: 'approved',
      kycTier: 'basic',
      kycDocuments: null,
      kycSubmittedAt: null,
      kycVerifiedAt: null,
      kycRejectionReason: null,
      isPhoneVerified: false,
      accreditationLevel: null,
      accreditationDocuments: null,
      accreditationVerifiedAt: null,
      investmentPreferences: null,
      totalInvested: 0,
      totalEarnings: 0,
      rewardsPoints: 0,
      badges: null,
      referredBy: null,
      referralCode: 'DEV123',
      referralBonus: 0,
      referrals: null,
      referralRewards: 0,
      notificationPreferences: null,
      directMessageEnabled: true,
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    req.jwtPayload = {
      userId: '00000000-0000-0000-0000-000000000001', // UUID format
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
    // Verify token with JWT
    const decodedRaw = jwt.verify(token, JWT_SECRET);
    
    // Validate the decoded payload against our UserPayload schema
    try {
      // Cast to any to check properties before validation
      const rawPayload = decodedRaw as any;
      
      // Add minimal validation for required properties if somehow missing from the token
      if (!rawPayload.userId || !rawPayload.email || !rawPayload.role) {
        throw new Error('Token payload missing required fields');
      }
      
      // Validate using Zod schema
      const validatedPayload = userPayloadSchema.parse(decodedRaw);
      
      // Create the full JWT payload with timing info
      const decoded: JwtPayload = {
        ...validatedPayload,
        iat: (decodedRaw as any).iat,
        exp: (decodedRaw as any).exp
      };
      
      // Set validated JWT payload on request
      req.jwtPayload = decoded;
      
      // Fetch user from database
      db.select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .then(([user]) => {
          if (!user) {
            return res.status(401).json({ error: 'User not found' });
          }
          req.user = user;
          next();
        })
        .catch(error => {
          console.error('Database error:', error);
          return res.status(500).json({ error: 'Server error' });
        });
    } catch (validationError) {
      console.error('Token payload validation error:', validationError);
      return res.status(401).json({ error: 'Invalid token payload' });
    }
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
      id: '00000000-0000-0000-0000-000000000002', // UUID format
      username: 'dev_admin',
      email: 'admin@example.com',
      role: 'admin',
      password: 'admin_password',
      status: 'active',
      phoneNumber: '',
      firstName: 'Dev',
      lastName: 'Admin',
      bio: null,
      profileImage: null,
      kycStatus: 'approved',
      kycTier: 'basic',
      kycDocuments: null,
      kycSubmittedAt: null,
      kycVerifiedAt: null,
      kycRejectionReason: null,
      isPhoneVerified: false,
      accreditationLevel: null,
      accreditationDocuments: null,
      accreditationVerifiedAt: null,
      investmentPreferences: null,
      totalInvested: 0,
      totalEarnings: 0,
      rewardsPoints: 0,
      badges: null,
      referredBy: null,
      referralCode: 'ADMIN123',
      referralBonus: 0,
      referrals: null,
      referralRewards: 0,
      notificationPreferences: null,
      directMessageEnabled: true,
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
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
      id: '00000000-0000-0000-0000-000000000003', // UUID format
      username: 'dev_user',
      email: 'dev@example.com',
      role: 'admin',
      password: 'dev_password',
      status: 'active',
      phoneNumber: '',
      firstName: 'Dev',
      lastName: 'User',
      bio: null,
      profileImage: null,
      kycStatus: 'approved',
      kycTier: 'basic',
      kycDocuments: null,
      kycSubmittedAt: null,
      kycVerifiedAt: null,
      kycRejectionReason: null,
      isPhoneVerified: false,
      accreditationLevel: null,
      accreditationDocuments: null,
      accreditationVerifiedAt: null,
      investmentPreferences: null,
      totalInvested: 0,
      totalEarnings: 0,
      rewardsPoints: 0,
      badges: null,
      referredBy: null,
      referralCode: 'AUTH123',
      referralBonus: 0,
      referrals: null,
      referralRewards: 0,
      notificationPreferences: null,
      directMessageEnabled: true,
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
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
    // Verify token and explicitly validate against our schema
    const rawPayload = jwt.verify(token, JWT_SECRET) as any;
    
    // Validate the payload against our schema
    try {
      const validatedPayload = userPayloadSchema.parse(rawPayload);
      const payload: JwtPayload = {
        ...validatedPayload,
        iat: rawPayload.iat,
        exp: rawPayload.exp
      };
      
      // Store the validated payload
      req.jwtPayload = payload;
      
      // Fetch user from database
      db.select()
        .from(users)
        .where(eq(users.id, payload.userId))
        .then(([user]) => {
          if (!user) {
            return res.status(401).json({ error: 'User not found' });
          }
          req.user = user;
          next();
        })
        .catch(error => {
          console.error('Database error:', error);
          return res.status(500).json({ error: 'Server error' });
        });
    } catch (validationError) {
      console.error('JWT payload validation failed:', validationError);
      return res.status(401).json({ error: 'Invalid token structure' });
    }
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