/**
 * Tenant Routes
 * 
 * This module provides API routes for managing tenant organizations:
 * - GET /api/tenants - List tenants for the current user
 * - GET /api/tenants/:tenantId - Get tenant details
 * - POST /api/tenants - Create a new tenant
 * - PATCH /api/tenants/:tenantId - Update tenant details
 * - POST /api/tenants/:tenantId/logo - Upload tenant logo
 */

import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { db } from '../db';
import { tenantContext, requireTenantAdmin } from '../middleware/tenant-context';
import { tenants, insertTenantSchema } from '@shared/schema-tenants';
import { tenantUsers } from '@shared/schema-tenant-tables';
import { createTenantDb } from '../lib/tenant-db';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads/logos');
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// List tenants for the current user
router.get('/tenants', async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Get tenants the user has access to
    const userTenants = await db
      .select({
        id: tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        logo: tenants.logo,
        role: tenantUsers.role,
        isOwner: tenantUsers.isOwner,
      })
      .from(tenantUsers)
      .leftJoin(tenants, eq(tenantUsers.tenantId, tenants.id))
      .where(
        and(
          eq(tenantUsers.userId, req.user.id),
          eq(tenantUsers.isActive, true),
          eq(tenants.isActive, true)
        )
      );
    
    return res.json(userTenants);
  } catch (error: any) {
    console.error('Error listing tenants:', error);
    return res.status(500).json({ error: 'Failed to list tenants' });
  }
});

// Get tenant details
router.get('/tenants/:tenantId', tenantContext(), async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Create tenant-scoped database client
    const tenantDb = createTenantDb(tenantId);
    
    // Get tenant details
    const [tenant] = await tenantDb
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    return res.json(tenant);
  } catch (error: any) {
    console.error('Error getting tenant:', error);
    return res.status(500).json({ error: 'Failed to get tenant' });
  }
});

// Create a new tenant
router.post('/tenants', async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Validate request body
    const parsedBody = insertTenantSchema.safeParse(req.body);
    
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.format() });
    }
    
    // Check if slug is already taken
    const [existingTenant] = await db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, parsedBody.data.slug));
    
    if (existingTenant) {
      return res.status(400).json({ error: 'Organization slug is already taken' });
    }
    
    // Create tenant
    return await db.transaction(async (tx) => {
      // Insert new tenant
      const [tenant] = await tx
        .insert(tenants)
        .values(parsedBody.data)
        .returning();
      
      // Add current user as owner
      await tx
        .insert(tenantUsers)
        .values({
          tenantId: tenant.id,
          userId: req.user.id,
          role: 'admin',
          isOwner: true,
        });
      
      return res.status(201).json(tenant);
    });
  } catch (error: any) {
    console.error('Error creating tenant:', error);
    return res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// Update tenant details
router.patch('/tenants/:tenantId', tenantContext(), requireTenantAdmin(), async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    // Create tenant-scoped database client
    const tenantDb = createTenantDb(tenantId);
    
    // Only allow updating specific fields
    const allowedFields = [
      'name',
      'description',
      'website',
      'industry',
      'address',
      'city',
      'state',
      'country',
      'postalCode',
      'phone',
      'email',
    ];
    
    const updateData: Record<string, any> = {};
    
    // Filter out disallowed fields
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field) && req.body[field] !== undefined) {
        // Use Object.defineProperty to safely assign without prototype pollution
        Object.defineProperty(updateData, field, {
          value: req.body[field],
          enumerable: true,
          writable: true,
          configurable: true
        });
      }
    }
    
    // If nothing to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    // Update tenant
    const [updatedTenant] = await tenantDb
      .update(tenants)
      .set(updateData)
      .where(eq(tenants.id, tenantId))
      .returning();
    
    return res.json(updatedTenant);
  } catch (error: any) {
    console.error('Error updating tenant:', error);
    return res.status(500).json({ error: 'Failed to update tenant' });
  }
});

// Upload tenant logo
router.post(
  '/tenants/:tenantId/logo',
  tenantContext(),
  requireTenantAdmin(),
  upload.single('logo'),
  async (req, res) => {
    try {
      const { tenantId } = req.params;
      
      // Ensure file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No logo file provided' });
      }
      
      // Create tenant-scoped database client
      const tenantDb = createTenantDb(tenantId);
      
      // Get the uploaded file path
      const filePath = req.file.path;
      
      // Create the public URL for the logo
      const baseUrl = process.env.NODE_ENV === 'production'
        ? process.env.APP_URL || `https://${req.headers.host}`
        : `http://${req.headers.host}`;
      
      const logoUrl = `${baseUrl}/uploads/logos/${path.basename(filePath)}`;
      
      // Update tenant with logo URL
      const [updatedTenant] = await tenantDb
        .update(tenants)
        .set({ logo: logoUrl })
        .where(eq(tenants.id, tenantId))
        .returning();
      
      return res.json(updatedTenant);
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      return res.status(500).json({ error: error.message || 'Failed to upload logo' });
    }
  }
);

export default router;