import express, { Request, Response } from 'express';
import { CryptoPaymentService } from '../services/crypto-payment-service';
import authMiddleware from '../middleware/authMiddleware';
import { v4 as uuidv4 } from 'uuid';

export const cryptoRoutes = express.Router();
const cryptoPaymentService = new CryptoPaymentService();

// Get supported cryptocurrencies
cryptoRoutes.get('/supported-currencies', authMiddleware, async (req: Request, res: Response) => {
  try {
    const currencies = await cryptoPaymentService.getSupportedCurrencies();
    res.json({ success: true, currencies });
  } catch (error: any) {
    console.error('Error fetching supported currencies:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch supported currencies',
      error: error.message 
    });
  }
});

// Create a new crypto payment
cryptoRoutes.post('/create-crypto-payment', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, currency, propertyId } = req.body;
    
    if (!amount || !currency) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and currency are required' 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be greater than zero' 
      });
    }
    
    const userId = req.user!.id;
    const orderId = `IREVA-${uuidv4().substring(0, 8)}`;
    
    // Base URL for callbacks - use the same host as the request
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const payment = await cryptoPaymentService.createPayment({
      amount,
      userId,
      currency,
      description: `iREVA Wallet Fund (${currency})`,
      orderId,
      returnUrl: `${baseUrl}/wallet?payment=${orderId}`,
      callbackUrl: `${baseUrl}/api/crypto/webhook`,
      propertyId
    });
    
    res.json({ 
      success: true, 
      payment,
      message: 'Payment created successfully' 
    });
  } catch (error: any) {
    console.error('Error creating crypto payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment',
      error: error.message 
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
    
    res.json({ 
      success: true, 
      status,
      message: 'Payment status retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment status',
      error: error.message 
    });
  }
});

// Get user's payment history
cryptoRoutes.get('/payments', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const payments = await cryptoPaymentService.getUserPayments(userId);
    
    res.json({ 
      success: true, 
      payments,
      message: 'Payment history retrieved successfully' 
    });
  } catch (error: any) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment history',
      error: error.message 
    });
  }
});

// Webhook handler for payment status updates
cryptoRoutes.post('/webhook', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('Received webhook payload:', payload);
    
    // Verify signature if COINGATE_WEBHOOK_SECRET is set
    const signature = req.headers['coingate-signature'];
    
    if (process.env.COINGATE_WEBHOOK_SECRET && signature) {
      // Implement signature verification
      // This should be implemented in a middleware
    }
    
    // Process the webhook
    if (payload.id && payload.status) {
      // Update payment status
      await cryptoPaymentService.updatePaymentStatus(payload.id, payload.status);
      
      // If the payment is complete, credit the user's wallet
      if (['paid', 'confirmed'].includes(payload.status)) {
        const userId = parseInt(payload.custom_data?.userId) || 0;
        const amount = parseFloat(payload.price_amount) || 0;
        
        if (userId && amount) {
          await cryptoPaymentService.processSuccessfulPayment(payload.id, userId, amount);
        }
      }
      
      return res.status(200).json({ success: true });
    }
    
    res.status(400).json({ success: false, message: 'Invalid webhook payload' });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process webhook',
      error: error.message 
    });
  }
});

export default cryptoRoutes;