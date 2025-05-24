import express, { Request, Response } from 'express';
import { ensureAdmin } from '../auth-jwt';
import { CryptoPaymentService } from '../services/crypto-payment-service';
import { z } from 'zod';
import { cryptoRefundRequestSchema } from '@shared/crypto-schema';
import nodemailer from 'nodemailer';

// Initialize services using singleton
const cryptoPaymentService = CryptoPaymentService.getInstance();

// Create router
export const adminCryptoRouter = express.Router();

// Get all crypto transactions for admin
adminCryptoRouter.get('/transactions', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const transactions = await cryptoPaymentService.getAllTransactions();
    
    // Transform the data to the expected format
    const formattedTransactions = transactions.map(tx => ({
      _id: tx.id,
      txnId: tx.orderId || tx.id,
      amount: Number(tx.amount),
      currency: tx.currency,
      status: tx.status,
      createdAt: tx.createdAt,
      investorName: tx.user?.username || `User ${tx.userId}`,
      propertyName: tx.property?.name,
      propertyId: tx.propertyId,
      network: tx.network,
      walletAddress: tx.walletAddress,
      txHash: tx.txHash
    }));
    
    res.json({
      success: true,
      transactions: formattedTransactions
    });
  } catch (error) {
    console.error('Error getting all crypto transactions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get all transactions' 
    });
  }
});

// Get crypto investments for a specific property
adminCryptoRouter.get('/properties/:propertyId/crypto-investments', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    if (isNaN(propertyId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid property ID' 
      });
    }
    
    const investments = await cryptoPaymentService.getPropertyCryptoInvestments(propertyId);
    
    res.json({
      success: true,
      data: investments
    });
  } catch (error) {
    console.error('Error getting property crypto investments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get property crypto investments' 
    });
  }
});

// Get crypto investments across all properties
adminCryptoRouter.get('/properties/crypto-investments', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const investments = await cryptoPaymentService.getAllPropertiesCryptoInvestments();
    
    res.json({
      success: true,
      data: investments
    });
  } catch (error) {
    console.error('Error getting all properties crypto investments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get all properties crypto investments' 
    });
  }
});

// Get system wallet balances
adminCryptoRouter.get('/balances', ensureAdmin, async (req: Request, res: Response) => {
  try {
    // In a real implementation, this would fetch actual balances from blockchain
    // or payment provider APIs. For demo purposes, we'll return mock data.
    const balances = [
      { currency: 'USDC', balance: 15000.0, pendingBalance: 2500.0 },
      { currency: 'USDT', balance: 12500.0, pendingBalance: 1000.0 },
      { currency: 'ETH', balance: 7.5, pendingBalance: 0.25 },
      { currency: 'BTC', balance: 0.35, pendingBalance: 0.05 }
    ];
    
    res.json({
      success: true,
      balances
    });
  } catch (error) {
    console.error('Error getting crypto wallet balances:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get wallet balances' 
    });
  }
});

// Process a refund for a transaction
adminCryptoRouter.post('/refund', ensureAdmin, async (req: Request, res: Response) => {
  try {
    // Validate refund request data
    const validatedData = cryptoRefundRequestSchema.parse(req.body);
    
    // Process refund
    const transaction = await cryptoPaymentService.requestRefund(validatedData);
    
    // If refund was successful, send notification
    if (transaction) {
      // In a production environment, this would use a configured email service
      // For demonstration, we'll just log the email
      console.log(`
        ADMIN NOTIFICATION: Transaction Refunded
        Transaction ID: ${transaction.id}
        Amount: ${transaction.amount} ${transaction.currency}
        User ID: ${transaction.userId}
        Reason: ${validatedData.reason || 'Not specified'}
      `);
      
      // If email credentials are provided, send an actual email
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: 'admin@ireva.com', // This would be configurable in a real app
          subject: `IREVA: Transaction Refund - ${transaction.id}`,
          html: `
            <h1>Transaction Refund Processed</h1>
            <p><strong>Transaction ID:</strong> ${transaction.id}</p>
            <p><strong>Amount:</strong> ${transaction.amount} ${transaction.currency}</p>
            <p><strong>User ID:</strong> ${transaction.userId}</p>
            <p><strong>Property ID:</strong> ${transaction.propertyId}</p>
            <p><strong>Reason:</strong> ${validatedData.reason || 'Not specified'}</p>
            <p><strong>Processed by:</strong> ${req.jwtPayload?.username || 'Unknown'}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          `
        });
      }
    }
    
    res.json({
      success: true,
      transaction,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid refund data', 
        errors: error.errors 
      });
    }
    res.status(500).json({ 
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process refund'
    });
  }
});

// Get transaction alerts (high value or failed)
adminCryptoRouter.get('/alerts', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const transactions = await cryptoPaymentService.getAllTransactions();
    
    // Filter for high-value transactions (>1000 in any currency)
    const highValueTransactions = transactions.filter(tx => 
      tx.amount > 1000 || 
      (tx.currency === 'ETH' && tx.amount > 0.5) || 
      (tx.currency === 'BTC' && tx.amount > 0.02)
    );
    
    // Filter for failed transactions in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentFailedTransactions = transactions.filter(tx => 
      (tx.status === 'failed' || tx.status === 'expired') &&
      new Date(tx.createdAt) > oneDayAgo
    );
    
    res.json({
      success: true,
      alerts: {
        highValue: highValueTransactions,
        failed: recentFailedTransactions
      }
    });
  } catch (error) {
    console.error('Error getting transaction alerts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get transaction alerts' 
    });
  }
});

// Export transaction data as CSV (simple endpoint that returns raw data)
adminCryptoRouter.get('/export', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const transactions = await cryptoPaymentService.getAllTransactions();
    
    // Format: determine based on query param
    const format = req.query.format as string || 'json';
    
    if (format === 'csv') {
      // Prepare CSV headers
      const headers = [
        'ID', 'User ID', 'Property ID', 'Amount', 'Currency',
        'Status', 'Network', 'Wallet Address', 'TX Hash', 
        'Created At', 'Updated At', 'Expires At'
      ].join(',');
      
      // Prepare CSV rows
      const rows = transactions.map(tx => [
        tx.id,
        tx.userId,
        tx.propertyId,
        tx.amount,
        tx.currency,
        tx.status,
        tx.network,
        tx.walletAddress,
        tx.txHash || '',
        tx.createdAt.toISOString(),
        tx.updatedAt.toISOString(),
        tx.expiresAt.toISOString()
      ].join(','));
      
      // Combine headers and rows
      const csv = [headers, ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=crypto-transactions-${new Date().toISOString().split('T')[0]}.csv`);
      return res.send(csv);
    }
    
    // Default to JSON format
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to export transactions' 
    });
  }
});

export default adminCryptoRouter;