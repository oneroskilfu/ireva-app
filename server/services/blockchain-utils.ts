import * as ethers from 'ethers';

/**
 * Utilities for blockchain-related operations
 */
export class BlockchainUtils {
  /**
   * Convert a value to Wei (Ether's smallest unit)
   * @param amount Amount as string or number
   * @returns BigNumber representing the amount in wei
   */
  static toWei(amount: string | number): ethers.BigNumber {
    const amountStr = amount?.toString() || "0";
    return ethers.parseEther(amountStr);
  }
  
  /**
   * Format Wei to Ether (human-readable)
   * @param wei Amount in wei
   * @returns String representing the amount in Ether
   */
  static fromWei(wei: ethers.BigNumber): string {
    return ethers.formatEther(wei);
  }
  
  /**
   * Get a placeholder/zero address
   */
  static getZeroAddress(): string {
    return ethers.ZeroAddress || "0x0000000000000000000000000000000000000000";
  }
  
  /**
   * Safe check if an address is the zero address
   */
  static isZeroAddress(address: string): boolean {
    return address === (ethers.ZeroAddress || "0x0000000000000000000000000000000000000000");
  }
  
  /**
   * Create a token symbol from a property name
   */
  static createTokenSymbol(propertyName: string | null | undefined): string {
    if (!propertyName) return "PROP";
    
    return propertyName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  }
}