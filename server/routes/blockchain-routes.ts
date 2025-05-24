import { Router, Request, Response } from 'express';
import { authMiddleware, ensureAdmin } from '../auth-jwt';
import { z } from 'zod';
import { ethers } from 'ethers';
import blockchainService from '../services/blockchain-service';
import { blockchainStatusController } from '../controllers/blockchain-status-controller';

const blockchainRouter = Router();

// Schema for verifying an investment on the blockchain
const verifyInvestmentSchema = z.object({
  propertyId: z.number(),
  investmentId: z.string(),
  transactionHash: z.string()
});

/**
 * Get transaction status from the blockchain
 */
blockchainRouter.get('/transaction/:txHash', authMiddleware, async (req: Request, res: Response) => {
  try {
    const txHash = req.params.txHash;
    
    if (!txHash) {
      return res.status(400).json({ error: 'Transaction hash is required' });
    }
    
    // Check if blockchain service is properly initialized
    if (!blockchainService.isInitialized()) {
      return res.status(503).json({
        error: 'Blockchain service not fully initialized',
        details: 'Contract address may be missing'
      });
    }
    
    // Get the transaction status from the blockchain
    const status = await blockchainService.getTransactionStatus(txHash);
    
    res.json(status);
  } catch (error) {
    console.error('Error getting transaction status:', error);
    res.status(500).json({ error: 'Failed to get transaction status', details: String(error) });
  }
});

/**
 * Verify an investment on the blockchain
 */
blockchainRouter.post('/verify-investment', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = verifyInvestmentSchema.parse(req.body);
    
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify the investment on the blockchain
    const result = await blockchainService.verifyInvestment(
      validatedData.propertyId,
      validatedData.investmentId,
      validatedData.transactionHash,
      userId.toString()
    );
    
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    
    console.error('Error verifying investment:', error);
    res.status(500).json({ error: 'Failed to verify investment', details: String(error) });
  }
});

/**
 * Get property token details
 */
blockchainRouter.get('/property/:propertyId/token', authMiddleware, async (req: Request, res: Response) => {
  try {
    const propertyId = Number(req.params.propertyId);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }
    
    // Get the token details from the blockchain
    const tokenDetails = await blockchainService.getPropertyTokenDetails(propertyId);
    
    res.json(tokenDetails);
  } catch (error) {
    console.error('Error getting property token details:', error);
    res.status(500).json({ error: 'Failed to get property token details', details: String(error) });
  }
});

/**
 * Get investor token balance
 */
blockchainRouter.get('/investor/balance/:propertyId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const propertyId = Number(req.params.propertyId);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }
    
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Get the investor's token balance from the blockchain
    const balance = await blockchainService.getInvestorTokenBalance(
      propertyId,
      userId.toString()
    );
    
    res.json({ balance });
  } catch (error) {
    console.error('Error getting investor token balance:', error);
    res.status(500).json({ error: 'Failed to get investor token balance', details: String(error) });
  }
});

/**
 * Claim ROI for a property
 */
blockchainRouter.post('/claim-roi/:propertyId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const propertyId = Number(req.params.propertyId);
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }
    
    // Get user ID from JWT payload
    const userId = req.jwtPayload?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Claim ROI for the property
    const result = await blockchainService.claimRoi(
      propertyId,
      userId.toString()
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error claiming ROI:', error);
    res.status(500).json({ error: 'Failed to claim ROI', details: String(error) });
  }
});

/**
 * Distribute ROI for a property (admin only)
 */
blockchainRouter.post('/distribute-roi/:propertyId', authMiddleware, ensureAdmin, async (req: Request, res: Response) => {
  try {
    const propertyId = Number(req.params.propertyId);
    const { amount } = req.body;
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: 'Invalid property ID' });
    }
    
    if (!amount || isNaN(Number(amount))) {
      return res.status(400).json({ error: 'Valid ROI amount is required' });
    }
    
    // Distribute ROI for the property
    const result = await blockchainService.distributeRoi(
      propertyId,
      amount.toString()
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error distributing ROI:', error);
    res.status(500).json({ error: 'Failed to distribute ROI', details: String(error) });
  }
});

/**
 * @route GET /api/blockchain/status
 * @desc Check status of blockchain providers
 * @access Public
 */
blockchainRouter.get('/status', blockchainStatusController.checkStatus);

/**
 * @route POST /api/blockchain/api-keys
 * @desc Save blockchain provider API keys
 * @access Private
 */
blockchainRouter.post('/api-keys', authMiddleware, blockchainStatusController.saveApiKeys);

export default blockchainRouter;