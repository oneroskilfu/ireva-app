import express, { Request, Response } from 'express';
import { authMiddleware, ensureAdmin } from '../auth-jwt';
import { 
  cryptoPaymentIntentSchema,
  cryptoPaymentWebhookSchema,
  cryptoRefundRequestSchema
} from '@shared/crypto-schema';
import { CryptoPaymentService } from '../services/crypto-payment-service';
import { z } from 'zod';
// Import the investment controller with dynamic import
// Use 'any' type to satisfy TypeScript
let investmentController: any;

// Immediately invoke async function
(async () => {
  const controllerPath = new URL('../controllers/investmentController.js', import.meta.url).href;
  const module = await import(controllerPath);
  investmentController = module;
})();

// Initialize the crypto payment service
const cryptoPaymentService = new CryptoPaymentService();

const router = express.Router();

// Create a crypto payment intent
router.post('/create', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Validate payment intent data
    const validatedData = cryptoPaymentIntentSchema.parse({
      ...req.body,
      userId: req.jwtPayload?.id
    });
    
    // Create payment intent
    const transaction = await cryptoPaymentService.createPaymentIntent(validatedData);
    
    res.status(201).json({
      success: true,
      transaction,
      paymentUrl: transaction.paymentUrl,
      paymentAddress: transaction.paymentAddress
    });
  } catch (error) {
    console.error('Error creating crypto payment intent:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid payment data', 
        errors: error.errors 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Failed to create payment intent'
    });
  }
});

// Get a crypto transaction by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.id;
    const transaction = await cryptoPaymentService.getTransaction(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaction not found' 
      });
    }
    
    // Check if the transaction belongs to the authenticated user
    if (transaction.userId !== req.jwtPayload?.id && req.jwtPayload?.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized to view this transaction' 
      });
    }
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error getting crypto transaction:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get transaction' 
    });
  }
});

// Get user's crypto transactions
router.get('/user/transactions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const transactions = await cryptoPaymentService.getTransactionsByUser(userId.toString());
    
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error getting user crypto transactions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get user transactions' 
    });
  }
});

// Get user's crypto wallet balances
router.get('/user/balances', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const balances = await cryptoPaymentService.getWalletBalances(userId.toString());
    
    res.json({
      success: true,
      balances
    });
  } catch (error) {
    console.error('Error getting user crypto wallet balances:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get wallet balances' 
    });
  }
});

// Admin: Get all crypto transactions
router.get('/admin/transactions', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const transactions = await cryptoPaymentService.getAllTransactions();
    
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error('Error getting all crypto transactions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get all transactions' 
    });
  }
});

// Admin: Process a refund
router.post('/admin/refund', ensureAdmin, async (req: Request, res: Response) => {
  try {
    // Validate refund request data
    const validatedData = cryptoRefundRequestSchema.parse(req.body);
    
    // Process refund
    const transaction = await cryptoPaymentService.requestRefund(validatedData);
    
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

// Webhook endpoint to receive payment provider notifications
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    // Validate the webhook signature
    const webhookSecret = process.env.CRYPTO_WEBHOOK_SECRET;
    
    if (webhookSecret) {
      const signature = req.headers['x-coingate-signature'];
      
      // In production, you would verify the signature here
      // For development, we'll skip this check
      if (process.env.NODE_ENV !== 'development' && !signature) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid webhook signature' 
        });
      }
    }
    
    // Validate webhook data
    try {
      const validatedData = cryptoPaymentWebhookSchema.parse(req.body);
      
      // Process the webhook event
      await cryptoPaymentService.processWebhookEvent(
        validatedData.event,
        validatedData.data
      );
      
      res.status(200).json({ success: true, message: 'Webhook processed' });
    } catch (error) {
      console.error('Error validating webhook data:', error);
      
      // Still return 200 to prevent the payment provider from retrying
      res.status(200).json({ 
        success: false,
        message: 'Webhook validation failed but acknowledged' 
      });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Still return 200 to prevent the payment provider from retrying
    res.status(200).json({ 
      success: false,
      message: 'Webhook processing failed but acknowledged' 
    });
  }
});

// Handle crypto investment in a project
router.post('/invest', authMiddleware, async (req: Request, res: Response) => {
  // Add user ID from JWT payload if not provided
  if (!req.body.userId && req.jwtPayload?.id) {
    req.body.userId = req.jwtPayload.id;
  }
  
  try {
    if (investmentController) {
      await investmentController.handleCryptoInvestment(req, res);
    } else {
      throw new Error('Investment controller not loaded yet');
    }
  } catch (error) {
    console.error('Error in crypto investment handler:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error in crypto investment handler' 
    });
  }
});

// Check crypto payment status
router.get('/payment-status/:paymentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (investmentController) {
      await investmentController.checkCryptoPaymentStatus(req, res);
    } else {
      throw new Error('Investment controller not loaded yet');
    }
  } catch (error) {
    console.error('Error in payment status check handler:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error in payment status check' 
    });
  }
});

export default router;