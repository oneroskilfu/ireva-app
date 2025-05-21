/**
 * Tenant Controller
 * 
 * Provides API endpoints for managing tenants within the iREVA platform.
 * This controller handles tenant creation, management, user association,
 * and tenant settings.
 */

const TenantService = require('../services/tenant-service');
const { insertTenantSchema } = require('../../shared/schema-tenants');

class TenantController {
  /**
   * Create a new tenant
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async createTenant(req, res) {
    try {
      // Validate request body against schema
      const validationResult = insertTenantSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.errors,
        });
      }
      
      // Make sure the user is authenticated
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      // Create tenant
      const tenant = await TenantService.createTenant(validationResult.data, req.user.id);
      
      return res.status(201).json({
        success: true,
        message: 'Tenant created successfully',
        data: tenant,
      });
    } catch (error) {
      console.error('Error creating tenant:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create tenant',
        error: error.message,
      });
    }
  }
  
  /**
   * Get tenant by ID
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getTenant(req, res) {
    try {
      const tenantId = Number(req.params.id);
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required',
        });
      }
      
      const tenant = await TenantService.getTenantById(tenantId);
      
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: tenant,
      });
    } catch (error) {
      console.error(`Error getting tenant:`, error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get tenant',
        error: error.message,
      });
    }
  }
  
  /**
   * Update tenant
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async updateTenant(req, res) {
    try {
      const tenantId = Number(req.params.id);
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required',
        });
      }
      
      // Validate request body
      // We use shape here instead of safeParse since we're allowing partial updates
      const updateData = req.body;
      
      // Get current tenant
      const tenant = await TenantService.getTenantById(tenantId);
      
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        });
      }
      
      // Update tenant
      const updatedTenant = await TenantService.updateTenant(tenantId, updateData);
      
      return res.status(200).json({
        success: true,
        message: 'Tenant updated successfully',
        data: updatedTenant,
      });
    } catch (error) {
      console.error(`Error updating tenant:`, error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update tenant',
        error: error.message,
      });
    }
  }
  
  /**
   * Delete tenant
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async deleteTenant(req, res) {
    try {
      const tenantId = Number(req.params.id);
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required',
        });
      }
      
      // Check if tenant exists
      const tenant = await TenantService.getTenantById(tenantId);
      
      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        });
      }
      
      // Delete tenant
      await TenantService.deleteTenant(tenantId);
      
      return res.status(200).json({
        success: true,
        message: 'Tenant deleted successfully',
      });
    } catch (error) {
      console.error(`Error deleting tenant:`, error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete tenant',
        error: error.message,
      });
    }
  }
  
  /**
   * List all tenants (admin only)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async listTenants(req, res) {
    try {
      // Note: In a real app, you'd want to paginate this list
      const { page = 1, limit = 50 } = req.query;
      
      const offset = (page - 1) * limit;
      
      const tenants = await TenantService.getTenants(Number(page), Number(limit));
      
      return res.status(200).json({
        success: true,
        data: tenants,
      });
    } catch (error) {
      console.error('Error listing tenants:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to list tenants',
        error: error.message,
      });
    }
  }
  
  /**
   * Get current tenant (from request)
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getCurrentTenant(req, res) {
    try {
      // Tenant should be attached by the middleware
      if (!req.tenant) {
        return res.status(404).json({
          success: false,
          message: 'No tenant context found',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: req.tenant,
      });
    } catch (error) {
      console.error('Error getting current tenant:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get tenant',
        error: error.message,
      });
    }
  }
  
  /**
   * Get user's tenants
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getUserTenants(req, res) {
    try {
      // Make sure the user is authenticated
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      const userTenants = await TenantService.getUserTenants(req.user.id);
      
      return res.status(200).json({
        success: true,
        data: userTenants,
      });
    } catch (error) {
      console.error('Error getting user tenants:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get user tenants',
        error: error.message,
      });
    }
  }
  
  /**
   * Set user's default tenant
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async setDefaultTenant(req, res) {
    try {
      // Make sure the user is authenticated
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      const tenantId = Number(req.params.id);
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required',
        });
      }
      
      // Check if user belongs to this tenant
      const belongsToTenant = await TenantService.userBelongsToTenant(tenantId, req.user.id);
      
      if (!belongsToTenant) {
        return res.status(403).json({
          success: false,
          message: 'User does not belong to this tenant',
        });
      }
      
      // Set as default
      await TenantService.setUserDefaultTenant(req.user.id, tenantId);
      
      return res.status(200).json({
        success: true,
        message: 'Default tenant set successfully',
      });
    } catch (error) {
      console.error('Error setting default tenant:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to set default tenant',
        error: error.message,
      });
    }
  }
  
  /**
   * Add user to tenant
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async addUser(req, res) {
    try {
      const tenantId = Number(req.params.id);
      const { userId, role, isDefault } = req.body;
      
      if (!tenantId || !userId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID and user ID are required',
        });
      }
      
      // Add user to tenant
      const tenantUser = await TenantService.addUserToTenant(
        tenantId,
        Number(userId),
        role || 'user',
        isDefault || false
      );
      
      return res.status(201).json({
        success: true,
        message: 'User added to tenant successfully',
        data: tenantUser,
      });
    } catch (error) {
      console.error('Error adding user to tenant:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add user to tenant',
        error: error.message,
      });
    }
  }
  
  /**
   * Get tenant users
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async getUsers(req, res) {
    try {
      const tenantId = Number(req.params.id);
      
      if (!tenantId) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID is required',
        });
      }
      
      // Parse query parameters
      const { page, limit, role } = req.query;
      
      const options = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 100,
        role: role || undefined,
      };
      
      // Get users
      const result = await TenantService.getTenantUsers(tenantId, options);
      
      return res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error getting tenant users:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get tenant users',
        error: error.message,
      });
    }
  }
  
  /**
   * Create tenant invitation
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async createInvitation(req, res) {
    try {
      const tenantId = Number(req.params.id);
      const { email, role } = req.body;
      
      if (!tenantId || !email) {
        return res.status(400).json({
          success: false,
          message: 'Tenant ID and email are required',
        });
      }
      
      // Make sure the user is authenticated
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      // Create invitation
      const invitation = await TenantService.createInvitation(
        tenantId,
        email,
        role || 'user',
        req.user.id
      );
      
      return res.status(201).json({
        success: true,
        message: 'Invitation created successfully',
        data: invitation,
      });
    } catch (error) {
      console.error('Error creating tenant invitation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create invitation',
        error: error.message,
      });
    }
  }
  
  /**
   * Accept tenant invitation
   * 
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  static async acceptInvitation(req, res) {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Invitation token is required',
        });
      }
      
      // Make sure the user is authenticated
      if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      // Accept invitation
      const tenantUser = await TenantService.acceptInvitation(token, req.user.id);
      
      return res.status(200).json({
        success: true,
        message: 'Invitation accepted successfully',
        data: tenantUser,
      });
    } catch (error) {
      console.error('Error accepting tenant invitation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to accept invitation',
        error: error.message,
      });
    }
  }
}

module.exports = TenantController;