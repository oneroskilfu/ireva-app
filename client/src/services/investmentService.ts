import { get, post, patch } from './api';
import { Investment } from '@shared/schema';

/**
 * Service for managing investments
 */
const investmentService = {
  /**
   * Get all user investments
   */
  getUserInvestments: async (): Promise<Investment[]> => {
    const response = await get<Investment[]>('/user/investments');
    return response.data;
  },

  /**
   * Get investment details
   * @param id - Investment ID
   */
  getInvestmentById: async (id: number): Promise<Investment> => {
    const response = await get<Investment>(`/investments/${id}`);
    return response.data;
  },

  /**
   * Create a new investment
   * @param investmentData - Investment data
   */
  createInvestment: async (investmentData: {
    propertyId: number;
    amount: number;
    paymentMethod: string;
  }): Promise<Investment> => {
    const response = await post<Investment>('/investments', investmentData);
    return response.data;
  },

  /**
   * Get investment performance
   * @param id - Investment ID
   */
  getInvestmentPerformance: async (id: number): Promise<{
    investment: Investment;
    performance: {
      monthlyReturns: any[];
      totalEarnings: number;
      roi: number;
      projectedReturns: number;
    };
  }> => {
    const response = await get<{
      investment: Investment;
      performance: {
        monthlyReturns: any[];
        totalEarnings: number;
        roi: number;
        projectedReturns: number;
      };
    }>(`/investments/${id}/performance`);
    return response.data;
  },

  /**
   * Get all investments (admin only)
   */
  getAllInvestments: async (): Promise<Investment[]> => {
    const response = await get<Investment[]>('/admin/investments');
    return response.data;
  },

  /**
   * Update investment status (admin only)
   * @param id - Investment ID
   * @param status - New status
   */
  updateInvestmentStatus: async (
    id: number,
    status: string
  ): Promise<Investment> => {
    const response = await patch<Investment>(`/admin/investments/${id}/status`, {
      status,
    });
    return response.data;
  },

  /**
   * Update investment returns (admin only)
   * @param id - Investment ID
   * @param returnsData - Returns data
   */
  updateInvestmentReturns: async (
    id: number,
    returnsData: {
      earnings: number;
      monthlyReturns: any;
    }
  ): Promise<Investment> => {
    const response = await patch<Investment>(
      `/admin/investments/${id}/returns`,
      returnsData
    );
    return response.data;
  },

  /**
   * Get property investments (admin only)
   * @param propertyId - Property ID
   */
  getPropertyInvestments: async (propertyId: number): Promise<Investment[]> => {
    const response = await get<Investment[]>(
      `/admin/properties/${propertyId}/investments`
    );
    return response.data;
  },

  /**
   * Get investment statistics
   */
  getInvestmentStatistics: async (): Promise<{
    totalInvested: number;
    activeInvestments: number;
    totalReturns: number;
    averageRoi: number;
  }> => {
    const response = await get<{
      totalInvested: number;
      activeInvestments: number;
      totalReturns: number;
      averageRoi: number;
    }>('/user/investments/statistics');
    return response.data;
  },

  /**
   * Get ROI summary by property (admin only)
   */
  getRoiSummary: async (): Promise<any[]> => {
    const response = await get<any[]>('/admin/roi/summary');
    return response.data;
  },
};

export default investmentService;