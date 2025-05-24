import { ethers } from 'ethers';
import { db } from '../db';
import { cryptoTransactions, wallets } from '@shared/schema';
import { eq } from 'drizzle-orm';

// ABI for ERC20 tokens (USDC/USDT)
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

// Network configurations
const NETWORKS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.ETH_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    tokens: {
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    }
  },
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/demo',
    tokens: {
      USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
    }
  },
  bsc: {
    chainId: 56,
    name: 'Binance Smart Chain',
    rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org',
    tokens: {
      USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      USDT: '0x55d398326f99059fF775485246999027B3197955'
    }
  }
};

/**
 * Service to handle stablecoin operations
 */
class StablecoinService {
  private providers: Record<string, ethers.JsonRpcProvider>;

  constructor() {
    // Initialize providers for each network with proper error handling
    this.providers = {};
    
    // Check if we're in development mode
    const isDev = process.env.NODE_ENV === 'development';
    
    Object.entries(NETWORKS).forEach(([network, config]) => {
      try {
        // In development without proper API keys, create mock providers
        if (isDev && config.rpcUrl.includes('demo')) {
          console.log(`Using mock provider for ${network} in development mode`);
          // Just initialize but don't actually connect in development
          this.providers[network] = null;
        } else {
          this.providers[network] = new ethers.JsonRpcProvider(config.rpcUrl);
        }
      } catch (error) {
        console.error(`Failed to initialize provider for ${network}:`, error);
        this.providers[network] = null;
      }
    });
  }

  /**
   * Get token contract instance
   */
  private getTokenContract(network: keyof typeof NETWORKS, token: 'USDC' | 'USDT'): ethers.Contract {
    const provider = this.providers[network];
    const tokenAddress = NETWORKS[network].tokens[token];
    return new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  }

  /**
   * Get wallet provider for a network
   */
  private getWalletProvider(privateKey: string, network: keyof typeof NETWORKS): ethers.Wallet {
    return new ethers.Wallet(privateKey, this.providers[network]);
  }

  /**
   * Format token amount according to decimals
   */
  private async formatTokenAmount(amount: number, network: keyof typeof NETWORKS, token: 'USDC' | 'USDT'): Promise<bigint> {
    const tokenContract = this.getTokenContract(network, token);
    const decimals = await tokenContract.decimals();
    return ethers.parseUnits(amount.toString(), decimals);
  }

  /**
   * Get balance of token in a wallet
   */
  public async getTokenBalance(
    walletAddress: string, 
    network: keyof typeof NETWORKS, 
    token: 'USDC' | 'USDT'
  ): Promise<{
    balance: string;
    formattedBalance: number;
    symbol: string;
  }> {
    try {
      const tokenContract = this.getTokenContract(network, token);
      const balance = await tokenContract.balanceOf(walletAddress);
      const decimals = await tokenContract.decimals();
      const symbol = await tokenContract.symbol();
      
      const formattedBalance = Number(ethers.formatUnits(balance, decimals));
      
      return {
        balance: balance.toString(),
        formattedBalance,
        symbol
      };
    } catch (error) {
      console.error(`Error getting token balance:`, error);
      throw error;
    }
  }

  /**
   * Transfer tokens from one wallet to another
   */
  public async transferTokens(
    senderPrivateKey: string,
    recipientAddress: string,
    amount: number,
    network: keyof typeof NETWORKS,
    token: 'USDC' | 'USDT'
  ): Promise<{
    success: boolean;
    txHash?: string;
    blockNumber?: number;
    gasUsed?: string;
    effectiveGasPrice?: string;
  }> {
    try {
      const wallet = this.getWalletProvider(senderPrivateKey, network);
      const tokenContract = this.getTokenContract(network, token);
      const tokenWithSigner = tokenContract.connect(wallet);
      
      // Format amount according to token decimals
      const formattedAmount = await this.formatTokenAmount(amount, network, token);
      
      // Send transaction
      const tx = await tokenWithSigner.transfer(recipientAddress, formattedAmount);
      const receipt = await tx.wait();
      
      // Store transaction in the database
      await db.insert(cryptoTransactions).values({
        userId: 0, // This would come from authentication context in a real implementation
        txHash: receipt.hash,
        fromAddress: wallet.address,
        toAddress: recipientAddress,
        amount: amount.toString(),
        token,
        network,
        status: 'completed',
        timestamp: new Date()
      });
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString()
      };
    } catch (error) {
      console.error(`Error transferring tokens:`, error);
      throw error;
    }
  }

  /**
   * Approve platform smart contract to spend tokens on behalf of user
   */
  public async approveSpender(
    userPrivateKey: string,
    spenderAddress: string,
    amount: number,
    network: keyof typeof NETWORKS,
    token: 'USDC' | 'USDT'
  ): Promise<{
    success: boolean;
    txHash?: string;
  }> {
    try {
      const wallet = this.getWalletProvider(userPrivateKey, network);
      const tokenContract = this.getTokenContract(network, token);
      const tokenWithSigner = tokenContract.connect(wallet);
      
      // Format amount according to token decimals
      const formattedAmount = await this.formatTokenAmount(amount, network, token);
      
      // Send approval transaction
      const tx = await tokenWithSigner.approve(spenderAddress, formattedAmount);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error) {
      console.error(`Error approving token spending:`, error);
      throw error;
    }
  }

  /**
   * Get allowance for spender
   */
  public async getAllowance(
    ownerAddress: string,
    spenderAddress: string,
    network: keyof typeof NETWORKS,
    token: 'USDC' | 'USDT'
  ): Promise<{
    allowance: string;
    formattedAllowance: number;
  }> {
    try {
      const tokenContract = this.getTokenContract(network, token);
      const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
      const decimals = await tokenContract.decimals();
      
      const formattedAllowance = Number(ethers.formatUnits(allowance, decimals));
      
      return {
        allowance: allowance.toString(),
        formattedAllowance
      };
    } catch (error) {
      console.error(`Error getting token allowance:`, error);
      throw error;
    }
  }
  
  /**
   * Get estimated gas for token transfer
   */
  public async estimateTransferGas(
    senderAddress: string,
    recipientAddress: string,
    amount: number,
    network: keyof typeof NETWORKS,
    token: 'USDC' | 'USDT'
  ): Promise<{
    gasEstimate: string;
    gasCost: string;
  }> {
    try {
      const tokenContract = this.getTokenContract(network, token);
      
      // Format amount according to token decimals
      const formattedAmount = await this.formatTokenAmount(amount, network, token);
      
      // Estimate gas
      const gasEstimate = await tokenContract.transfer.estimateGas(
        recipientAddress, 
        formattedAmount,
        { from: senderAddress }
      );
      
      // Get gas price
      const gasPrice = await this.providers[network].getFeeData();
      
      // Calculate cost in wei
      const gasCost = gasEstimate * gasPrice.gasPrice;
      
      return {
        gasEstimate: gasEstimate.toString(),
        gasCost: gasCost.toString()
      };
    } catch (error) {
      console.error(`Error estimating gas:`, error);
      throw error;
    }
  }
  
  /**
   * Get supported networks and tokens
   */
  public getSupportedNetworksAndTokens(): {
    networks: Array<{
      id: string;
      name: string;
      chainId: number;
      tokens: string[];
    }>;
  } {
    const networks = Object.entries(NETWORKS).map(([id, config]) => ({
      id,
      name: config.name,
      chainId: config.chainId,
      tokens: Object.keys(config.tokens)
    }));
    
    return { networks };
  }
}

export const stablecoinService = new StablecoinService();