import { Router, Request, Response } from 'express';
import { db } from '../db';
import { adminLogs } from '@shared/schema';
import { verifyToken } from '../auth-jwt';
import { z } from 'zod';
import { desc, eq, and } from 'drizzle-orm';

const router = Router();

// Request validation schema for creating admin logs
const createLogSchema = z.object({
  action: z.enum(["login", "create", "update", "delete", "approve", "reject", "verify", "system_update"]),
  targetType: z.enum(["user", "property", "investment", "kyc", "payment", "system", "achievement", "educational_resource"]),
  targetId: z.number().optional(),
  description: z.string().min(1, "Description is required"),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
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
        targetId: validatedData.targetId || 0,
        description: validatedData.description,
        details: validatedData.details ? JSON.stringify(validatedData.details) : null,
        ipAddress: validatedData.ipAddress,
        userAgent: validatedData.userAgent,
        timestamp: new Date()
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
    const actionFilter = req.query.action as string | undefined;
    const targetTypeFilter = req.query.targetType as string | undefined;
    
    // Build base query
    let query = db.select().from(adminLogs);
    
    // Apply filters if provided
    const conditions = [];
    
    if (actionFilter) {
      conditions.push(eq(adminLogs.action, actionFilter as any));
    }
    
    if (targetTypeFilter) {
      conditions.push(eq(adminLogs.targetType, targetTypeFilter as any));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting and limit
    query = query.orderBy(desc(adminLogs.timestamp)).limit(limit);
    
    // Execute query
    const logs = await query;
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({ message: 'Failed to fetch admin logs' });
  }
});

export default router;