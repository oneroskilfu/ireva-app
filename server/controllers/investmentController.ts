import { Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertInvestmentSchema } from '../../shared/schema';
import * as emailService from '../services/emailService';

// Get all investments for a user
export async function getUserInvestments(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const investments = await storage.getUserInvestments(req.user.id);
    
    // Fetch property details for each investment
    const investmentsWithPropertyDetails = await Promise.all(
      investments.map(async (investment) => {
        const property = await storage.getProperty(investment.propertyId);
        return {
          ...investment,
          property
        };
      })
    );

    return res.status(200).json(investmentsWithPropertyDetails);
  } catch (error) {
    console.error('Error fetching user investments:', error);
    return res.status(500).json({ message: 'Error fetching investments' });
  }
}

// Get investment by ID
export async function getInvestmentById(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const investmentId = parseInt(id);

    if (isNaN(investmentId)) {
      return res.status(400).json({ message: 'Invalid investment ID' });
    }

    const investment = await storage.getInvestment(investmentId);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // Check if the user owns this investment or is an admin
    if (investment.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'You do not have permission to view this investment' });
    }

    // Get property details
    const property = await storage.getProperty(investment.propertyId);

    return res.status(200).json({
      ...investment,
      property
    });
  } catch (error) {
    console.error('Error fetching investment:', error);
    return res.status(500).json({ message: 'Error fetching investment details' });
  }
}

// Create a new investment
export async function createInvestment(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const schema = z.object({
      propertyId: z.number(),
      amount: z.number().positive('Amount must be positive'),
      paymentMethod: z.enum(['wallet', 'card', 'bank_transfer']),
      paymentReference: z.string().optional()
    });

    const { propertyId, amount, paymentMethod, paymentReference } = schema.parse(req.body);

    // Get property details
    const property = await storage.getProperty(propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check minimum investment
    if (amount < property.minimumInvestment) {
      return res.status(400).json({ 
        message: `Minimum investment amount is ₦${property.minimumInvestment.toLocaleString()}` 
      });
    }

    // Check available funding
    const availableFunding = property.totalFunding - property.currentFunding;
    if (amount > availableFunding) {
      return res.status(400).json({ 
        message: `Only ₦${availableFunding.toLocaleString()} funding available` 
      });
    }

    // Check user KYC status
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.kycStatus !== 'verified' && property.accreditedOnly) {
      return res.status(403).json({ 
        message: 'KYC verification required for this investment' 
      });
    }

    if (property.accreditationLevel && (!user.accreditationLevel || user.accreditationLevel !== property.accreditationLevel)) {
      return res.status(403).json({ 
        message: `This investment requires ${property.accreditationLevel} accreditation level` 
      });
    }

    // Handle payment based on method
    if (paymentMethod === 'wallet') {
      // Check wallet balance
      const wallet = await storage.getUserWallet(req.user.id);
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
      }

      if (wallet.balance < amount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      // Update wallet balance
      await storage.updateWalletBalance(wallet.id, -amount);

      // Create wallet transaction
      await storage.createWalletTransaction({
        walletId: wallet.id,
        amount: -amount,
        type: 'investment',
        description: `Investment in ${property.name}`,
        reference: `INV-${Date.now()}`,
        status: 'successful'
      }, wallet);
    } else if (paymentMethod === 'card') {
      // For now, we'll assume card payment was successful
      // In a real application, you would integrate with a payment processor
      if (!paymentReference) {
        return res.status(400).json({ message: 'Payment reference is required for card payments' });
      }

      // Create payment transaction
      await storage.createPaymentTransaction({
        userId: req.user.id,
        amount,
        method: 'card',
        reference: paymentReference,
        description: `Investment in ${property.name}`,
        status: 'successful'
      });
    } else {
      // Handle bank transfer
      return res.status(400).json({ message: 'Bank transfer not implemented yet' });
    }

    // Create investment
    const investmentData = insertInvestmentSchema.parse({
      userId: req.user.id,
      propertyId,
      amount,
      currentValue: amount,
      status: 'active',
      earnings: 0
    });

    const investment = await storage.createInvestment(investmentData);

    // Update property funding
    await storage.updateProperty(propertyId, {
      currentFunding: property.currentFunding + amount,
      numberOfInvestors: (property.numberOfInvestors || 0) + 1
    });

    // Send investment confirmation email
    if (user.email) {
      await emailService.sendInvestmentConfirmationEmail(user, property, investment);
    }

    // Create notification
    await storage.createNotification({
      userId: req.user.id,
      type: 'investment',
      title: 'Investment Successful',
      message: `Your investment of ₦${amount.toLocaleString()} in ${property.name} was successful.`,
      link: `/investments/${investment.id}`,
      isRead: false,
      createdAt: new Date()
    });

    return res.status(201).json({
      message: 'Investment created successfully',
      investment,
      property
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid investment data', errors: error.errors });
    }
    console.error('Error creating investment:', error);
    return res.status(500).json({ message: 'Error creating investment' });
  }
}

