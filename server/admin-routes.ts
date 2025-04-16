import { Request, Response, Router } from "express";
import { storage } from "./storage";
import { z } from "zod";
import { 
  accreditationLevelEnum, 
  kycStatusEnum, 
  insertPropertySchema,
  userRoleEnum,
  propertyTypeEnum,
  investmentTierEnum,
  investmentStatusEnum,
  paymentMethodEnum
} from "@shared/schema";
import { ensureAdmin, ensureSuperAdmin } from "./auth-jwt";

const adminRouter = Router();

// Admin dashboard overview stats
adminRouter.get('/dashboard/stats', ensureAdmin, async (req: Request, res: Response) => {
  try {
    // Get counts for various entities
    const properties = await storage.getAllProperties();
    const userCount = (await storage.getAllUsers()).length;
    const totalInvestments = await storage.getAllInvestments();
    
    const totalInvestmentAmount = totalInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const activeInvestmentCount = totalInvestments.filter(inv => inv.status === 'active').length;
    const pendingKycCount = (await storage.getUsersByKycStatus('pending')).length;
    
    return res.json({
      userCount,
      propertyCount: properties.length,
      totalInvestmentAmount,
      activeInvestmentCount,
      pendingKycCount,
      propertyFundingProgress: properties.reduce((sum, p) => sum + (p.currentFunding || 0), 0) / 
                             properties.reduce((sum, p) => sum + p.totalFunding, 0) * 100
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// User management
adminRouter.get('/users', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

adminRouter.get('/users/:id', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's investments
    const investments = await storage.getUserInvestments(userId);
    
    return res.json({
      user,
      investments
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// Admin can update user role (only super_admin can promote to admin)
adminRouter.patch('/users/:id/role', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    
    // Validate the role
    if (!userRoleEnum.enumValues.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    // Regular admins can only set roles to 'user'
    if (req.user.role === 'admin' && role !== 'user') {
      return res.status(403).json({ error: 'Only super admins can promote users to admin roles' });
    }
    
    const updatedUser = await storage.updateUserProfile(userId, { role });
    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
});

// KYC verification management
adminRouter.get('/kyc/pending', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const pendingKycUsers = await storage.getUsersByKycStatus('pending');
    return res.json(pendingKycUsers);
  } catch (error) {
    console.error('Error fetching pending KYC verifications:', error);
    return res.status(500).json({ error: 'Failed to fetch pending KYC verifications' });
  }
});

adminRouter.patch('/kyc/:userId/verify', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { status, rejectionReason } = req.body;
    
    // Validate the status
    if (!kycStatusEnum.enumValues.includes(status)) {
      return res.status(400).json({ error: 'Invalid KYC status' });
    }
    
    let verifiedAt = null;
    if (status === 'verified') {
      verifiedAt = new Date();
    }
    
    const updatedUser = await storage.updateUserKycStatus(userId, status, rejectionReason, verifiedAt);
    
    // Create notification for the user
    const notificationMessage = status === 'verified' 
      ? 'Your KYC verification has been approved.' 
      : `Your KYC verification has been rejected. Reason: ${rejectionReason || 'Not specified'}`;
    
    await storage.createNotification({
      userId,
      type: 'kyc',
      title: 'KYC Verification Update',
      message: notificationMessage
    });
    
    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating KYC status:', error);
    return res.status(500).json({ error: 'Failed to update KYC status' });
  }
});

// Property management
adminRouter.get('/properties', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const properties = await storage.getAllProperties();
    return res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Add new property
adminRouter.post('/properties', ensureAdmin, async (req: Request, res: Response) => {
  try {
    // Validate property input
    const validatedData = insertPropertySchema.parse(req.body);
    
    const newProperty = await storage.createProperty(validatedData);
    return res.status(201).json(newProperty);
  } catch (error) {
    console.error('Error creating property:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid property data', details: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create property' });
  }
});

// Get property details with investments
adminRouter.get('/properties/:id', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    const property = await storage.getProperty(propertyId);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Get property investments
    const investments = await storage.getInvestmentsByProperty(propertyId);
    
    return res.json({
      property,
      investments,
      totalInvested: investments.reduce((sum, inv) => sum + inv.amount, 0),
      investorCount: investments.length
    });
  } catch (error) {
    console.error('Error fetching property details:', error);
    return res.status(500).json({ error: 'Failed to fetch property details' });
  }
});

// Update property
adminRouter.patch('/properties/:id', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    const property = await storage.getProperty(propertyId);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    const updatedProperty = await storage.updateProperty(propertyId, req.body);
    return res.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    return res.status(500).json({ error: 'Failed to update property' });
  }
});

// Add property update
adminRouter.post('/properties/:id/updates', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    const { updateText, imageUrl } = req.body;
    
    if (!updateText && !imageUrl) {
      return res.status(400).json({ error: 'Either updateText or imageUrl is required' });
    }
    
    const property = await storage.getProperty(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Add update to property
    const update = {
      text: updateText,
      imageUrl,
      date: new Date()
    };
    
    const updatedProperty = await storage.addPropertyUpdateOrImage(propertyId, { 
      updates: [...(property.updates || []), update] 
    });
    
    // Notify all investors about the property update
    const investors = await storage.getInvestmentsByProperty(propertyId);
    const uniqueInvestorIds = [...new Set(investors.map(inv => inv.userId))];
    
    for (const userId of uniqueInvestorIds) {
      await storage.createNotification({
        userId,
        type: 'property',
        title: `Update for ${property.name}`,
        message: updateText || 'New property update available',
        link: `/properties/${propertyId}`
      });
    }
    
    return res.json(updatedProperty);
  } catch (error) {
    console.error('Error adding property update:', error);
    return res.status(500).json({ error: 'Failed to add property update' });
  }
});

// Investment management
adminRouter.get('/investments', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const investments = await storage.getAllInvestments();
    return res.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    return res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// Update investment status
adminRouter.patch('/investments/:id/status', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const investmentId = parseInt(req.params.id);
    const { status } = req.body;
    
    // Validate status
    if (!investmentStatusEnum.enumValues.includes(status)) {
      return res.status(400).json({ error: 'Invalid investment status' });
    }
    
    const investment = await storage.getInvestment(investmentId);
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    // Update investment status
    const updatedInvestment = await storage.updateInvestmentStatus(investmentId, status);
    
    // Notify the investor
    await storage.createNotification({
      userId: investment.userId,
      type: 'investment',
      title: 'Investment Status Update',
      message: `Your investment in ${(await storage.getProperty(investment.propertyId))?.name} is now ${status}.`,
      link: `/investments/${investmentId}`
    });
    
    return res.json(updatedInvestment);
  } catch (error) {
    console.error('Error updating investment status:', error);
    return res.status(500).json({ error: 'Failed to update investment status' });
  }
});

// Update investment returns
adminRouter.patch('/investments/:id/returns', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const investmentId = parseInt(req.params.id);
    const { earnings, monthlyReturns } = req.body;
    
    if (typeof earnings !== 'number' || !monthlyReturns) {
      return res.status(400).json({ error: 'Invalid returns data' });
    }
    
    const investment = await storage.getInvestment(investmentId);
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    // Update investment returns
    const updatedInvestment = await storage.updateInvestmentReturns(investmentId, earnings, monthlyReturns);
    
    // Notify the investor
    await storage.createNotification({
      userId: investment.userId,
      type: 'investment',
      title: 'Investment Returns Updated',
      message: `Your returns for the investment in ${(await storage.getProperty(investment.propertyId))?.name} have been updated.`,
      link: `/investments/${investmentId}`
    });
    
    return res.json(updatedInvestment);
  } catch (error) {
    console.error('Error updating investment returns:', error);
    return res.status(500).json({ error: 'Failed to update investment returns' });
  }
});

