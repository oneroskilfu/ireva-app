import express from 'express';
import { db } from '../../db';
import { and, or, ilike, eq, gt, lt, desc } from 'drizzle-orm';
import { users, userStatusEnum } from '../../../shared/schema';

// Create a router
const router = express.Router();

// Middleware for admin authentication
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // For now, we're just passing through, but in a real app, this would verify admin status
  if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Unauthorized: Admin access required' });
  }
  next();
};

// Helper function to handle server errors
const handleServerError = (
  res: express.Response, 
  error: any, 
  message: string = 'An error occurred'
) => {
  console.error(`Error: ${message}`, error);
  res.status(500).json({ error: message });
};

// Get all users with filtering
router.get('/', adminAuth, async (req, res) => {
  try {
    const { 
      status, 
      kycStatus, 
      investorType,
      search,
      createdAfter
    } = req.query;

    const query = db
      .select()
      .from(users)
      .where(and(
        status ? eq(users.status, status as string) : undefined,
        kycStatus ? eq(users.kycStatus, kycStatus as string) : undefined,
        search ? or(
          ilike(users.email, `%${search}%`),
          ilike(users.firstName || '', `%${search}%`),
          ilike(users.lastName || '', `%${search}%`)
        ) : undefined,
        createdAfter ? gt(users.createdAt || new Date(), new Date(createdAfter as string)) : undefined
      ))
      .orderBy(desc(users.id));

    const result = await query;
    res.json(result);
  } catch (error) {
    handleServerError(res, error, 'Failed to fetch users');
  }
});

// Get user details
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(req.params.id)));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    handleServerError(res, error, 'Failed to fetch user details');
  }
});

// Update user
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const updates = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      // Add other fields as needed
    };

    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, parseInt(req.params.id)))
      .returning();

    res.json(updatedUser);
  } catch (error) {
    handleServerError(res, error, 'Failed to update user');
  }
});

// Update user status
router.post('/:id/status', adminAuth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['active', 'inactive', 'suspended', 'deactivated'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const [updatedUser] = await db
      .update(users)
      .set({ status: status as any })
      .where(eq(users.id, parseInt(req.params.id)))
      .returning();

    // Audit logging would go here in a real app

    res.json(updatedUser);
  } catch (error) {
    handleServerError(res, error, 'Failed to update user status');
  }
});

// Get user transactions
router.get('/:id/transactions', adminAuth, async (req, res) => {
  try {
    // This is a placeholder since we don't have direct user-transaction relations
    // In a real app, we would query the transactions table
    res.json([]);
  } catch (error) {
    handleServerError(res, error, 'Failed to fetch transactions');
  }
});

export default router;