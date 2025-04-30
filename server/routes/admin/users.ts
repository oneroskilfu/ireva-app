import express, { Request, Response } from 'express';
import { db } from '../../db';
import { users } from '../../../shared/schema';
import { authMiddleware, ensureAdmin } from '../../auth-jwt';
import { sql, eq, and, ilike, count } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export const router = express.Router();

// Middleware to ensure admin access
router.use(authMiddleware, ensureAdmin);

/**
 * Get all users with filtering capabilities
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, kycStatus, role, search, page = '1', limit = '10' } = req.query;
    
    // Build conditions array for filtering
    const conditions = [];
    
    if (status) {
      conditions.push(eq(users.status, status as string));
    }
    
    if (kycStatus) {
      conditions.push(eq(users.kycStatus, kycStatus as string));
    }
    
    if (role) {
      conditions.push(eq(users.role, role as string));
    }
    
    if (search) {
      conditions.push(
        sql`(${ilike(users.email, `%${search as string}%`)} OR 
            ${ilike(users.username, `%${search as string}%`)} OR
            ${ilike(users.fullName, `%${search as string}%`)})`
      );
    }
    
    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Prepare the query with all conditions
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count for pagination
    const [countResult] = await db
      .select({ count: count() })
      .from(users)
      .where(whereClause);
    
    // Get paginated results
    const results = await db
      .select()
      .from(users)
      .where(whereClause)
      .limit(limitNum)
      .offset(offset)
      .orderBy(users.createdAt);
    
    res.json({
      users: results,
      pagination: {
        total: countResult.count,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(countResult.count / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

/**
 * Get user by ID
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

/**
 * Update user details
 */
router.patch('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { email, status, kycStatus, role, fullName, phone } = req.body;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Update only provided fields
    const updateData: any = {};
    
    if (email !== undefined) updateData.email = email;
    if (status !== undefined) updateData.status = status;
    if (kycStatus !== undefined) updateData.kycStatus = kycStatus;
    if (role !== undefined) updateData.role = role;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    
    // Perform update
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

/**
 * Update user status (activate/deactivate/suspend)
 */
router.patch('/:userId/status', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (active, inactive, or suspended)' });
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: `User ${status === 'active' ? 'activated' : status === 'inactive' ? 'deactivated' : 'suspended'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

/**
 * Update user role
 */
router.patch('/:userId/role', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!role || !['user', 'admin', 'super_admin', 'investor'].includes(role)) {
      return res.status(400).json({ message: 'Valid role is required' });
    }
    
    const [updatedUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

export default router;