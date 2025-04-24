import { Router, Request, Response } from 'express';
import { blockchainService } from '../services/blockchain-service';
import { verifyToken, authMiddleware } from '../auth-jwt';
import { db } from '../db';
import { properties } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

const blockchainRouter = Router();

/**
 * @route POST /api/blockchain/properties/:id/contracts
 * @desc Create smart contracts for a property
 * @access Private/Admin
 */
blockchainRouter.post('/properties/:id/contracts', verifyToken, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.jwtPayload?.role !== 'admin' && req.jwtPayload?.role !== 'super_admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const propertyId = parseInt(req.params.id);
    const { developerAddress } = req.body;
    
    if (!developerAddress) {
      return res.status(400).json({ message: "Developer address is required" });
    }
    
    // Create property contracts
    const result = await blockchainService.createPropertyContracts(propertyId, developerAddress);
    
    // Update property record with contract addresses
    await db
      .update(properties)
      .set({
        // TODO: Add fields to store contract addresses in the properties table
        escrowContractAddress: result.escrowAddress,
        tokenContractAddress: result.tokenAddress
      })
      .where(eq(properties.id, propertyId));
    
    res.json({
      message: "Property contracts created successfully",
      contracts: result
    });
  } catch (error) {
    console.error("Error creating property contracts:", error);
    res.status(500).json({ 
      message: "Failed to create property contracts", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * @route POST /api/blockchain/properties/:id/invest
 * @desc Invest in a property
 * @access Private
 */
blockchainRouter.post('/properties/:id/invest', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const propertyId = parseInt(req.params.id);
    const { investorAddress, amount } = req.body;
    
    if (!investorAddress || !amount) {
      return res.status(400).json({ message: "Investor address and amount are required" });
    }
    
    // Make investment
    const result = await blockchainService.investInProperty(propertyId, investorAddress, amount);
    
    res.json({
      message: "Investment successful",
      transaction: result
    });
  } catch (error) {
    console.error("Error investing in property:", error);
    res.status(500).json({ 
      message: "Failed to invest in property", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * @route POST /api/blockchain/properties/:id/distribute-roi
 * @desc Distribute ROI to investors
 * @access Private/Admin
 */
blockchainRouter.post('/properties/:id/distribute-roi', verifyToken, async (req: Request, res: Response) => {
  try {
    // Check if user is admin
    if (req.jwtPayload?.role !== 'admin' && req.jwtPayload?.role !== 'super_admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    const propertyId = parseInt(req.params.id);
    const { amount, description } = req.body;
    
    if (!amount || !description) {
      return res.status(400).json({ message: "Amount and description are required" });
    }
    
    // Distribute ROI
    const result = await blockchainService.distributeROI(propertyId, amount, description);
    
    res.json({
      message: "ROI distributed successfully",
      transaction: result
    });
  } catch (error) {
    console.error("Error distributing ROI:", error);
    res.status(500).json({ 
      message: "Failed to distribute ROI", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * @route GET /api/blockchain/properties/:id/stats
 * @desc Get property investment statistics
 * @access Public
 */
blockchainRouter.get('/properties/:id/stats', async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    // Get statistics
    const stats = await blockchainService.getPropertyInvestmentStats(propertyId);
    
    res.json(stats);
  } catch (error) {
    console.error("Error getting property statistics:", error);
    res.status(500).json({ 
      message: "Failed to get property statistics", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * @route GET /api/blockchain/investors/:address/rewards
 * @desc Get investor's pending rewards
 * @access Private
 */
blockchainRouter.get('/investors/:address/rewards', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const investorAddress = req.params.address;
    const propertyId = parseInt(req.query.propertyId as string);
    
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }
    
    // Get rewards
    const rewards = await blockchainService.getInvestorRewards(propertyId, investorAddress);
    
    res.json(rewards);
  } catch (error) {
    console.error("Error getting investor rewards:", error);
    res.status(500).json({ 
      message: "Failed to get investor rewards", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * @route POST /api/blockchain/investors/claim-rewards
 * @desc Claim investor's rewards
 * @access Private
 */
blockchainRouter.post('/investors/claim-rewards', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const { propertyId, investorPrivateKey } = req.body;
    
    if (!propertyId || !investorPrivateKey) {
      return res.status(400).json({ message: "Property ID and investor private key are required" });
    }
    
    // Claim rewards
    const result = await blockchainService.claimRewards(propertyId, investorPrivateKey);
    
    res.json({
      message: "Rewards claimed successfully",
      transaction: result
    });
  } catch (error) {
    console.error("Error claiming rewards:", error);
    res.status(500).json({ 
      message: "Failed to claim rewards", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default blockchainRouter;