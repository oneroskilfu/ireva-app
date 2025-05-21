import { TenantUser } from '@shared/schema-tenants';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantUser?: TenantUser;
      tenantSlug?: string;
    }
  }
}