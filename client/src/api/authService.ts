import API from './axios';

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

export interface AuthResponse {
  token: string;
  user?: {
    id: number;
    username: string;
    role: string;
    email?: string;
    fullName?: string;
  };
}

// User login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// User registration
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await API.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
};

// Get current user data
export const getCurrentUser = async () => {
  try {
    const response = await API.get('/auth/verify');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData: any) => {
  try {
    const response = await API.put('/users/profile/me', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData: { currentPassword: string; newPassword: string }) => {
  try {
    const response = await API.post('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};