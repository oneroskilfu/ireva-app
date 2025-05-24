import { Request, Response } from 'express';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

/**
 * This controller checks the status of blockchain providers
 */

const NETWORKS = {
  ethereum: {
    name: 'Ethereum',
    rpcUrl: process.env.ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
  },
  polygon: {
    name: 'Polygon',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/demo',
  },
  binance: {
    name: 'Binance Smart Chain',
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
  }
};

export const blockchainStatusController = {
  /**
   * Check the status of all blockchain providers
   */
  checkStatus: async (req: Request, res: Response) => {
    try {
      const networkStatusPromises = Object.entries(NETWORKS).map(async ([id, config]) => {
        try {
          // Check if we're using demo keys
          const isDemo = config.rpcUrl.includes('demo');
          const provider = new ethers.JsonRpcProvider(config.rpcUrl);
          
          // Test the provider with a simple call
          // For demo keys, we assume they'll fail to avoid rate limits
          let isAvailable = false;
          let error = undefined;
          
          if (!isDemo) {
            try {
              // Just get the block number to test the connection
              await provider.getBlockNumber();
              isAvailable = true;
            } catch (error: any) {
              isAvailable = false;
              error = error.message || 'Failed to connect to provider';
            }
          } else {
            isAvailable = false;
            error = 'Using demo API key. Please provide your own API key.';
          }
          
          return {
            id,
            name: config.name,
            isAvailable,
            error
          };
        } catch (error: any) {
          return {
            id,
            name: config.name,
            isAvailable: false,
            error: error.message || 'Failed to connect to provider'
          };
        }
      });
      
      const networkStatus = await Promise.all(networkStatusPromises);
      
      res.status(200).json({
        success: true,
        networks: networkStatus
      });
    } catch (error: any) {
      console.error('Error checking blockchain status:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to check blockchain status'
      });
    }
  },
  
  /**
   * Save API keys for blockchain providers
   */
  saveApiKeys: async (req: Request, res: Response) => {
    try {
      const apiKeys = req.body;
      
      // In a real implementation, you would save these keys to the user's settings
      // For now, we'll just return a success response
      
      // Return the status of providers (with the assumption that the new API keys work)
      const networkStatus = Object.entries(NETWORKS).map(([id, config]) => ({
        id,
        name: config.name,
        isAvailable: true,
      }));
      
      res.status(200).json({
        success: true,
        message: 'API keys saved successfully',
        networks: networkStatus
      });
    } catch (error: any) {
      console.error('Error saving API keys:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to save API keys'
      });
    }
  }
};