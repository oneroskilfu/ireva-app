-- Migration: Create Tenant Tables
-- Description: Creates the base tables needed for multi-tenant functionality

-- Create tenants table
CREATE TABLE IF NOT EXISTS "tenants" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'active',
  "tier" TEXT NOT NULL DEFAULT 'basic',
  "primary_contact_email" TEXT NOT NULL,
  "primary_contact_name" TEXT NOT NULL,
  "primary_contact_phone" TEXT,
  "billing_email" TEXT,
  "billing_address" TEXT,
  "subscription_id" TEXT,
  "subscription_status" TEXT,
  "subscription_start_date" TIMESTAMP,
  "subscription_end_date" TIMESTAMP,
  "logo_url" TEXT,
  "custom_domain" TEXT,
  "theme" JSONB,
  "max_users" INTEGER,
  "user_count" INTEGER NOT NULL DEFAULT 0,
  "features" JSONB,
  "metadata" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create tenant_users junction table
CREATE TABLE IF NOT EXISTS "tenant_users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "is_owner" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
  "last_access_at" TIMESTAMP,
  "invited_by" INTEGER,
  "metadata" JSONB,
  UNIQUE("tenant_id", "user_id")
);

-- Create tenant_invitations table
CREATE TABLE IF NOT EXISTS "tenant_invitations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "invited_by_user_id" INTEGER NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "token" TEXT NOT NULL UNIQUE,
  "expires_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_tenant_users_tenant_id" ON "tenant_users"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_tenant_users_user_id" ON "tenant_users"("user_id");
CREATE INDEX IF NOT EXISTS "idx_tenant_invitations_tenant_id" ON "tenant_invitations"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_tenant_invitations_email" ON "tenant_invitations"("email");
CREATE INDEX IF NOT EXISTS "idx_tenant_invitations_token" ON "tenant_invitations"("token");
CREATE INDEX IF NOT EXISTS "idx_tenants_slug" ON "tenants"("slug");