import express from 'express';
import { authMiddleware, ensureAdmin } from '../auth-jwt';
import blockchainService from '../services/blockchain-service';
import { escrowController } from '../controllers/escrowController';

const escrowRouter = express.Router();

/**
 * Get all escrow projects (admin only)
 */
escrowRouter.get('/admin/escrow-projects', authMiddleware, ensureAdmin, async (req, res) => {
  try {
    // In a production environment, fetch real projects from database
    // For demonstration, we're using mock data
    const projects = [
      {
        id: 1,
        name: "Lagos Heights Residential Tower",
        goal: "5,000,000",
        raised: "3,750,000",
        status: "active",
        percentComplete: 75,
        nextMilestone: {
          id: 2,
          title: "Construction Phase 2",
          amount: "1,500,000",
          releaseDate: "2023-09-15",
          status: "pending"
        }
      },
      {
        id: 2,
        name: "Abuja Commercial Plaza",
        goal: "2,500,000",
        raised: "2,500,000",
        status: "successful",
        percentComplete: 100,
        nextMilestone: {
          id: 3,
          title: "Final Completion",
          amount: "750,000",
          releaseDate: "2023-07-30",
          status: "ready"
        }
      },
      {
        id: 3,
        name: "Port Harcourt Business Hub",
        goal: "3,200,000",
        raised: "1,250,000",
        status: "failed",
        percentComplete: 39,
        nextMilestone: null
      }
    ];
    
    res.json({ projects });
  } catch (error) {
    console.error('Error fetching escrow projects:', error);
    res.status(500).json({ error: 'Failed to fetch escrow projects' });
  }
});

/**
 * Get escrow wallet balance (admin only)
 */
escrowRouter.get('/admin/escrow-wallet-balance', authMiddleware, ensureAdmin, async (req, res) => {
  try {
    // In a real implementation, we would fetch this from the blockchain
    // For demo purposes, we're using mock data
    const balance = {
      usdc: '3,750,000',
      eth: '1.25'
    };
    
    res.json({ balance });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
});

/**
 * Release escrow funds for a milestone (admin only) - WITH EMAIL NOTIFICATION
 */
escrowRouter.post('/admin/release-escrow-funds', authMiddleware, ensureAdmin, escrowController.releaseFunds);

/**
 * Get escrow campaign status
 */
escrowRouter.get('/escrow/status', authMiddleware, async (req, res) => {
  try {
    // Check if blockchain service is initialized
    if (!blockchainService.isInitialized()) {
      return res.status(503).json({
        error: 'Blockchain service not fully initialized',
        details: 'Contract address may be missing'
      });
    }
    
    // Get the campaign status from the blockchain
    const status = await blockchainService.getCampaignStatus();
    
    res.json(status);
  } catch (error) {
    console.error('Error getting campaign status:', error);
    res.status(500).json({ error: 'Failed to get campaign status' });
  }
});

/**
 * Get investor details
 */
escrowRouter.get('/escrow/investor/:walletAddress', authMiddleware, async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    // Check if blockchain service is initialized
    if (!blockchainService.isInitialized()) {
      return res.status(503).json({
        error: 'Blockchain service not fully initialized',
        details: 'Contract address may be missing'
      });
    }
    
    // Get the investor details from the blockchain
    const details = await blockchainService.getInvestorDetails(walletAddress);
    
    res.json(details);
  } catch (error) {
    console.error('Error getting investor details:', error);
    res.status(500).json({ error: 'Failed to get investor details' });
  }
});

/**
 * Invest in escrow campaign
 */
escrowRouter.post('/escrow/invest', authMiddleware, async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;
    
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    // Check if blockchain service is initialized
    if (!blockchainService.isInitialized()) {
      return res.status(503).json({
        error: 'Blockchain service not fully initialized',
        details: 'Contract address may be missing'
      });
    }
    
    // Invest in the campaign
    const result = await blockchainService.invest(amount, walletAddress);
    
    res.json(result);
  } catch (error) {
    console.error('Error investing:', error);
    res.status(500).json({ error: 'Failed to invest' });
  }
});

/**
 * Claim refund from escrow - WITH EMAIL NOTIFICATION
 */
escrowRouter.post('/escrow/refund', authMiddleware, escrowController.requestRefund);

export default escrowRouter;