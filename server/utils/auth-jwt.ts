import jwt from 'jsonwebtoken';
import { UserPayload, userPayloadSchema } from '../../shared/types/user-payload';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const generateToken = (payload: UserPayload) => {
  // Validate payload before signing
  const validatedPayload = userPayloadSchema.parse(payload);
  return jwt.sign(validatedPayload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): UserPayload => {
  try {
    // First decode the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Then validate the structure with Zod
    return userPayloadSchema.parse(decoded);
  } catch (error) {
    console.error('JWT validation error:', error);
    throw new Error('Invalid token format or structure');
  }
};