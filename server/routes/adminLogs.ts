import { Router, Request, Response } from 'express';
import { db } from '../db';
import { adminLogs, insertAdminLogSchema } from '@shared/schema';
import { verifyToken } from '../auth-jwt';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';

const router = Router();

// Request validation schema for creating admin logs
const createLogSchema = z.object({
  action: z.string().min(1, "Action is required"),
  targetType: z.string().min(1, "Target type is required"),
  targetId: z.number().optional(),
  details: z.record(z.any()).optional(),
});

// Create a new admin log entry (used internally)
router.post('/', verifyToken, async (req: Request, res: Response) => {
  try {
    // Verify admin permissions
    if (!req.jwtPayload?.role || !['admin', 'super_admin'].includes(req.jwtPayload.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Validate request data
    const validatedData = createLogSchema.parse(req.body);
    
    // Create the log entry
    const [log] = await db.insert(adminLogs)
      .values({
        adminId: req.jwtPayload.id,
        action: validatedData.action,
        targetType: validatedData.targetType,
        targetId: validatedData.targetId,
        details: validatedData.details ? JSON.stringify(validatedData.details) : null,
        createdAt: new Date()
      })
      .returning();
    
    res.status(201).json({ 
      message: 'Admin activity logged successfully',
      log
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid log data', 
        errors: error.errors 
      });
    }
    
    console.error('Error logging admin activity:', error);
    res.status(500).json({ message: 'Failed to log admin activity' });
  }
});

// Get admin logs (admins only)
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    // Verify admin permissions
    if (!req.jwtPayload?.role || !['admin', 'super_admin'].includes(req.jwtPayload.role)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    // Optional filters
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const action = req.query.action as string | undefined;
    const targetType = req.query.targetType as string | undefined;
    
    // Build query
    let query = db.select()
      .from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(limit);
    
    // Apply filters if provided
    if (action) {
      query = query.where(eq(adminLogs.action, action));
    }
    
    if (targetType) {
      query = query.where(eq(adminLogs.targetType, targetType));
    }
    
    // Execute query
    const logs = await query;
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({ message: 'Failed to fetch admin logs' });
  }
});

export default router;