import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../auth-jwt';
import { storage } from '../storage';
import { CryptoPaymentService } from '../services/crypto-payment-service';

const router = express.Router();
const cryptoPaymentService = new CryptoPaymentService();

// Create a new crypto payment
router.post('/create', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { propertyId, amount, userId } = req.body;

    if (!propertyId || !amount) {
      return res.status(400).json({ error: 'Property ID and amount are required' });
    }

    // Get property details to verify it exists
    const property = await storage.getProperty(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Verify user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create crypto payment
    const payment = await cryptoPaymentService.createPayment({
      userId,
      propertyId,
      amount,
      currency: 'USDC' // Default to USDC, could be made configurable
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating crypto payment:', error);
    res.status(500).json({ error: 'Failed to create crypto payment' });
  }
});

// Get payment status
router.get('/:id/status', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id;
    const status = await cryptoPaymentService.getPaymentStatus(paymentId);
    
    res.json({ status });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

// List user's crypto payments
router.get('/user/:userId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Ensure user is requesting their own data or is admin
    if (req.jwtPayload?.id !== userId && req.jwtPayload?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to access this resource' });
    }
    
    const payments = await cryptoPaymentService.getUserPayments(userId);
    res.json(payments);
  } catch (error) {
    console.error('Error getting user payments:', error);
    res.status(500).json({ error: 'Failed to get user payments' });
  }
});

// Get a specific payment
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id;
    const payment = await cryptoPaymentService.getPayment(paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Ensure user is requesting their own data or is admin
    if (req.jwtPayload?.id !== payment.userId && req.jwtPayload?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to access this resource' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({ error: 'Failed to get payment' });
  }
});

// Webhook for crypto payment provider (would be public in production)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    // In production, you would verify the webhook signature
    const { paymentId, txHash, status } = req.body;
    
    if (!paymentId || !status) {
      return res.status(400).json({ error: 'Payment ID and status are required' });
    }
    
    await cryptoPaymentService.updatePaymentStatus(paymentId, status, txHash);
    
    // If payment is confirmed, create the investment
    if (status === 'completed') {
      const payment = await cryptoPaymentService.getPayment(paymentId);
      
      if (payment) {
        // Create investment record
        await storage.createInvestment({
          userId: payment.userId,
          propertyId: payment.propertyId,
          amount: payment.amount,
          paymentMethod: 'crypto',
          status: 'active',
          paymentReference: payment.id
        });
        
        // Create notification for the user
        const property = await storage.getProperty(payment.propertyId);
        
        if (property) {
          await storage.createNotification({
            userId: payment.userId,
            type: 'investment_success',
            title: 'Crypto Investment Successful',
            message: `Your crypto investment of $${payment.amount} in ${property.name} was successful.`,
            isRead: false
          });
        }
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Cancel a payment
router.post('/:id/cancel', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id;
    const payment = await cryptoPaymentService.getPayment(paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Ensure user is cancelling their own payment or is admin
    if (req.jwtPayload?.id !== payment.userId && req.jwtPayload?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to cancel this payment' });
    }
    
    const result = await cryptoPaymentService.cancelPayment(paymentId);
    res.json(result);
  } catch (error) {
    console.error('Error cancelling payment:', error);
    res.status(500).json({ error: 'Failed to cancel payment' });
  }
});

export default router;