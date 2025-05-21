-- Rollback Migration: Drop Tenant-Scoped Tables
-- Description: Removes all tenant-scoped tables (use with caution!)

-- Drop indexes
DROP INDEX IF EXISTS "idx_notifications_is_read";
DROP INDEX IF EXISTS "idx_notifications_user_id";
DROP INDEX IF EXISTS "idx_notifications_tenant_id";

DROP INDEX IF EXISTS "idx_projects_status";
DROP INDEX IF EXISTS "idx_projects_property_id";
DROP INDEX IF EXISTS "idx_projects_tenant_id";

DROP INDEX IF EXISTS "idx_roi_payments_user_id";
DROP INDEX IF EXISTS "idx_roi_payments_investment_id";
DROP INDEX IF EXISTS "idx_roi_payments_tenant_id";

DROP INDEX IF EXISTS "idx_transactions_investment_id";
DROP INDEX IF EXISTS "idx_transactions_wallet_id";
DROP INDEX IF EXISTS "idx_transactions_user_id";
DROP INDEX IF EXISTS "idx_transactions_tenant_id";

DROP INDEX IF EXISTS "idx_wallets_user_id";
DROP INDEX IF EXISTS "idx_wallets_tenant_id";

DROP INDEX IF EXISTS "idx_investments_status";
DROP INDEX IF EXISTS "idx_investments_property_id";
DROP INDEX IF EXISTS "idx_investments_user_id";
DROP INDEX IF EXISTS "idx_investments_tenant_id";

DROP INDEX IF EXISTS "idx_properties_status";
DROP INDEX IF EXISTS "idx_properties_tenant_id";

DROP INDEX IF EXISTS "idx_user_profiles_user_id";
DROP INDEX IF EXISTS "idx_user_profiles_tenant_id";

-- Drop tables in reverse order of creation (to handle foreign key dependencies)
DROP TABLE IF EXISTS "notifications";
DROP TABLE IF EXISTS "projects";
DROP TABLE IF EXISTS "roi_payments";
DROP TABLE IF EXISTS "transactions";
DROP TABLE IF EXISTS "wallets";
DROP TABLE IF EXISTS "investments";
DROP TABLE IF EXISTS "properties";
DROP TABLE IF EXISTS "user_profiles";