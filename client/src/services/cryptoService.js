import axios from 'axios';

// Crypto service for handling cryptocurrency transactions and integrations
class CryptoService {
  constructor() {
    this.api = axios.create({
      baseURL: '/api/crypto',
      withCredentials: true,
    });
  }

  /**
   * Create a CoinGate invoice for cryptocurrency payment
   * 
   * @param {Object} params Payment parameters
   * @param {number} params.amount Amount to pay
   * @param {string} params.currency Currency code (e.g., 'USDT', 'BTC', 'ETH')
   * @param {string|number} params.projectId ID of the project to invest in
   * @param {string} params.walletAddress User's wallet address
   * @param {string} params.description Payment description
   * @returns {Promise<Object>} CoinGate invoice data with payment URL
   */
  async createCoinGateInvoice(params) {
    try {
      const response = await this.api.post('/create-invoice', params);
      return response.data;
    } catch (error) {
      console.error('Error creating CoinGate invoice:', error);
      
      // In development mode, return mock data for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Returning mock payment URL for development');
        return {
          id: 'mock-invoice-' + Date.now(),
          payment_url: 'https://example.com/mock-payment',
          status: 'pending',
          currency: params.currency,
          amount: params.amount,
          created_at: new Date().toISOString()
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Check CoinGate payment status by invoice ID
   * 
   * @param {string} invoiceId CoinGate invoice ID
   * @returns {Promise<Object>} Payment status data
   */
  async checkPaymentStatus(invoiceId) {
    try {
      const response = await this.api.get(`/payment-status/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      
      // In development mode, return mock data for testing
      if (process.env.NODE_ENV === 'development') {
        return {
          id: invoiceId,
          status: 'paid',
          currency: 'USDT',
          receive_currency: 'USDT',
          payment_address: '0x123...456',
          created_at: new Date(Date.now() - 60000).toISOString(),
          paid_at: new Date().toISOString()
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Trigger smart contract deposit after successful payment
   * 
   * @param {Object} params Deposit parameters
   * @param {string} params.invoiceId CoinGate invoice ID
   * @param {string|number} params.projectId ID of the project
   * @param {string} params.walletAddress User's wallet address
   * @param {string} params.amount Amount in cryptocurrency
   * @returns {Promise<Object>} Deposit transaction data
   */
  async depositToEscrow(params) {
    try {
      const response = await this.api.post('/deposit-to-escrow', params);
      return response.data;
    } catch (error) {
      console.error('Error depositing to escrow:', error);
      
      // In development mode, return mock data for testing
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          transactionHash: '0x' + Array(64).fill().map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
          amount: params.amount,
          walletAddress: params.walletAddress,
          projectId: params.projectId,
          timestamp: new Date().toISOString()
        };
      }
      
      throw error;
    }
  }
}

// Create and export a singleton instance
const cryptoService = new CryptoService();
export default cryptoService;

// Export individual methods for easier imports
export const { 
  createCoinGateInvoice, 
  checkPaymentStatus, 
  depositToEscrow 
} = cryptoService;