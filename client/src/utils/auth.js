// src/utils/auth.js
/**
 * Get JWT token from localStorage
 * For compatibility with existing code, this checks for both 'token' and 'authToken'
 */
export const getToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('authToken');
};

/**
 * Set JWT token in localStorage
 * Stores in both 'token' and 'authToken' for compatibility
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
  localStorage.setItem('authToken', token);
};

/**
 * Remove JWT token from localStorage
 * Clears both 'token' and 'authToken'
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Add token to API requests
 */
export const configureAxiosAuth = (axios) => {
  axios.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

/**
 * Decode JWT token payload
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get user info from token
 */
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  return decodeToken(token);
};