// Authentication utility functions

/**
 * Get the current authenticated user from localStorage
 * @returns {Object|null} User object or null if not authenticated
 */
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Get user's role from localStorage
 * @returns {string} User role ('admin', 'investor', etc.) or empty string if not found
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || '';
};

/**
 * Check if user is authenticated (has a valid token)
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  // Check if token is expired (if it has an expiration)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      const expirationTime = payload.exp * 1000;
      if (Date.now() >= expirationTime) {
        // Token expired, remove it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Log out the current user
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};