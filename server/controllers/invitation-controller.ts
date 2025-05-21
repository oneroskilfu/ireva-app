/**
 * Tenant Invitation Controller
 * 
 * Handles HTTP requests for tenant invitation management.
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import {
  createInvitation,
  verifyInvitation,
  acceptInvitation,
  revokeInvitation,
  getTenantInvitations
} from '../services/invitation-service';
import { insertInvitationSchema } from '@shared/schema-invitations';

// Validate invitation creation request
const createInvitationSchema = insertInvitationSchema.extend({
  daysValid: z.number().min(1).max(30).optional()
});

/**
 * Create a new invitation to join a tenant
 */
export async function createTenantInvitation(req: Request, res: Response) {
  try {
    const { tenantId } = req.params;
    
    // Get the current user from the session
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Validate request body
    const validatedData = createInvitationSchema.parse(req.body);
    
    // Get the current user's tenant user record
    const tenantUser = req.tenantUser;
    if (!tenantUser) {
      return res.status(403).json({ error: 'You do not have access to this tenant' });
    }
    
    // Check if user has permission to invite others (must be admin or owner)
    if (tenantUser.role !== 'admin' && !tenantUser.isOwner) {
      return res.status(403).json({ error: 'You do not have permission to invite users' });
    }
    
    // Create the invitation
    const invitation = await createInvitation(
      tenantId,
      validatedData.email,
      validatedData.role,
      tenantUser.id,
      validatedData.daysValid
    );
    
    res.status(201).json(invitation);
  } catch (error) {
    console.error('Error creating tenant invitation:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid invitation data', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to create invitation' });
  }
}

/**
 * Get all pending invitations for a tenant
 */
export async function listTenantInvitations(req: Request, res: Response) {
  try {
    const { tenantId } = req.params;
    
    // Check tenant access
    const tenantUser = req.tenantUser;
    if (!tenantUser) {
      return res.status(403).json({ error: 'You do not have access to this tenant' });
    }
    
    // Only admins and owners can view invitations
    if (tenantUser.role !== 'admin' && !tenantUser.isOwner) {
      return res.status(403).json({ error: 'You do not have permission to view invitations' });
    }
    
    const invitations = await getTenantInvitations(tenantId);
    res.json(invitations);
  } catch (error) {
    console.error('Error listing tenant invitations:', error);
    res.status(500).json({ error: 'Failed to list invitations' });
  }
}

/**
 * Revoke an invitation
 */
export async function revokeTenantInvitation(req: Request, res: Response) {
  try {
    const { tenantId, invitationId } = req.params;
    
    // Check tenant access
    const tenantUser = req.tenantUser;
    if (!tenantUser) {
      return res.status(403).json({ error: 'You do not have access to this tenant' });
    }
    
    // Only admins and owners can revoke invitations
    if (tenantUser.role !== 'admin' && !tenantUser.isOwner) {
      return res.status(403).json({ error: 'You do not have permission to revoke invitations' });
    }
    
    const deletedInvitation = await revokeInvitation(invitationId, tenantId);
    res.json(deletedInvitation);
  } catch (error) {
    console.error('Error revoking invitation:', error);
    res.status(500).json({ error: 'Failed to revoke invitation' });
  }
}

/**
 * Verify an invitation by token
 */
export async function verifyInvitationToken(req: Request, res: Response) {
  try {
    const { token } = req.params;
    
    const result = await verifyInvitation(token);
    res.json(result);
  } catch (error) {
    console.error('Error verifying invitation:', error);
    res.status(500).json({ error: 'Failed to verify invitation' });
  }
}

/**
 * Accept an invitation
 */
export async function acceptTenantInvitation(req: Request, res: Response) {
  try {
    const { token } = req.params;
    
    // Get the current user from the session
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const result = await acceptInvitation(token, currentUser.id);
    res.json(result);
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
}