import express, { Request, Response } from 'express';
import { authMiddleware, ensureAdmin } from '../auth-jwt';
import { CryptoPaymentService } from '../services/crypto-payment-service';

// Initialize services using singleton
const cryptoPaymentService = CryptoPaymentService.getInstance();

// Create router
export const cryptoIntegrationRouter = express.Router();

/**
 * Get integration status
 * Returns the current status of the crypto integration 
 * including API connectivity and configuration status
 */
cryptoIntegrationRouter.get('/status', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.COINGATE_API_KEY;
    const webhookSecret = process.env.COINGATE_WEBHOOK_SECRET;
    
    const status = {
      isConfigured: !!(apiKey && webhookSecret),
      apiKeyPresent: !!apiKey,
      webhookSecretPresent: !!webhookSecret,
      testMode: process.env.NODE_ENV !== 'production',
      supportedCurrencies: [
        { code: 'BTC', name: 'Bitcoin', isEnabled: true },
        { code: 'ETH', name: 'Ethereum', isEnabled: true },
        { code: 'USDT', name: 'Tether', isEnabled: true },
        { code: 'USDC', name: 'USD Coin', isEnabled: true },
        { code: 'XRP', name: 'Ripple', isEnabled: true },
        { code: 'BNB', name: 'Binance Coin', isEnabled: true },
        { code: 'DOGE', name: 'Dogecoin', isEnabled: true },
        { code: 'SOL', name: 'Solana', isEnabled: true },
        { code: 'MATIC', name: 'Polygon', isEnabled: true }
      ]
    };
    
    res.json(status);
  } catch (error) {
    console.error('Error checking crypto integration status:', error);
    res.status(500).json({ error: 'Failed to check integration status' });
  }
});

/**
 * Test connection to CoinGate API
 * Attempts to make a test API call to verify connectivity
 */
cryptoIntegrationRouter.post('/test', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const testResult = await cryptoPaymentService.testConnection();
    res.json(testResult);
  } catch (error) {
    console.error('Error testing CoinGate connection:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to connect to CoinGate API', 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get environment variables
 * Returns information about the current environment setup
 */
cryptoIntegrationRouter.get('/environment', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const environment = {
      nodeEnv: process.env.NODE_ENV || 'development',
      apiEndpoint: process.env.NODE_ENV === 'production' 
        ? 'https://api.coingate.com/v2' 
        : 'https://api-sandbox.coingate.com/v2',
      webhookEndpoint: `${req.protocol}://${req.get('host')}/api/crypto/webhooks/coingate-webhook`,
      apiKeyConfigured: !!process.env.COINGATE_API_KEY,
      webhookSecretConfigured: !!process.env.COINGATE_WEBHOOK_SECRET
    };
    
    res.json(environment);
  } catch (error) {
    console.error('Error fetching environment info:', error);
    res.status(500).json({ error: 'Failed to fetch environment information' });
  }
});

/**
 * Get webhook configuration
 * Returns information about webhook configuration
 */
cryptoIntegrationRouter.get('/webhooks', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const webhookInfo = {
      url: `${req.protocol}://${req.get('host')}/api/crypto/webhooks/coingate-webhook`,
      events: ['payment_confirmed', 'payment_received', 'payment_failed', 'payment_expired'],
      isConfigured: !!process.env.COINGATE_WEBHOOK_SECRET,
      security: 'HMAC-SHA256 signature verification'
    };
    
    res.json(webhookInfo);
  } catch (error) {
    console.error('Error fetching webhook info:', error);
    res.status(500).json({ error: 'Failed to fetch webhook information' });
  }
});

/**
 * Get UI configuration
 * Returns frontend configuration details
 */
cryptoIntegrationRouter.get('/ui', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const uiConfig = {
      showCryptoOptions: true,
      defaultCurrency: 'USDT',
      minInvestmentAmounts: {
        BTC: 0.001,
        ETH: 0.01,
        USDT: 100,
        USDC: 100
      },
      exchangeRateRefreshInterval: 60000, // 1 minute
      qrCodeEnabled: true
    };
    
    res.json(uiConfig);
  } catch (error) {
    console.error('Error fetching UI config:', error);
    res.status(500).json({ error: 'Failed to fetch UI configuration' });
  }
});

export default cryptoIntegrationRouter;