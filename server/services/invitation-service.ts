/**
 * Invitation Service
 * 
 * This service handles tenant invitations, including creation, acceptance, and management.
 */

import { db } from '../db';
import { invitations, insertInvitationSchema } from '@shared/schema-invitations';
import { tenantUsers, tenants } from '@shared/schema-tenants';
import { users } from '@shared/schema';
import { eq, and, not, sql } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { z } from 'zod';

/**
 * Generate a unique invitation token
 */
function generateInvitationToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create a new invitation to join a tenant
 */
export async function createInvitation(
  tenantId: string,
  invitedByUserId: number,
  data: z.infer<typeof insertInvitationSchema>
) {
  try {
    // Validate the invitation data
    const validatedData = insertInvitationSchema.parse({
      ...data,
      tenantId,
      invitedByUserId,
      token: generateInvitationToken(),
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Check if an active invitation already exists for this email
    const existingInvitation = await db.query.invitations.findFirst({
      where: and(
        eq(invitations.tenantId, tenantId),
        eq(invitations.email, data.email),
        not(eq(invitations.status, 'expired')),
        not(eq(invitations.status, 'revoked'))
      )
    });
    
    if (existingInvitation) {
      throw new Error('An active invitation already exists for this email');
    }
    
    // Create the invitation
    const [invitation] = await db
      .insert(invitations)
      .values(validatedData)
      .returning();
    
    return invitation;
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
}

/**
 * Get all invitations for a tenant
 */
export async function getTenantInvitations(tenantId: string) {
  try {
    const tenantInvitations = await db.query.invitations.findMany({
      where: eq(invitations.tenantId, tenantId),
      orderBy: sql`created_at DESC`
    });
    
    return tenantInvitations;
  } catch (error) {
    console.error('Error getting tenant invitations:', error);
    throw error;
  }
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token: string) {
  try {
    const invitation = await db.query.invitations.findFirst({
      where: eq(invitations.token, token),
      with: {
        tenant: true,
        invitedBy: true
      }
    });
    
    return invitation;
  } catch (error) {
    console.error('Error getting invitation by token:', error);
    throw error;
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(token: string, userId: number) {
  try {
    return await db.transaction(async (tx) => {
      // Get the invitation
      const invitation = await tx.query.invitations.findFirst({
        where: eq(invitations.token, token)
      });
      
      if (!invitation) {
        throw new Error('Invitation not found');
      }
      
      // Check if invitation is valid
      if (invitation.status !== 'pending') {
        throw new Error(`Invitation is ${invitation.status}`);
      }
      
      if (invitation.expiresAt < new Date()) {
        // Update the invitation status to expired
        await tx
          .update(invitations)
          .set({ 
            status: 'expired',
            updatedAt: new Date()
          })
          .where(eq(invitations.id, invitation.id));
          
        throw new Error('Invitation has expired');
      }
      
      // Check if user is already a member of this tenant
      const existingTenantUser = await tx.query.tenantUsers.findFirst({
        where: and(
          eq(tenantUsers.tenantId, invitation.tenantId),
          eq(tenantUsers.userId, userId)
        )
      });
      
      if (existingTenantUser) {
        if (existingTenantUser.isActive) {
          throw new Error('You are already a member of this tenant');
        }
        
        // Reactivate the tenant-user relationship
        const [updatedTenantUser] = await tx
          .update(tenantUsers)
          .set({ 
            isActive: true,
            updatedAt: new Date()
          })
          .where(and(
            eq(tenantUsers.tenantId, invitation.tenantId),
            eq(tenantUsers.userId, userId)
          ))
          .returning();
          
        // Update the invitation status
        const [updatedInvitation] = await tx
          .update(invitations)
          .set({ 
            status: 'accepted',
            acceptedAt: new Date(),
            updatedAt: new Date(),
            acceptedByUserId: userId
          })
          .where(eq(invitations.id, invitation.id))
          .returning();
          
        return {
          tenantUser: updatedTenantUser,
          invitation: updatedInvitation
        };
      }
      
      // Create new tenant-user relationship
      const [newTenantUser] = await tx
        .insert(tenantUsers)
        .values({
          tenantId: invitation.tenantId,
          userId,
          role: invitation.role,
          isOwner: false,
          isActive: true,
          joinedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
        
      // Update the invitation status
      const [updatedInvitation] = await tx
        .update(invitations)
        .set({ 
          status: 'accepted',
          acceptedAt: new Date(),
          updatedAt: new Date(),
          acceptedByUserId: userId
        })
        .where(eq(invitations.id, invitation.id))
        .returning();
        
      return {
        tenantUser: newTenantUser,
        invitation: updatedInvitation
      };
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(invitationId: number, revokedByUserId: number) {
  try {
    const [updatedInvitation] = await db
      .update(invitations)
      .set({ 
        status: 'revoked',
        updatedAt: new Date(),
        revokedByUserId,
        revokedAt: new Date()
      })
      .where(eq(invitations.id, invitationId))
      .returning();
      
    return updatedInvitation;
  } catch (error) {
    console.error('Error revoking invitation:', error);
    throw error;
  }
}

/**
 * Resend an invitation
 */
export async function resendInvitation(invitationId: number, resendByUserId: number) {
  try {
    // Generate a new token and expiration date
    const token = generateInvitationToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    
    const [updatedInvitation] = await db
      .update(invitations)
      .set({ 
        token,
        expiresAt,
        status: 'pending',
        updatedAt: new Date(),
        resendCount: sql`${invitations.resendCount} + 1`,
        lastResendAt: new Date(),
        lastResendByUserId: resendByUserId
      })
      .where(eq(invitations.id, invitationId))
      .returning();
      
    return updatedInvitation;
  } catch (error) {
    console.error('Error resending invitation:', error);
    throw error;
  }
}