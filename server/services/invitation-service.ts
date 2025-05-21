/**
 * Invitation Service
 * 
 * This service handles invitations to join tenant organizations
 */

import { db } from '../db';
import { 
  tenantInvitations, 
  tenantUsers,
  tenants
} from '@shared/schema-tenant-tables';
import { eq, and, sql, desc, lt, inArray } from 'drizzle-orm';
import { 
  TenantInvitation, 
  InsertTenantInvitation,
  TenantUser,
  InsertTenantUser
} from '@shared/schema-tenant-tables';
import { v4 as uuidv4 } from 'uuid';
import { users } from '@shared/schema';

/**
 * Create a new invitation to join a tenant
 */
export async function createInvitation(
  tenantId: string, 
  createdByUserId: number,
  data: { email: string; role: string }
): Promise<TenantInvitation> {
  // Check if the user already has an active invitation
  const existingInvitations = await getInvitationsByEmail(tenantId, data.email);
  if (existingInvitations.length > 0) {
    // Just return the existing invitation
    return existingInvitations[0];
  }
  
  try {
    // Generate a unique token
    const token = uuidv4();
    
    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Create the invitation
    const [invitation] = await db
      .insert(tenantInvitations)
      .values({
        tenantId,
        email: data.email.toLowerCase(),
        role: data.role,
        token,
        status: 'pending',
        createdByUserId,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      })
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
export async function getTenantInvitations(tenantId: string): Promise<TenantInvitation[]> {
  try {
    const invitations = await db.query.tenantInvitations.findMany({
      where: eq(tenantInvitations.tenantId, tenantId),
      orderBy: desc(tenantInvitations.createdAt)
    });
    
    return invitations;
  } catch (error) {
    console.error('Error getting tenant invitations:', error);
    throw error;
  }
}

/**
 * Get invitations for a specific email in a tenant
 */
export async function getInvitationsByEmail(
  tenantId: string,
  email: string
): Promise<TenantInvitation[]> {
  try {
    const invitations = await db.query.tenantInvitations.findMany({
      where: and(
        eq(tenantInvitations.tenantId, tenantId),
        eq(tenantInvitations.email, email.toLowerCase()),
        eq(tenantInvitations.status, 'pending'),
        lt(new Date(), tenantInvitations.expiresAt)
      )
    });
    
    return invitations;
  } catch (error) {
    console.error('Error getting invitations by email:', error);
    throw error;
  }
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token: string): Promise<TenantInvitation | null> {
  try {
    const [invitation] = await db.query.tenantInvitations.findMany({
      where: and(
        eq(tenantInvitations.token, token),
        eq(tenantInvitations.status, 'pending'),
        lt(new Date(), tenantInvitations.expiresAt)
      ),
      with: {
        tenant: true,
        createdByUser: true
      },
      limit: 1
    });
    
    return invitation || null;
  } catch (error) {
    console.error('Error getting invitation by token:', error);
    throw error;
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(
  token: string,
  userId: number
): Promise<TenantUser | null> {
  try {
    // Run everything in a transaction
    return await db.transaction(async (tx) => {
      // Get the invitation
      const invitation = await getInvitationByToken(token);
      if (!invitation) {
        throw new Error('Invitation not found or expired');
      }
      
      // Check if the user is already a member of the tenant
      const [existingUser] = await tx
        .select()
        .from(tenantUsers)
        .where(
          and(
            eq(tenantUsers.tenantId, invitation.tenantId),
            eq(tenantUsers.userId, userId)
          )
        );
      
      if (existingUser) {
        // Update the invitation
        await tx
          .update(tenantInvitations)
          .set({
            status: 'accepted',
            updatedAt: new Date()
          })
          .where(eq(tenantInvitations.token, token));
        
        return existingUser;
      }
      
      // Add user to tenant
      const [tenantUser] = await tx
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
      
      // Update the invitation
      await tx
        .update(tenantInvitations)
        .set({
          status: 'accepted',
          acceptedByUserId: userId,
          acceptedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(tenantInvitations.token, token));
      
      return tenantUser;
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
}

/**
 * Revoke an invitation
 */
export async function revokeInvitation(
  tenantId: string,
  invitationId: number
): Promise<boolean> {
  try {
    // First ensure the invitation belongs to this tenant
    const [invitation] = await db
      .select()
      .from(tenantInvitations)
      .where(
        and(
          eq(tenantInvitations.tenantId, tenantId),
          eq(tenantInvitations.id, invitationId)
        )
      );
    
    if (!invitation) {
      return false;
    }
    
    // Update the invitation
    await db
      .update(tenantInvitations)
      .set({
        status: 'revoked',
        updatedAt: new Date()
      })
      .where(
        and(
          eq(tenantInvitations.tenantId, tenantId),
          eq(tenantInvitations.id, invitationId)
        )
      );
    
    return true;
  } catch (error) {
    console.error('Error revoking invitation:', error);
    throw error;
  }
}

/**
 * Check if an email is already invited to any tenant
 */
export async function checkEmailInvitedToAnyTenant(email: string): Promise<{
  tenantId: string;
  tenantName: string;
  invitationId: number;
  token: string;
}[]> {
  try {
    const result = await db
      .select({
        tenantId: tenantInvitations.tenantId,
        tenantName: tenants.name,
        invitationId: tenantInvitations.id,
        token: tenantInvitations.token
      })
      .from(tenantInvitations)
      .leftJoin(
        tenants,
        eq(tenantInvitations.tenantId, tenants.id)
      )
      .where(
        and(
          eq(tenantInvitations.email, email.toLowerCase()),
          eq(tenantInvitations.status, 'pending'),
          lt(new Date(), tenantInvitations.expiresAt)
        )
      );
    
    return result;
  } catch (error) {
    console.error('Error checking if email is invited to any tenant:', error);
    throw error;
  }
}

/**
 * Get pending invitations for a user by email
 */
export async function getPendingInvitationsForEmail(email: string): Promise<(TenantInvitation & {
  tenant: { id: string; name: string; }
})[]> {
  try {
    const invitations = await db.query.tenantInvitations.findMany({
      where: and(
        eq(tenantInvitations.email, email.toLowerCase()),
        eq(tenantInvitations.status, 'pending'),
        lt(new Date(), tenantInvitations.expiresAt)
      ),
      with: {
        tenant: {
          columns: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return invitations;
  } catch (error) {
    console.error('Error getting pending invitations for email:', error);
    throw error;
  }
}