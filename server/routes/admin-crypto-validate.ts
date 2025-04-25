import express, { Request, Response } from 'express';
import { ensureAdmin } from '../auth-jwt';
import fs from 'fs';
import path from 'path';
import { CryptoPaymentService } from '../services/crypto-payment-service';

export const adminCryptoValidateRouter = express.Router();

// Helper functions to check components
const checkFileExists = (filePath: string): boolean => {
  try {
    return fs.existsSync(path.join(process.cwd(), filePath));
  } catch (error) {
    console.error('Error checking file:', filePath, error);
    return false;
  }
};

const checkFileContains = (filePath: string, keywords: string[] = []): boolean => {
  try {
    if (!fs.existsSync(path.join(process.cwd(), filePath))) return false;
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
    return keywords.every(kw => content.includes(kw));
  } catch (error) {
    console.error('Error checking file contents:', filePath, error);
    return false;
  }
};

adminCryptoValidateRouter.get('/validate', ensureAdmin, async (req: Request, res: Response) => {
  try {
    // Start by checking API configuration
    const apiKeyConfigured = !!process.env.COINGATE_API_KEY;
    const webhookSecretConfigured = !!process.env.COINGATE_WEBHOOK_SECRET;
    
    // Test API connection
    let apiConnectionValid = false;
    try {
      if (apiKeyConfigured) {
        // Create a new instance of the service
        const cryptoPaymentService = new CryptoPaymentService();
        // Test the connection
        const testConnection = await cryptoPaymentService.testConnection();
        apiConnectionValid = testConnection.success;
      }
    } catch (error) {
      console.error('Error testing API connection:', error);
    }
    
    // Build validation results
    const validationResults = {
      sections: [
        {
          title: 'API Configuration',
          icon: 'CodeIcon',
          items: [
            { 
              name: 'CoinGate API Key', 
              status: apiKeyConfigured ? 'success' : 'error',
              details: apiKeyConfigured ? 'API key is configured' : 'API key is missing' 
            },
            { 
              name: 'API Environment', 
              status: 'success',
              details: process.env.NODE_ENV === 'production' ? 'Production' : 'Development/Sandbox' 
            },
            { 
              name: 'API Connection', 
              status: apiKeyConfigured ? (apiConnectionValid ? 'success' : 'error') : 'pending',
              details: apiKeyConfigured ? 
                (apiConnectionValid ? 'Connection successful' : 'Could not connect to API') : 
                'Not tested (API key not configured)'
            },
          ]
        },
        {
          title: 'Webhook Security',
          icon: 'SecurityIcon',
          items: [
            { 
              name: 'Webhook Secret', 
              status: webhookSecretConfigured ? 'success' : 'error',
              details: webhookSecretConfigured ? 'Webhook secret is configured' : 'Webhook secret is missing' 
            },
            { 
              name: 'Signature Verification', 
              status: checkFileExists('server/middleware/webhookSignatureVerifier.ts') ? 'success' : 'error',
              details: checkFileExists('server/middleware/webhookSignatureVerifier.ts') ? 
                'Verification middleware exists' : 'Verification middleware missing'
            },
            { 
              name: 'Raw Body Parser', 
              status: checkFileExists('server/middleware/rawBodyParser.ts') ? 'success' : 'error',
              details: checkFileExists('server/middleware/rawBodyParser.ts') ? 
                'Raw body parser exists' : 'Raw body parser missing'
            },
          ]
        },
        {
          title: 'Database Models',
          icon: 'StorageIcon',
          items: [
            { 
              name: 'Transaction Schema', 
              status: checkFileExists('server/models/Transaction.js') ? 
                (checkFileContains('server/models/Transaction.js', ['txHash', 'walletAddress']) ? 'success' : 'error') : 
                'error',
              details: !checkFileExists('server/models/Transaction.js') ? 
                'Transaction model missing' : 
                (checkFileContains('server/models/Transaction.js', ['txHash', 'walletAddress']) ? 
                  'Transaction model has crypto fields' : 'Transaction model missing crypto fields')
            },
            { 
              name: 'Wallet Schema', 
              status: checkFileExists('server/models/Wallet.js') ? 'success' : 'error',
              details: checkFileExists('server/models/Wallet.js') ? 
                'Wallet model exists' : 'Wallet model missing' 
            },
          ]
        },
        {
          title: 'Endpoints',
          icon: 'WebhookIcon',
          items: [
            { 
              name: 'Payment Creation', 
              status: checkFileExists('server/routes/crypto-investments.ts') ? 'success' : 'error',
              details: checkFileExists('server/routes/crypto-investments.ts') ? 
                'Payment creation route exists' : 'Payment creation route missing'
            },
            { 
              name: 'Webhook Receiver', 
              status: checkFileExists('server/routes/crypto-webhooks.ts') ? 'success' : 'error',
              details: checkFileExists('server/routes/crypto-webhooks.ts') ? 
                'Webhook route exists' : 'Webhook route missing'
            },
            { 
              name: 'Admin Routes', 
              status: checkFileExists('server/routes/admin-crypto-routes.ts') ? 'success' : 'error',
              details: checkFileExists('server/routes/admin-crypto-routes.ts') ? 
                'Admin routes exist' : 'Admin routes missing'
            },
          ]
        },
      ]
    };
    
    return res.status(200).json(validationResults);
  } catch (error: any) {
    console.error('Validation error:', error);
    return res.status(500).json({ 
      error: 'Error running validation checks',
      message: error.message
    });
  }
});