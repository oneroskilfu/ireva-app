import { Request, Response } from 'express';
import { z } from 'zod';
import blockchainService from '../services/blockchain-service';
import { emailService } from '../services/email-service';

// Schema for release funds request
const releaseFundsSchema = z.object({
  projectId: z.string().or(z.number()).transform(val => Number(val)),
  milestoneId: z.string().or(z.number()).transform(val => Number(val)),
  investorEmail: z.string().email().optional()
});

// Schema for refund request
const refundRequestSchema = z.object({
  walletAddress: z.string(),
  investorEmail: z.string().email().optional()
});

export const escrowController = {
  /**
   * Release escrow funds for a milestone (admin only)
   */
  releaseFunds: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const { projectId, milestoneId, investorEmail } = releaseFundsSchema.parse(req.body);
      
      // Check if blockchain service is initialized
      if (!blockchainService.isInitialized()) {
        return res.status(503).json({
          error: 'Blockchain service not fully initialized',
          details: 'Contract address may be missing'
        });
      }
      
      // In a real implementation, this would be a call to the blockchain
      // For demo purposes, we're just logging the action
      console.log(`Releasing funds for project ${projectId}, milestone ${milestoneId}`);
      
      // Mock transaction hash for demo purposes
      const txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Send email notification if investor email is provided
      if (investorEmail) {
        try {
          await emailService.sendFundsReleasedEmail(
            investorEmail, 
            {
              projectId,
              milestoneId,
              transactionHash: txHash,
              amount: '1,500,000', // This would come from the actual milestone data
              timestamp: new Date().toISOString()
            }
          );
          console.log(`Release notification email sent to ${investorEmail}`);
        } catch (emailError) {
          console.error('Error sending release notification email:', emailError);
          // We don't want to fail the API call if just the email fails
        }
      }
      
      // Return success response
      res.json({ 
        success: true,
        message: `Funds released for project ${projectId}, milestone ${milestoneId}`,
        transactionHash: txHash
      });
    } catch (error) {
      console.error('Error releasing funds:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to release funds' });
    }
  },
  
  /**
   * Request a refund from escrow
   */
  requestRefund: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const { walletAddress, investorEmail } = refundRequestSchema.parse(req.body);
      
      // Check if blockchain service is initialized
      if (!blockchainService.isInitialized()) {
        return res.status(503).json({
          error: 'Blockchain service not fully initialized',
          details: 'Contract address may be missing'
        });
      }
      
      // In a real implementation, this would be a call to the blockchain
      // For demo purposes, we're just logging the action
      console.log(`Processing refund request for wallet ${walletAddress}`);
      
      // Mock transaction hash for demo purposes
      const txHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      
      // Send email notification if investor email is provided
      if (investorEmail) {
        try {
          await emailService.sendRefundRequestEmail(
            investorEmail, 
            {
              walletAddress,
              transactionHash: txHash,
              refundAmount: '5,000', // This would come from the actual investment data
              timestamp: new Date().toISOString()
            }
          );
          console.log(`Refund request email sent to ${investorEmail}`);
        } catch (emailError) {
          console.error('Error sending refund request email:', emailError);
          // We don't want to fail the API call if just the email fails
        }
      }
      
      // Return success response
      res.json({ 
        success: true,
        message: `Refund request for wallet ${walletAddress} is being processed`,
        transactionHash: txHash
      });
    } catch (error) {
      console.error('Error processing refund request:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid request data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to process refund request' });
    }
  }
};