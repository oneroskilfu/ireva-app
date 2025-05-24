import { Router, Request, Response } from 'express';
import { db } from '../db';
import { verifyToken } from '../auth-jwt';
import { userFeedback, insertUserFeedbackSchema } from '@shared/schema';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Validate feedback submission
const feedbackSchema = z.object({
  message: z.string().min(1, "Feedback message is required")
});

// Submit feedback
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.jwtPayload?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate input
    const validatedData = feedbackSchema.parse(req.body);
    
    // Create the feedback entry
    const [feedback] = await db.insert(userFeedback)
      .values({
        userId: req.jwtPayload.id,
        message: validatedData.message,
        status: 'new',
        createdAt: new Date()
      })
      .returning();
    
    res.status(201).json({ 
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid feedback data', 
        errors: error.errors 
      });
    }
    
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
});

// Get all feedback for admin
router.get('/admin', verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.jwtPayload?.role || !['admin', 'super_admin'].includes(req.jwtPayload.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const allFeedback = await db.select()
      .from(userFeedback)
      .orderBy(desc(userFeedback.createdAt));
    
    res.json(allFeedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

// Get feedback for the authenticated user
router.get('/user', verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.jwtPayload?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userFeedbackItems = await db.select()
      .from(userFeedback)
      .where(eq(userFeedback.userId, req.jwtPayload.id))
      .orderBy(desc(userFeedback.createdAt));
    
    res.json(userFeedbackItems);
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({ message: 'Failed to fetch user feedback' });
  }
});

// Update feedback status (admin only)
router.patch('/:id/status', verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.jwtPayload?.role || !['admin', 'super_admin'].includes(req.jwtPayload.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const feedbackId = parseInt(req.params.id);
    const { status, adminResponse } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const [updatedFeedback] = await db.update(userFeedback)
      .set({
        status,
        adminResponse: adminResponse || undefined,
        updatedAt: new Date(),
        ...(adminResponse ? { 
          respondedAt: new Date(),
          respondedBy: req.jwtPayload.id
        } : {})
      })
      .where(eq(userFeedback.id, feedbackId))
      .returning();
    
    if (!updatedFeedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.json(updatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ message: 'Failed to update feedback' });
  }
});

export default router;