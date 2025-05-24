import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserPayload } from '../../shared/types/user-payload';
import { 
  getUserFromToken, 
  getAuthToken, 
  setAuthToken, 
  removeAuthToken, 
  isTokenExpired,
  shouldRefreshToken,
  decodeToken
} from '../utils/jwt';

// Define extended user type that includes UserPayload fields
export interface User extends Omit<UserPayload, 'userId'> {
  id: string; // This corresponds to UserPayload's userId
  username: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string; // This corresponds to UserPayload's avatarUrl
  kycStatus?: string;
  walletBalance?: string;
  lastLogin?: string;
  createdAt?: string;
}

// Helper to convert UserPayload to User if needed
function userPayloadToUser(payload: UserPayload): Partial<User> {
  return {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
    phoneNumber: payload.phoneNumber,
    isVerified: payload.isVerified,
    profileImage: payload.avatarUrl,
    fullName: payload.fullName
  };
}

// Define AuthContextType
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: Omit<User, 'id' | 'role'> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Listen for auth errors from axios interceptor
  useEffect(() => {
    const handleAuthError = (event: Event) => {
      const customEvent = event as CustomEvent<{ status: number, message: string }>;
      console.log('Auth error event received:', customEvent.detail);
      
      // Clear user state and set error
      setUser(null);
      setIsAuthenticated(false);
      setError(customEvent.detail.message);
      removeAuthToken();
    };
    
    // Add event listener
    window.addEventListener('auth:error', handleAuthError);
    
    // Clean up
    return () => {
      window.removeEventListener('auth:error', handleAuthError);
    };
  }, []);

  // Function to refresh the token
  const refreshToken = async (): Promise<string | null> => {
    try {
      const response = await axios.post('/api/auth/jwt/refresh');
      if (response.status === 200 && response.data?.token) {
        const newToken = response.data.token;
        setAuthToken(newToken);
        return newToken;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return null;
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // First check if we have a valid token
        let token = getAuthToken();
        let jwtPayload = getUserFromToken();
        
        // If token exists but needs refreshing, try to refresh it
        if (token && jwtPayload && !isTokenExpired(token) && shouldRefreshToken(token)) {
          const newToken = await refreshToken();
          if (newToken) {
            token = newToken;
            jwtPayload = decodeToken(newToken);
          }
        }
        
        if (token && jwtPayload && !isTokenExpired(token)) {
          // If token is valid, populate initial user state from it
          const initialUserState = userPayloadToUser(jwtPayload) as User;
          
          // Then fetch complete user details from API
          try {
            // Set Authorization header with token
            const response = await axios.get('/api/auth/jwt/me', {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            
            if (response.status === 200 && response.data?.user) {
              // Merge server data with token data - server now returns UserPayload format
              const userData = response.data.user;
              setUser({
                ...initialUserState,
                // Map UserPayload fields to User fields
                id: userData.userId,
                email: userData.email,
                role: userData.role,
                fullName: userData.fullName,
                isVerified: userData.isVerified,
                profileImage: userData.avatarUrl,
                phoneNumber: userData.phoneNumber
              });
              setIsAuthenticated(true);
            }
          } catch (apiError) {
            // API call failed but token was valid, use data from token
            console.warn('Failed to fetch complete user data, using token data', apiError);
            setUser(initialUserState);
            setIsAuthenticated(true);
          }
        } else {
          // No valid token
          removeAuthToken(); // Clean up any invalid tokens
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUser(null);
        setIsAuthenticated(false);
        removeAuthToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/jwt/login', { username, password });
      
      if (response.status === 200 && response.data) {
        // Store token in localStorage
        const { token, user: userData } = response.data;
        
        if (token) {
          setAuthToken(token);
          
          // Get user data from token
          const jwtPayload = getUserFromToken();
          
          if (jwtPayload) {
            // API now consistently returns UserPayload format
            const user: User = {
              // Map UserPayload fields to User fields
              id: userData.userId,
              username: userData.username || '', // Add additional fields from API response
              email: userData.email,
              role: userData.role,
              fullName: userData.fullName,
              isVerified: userData.isVerified,
              profileImage: userData.avatarUrl,
              phoneNumber: userData.phoneNumber
            };
            
            setUser(user);
            setIsAuthenticated(true);
          } else {
            // Fallback to just API data if token can't be decoded
            setUser({
              ...userData,
              // If API returns UserPayload, map to User
              id: userData.userId || userData.id
            } as User);
            setIsAuthenticated(true);
          }
        } else {
          setError('No authentication token received');
          throw new Error('No authentication token received');
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: Omit<User, 'id' | 'role'> & { password: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/jwt/register', userData);
      
      if (response.status === 201 && response.data) {
        // Similar to login, store token and set user state
        const { token, user: newUserData } = response.data;
        
        if (token) {
          setAuthToken(token);
          
          // Get user data from token
          const jwtPayload = getUserFromToken();
          
          if (jwtPayload) {
            // API now consistently returns UserPayload format
            const user: User = {
              // Map UserPayload fields to User fields
              id: newUserData.userId,
              username: newUserData.username || '', // Add additional fields from API response
              email: newUserData.email,
              role: newUserData.role,
              fullName: newUserData.fullName,
              isVerified: newUserData.isVerified,
              profileImage: newUserData.avatarUrl,
              phoneNumber: newUserData.phoneNumber
            };
            
            setUser(user);
            setIsAuthenticated(true);
          } else {
            // Fallback to just API data if token can't be decoded
            setUser({
              ...newUserData,
              // If API returns UserPayload, map to User
              id: newUserData.userId || newUserData.id
            } as User);
            setIsAuthenticated(true);
          }
        } else {
          setError('No authentication token received');
          throw new Error('No authentication token received');
        }
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint but don't depend on its success
      try {
        await axios.post('/api/auth/jwt/logout');
      } catch (logoutError) {
        console.warn('Logout endpoint error:', logoutError);
        // Continue with local logout even if server logout fails
      }
      
      // Always remove token and reset state
      removeAuthToken();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error: any) {
      console.error('Logout failed:', error);
      setError(error.response?.data?.message || 'Logout failed. Please try again.');
      
      // Still try to remove token on error
      removeAuthToken();
    } finally {
      setIsLoading(false);
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.patch(`/api/users/${user?.id}`, userData);
      
      if (response.status === 200 && response.data) {
        setUser(response.data);
      }
    } catch (error: any) {
      console.error('User update failed:', error);
      setError(error.response?.data?.message || 'Update failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Create the value object that will be provided by the context
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Error boundary component for catching React errors
export class AuthErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Auth Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-container">
          <h2>Something went wrong in the authentication system.</h2>
          <details>
            <summary>View error details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="reset-button"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}