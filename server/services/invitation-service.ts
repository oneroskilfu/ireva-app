/**
 * Invitation Service
 * 
 * This service handles creating, accepting, and revoking invitations
 * for users to join tenant organizations.
 */

import { eq, and, sql, desc } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { db } from '../db';
import { tenantInvitations, tenantUsers } from '@shared/schema-tenant-tables';
import { tenants } from '@shared/schema-tenants';
import { users } from '@shared/schema';
import { createTenantDb } from '../lib/tenant-db';

// Add 7 days to the current date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Generate a random token
const generateToken = (): string => {
  return randomBytes(32).toString('hex');
};

// Check if user already has access to tenant
export async function hasUserAccessToTenant(userId: number, tenantId: string): Promise<boolean> {
  const [tenantUser] = await db
    .select({ id: tenantUsers.id })
    .from(tenantUsers)
    .where(
      and(
        eq(tenantUsers.tenantId, tenantId),
        eq(tenantUsers.userId, userId)
      )
    );
  
  return !!tenantUser;
}

// Check if user already has a pending invitation
export async function hasPendingInvitation(email: string, tenantId: string): Promise<boolean> {
  const [invitation] = await db
    .select({ id: tenantInvitations.id })
    .from(tenantInvitations)
    .where(
      and(
        eq(tenantInvitations.tenantId, tenantId),
        eq(tenantInvitations.email, email.toLowerCase()),
        eq(tenantInvitations.status, 'pending'),
        sql`${tenantInvitations.expiresAt} > CURRENT_TIMESTAMP`
      )
    );
  
  return !!invitation;
}

// Create invitation
export async function createInvitation(
  tenantId: string,
  email: string,
  role: string,
  createdByUserId: number
): Promise<any> {
  // Check if user has access to tenant
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()));
  
  if (user) {
    const hasAccess = await hasUserAccessToTenant(user.id, tenantId);
    if (hasAccess) {
      throw new Error('User already has access to this organization');
    }
  }
  
  // Check if user already has a pending invitation
  const hasPending = await hasPendingInvitation(email, tenantId);
  if (hasPending) {
    throw new Error('User already has a pending invitation');
  }
  
  // Generate token and expiration date
  const token = generateToken();
  const expiresAt = addDays(new Date(), 7);
  
  // Create invitation
  const [invitation] = await db
    .insert(tenantInvitations)
    .values({
      tenantId,
      email: email.toLowerCase(),
      role,
      token,
      expiresAt,
      createdByUserId,
      status: 'pending',
    })
    .returning();
  
  return invitation;
}

// Get invitation by token
export async function getInvitationByToken(token: string): Promise<any> {
  const [invitation] = await db
    .select({
      id: tenantInvitations.id,
      tenantId: tenantInvitations.tenantId,
      email: tenantInvitations.email,
      role: tenantInvitations.role,
      status: tenantInvitations.status,
      expiresAt: tenantInvitations.expiresAt,
      tenantName: tenants.name,
    })
    .from(tenantInvitations)
    .leftJoin(tenants, eq(tenantInvitations.tenantId, tenants.id))
    .where(
      and(
        eq(tenantInvitations.token, token),
        eq(tenantInvitations.status, 'pending'),
        sql`${tenantInvitations.expiresAt} > CURRENT_TIMESTAMP`
      )
    );
  
  return invitation;
}

// Accept invitation
export async function acceptInvitation(token: string, userId: number): Promise<any> {
  const invitation = await getInvitationByToken(token);
  
  if (!invitation) {
    throw new Error('Invalid or expired invitation');
  }
  
  return await db.transaction(async (tx) => {
    // Check if user already has access to tenant
    const hasAccess = await hasUserAccessToTenant(userId, invitation.tenantId);
    if (hasAccess) {
      // Update invitation status
      await tx
        .update(tenantInvitations)
        .set({
          status: 'accepted',
          acceptedByUserId: userId,
          acceptedAt: new Date(),
        })
        .where(eq(tenantInvitations.token, token));
      
      throw new Error('You already have access to this organization');
    }
    
    // Add user to tenant
    const [tenantUser] = await tx
      .insert(tenantUsers)
      .values({
        tenantId: invitation.tenantId,
        userId,
        role: invitation.role,
        isOwner: false,
      })
      .returning();
    
    // Update invitation status
    await tx
      .update(tenantInvitations)
      .set({
        status: 'accepted',
        acceptedByUserId: userId,
        acceptedAt: new Date(),
      })
      .where(eq(tenantInvitations.token, token));
    
    return {
      tenantUser,
      invitation,
    };
  });
}

// Revoke invitation
export async function revokeInvitation(invitationId: number, tenantId: string): Promise<any> {
  // Create tenant-scoped database client
  const tenantDb = createTenantDb(tenantId);
  
  // Check if invitation exists and belongs to the tenant
  const [invitation] = await tenantDb
    .select({ id: tenantInvitations.id })
    .from(tenantInvitations)
    .where(
      and(
        eq(tenantInvitations.id, invitationId),
        eq(tenantInvitations.status, 'pending')
      )
    );
  
  if (!invitation) {
    throw new Error('Invitation not found or already processed');
  }
  
  // Update invitation status
  const [revokedInvitation] = await tenantDb
    .update(tenantInvitations)
    .set({
      status: 'revoked',
    })
    .where(eq(tenantInvitations.id, invitationId))
    .returning();
  
  return revokedInvitation;
}

// Get all invitations for a tenant
export async function getInvitationsByTenant(tenantId: string): Promise<any[]> {
  // Create tenant-scoped database client
  const tenantDb = createTenantDb(tenantId);
  
  const invitations = await tenantDb
    .select({
      id: tenantInvitations.id,
      email: tenantInvitations.email,
      role: tenantInvitations.role,
      status: tenantInvitations.status,
      createdAt: tenantInvitations.createdAt,
      expiresAt: tenantInvitations.expiresAt,
      createdByUser: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(tenantInvitations)
    .leftJoin(users, eq(tenantInvitations.createdByUserId, users.id))
    .orderBy(desc(tenantInvitations.createdAt));
  
  return invitations;
}

// Resend invitation
export async function resendInvitation(invitationId: number, tenantId: string): Promise<any> {
  // Create tenant-scoped database client
  const tenantDb = createTenantDb(tenantId);
  
  // Check if invitation exists and belongs to the tenant
  const [invitation] = await tenantDb
    .select({ 
      id: tenantInvitations.id,
      status: tenantInvitations.status,
      token: tenantInvitations.token,
    })
    .from(tenantInvitations)
    .where(eq(tenantInvitations.id, invitationId));
  
  if (!invitation) {
    throw new Error('Invitation not found');
  }
  
  if (invitation.status !== 'pending') {
    throw new Error('Invitation has already been processed');
  }
  
  // Generate new token and expiration date
  const token = generateToken();
  const expiresAt = addDays(new Date(), 7);
  
  // Update invitation
  const [updatedInvitation] = await tenantDb
    .update(tenantInvitations)
    .set({
      token,
      expiresAt,
    })
    .where(eq(tenantInvitations.id, invitationId))
    .returning();
  
  return updatedInvitation;
}