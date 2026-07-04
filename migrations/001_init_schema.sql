-- Customer accounts
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  company_name TEXT,
  plan TEXT NOT NULL DEFAULT 'free', -- free | starter | growth | business | enterprise
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API keys (hashed, never store raw keys)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  key_hash TEXT UNIQUE NOT NULL, -- salted SHA-256 of the raw key, per Team 4 spec
  key_prefix TEXT NOT NULL,      -- first few chars shown in dashboard, e.g. "dr_live_ab12"
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

-- Extraction results (queryable history, per spec — not just opaque JSON blobs)
CREATE TABLE extraction_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  request_id TEXT UNIQUE NOT NULL, -- for idempotent billing, per Team 4 spec
  url TEXT NOT NULL,
  page_type TEXT,                  -- product | article | other
  confidence NUMERIC,
  extraction_method TEXT,          -- json_ld | open_graph | fallback | none
  fields JSONB,                    -- structured extracted fields
  fetch_status_code INT,
  fetch_error TEXT,
  cached BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage/metering events (for billing)
CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  request_id TEXT UNIQUE NOT NULL, -- idempotency key, matches extraction_results.request_id
  credits_consumed INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_extraction_results_account ON extraction_results(account_id, created_at DESC);
CREATE INDEX idx_usage_events_account ON usage_events(account_id, created_at DESC);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);