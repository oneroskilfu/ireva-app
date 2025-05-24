import express from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { users } from '../../shared/schema';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { generateToken } from '../utils/auth-jwt';
import { UserPayload } from '../../shared/types/user-payload';
import { authenticateJWT } from '../middlewares/auth';

const router = express.Router();

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Register schema
const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional()
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    // Validate request body
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: `Your account is ${user.status}. Please contact support.`
      });
    }
    
    // Create and sign JWT
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    
    const payload: UserPayload = {
      userId: user.id,
      role: user.role as 'investor' | 'admin' | 'super_admin', // Type assertion since schema allows null
      email: user.email,
      fullName: fullName || undefined
    };
    
    const token = generateToken(payload);
    
    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));
      
    // Return user info and token
    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    
    return res.status(500).json({ message: 'Server error during login' });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    // Validate request body
    const userData = registerSchema.parse(req.body);
    
    // Check if email already exists
    const [existingEmail] = await db.select().from(users).where(eq(users.email, userData.email));
    
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    
    // Check if username exists
    const [existingUsername] = await db.select().from(users).where(eq(users.username, userData.username));
    
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already taken' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user
    const [newUser] = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
      role: 'investor',
      status: 'active',
      createdAt: new Date()
    }).returning();
    
    // Create JWT token
    const fullName = [userData.firstName, userData.lastName].filter(Boolean).join(' ');
    
    const payload: UserPayload = {
      userId: newUser.id,
      role: 'investor',
      email: newUser.email,
      fullName: fullName || undefined
    };
    
    const token = generateToken(payload);
    
    // Return user and token
    return res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input data', errors: error.errors });
    }
    
    return res.status(500).json({ message: 'Server error during registration' });
  }
});

// Me endpoint (get current user)
router.get('/me', authenticateJWT, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Return user info (excluding sensitive data)
  return res.status(200).json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    profileImage: req.user.profileImage,
    kycStatus: req.user.kycStatus,
    kycTier: req.user.kycTier,
    isPhoneVerified: req.user.isPhoneVerified,
    lastLoginAt: req.user.lastLoginAt
  });
});

export default router;