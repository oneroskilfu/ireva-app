import { get, post, patch } from './api';
import { User } from '@shared/schema';

/**
 * Service for managing users
 */
const userService = {
  /**
   * Get all users (admin only)
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await get<User[]>('/admin/users');
    return response.data;
  },

  /**
   * Get user by ID (admin only)
   * @param id - User ID
   */
  getUserById: async (id: number): Promise<User> => {
    const response = await get<User>(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Get users by KYC status (admin only)
   * @param status - KYC status
   */
  getUsersByKycStatus: async (status: string): Promise<User[]> => {
    const response = await get<User[]>(`/admin/kyc/${status}`);
    return response.data;
  },

  /**
   * Update user role (admin only)
   * @param id - User ID
   * @param role - New role
   */
  updateUserRole: async (id: number, role: string): Promise<User> => {
    const response = await patch<User>(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  /**
   * Verify user KYC (admin only)
   * @param userId - User ID
   * @param verified - Verification status
   * @param rejectionReason - Optional reason for rejection
   */
  verifyUserKyc: async (
    userId: number,
    verified: boolean,
    rejectionReason?: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await patch<{ success: boolean; message: string }>(
      `/admin/kyc/${userId}/verify`,
      {
        verified,
        rejectionReason,
      }
    );
    return response.data;
  },

  /**
   * Update user profile
   * @param profileData - Profile data
   */
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await patch<User>('/user/profile', profileData);
    return response.data;
  },

  /**
   * Update user phone number
   * @param phoneNumber - New phone number
   */
  updatePhoneNumber: async (phoneNumber: string): Promise<{ success: boolean; message: string }> => {
    const response = await patch<{ success: boolean; message: string }>(
      '/user/phone',
      { phoneNumber }
    );
    return response.data;
  },

  /**
   * Verify phone number with OTP
   * @param otp - One-time password
   */
  verifyPhoneOtp: async (otp: string): Promise<{ success: boolean; message: string }> => {
    const response = await post<{ success: boolean; message: string }>(
      '/user/phone/verify',
      { otp }
    );
    return response.data;
  },

  /**
   * Update user accreditation level
   * @param level - Accreditation level
   * @param documents - Supporting documents
   */
  updateAccreditation: async (
    level: string,
    documents?: any
  ): Promise<{ success: boolean; message: string }> => {
    const response = await patch<{ success: boolean; message: string }>(
      '/user/accreditation',
      { level, documents }
    );
    return response.data;
  },

  /**
   * Get user achievements
   */
  getUserAchievements: async (): Promise<any[]> => {
    const response = await get<any[]>('/user/achievements');
    return response.data;
  },

  /**
   * Get user referral info
   */
  getReferralInfo: async (): Promise<{
    referralCode: string;
    referrals: any[];
    totalRewards: number;
  }> => {
    const response = await get<{
      referralCode: string;
      referrals: any[];
      totalRewards: number;
    }>('/user/referrals');
    return response.data;
  },

  /**
   * Submit a referral code
   * @param referralCode - Referral code
   */
  submitReferralCode: async (
    referralCode: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await post<{ success: boolean; message: string }>(
      '/user/referrals/submit',
      { referralCode }
    );
    return response.data;
  },

  /**
   * Get user dashboard statistics
   */
  getDashboardStats: async (): Promise<{
    totalInvested: number;
    portfolioValue: number;
    totalEarnings: number;
    activeInvestments: number;
    propertyCount: number;
    recentActivities: any[];
  }> => {
    const response = await get<{
      totalInvested: number;
      portfolioValue: number;
      totalEarnings: number;
      activeInvestments: number;
      propertyCount: number;
      recentActivities: any[];
    }>('/user/dashboard/stats');
    return response.data;
  },

  /**
   * Get admin dashboard statistics (admin only)
   */
  getAdminDashboardStats: async (): Promise<{
    totalUsers: number;
    totalInvestments: number;
    totalProperties: number;
    pendingKyc: number;
    totalInvestmentValue: number;
    recentActivities: any[];
  }> => {
    const response = await get<{
      totalUsers: number;
      totalInvestments: number;
      totalProperties: number;
      pendingKyc: number;
      totalInvestmentValue: number;
      recentActivities: any[];
    }>('/admin/dashboard/stats');
    return response.data;
  },
};

export default userService;