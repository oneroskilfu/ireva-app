/**
 * Tenant Service
 * 
 * This service handles tenant operations, including creation, management,
 * and user association for the multi-tenant implementation.
 */

const { db } = require('../db');
const { randomUUID } = require('crypto');
const { tenants, tenantUsers, tenantInvitations } = require('../../shared/schema-tenants');
const { users } = require('../../shared/schema');
const { eq, and, like, desc, sql } = require('drizzle-orm');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Configure email settings - in a real application, this would use an email service
// like SendGrid, Postmark, etc.
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@ireva.com';
const INVITATION_EXPIRY_DAYS = 7;

class TenantService {
  /**
   * Create a new tenant
   * 
   * @param {Object} tenantData - Tenant data
   * @returns {Promise<Object>} Created tenant
   */
  static async createTenant(tenantData) {
    try {
      // Generate a slug from the tenant name
      const slug = tenantData.slug || this.generateSlug(tenantData.name);
      
      // Check if slug is already taken
      const existingTenant = await db.select({ id: tenants.id })
        .from(tenants)
        .where(eq(tenants.slug, slug))
        .limit(1);
      
      if (existingTenant.length > 0) {
        throw new Error(`Tenant slug "${slug}" is already taken`);
      }
      
      // Create tenant
      const [tenant] = await db.insert(tenants)
        .values({
          ...tenantData,
          slug,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      return tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }
  
  /**
   * Generate a slug from a tenant name
   * 
   * @param {String} name - Tenant name
   * @returns {String} Slug
   */
  static generateSlug(name) {
    // Convert to lowercase, replace spaces with hyphens, remove special chars
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  /**
   * Get tenant by ID
   * 
   * @param {String} id - Tenant ID
   * @returns {Promise<Object|null>} Tenant or null if not found
   */
  static async getTenantById(id) {
    try {
      const [tenant] = await db.select()
        .from(tenants)
        .where(eq(tenants.id, id))
        .limit(1);
      
      return tenant || null;
    } catch (error) {
      console.error(`Error getting tenant ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get tenant by slug
   * 
   * @param {String} slug - Tenant slug
   * @returns {Promise<Object|null>} Tenant or null if not found
   */
  static async getTenantBySlug(slug) {
    try {
      const [tenant] = await db.select()
        .from(tenants)
        .where(eq(tenants.slug, slug))
        .limit(1);
      
      return tenant || null;
    } catch (error) {
      console.error(`Error getting tenant by slug ${slug}:`, error);
      throw error;
    }
  }
  
  /**
   * Update tenant
   * 
   * @param {String} id - Tenant ID
   * @param {Object} updates - Tenant updates
   * @returns {Promise<Object>} Updated tenant
   */
  static async updateTenant(id, updates) {
    try {
      // Check if tenant exists
      const existingTenant = await this.getTenantById(id);
      
      if (!existingTenant) {
        throw new Error(`Tenant with ID ${id} not found`);
      }
      
      // Don't allow slug updates if it would cause a collision
      if (updates.slug && updates.slug !== existingTenant.slug) {
        const slugExists = await db.select({ id: tenants.id })
          .from(tenants)
          .where(eq(tenants.slug, updates.slug))
          .limit(1);
        
        if (slugExists.length > 0) {
          throw new Error(`Tenant slug "${updates.slug}" is already taken`);
        }
      }
      
      // Update tenant
      const [updatedTenant] = await db.update(tenants)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, id))
        .returning();
      
      return updatedTenant;
    } catch (error) {
      console.error(`Error updating tenant ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete tenant
   * 
   * @param {String} id - Tenant ID
   * @returns {Promise<Boolean>} True if deleted
   */
  static async deleteTenant(id) {
    try {
      // In a real application, we would want to implement a soft delete
      // or archive mechanism instead of hard deleting the tenant
      // This would also need to handle cascading deletes or archiving of related data
      
      // Delete tenant
      const result = await db.delete(tenants)
        .where(eq(tenants.id, id));
      
      return result.count > 0;
    } catch (error) {
      console.error(`Error deleting tenant ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all tenants with pagination
   * 
   * @param {Number} page - Page number
   * @param {Number} limit - Results per page
   * @param {String} search - Search term
   * @param {String} status - Filter by status
   * @returns {Promise<Object>} Tenants with pagination
   */
  static async getAllTenants(page = 1, limit = 10, search = '', status = null) {
    try {
      const offset = (page - 1) * limit;
      
      // Build query
      let query = db.select()
        .from(tenants)
        .orderBy(desc(tenants.createdAt));
      
      // Apply search filter
      if (search) {
        query = query.where(
          sql`${tenants.name} ILIKE ${`%${search}%`} OR ${tenants.slug} ILIKE ${`%${search}%`} OR ${tenants.primaryContactEmail} ILIKE ${`%${search}%`}`
        );
      }
      
      // Apply status filter
      if (status) {
        query = query.where(eq(tenants.status, status));
      }
      
      // Get total count for pagination
      const countResult = await db.select({ count: sql`COUNT(*)` })
        .from(tenants)
        .where(query.where);
      
      const total = parseInt(countResult[0]?.count || '0');
      
      // Get paginated results
      const results = await query
        .limit(limit)
        .offset(offset);
      
      return {
        tenants: results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error getting all tenants:', error);
      throw error;
    }
  }
  
  /**
   * Add user to tenant
   * 
   * @param {String} tenantId - Tenant ID
   * @param {Number} userId - User ID
   * @param {Object} options - Options (role, isOwner, invitedBy)
   * @returns {Promise<Object>} Tenant user relation
   */
  static async addUserToTenant(tenantId, userId, options = {}) {
    try {
      // Check if tenant exists
      const tenant = await this.getTenantById(tenantId);
      
      if (!tenant) {
        throw new Error(`Tenant with ID ${tenantId} not found`);
      }
      
      // Check if user exists
      const [user] = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      // Check if user is already associated with tenant
      const [existingRelation] = await db.select()
        .from(tenantUsers)
        .where(and(
          eq(tenantUsers.tenantId, tenantId),
          eq(tenantUsers.userId, userId)
        ))
        .limit(1);
      
      if (existingRelation) {
        // Update existing relation
        const [updated] = await db.update(tenantUsers)
          .set({
            role: options.role || existingRelation.role,
            isOwner: options.isOwner !== undefined ? options.isOwner : existingRelation.isOwner,
            isActive: true,
            lastAccessAt: new Date(),
          })
          .where(eq(tenantUsers.id, existingRelation.id))
          .returning();
        
        return updated;
      }
      
      // Create new relation
      const [relation] = await db.insert(tenantUsers)
        .values({
          id: uuidv4(),
          tenantId,
          userId,
          role: options.role || 'member',
          isOwner: options.isOwner || false,
          invitedBy: options.invitedBy,
          joinedAt: new Date(),
          lastAccessAt: new Date(),
        })
        .returning();
      
      // Update tenant user count
      await db.update(tenants)
        .set({
          userCount: sql`${tenants.userCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId));
      
      return relation;
    } catch (error) {
      console.error(`Error adding user ${userId} to tenant ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Remove user from tenant
   * 
   * @param {String} tenantId - Tenant ID
   * @param {Number} userId - User ID
   * @returns {Promise<Boolean>} True if removed
   */
  static async removeUserFromTenant(tenantId, userId) {
    try {
      // Delete relation
      const result = await db.delete(tenantUsers)
        .where(and(
          eq(tenantUsers.tenantId, tenantId),
          eq(tenantUsers.userId, userId)
        ));
      
      if (result.count > 0) {
        // Update tenant user count
        await db.update(tenants)
          .set({
            userCount: sql`GREATEST(${tenants.userCount} - 1, 0)`,
            updatedAt: new Date(),
          })
          .where(eq(tenants.id, tenantId));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error removing user ${userId} from tenant ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update user role in tenant
   * 
   * @param {String} tenantId - Tenant ID
   * @param {Number} userId - User ID
   * @param {String} role - New role
   * @returns {Promise<Object|null>} Updated relation or null if not found
   */
  static async updateUserRole(tenantId, userId, role) {
    try {
      // Update relation
      const [updated] = await db.update(tenantUsers)
        .set({
          role,
        })
        .where(and(
          eq(tenantUsers.tenantId, tenantId),
          eq(tenantUsers.userId, userId)
        ))
        .returning();
      
      return updated || null;
    } catch (error) {
      console.error(`Error updating role for user ${userId} in tenant ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get users for tenant
   * 
   * @param {String} tenantId - Tenant ID
   * @param {Number} page - Page number
   * @param {Number} limit - Results per page
   * @returns {Promise<Object>} Users with pagination
   */
  static async getTenantUsers(tenantId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      // Join tenantUsers with users to get user details
      const userResults = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: tenantUsers.role,
        isOwner: tenantUsers.isOwner,
        isActive: tenantUsers.isActive,
        joinedAt: tenantUsers.joinedAt,
        lastAccessAt: tenantUsers.lastAccessAt,
      })
        .from(tenantUsers)
        .innerJoin(users, eq(tenantUsers.userId, users.id))
        .where(eq(tenantUsers.tenantId, tenantId))
        .orderBy(desc(tenantUsers.joinedAt))
        .limit(limit)
        .offset(offset);
      
      // Get total count for pagination
      const [countResult] = await db.select({ count: sql`COUNT(*)` })
        .from(tenantUsers)
        .where(eq(tenantUsers.tenantId, tenantId));
      
      const total = parseInt(countResult?.count || '0');
      
      return {
        users: userResults,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error(`Error getting users for tenant ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get tenants for user
   * 
   * @param {Number} userId - User ID
   * @returns {Promise<Array>} Tenants
   */
  static async getUserTenants(userId) {
    try {
      // Join tenantUsers with tenants to get tenant details
      const tenantResults = await db.select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        status: tenants.status,
        tier: tenants.tier,
        logoUrl: tenants.logoUrl,
        role: tenantUsers.role,
        isOwner: tenantUsers.isOwner,
        isActive: tenantUsers.isActive,
        joinedAt: tenantUsers.joinedAt,
        lastAccessAt: tenantUsers.lastAccessAt,
      })
        .from(tenantUsers)
        .innerJoin(tenants, eq(tenantUsers.tenantId, tenants.id))
        .where(and(
          eq(tenantUsers.userId, userId),
          eq(tenantUsers.isActive, true),
          eq(tenants.status, 'active')
        ));
      
      return tenantResults;
    } catch (error) {
      console.error(`Error getting tenants for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create tenant invitation
   * 
   * @param {String} tenantId - Tenant ID
   * @param {Object} invitationData - Invitation data
   * @returns {Promise<Object>} Created invitation
   */
  static async createInvitation(tenantId, invitationData) {
    try {
      // Check if tenant exists
      const tenant = await this.getTenantById(tenantId);
      
      if (!tenant) {
        throw new Error(`Tenant with ID ${tenantId} not found`);
      }
      
      // Check if invitation exists for this email
      const [existingInvitation] = await db.select()
        .from(tenantInvitations)
        .where(and(
          eq(tenantInvitations.tenantId, tenantId),
          eq(tenantInvitations.email, invitationData.email),
          eq(tenantInvitations.status, 'pending')
        ))
        .limit(1);
      
      if (existingInvitation) {
        throw new Error(`Invitation for ${invitationData.email} already exists`);
      }
      
      // Generate token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Set expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);
      
      // Create invitation
      const [invitation] = await db.insert(tenantInvitations)
        .values({
          id: uuidv4(),
          tenantId,
          email: invitationData.email,
          invitedByUserId: invitationData.invitedByUserId,
          role: invitationData.role || 'member',
          token,
          expiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      // In a real application, send invitation email here
      // this.sendInvitationEmail(invitation, tenant);
      
      return invitation;
    } catch (error) {
      console.error(`Error creating invitation for tenant ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get invitation by token
   * 
   * @param {String} token - Invitation token
   * @returns {Promise<Object|null>} Invitation or null if not found
   */
  static async getInvitationByToken(token) {
    try {
      const [invitation] = await db.select({
        ...tenantInvitations,
        tenantName: tenants.name,
      })
        .from(tenantInvitations)
        .innerJoin(tenants, eq(tenantInvitations.tenantId, tenants.id))
        .where(eq(tenantInvitations.token, token))
        .limit(1);
      
      return invitation || null;
    } catch (error) {
      console.error(`Error getting invitation by token ${token}:`, error);
      throw error;
    }
  }
  
  /**
   * Accept invitation
   * 
   * @param {String} token - Invitation token
   * @param {Number} userId - User ID
   * @returns {Promise<Object>} Tenant user relation
   */
  static async acceptInvitation(token, userId) {
    try {
      // Get invitation
      const invitation = await this.getInvitationByToken(token);
      
      if (!invitation) {
        throw new Error('Invitation not found');
      }
      
      // Check if invitation has expired
      if (new Date(invitation.expiresAt) < new Date()) {
        throw new Error('Invitation has expired');
      }
      
      // Check if invitation has already been accepted
      if (invitation.status !== 'pending') {
        throw new Error(`Invitation has already been ${invitation.status}`);
      }
      
      // Add user to tenant
      const relation = await this.addUserToTenant(invitation.tenantId, userId, {
        role: invitation.role,
        invitedBy: invitation.invitedByUserId,
      });
      
      // Update invitation status
      await db.update(tenantInvitations)
        .set({
          status: 'accepted',
          updatedAt: new Date(),
        })
        .where(eq(tenantInvitations.id, invitation.id));
      
      return relation;
    } catch (error) {
      console.error(`Error accepting invitation with token ${token}:`, error);
      throw error;
    }
  }
  
  /**
   * Decline invitation
   * 
   * @param {String} token - Invitation token
   * @returns {Promise<Boolean>} True if declined
   */
  static async declineInvitation(token) {
    try {
      // Get invitation
      const invitation = await this.getInvitationByToken(token);
      
      if (!invitation) {
        throw new Error('Invitation not found');
      }
      
      // Check if invitation has expired
      if (new Date(invitation.expiresAt) < new Date()) {
        throw new Error('Invitation has expired');
      }
      
      // Check if invitation has already been accepted or declined
      if (invitation.status !== 'pending') {
        throw new Error(`Invitation has already been ${invitation.status}`);
      }
      
      // Update invitation status
      await db.update(tenantInvitations)
        .set({
          status: 'declined',
          updatedAt: new Date(),
        })
        .where(eq(tenantInvitations.id, invitation.id));
      
      return true;
    } catch (error) {
      console.error(`Error declining invitation with token ${token}:`, error);
      throw error;
    }
  }
  
  /**
   * Get tenant invitations with pagination
   * 
   * @param {String} tenantId - Tenant ID
   * @param {Number} page - Page number
   * @param {Number} limit - Results per page
   * @param {String} status - Filter by status
   * @returns {Promise<Object>} Invitations with pagination
   */
  static async getTenantInvitations(tenantId, page = 1, limit = 10, status = null) {
    try {
      const offset = (page - 1) * limit;
      
      // Build query
      let query = db.select({
        id: tenantInvitations.id,
        email: tenantInvitations.email,
        role: tenantInvitations.role,
        status: tenantInvitations.status,
        invitedByUserId: tenantInvitations.invitedByUserId,
        invitedByUsername: users.username,
        expiresAt: tenantInvitations.expiresAt,
        createdAt: tenantInvitations.createdAt,
      })
        .from(tenantInvitations)
        .leftJoin(users, eq(tenantInvitations.invitedByUserId, users.id))
        .where(eq(tenantInvitations.tenantId, tenantId))
        .orderBy(desc(tenantInvitations.createdAt));
      
      // Apply status filter
      if (status) {
        query = query.where(eq(tenantInvitations.status, status));
      }
      
      // Get total count for pagination
      const countQuery = db.select({ count: sql`COUNT(*)` })
        .from(tenantInvitations)
        .where(eq(tenantInvitations.tenantId, tenantId));
      
      if (status) {
        countQuery.where(eq(tenantInvitations.status, status));
      }
      
      const [countResult] = await countQuery;
      const total = parseInt(countResult?.count || '0');
      
      // Get paginated results
      const results = await query
        .limit(limit)
        .offset(offset);
      
      return {
        invitations: results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error(`Error getting invitations for tenant ${tenantId}:`, error);
      throw error;
    }
  }
  
  /**
   * Send invitation email (mock implementation)
   * 
   * @param {Object} invitation - Invitation
   * @param {Object} tenant - Tenant
   * @returns {Promise<void>}
   */
  static async sendInvitationEmail(invitation, tenant) {
    // In a real application, send an email using SendGrid, Postmark, etc.
    console.log(`
      To: ${invitation.email}
      From: ${EMAIL_FROM}
      Subject: You've been invited to join ${tenant.name} on iREVA
      
      Hi there,
      
      You've been invited to join ${tenant.name} on the iREVA platform.
      
      Click the link below to accept the invitation:
      ${process.env.APP_URL}/invitations/${invitation.token}
      
      This invitation will expire on ${invitation.expiresAt}.
      
      If you did not expect this invitation, you can ignore this email.
      
      Regards,
      The iREVA Team
    `);
  }
}

module.exports = TenantService;