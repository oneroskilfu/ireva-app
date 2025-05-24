import { User } from '@shared/schema';

/**
 * Role-based guard functions for consistent access control
 */

/**
 * Check if user is authenticated
 * @param user - The user object or null
 * @returns Boolean indicating if the user is authenticated
 */
export const isAuthenticated = (user: User | null): boolean => {
  return !!user;
};

/**
 * Check if user has admin role
 * @param user - The user object or null
 * @returns Boolean indicating if the user has admin role
 */
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'super_admin';
};

/**
 * Check if user is super admin
 * @param user - The user object or null
 * @returns Boolean indicating if the user is a super admin
 */
export const isSuperAdmin = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'super_admin';
};

/**
 * Check if user has regular user role
 * @param user - The user object or null
 * @returns Boolean indicating if the user has regular user role
 */
export const isRegularUser = (user: User | null): boolean => {
  if (!user) return false;
  return user.role === 'user';
};

/**
 * Check if user has any of the given roles
 * @param user - The user object or null
 * @param roles - Array of roles to check
 * @returns Boolean indicating if the user has any of the specified roles
 */
export const hasRole = (user: User | null, roles: string[]): boolean => {
  if (!user || !user.role) return false;
  return roles.includes(user.role);
};

/**
 * Check if user has completed KYC verification
 * @param user - The user object or null
 * @returns Boolean indicating if the user has completed KYC
 */
export const hasCompletedKyc = (user: User | null): boolean => {
  if (!user) return false;
  return user.kycStatus === 'verified';
};

/**
 * Check if user is KYC verified and has an active account
 * @param user - The user object or null
 * @returns Boolean indicating if the user is fully verified
 */
export const isVerifiedActiveUser = (user: User | null): boolean => {
  if (!user) return false;
  return user.kycStatus === 'verified';
};

/**
 * Check if user can access investor features
 * @param user - The user object or null
 * @returns Boolean indicating if the user can access investor features
 */
export const canAccessInvestorFeatures = (user: User | null): boolean => {
  if (!user) return false;
  // Admins can also access investor features for testing/support
  return (user.role === 'user' || isAdmin(user));
};

/**
 * Check if user has the required accreditation level
 * @param user - The user object or null
 * @param requiredLevel - Required accreditation level
 * @returns Boolean indicating if the user has the required accreditation
 */
export const hasAccreditationLevel = (
  user: User | null, 
  requiredLevel: string
): boolean => {
  if (!user) return false;
  
  // Admins bypass accreditation checks
  if (isAdmin(user)) return true;
  
  // Check user's accreditation level
  if (!user.accreditationLevel) return false;
  
  // Map accreditation levels to numerical values for comparison
  const levelValues: Record<string, number> = {
    'none': 0,
    'basic': 1,
    'intermediate': 2,
    'advanced': 3
  };
  
  const userLevel = levelValues[user.accreditationLevel] || 0;
  const required = levelValues[requiredLevel] || 0;
  
  return userLevel >= required;
};

/**
 * Check if a property is accessible to the user based on accreditation
 * @param user - The user object or null
 * @param property - The property object
 * @returns Boolean indicating if the property is accessible to the user
 */
export const canAccessProperty = (user: User | null, property: any): boolean => {
  if (!user) return false;
  
  // Admins can access all properties
  if (isAdmin(user)) return true;
  
  // If property requires accreditation
  if (property.accreditedOnly) {
    return hasAccreditationLevel(user, property.requiredAccreditation || 'basic');
  }
  
  // Regular properties accessible to all users
  return true;
};