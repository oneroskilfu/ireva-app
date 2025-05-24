/**
 * User Tenant Routes
 * 
 * API endpoints for managing a user's tenant associations.
 * These routes provide access to tenant information for the authenticated user.
 */

const express = require('express');
const router = express.Router();
const TenantService = require('../../services/tenant-service');
const { requireAuth } = require('../../middleware/auth-middleware');

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get all tenants for the authenticated user
router.get('/tenants', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const tenants = await TenantService.getUserTenants(userId);
    
    return res.status(200).json({
      success: true,
      data: tenants,
    });
  } catch (error) {
    console.error(`Error getting tenants for user ${req.user.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get tenants',
      error: error.message,
    });
  }
});

// Get tenant details by ID (if the user is a member)
router.get('/tenants/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.params.id;
    
    // Get user's tenants
    const userTenants = await TenantService.getUserTenants(userId);
    
    // Check if user has access to the requested tenant
    const tenant = userTenants.find(t => t.id === tenantId);
    
    if (!tenant) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this tenant',
      });
    }
    
    // Get full tenant details
    const tenantDetails = await TenantService.getTenantById(tenantId);
    
    return res.status(200).json({
      success: true,
      data: {
        ...tenantDetails,
        role: tenant.role,
        isOwner: tenant.isOwner,
      },
    });
  } catch (error) {
    console.error(`Error getting tenant ${req.params.id} for user ${req.user.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get tenant details',
      error: error.message,
    });
  }
});

// Accept tenant invitation
router.post('/invitations/:token/accept', async (req, res) => {
  try {
    const token = req.params.token;
    const userId = req.user.id;
    
    // Get invitation
    const invitation = await TenantService.getInvitationByToken(token);
    
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
    }
    
    // Check if invitation has expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invitation has expired',
      });
    }
    
    // Check if invitation has already been accepted
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Invitation has already been ${invitation.status}`,
      });
    }
    
    // Check if invitation email matches user email
    if (invitation.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'This invitation was sent to another email address',
      });
    }
    
    // Accept invitation
    const relation = await TenantService.acceptInvitation(token, userId);
    
    return res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        tenantId: invitation.tenantId,
        tenantName: invitation.tenantName,
        role: relation.role,
      },
    });
  } catch (error) {
    console.error(`Error accepting invitation for user ${req.user.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to accept invitation',
      error: error.message,
    });
  }
});

// Decline tenant invitation
router.post('/invitations/:token/decline', async (req, res) => {
  try {
    const token = req.params.token;
    
    // Get invitation
    const invitation = await TenantService.getInvitationByToken(token);
    
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found',
      });
    }
    
    // Check if invitation has expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invitation has expired',
      });
    }
    
    // Check if invitation has already been accepted or declined
    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Invitation has already been ${invitation.status}`,
      });
    }
    
    // Check if invitation email matches user email
    if (invitation.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'This invitation was sent to another email address',
      });
    }
    
    // Decline invitation
    await TenantService.declineInvitation(token);
    
    return res.status(200).json({
      success: true,
      message: 'Invitation declined successfully',
    });
  } catch (error) {
    console.error(`Error declining invitation for user ${req.user.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to decline invitation',
      error: error.message,
    });
  }
});

module.exports = router;