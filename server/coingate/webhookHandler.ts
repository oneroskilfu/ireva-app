import express, { Request, Response } from 'express';
import crypto from 'crypto';
import { CryptoPaymentService } from '../services/crypto-payment-service';
import { walletService } from '../services/wallet-service';

const router = express.Router();
const cryptoPaymentService = new CryptoPaymentService();

/**
 * Validate webhook signature
 * @param req Express request object
 * @returns Boolean indicating if signature is valid
 */
const validateWebhookSignature = (req: Request): boolean => {
  // If no webhook secret or not in production, skip validation
  if (!process.env.COINGATE_WEBHOOK_SECRET || process.env.NODE_ENV !== 'production') {
    return true;
  }

  try {
    // Get the signature from the headers
    const signature = req.headers['coingate-signature'] as string;
    if (!signature) {
      console.warn('No CoinGate signature provided in webhook');
      return false;
    }

    // Get the raw body
    const payload = req.body;
    const rawBody = JSON.stringify(payload);

    // Create a HMAC using the webhook secret
    const hmac = crypto.createHmac('sha256', process.env.COINGATE_WEBHOOK_SECRET);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');

    // Compare signatures using constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return false;
  }
};

/**
 * Process the webhook event
 * @param data Webhook payload
 * @returns Results of processing
 */
const processWebhookEvent = async (data: any) => {
  console.log('Processing CoinGate webhook event:', data);

  try {
    // Check if this is a payment status update
    if (data.id && data.status && data.order_id) {
      const paymentId = data.id;
      const status = data.status.toLowerCase();
      const orderId = data.order_id;
      const transactionId = data.pay_transaction?.id || data.transaction_id;

      // Map CoinGate status to our internal status
      let internalStatus;
      if (status === 'paid' || status === 'confirming') {
        internalStatus = 'processing';
      } else if (status === 'confirmed' || status === 'complete') {
        internalStatus = 'completed';
      } else if (status === 'invalid' || status === 'expired' || status === 'canceled') {
        internalStatus = 'failed';
      } else if (status === 'refunded') {
        internalStatus = 'refunded';
      } else {
        internalStatus = status;
      }

      // Update payment status in our system
      const result = await cryptoPaymentService.updateTransactionStatus(paymentId, {
        status: internalStatus,
        txHash: transactionId,
        paymentProviderReference: data.id,
        paymentProviderResponse: JSON.stringify(data)
      });

      // If payment is confirmed, process it further
      if (internalStatus === 'completed' && result) {
        // Get the payment details
        const payment = await cryptoPaymentService.getPayment(paymentId);
        
        if (payment && payment.userId) {
          // Process crypto payment confirmation - this will update wallet and related records
          await walletService.processCryptoPaymentConfirmation(paymentId);
        }
      }

      return { success: true, status: internalStatus, orderId };
    }

    return { success: false, message: 'Unrecognized webhook event format' };
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return { success: false, message: error.message };
  }
};

// Main webhook endpoint
router.post('/coingate/webhook', async (req: Request, res: Response) => {
  try {
    // Validate the webhook signature
    if (!validateWebhookSignature(req)) {
      console.error('Invalid webhook signature');
      // Return 200 to avoid webhook retries, but log the error
      return res.status(200).json({ error: 'Invalid signature' });
    }

    // Process the webhook data
    const result = await processWebhookEvent(req.body);
    
    // Always return a 200 status to acknowledge receipt
    // CoinGate will retry webhooks if non-200 status is returned
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    // Still return 200 to prevent CoinGate from retrying
    res.status(200).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test endpoint to simulate webhooks (only in development)
router.post('/test/coingate-webhook', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Test endpoint only available in development mode' });
  }
  
  try {
    // Create a mock webhook payload
    const testPayload = {
      id: `webhook_${Date.now()}`,
      status: req.body.status || 'confirmed',
      order_id: req.body.order_id || `iREVA-${Date.now()}`,
      price_amount: req.body.amount || '1000.00',
      price_currency: 'USD',
      receive_amount: req.body.crypto_amount || '1000.00',
      receive_currency: req.body.currency || 'USDT',
      pay_amount: req.body.crypto_amount || '1000.00',
      pay_currency: req.body.currency || 'USDT',
      pay_transaction: {
        id: `tx_${Date.now()}`,
        network: req.body.network || 'ethereum',
        hash: req.body.tx_hash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
      },
      created_at: new Date().toISOString()
    };
    
    // Process the test webhook
    const result = await processWebhookEvent(testPayload);
    res.status(200).json({ result, testPayload });
  } catch (error: any) {
    console.error('Test webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export const webhookRouter = router;