/**
 * Tenant Routes
 * 
 * Defines API routes for tenant management.
 */

import express from 'express';
import {
  createTenant,
  getUserTenants,
  getTenantById,
  updateTenant,
  getTenantUsers
} from '../controllers/tenant-controller';
import { requireAuth } from '../middleware/auth-middleware';
import { requireTenantAccess } from '../middleware/tenant-context';

const router = express.Router();

// Routes for tenant creation and listing
router.post('/tenants', requireAuth, createTenant);
router.get('/tenants', requireAuth, getUserTenants);

// Routes that require tenant context
router.get('/tenants/:tenantId', requireAuth, requireTenantAccess, getTenantById);
router.put('/tenants/:tenantId', requireAuth, requireTenantAccess, updateTenant);
router.get('/tenants/:tenantId/users', requireAuth, requireTenantAccess, getTenantUsers);

export default router;