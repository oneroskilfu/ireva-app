import { useState, createContext, useContext, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from './use-toast';

// Create Auth Context
const AuthContext = createContext(null);

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Function to check auth status
  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth/check', { withCredentials: true });
      if (response.data.authenticated) {
        setUser(response.data.user);
        return response.data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      return null;
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const response = await axios.post('/api/auth/login', credentials, {
        withCredentials: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      // Invalidate all queries to refetch with new auth status
      queryClient.invalidateQueries();
      toast({
        title: "Login successful",
        description: "Welcome back!",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await axios.post('/api/auth/register', userData, {
        withCredentials: true
      });
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      // Invalidate all queries to refetch with new auth status
      queryClient.invalidateQueries();
      toast({
        title: "Registration successful",
        description: "Welcome to iREVA!",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Could not create account",
        variant: "destructive",
      });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/auth/logout', {}, {
        withCredentials: true
      });
      return response.data;
    },
    onSuccess: () => {
      setUser(null);
      // Clear all queries from cache
      queryClient.clear();
      toast({
        title: "Logout successful",
        description: "You have been logged out",
        variant: "success",
      });
    },
    onError: (error) => {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  });

  // Use query for persistent authentication state
  const { isLoading } = useQuery({
    queryKey: ['auth-status'],
    queryFn: checkAuthStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      loginMutation,
      registerMutation,
      logoutMutation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};