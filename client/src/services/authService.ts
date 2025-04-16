import { get, post } from './api';
import { User } from '@shared/schema';
import { jwtDecode } from 'jwt-decode';

interface AuthResponse {
  user: User;
  token: string;
}

interface JwtPayload {
  id: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Service for handling authentication-related requests
 */
const authService = {
  /**
   * Check if user is authenticated based on JWT token
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000; // Convert to seconds
      
      if (decoded.exp < currentTime) {
        // Token has expired
        localStorage.removeItem('auth_token');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('auth_token');
      return false;
    }
  },

  /**
   * Get current user's role
   */
  getUserRole: (): string | null => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.role;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  /**
   * Check if user has a specific role
   */
  hasRole: (role: string | string[]): boolean => {
    const userRole = authService.getUserRole();
    if (!userRole) return false;

    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return userRole === role;
  },

  /**
   * Login with username and password
   */
  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    const response = await post<AuthResponse>('/login', credentials);
    const { token, user } = response.data;
    
    // Store the token
    localStorage.setItem('auth_token', token);
    
    return { token, user };
  },

  /**
   * Register a new user
   */
  register: async (userData: any): Promise<AuthResponse> => {
    const response = await post<AuthResponse>('/register', userData);
    const { token, user } = response.data;
    
    // Store the token
    localStorage.setItem('auth_token', token);
    
    return { token, user };
  },

  /**
   * Get the current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await get<User>('/user');
    return response.data;
  },

  /**
   * Log out the current user
   */
  logout: async (): Promise<void> => {
    await post('/logout');
    localStorage.removeItem('auth_token');
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await post<User>('/user/profile', profileData);
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (passwordData: { 
    currentPassword: string; 
    newPassword: string; 
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await post<{ success: boolean; message: string }>('/user/change-password', passwordData);
    return response.data;
  },

  /**
   * Submit user KYC information
   */
  submitKyc: async (kycData: any): Promise<{ success: boolean; message: string }> => {
    const response = await post<{ success: boolean; message: string }>('/user/kyc', kycData);
    return response.data;
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await post<{ success: boolean; message: string }>('/password-reset/request', { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (resetData: { 
    token: string; 
    password: string; 
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await post<{ success: boolean; message: string }>('/password-reset/confirm', resetData);
    return response.data;
  },
};

export default authService;