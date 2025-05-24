import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '@shared/schema';
import authService from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

// Define the context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          await checkAuth();
        } catch (err) {
          console.error('Initial auth check failed:', err);
          // Continue without setting an error to avoid showing error on initial load
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await authService.login({ username, password });
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.firstName || user.username}!`,
      });
    } catch (err: any) {
      setError(new Error(err.response?.data?.message || 'Login failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await authService.register(userData);
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: 'Registration successful',
        description: `Welcome to iREVA, ${user.firstName || user.username}!`,
      });
    } catch (err: any) {
      setError(new Error(err.response?.data?.message || 'Registration failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      queryClient.clear(); // Clear all queries when logging out
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (err: any) {
      console.error('Logout error:', err);
      // Still clear user even if API call fails
      setUser(null);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status
  const checkAuth = async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      queryClient.setQueryData(['user'], userData);
    } catch (err: any) {
      console.error('Auth check error:', err);
      setUser(null);
      localStorage.removeItem('auth_token');
      throw err;
    }
  };

  // Clear any auth errors
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};