// types/user-payload.ts
import { z } from 'zod';

export const userPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['investor', 'admin', 'super_admin']),  // Updated to include super_admin
  fullName: z.string().optional(),
  isVerified: z.boolean().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
});

export type UserPayload = z.infer<typeof userPayloadSchema>;