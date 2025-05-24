import { Router, Request, Response } from 'express';
import { protectRole } from '../middleware/authMiddleware';
import { storage } from '../storage';

const adminRouter = Router();

// Middleware to ensure only admin and super_admin can access these routes
adminRouter.use(protectRole(['admin', 'super_admin']));

// Admin Dashboard
adminRouter.get('/dashboard/stats', async (req: Request, res: Response) => {
  try {
    // Get total users
    const users = await storage.getAllUsers();
    
    // Get properties
    const properties = await storage.getAllProperties();
    
    // Get pending KYC verifications
    const pendingKyc = await storage.getUsersByKycStatus('pending');
    
    // Get investments
    const investments = await storage.getAllInvestments();
    
    // Calculate total investment amount
    const totalInvestmentAmount = investments.reduce((sum, investment) => sum + investment.amount, 0);
    
    // Calculate total returns
    const totalReturns = investments.reduce((sum, investment) => sum + (investment.earnings || 0), 0);
    
    res.json({
      userCount: users.length,
      propertyCount: properties.length,
      pendingKycCount: pendingKyc.length,
      investmentCount: investments.length,
      totalInvestmentAmount,
      totalReturns,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
});

// List all users
adminRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get specific user
adminRouter.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Update user role
adminRouter.patch('/users/:id/role', protectRole(['super_admin']), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    
    // Only allow valid roles
    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update user role
    const updatedUser = await storage.updateUserProfile(userId, { role });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user role" });
  }
});

// Get pending KYC verifications
adminRouter.get('/kyc/pending', async (req: Request, res: Response) => {
  try {
    const users = await storage.getUsersByKycStatus('pending');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending KYC verifications" });
  }
});

// Verify KYC
adminRouter.patch('/kyc/:userId/verify', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { status, rejectionReason } = req.body;
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Update KYC status
    const verifiedAt = status === 'verified' ? new Date() : null;
    const updatedUser = await storage.updateUserKycStatus(userId, status, rejectionReason, verifiedAt);
    
    // Create notification for the user
    await storage.createNotification({
      userId,
      type: "kyc",
      title: `KYC ${status === 'verified' ? 'Approved' : 'Rejected'}`,
      message: status === 'verified' 
        ? "Your KYC verification has been approved. You can now invest in properties."
        : `Your KYC verification has been rejected. Reason: ${rejectionReason}`,
      link: "/profile"
    });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating KYC status" });
  }
});

// More admin routes can be added here

export default adminRouter;