// Educational content management
adminRouter.get('/educational-resources', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const resources = await storage.getAllEducationalResources();
    return res.json(resources);
  } catch (error) {
    console.error('Error fetching educational resources:', error);
    return res.status(500).json({ error: 'Failed to fetch educational resources' });
  }
});

adminRouter.post('/educational-resources', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const newResource = await storage.createEducationalResource(req.body);
    return res.status(201).json(newResource);
  } catch (error) {
    console.error('Error creating educational resource:', error);
    return res.status(500).json({ error: 'Failed to create educational resource' });
  }
});

// Payment transaction management
adminRouter.get('/payment-transactions', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const transactions = await storage.getAllPaymentTransactions();
    return res.json(transactions);
  } catch (error) {
    console.error('Error fetching payment transactions:', error);
    return res.status(500).json({ error: 'Failed to fetch payment transactions' });
  }
});

adminRouter.patch('/payment-transactions/:id/status', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const transactionId = parseInt(req.params.id);
    const { status, gatewayReference } = req.body;
    
    const updatedTransaction = await storage.updateTransactionStatus(transactionId, status, gatewayReference);
    
    // Create notification for user
    const transaction = await storage.getPaymentTransaction(transactionId);
    if (transaction) {
      await storage.createNotification({
        userId: transaction.userId,
        type: 'payment',
        title: 'Payment Status Update',
        message: `Your payment transaction #${transactionId} is now ${status}.`
      });
    }
    
    return res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating payment transaction status:', error);
    return res.status(500).json({ error: 'Failed to update payment transaction status' });
  }
});

// System settings (Super Admin only)
adminRouter.get('/system-settings', ensureSuperAdmin, async (req: Request, res: Response) => {
  // This would fetch system settings from a settings table or config
  return res.json({
    maintenanceMode: false,
    registrationEnabled: true,
    systemVersion: "1.0.0",
    lastBackup: new Date().toISOString()
  });
});

// Activity logs (Super Admin only)
adminRouter.get('/activity-logs', ensureSuperAdmin, async (req: Request, res: Response) => {
  // This would fetch activity logs from a dedicated table
  return res.json([
    {
      id: 1,
      userId: req.user.id,
      action: "Admin Login",
      details: "Admin user logged in",
      timestamp: new Date().toISOString()
    }
  ]);
});

export { adminRouter };