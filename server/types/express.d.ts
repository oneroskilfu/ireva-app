/**
 * Express Extension Types
 * 
 * This file extends the Express Request interface to include
 * tenant-related properties and types.
 */

import { User } from '@shared/schema';
import { TenantUser } from '@shared/schema-tenants';

declare global {
  namespace Express {
    interface Request {
      // Tenant-related properties
      tenantId?: string;
      tenantUser?: TenantUser;
      tenantDb?: any; // Type for tenant-scoped database client
    }
  }
}