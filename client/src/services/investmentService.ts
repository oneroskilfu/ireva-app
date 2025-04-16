import { get, post, patch } from './api';
import { Investment } from '@shared/schema';

export interface NewInvestment {
  propertyId: number;
  amount: number;
  paymentMethod: string;
}

export interface InvestmentStats {
  totalInvested: number;
  totalEarnings: number;
  activeInvestments: number;
  nextPayout: number;
  portfolioGrowth: number;
}

/**
 * Service for managing investment data
 */
const investmentService = {
  /**
   * Get all investments for the current user
   */
  getUserInvestments: async (): Promise<Investment[]> => {
    const response = await get<Investment[]>('/investments/user');
    return response.data;
  },

  /**
   * Get a single investment by ID
   * @param id - Investment ID
   */
  getInvestment: async (id: number): Promise<Investment> => {
    const response = await get<Investment>(`/investments/${id}`);
    return response.data;
  },

  /**
   * Create a new investment
   * @param investment - Investment data
   */
  createInvestment: async (investment: NewInvestment): Promise<Investment> => {
    const response = await post<Investment>('/investments', investment);
    return response.data;
  },

  /**
   * Get investments by property ID
   * @param propertyId - Property ID
   */
  getInvestmentsByProperty: async (propertyId: number): Promise<Investment[]> => {
    const response = await get<Investment[]>(`/investments/property/${propertyId}`);
    return response.data;
  },

  /**
   * Get investment statistics for the current user
   */
  getInvestmentStats: async (): Promise<InvestmentStats> => {
    const response = await get<InvestmentStats>('/investor/dashboard');
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
  updateInvestmentStatus: async (id: number, status: string): Promise<Investment> => {
    const response = await patch<Investment>(`/admin/investments/${id}/status`, { status });
    return response.data;
  },

  /**
   * Update investment returns (admin only)
   * @param id - Investment ID
   * @param earnings - Current earnings
   * @param monthlyReturns - Monthly returns data
   */
  updateInvestmentReturns: async (
    id: number, 
    earnings: number, 
    monthlyReturns: any
  ): Promise<Investment> => {
    const response = await patch<Investment>(
      `/admin/investments/${id}/returns`, 
      { earnings, monthlyReturns }
    );
    return response.data;
  },

  /**
   * Get dashboard stats for admin
   */
  getAdminDashboardStats: async (): Promise<any> => {
    const response = await get<any>('/admin/dashboard/stats');
    return response.data;
  },
};

export default investmentService;