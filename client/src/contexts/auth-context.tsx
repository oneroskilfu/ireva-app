import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface DecodedToken {
  id: number;
  role?: string;
  username?: string;
  exp?: number;
  iat?: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  role: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (newToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  role: '',
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  logout: () => {}
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token') || localStorage.getItem('authToken') || null
  );
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('');
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (token) {
      try {
        // Decode the JWT token to get user information
        const decoded = jwtDecode<DecodedToken>(token);
        
        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.log('Token expired, logging out');
          handleLogout();
          return;
        }

        // Set the role from the token
        const userRole = decoded.role || '';
        setRole(userRole);
        
        // Create a user object from the decoded token
        setUser({
          id: decoded.id,
          username: decoded.username || '',
          role: userRole,
          // You can add other user properties here if they're in the token
        });
      } catch (error) {
        console.error('Failed to decode token:', error);
        handleLogout();
      }
    } else {
      setUser(null);
      setRole('');
    }
  }, [token]);

  const handleLogin = (newToken: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('authToken', newToken); // For backwards compatibility
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setRole('');
    setLocation('/login');
  };

  const value = {
    token,
    user,
    role,
    isAuthenticated: !!token,
    isAdmin: role === 'admin',
    login: handleLogin,
    logout: handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;