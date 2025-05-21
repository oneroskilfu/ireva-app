/**
 * Tenant Invitation Service
 * 
 * Handles creating, retrieving, and processing tenant invitations.
 */

import { db } from '../db';
import { tenantInvitations } from '@shared/schema-invitations';
import { tenants, tenantUsers } from '@shared/schema-tenants';
import { eq, and } from 'drizzle-orm';
import { randomBytes } from 'crypto';

/**
 * Generate a secure random token for invitations
 */
function generateInvitationToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Calculate the expiration date for an invitation (default: 7 days)
 */
function calculateExpirationDate(daysValid: number = 7): Date {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + daysValid);
  return expirationDate;
}

/**
 * Create a new invitation to join a tenant
 */
export async function createInvitation(tenantId: string, email: string, role: string, invitedById: string, daysValid: number = 7) {
  try {
    // Check if tenant exists
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId)
    });
    
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Check if an active invitation already exists for this email and tenant
    const existingInvitation = await db.query.tenantInvitations.findFirst({
      where: and(
        eq(tenantInvitations.tenantId, tenantId),
        eq(tenantInvitations.email, email),
        eq(tenantInvitations.accepted, false)
      )
    });

    if (existingInvitation) {
      // Revoke the existing invitation by updating its token
      const token = generateInvitationToken();
      const expires = calculateExpirationDate(daysValid);
      
      const [updatedInvitation] = await db
        .update(tenantInvitations)
        .set({ 
          token,
          expires,
          invitedById
        })
        .where(eq(tenantInvitations.id, existingInvitation.id))
        .returning();
        
      return updatedInvitation;
    }

    // Create a new invitation
    const token = generateInvitationToken();
    const expires = calculateExpirationDate(daysValid);
    
    const [invitation] = await db
      .insert(tenantInvitations)
      .values({
        tenantId,
        email,
        role,
        token,
        invitedById,
        expires,
      })
      .returning();
      
    return invitation;
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
}

/**
 * Verify if an invitation token is valid
 */
export async function verifyInvitation(token: string) {
  try {
    const invitation = await db.query.tenantInvitations.findFirst({
      where: eq(tenantInvitations.token, token),
      with: {
        tenant: true
      }
    });

    if (!invitation) {
      return { valid: false, message: 'Invitation not found' };
    }

    if (invitation.accepted) {
      return { valid: false, message: 'Invitation already accepted' };
    }

    const now = new Date();
    if (now > invitation.expires) {
      return { valid: false, message: 'Invitation has expired' };
    }

    return { 
      valid: true, 
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        tenantId: invitation.tenantId,
        tenantName: invitation.tenant.name
      }
    };
  } catch (error) {
    console.error('Error verifying invitation:', error);
    throw error;
  }
}

/**
 * Accept an invitation and create a tenant user association
 */
export async function acceptInvitation(token: string, userId: number) {
  try {
    // Verify the invitation
    const verificationResult = await verifyInvitation(token);
    if (!verificationResult.valid) {
      throw new Error(verificationResult.message);
    }

    const { invitation } = verificationResult;

    // Begin a transaction to ensure both operations succeed or fail together
    const now = new Date();
    
    // Update the invitation as accepted
    const [updatedInvitation] = await db
      .update(tenantInvitations)
      .set({ 
        accepted: true,
        acceptedAt: now
      })
      .where(eq(tenantInvitations.token, token))
      .returning();

    // Create the tenant user association
    const [tenantUser] = await db
      .insert(tenantUsers)
      .values({
        tenantId: invitation.tenantId,
        userId,
        role: invitation.role,
        joinedAt: now
      })
      .returning();

    return {
      invitation: updatedInvitation,
      tenantUser
    };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
}

/**
 * Revoke (delete) an invitation
 */
export async function revokeInvitation(invitationId: string, tenantId: string) {
  try {
    const [deletedInvitation] = await db
      .delete(tenantInvitations)
      .where(
        and(
          eq(tenantInvitations.id, invitationId),
          eq(tenantInvitations.tenantId, tenantId)
        )
      )
      .returning();
      
    if (!deletedInvitation) {
      throw new Error('Invitation not found or already deleted');
    }
    
    return deletedInvitation;
  } catch (error) {
    console.error('Error revoking invitation:', error);
    throw error;
  }
}

/**
 * Get all pending invitations for a tenant
 */
export async function getTenantInvitations(tenantId: string) {
  try {
    const invitations = await db.query.tenantInvitations.findMany({
      where: and(
        eq(tenantInvitations.tenantId, tenantId),
        eq(tenantInvitations.accepted, false)
      ),
      orderBy: (invitation) => invitation.createdAt,
      with: {
        invitedBy: true
      }
    });
    
    return invitations;
  } catch (error) {
    console.error('Error getting tenant invitations:', error);
    throw error;
  }
}