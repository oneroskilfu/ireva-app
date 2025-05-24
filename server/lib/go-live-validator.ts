// Enhanced Go-Live Readiness Validator for iREVA Platform
import axios from 'axios';
import { db } from '../db';
import { users, properties, investments, auditLogs } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { FCM } from './firebase-messaging';

interface ValidationResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export class GoLiveValidator {
  private results: ValidationResult[] = [];

  private addResult(component: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any) {
    this.results.push({ component, status, message, details });
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${component}: ${message}`);
  }

  async validateEnvironmentVariables(): Promise<void> {
    console.log('\n🔍 Validating Environment Variables...');
    
    const requiredVars = [
      'DATABASE_URL',
      'NODE_ENV',
      'SESSION_SECRET',
    ];

    const optionalVars = [
      'REDIS_URL',
      'STRIPE_SECRET_KEY',
      'VITE_STRIPE_PUBLIC_KEY',
      'FIREBASE_SERVICE_ACCOUNT_KEY',
      'SENDGRID_API_KEY',
      'OPENAI_API_KEY',
    ];

    const missing = requiredVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
      this.addResult('Environment', 'fail', `Missing required variables: ${missing.join(', ')}`);
      return;
    }

    const missingOptional = optionalVars.filter(v => !process.env[v]);
    if (missingOptional.length > 0) {
      this.addResult('Environment', 'warning', `Missing optional variables: ${missingOptional.join(', ')} - Some features will be disabled`);
    } else {
      this.addResult('Environment', 'pass', 'All environment variables are properly configured');
    }
  }

  async validateDatabaseConnection(): Promise<void> {
    console.log('\n🔍 Validating Database Connection...');
    
    try {
      // Test basic connectivity
      await db.select().from(users).limit(1);
      this.addResult('Database', 'pass', 'PostgreSQL connection successful');

      // Test data integrity
      const userCount = await db.select().from(users);
      const propertyCount = await db.select().from(properties);
      const investmentCount = await db.select().from(investments);

      this.addResult('Database', 'pass', `Data validation: ${userCount.length} users, ${propertyCount.length} properties, ${investmentCount.length} investments`);

      // Test audit log functionality
      const auditCount = await db.select().from(auditLogs).limit(10);
      if (auditCount.length > 0) {
        this.addResult('Audit System', 'pass', `Audit logging operational with ${auditCount.length} recent entries`);
      } else {
        this.addResult('Audit System', 'warning', 'No audit logs found - audit system may not be active');
      }

    } catch (error) {
      this.addResult('Database', 'fail', `Database connection failed: ${error.message}`);
    }
  }

  async validateApiEndpoints(): Promise<void> {
    console.log('\n🔍 Validating API Endpoints...');
    
    const endpoints = [
      { url: '/api/health', description: 'Health Check' },
      { url: '/api/auth/status', description: 'Authentication Status' },
      { url: '/api/properties', description: 'Properties API' },
      { url: '/api/admin/audit-logs', description: 'Audit Logs API', requiresAuth: true },
      { url: '/api/consent/status', description: 'User Consent API' },
    ];

    for (const endpoint of endpoints) {
      try {
        const baseUrl = process.env.NODE_ENV === 'production' 
          ? process.env.BACKEND_URL || 'https://your-app.fly.dev'
          : 'http://localhost:5000';
        
        const response = await axios.get(`${baseUrl}${endpoint.url}`, {
          timeout: 5000,
          validateStatus: (status) => status < 500, // Accept 4xx as valid responses
        });

        if (response.status < 400) {
          this.addResult('API Endpoints', 'pass', `${endpoint.description} responded successfully`);
        } else if (endpoint.requiresAuth && response.status === 401) {
          this.addResult('API Endpoints', 'pass', `${endpoint.description} properly requires authentication`);
        } else {
          this.addResult('API Endpoints', 'warning', `${endpoint.description} returned status ${response.status}`);
        }
      } catch (error) {
        this.addResult('API Endpoints', 'fail', `${endpoint.description} failed: ${error.message}`);
      }
    }
  }

  async validatePaymentSystem(): Promise<void> {
    console.log('\n🔍 Validating Payment System...');
    
    if (!process.env.STRIPE_SECRET_KEY) {
      this.addResult('Payment System', 'warning', 'Stripe not configured - payment features will be disabled');
      return;
    }

    try {
      // Test Stripe configuration
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const account = await stripe.accounts.retrieve();
      
      this.addResult('Payment System', 'pass', `Stripe connected to account: ${account.display_name || account.id}`);
      
      // Test webhook endpoint availability
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        this.addResult('Payment System', 'pass', 'Stripe webhook secret configured');
      } else {
        this.addResult('Payment System', 'warning', 'Stripe webhook secret not configured - webhook validation may fail');
      }
      
    } catch (error) {
      this.addResult('Payment System', 'fail', `Stripe validation failed: ${error.message}`);
    }
  }

  async validateNotificationSystem(): Promise<void> {
    console.log('\n🔍 Validating Notification System...');
    
    // Test Firebase Cloud Messaging
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const stats = await FCM.getStats();
        this.addResult('Push Notifications', 'pass', `Firebase configured with ${stats.activeTokens} active tokens`);
      } catch (error) {
        this.addResult('Push Notifications', 'fail', `Firebase validation failed: ${error.message}`);
      }
    } else {
      this.addResult('Push Notifications', 'warning', 'Firebase not configured - push notifications will be disabled');
    }

    // Test SendGrid email
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.addResult('Email Notifications', 'pass', 'SendGrid API key configured');
      } catch (error) {
        this.addResult('Email Notifications', 'fail', `SendGrid validation failed: ${error.message}`);
      }
    } else {
      this.addResult('Email Notifications', 'warning', 'SendGrid not configured - email notifications will be disabled');
    }
  }

  async validateSecurity(): Promise<void> {
    console.log('\n🔍 Validating Security Configuration...');
    
    // Check JWT secret strength
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      this.addResult('Security', 'fail', 'JWT_SECRET not configured');
    } else if (jwtSecret.length < 32) {
      this.addResult('Security', 'warning', 'JWT_SECRET should be at least 32 characters long');
    } else {
      this.addResult('Security', 'pass', 'JWT_SECRET properly configured');
    }

    // Check session secret
    const sessionSecret = process.env.SESSION_SECRET;
    if (!sessionSecret) {
      this.addResult('Security', 'fail', 'SESSION_SECRET not configured');
    } else if (sessionSecret.length < 32) {
      this.addResult('Security', 'warning', 'SESSION_SECRET should be at least 32 characters long');
    } else {
      this.addResult('Security', 'pass', 'SESSION_SECRET properly configured');
    }

    // Check HTTPS in production
    if (process.env.NODE_ENV === 'production') {
      const frontendUrl = process.env.FRONTEND_URL || '';
      const backendUrl = process.env.BACKEND_URL || '';
      
      if (frontendUrl.startsWith('https://') && backendUrl.startsWith('https://')) {
        this.addResult('Security', 'pass', 'HTTPS properly configured for production');
      } else {
        this.addResult('Security', 'fail', 'HTTPS not properly configured for production');
      }
    } else {
      this.addResult('Security', 'pass', 'Development environment - HTTPS not required');
    }
  }

  async validatePluginSystem(): Promise<void> {
    console.log('\n🔍 Validating Plugin System...');
    
    try {
      const { pluginRegistry } = await import('./plugin-registry');
      const availablePlugins = pluginRegistry.getAvailablePlugins();
      
      this.addResult('Plugin System', 'pass', `Plugin registry operational with ${availablePlugins.length} available plugins`);
      
      // Test plugin loading
      if (availablePlugins.length > 0) {
        this.addResult('Plugin System', 'pass', `Plugins loaded: ${availablePlugins.map(p => p.name).join(', ')}`);
      } else {
        this.addResult('Plugin System', 'warning', 'No plugins currently registered');
      }
      
    } catch (error) {
      this.addResult('Plugin System', 'fail', `Plugin system validation failed: ${error.message}`);
    }
  }

  async runFullValidation(): Promise<{ success: boolean; results: ValidationResult[] }> {
    console.log('🚀 Running iREVA Platform Go-Live Readiness Validator...\n');
    this.results = [];

    await this.validateEnvironmentVariables();
    await this.validateDatabaseConnection();
    await this.validateApiEndpoints();
    await this.validatePaymentSystem();
    await this.validateNotificationSystem();
    await this.validateSecurity();
    await this.validatePluginSystem();

    const failCount = this.results.filter(r => r.status === 'fail').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const passCount = this.results.filter(r => r.status === 'pass').length;

    console.log('\n📊 Validation Summary:');
    console.log(`✅ Passed: ${passCount}`);
    console.log(`⚠️  Warnings: ${warningCount}`);
    console.log(`❌ Failed: ${failCount}`);

    const success = failCount === 0;
    
    if (success) {
      console.log('\n🎉 Platform is ready for production launch!');
      if (warningCount > 0) {
        console.log('💡 Consider addressing warnings for optimal experience.');
      }
    } else {
      console.log('\n🛑 Platform not ready for production. Please address all failures.');
    }

    return { success, results: this.results };
  }

  getDetailedReport(): string {
    let report = '\n=== iREVA Platform Go-Live Readiness Report ===\n\n';
    
    const groupedResults = this.results.reduce((acc, result) => {
      if (!acc[result.component]) acc[result.component] = [];
      acc[result.component].push(result);
      return acc;
    }, {} as Record<string, ValidationResult[]>);

    for (const [component, results] of Object.entries(groupedResults)) {
      report += `${component}:\n`;
      results.forEach(result => {
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
        report += `  ${icon} ${result.message}\n`;
        if (result.details) {
          report += `     Details: ${JSON.stringify(result.details, null, 2)}\n`;
        }
      });
      report += '\n';
    }

    return report;
  }
}

// CLI usage
if (require.main === module) {
  const validator = new GoLiveValidator();
  validator.runFullValidation().then(({ success }) => {
    process.exit(success ? 0 : 1);
  });
}