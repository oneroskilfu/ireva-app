-- Create tenant-scoped property table
CREATE TABLE IF NOT EXISTS tenant_properties (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  price NUMERIC NOT NULL,
  size NUMERIC NOT NULL,
  roi NUMERIC NOT NULL,
  funding_goal NUMERIC NOT NULL,
  funding_progress NUMERIC NOT NULL DEFAULT 0,
  min_investment NUMERIC NOT NULL,
  max_investment NUMERIC,
  duration INTEGER NOT NULL,
  images JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  latitude NUMERIC,
  longitude NUMERIC,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on tenant properties
CREATE INDEX IF NOT EXISTS idx_tenant_properties_tenant_id ON tenant_properties(tenant_id);

-- Create tenant-scoped investments table
CREATE TABLE IF NOT EXISTS tenant_investments (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  property_id INTEGER NOT NULL REFERENCES tenant_properties(id),
  amount NUMERIC NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_id VARCHAR(100),
  contract_id VARCHAR(100),
  shares_count NUMERIC,
  investment_date TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes on tenant investments
CREATE INDEX IF NOT EXISTS idx_tenant_investments_tenant_id ON tenant_investments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_investments_user_id ON tenant_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_investments_property_id ON tenant_investments(property_id);

-- Create tenant-scoped transactions table
CREATE TABLE IF NOT EXISTS tenant_transactions (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  investment_id INTEGER REFERENCES tenant_investments(id),
  type VARCHAR(20) NOT NULL,
  amount NUMERIC NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  description TEXT,
  reference VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes on tenant transactions
CREATE INDEX IF NOT EXISTS idx_tenant_transactions_tenant_id ON tenant_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_transactions_user_id ON tenant_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_transactions_investment_id ON tenant_transactions(investment_id);

-- Create tenant-scoped documents table
CREATE TABLE IF NOT EXISTS tenant_documents (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  property_id INTEGER REFERENCES tenant_properties(id),
  investment_id INTEGER REFERENCES tenant_investments(id),
  title VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  url VARCHAR(255) NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes on tenant documents
CREATE INDEX IF NOT EXISTS idx_tenant_documents_tenant_id ON tenant_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_documents_user_id ON tenant_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_documents_property_id ON tenant_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_tenant_documents_investment_id ON tenant_documents(investment_id);

-- Create tenant-scoped property updates table
CREATE TABLE IF NOT EXISTS tenant_property_updates (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL REFERENCES tenant_properties(id),
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  images JSONB DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes on tenant property updates
CREATE INDEX IF NOT EXISTS idx_tenant_property_updates_tenant_id ON tenant_property_updates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_property_updates_property_id ON tenant_property_updates(property_id);

-- Create tenant-scoped ROI payments table
CREATE TABLE IF NOT EXISTS tenant_roi_payments (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  investment_id INTEGER NOT NULL REFERENCES tenant_investments(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  property_id INTEGER NOT NULL REFERENCES tenant_properties(id),
  amount NUMERIC NOT NULL,
  payment_date TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  transaction_id INTEGER REFERENCES tenant_transactions(id),
  notes TEXT
);

-- Create indexes on tenant ROI payments
CREATE INDEX IF NOT EXISTS idx_tenant_roi_payments_tenant_id ON tenant_roi_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_roi_payments_investment_id ON tenant_roi_payments(investment_id);
CREATE INDEX IF NOT EXISTS idx_tenant_roi_payments_user_id ON tenant_roi_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_roi_payments_property_id ON tenant_roi_payments(property_id);