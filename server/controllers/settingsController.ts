import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Get user profile/settings
export async function getUserProfile(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive data
    const { password, ...userProfile } = user;

    return res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Error fetching user profile' });
  }
}

// Update user profile
export async function updateUserProfile(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const schema = z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phoneNumber: z.string().optional(),
      email: z.string().email().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      dateOfBirth: z.string().optional().transform(val => val ? new Date(val) : undefined),
      profileImage: z.string().optional(),
      bio: z.string().optional()
    });

    const profileData = schema.parse(req.body);

    // Get current user data
    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already in use
    if (profileData.email && profileData.email !== user.email) {
      const existingUser = await storage.getUserByUsername(profileData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updatedUser = await storage.updateUserProfile(req.user.id, profileData);

    // Remove password from response
    const { password, ...userProfile } = updatedUser;

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: userProfile
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid profile data', errors: error.errors });
    }
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Error updating user profile' });
  }
}

// Update user password
export async function updatePassword(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const schema = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string()
    }).refine(data => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword']
    });

    const { currentPassword, newPassword } = schema.parse(req.body);

    // Get current user data
    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isPasswordValid = await comparePasswords(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await storage.updateUserProfile(req.user.id, { password: hashedPassword });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid password data', errors: error.errors });
    }
    console.error('Error updating password:', error);
    return res.status(500).json({ message: 'Error updating password' });
  }
}

// Update notification preferences
export async function updateNotificationPreferences(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const schema = z.object({
      emailNotifications: z.boolean().optional(),
      investmentUpdates: z.boolean().optional(),
      marketingEmails: z.boolean().optional(),
      newPropertyAlerts: z.boolean().optional(),
      newsAndArticles: z.boolean().optional(),
      returnUpdates: z.boolean().optional()
    });

    const preferences = schema.parse(req.body);

    // Get current user data
    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user preferences
    await storage.updateUserPreferences(req.user.id, preferences);

    return res.status(200).json({
      message: 'Notification preferences updated successfully',
      preferences
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid preference data', errors: error.errors });
    }
    console.error('Error updating notification preferences:', error);
    return res.status(500).json({ message: 'Error updating notification preferences' });
  }
}

// Generate or update referral code
export async function generateReferralCode(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get current user data
    const user = await storage.getUser(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a unique referral code based on username and random string
    const randomStr = randomBytes(4).toString('hex').toUpperCase();
    const username = user.username.replace(/[^a-zA-Z0-9]/g, '');
    const referralCode = `${username.substring(0, 4).toUpperCase()}-${randomStr}`;

    // Update user with new referral code
    await storage.updateUserReferralCode(req.user.id, referralCode);

    return res.status(200).json({
      message: 'Referral code generated successfully',
      referralCode
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    return res.status(500).json({ message: 'Error generating referral code' });
  }
}