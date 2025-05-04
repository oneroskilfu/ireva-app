import { Router, Request, Response } from 'express';
import { 
  verifyToken, 
  verifyTokenHandler, 
  refreshToken,
  generateToken
} from '../auth-jwt';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const authRouter = Router();

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Register schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3),
  fullName: z.string().optional()
});

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.format()
      });
    }

    const { email, password } = validation.data;

    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token
    // Note: generateToken function from auth-jwt.ts is imported
    const token = generateToken(user.id, user.email, user.role, user.verified);

    // Return user and token
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        verified: user.verified,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.format()
      });
    }

    const { email, password, username, fullName } = validation.data;

    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const [newUser] = await db.insert(users)
      .values({
        email,
        password: hashedPassword,
        username,
        fullName,
        role: 'investor', // Default role
        verified: false,  // Default verified status
        createdAt: new Date()
      })
      .returning();

    // Create token
    const token = generateToken(
      newUser.id,
      newUser.email,
      newUser.role,
      newUser.verified
    );

    // Return user and token
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        verified: newUser.verified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

/**
 * @route GET /api/auth/verify
 * @desc Verify JWT token and return user data
 * @access Public
 */
authRouter.get('/verify', verifyTokenHandler);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh JWT token
 * @access Private
 */
authRouter.post('/refresh', verifyToken, refreshToken);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (client-side only operation in JWT)
 * @access Public
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  // JWT logout happens on the client-side by removing the token
  // This endpoint exists for compatibility and can be used for analytics
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default authRouter;