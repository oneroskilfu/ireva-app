/**
 * Tenant User Routes
 * 
 * This module provides API routes for managing users within a tenant:
 * - GET /api/tenants/:tenantId/users - List users for a tenant
 * - PATCH /api/tenants/:tenantId/users/:userId - Update a user's role
 * - DELETE /api/tenants/:tenantId/users/:userId - Remove a user from a tenant
 */

import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { tenantContext, requireTenantAdmin, requireTenantOwner } from '../middleware/tenant-context';
import { tenantUsers } from '@shared/schema-tenant-tables';
import { users } from '@shared/schema';
import { createTenantDb } from '../lib/tenant-db';

const router = Router();

// List users for a tenant (requires tenant context)
router.get('/tenants/:tenantId/users', tenantContext(), async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Create tenant-scoped database client
    const tenantDb = createTenantDb(tenantId);
    
    // Get tenant users with user details
    const tenantUsersList = await tenantDb
      .select({
        id: tenantUsers.id,
        userId: tenantUsers.userId,
        role: tenantUsers.role,
        isOwner: tenantUsers.isOwner,
        isActive: tenantUsers.isActive,
        joinedAt: tenantUsers.joinedAt,
        lastActiveAt: tenantUsers.lastActiveAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(tenantUsers)
      .leftJoin(users, eq(tenantUsers.userId, users.id))
      .where(eq(tenantUsers.isActive, true));
    
    return res.json(tenantUsersList);
  } catch (error) {
    console.error('Error listing tenant users:', error);
    return res.status(500).json({ error: 'Failed to list tenant users' });
  }
});

// Update a user's role (requires tenant context and admin role)
router.patch('/tenants/:tenantId/users/:userId', tenantContext(), requireTenantAdmin(), async (req, res) => {
  try {
    const { tenantId, userId } = req.params;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
    }
    
    // Create tenant-scoped database client
    const tenantDb = createTenantDb(tenantId);
    
    // Check if the target user is the owner
    const [targetUser] = await tenantDb
      .select({ isOwner: tenantUsers.isOwner })
      .from(tenantUsers)
      .where(
        and(
          eq(tenantUsers.tenantId, tenantId),
          eq(tenantUsers.userId, parseInt(userId))
        )
      );
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found in this organization' });
    }
    
    if (targetUser.isOwner) {
      return res.status(403).json({ error: 'Cannot change the role of the organization owner' });
    }
    
    // Check if the current user is the owner (only required for admin->user downgrades)
    if (role === 'user') {
      const [currentUser] = await tenantDb
        .select({ isOwner: tenantUsers.isOwner })
        .from(tenantUsers)
        .where(
          and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.userId, req.user.id)
          )
        );
      
      if (!currentUser.isOwner) {
        return res.status(403).json({ error: 'Only the organization owner can demote admins' });
      }
    }
    
    // Update the user's role
    const [updatedUser] = await tenantDb
      .update(tenantUsers)
      .set({ role })
      .where(
        and(
          eq(tenantUsers.tenantId, tenantId),
          eq(tenantUsers.userId, parseInt(userId))
        )
      )
      .returning();
    
    return res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Remove a user from a tenant (requires tenant context and admin or owner role)
router.delete('/tenants/:tenantId/users/:userId', tenantContext(), requireTenantAdmin(), async (req, res) => {
  try {
    const { tenantId, userId } = req.params;
    
    // Create tenant-scoped database client
    const tenantDb = createTenantDb(tenantId);
    
    // Check if the target user is the owner
    const [targetUser] = await tenantDb
      .select({ isOwner: tenantUsers.isOwner })
      .from(tenantUsers)
      .where(
        and(
          eq(tenantUsers.tenantId, tenantId),
          eq(tenantUsers.userId, parseInt(userId))
        )
      );
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found in this organization' });
    }
    
    if (targetUser.isOwner) {
      return res.status(403).json({ error: 'Cannot remove the organization owner' });
    }
    
    // Check if the target user is an admin and the current user is not the owner
    if (req.user.id !== parseInt(userId)) {
      const [targetUserDetails] = await tenantDb
        .select({ role: tenantUsers.role })
        .from(tenantUsers)
        .where(
          and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.userId, parseInt(userId))
          )
        );
      
      const [currentUser] = await tenantDb
        .select({ isOwner: tenantUsers.isOwner })
        .from(tenantUsers)
        .where(
          and(
            eq(tenantUsers.tenantId, tenantId),
            eq(tenantUsers.userId, req.user.id)
          )
        );
      
      if (targetUserDetails.role === 'admin' && !currentUser.isOwner) {
        return res.status(403).json({ error: 'Only the organization owner can remove admins' });
      }
    }
    
    // Soft delete by marking the user as inactive
    const [removedUser] = await tenantDb
      .update(tenantUsers)
      .set({ isActive: false })
      .where(
        and(
          eq(tenantUsers.tenantId, tenantId),
          eq(tenantUsers.userId, parseInt(userId))
        )
      )
      .returning();
    
    return res.json(removedUser);
  } catch (error) {
    console.error('Error removing user:', error);
    return res.status(500).json({ error: 'Failed to remove user' });
  }
});

export default router;