// Get all investments (admin only)
export async function getAllInvestments(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const investments = await storage.getAllInvestments();

    // Fetch user and property details for each investment
    const investmentsWithDetails = await Promise.all(
      investments.map(async (investment) => {
        const user = await storage.getUser(investment.userId);
        const property = await storage.getProperty(investment.propertyId);
        return {
          ...investment,
          user: {
            id: user?.id,
            username: user?.username,
            email: user?.email,
            firstName: user?.firstName,
            lastName: user?.lastName
          },
          property
        };
      })
    );

    return res.status(200).json(investmentsWithDetails);
  } catch (error) {
    console.error('Error fetching all investments:', error);
    return res.status(500).json({ message: 'Error fetching investments' });
  }
}

// Get investments by property
export async function getInvestmentsByProperty(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { propertyId } = req.params;
    const id = parseInt(propertyId);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }

    const investments = await storage.getInvestmentsByProperty(id);

    // Fetch user details for each investment
    const investmentsWithUserDetails = await Promise.all(
      investments.map(async (investment) => {
        const user = await storage.getUser(investment.userId);
        return {
          ...investment,
          user: {
            id: user?.id,
            username: user?.username,
            email: user?.email,
            firstName: user?.firstName,
            lastName: user?.lastName
          }
        };
      })
    );

    return res.status(200).json(investmentsWithUserDetails);
  } catch (error) {
    console.error('Error fetching investments by property:', error);
    return res.status(500).json({ message: 'Error fetching investments' });
  }
}

// Update investment status (admin only)
export async function updateInvestmentStatus(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const investmentId = parseInt(id);

    if (isNaN(investmentId)) {
      return res.status(400).json({ message: 'Invalid investment ID' });
    }

    const schema = z.object({
      status: z.enum(['pending', 'active', 'completed'])
    });

    const { status } = schema.parse(req.body);

    const investment = await storage.getInvestment(investmentId);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    const updatedInvestment = await storage.updateInvestmentStatus(investmentId, status);

    return res.status(200).json({
      message: 'Investment status updated successfully',
      investment: updatedInvestment
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid status', errors: error.errors });
    }
    console.error('Error updating investment status:', error);
    return res.status(500).json({ message: 'Error updating investment status' });
  }
}

// Update investment returns
export async function updateInvestmentReturns(req: Request, res: Response) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const investmentId = parseInt(id);

    if (isNaN(investmentId)) {
      return res.status(400).json({ message: 'Invalid investment ID' });
    }

    const schema = z.object({
      earnings: z.number(),
      monthlyReturns: z.record(z.string(), z.number()).optional()
    });

    const { earnings, monthlyReturns } = schema.parse(req.body);

    const investment = await storage.getInvestment(investmentId);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    const updatedInvestment = await storage.updateInvestmentReturns(
      investmentId, 
      earnings, 
      monthlyReturns || {}
    );

    // Get user and property details for email notification
    const user = await storage.getUser(investment.userId);
    const property = await storage.getProperty(investment.propertyId);

    if (user && property) {
      // Calculate monthly return based on the difference in earnings
      const monthlyReturn = earnings - (investment.earnings || 0);

      // Send email notification if there's a monthly return
      if (monthlyReturn > 0 && user.email) {
        await emailService.sendMonthlyReturnsEmail(user, updatedInvestment, property, monthlyReturn);
      }

      // Create in-app notification
      await storage.createNotification({
        userId: investment.userId,
        type: 'investment',
        title: 'Investment Returns Updated',
        message: `Your investment in ${property.name} has generated returns of ₦${monthlyReturn.toLocaleString()} this month.`,
        link: `/investments/${investment.id}`,
        isRead: false,
        createdAt: new Date()
      });
    }

    return res.status(200).json({
      message: 'Investment returns updated successfully',
      investment: updatedInvestment
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid data', errors: error.errors });
    }
    console.error('Error updating investment returns:', error);
    return res.status(500).json({ message: 'Error updating investment returns' });
  }
}