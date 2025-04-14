import API from './axios';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phone?: string;
  role: 'user' | 'admin' | 'developer';
  kycVerified?: boolean;
  mfaEnabled?: boolean;
  createdAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

// User login
export const login = async (credentials: LoginCredentials) => {
  const response = await API.post<{user: User, token: string}>('/auth/login', credentials);
  
  // Store token in localStorage
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('authToken', response.data.token);
  }
  
  return response.data;
};

// User registration
export const register = async (userData: RegisterData) => {
  const response = await API.post<{user: User, token: string}>('/auth/register', userData);
  
  // Store token in localStorage if provided
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('authToken', response.data.token);
  }
  
  return response.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
};

// Get current user data
export const getCurrentUser = async () => {
  const response = await API.get<User>('/auth/verify');
  return response.data;
};

// Update user profile
export const updateUserProfile = async (profileData: Partial<User>) => {
  const response = await API.put<User>('/users/profile/me', profileData);
  return response.data;
};

// Change password
export const changePassword = async (passwordData: {
  oldPassword: string;
  newPassword: string;
}) => {
  const response = await API.post('/auth/change-password', passwordData);
  return response.data;
};