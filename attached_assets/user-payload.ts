
export interface UserPayload {
  userId: string;           // UUID
  email: string;
  role: 'admin' | 'investor';
  fullName?: string;
  isVerified?: boolean;
  avatarUrl?: string;
  phoneNumber?: string;
}
