import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const debugLoginRouter = Router();

// This route is only for development and testing purposes
debugLoginRouter.post('/debug-login', async (req: Request, res: Response) => {
  try {
    console.log("Debug login attempt for testuser");
    
    // Find the user with username 'testuser'
    const [user] = await db.select().from(users).where(eq(users.username, 'testuser'));
    
    if (!user) {
      console.log("Test user not found in database");
      return res.status(404).json({ error: 'Test user not found' });
    }
    
    console.log("Found test user:", user.username, user.role);
    
    // Generate a JWT token with the same secret used in auth-jwt.ts
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      'supersecretkey', // Must match the one in auth-jwt.ts
      { expiresIn: '7d' }
    );
    
    // Return the user information and token
    return res.json({
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role,
        profileImage: user.profileImage || null,
      },
      token,
    });
  } catch (error) {
    console.error('Debug login error:', error);
    return res.status(500).json({ error: 'Internal server error during debug login' });
  }
});

export default debugLoginRouter;