import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'investor' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a stored user and token
        const storedUser = apiClient.getUser();
        const hasToken = apiClient.isAuthenticated();

        if (storedUser && hasToken) {
          // Verify token is still valid by fetching fresh user data
          const freshUser = await apiClient.getUserProfile();
          setUser(freshUser);
        } else {
          // Clear any stale data
          apiClient.logout();
        }
      } catch (error) {
        // Token is invalid or expired
        console.log('Auth initialization failed:', error);
        apiClient.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login({ email, password });
    setUser(response.user);
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const freshUser = await apiClient.getUserProfile();
      setUser(freshUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}