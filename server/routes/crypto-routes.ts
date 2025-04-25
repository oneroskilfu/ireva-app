import express from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { 
  webhookRateLimiter, 
  verifyWebhookSignature, 
  validateCryptoTransaction 
} from '../middleware/webhookSecurityMiddleware';
import { 
  createCryptoPayment, 
  getPaymentStatus, 
  getUserPayments, 
  handleWebhook 
} from '../controllers/cryptoPaymentController';
import { CryptoPaymentService } from '../services/crypto-payment-service';

export const cryptoRoutes = express.Router();
const cryptoPaymentService = new CryptoPaymentService();

// Get supported cryptocurrencies
cryptoRoutes.get('/supported-currencies', authMiddleware, async (req, res) => {
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

// Create a new crypto payment (with auth)
cryptoRoutes.post('/create-crypto-payment', authMiddleware, createCryptoPayment);

// Get payment status (with auth)
cryptoRoutes.get('/payment-status/:paymentId', authMiddleware, getPaymentStatus);

// Get user's payment history (with auth)
cryptoRoutes.get('/payments', authMiddleware, getUserPayments);

// Webhook handler for payment status updates (with security middleware)
cryptoRoutes.post(
  '/webhook', 
  webhookRateLimiter, 
  verifyWebhookSignature, 
  validateCryptoTransaction, 
  handleWebhook
);

export default cryptoRoutes;