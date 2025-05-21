/**
 * Tenant Service
 * 
 * Manages multi-tenant operations including tenant creation, user management,
 * and tenant-specific data access. Implements data isolation across tenants.
 */

const { db } = require('../db');
const { eq, and, or, sql } = require('drizzle-orm');
const { tenants, tenantUsers, tenantProperties, tenantInvitations } = require('../../shared/schema-tenants');
const crypto = require('crypto');
const { NotificationService } = require('./notifications/NotificationService');

class TenantService {
  /**
   * Create a new tenant
   * 
   * @param {object} tenantData - Tenant data including name, slug, etc.
   * @param {number} creatorUserId - The user ID of the tenant creator
   * @returns {Promise<object>} The created tenant
   */
  static async createTenant(tenantData, creatorUserId) {
    try {
      // Begin transaction
      return await db.transaction(async (tx) => {
        // Insert tenant record
        const [tenant] = await tx
          .insert(tenants)
          .values({
            ...tenantData,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        // Add creator as tenant admin
        await tx
          .insert(tenantUsers)
          .values({
            tenantId: tenant.id,
            userId: creatorUserId,
            role: 'admin',
            isDefault: true,
            createdAt: new Date(),
          });

        return tenant;
      });
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  /**
   * Get tenant by ID
   * 
   * @param {number} tenantId - The tenant ID
   * @returns {Promise<object|null>} Tenant object or null if not found
   */
  static async getTenantById(tenantId) {
    try {
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, tenantId));

      return tenant || null;
    } catch (error) {
      console.error(`Error getting tenant with ID ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get tenant by slug
   * 
   * @param {string} slug - The tenant slug
   * @returns {Promise<object|null>} Tenant object or null if not found
   */
  static async getTenantBySlug(slug) {
    try {
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.slug, slug));

      return tenant || null;
    } catch (error) {
      console.error(`Error getting tenant with slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Get tenant by domain
   * 
   * @param {string} domain - The tenant domain
   * @returns {Promise<object|null>} Tenant object or null if not found
   */
  static async getTenantByDomain(domain) {
    try {
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.domain, domain));

      return tenant || null;
    } catch (error) {
      console.error(`Error getting tenant with domain ${domain}:`, error);
      throw error;
    }
  }

  /**
   * Update tenant
   * 
   * @param {number} tenantId - The tenant ID
   * @param {object} tenantData - Updated tenant data
   * @returns {Promise<object>} Updated tenant
   */
  static async updateTenant(tenantId, tenantData) {
    try {
      const [tenant] = await db
        .update(tenants)
        .set({
          ...tenantData,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId))
        .returning();

      return tenant;
    } catch (error) {
      console.error(`Error updating tenant with ID ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Delete tenant
   * 
   * @param {number} tenantId - The tenant ID
   * @returns {Promise<boolean>} Success status
   */
  static async deleteTenant(tenantId) {
    try {
      // Note: This will cascade to tenant_users, tenant_properties, etc.
      const result = await db
        .delete(tenants)
        .where(eq(tenants.id, tenantId));

      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error deleting tenant with ID ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Add user to tenant
   * 
   * @param {number} tenantId - The tenant ID
   * @param {number} userId - The user ID
   * @param {string} role - User role in the tenant
   * @param {boolean} isDefault - Whether this is the user's default tenant
   * @returns {Promise<object>} The tenant user relationship
   */
  static async addUserToTenant(tenantId, userId, role = 'user', isDefault = false) {
    try {
      // Check if user is already in the tenant
      const existingUser = await this.getTenantUser(tenantId, userId);
      if (existingUser) {
        throw new Error('User already belongs to this tenant');
      }

      // If this is set as default, unset any existing defaults
      if (isDefault) {
        await db
          .update(tenantUsers)
          .set({ isDefault: false })
          .where(eq(tenantUsers.userId, userId));
      }

      // Add user to tenant
      const [tenantUser] = await db
        .insert(tenantUsers)
        .values({
          tenantId,
          userId,
          role,
          isDefault,
          createdAt: new Date(),
        })
        .returning();

      return tenantUser;
    } catch (error) {
      console.error(`Error adding user ${userId} to tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Update tenant user
   * 
   * @param {number} tenantId - The tenant ID
   * @param {number} userId - The user ID
   * @param {object} updateData - Data to update (role, isDefault, permissions)
   * @returns {Promise<object>} Updated tenant user
   */
  static async updateTenantUser(tenantId, userId, updateData) {
    try {
      // If this is set as default, unset any existing defaults
      if (updateData.isDefault) {
        await db
          .update(tenantUsers)
          .set({ isDefault: false })
          .where(eq(tenantUsers.userId, userId));
      }

      const [tenantUser] = await db
        .update(tenantUsers)
        .set(updateData)
        .where(
          and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.userId, userId)
          )
        )
        .returning();

      return tenantUser;
    } catch (error) {
      console.error(`Error updating user ${userId} in tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Remove user from tenant
   * 
   * @param {number} tenantId - The tenant ID
   * @param {number} userId - The user ID
   * @returns {Promise<boolean>} Success status
   */
  static async removeUserFromTenant(tenantId, userId) {
    try {
      const result = await db
        .delete(tenantUsers)
        .where(
          and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.userId, userId)
          )
        );

      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error removing user ${userId} from tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get tenant user relationship
   * 
   * @param {number} tenantId - The tenant ID
   * @param {number} userId - The user ID
   * @returns {Promise<object|null>} Tenant user or null if not found
   */
  static async getTenantUser(tenantId, userId) {
    try {
      const [tenantUser] = await db
        .select()
        .from(tenantUsers)
        .where(
          and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.userId, userId)
          )
        );

      return tenantUser || null;
    } catch (error) {
      console.error(`Error getting tenant user for tenant ${tenantId} and user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's tenants
   * 
   * @param {number} userId - The user ID
   * @returns {Promise<array>} List of tenants the user belongs to
   */
  static async getUserTenants(userId) {
    try {
      const userTenants = await db
        .select({
          tenant: tenants,
          role: tenantUsers.role,
          isDefault: tenantUsers.isDefault,
          permissions: tenantUsers.permissions,
        })
        .from(tenantUsers)
        .innerJoin(tenants, eq(tenantUsers.tenantId, tenants.id))
        .where(eq(tenantUsers.userId, userId));

      return userTenants;
    } catch (error) {
      console.error(`Error getting tenants for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user's default tenant
   * 
   * @param {number} userId - The user ID
   * @returns {Promise<object|null>} Default tenant or null if not found
   */
  static async getUserDefaultTenant(userId) {
    try {
      const [userTenant] = await db
        .select({
          tenant: tenants,
          role: tenantUsers.role,
          permissions: tenantUsers.permissions,
        })
        .from(tenantUsers)
        .innerJoin(tenants, eq(tenantUsers.tenantId, tenants.id))
        .where(
          and(
            eq(tenantUsers.userId, userId),
            eq(tenantUsers.isDefault, true)
          )
        );

      return userTenant || null;
    } catch (error) {
      console.error(`Error getting default tenant for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Set user's default tenant
   * 
   * @param {number} userId - The user ID
   * @param {number} tenantId - The tenant ID to set as default
   * @returns {Promise<boolean>} Success status
   */
  static async setUserDefaultTenant(userId, tenantId) {
    try {
      // Clear any existing defaults
      await db
        .update(tenantUsers)
        .set({ isDefault: false })
        .where(eq(tenantUsers.userId, userId));

      // Set new default
      const result = await db
        .update(tenantUsers)
        .set({ isDefault: true })
        .where(
          and(
            eq(tenantUsers.userId, userId),
            eq(tenantUsers.tenantId, tenantId)
          )
        );

      return result.rowCount > 0;
    } catch (error) {
      console.error(`Error setting default tenant ${tenantId} for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get users in a tenant
   * 
   * @param {number} tenantId - The tenant ID
   * @param {object} options - Query options (pagination, filters)
   * @returns {Promise<array>} List of users in the tenant
   */
  static async getTenantUsers(tenantId, options = {}) {
    try {
      const { page = 1, limit = 100, role } = options;
      const offset = (page - 1) * limit;

      // Build base query
      let query = db
        .select({
          userId: tenantUsers.userId,
          role: tenantUsers.role,
          permissions: tenantUsers.permissions,
          // Include user fields as needed from the users table
        })
        .from(tenantUsers)
        .where(eq(tenantUsers.tenantId, tenantId));

      // Add role filter if provided
      if (role) {
        query = query.where(eq(tenantUsers.role, role));
      }

      // Add pagination
      query = query.limit(limit).offset(offset);

      // Execute query
      const tenantUsersList = await query;

      // Get total count
      const [{ count }] = await db
        .select({ count: sql`COUNT(*)` })
        .from(tenantUsers)
        .where(eq(tenantUsers.tenantId, tenantId));

      return {
        users: tenantUsersList,
        pagination: {
          total: Number(count),
          pages: Math.ceil(Number(count) / limit),
          page,
          limit
        }
      };
    } catch (error) {
      console.error(`Error getting users for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Create tenant invitation
   * 
   * @param {number} tenantId - The tenant ID
   * @param {string} email - Invitee email
   * @param {string} role - Role to assign
   * @param {number} createdBy - User ID who created the invitation
   * @returns {Promise<object>} Created invitation
   */
  static async createInvitation(tenantId, email, role, createdBy) {
    try {
      // Generate a unique token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Set expiration (48 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      // Create invitation
      const [invitation] = await db
        .insert(tenantInvitations)
        .values({
          tenantId,
          email,
          role,
          token,
          expiresAt,
          createdBy,
          createdAt: new Date(),
        })
        .returning();

      // Get tenant info for notification
      const tenant = await this.getTenantById(tenantId);

      // Send invitation notification
      // In a real implementation, you'd send an email here
      // For now, log it
      console.log(`Invitation sent to ${email} for tenant ${tenant.name} with token ${token}`);

      return invitation;
    } catch (error) {
      console.error(`Error creating invitation for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get tenant invitation by token
   * 
   * @param {string} token - Invitation token
   * @returns {Promise<object|null>} Invitation or null if not found
   */
  static async getInvitationByToken(token) {
    try {
      const [invitation] = await db
        .select()
        .from(tenantInvitations)
        .where(eq(tenantInvitations.token, token));

      return invitation || null;
    } catch (error) {
      console.error(`Error getting invitation with token ${token}:`, error);
      throw error;
    }
  }

  /**
   * Accept tenant invitation
   * 
   * @param {string} token - Invitation token
   * @param {number} userId - User ID accepting the invitation
   * @returns {Promise<object>} Tenant user relationship
   */
  static async acceptInvitation(token, userId) {
    try {
      // Begin transaction
      return await db.transaction(async (tx) => {
        // Get invitation
        const [invitation] = await tx
          .select()
          .from(tenantInvitations)
          .where(eq(tenantInvitations.token, token));

        if (!invitation) {
          throw new Error('Invitation not found');
        }

        if (invitation.acceptedAt) {
          throw new Error('Invitation already accepted');
        }

        const now = new Date();
        if (invitation.expiresAt < now) {
          throw new Error('Invitation has expired');
        }

        // Add user to tenant
        const [tenantUser] = await tx
          .insert(tenantUsers)
          .values({
            tenantId: invitation.tenantId,
            userId,
            role: invitation.role,
            isDefault: false, // Don't automatically set as default
            createdAt: now,
          })
          .returning();

        // Mark invitation as accepted
        await tx
          .update(tenantInvitations)
          .set({ acceptedAt: now })
          .where(eq(tenantInvitations.id, invitation.id));

        return tenantUser;
      });
    } catch (error) {
      console.error(`Error accepting invitation with token ${token}:`, error);
      throw error;
    }
  }

  /**
   * Add property to tenant
   * 
   * @param {number} tenantId - Tenant ID
   * @param {number} propertyId - Property ID
   * @param {object} settings - Custom settings for the property
   * @returns {Promise<object>} Created tenant property relationship
   */
  static async addPropertyToTenant(tenantId, propertyId, settings = {}) {
    try {
      const [tenantProperty] = await db
        .insert(tenantProperties)
        .values({
          tenantId,
          propertyId,
          customSettings: settings,
          createdAt: new Date(),
        })
        .returning();

      return tenantProperty;
    } catch (error) {
      console.error(`Error adding property ${propertyId} to tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Get tenant properties
   * 
   * @param {number} tenantId - Tenant ID
   * @param {boolean} activeOnly - Only return active properties
   * @returns {Promise<array>} List of properties for the tenant
   */
  static async getTenantProperties(tenantId, activeOnly = true) {
    try {
      let query = db
        .select()
        .from(tenantProperties)
        .where(eq(tenantProperties.tenantId, tenantId));

      if (activeOnly) {
        query = query.where(eq(tenantProperties.isActive, true));
      }

      return await query;
    } catch (error) {
      console.error(`Error getting properties for tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Check if user belongs to tenant
   * 
   * @param {number} tenantId - Tenant ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if user belongs to tenant
   */
  static async userBelongsToTenant(tenantId, userId) {
    try {
      const tenantUser = await this.getTenantUser(tenantId, userId);
      return !!tenantUser;
    } catch (error) {
      console.error(`Error checking if user ${userId} belongs to tenant ${tenantId}:`, error);
      throw error;
    }
  }

  /**
   * Check if user has specific role in tenant
   * 
   * @param {number} tenantId - Tenant ID
   * @param {number} userId - User ID
   * @param {string|array} roles - Role or roles to check
   * @returns {Promise<boolean>} True if user has the role
   */
  static async userHasRoleInTenant(tenantId, userId, roles) {
    try {
      const tenantUser = await this.getTenantUser(tenantId, userId);
      if (!tenantUser) return false;

      if (Array.isArray(roles)) {
        return roles.includes(tenantUser.role);
      }
      
      return tenantUser.role === roles;
    } catch (error) {
      console.error(`Error checking role for user ${userId} in tenant ${tenantId}:`, error);
      throw error;
    }
  }
}

module.exports = TenantService;