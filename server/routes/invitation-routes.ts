/**
 * Invitation Routes
 * 
 * Defines API routes for tenant invitations.
 */

import express from 'express';
import {
  createInvitation,
  getTenantInvitations,
  getInvitationByToken,
  acceptInvitation,
  revokeInvitation,
  resendInvitation
} from '../controllers/invitation-controller';
import { requireAuth } from '../middleware/auth-middleware';
import { requireTenantAccess } from '../middleware/tenant-context';

const router = express.Router();

// Public route for checking invitation validity
router.get('/invitations/token/:token', getInvitationByToken);

// Route for accepting an invitation (requires authentication)
router.post('/invitations/token/:token/accept', requireAuth, acceptInvitation);

// Tenant-specific invitation routes (requires tenant access)
router.post('/tenants/:tenantId/invitations', requireAuth, requireTenantAccess, createInvitation);
router.get('/tenants/:tenantId/invitations', requireAuth, requireTenantAccess, getTenantInvitations);
router.put('/tenants/:tenantId/invitations/:invitationId/revoke', requireAuth, requireTenantAccess, revokeInvitation);
router.put('/tenants/:tenantId/invitations/:invitationId/resend', requireAuth, requireTenantAccess, resendInvitation);

export default router;