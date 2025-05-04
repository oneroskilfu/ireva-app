// types/user-payload.ts
import { z } from 'zod';

export const userPayloadSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['investor', 'admin', 'super_admin']),
  email: z.string().email(),
  fullName: z.string().optional(),
});

export type UserPayload = z.infer<typeof userPayloadSchema>;