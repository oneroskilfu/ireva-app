import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../middleware/secure-auth';
import { RefreshTokenService } from '../services/refresh-token.service';

// Input validation schemas
const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  role: z.enum(['investor', 'admin', 'manager']).default('investor')
});

export async function login(req: Request, res: Response) {
  try {
    const validatedData = LoginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Find user by email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = userResult[0];

    // Verify password
    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    // Generate access and refresh tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = await RefreshTokenService.createRefreshToken(
      user.id,
      req.ip,
      req.get('User-Agent')
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          kycStatus: user.kycStatus
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const validatedData = RegisterSchema.parse(req.body);
    const { name, email, password, phone, role } = validatedData;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUserResult = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        username: email.split('@')[0], // Use email prefix as username
        isActive: true,
        isVerified: false,
        kycStatus: 'pending'
      })
      .returning();

    const newUser = newUserResult[0];

    // Generate access and refresh tokens
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = await RefreshTokenService.createRefreshToken(
      newUser.id,
      req.ip,
      req.get('User-Agent')
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isVerified: newUser.isVerified,
          kycStatus: newUser.kycStatus
        }
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors
      });
    }

    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    if (!req.jwtUser) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        address: users.address,
        isVerified: users.isVerified,
        kycStatus: users.kycStatus,
        profileImage: users.profileImage,
        preferences: users.preferences,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt
      })
      .from(users)
      .where(eq(users.id, req.jwtUser.userId))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: userResult[0]
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}