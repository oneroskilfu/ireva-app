/**
 * Tenant Service
 * 
 * Handles tenant creation, retrieval, update, and deletion operations
 * for the multi-tenant iREVA platform.
 */

const { db } = require('../db');
const { eq, ilike, desc, and, or } = require('drizzle-orm');
const { tenants } = require('../../shared/schema-tenants');
const { randomUUID } = require('crypto');

class TenantService {
  /**
   * Create a new tenant
   * 
   * @param {object} tenantData - Tenant data to create
   * @returns {Promise<object>} Created tenant
   */
  static async createTenant(tenantData) {
    try {
      // Ensure slug is provided or generate from name
      if (!tenantData.slug && tenantData.name) {
        tenantData.slug = tenantData.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }

      // Check if tenant with slug already exists
      const existingTenant = await this.getTenantBySlug(tenantData.slug);
      if (existingTenant) {
        throw new Error(`Tenant with slug "${tenantData.slug}" already exists`);
      }

      const [tenant] = await db.insert(tenants)
        .values({
          id: randomUUID(),
          name: tenantData.name,
          slug: tenantData.slug,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      throw error;
    }
  }

  /**
   * Get a tenant by ID
   * 
   * @param {string} id - Tenant ID
   * @returns {Promise<object|null>} Tenant or null if not found
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
   * Get a tenant by slug
   * 
   * @param {string} slug - Tenant slug
   * @returns {Promise<object|null>} Tenant or null if not found
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
   * Update a tenant
   * 
   * @param {string} id - Tenant ID
   * @param {object} updates - Fields to update
   * @returns {Promise<object>} Updated tenant
   */
  static async updateTenant(id, updates) {
    try {
      // Check if slug is being updated and ensure it's unique
      if (updates.slug) {
        const existingTenant = await this.getTenantBySlug(updates.slug);
        if (existingTenant && existingTenant.id !== id) {
          throw new Error(`Tenant with slug "${updates.slug}" already exists`);
        }
      }

      const [updatedTenant] = await db.update(tenants)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(tenants.id, id))
        .returning();
      
      if (!updatedTenant) {
        throw new Error(`Tenant with ID ${id} not found`);
      }
      
      return updatedTenant;
    } catch (error) {
      console.error(`Error updating tenant ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a tenant
   * 
   * @param {string} id - Tenant ID
   * @returns {Promise<boolean>} Whether the tenant was deleted
   */
  static async deleteTenant(id) {
    try {
      const [deletedTenant] = await db.delete(tenants)
        .where(eq(tenants.id, id))
        .returning();
      
      return !!deletedTenant;
    } catch (error) {
      console.error(`Error deleting tenant ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all tenants with optional pagination and search
   * 
   * @param {object} options - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=10] - Results per page
   * @param {string} [options.search] - Search term for tenant name
   * @returns {Promise<{tenants: Array<object>, pagination: object}>} Tenants with pagination info
   */
  static async getAllTenants(options = {}) {
    try {
      const { page = 1, limit = 10, search } = options;
      const offset = (page - 1) * limit;
      
      // Build query
      let query = db.select()
        .from(tenants)
        .orderBy(desc(tenants.createdAt));
      
      // Add search if provided
      if (search) {
        query = query.where(
          or(
            ilike(tenants.name, `%${search}%`),
            ilike(tenants.slug, `%${search}%`)
          )
        );
      }
      
      // Execute query with pagination
      const results = await query.limit(limit).offset(offset);
      
      // Count total for pagination
      const [{ count }] = await db.select({
        count: db.sql`count(*)`
      })
      .from(tenants)
      .where(search ? 
        or(
          ilike(tenants.name, `%${search}%`),
          ilike(tenants.slug, `%${search}%`)
        ) : 
        db.sql`1=1`
      );
      
      return {
        tenants: results,
        pagination: {
          total: Number(count),
          page,
          limit,
          pages: Math.ceil(Number(count) / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all tenants:', error);
      throw error;
    }
  }
}

module.exports = TenantService;