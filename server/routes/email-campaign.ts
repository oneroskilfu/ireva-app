import express, { Request, Response } from 'express';
import { emailCampaignService } from '../services/emailCampaign';
import { authMiddleware, ensureAdmin } from '../auth-jwt';

const emailCampaignRouter = express.Router();

// Get all email campaigns (admin only)
emailCampaignRouter.get('/campaigns', ensureAdmin, async (req: Request, res: Response) => {
  try {
    // Return the predefined campaigns
    res.json({
      success: true,
      data: emailCampaignService.getCampaigns()
    });
  } catch (error) {
    console.error('Failed to get campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get campaigns'
    });
  }
});

// Manually trigger a campaign for a user (admin only)
emailCampaignRouter.post('/trigger/:campaignId/:userId', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { campaignId, userId } = req.params;
    
    // Validate inputs
    if (!campaignId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Campaign ID and user ID are required'
      });
    }
    
    // Trigger the campaign
    await emailCampaignService.triggerCampaign(campaignId, parseInt(userId, 10));
    
    res.json({
      success: true,
      message: `Campaign ${campaignId} triggered for user ${userId}`
    });
  } catch (error) {
    console.error('Failed to trigger campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger campaign'
    });
  }
});

// Manually trigger the welcome sequence for a user (admin only)
emailCampaignRouter.post('/trigger-welcome/:userId', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Validate inputs
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Trigger the welcome sequence
    await emailCampaignService.triggerWelcomeSequence(parseInt(userId, 10));
    
    res.json({
      success: true,
      message: `Welcome sequence triggered for user ${userId}`
    });
  } catch (error) {
    console.error('Failed to trigger welcome sequence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger welcome sequence'
    });
  }
});

// Manually trigger the investment sequence for a user (admin only)
emailCampaignRouter.post('/trigger-investment/:userId', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Validate inputs
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Trigger the investment sequence
    await emailCampaignService.triggerInvestmentSequence(parseInt(userId, 10));
    
    res.json({
      success: true,
      message: `Investment sequence triggered for user ${userId}`
    });
  } catch (error) {
    console.error('Failed to trigger investment sequence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger investment sequence'
    });
  }
});

// Manually trigger the KYC sequence for a user (admin only)
emailCampaignRouter.post('/trigger-kyc/:userId', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Validate inputs
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Trigger the KYC sequence
    await emailCampaignService.triggerKycSequence(parseInt(userId, 10));
    
    res.json({
      success: true,
      message: `KYC sequence triggered for user ${userId}`
    });
  } catch (error) {
    console.error('Failed to trigger KYC sequence:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger KYC sequence'
    });
  }
});

// Process the email queue (admin only)
emailCampaignRouter.post('/process-queue', ensureAdmin, async (req: Request, res: Response) => {
  try {
    await emailCampaignService.processQueue();
    
    res.json({
      success: true,
      message: 'Email queue processed'
    });
  } catch (error) {
    console.error('Failed to process email queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process email queue'
    });
  }
});

export default emailCampaignRouter;