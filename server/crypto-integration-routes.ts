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
    console.error('Error checking crypto integration status:', error);
    res.status(500).json({ error: 'Failed to check crypto integration status' });
  }
});

// Test crypto integration
cryptoIntegrationRouter.post('/test', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const result = await cryptoIntegrationService.testIntegration();
    res.json(result);
  } catch (error) {
    console.error('Error testing crypto integration:', error);
    res.status(500).json({ error: 'Failed to test crypto integration' });
  }
});

// Get environment status
cryptoIntegrationRouter.get('/environment', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const status = await cryptoIntegrationService.getIntegrationStatus();
    res.json(status.environment);
  } catch (error) {
    console.error('Error checking environment status:', error);
    res.status(500).json({ error: 'Failed to check environment status' });
  }
});

// Get webhooks status
cryptoIntegrationRouter.get('/webhooks', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const status = await cryptoIntegrationService.getIntegrationStatus();
    res.json(status.webhooks);
  } catch (error) {
    console.error('Error checking webhooks status:', error);
    res.status(500).json({ error: 'Failed to check webhooks status' });
  }
});

// Get UI integration status
cryptoIntegrationRouter.get('/ui', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const status = await cryptoIntegrationService.getIntegrationStatus();
    res.json(status.uiIntegration);
  } catch (error) {
    console.error('Error checking UI integration status:', error);
    res.status(500).json({ error: 'Failed to check UI integration status' });
  }
});