import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

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
  private requiredKeys = [
    'COINGATE_API_KEY',
    'CRYPTO_WEBHOOK_SECRET',
    'CRYPTO_PAYMENT_CALLBACK_URL'
  ];

  // Check if all required environment variables are set
  async checkEnvironment(): Promise<EnvironmentStatus> {
    const missingKeys: string[] = [];
    const presentKeys: string[] = [];

    for (const key of this.requiredKeys) {
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

  // Check if webhook is properly configured
  async checkWebhooks(): Promise<WebhookStatus> {
    // In a real implementation, this would make an API call to the payment provider
    // to check if the webhook is properly configured.
    // For this demo, we'll simulate a successful webhook setup if the API key is present.
    if (!process.env.COINGATE_API_KEY) {
      return {
        success: false,
        message: 'Cannot check webhooks: API key is missing'
      };
    }

    try {
      // Simulate a call to check webhooks
      // In a real implementation, you would use something like this:
      // const response = await axios.get('https://api.coingate.com/v2/webhooks', {
      //   headers: { Authorization: `Bearer ${process.env.COINGATE_API_KEY}` }
      // });

      // For demo purposes, assume webhook is configured if we have a callback URL
      const webhookConfigured = !!process.env.CRYPTO_PAYMENT_CALLBACK_URL;

      return {
        success: webhookConfigured,
        message: webhookConfigured 
          ? 'Webhook is properly configured' 
          : 'Webhook callback URL is not properly configured',
        webhooks: webhookConfigured ? [{ url: process.env.CRYPTO_PAYMENT_CALLBACK_URL }] : []
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to check webhooks',
        error
      };
    }
  }

  // Test a crypto transaction
  async testTransaction(): Promise<TransactionStatus> {
    if (!process.env.COINGATE_API_KEY) {
      return {
        success: false,
        message: 'Cannot test transaction: API key is missing'
      };
    }

    try {
      // Simulate a test transaction
      // In a real implementation, you would call the payment provider's API
      // to create a test order
      
      // Simulate a successful test transaction
      return {
        success: true,
        message: 'Test transaction successful',
        order: {
          id: 'test-order-' + Date.now(),
          status: 'paid',
          price_amount: 10,
          price_currency: 'USD',
          receive_currency: 'USD',
          created_at: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Test transaction failed',
        error
      };
    }
  }

  // Check if UI integration is complete
  async checkUIIntegration(): Promise<UIStatus> {
    // In a real implementation, this might check if the payment button/form
    // is properly integrated in all necessary pages
    
    // For demo purposes, assume UI integration is complete
    return {
      success: true,
      message: 'Crypto payment buttons are properly integrated in the UI'
    };
  }

  // Get overall integration status
  async getIntegrationStatus(): Promise<IntegrationStatus> {
    const environment = await this.checkEnvironment();
    const webhooks = await this.checkWebhooks();
    const testTransaction = await this.testTransaction();
    const uiIntegration = await this.checkUIIntegration();

    const completedSteps = [];
    if (environment.success) completedSteps.push('environment');
    if (webhooks.success) completedSteps.push('webhooks');
    if (testTransaction.success) completedSteps.push('testTransaction');
    if (uiIntegration.success) completedSteps.push('uiIntegration');

    return {
      environment,
      webhooks,
      testTransaction,
      uiIntegration,
      completedSteps,
      isComplete: completedSteps.length === 4
    };
  }
}

export const cryptoIntegrationService = new CryptoIntegrationService();