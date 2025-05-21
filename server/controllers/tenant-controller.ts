/**
 * Tenant Controller
 * 
 * Handles HTTP requests for tenant management.
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { tenants, tenantUsers, insertTenantSchema } from '@shared/schema-tenants';
import { eq } from 'drizzle-orm';

/**
 * Create a new tenant
 */
export async function createTenant(req: Request, res: Response) {
  try {
    // Get the current user from the session
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Validate request body
    const validatedData = insertTenantSchema.parse(req.body);
    
    // Create the tenant in a transaction
    const result = await db.transaction(async (tx) => {
      // Create the tenant
      const [tenant] = await tx
        .insert(tenants)
        .values(validatedData)
        .returning();
      
      // Create the tenant-user association with owner role
      const [tenantUser] = await tx
        .insert(tenantUsers)
        .values({
          tenantId: tenant.id,
          userId: currentUser.id,
          role: 'admin',
          isOwner: true,
          isActive: true,
          joinedAt: new Date()
        })
        .returning();
      
      return { tenant, tenantUser };
    });
    
    res.status(201).json(result.tenant);
  } catch (error) {
    console.error('Error creating tenant:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid tenant data', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to create tenant' });
  }
}

/**
 * Get all tenants the current user has access to
 */
export async function getUserTenants(req: Request, res: Response) {
  try {
    // Get the current user from the session
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Get all tenants the user has access to
    const userTenants = await db.query.tenantUsers.findMany({
      where: eq(tenantUsers.userId, currentUser.id),
      with: {
        tenant: true
      }
    });
    
    // Format the response
    const formattedTenants = userTenants.map(userTenant => ({
      ...userTenant.tenant,
      role: userTenant.role,
      isOwner: userTenant.isOwner
    }));
    
    res.json(formattedTenants);
  } catch (error) {
    console.error('Error getting user tenants:', error);
    res.status(500).json({ error: 'Failed to get tenants' });
  }
}

/**
 * Get a tenant by ID
 */
export async function getTenantById(req: Request, res: Response) {
  try {
    const { tenantId } = req.params;
    
    // Get the tenant
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId)
    });
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Check if the user has access to this tenant
    if (!req.tenantUser) {
      return res.status(403).json({ error: 'You do not have access to this tenant' });
    }
    
    res.json(tenant);
  } catch (error) {
    console.error('Error getting tenant:', error);
    res.status(500).json({ error: 'Failed to get tenant' });
  }
}

/**
 * Update a tenant
 */
export async function updateTenant(req: Request, res: Response) {
  try {
    const { tenantId } = req.params;
    
    // Check tenant access and admin rights
    const tenantUser = req.tenantUser;
    if (!tenantUser) {
      return res.status(403).json({ error: 'You do not have access to this tenant' });
    }
    
    // Only admins and owners can update tenants
    if (tenantUser.role !== 'admin' && !tenantUser.isOwner) {
      return res.status(403).json({ error: 'You do not have permission to update this tenant' });
    }
    
    // Validate request body
    const validatedData = insertTenantSchema.partial().parse(req.body);
    
    // Update the tenant
    const [updatedTenant] = await db
      .update(tenants)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, tenantId))
      .returning();
    
    if (!updatedTenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json(updatedTenant);
  } catch (error) {
    console.error('Error updating tenant:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid tenant data', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to update tenant' });
  }
}

/**
 * Get all users in a tenant
 */
export async function getTenantUsers(req: Request, res: Response) {
  try {
    const { tenantId } = req.params;
    
    // Check tenant access
    if (!req.tenantUser) {
      return res.status(403).json({ error: 'You do not have access to this tenant' });
    }
    
    // Get all users in the tenant
    const users = await db.query.tenantUsers.findMany({
      where: eq(tenantUsers.tenantId, tenantId),
      with: {
        tenant: true
      }
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error getting tenant users:', error);
    res.status(500).json({ error: 'Failed to get tenant users' });
  }
}