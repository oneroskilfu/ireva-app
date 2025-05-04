import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { CryptoPaymentService } from '../services/crypto-payment-service';
import { nanoid } from 'nanoid';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { cryptoPayments } from '@shared/schema';
import { getSocketIo } from '../socketio';

const cryptoDepositRouter = express.Router();
const cryptoPaymentService = CryptoPaymentService.getInstance();

// Create new deposit request
cryptoDepositRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, cryptoType } = req.body;
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    if (!cryptoType || !['BTC', 'ETH', 'USDT', 'USDC', 'MATIC', 'BNB'].includes(cryptoType)) {
      return res.status(400).json({ error: 'Invalid cryptocurrency type' });
    }
    
    try {
      // If CoinGate API key is available, use it to create a payment
      if (process.env.COINGATE_API_KEY) {
        const payment = await cryptoPaymentService.createPayment({
          orderId: `ORDER-${nanoid(8)}`,
          price: amount,
          currency: cryptoType,
          description: `Deposit ${amount} ${cryptoType}`,
          callbackUrl: `${process.env.APP_URL || 'http://localhost:5000'}/api/webhook/coingate-webhook`,
          successUrl: `${process.env.APP_URL || 'http://localhost:5000'}/wallet/crypto?status=success`,
          cancelUrl: `${process.env.APP_URL || 'http://localhost:5000'}/wallet/crypto?status=cancel`
        });
        
        // Save payment details to database
        const newPayment = await db.insert(cryptoPayments).values({
          id: payment.id || `txn-${nanoid(8)}`,
          userId: userId,
          amount: amount.toString(),
          currency: cryptoType,
          status: payment.status || 'new',
          orderId: payment.orderId || `ORDER-${nanoid(8)}`,
          paymentUrl: payment.paymentUrl || '#',
          walletAddress: payment.receiveAddress || null,
          network: cryptoType.toLowerCase() === 'btc' ? 'bitcoin' : 
                  cryptoType.toLowerCase() === 'eth' ? 'ethereum' :
                  cryptoType.toLowerCase() === 'matic' ? 'polygon' :
                  cryptoType.toLowerCase() === 'bnb' ? 'binance' : 'ethereum',
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
        }).returning();
        
        return res.status(201).json({
          txnId: newPayment[0].id,
          currency: cryptoType,
          amount: amount,
          status: newPayment[0].status,
          walletAddress: newPayment[0].walletAddress,
          paymentUrl: newPayment[0].paymentUrl,
          expiresAt: newPayment[0].expiresAt
        });
      } else {
        // Mock payment creation for development without API keys
        console.log('COINGATE_API_KEY is not set. Creating mock payment.');
        
        // Generate mock wallet address based on currency
        const mockWalletAddress = cryptoType.toLowerCase() === 'btc' 
          ? '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5' 
          : cryptoType.toLowerCase() === 'eth'
          ? '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
          : cryptoType.toLowerCase() === 'usdt' || cryptoType.toLowerCase() === 'usdc'
          ? '0xdAC17F958D2ee523a2206206994597C13D831ec7'
          : cryptoType.toLowerCase() === 'matic'
          ? '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0'
          : '0xB8c77482e45F1F44dE1745F52C74426C631bDD52'; // BNB
        
        // Generate QR code URL (in production, you would use a real QR code service)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${mockWalletAddress}`;
        
        const mockOrderId = `ORDER-${nanoid(8)}`;
        const mockPaymentId = `txn-${nanoid(8)}`;
        
        // Save mock payment to database
        const newPayment = await db.insert(cryptoPayments).values({
          id: mockPaymentId,
          userId: userId,
          amount: amount.toString(),
          currency: cryptoType,
          status: 'pending', // Start with pending status for simulation
          orderId: mockOrderId,
          paymentUrl: qrCodeUrl,
          walletAddress: mockWalletAddress,
          network: cryptoType.toLowerCase() === 'btc' ? 'bitcoin' : 
                  cryptoType.toLowerCase() === 'eth' ? 'ethereum' :
                  cryptoType.toLowerCase() === 'matic' ? 'polygon' :
                  cryptoType.toLowerCase() === 'bnb' ? 'binance' : 'ethereum',
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry
        }).returning();

        // Simulate transaction confirmation after delay
        setTimeout(async () => {
          try {
            // Update payment status to confirmed
            await db.update(cryptoPayments)
              .set({ 
                status: 'completed',
                updatedAt: new Date(),
                txHash: `0x${nanoid(64)}` // Generate a mock transaction hash
              })
              .where(eq(cryptoPayments.id, mockPaymentId));
            
            console.log(`Simulated payment confirmation for ${mockPaymentId}`);
            
            // Emit socket event for real-time updates
            try {
              const io = getSocketIo();
              io.emit('cryptoDepositUpdate', { 
                txnId: mockPaymentId, 
                status: 'completed',
                amount: amount,
                currency: cryptoType,
                timestamp: new Date().toISOString()
              });
              console.log('Emitted cryptoDepositUpdate event');
            } catch (socketError) {
              console.error('Error emitting socket event:', socketError);
            }
          } catch (updateError) {
            console.error('Error updating simulated payment:', updateError);
          }
        }, 15000); // 15 second delay to simulate blockchain confirmation
        
        return res.status(201).json({
          txnId: newPayment[0].id,
          currency: cryptoType,
          amount: amount,
          status: 'pending',
          walletAddress: mockWalletAddress,
          paymentUrl: qrCodeUrl,
          expiresAt: newPayment[0].expiresAt
        });
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      return res.status(500).json({ 
        error: 'Failed to create payment',
        details: error.message 
      });
    }
  } catch (error: any) {
    console.error('Error in deposit endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deposit status
cryptoDepositRouter.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const payment = await db.query.cryptoPayments.findFirst({
      where: (cryptoPayments, { eq, and }) => and(
        eq(cryptoPayments.id, id),
        eq(cryptoPayments.userId, userId)
      )
    });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // In a real implementation, we would check the payment gateway for the latest status
    if (process.env.COINGATE_API_KEY) {
      try {
        const updatedPayment = await cryptoPaymentService.getPayment(id);
        
        // Update payment status in our database
        if (updatedPayment && updatedPayment.status !== payment.status) {
          await db.update(cryptoPayments)
            .set({ 
              status: updatedPayment.status,
              updatedAt: new Date()
            })
            .where(eq(cryptoPayments.id, id));
          
          payment.status = updatedPayment.status;
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        // Continue with the stored payment data
      }
    }
    
    return res.json({
      txnId: payment.id,
      currency: payment.currency,
      amount: payment.amount,
      status: payment.status,
      walletAddress: payment.walletAddress,
      paymentUrl: payment.paymentUrl,
      expiresAt: payment.expiresAt
    });
  } catch (error) {
    console.error('Error getting deposit status:', error);
    return res.status(500).json({ error: 'Failed to get deposit status' });
  }
});

export default cryptoDepositRouter;