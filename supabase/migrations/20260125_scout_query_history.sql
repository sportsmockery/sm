-- Scout Query History Table
-- Stores user queries for 30 days
-- Cleaned up daily by /api/cron/cleanup-scout-history

CREATE TABLE IF NOT EXISTS scout_query_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response TEXT,
  team TEXT,
  source TEXT
);

-- Index for fast lookups by user and cleanup by date
CREATE INDEX IF NOT EXISTS idx_scout_query_history_user_id ON scout_query_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scout_query_history_created_at ON scout_query_history(created_at);
CREATE INDEX IF NOT EXISTS idx_scout_query_history_user_date ON scout_query_history(user_id, created_at DESC);

-- Row Level Security
ALTER TABLE scout_query_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own queries
CREATE POLICY "Users can view own queries"
  ON scout_query_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own queries
CREATE POLICY "Users can insert own queries"
  ON scout_query_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own queries
CREATE POLICY "Users can delete own queries"
  ON scout_query_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can do anything (for cleanup cron)
CREATE POLICY "Service role full access"
  ON scout_query_history
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comment on table
COMMENT ON TABLE scout_query_history IS 'Stores Scout AI user queries for 30 days. Cleaned daily by cron job.';
