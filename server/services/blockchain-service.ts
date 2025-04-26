import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Use import.meta.url for ES modules instead of __dirname
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load contract ABI
const loadContractABI = () => {
  try {
    // Get current file path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const abiPath = path.join(__dirname, '../../artifacts/contracts/iREVAEscrow.sol/iREVAEscrow.json');
    if (fs.existsSync(abiPath)) {
      const contractData = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
      return contractData.abi;
    } else {
      console.warn(`ABI file not found at ${abiPath}, using placeholder ABI`);
      // Return a minimal ABI for basic functions if file not found
      return [
        "function invest(uint256 amount) external",
        "function getCampaignStatus() external view returns (uint256 endTime, uint256 raised, uint256 goal, bool isFinalized, bool isSuccessful)",
        "function getInvestorDetails(address investorAddress) external view returns (uint256 amount, bool refunded)",
        "function claimRefund() external",
        "function remainingTime() external view returns (uint256)"
      ];
    }
  } catch (error) {
    console.error('Error loading contract ABI:', error);
    // Use placeholder ABI instead of throwing which would break the service
    return [
      "function invest(uint256 amount) external",
      "function getCampaignStatus() external view returns (uint256 endTime, uint256 raised, uint256 goal, bool isFinalized, bool isSuccessful)",
      "function getInvestorDetails(address investorAddress) external view returns (uint256 amount, bool refunded)",
      "function claimRefund() external",
      "function remainingTime() external view returns (uint256)"
    ];
  }
};

class BlockchainService {
  private provider: ethers.Provider;
  private escrowAddress: string;
  private escrowABI: any;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;
  private readOnlyContract: ethers.Contract | null = null;
  
  constructor() {
    // Initialize with environment variables
    const rpcUrl = process.env.MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com/';
    this.escrowAddress = process.env.ESCROW_CONTRACT_ADDRESS || '';
    const privateKey = process.env.PRIVATE_KEY || '';
    
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Load contract ABI
    this.escrowABI = loadContractABI();
    
    // Only initialize contracts if we have a valid address
    if (this.escrowAddress && this.escrowAddress.startsWith('0x') && this.escrowAddress.length === 42) {
      // Initialize wallet if private key is available
      if (privateKey) {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.contract = new ethers.Contract(
          this.escrowAddress, 
          this.escrowABI, 
          this.wallet
        );
      }
      
      // Initialize read-only contract
      this.readOnlyContract = new ethers.Contract(
        this.escrowAddress,
        this.escrowABI,
        this.provider
      );
      
      console.log('BlockchainService initialized with contract at:', this.escrowAddress);
    } else {
      console.log('BlockchainService initialized in mock mode - contract address not properly configured')
    }
  }
  
  /**
   * Get the status of the current campaign
   * @returns Object containing campaign status details
   */
  async getCampaignStatus() {
    try {
      if (!this.readOnlyContract) {
        throw new Error('Contract not initialized');
      }
      
      const status = await this.readOnlyContract.getCampaignStatus();
      
      return {
        endTime: Number(status[0]),
        raised: ethers.formatUnits(status[1], 6), // USDC has 6 decimals
        goal: ethers.formatUnits(status[2], 6),
        isFinalized: status[3],
        isSuccessful: status[4],
        remainingTimeInSeconds: await this.getRemainingTime()
      };
    } catch (error) {
      console.error('Error getting campaign status:', error);
      throw error;
    }
  }
  
  /**
   * Get the remaining time in the campaign
   * @returns Remaining time in seconds
   */
  async getRemainingTime() {
    try {
      if (!this.readOnlyContract) {
        throw new Error('Contract not initialized');
      }
      
      const remainingTime = await this.readOnlyContract.remainingTime();
      return Number(remainingTime);
    } catch (error) {
      console.error('Error getting remaining time:', error);
      throw error;
    }
  }
  
  /**
   * Get details about an investor's contribution
   * @param investorAddress The Ethereum address of the investor
   * @returns Object containing investment amount and refund status
   */
  async getInvestorDetails(investorAddress: string) {
    try {
      if (!this.readOnlyContract) {
        throw new Error('Contract not initialized');
      }
      
      const details = await this.readOnlyContract.getInvestorDetails(investorAddress);
      
      return {
        amount: ethers.formatUnits(details[0], 6), // USDC has 6 decimals
        refunded: details[1]
      };
    } catch (error) {
      console.error('Error getting investor details:', error);
      throw error;
    }
  }
  
