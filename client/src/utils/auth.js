/**
 * Auth utilities for the REVA crowdfunding platform
 */

/**
 * Get token from local storage
 * @returns {string|null} The token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Set token in local storage
 * @param {string} token - The JWT token to store
 */
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

/**
 * Decode JWT token to get payload
 * @param {string} token - The JWT token to decode
 * @returns {Object|null} The decoded payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Handle user logout
 * Removes the token from localStorage and refreshes the page
 */
export const handleLogout = () => {
  localStorage.removeItem('token');
  window.location.reload();
};

/**
 * Logout user and clear token
 */
export const logout = () => {
  localStorage.removeItem('token');
  window.location.reload();
};

/**
 * Get the current user from the stored token
 * @returns {Object|null} The user object or null if no token exists
 */
export const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = decodeToken(token);
    if (!payload) return null;
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem('token');
      return null;
    }
    return payload;
  } catch (error) {
    console.error('Invalid token', error);
    localStorage.removeItem('token');
    return null;
  }
};

/**
 * Check if user has a specific role
 * @param {string} role - The role to check
 * @returns {boolean} True if user has the role, false otherwise
 */
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user?.role === role;
};

/**
 * Check if user is an admin
 * @returns {boolean} True if user is admin, false otherwise
 */
export const isAdmin = () => hasRole('admin');

/**
 * Check if user is an investor
 * @returns {boolean} True if user is investor, false otherwise
 */
export const isInvestor = () => hasRole('investor');

/**
 * Check if user is a project owner
 * @returns {boolean} True if user is project owner, false otherwise
 */
export const isProjectOwner = () => hasRole('project_owner');