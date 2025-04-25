import express, { Request, Response } from 'express';
import { authMiddleware, ensureAdmin } from '../auth-jwt';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Investment from '../models/Investment';
import { CryptoPaymentService } from '../services/crypto-payment-service.js';
import { walletService } from '../services/wallet-service.js';
import { bypassSignatureVerificationInDevelopment } from '../middleware/webhookSignatureVerifier';
import { rawBodyParser } from '../middleware/rawBodyParser';

const router = express.Router();
const cryptoPaymentService = new CryptoPaymentService();

/**
 * Main webhook handler function to process cryptocurrency payments
 */
async function updateCryptoTransactionStatus(req: Request, res: Response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      id, 
      status, 
      order_id,
      payment_id,
      price_amount,
      price_currency,
      receive_amount,
      receive_currency,
      pay_amount,
      pay_currency,
      network,
      transaction_id
    } = req.body;

    console.log('Received webhook notification:', JSON.stringify(req.body, null, 2));

    // Find the transaction by payment ID
    const transaction = await Transaction.findOne({ paymentId: payment_id });
    if (!transaction) {
      console.error(`Transaction not found for payment ID: ${payment_id}`);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Map webhook status to our status
    let internalStatus;
    if (status === 'paid' || status === 'confirming') {
      internalStatus = 'pending';
    } else if (status === 'confirmed' || status === 'complete') {
      internalStatus = 'completed';
    } else if (status === 'invalid' || status === 'expired' || status === 'canceled') {
      internalStatus = 'failed';
    } else if (status === 'refunded') {
      internalStatus = 'cancelled';
    }

    // Update transaction status
    if (internalStatus) {
      transaction.status = internalStatus;
    }

    // Add additional data from the webhook
    transaction.transactionHash = transaction_id || null;
    if (status === 'confirmed' || status === 'complete') {
      transaction.completedAt = new Date();
    }

    // Save additional metadata
    transaction.metadata = transaction.metadata || {};
    transaction.metadata.webhookData = req.body;
    transaction.metadata.lastWebhookReceived = new Date();

    await transaction.save();

    // If payment is confirmed, update the investment as well
    if (internalStatus === 'completed') {
      const investment = await Investment.findOne({ paymentId: payment_id });
      if (investment) {
        investment.status = 'active';
        await investment.save();

        // Update project funding
        await cryptoPaymentService.updateTransactionStatus(payment_id, {
          status: 'confirmed',
          txHash: transaction_id
        });
        
        // Update wallet balance based on this transaction
        await walletService.processCryptoPaymentConfirmation(payment_id);
      }
    }

    await session.commitTransaction();
    session.endSession();

    // Always return a 200 OK to the webhook provider
    res.status(200).json({ success: true });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    
    console.error('Webhook processing error:', error);
    // Still return 200 to avoid repeated webhook attempts
    // but include the error details
    res.status(200).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// Register the webhook routes
// Apply the raw body parser and signature verification middleware
router.post('/coingate/webhook', rawBodyParser, bypassSignatureVerificationInDevelopment, updateCryptoTransactionStatus);

// Test endpoint to simulate webhooks (only in development)
router.post('/test/webhook', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Test endpoint only available in development mode' });
  }
  
  try {
    // Create a mock webhook payload
    const testPayload = {
      id: `webhook_${Date.now()}`,
      status: req.body.status || 'confirmed',
      order_id: req.body.order_id,
      payment_id: req.body.payment_id,
      price_amount: req.body.amount || '1000.00',
      price_currency: 'USD',
      receive_amount: req.body.crypto_amount || '0.05',
      receive_currency: req.body.currency || 'USDC',
      pay_amount: req.body.crypto_amount || '0.05',
      pay_currency: req.body.currency || 'USDC',
      network: req.body.network || 'ethereum',
      transaction_id: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    };
    
    // Create a new request with the test payload
    const testReq = {
      ...req,
      body: testPayload
    };
    
    // Process the webhook
    await updateCryptoTransactionStatus(testReq as Request, res);
  } catch (error: any) {
    console.error('Test webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// For admin to manually resync payment status
router.post('/resync/:paymentId', authMiddleware, ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    if (!paymentId) {
      return res.status(400).json({ success: false, message: 'Payment ID is required' });
    }
    
    // Fetch the current status from the payment provider
    const payment = await cryptoPaymentService.getPayment(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    
    // Create a simulated webhook payload with the current payment status
    const webhookPayload = {
      id: `manual_resync_${Date.now()}`,
      status: payment.status,
      payment_id: paymentId,
      price_amount: payment.amount.toString(),
      price_currency: 'USD',
      receive_amount: payment.amountInCrypto.toString(),
      receive_currency: payment.currency,
      pay_amount: payment.amountInCrypto.toString(),
      pay_currency: payment.currency,
      network: payment.network,
      transaction_id: payment.txHash
    };
    
    // Create a new request with the payload
    const simulatedReq = {
      ...req,
      body: webhookPayload
    };
    
    // Process as if it were a webhook
    await updateCryptoTransactionStatus(simulatedReq as Request, res);
  } catch (error: any) {
    console.error('Manual resync error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export const cryptoWebhookRouter = router;