import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { CryptoPaymentService } from '../services/crypto-payment-service';

export const cryptoRoutes = express.Router();
const cryptoPaymentService = new CryptoPaymentService();

// Get supported cryptocurrencies
cryptoRoutes.get('/supported-currencies', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currencies = await cryptoPaymentService.getSupportedCurrencies();
    res.json({ currencies });
  } catch (error: any) {
    console.error('Error fetching supported currencies:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch supported currencies' 
    });
  }
});

// Create a crypto payment
cryptoRoutes.post('/create-crypto-payment', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, currency, propertyId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be greater than 0' 
      });
    }

    // Get user info from JWT
    const userId = req.jwtPayload?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const payment = await cryptoPaymentService.createPayment({
      amount,
      userId,
      currency: currency || 'USDT',
      description: propertyId 
        ? `Property Investment (ID: ${propertyId})` 
        : 'Wallet Deposit',
      orderId: `ORDER-${Date.now()}-${userId}`,
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/wallet`,
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/crypto/webhook`,
      propertyId,
    });

    res.json({ success: true, payment });
  } catch (error: any) {
    console.error('Error creating crypto payment:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create crypto payment' 
    });
  }
});

// Get payment status
cryptoRoutes.get('/payment-status/:paymentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    
    if (!paymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment ID is required' 
      });
    }

    const status = await cryptoPaymentService.getPaymentStatus(paymentId);
    res.json({ status });
  } catch (error: any) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch payment status' 
    });
  }
});

// Get user's crypto payments
cryptoRoutes.get('/payments', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Get user info from JWT
    const userId = req.jwtPayload?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const payments = await cryptoPaymentService.getUserPayments(userId);
    res.json({ success: true, payments });
  } catch (error: any) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch user payments' 
    });
  }
});

// Webhook endpoint to receive payment notifications (this should be in webhooks.ts but defined here for simplicity)
cryptoRoutes.post('/webhook', async (req: Request, res: Response) => {
  try {
    // In production, we would verify the webhook signature here
    // if (!verifyWebhookSignature(req)) {
    //   return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    // }

    const event = req.body;
    console.log('Received webhook event:', event);

    // Process the payment status update
    if (event.id && event.status) {
      await cryptoPaymentService.updatePaymentStatus(event.id, event.status);
      
      // Update wallet balance if payment is confirmed
      if (['paid', 'confirmed', 'complete'].includes(event.status)) {
        // Get user ID from order ID
        const orderId = event.order_id;
        const userId = orderId.split('-')[2]; // Assuming format: ORDER-timestamp-userId
        
        if (userId) {
          await cryptoPaymentService.processSuccessfulPayment(event.id, parseInt(userId), parseFloat(event.price_amount));
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    // Always return 200 to CoinGate to avoid them retrying repeatedly
    res.status(200).json({ 
      success: false, 
      message: error.message || 'Error processing webhook, but acknowledged' 
    });
  }
});