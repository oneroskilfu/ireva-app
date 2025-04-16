import { User } from "@shared/schema";

/**
 * Role-based permission utility functions
 */

export type UserRole = "user" | "admin" | "super_admin";

export interface RolePermission {
  role: UserRole;
  permissions: string[];
}

// Define permissions for each role
const rolePermissions: Record<UserRole, string[]> = {
  user: [
    "view_properties",
    "make_investments",
    "view_own_investments",
    "view_own_profile",
    "edit_own_profile",
    "view_educational_resources",
    "participate_in_forum",
    "post_forum_comments",
    "rate_properties",
    "refer_users",
  ],
  admin: [
    // Admin has all user permissions plus these
    "view_properties",
    "make_investments",
    "view_own_investments",
    "view_own_profile",
    "edit_own_profile",
    "view_educational_resources",
    "participate_in_forum",
    "post_forum_comments",
    "rate_properties",
    "refer_users",
    // Admin-specific permissions
    "view_all_users",
    "view_user_details",
    "approve_kyc",
    "reject_kyc",
    "add_properties",
    "edit_properties",
    "delete_properties",
    "view_all_investments",
    "view_investment_details",
    "moderate_forum",
    "add_educational_resources",
    "edit_educational_resources",
    "delete_educational_resources",
  ],
  super_admin: [
    // Super Admin has all permissions
    "view_properties",
    "make_investments",
    "view_own_investments",
    "view_own_profile",
    "edit_own_profile",
    "view_educational_resources",
    "participate_in_forum",
    "post_forum_comments",
    "rate_properties",
    "refer_users",
    // Admin permissions
    "view_all_users",
    "view_user_details",
    "approve_kyc",
    "reject_kyc",
    "add_properties",
    "edit_properties",
    "delete_properties",
    "view_all_investments",
    "view_investment_details",
    "moderate_forum",
    "add_educational_resources",
    "edit_educational_resources",
    "delete_educational_resources",
    // Super Admin specific permissions
    "manage_admins",
    "assign_roles",
    "view_system_settings",
    "edit_system_settings",
    "view_audit_logs",
    "manage_platform_fees",
    "access_analytics_dashboard",
  ],
};

/**
 * Check if a user has the specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user || !user.role) {
    return false;
  }

  // Get permissions for the user's role
  const permissions = rolePermissions[user.role as UserRole] || [];
  
  return permissions.includes(permission);
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user || !user.role) {
    return false;
  }

  // Get permissions for the user's role
  const userPermissions = rolePermissions[user.role as UserRole] || [];
  
  return permissions.every(permission => userPermissions.includes(permission));
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user || !user.role) {
    return false;
  }

  // Get permissions for the user's role
  const userPermissions = rolePermissions[user.role as UserRole] || [];
  
  return permissions.some(permission => userPermissions.includes(permission));
}

/**
 * Check if a user has a specific role
 */
export function hasRole(user: User | null, role: UserRole | UserRole[]): boolean {
  if (!user || !user.role) {
    return false;
  }

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role as UserRole);
}

/**
 * Get all permissions for a given role
 */
export function getPermissionsForRole(role: UserRole): string[] {
  return rolePermissions[role] || [];
}

/**
 * Check if a role includes a given permission
 */
export function roleHasPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
}