import express, { Request, Response } from 'express';
import createPayment from './createPayment';
import { verifyToken, authMiddleware } from '../auth-jwt';
import { CryptoPaymentService } from '../services/crypto-payment-service';

const router = express.Router();
const cryptoPaymentService = new CryptoPaymentService();

// Create a new crypto payment
router.post('/create-crypto-payment', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, currency, propertyId } = req.body;
    
    if (!req.jwtPayload?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }
    
    if (!propertyId) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    // Create the payment with CoinGate
    const payment = await createPayment({
      userId: parseInt(req.jwtPayload.id.toString()),
      propertyId: parseInt(propertyId.toString()),
      amount: parseFloat(amount),
      currency: currency || 'USD'
    });

    res.json({ success: true, payment });
  } catch (error: any) {
    console.error('Create crypto payment error:', error);
    res.status(500).json({ 
      error: 'Failed to create crypto payment', 
      message: error.message 
    });
  }
});

// Get payment status
router.get('/payment-status/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await cryptoPaymentService.getPayment(id);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Check if the payment belongs to the authenticated user
    if (payment.userId.toString() !== req.jwtPayload?.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json({ 
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    });
  } catch (error: any) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

// Get supported cryptocurrencies
router.get('/supported-currencies', async (_req: Request, res: Response) => {
  try {
    const currencies = cryptoPaymentService.getSupportedCurrencies();
    res.json({ currencies });
  } catch (error) {
    console.error('Get supported currencies error:', error);
    res.status(500).json({ error: 'Failed to get supported currencies' });
  }
});

// Get supported networks
router.get('/supported-networks', async (_req: Request, res: Response) => {
  try {
    const networks = cryptoPaymentService.getSupportedNetworks();
    res.json({ networks });
  } catch (error) {
    console.error('Get supported networks error:', error);
    res.status(500).json({ error: 'Failed to get supported networks' });
  }
});

// Get user's crypto payments
router.get('/payments', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.jwtPayload?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const payments = await cryptoPaymentService.getUserPayments(parseInt(req.jwtPayload.id.toString()));
    res.json({ payments });
  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({ error: 'Failed to get user payments' });
  }
});

// Cancel a pending payment
router.post('/cancel-payment/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get the payment
    const payment = await cryptoPaymentService.getPayment(id);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Check if the payment belongs to the authenticated user
    if (payment.userId.toString() !== req.jwtPayload?.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if payment can be cancelled
    if (payment.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Cannot cancel payment', 
        message: 'Only pending payments can be cancelled'
      });
    }
    
    // Cancel the payment
    const result = await cryptoPaymentService.cancelPayment(id);
    
    if (!result) {
      return res.status(500).json({ error: 'Failed to cancel payment' });
    }
    
    res.json({ success: true, message: 'Payment cancelled' });
  } catch (error: any) {
    console.error('Cancel payment error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel payment', 
      message: error.message 
    });
  }
});

export const cryptoRoutes = router;