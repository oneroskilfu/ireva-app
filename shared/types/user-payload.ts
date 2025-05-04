import { z } from 'zod';

/**
 * Zod schema for validating UserPayload objects
 * Used for JWT payload validation and type safety
 */
export const userPayloadSchema = z.object({
  id: z.string().uuid(), // User ID (UUID format)
  email: z.string().email(), // User email (validated as email format)
  role: z.enum(['admin', 'investor']), // User role restricted to valid values
  verified: z.boolean(), // Whether the user is verified
  exp: z.number().optional() // JWT expiration timestamp
});

/**
 * Type definition for user payload
 * This represents the data stored in the JWT token
 */
export type UserPayload = z.infer<typeof userPayloadSchema>;

/**
 * Extend Express Request interface to include user payload
 * This allows TypeScript to recognize req.user in Express route handlers
 */
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      jwtPayload?: UserPayload; // For backward compatibility with existing code
    }
  }
}