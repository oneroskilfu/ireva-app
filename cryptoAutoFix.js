import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
}

function createIfMissing(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created file: ${filePath}`);
  } else {
    console.log(`✔ File exists: ${filePath}`);
  }
}

function updateIfNeeded(filePath, searchPattern, replacementContent) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found for updating: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes(searchPattern)) {
    const newContent = content + replacementContent;
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Updated file: ${filePath}`);
  } else {
    console.log(`✔ Content already exists in: ${filePath}`);
  }
}

console.log('\n=== iREVA Crypto Integration Auto-Fix ===\n');

// 1. Fix webhook handler in the crypto-webhooks.ts file
ensureDir('server/routes');
createIfMissing('server/routes/crypto-webhooks.ts', `import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { CryptoPaymentService } from '../services/crypto-payment-service';
import { validateWebhookSignature } from '../middleware/webhookSignatureVerifier';
import { rawBodyParser } from '../middleware/rawBodyParser';

export const cryptoWebhooksRouter = express.Router();
const cryptoPaymentService = new CryptoPaymentService();

// Apply raw body parser middleware to preserve original request body for signature verification
cryptoWebhooksRouter.use(rawBodyParser);

// Webhook endpoint to receive payment notifications from Coingate
cryptoWebhooksRouter.post('/webhook', validateWebhookSignature, async (req: Request, res: Response) => {
  try {
    console.log('Webhook received:', req.body);
    
    const { event, data } = req.body;
    
    if (!event || !data) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }
    
    // Process the webhook event
    const success = await cryptoPaymentService.processWebhookEvent(event, data);
    
    if (success) {
      return res.status(200).json({ message: 'Webhook processed successfully' });
    } else {
      return res.status(422).json({ error: 'Unable to process webhook' });
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error processing webhook' });
  }
});

// Development endpoint for testing webhooks
cryptoWebhooksRouter.post('/webhook/simulate', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: 'This endpoint is only available in development mode' });
    }
    
    const { paymentId, status } = req.body;
    
    if (!paymentId || !status) {
      return res.status(400).json({ error: 'paymentId and status are required' });
    }
    
    // Simulate a payment update
    const success = await cryptoPaymentService.updatePaymentStatus(paymentId, status);
    
    if (success) {
      return res.status(200).json({ 
        message: 'Payment status updated successfully',
        paymentId,
        status
      });
    } else {
      return res.status(404).json({ error: 'Payment not found' });
    }
  } catch (error) {
    console.error('Webhook simulation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
`);

// 2. Create or update wallet service with crypto balance updates
ensureDir('server/services');
createIfMissing('server/services/wallet-service.ts', `import { v4 as uuidv4 } from 'uuid';

interface WalletBalance {
  userId: number;
  currency: string;
  balance: number;
  pendingBalance: number;
  updatedAt: Date;
}

// In-memory store for wallet balances
const walletBalances = new Map<string, WalletBalance>();

export class WalletService {
  constructor() {
    console.log('WalletService initialized');
    
    // Create some sample balances for demo
    if (process.env.NODE_ENV === 'development' && walletBalances.size === 0) {
      this.createSampleBalances();
    }
  }
  
  private createSampleBalances() {
    // Add sample balances for a few users
    for (let userId = 1; userId <= 5; userId++) {
      this.createBalance(userId, 'USDC', 1000, 0);
      this.createBalance(userId, 'USDT', 500, 0);
      this.createBalance(userId, 'ETH', 0.5, 0);
      this.createBalance(userId, 'NGN', 500000, 0); // Nigerian Naira for fiat
    }
  }
  
  private createBalance(userId: number, currency: string, balance: number, pendingBalance: number) {
    const key = \`\${userId}-\${currency}\`;
    walletBalances.set(key, {
      userId,
      currency,
      balance,
      pendingBalance,
      updatedAt: new Date()
    });
  }
  
  // Get user balance for a specific currency
  async getBalance(userId: number, currency: string): Promise<WalletBalance | null> {
    const key = \`\${userId}-\${currency}\`;
    return walletBalances.get(key) || null;
  }
  
  // Get all balances for a user
  async getUserBalances(userId: number): Promise<WalletBalance[]> {
    const balances: WalletBalance[] = [];
    
    for (const [key, balance] of walletBalances.entries()) {
      if (key.startsWith(\`\${userId}-\`)) {
        balances.push(balance);
      }
    }
    
    return balances;
  }
  
  // Update user balance
  async updateBalance(userId: number, currency: string, amount: number, isPending: boolean = false): Promise<WalletBalance> {
    const key = \`\${userId}-\${currency}\`;
    const currentBalance = walletBalances.get(key) || {
      userId,
      currency,
      balance: 0,
      pendingBalance: 0,
      updatedAt: new Date()
    };
    
    if (isPending) {
      currentBalance.pendingBalance += amount;
    } else {
      currentBalance.balance += amount;
    }
    
    currentBalance.updatedAt = new Date();
    walletBalances.set(key, currentBalance);
    
    return currentBalance;
  }
  
  // Clear pending balance and move to available balance
  async confirmPendingBalance(userId: number, currency: string): Promise<WalletBalance | null> {
    const key = \`\${userId}-\${currency}\`;
    const currentBalance = walletBalances.get(key);
    
    if (!currentBalance) {
      return null;
    }
    
    // Move pending balance to available balance
    currentBalance.balance += currentBalance.pendingBalance;
    currentBalance.pendingBalance = 0;
    currentBalance.updatedAt = new Date();
    
    walletBalances.set(key, currentBalance);
    return currentBalance;
  }
  
  // Update crypto balance when a transaction is confirmed
  async updateCryptoBalance(userId: number, currency: string, amount: number): Promise<WalletBalance> {
    console.log(\`Updating crypto balance for user \${userId}: \${amount} \${currency}\`);
    return this.updateBalance(userId, currency, amount);
  }
  
  // Process confirmed transaction and update user's wallet
  async processConfirmedTransaction(userId: number, currency: string, amount: number): Promise<boolean> {
    try {
      await this.updateCryptoBalance(userId, currency, amount);
      console.log(\`Successfully processed confirmed transaction for user \${userId}: \${amount} \${currency}\`);
      return true;
    } catch (error) {
      console.error('Error processing confirmed transaction:', error);
      return false;
    }
  }
}

export const walletService = new WalletService();
`);

