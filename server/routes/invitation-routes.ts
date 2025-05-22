/**
 * Invitation Routes
 * 
 * This module provides API routes for managing tenant invitations:
 * - GET /api/invitations/:token - Get invitation details by token
 * - POST /api/invitations/:token/accept - Accept an invitation
 * - GET /api/tenants/:tenantId/invitations - List invitations for a tenant
 * - POST /api/tenants/:tenantId/invitations - Create a new invitation
 * - POST /api/tenants/:tenantId/invitations/:id/resend - Resend an invitation
 * - DELETE /api/tenants/:tenantId/invitations/:id - Revoke an invitation
 */

import { Router } from 'express';
import { tenantContext, requireTenantAdmin } from '../middleware/tenant-context';
import { 
  createInvitation, 
  getInvitationByToken, 
  acceptInvitation, 
  getInvitationsByTenant,
  resendInvitation,
  revokeInvitation
} from '../services/invitation-service';

const router = Router();

// Get invitation details by token
router.get('/invitations/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await getInvitationByToken(token);
    
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found or expired' });
    }
    
    return res.json(invitation);
  } catch (error) {
    console.error('Error getting invitation:', error);
    return res.status(500).json({ error: 'Failed to get invitation' });
  }
});

// Accept invitation
router.post('/invitations/:token/accept', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Ensure user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const result = await acceptInvitation(token, req.user.id);
    return res.json(result);
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return res.status(400).json({ error: error.message || 'Failed to accept invitation' });
  }
});

// List invitations for a tenant (requires tenant context and admin role)
router.get('/tenants/:tenantId/invitations', tenantContext(), requireTenantAdmin(), async (req, res) => {
  try {
    const { tenantId } = req.params;
    const invitations = await getInvitationsByTenant(tenantId);
    return res.json(invitations);
  } catch (error) {
    console.error('Error listing invitations:', error);
    return res.status(500).json({ error: 'Failed to list invitations' });
  }
});

// Create a new invitation (requires tenant context and admin role)
router.post('/tenants/:tenantId/invitations', tenantContext(), requireTenantAdmin(), async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { email, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    
    const invitation = await createInvitation(tenantId, email, role, req.user.id);
    return res.status(201).json(invitation);
  } catch (error) {
    console.error('Error creating invitation:', error);
    return res.status(400).json({ error: error.message || 'Failed to create invitation' });
  }
});

// Resend an invitation (requires tenant context and admin role)
router.post('/tenants/:tenantId/invitations/:id/resend', tenantContext(), requireTenantAdmin(), async (req, res) => {
  try {
    const { tenantId, id } = req.params;
    
    const invitation = await resendInvitation(parseInt(id), tenantId);
    return res.json(invitation);
  } catch (error) {
    console.error('Error resending invitation:', error);
    return res.status(400).json({ error: error.message || 'Failed to resend invitation' });
  }
});

// Revoke an invitation (requires tenant context and admin role)
router.delete('/tenants/:tenantId/invitations/:id', tenantContext(), requireTenantAdmin(), async (req, res) => {
  try {
    const { tenantId, id } = req.params;
    
    const invitation = await revokeInvitation(parseInt(id), tenantId);
    return res.json(invitation);
  } catch (error) {
    console.error('Error revoking invitation:', error);
    return res.status(400).json({ error: error.message || 'Failed to revoke invitation' });
  }
});

export default router;