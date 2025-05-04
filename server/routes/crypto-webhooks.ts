import express, { Request, Response } from 'express';
import { db } from '../db';
import { cryptoPayments } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { webhookSignatureVerifier } from '../middleware/webhookSignatureVerifier';
import { CryptoPaymentService } from '../services/crypto-payment-service';

// Initialize services using singleton
const cryptoPaymentService = CryptoPaymentService.getInstance();

// Create router
export const cryptoWebhookRouter = express.Router();

/**
 * CoinGate webhook handler endpoint
 * Receives transaction status updates from CoinGate and updates our database
 * 
 * The webhook should be verified using a signature provided by CoinGate
 * in the X-Coingate-Signature header
 */
cryptoWebhookRouter.post('/coingate-webhook', webhookSignatureVerifier, async (req: Request, res: Response) => {
  const { order_id, status, id, price_amount, price_currency, receive_amount, receive_currency, payment_url } = req.body;

  console.log('Received CoinGate webhook:', req.body);

  try {
    // First check if we have this transaction in our database
    const transaction = await db.query.cryptoPayments.findFirst({
      where: eq(cryptoPayments.orderId, order_id)
    });

    if (!transaction) {
      console.error(`Transaction with order_id ${order_id} not found`);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update the transaction status
    const updatedTransaction = await db
      .update(cryptoPayments)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(cryptoPayments.orderId, order_id))
      .returning();

    console.log(`Updated transaction status for ${order_id} to ${status}`);

    // Handle additional logic based on transaction status
    if (status === 'paid' || status === 'confirmed') {
      // If payment is confirmed, we might want to record the investment
      // or update other related data
      await cryptoPaymentService.handleSuccessfulPayment(transaction.id);
      
      console.log(`Payment ${order_id} confirmed and processed successfully`);
    } else if (status === 'invalid' || status === 'expired' || status === 'canceled') {
      // Handle failed or cancelled payments
      await cryptoPaymentService.handleFailedPayment(transaction.id, status);
      
      console.log(`Payment ${order_id} marked as ${status}`);
    }

    // Always return 200 OK to acknowledge webhook receipt
    return res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing CoinGate webhook:', error);
    
    // It's important to still return a 200 status to prevent CoinGate from retrying
    // We'll log the error on our side for investigation
    return res.status(200).send('Error logged');
  }
});

export default cryptoWebhookRouter;