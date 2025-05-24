import { ethers } from 'ethers';
import { db } from '../db';
import { milestones } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Sample ABI for the MilestoneEscrow contract
const MILESTONE_ESCROW_ABI = [
  'function createEscrow(address _beneficiary, uint256 _totalAmount, bytes32[] _milestoneHashes) external payable returns (uint256)',
  'function releaseMilestone(uint256 _escrowId, uint256 _milestoneIndex, bytes32 _milestoneProof) external',
  'function getEscrowDetails(uint256 _escrowId) external view returns (address funder, address beneficiary, uint256 totalAmount, uint256 releasedAmount, uint256 completedMilestones, uint256 totalMilestones, bool isActive)',
  'function getMilestoneHash(uint256 _escrowId, uint256 _milestoneIndex) external view returns (bytes32)',
  'function withdrawFunds(uint256 _escrowId) external',
  'event EscrowCreated(uint256 indexed escrowId, address indexed funder, address indexed beneficiary, uint256 amount)',
  'event MilestoneReleased(uint256 indexed escrowId, uint256 milestoneIndex, uint256 amount)',
  'event FundsWithdrawn(uint256 indexed escrowId, address indexed caller, uint256 amount)'
];

// Network configurations
const NETWORKS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    contracts: {
      milestoneEscrow: process.env.MILESTONE_ESCROW_ADDRESS_ETH || '0xMilestoneEscrowAddressEthereum'
    }
  },
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/demo',
    contracts: {
      milestoneEscrow: process.env.MILESTONE_ESCROW_ADDRESS_POLYGON || '0xMilestoneEscrowAddressPolygon'
    }
  }
};

/**
 * Service to handle milestone-based escrow operations
 */
class MilestoneEscrowService {
  private providers: Record<string, ethers.JsonRpcProvider>;
  private contracts: Record<string, ethers.Contract>;

  constructor() {
    // Initialize providers for each network with proper error handling
    this.providers = {};
    this.contracts = {};
    
    // Check if we're in development mode
    const isDev = process.env.NODE_ENV !== 'production';
    
    Object.entries(NETWORKS).forEach(([network, config]) => {
      try {
        // In development without proper API keys, create mock providers
        if (isDev && config.rpcUrl.includes('demo')) {
          console.log(`Using mock provider for ${network} in development mode`);
          // Just initialize but don't actually connect in development
          this.providers[network] = null;
          this.contracts[network] = null;
        } else {
          const provider = new ethers.JsonRpcProvider(config.rpcUrl);
          this.providers[network] = provider;
          this.contracts[network] = new ethers.Contract(
            config.contracts.milestoneEscrow,
            MILESTONE_ESCROW_ABI,
            provider
          );
        }
      } catch (error) {
        console.error(`Failed to initialize provider for ${network}:`, error);
        this.providers[network] = null;
        this.contracts[network] = null;
      }
    });
  }

  /**
   * Get wallet provider for a network
   */
  private getWalletProvider(privateKey: string, network: keyof typeof NETWORKS): ethers.Wallet {
    return new ethers.Wallet(privateKey, this.providers[network]);
  }

  /**
   * Calculate keccak256 hash of milestone data
   */
  public calculateMilestoneHash(
    milestone: {
      title: string;
      description: string;
      amount: string;
      completionDate: Date;
    }
  ): string {
    // Convert the milestone data to a ABI-encoded string
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ['string', 'string', 'uint256', 'uint256'],
      [
        milestone.title,
        milestone.description,
        ethers.parseEther(milestone.amount),
        Math.floor(milestone.completionDate.getTime() / 1000)
      ]
    );
    
