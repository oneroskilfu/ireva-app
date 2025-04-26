import express, { Request, Response } from 'express';
import { authMiddleware } from '../auth-jwt';
import { ensureAdmin } from '../auth-jwt';
import blockchainService from '../services/blockchain-service';
import { ethers } from 'ethers';

const escrowRouter = express.Router();

/**
 * Get escrow campaign status
 * Returns the current status of the active investment campaign
 */
escrowRouter.get('/status', async (req: Request, res: Response) => {
  try {
    // Check if blockchain service is properly initialized
    if (!blockchainService.isInitialized()) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain service not fully initialized. Contract address may be missing.',
        contractAddress: blockchainService.getContractAddress() || 'Not configured'
      });
    }

    const campaignStatus = await blockchainService.getCampaignStatus();
    
    return res.status(200).json({
      success: true,
      data: campaignStatus
    });
  } catch (error: any) {
    console.error('Error fetching escrow status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch escrow status',
      error: error.message
    });
  }
});

/**
 * Get investor contribution details
 * Authentication required
 */
escrowRouter.get('/investor/:address', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ethereum address'
      });
    }

    // Check if blockchain service is properly initialized
    if (!blockchainService.isInitialized()) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain service not fully initialized'
      });
    }

    const investorDetails = await blockchainService.getInvestorDetails(address);
    
    return res.status(200).json({
      success: true,
      data: investorDetails
    });
  } catch (error: any) {
    console.error('Error fetching investor details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch investor details',
      error: error.message
    });
  }
});

/**
 * Invest in a property through the escrow contract
 * Authentication required
 */
escrowRouter.post('/invest', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount, investorAddress } = req.body;
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investment amount'
      });
    }

    // Check if blockchain service is properly initialized
    if (!blockchainService.isInitialized()) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain service not fully initialized'
      });
    }

    // Optionally validate the investor address if provided
    if (investorAddress && !ethers.isAddress(investorAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Ethereum address'
      });
    }

    const transactionResult = await blockchainService.invest(amount, investorAddress);
    
    return res.status(200).json({
      success: true,
      message: 'Investment transaction submitted',
      data: transactionResult
    });
  } catch (error: any) {
    console.error('Error processing investment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process investment',
      error: error.message
    });
  }
});

/**
 * Claim refund if campaign failed
 * Authentication required
 */
escrowRouter.post('/claim-refund', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Check if blockchain service is properly initialized
    if (!blockchainService.isInitialized()) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain service not fully initialized'
      });
    }

    const transactionResult = await blockchainService.claimRefund();
    
    return res.status(200).json({
      success: true,
      message: 'Refund claim transaction submitted',
      data: transactionResult
    });
  } catch (error: any) {
    console.error('Error processing refund claim:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process refund claim',
      error: error.message
    });
  }
});

/**
 * Admin route to release milestone funds
 * Admin authentication required
 */
escrowRouter.post('/admin/release-milestone/:milestoneIndex', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { milestoneIndex } = req.params;
    const milestoneIndexNum = parseInt(milestoneIndex);
    
    if (isNaN(milestoneIndexNum) || milestoneIndexNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid milestone index'
      });
    }

    // This is a placeholder as we need to implement this function in the blockchain service
    // For now, we'll just return a message
    return res.status(501).json({
      success: false,
      message: 'Feature not implemented yet. This requires an admin-only function to release milestone funds.'
    });
    
    /* Implementation would look like this:
    const transactionResult = await blockchainService.releaseMilestoneFunds(milestoneIndexNum);
    
    return res.status(200).json({
      success: true,
      message: 'Milestone funds release transaction submitted',
      data: transactionResult
    });
    */
  } catch (error: any) {
    console.error('Error releasing milestone funds:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to release milestone funds',
      error: error.message
    });
  }
});

/**
 * Admin route to approve a milestone
 * Admin authentication required
 */
escrowRouter.post('/admin/approve-milestone/:milestoneIndex', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const { milestoneIndex } = req.params;
    const milestoneIndexNum = parseInt(milestoneIndex);
    
    if (isNaN(milestoneIndexNum) || milestoneIndexNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid milestone index'
      });
    }

    // This is a placeholder as we need to implement this function in the blockchain service
    // For now, we'll just return a message
    return res.status(501).json({
      success: false,
      message: 'Feature not implemented yet. This requires an admin-only function to approve a milestone.'
    });
    
    /* Implementation would look like this:
    const transactionResult = await blockchainService.approveMilestone(milestoneIndexNum);
    
    return res.status(200).json({
      success: true,
      message: 'Milestone approval transaction submitted',
      data: transactionResult
    });
    */
  } catch (error: any) {
    console.error('Error approving milestone:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve milestone',
      error: error.message
    });
  }
});

/**
 * Get contract configuration
 * Public route to get contract address and network information
 */
escrowRouter.get('/contract-info', async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        contractAddress: blockchainService.getContractAddress(),
        network: process.env.NETWORK || 'mumbai',
        networkExplorer: process.env.NETWORK === 'mainnet' 
          ? 'https://polygonscan.com' 
          : 'https://mumbai.polygonscan.com'
      }
    });
  } catch (error: any) {
    console.error('Error fetching contract info:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contract info',
      error: error.message
    });
  }
});

export { escrowRouter };