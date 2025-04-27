import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { db } from '../db';
import { pushSubscriptions } from '@shared/schema';
import { and, eq } from 'drizzle-orm';

export const savePushTokenRouter = express.Router();

// Save push token route
savePushTokenRouter.post('/save-push-token', authMiddleware, async (req: Request, res: Response) => {
  const { token } = req.body;
  const userId = req.jwtPayload?.id;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  try {
    // Check if token already exists for this user
    const existingSubscription = await db.query.pushSubscriptions.findFirst({
      where: (subscription) => 
        and(
          eq(subscription.userId, String(userId)),
          eq(subscription.token, token)
        )
    });

    if (existingSubscription) {
      return res.status(200).json({ 
        success: true, 
        message: 'Token already exists for this user' 
      });
    }

    // Save the token to the database
    await db.insert(pushSubscriptions).values({
      userId: String(userId),
      token,
      createdAt: new Date()
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving token:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});