import { get, post, patch } from './api';
import { User } from '@shared/schema';

export interface KycSubmission {
  idType: string;
  idNumber: string;
  addressProofType: string;
  bvn: string;
  nationality: string;
  dateOfBirth: Date;
  documents: any; // File uploads would need a FormData implementation
}

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  occupation?: string;
  bio?: string;
}

/**
 * Service for managing user-related operations
 */
const userService = {
  /**
   * Get the user's profile
   */
  getUserProfile: async (): Promise<User> => {
    const response = await get<User>('/auth/user');
    return response.data;
  },

  /**
   * Update user profile information
   * @param profileData - Profile data to update
   */
  updateProfile: async (profileData: ProfileUpdate): Promise<User> => {
    const response = await patch<User>('/user/profile', profileData);
    return response.data;
  },

  /**
   * Submit KYC verification documents
   * @param kycData - KYC submission data
   */
  submitKyc: async (kycData: KycSubmission): Promise<User> => {
    // For file uploads, we would need to use FormData
    const formData = new FormData();
    
    // Append JSON data as a string
    formData.append('data', JSON.stringify({
      idType: kycData.idType,
      idNumber: kycData.idNumber,
      addressProofType: kycData.addressProofType,
      bvn: kycData.bvn,
      nationality: kycData.nationality,
      dateOfBirth: kycData.dateOfBirth,
    }));
    
    // Append files if they exist
    if (kycData.documents) {
      Object.keys(kycData.documents).forEach(key => {
        formData.append(key, kycData.documents[key]);
      });
    }
    
    const response = await post<User>('/user/kyc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Update user phone number
   * @param phoneNumber - New phone number
   */
  updatePhoneNumber: async (phoneNumber: string): Promise<User> => {
    const response = await patch<User>('/user/phone', { phoneNumber });
    return response.data;
  },

  /**
   * Verify phone number with OTP
   * @param otp - OTP code
   */
  verifyPhone: async (otp: string): Promise<{ success: boolean }> => {
    const response = await post<{ success: boolean }>('/user/verify-phone', { otp });
    return response.data;
  },

  /**
   * Update user accreditation level
   * @param level - Accreditation level
   * @param documents - Supporting documents
   */
  updateAccreditation: async (level: string, documents?: any): Promise<User> => {
    const formData = new FormData();
    formData.append('level', level);
    
    if (documents) {
      Object.keys(documents).forEach(key => {
        formData.append(key, documents[key]);
      });
    }
    
    const response = await post<User>('/user/accreditation', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Get all users (admin only)
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await get<User[]>('/admin/users');
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
   * Update user KYC status (admin only)
   * @param userId - User ID
   * @param status - KYC status
   * @param rejectionReason - Reason for rejection (if applicable)
   */
  updateUserKycStatus: async (
    userId: number, 
    status: string, 
    rejectionReason?: string
  ): Promise<User> => {
    const response = await patch<User>(`/admin/kyc/${userId}/verify`, { 
      status, 
      rejectionReason 
    });
    return response.data;
  },

  /**
   * Update user role (admin only)
   * @param userId - User ID
   * @param role - New role
   */
  updateUserRole: async (userId: number, role: string): Promise<User> => {
    const response = await patch<User>(`/admin/users/${userId}/role`, { role });
    return response.data;
  },
};

export default userService;