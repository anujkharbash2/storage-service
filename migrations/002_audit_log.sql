CREATE TABLE retention_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  files_checked INT NOT NULL,
  files_deleted INT NOT NULL,
  deleted_paths TEXT[],
  errors INT NOT NULL DEFAULT 0
);