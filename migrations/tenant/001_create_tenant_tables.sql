-- Create Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT,
  logo TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  subscription_status TEXT NOT NULL DEFAULT 'active',
  subscription_expires_at TIMESTAMP,
  max_users INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on tenant slug
CREATE UNIQUE INDEX IF NOT EXISTS tenant_slug_idx ON tenants(slug);

-- Create Tenant Users join table
CREATE TABLE IF NOT EXISTS tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  permissions TEXT[],
  is_owner BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

-- Create index on tenant_user combination
CREATE UNIQUE INDEX IF NOT EXISTS tenant_user_idx ON tenant_users(tenant_id, user_id);

-- Create Tenant Invitations table
CREATE TABLE IF NOT EXISTS tenant_invitations (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  invited_by_user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  accepted_by_user_id INTEGER REFERENCES users(id),
  revoked_at TIMESTAMP,
  revoked_by_user_id INTEGER REFERENCES users(id),
  resend_count INTEGER NOT NULL DEFAULT 0,
  last_resend_at TIMESTAMP,
  last_resend_by_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for invitations
CREATE UNIQUE INDEX IF NOT EXISTS invitation_token_idx ON tenant_invitations(token);
CREATE UNIQUE INDEX IF NOT EXISTS invitation_email_tenant_idx ON tenant_invitations(email, tenant_id);