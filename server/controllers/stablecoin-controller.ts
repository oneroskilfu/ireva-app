import { Request, Response } from 'express';
import { stablecoinService } from '../services/stablecoin-service';
import { db } from '../db';
import { cryptoTransactions, wallets } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Controller for stablecoin operations
 */
export const stablecoinController = {
  /**
   * Get supported networks and tokens
   */
  getSupportedNetworksAndTokens: async (req: Request, res: Response) => {
    try {
      const result = stablecoinService.getSupportedNetworksAndTokens();
      res.status(200).json(result);
    } catch (error) {
      console.error('Error getting supported networks and tokens:', error);
      res.status(500).json({
        message: 'Failed to get supported networks and tokens',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Get token balance for a wallet
   */
  getTokenBalance: async (req: Request, res: Response) => {
    try {
      const { walletAddress, network, token } = req.params;
      
      if (!walletAddress || !network || !token) {
        return res.status(400).json({ message: 'Wallet address, network, and token are required' });
      }
      
      const balance = await stablecoinService.getTokenBalance(
        walletAddress, 
        network as any,
        token as any
      );
      
      res.status(200).json(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      res.status(500).json({
        message: 'Failed to get token balance',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Transfer tokens from platform to user
   * This would typically be an admin-only endpoint
   */
  transferTokens: async (req: Request, res: Response) => {
    try {
      // In a real implementation, we would verify that the user is an admin
      // and use a securely stored platform private key
      const { recipientAddress, amount, network, token } = req.body;
      
      if (!recipientAddress || !amount || !network || !token) {
        return res.status(400).json({ message: 'Recipient address, amount, network, and token are required' });
      }
      
      // This should be securely stored and accessed, not in code
      const platformPrivateKey = process.env.PLATFORM_PRIVATE_KEY;
      
      if (!platformPrivateKey) {
        return res.status(500).json({ message: 'Platform private key is not configured' });
      }
      
      const result = await stablecoinService.transferTokens(
        platformPrivateKey,
        recipientAddress,
        amount,
        network,
        token
      );
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error transferring tokens:', error);
      res.status(500).json({
        message: 'Failed to transfer tokens',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Approve platform to spend tokens on behalf of user
   * This would receive a signed transaction from the frontend
   */
  approveTokenSpending: async (req: Request, res: Response) => {
    try {
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { spenderAddress, amount, network, token, signedTransaction } = req.body;
      
      if (!spenderAddress || !amount || !network || !token) {
        return res.status(400).json({ message: 'Spender address, amount, network, and token are required' });
      }
      
      // In a real implementation, we would process the signed transaction
      // or use a private key securely provided by the user
      res.status(200).json({
        success: true,
        message: 'Approval transaction would be processed here'
      });
    } catch (error) {
      console.error('Error approving token spending:', error);
      res.status(500).json({
        message: 'Failed to approve token spending',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Get allowance for a spender
   */
  getAllowance: async (req: Request, res: Response) => {
    try {
      const { ownerAddress, spenderAddress, network, token } = req.params;
      
      if (!ownerAddress || !spenderAddress || !network || !token) {
        return res.status(400).json({ message: 'Owner address, spender address, network, and token are required' });
      }
      
      const allowance = await stablecoinService.getAllowance(
        ownerAddress,
        spenderAddress,
        network as any,
        token as any
      );
      
      res.status(200).json(allowance);
    } catch (error) {
      console.error('Error getting allowance:', error);
      res.status(500).json({
        message: 'Failed to get allowance',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Estimate gas for token transfer
   */
  estimateTransferGas: async (req: Request, res: Response) => {
    try {
      const { senderAddress, recipientAddress, amount, network, token } = req.body;
      
      if (!senderAddress || !recipientAddress || !amount || !network || !token) {
        return res.status(400).json({ message: 'Sender address, recipient address, amount, network, and token are required' });
      }
      
      const gasEstimate = await stablecoinService.estimateTransferGas(
        senderAddress,
        recipientAddress,
        amount,
        network,
        token
      );
      
      res.status(200).json(gasEstimate);
    } catch (error) {
      console.error('Error estimating gas:', error);
      res.status(500).json({
        message: 'Failed to estimate gas',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
  
  /**
   * Get token transaction history for a user
   */
  getTransactionHistory: async (req: Request, res: Response) => {
    try {
      const userId = req.jwtPayload?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const { network, token } = req.query;
      
      // Get transactions from database
      let query = db.select().from(cryptoTransactions).where(eq(cryptoTransactions.userId, userId));
      
      if (network) {
        query = query.where(eq(cryptoTransactions.network, network as string));
      }
      
      if (token) {
        query = query.where(eq(cryptoTransactions.token, token as string));
      }
      
      const transactions = await query.orderBy(cryptoTransactions.timestamp);
      
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Error getting transaction history:', error);
      res.status(500).json({
        message: 'Failed to get transaction history',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
};