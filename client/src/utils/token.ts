import jwtDecode from 'jwt-decode';
import { UserPayload } from '../../shared/types/user-payload';

// Constants
const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Store JWT token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Retrieve JWT token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Decode and parse JWT token
 */
export function parseToken<T = UserPayload>(token: string): T | null {
  try {
    return jwtDecode<T>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Check if the token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    
    if (!decoded.exp) return true;
    
    // Convert exp to milliseconds and compare with current time
    const expiryTime = decoded.exp * 1000;
    return Date.now() >= expiryTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Treat as expired if there's an error
  }
}

/**
 * Check if token needs to be refreshed soon
 * Returns true if token expiry is within the buffer time
 */
export function shouldRefreshToken(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    
    if (!decoded.exp) return true;
    
    // Convert exp to milliseconds and check if it's within buffer time
    const expiryTime = decoded.exp * 1000;
    return Date.now() >= (expiryTime - TOKEN_EXPIRY_BUFFER);
  } catch (error) {
    console.error('Error checking token refresh need:', error);
    return true; // Refresh if there's an error
  }
}

/**
 * Get user data from token
 */
export function getUserFromToken(): UserPayload | null {
  const token = getToken();
  
  if (!token) return null;
  
  try {
    return parseToken<UserPayload>(token);
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

export default {
  setToken,
  getToken,
  removeToken,
  parseToken,
  isTokenExpired,
  shouldRefreshToken,
  getUserFromToken
};