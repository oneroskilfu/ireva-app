/**
 * Tenant Management API Routes
 * 
 * REST endpoints for managing tenants in the multi-tenant platform.
 * These routes are protected and require admin authentication.
 */

const express = require('express');
const router = express.Router();
const TenantService = require('../../services/tenant-service');
const { requireAuth } = require('../../middleware/auth-middleware');
const { requireAdminRole } = require('../../middleware/role-middleware');

// Apply authentication and admin role middleware to all routes
router.use(requireAuth, requireAdminRole);

// Get all tenants with pagination, search, and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || null;
    
    const result = await TenantService.getAllTenants(page, limit, search, status);
    
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error getting tenants:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get tenants',
      error: error.message,
    });
  }
});

// Get tenant by ID
router.get('/:id', async (req, res) => {
  try {
    const tenant = await TenantService.getTenantById(req.params.id);
    
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
    console.error(`Error getting tenant ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get tenant',
      error: error.message,
    });
  }
});

// Create new tenant
router.post('/', async (req, res) => {
  try {
    const tenantData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'slug', 'primaryContactName', 'primaryContactEmail'];
    const missingFields = requiredFields.filter(field => !tenantData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }
    
    const tenant = await TenantService.createTenant(tenantData);
    
    return res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      data: tenant,
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return res.status(error.message.includes('already taken') ? 409 : 500).json({
      success: false,
      message: 'Failed to create tenant',
      error: error.message,
    });
  }
});

// Update tenant
router.put('/:id', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const updates = req.body;
    
    // Check if tenant exists
    const existingTenant = await TenantService.getTenantById(tenantId);
    
    if (!existingTenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }
    
    const updatedTenant = await TenantService.updateTenant(tenantId, updates);
    
    return res.status(200).json({
      success: true,
      message: 'Tenant updated successfully',
      data: updatedTenant,
    });
  } catch (error) {
    console.error(`Error updating tenant ${req.params.id}:`, error);
    return res.status(error.message.includes('already taken') ? 409 : 500).json({
      success: false,
      message: 'Failed to update tenant',
      error: error.message,
    });
  }
});

// Delete tenant
router.delete('/:id', async (req, res) => {
  try {
    const tenantId = req.params.id;
    
    // Check if tenant exists
    const existingTenant = await TenantService.getTenantById(tenantId);
    
    if (!existingTenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }
    
    await TenantService.deleteTenant(tenantId);
    
    return res.status(200).json({
      success: true,
      message: 'Tenant deleted successfully',
    });
  } catch (error) {
    console.error(`Error deleting tenant ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete tenant',
      error: error.message,
    });
  }
});

// Get users for tenant
router.get('/:id/users', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Check if tenant exists
    const tenant = await TenantService.getTenantById(tenantId);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }
    
    const result = await TenantService.getTenantUsers(tenantId, page, limit);
    
    return res.status(200).json({
      success: true,
      tenantId,
      tenantName: tenant.name,
      ...result,
    });
  } catch (error) {
    console.error(`Error getting users for tenant ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get tenant users',
      error: error.message,
    });
  }
});

// Add user to tenant
router.post('/:id/users', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const { userId, role, isOwner } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
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
    
    const relation = await TenantService.addUserToTenant(tenantId, userId, {
      role,
      isOwner,
      invitedBy: req.user.id,
    });
    
    return res.status(200).json({
      success: true,
      message: 'User added to tenant successfully',
      data: relation,
    });
  } catch (error) {
    console.error(`Error adding user to tenant ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add user to tenant',
      error: error.message,
    });
  }
});

// Remove user from tenant
router.delete('/:id/users/:userId', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const userId = parseInt(req.params.userId);
    
    // Check if tenant exists
    const tenant = await TenantService.getTenantById(tenantId);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }
    
    const result = await TenantService.removeUserFromTenant(tenantId, userId);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found in tenant',
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'User removed from tenant successfully',
    });
  } catch (error) {
    console.error(`Error removing user from tenant ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove user from tenant',
      error: error.message,
    });
  }
});

// Update user role in tenant
router.put('/:id/users/:userId', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const userId = parseInt(req.params.userId);
    const { role, isOwner } = req.body;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required',
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
    
    const updatedRelation = await TenantService.updateUserRole(tenantId, userId, role);
    
    if (!updatedRelation) {
      return res.status(404).json({
        success: false,
        message: 'User not found in tenant',
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: updatedRelation,
    });
  } catch (error) {
    console.error(`Error updating user role in tenant ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message,
    });
  }
});

// Create tenant invitation
router.post('/:id/invitations', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const { email, role } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
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
    
    const invitation = await TenantService.createInvitation(tenantId, {
      email,
      role: role || 'member',
      invitedByUserId: req.user.id,
    });
    
    return res.status(201).json({
      success: true,
      message: 'Invitation created successfully',
      data: invitation,
    });
  } catch (error) {
    console.error(`Error creating invitation for tenant ${req.params.id}:`, error);
    return res.status(error.message.includes('already exists') ? 409 : 500).json({
      success: false,
      message: 'Failed to create invitation',
      error: error.message,
    });
  }
});

// Get tenant invitations
router.get('/:id/invitations', async (req, res) => {
  try {
    const tenantId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    
    // Check if tenant exists
    const tenant = await TenantService.getTenantById(tenantId);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found',
      });
    }
    
    const result = await TenantService.getTenantInvitations(tenantId, page, limit, status);
    
    return res.status(200).json({
      success: true,
      tenantId,
      tenantName: tenant.name,
      ...result,
    });
  } catch (error) {
    console.error(`Error getting invitations for tenant ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get tenant invitations',
      error: error.message,
    });
  }
});

module.exports = router;