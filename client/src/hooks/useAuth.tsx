import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserPayload } from '../../shared/types/user-payload';
import { getToken, setToken, removeToken, parseToken } from '../utils/token';

// Extended User type with additional fields that might be used in the UI
interface User extends UserPayload {
  username?: string;
  profileImage?: string;
  fullName?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Auth provider component that manages authentication state
 */
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing auth on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getToken();
        
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        // Try to parse the token
        const payload = parseToken<UserPayload>(token);
        
        if (!payload) {
          // Token is invalid
          removeToken();
          setIsLoading(false);
          return;
        }
        
        // Fetch current user data
        const response = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.status === 200 && response.data.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Clear invalid token
        removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/login', { email, password });
      
      if (response.status === 200 && response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/register', userData);
      
      if (response.status === 201 && response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout API call failed:', err);
      // Continue with local logout regardless of API success
    } finally {
      // Always clear local auth state
      removeToken();
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };
  
  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.patch('/api/users/profile', data);
      
      if (response.status === 200 && response.data.user) {
        setUser(prev => prev ? { ...prev, ...response.data.user } : response.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create the context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    updateProfile
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook for accessing authentication context
 * 
 * Example usage:
 * ```jsx
 * const { user, login, logout } = useAuth();
 * 
 * if (user) {
 *   return <p>Welcome, {user.email}!</p>;
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default useAuth;