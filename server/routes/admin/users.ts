import express, { Request, Response } from 'express';
import { db } from '../../db';
import { users, transactions } from '../../../shared/schema';
import { authMiddleware, ensureAdmin } from '../../auth-jwt';
import { sql, eq, and, or, like, desc, ilike } from 'drizzle-orm';

export const router = express.Router();

// Middleware to ensure admin access
router.use(authMiddleware, ensureAdmin);

/**
 * Get all users with filtering and pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      search,
      status,
      kycStatus,
      role,
      page = '1',
      limit = '10'
    } = req.query;
    
    // Build filters
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          ilike(users.email, `%${search}%`),
          ilike(users.username, `%${search}%`),
          sql`CONCAT(${users.firstName}, ' ', ${users.lastName}) ILIKE ${`%${search}%`}`
        )
      );
    }
    
    if (status) {
      conditions.push(sql`${users.status} = ${status}`);
    }
    
    if (kycStatus) {
      conditions.push(sql`${users.kycStatus} = ${kycStatus}`);
    }
    
    if (role) {
      conditions.push(sql`${users.role} = ${role}`);
    }
    
    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;
    
    // Get filtered count
    const whereClause = conditions.length ? and(...conditions) : undefined;
    const [countResult] = await db
      .select({ count: sql`COUNT(*)`.mapWith(Number) })
      .from(users)
      .where(whereClause);
    
    // Get paginated results
    const results = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        fullName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        status: users.status,
        kycStatus: users.kycStatus,
        role: users.role,
        walletBalance: sql`COALESCE(${users.balance}, '0')`.mapWith(String),
        country: users.country,
        createdAt: users.createdAt,
        lastLogin: users.lastLoginAt,
        phone: users.phoneNumber,
        referralCode: users.referralCode,
        referredBy: users.referredBy
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limitNum)
      .offset(offset);
    
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
    res.status(500).json({ message: 'Failed to fetch users', error: String(error) });
  }
});

/**
 * Get a single user by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        fullName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        status: users.status,
        kycStatus: users.kycStatus,
        role: users.role,
        walletBalance: sql`COALESCE(${users.balance}, '0')`.mapWith(String),
        country: users.country,
        createdAt: users.createdAt,
        lastLogin: users.lastLoginAt,
        phone: users.phoneNumber,
        referralCode: users.referralCode,
        referredBy: users.referredBy
      })
      .from(users)
      .where(sql`${users.id} = ${id}`);
    
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
 * Update a user
 */
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      email,
      fullName,
      phone,
      role,
      kycStatus
    } = req.body;
    
    // Verify user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(sql`${users.id} = ${id}`);
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Parse fullName into firstName and lastName
    let firstName = existingUser.firstName;
    let lastName = existingUser.lastName;
    
    if (fullName) {
      const nameParts = fullName.split(' ');
      firstName = nameParts[0];
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    }
    
    // Update user
    const [updatedUser] = await db
      .update(users)
      .set({
        email: email || existingUser.email,
        firstName: firstName || existingUser.firstName,
        lastName: lastName || existingUser.lastName,
        phoneNumber: phone || existingUser.phoneNumber,
        role: role as any || existingUser.role,
        kycStatus: kycStatus as any || existingUser.kycStatus
      })
      .where(sql`${users.id} = ${id}`)
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        fullName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        status: users.status,
        kycStatus: users.kycStatus,
        role: users.role
      });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user', error: String(error) });
  }
});

/**
 * Update user status
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['active', 'inactive', 'suspended', 'deactivated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Verify user exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(sql`${users.id} = ${id}`);
    
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update status
    const [updatedUser] = await db
      .update(users)
      .set({ status: status as any })
      .where(sql`${users.id} = ${id}`)
      .returning();
    
    res.json({ 
      message: `User status updated to ${status}`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        status: updatedUser.status
      }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

export default router;