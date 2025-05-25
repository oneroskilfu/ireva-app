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

export function refreshToken(token: string): string {
  const payload = verifyToken(token);
  // Create new token with fresh expiration
  return signToken(payload);
}