import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Safely decodes and parses a JWT token
 * @param {string} token - The JWT token
 * @returns {Object|null} The decoded payload or null if invalid
 */
const parseJwt = (token) => {
  try {
    // Make sure we're working with a properly formatted token
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    // Replace non-base64 characters and properly pad the string
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  
  // Check if token exists
  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Parse user data from token
  const user = parseJwt(token);
  
  // Check if token is valid
  if (!user) {
    console.log('Invalid token format, redirecting to login');
    localStorage.removeItem('token'); // Clear invalid token
    return <Navigate to="/login" />;
  }

  // Check if user has required role
  if (role && user.role !== role) {
    console.log(`Role mismatch: Required ${role}, but user has ${user.role}`);
    return <Navigate to="/unauthorized" />;
  }

  // All checks passed, render the protected component
  return children;
};

export default ProtectedRoute;