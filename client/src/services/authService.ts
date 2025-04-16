import { get, post } from './api';
import { User } from '@shared/schema';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Authentication service for managing user authentication
 */
const authService = {
  /**
   * Authenticate user and get token
   * @param credentials - Login credentials
   * @returns Authentication response with token and user data
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  /**
   * Register a new user
   * @param data - User registration data
   * @returns Authentication response with token and user data
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  /**
   * Get current user information
   * @returns User data
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await get<User>('/auth/user');
    return response.data;
  },

  /**
   * Log out the current user
   */
  logout: async (): Promise<void> => {
    await post('/auth/logout');
    localStorage.removeItem('auth_token');
  },

  /**
   * Check if user is authenticated
   * @returns True if user has a token
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};

export default authService;