import { UserPayload, userPayloadSchema } from '../../shared/types/user-payload';

/**
 * JWT utility functions for handling tokens on the client side
 */

interface JwtPayload extends UserPayload {
  iat?: number;
  exp?: number;
}

/**
 * Decode JWT token without verification (client-side only)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    // This is a simple decoder that doesn't verify the token signature
    // The actual verification happens on the server
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);

    // Validate payload structure
    try {
      userPayloadSchema.parse(decoded);
      return decoded as JwtPayload;
    } catch (error) {
      console.error('Token payload validation failed:', error);
      return null;
    }
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  
  // Consider token expired 5 minutes before actual expiration
  // to avoid edge cases where token expires during a request
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return Date.now() >= (expirationTime - bufferTime);
}

/**
 * Check if token should be refreshed (nearing expiration)
 */
export function shouldRefreshToken(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  
  // Refresh token if it's going to expire in less than 15 minutes
  const refreshThreshold = 15 * 60 * 1000; // 15 minutes in milliseconds
  return Date.now() >= (expirationTime - refreshThreshold);
}

/**
 * Get stored auth token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * Store auth token in localStorage
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * Get current user from token
 */
export function getUserFromToken(): UserPayload | null {
  const token = getAuthToken();
  if (!token || isTokenExpired(token)) return null;
  
  const payload = decodeToken(token);
  return payload;
}