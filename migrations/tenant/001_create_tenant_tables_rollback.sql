-- Rollback Migration: Drop Tenant Tables
-- Description: Removes all tenant-related tables (use with caution!)

-- Drop indexes
DROP INDEX IF EXISTS "idx_tenants_slug";
DROP INDEX IF EXISTS "idx_tenant_invitations_token";
DROP INDEX IF EXISTS "idx_tenant_invitations_email";
DROP INDEX IF EXISTS "idx_tenant_invitations_tenant_id";
DROP INDEX IF EXISTS "idx_tenant_users_user_id";
DROP INDEX IF EXISTS "idx_tenant_users_tenant_id";

-- Drop tables in reverse order of creation (to handle foreign key dependencies)
DROP TABLE IF EXISTS "tenant_invitations";
DROP TABLE IF EXISTS "tenant_users";
DROP TABLE IF EXISTS "tenants";