/**
 * Tenant Controller
 * 
 * Handles HTTP requests related to tenant management
 * for the multi-tenant iREVA platform.
 */

const TenantService = require('../services/tenant-service');

const tenantController = {
  /**
   * Create a new tenant
   */
  async createTenant(req, res) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to create tenants' });
      }

      const { name, slug } = req.body;
      
      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Tenant name is required' });
      }
      
      // Create tenant
      const tenant = await TenantService.createTenant({ name, slug });
      
      return res.status(201).json({
        message: 'Tenant created successfully',
        tenant
      });
    } catch (error) {
      console.error('Error creating tenant:', error);
      
      // Handle specific errors
      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Failed to create tenant' });
    }
  },
  
  /**
   * Get a tenant by ID
   */
  async getTenantById(req, res) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to view tenant details' });
      }

      const { id } = req.params;
      
      const tenant = await TenantService.getTenantById(id);
      
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      
      return res.json(tenant);
    } catch (error) {
      console.error(`Error getting tenant ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Failed to get tenant' });
    }
  },
  
  /**
   * Update a tenant
   */
  async updateTenant(req, res) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update tenants' });
      }

      const { id } = req.params;
      const { name, slug } = req.body;
      
      // Validate that at least one field is being updated
      if (!name && !slug) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      // Update tenant
      const tenant = await TenantService.updateTenant(id, { name, slug });
      
      return res.json({
        message: 'Tenant updated successfully',
        tenant
      });
    } catch (error) {
      console.error(`Error updating tenant ${req.params.id}:`, error);
      
      // Handle specific errors
      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      } else if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Failed to update tenant' });
    }
  },
  
  /**
   * Delete a tenant
   */
  async deleteTenant(req, res) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete tenants' });
      }

      const { id } = req.params;
      
      const deleted = await TenantService.deleteTenant(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      
      return res.json({
        message: 'Tenant deleted successfully'
      });
    } catch (error) {
      console.error(`Error deleting tenant ${req.params.id}:`, error);
      return res.status(500).json({ error: 'Failed to delete tenant' });
    }
  },
  
  /**
   * Get all tenants with pagination and search
   */
  async getAllTenants(req, res) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to view tenants' });
      }

      const { page, limit, search } = req.query;
      
      const result = await TenantService.getAllTenants({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        search
      });
      
      return res.json(result);
    } catch (error) {
      console.error('Error getting tenants:', error);
      return res.status(500).json({ error: 'Failed to get tenants' });
    }
  },
  
  /**
   * Get tenant by slug
   */
  async getTenantBySlug(req, res) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to view tenant details' });
      }

      const { slug } = req.params;
      
      const tenant = await TenantService.getTenantBySlug(slug);
      
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      
      return res.json(tenant);
    } catch (error) {
      console.error(`Error getting tenant by slug ${req.params.slug}:`, error);
      return res.status(500).json({ error: 'Failed to get tenant' });
    }
  }
};

module.exports = tenantController;