    // Hash the encoded data
    return ethers.keccak256(encoded);
  }

  /**
   * Create a new milestone escrow
   */
  public async createMilestoneEscrow(
    funderPrivateKey: string,
    beneficiaryAddress: string,
    totalAmount: string,
    milestones: Array<{
      title: string;
      description: string;
      amount: string;
      completionDate: Date;
    }>,
    network: keyof typeof NETWORKS
  ): Promise<{
    success: boolean;
    txHash?: string;
    escrowId?: string;
    error?: string;
  }> {
    try {
      const wallet = this.getWalletProvider(funderPrivateKey, network);
      const contract = this.contracts[network].connect(wallet);
      
      // Calculate milestone hashes
      const milestoneHashes = milestones.map(milestone => 
        this.calculateMilestoneHash(milestone)
      );
      
      // Create the escrow with the total amount in ETH
      const parsedAmount = ethers.parseEther(totalAmount);
      const tx = await contract.createEscrow(
        beneficiaryAddress,
        parsedAmount,
        milestoneHashes,
        { value: parsedAmount }
      );
      
      const receipt = await tx.wait();
      
      // Extract escrow ID from the event logs
      const event = receipt.logs
        .map(log => {
          try {
            return contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find(event => event && event.name === 'EscrowCreated');
      
      if (!event) {
        throw new Error('EscrowCreated event not found in transaction logs');
      }
      
      const escrowId = event.args[0].toString();
      
      // Store milestone info in the database for future reference
      await Promise.all(milestones.map(async (milestone, index) => {
        await db.insert(milestones).values({
          escrowId,
          milestoneIndex: index,
          title: milestone.title,
          description: milestone.description,
          amount: milestone.amount,
          status: 'pending',
          completionDate: milestone.completionDate,
          network,
          hash: milestoneHashes[index]
        });
      }));
      
      return {
        success: true,
        txHash: receipt.hash,
        escrowId
      };
    } catch (error) {
      console.error('Error creating milestone escrow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Release funds for a completed milestone
   */
  public async releaseMilestone(
    adminPrivateKey: string,
    escrowId: string,
    milestoneIndex: number,
    network: keyof typeof NETWORKS,
    proofData: string
  ): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      const wallet = this.getWalletProvider(adminPrivateKey, network);
      const contract = this.contracts[network].connect(wallet);
      
      // Generate proof from the provided data
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes(proofData));
      
      // Release the milestone
      const tx = await contract.releaseMilestone(
        escrowId,
        milestoneIndex,
        proofHash
      );
      
      const receipt = await tx.wait();
      
      // Update milestone status in the database
      await db.update(milestones)
        .set({
          status: 'completed',
          completedAt: new Date(),
          proofData
        })
        .where(eq(milestones.escrowId, escrowId))
        .where(eq(milestones.milestoneIndex, milestoneIndex));
      
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      console.error('Error releasing milestone:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get details of an escrow
   */
  public async getEscrowDetails(
    escrowId: string,
    network: keyof typeof NETWORKS
  ): Promise<{
    funder: string;
    beneficiary: string;
    totalAmount: string;
    releasedAmount: string;
    completedMilestones: number;
    totalMilestones: number;
    isActive: boolean;
    milestones: Array<{
      index: number;
      title: string;
      description: string;
      amount: string;
      status: string;
      completionDate: Date;
      completedAt?: Date;
    }>;
  }> {
    try {
      const contract = this.contracts[network];
      
      // Get on-chain escrow details
      const details = await contract.getEscrowDetails(escrowId);
      
      // Get milestone details from the database
      const milestoneDetails = await db.select()
        .from(milestones)
        .where(eq(milestones.escrowId, escrowId))
        .orderBy(milestones.milestoneIndex);
      
      return {
        funder: details[0],
        beneficiary: details[1],
        totalAmount: ethers.formatEther(details[2]),
        releasedAmount: ethers.formatEther(details[3]),
        completedMilestones: Number(details[4]),
        totalMilestones: Number(details[5]),
        isActive: details[6],
        milestones: milestoneDetails.map(milestone => ({
          index: milestone.milestoneIndex,
          title: milestone.title,
          description: milestone.description,
          amount: milestone.amount,
          status: milestone.status,
          completionDate: milestone.completionDate,
          completedAt: milestone.completedAt
        }))
      };
    } catch (error) {
      console.error('Error getting escrow details:', error);
      throw error;
    }
  }

  /**
   * Check if a milestone is ready for release
   */
  public async checkMilestoneReadiness(
    escrowId: string,
    milestoneIndex: number,
    network: keyof typeof NETWORKS
  ): Promise<{
    isReady: boolean;
    reason?: string;
  }> {
    try {
      // Get milestone details from database
      const [milestone] = await db.select()
        .from(milestones)
        .where(eq(milestones.escrowId, escrowId))
        .where(eq(milestones.milestoneIndex, milestoneIndex));
      
      if (!milestone) {
        return {
          isReady: false,
          reason: 'Milestone not found'
        };
      }
      
      if (milestone.status === 'completed') {
        return {
          isReady: false,
          reason: 'Milestone already completed'
        };
      }
      
      // Get escrow details from chain
      const contract = this.contracts[network];
      const details = await contract.getEscrowDetails(escrowId);
      
      if (!details[6]) { // isActive
        return {
          isReady: false,
          reason: 'Escrow is not active'
        };
      }
      
      if (Number(details[4]) !== milestoneIndex) {
        return {
          isReady: false,
          reason: `Expected milestone index ${details[4]}, got ${milestoneIndex}`
        };
      }
      
      // All checks passed
      return {
        isReady: true
      };
    } catch (error) {
      console.error('Error checking milestone readiness:', error);
      return {
        isReady: false,
        reason: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get supported networks
   */
  public getSupportedNetworks(): Array<{
    id: string;
    name: string;
    chainId: number;
  }> {
    return Object.entries(NETWORKS).map(([id, config]) => ({
      id,
      name: config.name,
      chainId: config.chainId
    }));
  }
}

export const milestoneEscrowService = new MilestoneEscrowService();