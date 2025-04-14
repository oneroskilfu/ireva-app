import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../utils/api';

// Create Authentication Context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load user from token on initial render
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await auth.getUser();
        setUser(response.data.user);
        setError(null);
      } catch (err) {
        console.error('Failed to load user:', err);
        localStorage.removeItem('token');
        setError('Session expired. Please log in again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Register new user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await auth.register(userData);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await auth.login(credentials);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };
  
  // Check if user is investor
  const isInvestor = () => {
    return user?.role === 'investor';
  };
  
  // Check if user is project owner
  const isProjectOwner = () => {
    return user?.role === 'project_owner';
  };
  
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAdmin,
    isInvestor,
    isProjectOwner
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;