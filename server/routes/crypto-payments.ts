import { Router, Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { cryptoPaymentService } from '../services/crypto-payment-service';
import { z } from 'zod';

const cryptoPaymentRouter = Router();

// Schema for creating a payment
const createPaymentSchema = z.object({
  propertyId: z.number(),
  amount: z.string(), // Amount in USD
  currency: z.string(), // Cryptocurrency code
  units: z.number() // Number of investment units
});

// Schema for processing a payment
const processPaymentSchema = z.object({
  txHash: z.string() // Transaction hash
});

/**
 * Route to get supported cryptocurrencies
 */
cryptoPaymentRouter.get('/supported-currencies', (req: Request, res: Response) => {
  try {
    const supportedCurrencies = cryptoPaymentService.SUPPORTED_CRYPTOCURRENCIES.map(code => {
      return {
        code,
        name: getFullCurrencyName(code),
        network: cryptoPaymentService.CRYPTO_NETWORKS[code as keyof typeof cryptoPaymentService.CRYPTO_NETWORKS]
      };
    });
    
    res.json(supportedCurrencies);
  } catch (error) {
    console.error('Error fetching supported currencies:', error);
    res.status(500).json({ error: 'Failed to get supported currencies' });
  }
});

/**
 * Route to create a new crypto payment for property investment
 */
cryptoPaymentRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = createPaymentSchema.parse(req.body);
    
    // Get user ID from authentication
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Create the payment
    const payment = await cryptoPaymentService.createPayment({
      userId: userId.toString(),
      propertyId: validatedData.propertyId,
      amount: validatedData.amount,
      currency: validatedData.currency,
      units: validatedData.units
    });
    
    res.status(201).json(payment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      console.error('Error creating crypto payment:', error);
      res.status(500).json({ error: 'Failed to create payment' });
    }
  }
});

/**
 * Route to get the status of a payment
 */
cryptoPaymentRouter.get('/:paymentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.paymentId;
    
    // Get payment status
    const status = await cryptoPaymentService.getPaymentStatus(paymentId);
    
    res.json(status);
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

/**
 * Route to process a payment with transaction hash
 */
cryptoPaymentRouter.post('/:paymentId/process', authMiddleware, async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.paymentId;
    
    // Validate request body
    const validatedData = processPaymentSchema.parse(req.body);
    
    // Process the payment
    const result = await cryptoPaymentService.processPayment(paymentId, validatedData.txHash);
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      console.error('Error processing payment:', error);
      res.status(500).json({ error: 'Failed to process payment' });
    }
  }
});

/**
 * Get the full name for a cryptocurrency code
 */
function getFullCurrencyName(code: string): string {
  const names: Record<string, string> = {
    'ETH': 'Ethereum',
    'USDT': 'Tether USD',
    'USDC': 'USD Coin',
    'BTC': 'Bitcoin'
  };
  
  return names[code] || code;
}

export default cryptoPaymentRouter;