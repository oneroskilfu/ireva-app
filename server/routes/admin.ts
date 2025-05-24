import { Router, Request, Response } from 'express';
import { ensureAdmin } from '../auth-jwt';

const adminRouter = Router();

// Debug endpoint to create admin user
adminRouter.post('/create-admin', async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      message: 'Admin user created or found',
      success: true,
      token: 'debug-admin-token-' + Date.now(),
      user: {
        id: 'admin-user-id',
        email: 'admin@ireva.com',
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// Admin dashboard stats
adminRouter.get('/dashboard/stats', ensureAdmin, async (req: Request, res: Response) => {
  res.json({
    totalUsers: 1250,
    totalInvestments: 534,
    totalProperties: 48,
    pendingKyc: 23
  });
});

// Get all users
adminRouter.get('/users', ensureAdmin, async (req: Request, res: Response) => {
  res.json({
    users: [
      { id: 1, username: 'user1', email: 'user1@example.com', role: 'investor' },
      { id: 2, username: 'user2', email: 'user2@example.com', role: 'investor' }
    ]
  });
});

// Get specific user
adminRouter.get('/users/:id', ensureAdmin, async (req: Request, res: Response) => {
  const userId = req.params.id;
  res.json({
    user: { id: userId, username: `user${userId}`, email: `user${userId}@example.com`, role: 'investor' }
  });
});

export default adminRouter;