import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { storage } from '../storage';
import { CryptoPaymentService } from '../services/crypto-payment-service';

// Initialize the crypto payment service
const cryptoPaymentService = new CryptoPaymentService();

const router = express.Router();

// Create an investment
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { propertyId, amount, paymentMethod = 'wallet' } = req.body;
    
    if (!propertyId || !amount) {
      return res.status(400).json({ message: 'Property ID and amount are required' });
    }

    const userId = req.jwtPayload?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get property details
    const property = await storage.getProperty(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if property is available for investment
    if (property.currentFunding >= property.totalFunding) {
      return res.status(400).json({ message: 'Property is fully funded' });
    }

    if (property.daysLeft <= 0) {
      return res.status(400).json({ message: 'Property funding period has ended' });
    }

    // Check if minimum investment amount is met
    if (amount < property.minimumInvestment) {
      return res.status(400).json({ 
        message: `Minimum investment amount is ${property.minimumInvestment}` 
      });
    }

    // Process investment based on payment method
    if (paymentMethod === 'wallet') {
      // Check wallet balance
      const wallet = await storage.getWalletBalance(userId);
      
      if (!wallet || wallet.balance < amount) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      // Deduct from wallet
      await storage.updateWalletBalance(userId, -amount);
    }

    // Create investment record
    const investment = await storage.createInvestment({
      userId,
      propertyId,
      amount,
      status: 'active',
      paymentMethod,
      startDate: new Date(),
      expectedEndDate: new Date(Date.now() + (property.term * 30 * 24 * 60 * 60 * 1000)), // term in months
      expectedReturn: property.targetReturn,
    });

    // Update property funding
    await storage.updatePropertyFunding(propertyId, amount);

    // Create notification
    await storage.createNotification({
      userId,
      type: 'investment_success',
      title: 'Investment Successful',
      message: `Your investment of ${amount} in ${property.name} has been processed successfully.`,
      isRead: false
    });

    res.status(201).json({
      message: 'Investment successful',
      investment
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({ message: 'Failed to process investment' });
  }
});

// Create investment from crypto payment
router.post('/crypto', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { paymentId, propertyId, amount } = req.body;
    
    if (!paymentId || !propertyId || !amount) {
      return res.status(400).json({ 
        message: 'Payment ID, property ID, and amount are required' 
      });
    }

    const userId = req.jwtPayload?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get property details
    const property = await storage.getProperty(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Get payment details
    const userTransactions = await cryptoPaymentService.getTransactionsByUser(userId.toString());
    const payment = userTransactions.find(tx => tx.id === paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check payment status
    if (payment.status !== 'confirmed') {
      return res.status(400).json({ 
        message: `Payment not confirmed. Current status: ${payment.status}` 
      });
    }

    // Create investment record
    const investment = await storage.createInvestment({
      userId,
      propertyId,
      amount,
      status: 'active',
      paymentMethod: 'crypto',
      paymentReference: paymentId,
      startDate: new Date(),
      expectedEndDate: new Date(Date.now() + (property.term * 30 * 24 * 60 * 60 * 1000)), // term in months
      expectedReturn: property.targetReturn,
    });

    // Update property funding
    await storage.updatePropertyFunding(propertyId, amount);

    // Create notification
    await storage.createNotification({
      userId,
      type: 'investment_success',
      title: 'Crypto Investment Successful',
      message: `Your investment of ${amount} in ${property.name} via cryptocurrency has been processed successfully.`,
      isRead: false
    });

    res.status(201).json({
      message: 'Crypto investment successful',
      investment
    });
  } catch (error) {
    console.error('Error creating crypto investment:', error);
    res.status(500).json({ message: 'Failed to process crypto investment' });
  }
});

// Get user investments
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const investments = await storage.getUserInvestments(userId);
    
    res.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ message: 'Failed to fetch investments' });
  }
});

// Get investment details
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const investmentId = parseInt(req.params.id);
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const investment = await storage.getInvestment(investmentId);
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    if (investment.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.json(investment);
  } catch (error) {
    console.error('Error fetching investment:', error);
    res.status(500).json({ message: 'Failed to fetch investment' });
  }
});

export default router;