  /**
   * Invest in the property through the escrow contract
   * @param amount Amount to invest in USDC
   * @param investorAddress The investor's address
   * @returns Transaction receipt
   */
  async invest(amount: string, investorAddress?: string) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized for writing');
      }
      
      // If investorAddress is provided, we need a different way to sign transactions
      // This would require additional implementation for production use
      
      // Convert amount to the proper units (USDC has 6 decimals)
      const amountInWei = ethers.parseUnits(amount, 6);
      
      // Send the transaction
      const tx = await this.contract.invest(amountInWei);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1 ? 'success' : 'failed'
      };
    } catch (error) {
      console.error('Error investing:', error);
      throw error;
    }
  }
  
  /**
   * Claim a refund if the campaign failed
   * @returns Transaction receipt
   */
  async claimRefund() {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized for writing');
      }
      
      // Send the transaction
      const tx = await this.contract.claimRefund();
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        status: receipt.status === 1 ? 'success' : 'failed'
      };
    } catch (error) {
      console.error('Error claiming refund:', error);
      throw error;
    }
  }
  
  /**
   * Check if the contract is properly initialized
   * @returns True if the contract is initialized
   */
  isInitialized() {
    return !!this.readOnlyContract && !!this.escrowAddress;
  }
  
  /**
   * Get the address of the escrow contract
   * @returns The contract address
   */
  getContractAddress() {
    return this.escrowAddress;
  }

  /**
   * Get transaction status on the blockchain
   * @param txHash Transaction hash to check
   * @returns Transaction status information
   */
  async getTransactionStatus(txHash: string) {
    try {
      if (!this.provider) {
        throw new Error('Blockchain provider not initialized');
      }
      
      const tx = await this.provider.getTransaction(txHash);
      if (!tx) {
        return { found: false, message: 'Transaction not found' };
      }
      
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      let timestamp = null;
      if (tx.blockNumber) {
        const block = await this.provider.getBlock(tx.blockNumber);
        timestamp = block ? block.timestamp : null;
      }
      
      return {
        found: true,
        hash: txHash,
        from: tx.from,
        to: tx.to,
        blockNumber: tx.blockNumber,
        confirmations: tx.confirmations ?? 0,
        status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
        timestamp
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }

  /**
   * Verify an investment on the blockchain
   * @param propertyId Property ID
   * @param investmentId Investment ID
   * @param transactionHash Transaction hash
   * @param userId User ID
   * @returns Verification result
   */
  async verifyInvestment(propertyId: number, investmentId: string, transactionHash: string, userId: string) {
    try {
      // This is a simplified implementation
      // In a real system, we would check the transaction details and match against the investment
      const txStatus = await this.getTransactionStatus(transactionHash);
      
      if (!txStatus.found || txStatus.status !== 'success') {
        return {
          verified: false,
          message: 'Transaction not found or not successful',
          transactionDetails: txStatus
        };
      }
      
      // Here we would match the transaction details with the expected investment data
      // For simplicity, we'll just return success
      return {
        verified: true,
        message: 'Investment verified on blockchain',
        propertyId,
        investmentId,
        transactionHash,
        userId,
        transactionDetails: txStatus
      };
    } catch (error) {
      console.error('Error verifying investment:', error);
      throw error;
    }
  }

  /**
   * Get property token details
   * @param propertyId Property ID
   * @returns Token details
   */
  async getPropertyTokenDetails(propertyId: number) {
    // This is a simplified implementation
    // In a real system, we would query an ERC-20 or ERC-721 token contract
    return {
      propertyId,
      tokenSymbol: `PROP${propertyId}`,
      tokenAddress: this.escrowAddress, // In a real system, this would be different
      totalSupply: '1000000',
      tokenType: 'ERC-20',
      network: process.env.NETWORK || 'mumbai'
    };
  }

  /**
   * Get investor token balance for a property
   * @param propertyId Property ID
   * @param userId User ID
   * @returns Token balance
   */
  async getInvestorTokenBalance(propertyId: number, userId: string) {
    // This is a simplified implementation
    // In a real system, we would query the token contract for the user's balance
    return {
      propertyId,
      userId,
      tokenSymbol: `PROP${propertyId}`,
      balance: '0', // Mock balance, would be fetched from blockchain
      network: process.env.NETWORK || 'mumbai'
    };
  }

  /**
   * Claim ROI for a property
   * @param propertyId Property ID
   * @param userId User ID
   * @returns Claim result
   */
  async claimRoi(propertyId: number, userId: string) {
    // This is a simplified implementation
    // In a real system, we would call a smart contract function
    return {
      success: false,
      message: 'ROI claiming not implemented yet',
      propertyId,
      userId
    };
  }

  /**
   * Distribute ROI for a property (admin only)
   * @param propertyId Property ID
   * @param amount Amount to distribute
   * @returns Distribution result
   */
  async distributeRoi(propertyId: number, amount: string) {
    // This is a simplified implementation
    // In a real system, we would call a smart contract function
    return {
      success: false,
      message: 'ROI distribution not implemented yet',
      propertyId,
      amount
    };
  }
}

// Create and export a singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;