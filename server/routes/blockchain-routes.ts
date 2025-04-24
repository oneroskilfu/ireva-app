import { Router, Request, Response } from 'express';
import { blockchainService } from '../services/blockchain-service';
import { db } from '../db';
import { properties } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, ensureAdmin } from '../auth-jwt';

const blockchainRouter = Router();

// Get current blockchain integration status for a property
blockchainRouter.get('/properties/:id/contracts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    // Get property from the database
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Return blockchain integration status
    // Note: This is a simplified implementation; in a real environment, these would be stored in the database
    const hasEscrowContract = (property as any).escrowContractAddress ? true : false;
    const hasTokenContract = (property as any).tokenContractAddress ? true : false;
    const hasRoiDistributor = (property as any).roiDistributorAddress ? true : false;
    
    res.json({
      propertyId,
      hasEscrowContract,
      hasTokenContract,
      hasRoiDistributor,
      escrowContractAddress: (property as any).escrowContractAddress || null,
      tokenContractAddress: (property as any).tokenContractAddress || null,
      roiDistributorAddress: (property as any).roiDistributorAddress || null
    });
  } catch (error) {
    console.error('Error getting blockchain contracts:', error);
    res.status(500).json({ error: 'Failed to get blockchain contracts' });
  }
});

// Create contracts for a property (admin only)
blockchainRouter.post('/properties/:id/contracts', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    const { developerAddress } = req.body;
    
    if (!developerAddress) {
      return res.status(400).json({ error: 'Developer address is required' });
    }
    
    // Check if property exists
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Check if contracts already exist
    if ((property as any).escrowContractAddress || (property as any).tokenContractAddress) {
      return res.status(400).json({ error: 'Contracts already exist for this property' });
    }
    
    // Create the contracts
    const result = await blockchainService.createPropertyContracts(propertyId, developerAddress);
    
    // Update property with contract addresses
    // In a real implementation, you would update the property record with the contract addresses
    await db.update(properties)
      .set({
        // Using type assertion to add the non-existent properties
        ...(result.escrowAddress && { escrowContractAddress: result.escrowAddress } as any),
        ...(result.tokenAddress && { tokenContractAddress: result.tokenAddress } as any)
      })
      .where(eq(properties.id, propertyId));
    
    res.status(201).json({
      propertyId,
      escrowContractAddress: result.escrowAddress,
      tokenContractAddress: result.tokenAddress
    });
  } catch (error) {
    console.error('Error creating blockchain contracts:', error);
    res.status(500).json({ error: 'Failed to create blockchain contracts' });
  }
});

// Invest in a property using the escrow contract
blockchainRouter.post('/properties/:id/invest', authMiddleware, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    const { investorAddress, amount } = req.body;
    
    if (!investorAddress || !amount) {
      return res.status(400).json({ error: 'Investor address and amount are required' });
    }
    
    // Check if property exists
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Check if contracts exist
    if (!(property as any).escrowContractAddress) {
      return res.status(400).json({ error: 'No escrow contract exists for this property' });
    }
    
    // Invest in the property
    const result = await blockchainService.investInProperty(
      propertyId,
      investorAddress,
      amount
    );
    
    res.status(200).json({
      propertyId,
      investorAddress,
      amount,
      transactionHash: result.transactionHash,
      success: result.success
    });
  } catch (error) {
    console.error('Error investing in property:', error);
    res.status(500).json({ error: 'Failed to invest in property' });
  }
});

// Get property investment statistics
blockchainRouter.get('/properties/:id/investment-stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    
    // Check if property exists
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Check if contracts exist
    if (!(property as any).escrowContractAddress) {
      return res.status(400).json({ error: 'No escrow contract exists for this property' });
    }
    
    // Get investment statistics
    const stats = await blockchainService.getPropertyInvestmentStats(propertyId);
    
    res.status(200).json({
      propertyId,
      ...stats
    });
  } catch (error) {
    console.error('Error getting property investment statistics:', error);
    res.status(500).json({ error: 'Failed to get property investment statistics' });
  }
});

// Distribute ROI to investors (admin only)
blockchainRouter.post('/properties/:id/distribute-roi', ensureAdmin, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    const { amount, description } = req.body;
    
    if (!amount || !description) {
      return res.status(400).json({ error: 'Amount and description are required' });
    }
    
    // Check if property exists
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Check if contracts exist
    if (!(property as any).roiDistributorAddress) {
      return res.status(400).json({ error: 'No ROI distributor contract exists for this property' });
    }
    
    // Distribute ROI
    const result = await blockchainService.distributeROI(
      propertyId,
      amount,
      description
    );
    
    res.status(200).json({
      propertyId,
      amount,
      description,
      transactionHash: result.transactionHash,
      success: result.success
    });
  } catch (error) {
    console.error('Error distributing ROI:', error);
    res.status(500).json({ error: 'Failed to distribute ROI' });
  }
});

// Get investor's pending rewards
blockchainRouter.get('/properties/:id/rewards', authMiddleware, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    const { investorAddress } = req.query;
    
    if (!investorAddress) {
      return res.status(400).json({ error: 'Investor address is required' });
    }
    
    // Check if property exists
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Check if contracts exist
    if (!(property as any).roiDistributorAddress) {
      return res.status(400).json({ error: 'No ROI distributor contract exists for this property' });
    }
    
    // Get investor rewards
    const rewards = await blockchainService.getInvestorRewards(
      propertyId,
      investorAddress as string
    );
    
    res.status(200).json({
      propertyId,
      investorAddress,
      ...rewards
    });
  } catch (error) {
    console.error('Error getting investor rewards:', error);
    res.status(500).json({ error: 'Failed to get investor rewards' });
  }
});

// Claim investor's rewards
blockchainRouter.post('/properties/:id/claim-rewards', authMiddleware, async (req: Request, res: Response) => {
  try {
    const propertyId = parseInt(req.params.id);
    const { investorPrivateKey } = req.body;
    
    if (!investorPrivateKey) {
      return res.status(400).json({ error: 'Investor private key is required' });
    }
    
    // Check if property exists
    const [property] = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId));
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Check if contracts exist
    if (!(property as any).roiDistributorAddress) {
      return res.status(400).json({ error: 'No ROI distributor contract exists for this property' });
    }
    
    // Claim rewards
    const result = await blockchainService.claimRewards(
      propertyId,
      investorPrivateKey
    );
    
    res.status(200).json({
      propertyId,
      transactionHash: result.transactionHash,
      success: result.success,
      amountClaimed: result.amountClaimed
    });
  } catch (error) {
    console.error('Error claiming rewards:', error);
    res.status(500).json({ error: 'Failed to claim rewards' });
  }
});

export default blockchainRouter;