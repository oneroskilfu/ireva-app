import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in by using local storage token
    const token = localStorage.getItem('adminToken');
    if (token) {
      const userData = JSON.parse(localStorage.getItem('adminUser') || '{}');
      setCurrentUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await api.post('/api/admin/login', { email, password });
      const { token, ...userData } = response.data;
      
      // Store token and user data in local storage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(userData));
      
      // Set token in axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(userData);
      navigate('/');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to login';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setCurrentUser(null);
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}