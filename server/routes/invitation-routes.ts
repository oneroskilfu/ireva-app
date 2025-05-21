/**
 * Tenant Invitation Routes
 * 
 * Defines API routes for tenant invitation management.
 */

import express from 'express';
import {
  createTenantInvitation,
  listTenantInvitations,
  revokeTenantInvitation,
  verifyInvitationToken,
  acceptTenantInvitation
} from '../controllers/invitation-controller';
import { requireAuth } from '../middleware/auth-middleware';
import { requireTenantAccess } from '../middleware/tenant-context';

const router = express.Router();

// Routes that require tenant context
router.use('/tenants/:tenantId/invitations', requireAuth, requireTenantAccess);

// Tenant-specific invitation routes
router.post('/tenants/:tenantId/invitations', createTenantInvitation);
router.get('/tenants/:tenantId/invitations', listTenantInvitations);
router.delete('/tenants/:tenantId/invitations/:invitationId', revokeTenantInvitation);

// General invitation routes
router.get('/invitations/verify/:token', verifyInvitationToken);
router.post('/invitations/accept/:token', requireAuth, acceptTenantInvitation);

export default router;