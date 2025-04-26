import axios from 'axios';

// Base API URL is already configured in the API client

class EscrowService {
  constructor() {
    this.api = axios.create({
      baseURL: '/api/blockchain',
      withCredentials: true,
    });
  }

  // Get current campaign status
  async getCampaignStatus() {
    try {
      const response = await this.api.get('/escrow/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign status:', error);
      
      // For development purposes, return mock data when blockchain is not available
      if (process.env.NODE_ENV === 'development') {
        return this.getMockCampaignStatus();
      }
      
      throw error;
    }
  }

  // Get investor details
  async getInvestorDetails(walletAddress) {
    try {
      const response = await this.api.get(`/escrow/investor/${walletAddress}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching investor details:', error);
      
      // For development purposes, return mock data when blockchain is not available
      if (process.env.NODE_ENV === 'development') {
        return this.getMockInvestorDetails(walletAddress);
      }
      
      throw error;
    }
  }

  // Invest in the escrow campaign
  async invest(amount, walletAddress) {
    try {
      const response = await this.api.post('/escrow/invest', {
        amount,
        walletAddress
      });
      return response.data;
    } catch (error) {
      console.error('Error investing:', error);
      
      // For development purposes, return mock data when blockchain is not available
      if (process.env.NODE_ENV === 'development') {
        return this.getMockInvestmentResult(amount, walletAddress);
      }
      
      throw error;
    }
  }

  // Claim refund if campaign failed
  async claimRefund(walletAddress) {
    try {
      const response = await this.api.post('/escrow/refund', {
        walletAddress
      });
      return response.data;
    } catch (error) {
      console.error('Error claiming refund:', error);
      
      // For development purposes, return mock data when blockchain is not available
      if (process.env.NODE_ENV === 'development') {
        return this.getMockRefundResult(walletAddress);
      }
      
      throw error;
    }
  }

  // Get milestone information
  async getMilestones() {
    try {
      const response = await this.api.get('/escrow/milestones');
      return response.data;
    } catch (error) {
      console.error('Error fetching milestones:', error);
      
      // For development purposes, return mock data when blockchain is not available
      if (process.env.NODE_ENV === 'development') {
        return this.getMockMilestones();
      }
      
      throw error;
    }
  }

  // FOR DEVELOPMENT ONLY: Mock data methods
  getMockCampaignStatus() {
    return {
      endTime: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      raised: '750000',
      goal: '1000000',
      isFinalized: false,
      isSuccessful: false,
      remainingTimeInSeconds: 30 * 24 * 60 * 60 // 30 days in seconds
    };
  }

  getMockInvestorDetails(walletAddress) {
    return {
      amount: '5000',
      refunded: false
    };
  }

  getMockInvestmentResult(amount, walletAddress) {
    return {
      success: true,
      transactionHash: '0x' + Array(64).fill().map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      amount,
      walletAddress,
      timestamp: new Date().toISOString()
    };
  }

  getMockRefundResult(walletAddress) {
    return {
      success: true,
      transactionHash: '0x' + Array(64).fill().map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
      amount: '5000',
      walletAddress,
      timestamp: new Date().toISOString()
    };
  }

  getMockMilestones() {
    return [
      {
        id: 1,
        title: 'Property Acquisition',
        amount: '30%',
        releaseTime: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        isApproved: true,
        isReleased: false
      },
      {
        id: 2,
        title: 'Construction Progress',
        amount: '40%',
        releaseTime: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60,
        isApproved: false,
        isReleased: false
      },
      {
        id: 3,
        title: 'Project Completion',
        amount: '30%',
        releaseTime: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60,
        isApproved: false,
        isReleased: false
      }
    ];
  }
}

// Create and export singleton instance
const escrowService = new EscrowService();
export default escrowService;