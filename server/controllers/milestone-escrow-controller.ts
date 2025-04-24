import { Request, Response } from 'express';
import { milestoneEscrowService } from '../services/milestone-escrow-service';
import { db } from '../db';
import { milestones } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Controller for milestone escrow operations
 */
export const milestoneEscrowController = {
  /**
   * Get supported networks
   */
  getSupportedNetworks: async (req: Request, res: Response) => {
    try {
      const networks = milestoneEscrowService.getSupportedNetworks();
      res.status(200).json({ networks });
    } catch (error) {
      console.error('Error getting supported networks:', error);
      res.status(500).json({
        message: 'Failed to get supported networks',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Create a new milestone escrow
   * This would typically handle signed transactions from the frontend
   */
  createMilestoneEscrow: async (req: Request, res: Response) => {
    try {
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { 
        beneficiaryAddress, 
        totalAmount, 
        milestones: milestonesData, 
        network,
        signedTransaction 
      } = req.body;
      
      if (!beneficiaryAddress || !totalAmount || !milestonesData || !network) {
        return res.status(400).json({ 
          message: 'Beneficiary address, total amount, milestones, and network are required' 
        });
      }
      
      // In a real implementation, we would process the signed transaction
      // or use a securely stored private key
      
      // For demonstration
      if (!process.env.PLATFORM_PRIVATE_KEY) {
        return res.status(500).json({ message: 'Platform private key is not configured' });
      }
      
      const result = await milestoneEscrowService.createMilestoneEscrow(
        process.env.PLATFORM_PRIVATE_KEY,
        beneficiaryAddress,
        totalAmount,
        milestonesData,
        network
      );
      
      if (!result.success) {
        return res.status(400).json({
          message: 'Failed to create milestone escrow',
          error: result.error
        });
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating milestone escrow:', error);
      res.status(500).json({
        message: 'Failed to create milestone escrow',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Get details of an escrow
   */
  getEscrowDetails: async (req: Request, res: Response) => {
    try {
      const { escrowId, network } = req.params;
      
      if (!escrowId || !network) {
        return res.status(400).json({ message: 'Escrow ID and network are required' });
      }
      
      const escrowDetails = await milestoneEscrowService.getEscrowDetails(escrowId, network as any);
      res.status(200).json(escrowDetails);
    } catch (error) {
      console.error('Error getting escrow details:', error);
      res.status(500).json({
        message: 'Failed to get escrow details',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Check if a milestone is ready for release
   */
  checkMilestoneReadiness: async (req: Request, res: Response) => {
    try {
      const { escrowId, milestoneIndex, network } = req.params;
      
      if (!escrowId || milestoneIndex === undefined || !network) {
        return res.status(400).json({ message: 'Escrow ID, milestone index, and network are required' });
      }
      
      const readinessCheck = await milestoneEscrowService.checkMilestoneReadiness(
        escrowId,
        parseInt(milestoneIndex),
        network as any
      );
      
      res.status(200).json(readinessCheck);
    } catch (error) {
      console.error('Error checking milestone readiness:', error);
      res.status(500).json({
        message: 'Failed to check milestone readiness',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Release funds for a completed milestone
   * Admin only endpoint
   */
  releaseMilestone: async (req: Request, res: Response) => {
    try {
      // Ensure user is admin (already checked by middleware)
      
      const { escrowId, milestoneIndex, network, proofData } = req.body;
      
      if (!escrowId || milestoneIndex === undefined || !network || !proofData) {
        return res.status(400).json({ 
          message: 'Escrow ID, milestone index, network, and proof data are required' 
        });
      }
      
      // Check if milestone is ready
      const readinessCheck = await milestoneEscrowService.checkMilestoneReadiness(
        escrowId,
        milestoneIndex,
        network
      );
      
      if (!readinessCheck.isReady) {
        return res.status(400).json({
          message: 'Milestone is not ready for release',
          reason: readinessCheck.reason
        });
      }
      
      // For demonstration
      if (!process.env.ADMIN_PRIVATE_KEY) {
        return res.status(500).json({ message: 'Admin private key is not configured' });
      }
      
      const result = await milestoneEscrowService.releaseMilestone(
        process.env.ADMIN_PRIVATE_KEY,
        escrowId,
        milestoneIndex,
        network,
        proofData
      );
      
      if (!result.success) {
        return res.status(400).json({
          message: 'Failed to release milestone',
          error: result.error
        });
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error releasing milestone:', error);
      res.status(500).json({
        message: 'Failed to release milestone',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Get all milestones for a user
   */
  getUserMilestones: async (req: Request, res: Response) => {
    try {
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // In a real implementation, we would filter milestones by user ID
      // For demonstration, we'll return all milestones
      const userMilestones = await db.select().from(milestones);
      
      res.status(200).json({ milestones: userMilestones });
    } catch (error) {
      console.error('Error getting user milestones:', error);
      res.status(500).json({
        message: 'Failed to get user milestones',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
};