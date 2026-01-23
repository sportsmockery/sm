-- Polls System Schema for SportsMockery
-- Run this migration in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sm_polls table
CREATE TABLE IF NOT EXISTS sm_polls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  poll_type VARCHAR(20) NOT NULL DEFAULT 'single' CHECK (poll_type IN ('single', 'multiple', 'scale', 'emoji')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'scheduled', 'closed', 'archived')),
  team_theme VARCHAR(20) CHECK (team_theme IS NULL OR team_theme IN ('bears', 'bulls', 'cubs', 'whitesox', 'blackhawks', 'fire', 'sky')),
  is_anonymous BOOLEAN DEFAULT FALSE,
  show_results BOOLEAN DEFAULT TRUE,
  show_live_results BOOLEAN DEFAULT TRUE,
  is_multi_select BOOLEAN DEFAULT FALSE,
  scale_min INTEGER,
  scale_max INTEGER,
  scale_labels JSONB,
  total_votes INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sm_poll_options table
CREATE TABLE IF NOT EXISTS sm_poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES sm_polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_image TEXT,
  team_tag VARCHAR(20) CHECK (team_tag IS NULL OR team_tag IN ('bears', 'bulls', 'cubs', 'whitesox', 'blackhawks', 'fire', 'sky')),
  emoji VARCHAR(10),
  display_order INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sm_poll_responses table (for tracking votes)
CREATE TABLE IF NOT EXISTS sm_poll_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES sm_polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES sm_poll_options(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  anonymous_id VARCHAR(255),
  ip_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sm_polls_status ON sm_polls(status);
CREATE INDEX IF NOT EXISTS idx_sm_polls_team_theme ON sm_polls(team_theme);
CREATE INDEX IF NOT EXISTS idx_sm_polls_created_at ON sm_polls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sm_poll_options_poll_id ON sm_poll_options(poll_id);
CREATE INDEX IF NOT EXISTS idx_sm_poll_responses_poll_id ON sm_poll_responses(poll_id);
CREATE INDEX IF NOT EXISTS idx_sm_poll_responses_option_id ON sm_poll_responses(option_id);
CREATE INDEX IF NOT EXISTS idx_sm_poll_responses_anonymous_id ON sm_poll_responses(anonymous_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sm_polls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_sm_polls_updated_at ON sm_polls;
CREATE TRIGGER trigger_sm_polls_updated_at
  BEFORE UPDATE ON sm_polls
  FOR EACH ROW
  EXECUTE FUNCTION update_sm_polls_updated_at();

-- Enable Row Level Security (optional - enable if you want RLS)
-- ALTER TABLE sm_polls ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sm_poll_options ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sm_poll_responses ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions for service role
GRANT ALL ON sm_polls TO service_role;
GRANT ALL ON sm_poll_options TO service_role;
GRANT ALL ON sm_poll_responses TO service_role;

-- Grant read permissions for anon role (for public polls)
GRANT SELECT ON sm_polls TO anon;
GRANT SELECT ON sm_poll_options TO anon;

-- Grant insert permissions for voting
GRANT INSERT ON sm_poll_responses TO anon;
GRANT INSERT ON sm_poll_responses TO authenticated;

-- Comment on tables
COMMENT ON TABLE sm_polls IS 'Chicago-sports-themed polls for SportsMockery articles';
COMMENT ON TABLE sm_poll_options IS 'Answer options for polls';
COMMENT ON TABLE sm_poll_responses IS 'Individual vote responses for polls';
