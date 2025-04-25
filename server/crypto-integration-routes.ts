import express, { Request, Response } from 'express';
import { ensureAdmin } from './auth-jwt';
import { cryptoIntegrationService } from './services/crypto-integration-service';

export const cryptoIntegrationRouter = express.Router();

// Get crypto integration status
cryptoIntegrationRouter.get('/status', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const status = await cryptoIntegrationService.getIntegrationStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting crypto integration status:', error);
    res.status(500).json({ error: 'Failed to get integration status' });
  }
});

// Test crypto integration
cryptoIntegrationRouter.post('/test', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const result = await cryptoIntegrationService.testTransaction();
    res.json(result);
  } catch (error) {
    console.error('Error testing crypto integration:', error);
    res.status(500).json({ error: 'Failed to test integration', success: false });
  }
});

// Check environment variables
cryptoIntegrationRouter.get('/environment', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const result = await cryptoIntegrationService.checkEnvironment();
    res.json(result);
  } catch (error) {
    console.error('Error checking environment variables:', error);
    res.status(500).json({ error: 'Failed to check environment variables' });
  }
});

// Check webhooks configuration
cryptoIntegrationRouter.get('/webhooks', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const result = await cryptoIntegrationService.checkWebhooks();
    res.json(result);
  } catch (error) {
    console.error('Error checking webhooks:', error);
    res.status(500).json({ error: 'Failed to check webhooks' });
  }
});

// Check UI integration
cryptoIntegrationRouter.get('/ui', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const result = await cryptoIntegrationService.checkUIIntegration();
    res.json(result);
  } catch (error) {
    console.error('Error checking UI integration:', error);
    res.status(500).json({ error: 'Failed to check UI integration' });
  }
});