// 3. Create or update admin dashboard routes
createIfMissing('server/routes/admin-crypto-routes.ts', `import express, { Request, Response } from 'express';
import { ensureAdmin } from '../auth-jwt';
import { CryptoPaymentService } from '../services/crypto-payment-service';
import { WalletService } from '../services/wallet-service';

export const adminCryptoRouter = express.Router();

const cryptoPaymentService = new CryptoPaymentService();
const walletService = new WalletService();

// Get all crypto transactions
adminCryptoRouter.get('/transactions', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const transactions = await cryptoPaymentService.getAllTransactions();
    
    return res.status(200).json({
      transactions,
      count: transactions.length
    });
  } catch (error: any) {
    console.error('Error fetching crypto transactions:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch crypto transactions',
      message: error.message
    });
  }
});

// Get transaction details by ID
adminCryptoRouter.get('/transactions/:id', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const transaction = await cryptoPaymentService.getTransaction(id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    return res.status(200).json(transaction);
  } catch (error: any) {
    console.error('Error fetching transaction details:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch transaction details',
      message: error.message
    });
  }
});

// Update transaction status
adminCryptoRouter.patch('/transactions/:id/status', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const transaction = await cryptoPaymentService.getTransaction(id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const success = await cryptoPaymentService.updatePaymentStatus(id, status);
    
    if (success) {
      return res.status(200).json({ 
        message: 'Transaction status updated successfully',
        transactionId: id,
        status
      });
    } else {
      return res.status(400).json({ error: 'Failed to update transaction status' });
    }
  } catch (error: any) {
    console.error('Error updating transaction status:', error);
    return res.status(500).json({ 
      error: 'Failed to update transaction status',
      message: error.message
    });
  }
});

// Get transaction stats
adminCryptoRouter.get('/stats', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const transactions = await cryptoPaymentService.getAllTransactions();
    
    // Calculate stats
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const failedTransactions = transactions.filter(t => t.status === 'failed').length;
    
    // Calculate total amount by currency
    const totalByCurrency = transactions.reduce((acc, t) => {
      if (t.status === 'completed') {
        acc[t.currency] = (acc[t.currency] || 0) + parseFloat(t.amountInCrypto);
      }
      return acc;
    }, {});
    
    return res.status(200).json({
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      totalByCurrency
    });
  } catch (error: any) {
    console.error('Error fetching crypto stats:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch crypto stats',
      message: error.message
    });
  }
});

// Get wallet balances for all users
adminCryptoRouter.get('/balances', ensureAdmin, async (req: Request, res: Response) => {
  try {
    // For a real implementation, you would aggregate balances across users
    // For this demo, we'll return mock data
    const mockBalances = [
      { currency: 'USDC', totalBalance: 5000, usersCount: 5 },
      { currency: 'USDT', totalBalance: 2500, usersCount: 5 },
      { currency: 'ETH', totalBalance: 2.5, usersCount: 5 }
    ];
    
    return res.status(200).json(mockBalances);
  } catch (error: any) {
    console.error('Error fetching wallet balances:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch wallet balances',
      message: error.message
    });
  }
});
`);

// 4. Update the main routes.ts file to include the new routes
updateIfNeeded('server/routes.ts', 
  'adminCryptoRouter', 
  `
// Import crypto-related routers
import { cryptoWebhooksRouter } from './routes/crypto-webhooks';
import { adminCryptoRouter } from './routes/admin-crypto-routes';
import { adminCryptoValidateRouter } from './routes/admin-crypto-validate';

// Add crypto webhook routes
app.use('/api/crypto', cryptoWebhooksRouter);

// Add admin crypto routes
app.use('/api/admin/crypto', adminCryptoRouter);
`);

// 5. Create environment variable example file
createIfMissing('.env.crypto.example', `# Crypto Payment Integration Environment Variables

# CoinGate API Key - Used for creating payment links and validating API calls
COINGATE_API_KEY=YOUR_COINGATE_API_KEY_HERE

# CoinGate Webhook Secret - Used to verify webhook signatures
COINGATE_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE

# Set to 'sandbox' for testing or 'production' for live transactions
COINGATE_ENVIRONMENT=sandbox

# The webhook URL that will receive payment notifications
# This should be your public-facing URL in production
WEBHOOK_URL=https://your-website.com/api/crypto/webhook
`);

console.log('\n=== Crypto Auto-Fix Complete ===');
console.log(`
Next steps:
1. Set the following environment variables:
   - COINGATE_API_KEY
   - COINGATE_WEBHOOK_SECRET

2. Restart the application to apply all changes

3. Visit the admin dashboard to verify crypto integration functionality:
   - Check transaction listing
   - Test webhook simulation
   - Validate integration via the validation tool

4. For production deployment, ensure webhook URL is publicly accessible and properly configured in CoinGate
`);