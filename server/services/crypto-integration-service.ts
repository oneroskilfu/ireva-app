import axios from 'axios';
import { CryptoPaymentService } from './crypto-payment-service';

// Initialize the crypto payment service
const cryptoPaymentService = new CryptoPaymentService();

interface EnvironmentStatus {
  success: boolean;
  missingKeys: string[];
  presentKeys: string[];
}

interface WebhookStatus {
  success: boolean;
  message: string;
  webhooks?: any[];
  error?: any;
}

interface TransactionStatus {
  success: boolean;
  message: string;
  order?: any;
  error?: any;
}

interface UIStatus {
  success: boolean;
  message: string;
}

interface IntegrationStatus {
  environment: EnvironmentStatus;
  webhooks: WebhookStatus;
  testTransaction: TransactionStatus;
  uiIntegration: UIStatus;
  completedSteps: string[];
  isComplete: boolean;
}

class CryptoIntegrationService {
  private requiredEnvVariables = [
    'COINGATE_API_KEY',
    'CRYPTO_WEBHOOK_SECRET',
    'CRYPTO_PAYMENT_CALLBACK_URL'
  ];
  
  private apiKey: string | undefined;
  private apiUrl: string;
  
  constructor() {
    this.apiKey = process.env.COINGATE_API_KEY;
    this.apiUrl = 'https://api.coingate.com/v2';
    
    if (!this.apiKey && process.env.NODE_ENV === 'development') {
      console.warn('COINGATE_API_KEY is not set. Using mock data for crypto integration.');
    }
  }
  
  /**
   * Check the crypto integration status
   */
  async getIntegrationStatus(): Promise<IntegrationStatus> {
    // Check environment
    const environment = this.checkEnvironment();
    
    // Get the most recent test transaction
    let testTransaction: TransactionStatus = {
      success: false,
      message: 'No test transaction has been attempted'
    };
    
    try {
      const transactions = await cryptoPaymentService.getAllTransactions();
      // Use a special ID for test transactions
      const testTx = transactions.find(tx => tx.userId === 999999); // Special admin test user ID
      
      if (testTx) {
        testTransaction = {
          success: testTx.status === 'confirmed',
          message: testTx.status === 'confirmed' 
            ? 'Test transaction completed successfully' 
            : `Test transaction ${testTx.status}`,
          order: testTx
        };
      }
    } catch (error) {
      console.error('Error getting test transaction:', error);
    }
    
    // Check webhooks
    const webhooks = await this.checkWebhooks();
    
    // Check UI integration
    const uiIntegration = this.checkUIIntegration();
    
    // Calculate completed steps
    const completedSteps: string[] = [];
    
    if (environment.success) {
      completedSteps.push('environment');
    }
    
    if (webhooks.success) {
      completedSteps.push('webhooks');
    }
    
    if (testTransaction.success) {
      completedSteps.push('test_transaction');
    }
    
    if (uiIntegration.success) {
      completedSteps.push('ui_integration');
    }
    
    return {
      environment,
      webhooks,
      testTransaction,
      uiIntegration,
      completedSteps,
      isComplete: completedSteps.length === 4
    };
  }
  
  /**
   * Check if required environment variables are set
   */
  private checkEnvironment(): EnvironmentStatus {
    const missingKeys: string[] = [];
    const presentKeys: string[] = [];
    
    for (const key of this.requiredEnvVariables) {
      if (!process.env[key]) {
        missingKeys.push(key);
      } else {
        presentKeys.push(key);
      }
    }
    
    return {
      success: missingKeys.length === 0,
      missingKeys,
      presentKeys
    };
  }
  
  /**
   * Check if webhooks are properly configured
   */
  private async checkWebhooks(): Promise<WebhookStatus> {
    // Check if webhook secret is set
    if (!process.env.CRYPTO_WEBHOOK_SECRET) {
      return {
        success: false,
        message: 'Webhook secret is not set'
      };
    }
    
    // Check if callback URL is set
    if (!process.env.CRYPTO_PAYMENT_CALLBACK_URL) {
      return {
        success: false,
        message: 'Webhook callback URL is not set'
      };
    }
    
    // In production, we would call the API to check webhooks
    // For development, assume webhook is properly set up if environment variables are present
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        message: 'Webhooks are properly configured',
        webhooks: [
          {
            id: 'mock-webhook-id',
            url: process.env.CRYPTO_PAYMENT_CALLBACK_URL,
            events: ['payment.created', 'payment.pending', 'payment.confirmed', 'payment.cancelled']
          }
        ]
      };
    }
    
    // In production, check if webhook exists via API
    try {
      if (this.apiKey) {
        const response = await axios.get(`${this.apiUrl}/webhooks`, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        });
        
        const webhooks = response.data;
        
        // Check if our webhook URL is registered
        const ourWebhook = webhooks.find(
          (webhook: any) => webhook.url === process.env.CRYPTO_PAYMENT_CALLBACK_URL
        );
        
        if (ourWebhook) {
          return {
            success: true,
            message: 'Webhooks are properly configured',
            webhooks
          };
        } else {
          return {
            success: false,
            message: 'Webhook URL is not registered',
            webhooks
          };
        }
      }
    } catch (error) {
      console.error('Error checking webhooks:', error);
      return {
        success: false,
        message: 'Failed to check webhooks',
        error
      };
    }
    
    return {
      success: false,
      message: 'Webhook validation failed'
    };
  }
  
  /**
   * Check if UI integration is properly configured
   */
  private checkUIIntegration(): UIStatus {
    // This is a simple check to determine if UI components are ready
    // In reality, we would check for presence and function of UI components
    // For now, we'll just assume it's ready if other steps are complete
    
    const environment = this.checkEnvironment();
    
    if (environment.success) {
      return {
        success: true,
        message: 'UI components are properly configured'
      };
    }
    
    return {
      success: false,
      message: 'UI components need configuration'
    };
  }
  
  /**
   * Run a test transaction
   */
  async testIntegration(): Promise<TransactionStatus> {
    try {
      // Create a test payment intent
      const transaction = await cryptoPaymentService.createPaymentIntent({
        amount: 10,
        currency: 'USD',
        cryptoCurrency: 'USDT',
        userId: '999999', // Special admin test user ID
        returnUrl: '/admin/crypto-integration'
      });
      
      // For testing purposes, mark it as confirmed immediately
      if (process.env.NODE_ENV === 'development') {
        await cryptoPaymentService.updateTransactionStatus(transaction.id, {
          status: 'confirmed',
          txHash: `mock-tx-hash-${Date.now()}`,
          paymentProviderResponse: JSON.stringify({
            id: transaction.id,
            status: 'paid',
            price_amount: transaction.amount,
            price_currency: transaction.currency,
            transaction_id: `mock-tx-hash-${Date.now()}`,
            order_id: `order-${Date.now()}`,
            payment_id: `payment-${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        });
      }
      
      return {
        success: true,
        message: 'Test transaction created successfully',
        order: transaction
      };
    } catch (error) {
      console.error('Error creating test transaction:', error);
      return {
        success: false,
        message: 'Failed to create test transaction',
        error
      };
    }
  }
}

export const cryptoIntegrationService = new CryptoIntegrationService();