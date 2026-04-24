-- Security Audit Log — INSERT-ONLY table for admin action tracking
-- No UPDATE or DELETE allowed for tamper resistance

CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by user and time
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON security_audit_log(action);

-- Enable RLS
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can insert (API routes use supabaseAdmin)
CREATE POLICY "Service role can insert audit logs"
  ON security_audit_log FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service role can read (for /admin/security page)
CREATE POLICY "Service role can read audit logs"
  ON security_audit_log FOR SELECT
  TO service_role
  USING (true);

-- Explicitly deny UPDATE and DELETE for all roles
-- (RLS with no matching policies = denied by default)
