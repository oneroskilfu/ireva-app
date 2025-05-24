import express, { Request, Response } from 'express';
import { verifyToken } from '../auth-jwt';
import { requireRole } from '../middlewares/require-role';

// Create router
const adminRouter = express.Router();

// Apply authentication middleware to all admin routes
adminRouter.use(verifyToken);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Admin only
 */
adminRouter.get('/dashboard', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    // Admin-only business logic here
    // Because of the requireRole middleware, this code only executes if:
    // 1. User is authenticated (verified by verifyToken middleware)
    // 2. User has the 'admin' role (verified by requireRole middleware)
    
    // Example response with admin dashboard data
    const dashboardData = {
      totalUsers: 1250,
      newUsersToday: 15,
      pendingKycApprovals: 23,
      activeInvestments: 450,
      totalInvestedAmount: 2500000,
      platformRevenue: 125000
    };
    
    return res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (admin only)
 * @access  Admin only
 */
adminRouter.get('/users', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    // Example user listing functionality
    // This is protected by requireRole('admin')
    
    // Fetch users from database (implementation would depend on your storage)
    const users = [
      // This would come from your database
      { id: '1', email: 'user1@example.com', role: 'investor' },
      { id: '2', email: 'admin@example.com', role: 'admin' }
    ];
    
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PATCH /api/admin/users/:id
 * @desc    Update user details (admin only)
 * @access  Admin only
 */
adminRouter.patch('/users/:id', requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    // Update user in database (implementation would depend on your storage)
    // Here we would update the user with ID userId using the data in updates
    
    return res.status(200).json({
      success: true,
      message: `User ${userId} updated successfully`
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default adminRouter;