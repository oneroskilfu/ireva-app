import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET environment variable not set, using fallback');
}

// JWT payload schema for type safety
export const JWTPayloadSchema = z.object({
  userId: z.number(),
  role: z.string(),
  email: z.string().email()
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '24h',
    issuer: 'ireva-platform',
    audience: 'ireva-users'
  });
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ireva-platform',
      audience: 'ireva-users'
    });
    
    // Validate the payload structure
    return JWTPayloadSchema.parse(decoded);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw new Error('Token verification failed');
  }
}

// Enhanced refresh token functionality
export function generateRefreshToken(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '15m', // Short-lived access token
    issuer: 'ireva-platform',
    audience: 'ireva-users'
  });
}

export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '7d', // Long-lived refresh token
    issuer: 'ireva-platform',
    audience: 'ireva-refresh'
  });
}

export function verifyRefreshToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'ireva-platform',
      audience: 'ireva-refresh'
    });
    
    return JWTPayloadSchema.parse(decoded);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    throw new Error('Refresh token verification failed');
  }
}