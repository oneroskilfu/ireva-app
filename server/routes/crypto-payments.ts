import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { storage } from '../storage';
import { cryptoPaymentService } from '../services/crypto-payment-service';

const router = express.Router();

// Create a new crypto payment
router.post('/create', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { propertyId, amount, currency = 'USDC' } = req.body;
    
    // Validate input
    if (!propertyId || !amount) {
      return res.status(400).json({ message: 'Property ID and amount are required' });
    }
    
    // Get user ID from authenticated user
    const userId = req.jwtPayload?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get property details to make sure it exists
    const property = await storage.getProperty(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create payment using the crypto payment service
    const payment = await cryptoPaymentService.createPayment({
      propertyId,
      userId,
      amount,
      currency
    });
    
    // Return payment details to client
    res.status(201).json({
      id: payment.id,
      status: payment.status,
      address: payment.address,
      cryptoAmount: payment.cryptoAmount,
      currency: payment.currency,
      qrCode: payment.qrCode,
      explorerUrl: payment.explorerUrl,
      expiresAt: payment.expiresAt,
      rate: payment.rate
    });
    
  } catch (error) {
    console.error('Error creating crypto payment:', error);
    res.status(500).json({ message: 'Failed to create payment' });
  }
});

// Get payment status
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id;
    
    // Get user ID from authenticated user
    const userId = req.jwtPayload?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get all transactions for the current user
    const userTransactions = await cryptoPaymentService.getTransactionsByUser(userId.toString());
    
    // Find the payment that matches the ID
    const payment = userTransactions.find(tx => tx.id === paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Return payment details
    res.json({
      id: payment.id,
      status: payment.status,
      address: payment.paymentAddress || payment.address,
      cryptoAmount: payment.cryptoAmount,
      currency: payment.cryptoCurrency || payment.currency,
      network: payment.network || 'Ethereum',
      qrCode: payment.qrCodeUrl || payment.qrCode,
      explorerUrl: payment.explorerUrl,
      expiresAt: payment.expiresAt,
      rate: payment.rate
    });
    
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ message: 'Failed to get payment status' });
  }
});

export default router;