-- Migration: Create Tenant-Scoped Tables
-- Description: Creates tables with tenant isolation for multi-tenant functionality

-- Create user_profiles table (tenant-scoped)
CREATE TABLE IF NOT EXISTS "user_profiles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL,
  "first_name" TEXT,
  "last_name" TEXT,
  "phone_number" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postal_code" TEXT,
  "country" TEXT,
  "date_of_birth" TIMESTAMP,
  "profile_picture_url" TEXT,
  "preferences" JSONB,
  "metadata" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE("tenant_id", "user_id")
);

-- Create properties table (tenant-scoped)
CREATE TABLE IF NOT EXISTS "properties" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "postal_code" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "property_type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "purchase_price" INTEGER NOT NULL,
  "current_value" INTEGER,
  "rental_income" INTEGER,
  "expenses" INTEGER,
  "image_urls" TEXT[],
  "latitude" TEXT,
  "longitude" TEXT,
  "square_feet" INTEGER,
  "bedrooms" INTEGER,
  "bathrooms" INTEGER,
  "year_built" INTEGER,
  "features" JSONB,
  "documents" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create investments table (tenant-scoped)
CREATE TABLE IF NOT EXISTS "investments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL,
  "property_id" UUID REFERENCES "properties"("id"),
  "amount" INTEGER NOT NULL,
  "shares" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "investment_date" TIMESTAMP NOT NULL DEFAULT now(),
  "maturity_date" TIMESTAMP,
  "expected_roi" INTEGER,
  "actual_roi" INTEGER,
  "transaction_id" TEXT,
  "payment_method" TEXT,
  "documents" JSONB,
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create wallets table (tenant-scoped)
CREATE TABLE IF NOT EXISTS "wallets" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL,
  "balance" INTEGER NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "last_updated" TIMESTAMP NOT NULL DEFAULT now(),
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE("tenant_id", "user_id")
);

-- Create transactions table (tenant-scoped)
CREATE TABLE IF NOT EXISTS "transactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL,
  "wallet_id" UUID REFERENCES "wallets"("id"),
  "type" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "external_reference_id" TEXT,
  "notes" TEXT,
  "metadata" JSONB,
  "investment_id" UUID REFERENCES "investments"("id"),
  "property_id" UUID REFERENCES "properties"("id"),
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create roi_payments table (tenant-scoped)
CREATE TABLE IF NOT EXISTS "roi_payments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "investment_id" UUID NOT NULL REFERENCES "investments"("id"),
  "user_id" INTEGER NOT NULL,
  "property_id" UUID REFERENCES "properties"("id"),
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "payment_date" TIMESTAMP NOT NULL,
  "payment_method" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "transaction_id" UUID REFERENCES "transactions"("id"),
  "notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create projects table (tenant-scoped)
CREATE TABLE IF NOT EXISTS "projects" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "start_date" TIMESTAMP,
  "end_date" TIMESTAMP,
  "target_amount" INTEGER,
  "raised_amount" INTEGER DEFAULT 0,
  "min_investment" INTEGER,
  "max_investment" INTEGER,
  "roi" INTEGER,
  "duration" INTEGER,
  "property_id" UUID REFERENCES "properties"("id"),
  "documents" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create notifications table (tenant-scoped)
CREATE TABLE IF NOT EXISTS "notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "user_id" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "data" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now()
);

-- Create indexes for better query performance on tenant-scoped tables
CREATE INDEX IF NOT EXISTS "idx_user_profiles_tenant_id" ON "user_profiles"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_user_profiles_user_id" ON "user_profiles"("user_id");

CREATE INDEX IF NOT EXISTS "idx_properties_tenant_id" ON "properties"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_properties_status" ON "properties"("status");

CREATE INDEX IF NOT EXISTS "idx_investments_tenant_id" ON "investments"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_investments_user_id" ON "investments"("user_id");
CREATE INDEX IF NOT EXISTS "idx_investments_property_id" ON "investments"("property_id");
CREATE INDEX IF NOT EXISTS "idx_investments_status" ON "investments"("status");

CREATE INDEX IF NOT EXISTS "idx_wallets_tenant_id" ON "wallets"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_wallets_user_id" ON "wallets"("user_id");

CREATE INDEX IF NOT EXISTS "idx_transactions_tenant_id" ON "transactions"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_transactions_user_id" ON "transactions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_transactions_wallet_id" ON "transactions"("wallet_id");
CREATE INDEX IF NOT EXISTS "idx_transactions_investment_id" ON "transactions"("investment_id");

CREATE INDEX IF NOT EXISTS "idx_roi_payments_tenant_id" ON "roi_payments"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_roi_payments_investment_id" ON "roi_payments"("investment_id");
CREATE INDEX IF NOT EXISTS "idx_roi_payments_user_id" ON "roi_payments"("user_id");

CREATE INDEX IF NOT EXISTS "idx_projects_tenant_id" ON "projects"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_projects_property_id" ON "projects"("property_id");
CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "projects"("status");

CREATE INDEX IF NOT EXISTS "idx_notifications_tenant_id" ON "notifications"("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_is_read" ON "notifications"("is_read");