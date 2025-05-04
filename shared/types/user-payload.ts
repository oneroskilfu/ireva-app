// types/user-payload.ts
import { z } from 'zod';

export const userPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['investor', 'admin']),  // Changed to match the provided roles
  fullName: z.string().optional(),
  isVerified: z.boolean().optional(),
  avatarUrl: z.string().url().optional(),
  phoneNumber: z.string().optional(),
});

export type UserPayload = z.infer<typeof userPayloadSchema>;