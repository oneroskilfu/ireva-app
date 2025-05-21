/**
 * Invitation Controller
 * 
 * Handles HTTP requests for tenant invitations.
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { insertInvitationSchema } from '@shared/schema-invitations';
import * as invitationService from '../services/invitation-service';

/**
 * Create a new invitation
 */
export async function createInvitation(req: Request, res: Response) {
  try {
    // Get the current user and tenant from the request
    const currentUser = req.user;
    const tenantId = req.tenantId;
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    // Check if user has admin role in this tenant
    const tenantUser = req.tenantUser;
    if (!tenantUser || (tenantUser.role !== 'admin' && !tenantUser.isOwner)) {
      return res.status(403).json({ error: 'You do not have permission to invite users to this tenant' });
    }
    
    // Validate request body
    const validatedData = insertInvitationSchema.omit({
      id: true,
      tenantId: true,
      invitedByUserId: true,
      status: true,
      token: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true
    }).parse(req.body);
    
    // Create the invitation
    const invitation = await invitationService.createInvitation(
      tenantId,
      currentUser.id,
      validatedData
    );
    
    // TODO: Send invitation email
    
    res.status(201).json(invitation);
  } catch (error) {
    console.error('Error creating invitation:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid invitation data', details: error.errors });
    }
    
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to create invitation' });
  }
}

/**
 * Get all invitations for a tenant
 */
export async function getTenantInvitations(req: Request, res: Response) {
  try {
    const tenantId = req.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    // Check tenant access
    if (!req.tenantUser) {
      return res.status(403).json({ error: 'You do not have access to this tenant' });
    }
    
    // Get invitations
    const invitations = await invitationService.getTenantInvitations(tenantId);
    
    res.json(invitations);
  } catch (error) {
    console.error('Error getting tenant invitations:', error);
    res.status(500).json({ error: 'Failed to get invitations' });
  }
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(req: Request, res: Response) {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ error: 'Invitation token is required' });
    }
    
    // Get invitation
    const invitation = await invitationService.getInvitationByToken(token);
    
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    
    res.json(invitation);
  } catch (error) {
    console.error('Error getting invitation:', error);
    res.status(500).json({ error: 'Failed to get invitation' });
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(req: Request, res: Response) {
  try {
    const { token } = req.params;
    const currentUser = req.user;
    
    if (!token) {
      return res.status(400).json({ error: 'Invitation token is required' });
    }
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Accept invitation
    const result = await invitationService.acceptInvitation(token, currentUser.id);
    
    res.json(result);
  } catch (error) {
    console.error('Error accepting invitation:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(req: Request, res: Response) {
  try {
    const { invitationId } = req.params;
    const currentUser = req.user;
    const tenantId = req.tenantId;
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    // Check if user has admin role in this tenant
    const tenantUser = req.tenantUser;
    if (!tenantUser || (tenantUser.role !== 'admin' && !tenantUser.isOwner)) {
      return res.status(403).json({ error: 'You do not have permission to revoke invitations' });
    }
    
    // Revoke invitation
    const updatedInvitation = await invitationService.revokeInvitation(
      parseInt(invitationId),
      currentUser.id
    );
    
    res.json(updatedInvitation);
  } catch (error) {
    console.error('Error revoking invitation:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to revoke invitation' });
  }
}

/**
 * Resend an invitation
 */
export async function resendInvitation(req: Request, res: Response) {
  try {
    const { invitationId } = req.params;
    const currentUser = req.user;
    const tenantId = req.tenantId;
    
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }
    
    // Check if user has admin role in this tenant
    const tenantUser = req.tenantUser;
    if (!tenantUser || (tenantUser.role !== 'admin' && !tenantUser.isOwner)) {
      return res.status(403).json({ error: 'You do not have permission to resend invitations' });
    }
    
    // Resend invitation
    const updatedInvitation = await invitationService.resendInvitation(
      parseInt(invitationId),
      currentUser.id
    );
    
    // TODO: Send invitation email
    
    res.json(updatedInvitation);
  } catch (error) {
    console.error('Error resending invitation:', error);
    
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to resend invitation' });
  }
}