-- AI External Source Logging System - Database Schema
-- Tracks questions requiring external sources and imports verified data
-- Run this migration to set up AI logging tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- AI EXTERNAL QUERIES LOG - Main logging table
-- Tracks all questions that required external sources
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_external_queries_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  team VARCHAR(50), -- bears, bulls, cubs, whitesox, blackhawks
  team_display_name VARCHAR(100),
  external_source_used TEXT NOT NULL, -- e.g., 'web_search', 'espn_api', 'sports_reference'
  response_received TEXT,
  validation_source_1 TEXT, -- First validation source
  validation_source_1_result TEXT,
  validation_source_2 TEXT, -- Second validation source (required)
  validation_source_2_result TEXT,
  validation_source_3 TEXT, -- Optional third validation source
  validation_source_3_result TEXT,
  is_validated BOOLEAN DEFAULT false,
  validation_match_score DECIMAL(3,2), -- 0.00 to 1.00
  data_imported BOOLEAN DEFAULT false,
  import_table VARCHAR(100), -- Which table the data was imported to
  import_record_id UUID, -- ID of the imported record
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ai_external_queries_log
CREATE INDEX IF NOT EXISTS idx_ai_log_team ON ai_external_queries_log(team);
CREATE INDEX IF NOT EXISTS idx_ai_log_created ON ai_external_queries_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_log_validated ON ai_external_queries_log(is_validated);
CREATE INDEX IF NOT EXISTS idx_ai_log_imported ON ai_external_queries_log(data_imported);
CREATE INDEX IF NOT EXISTS idx_ai_log_query ON ai_external_queries_log USING gin(to_tsvector('english', query));

-- =====================================================
-- BEARS_AI - Imported AI data for Bears
-- Stores verified external data that can be joined with bears tables
-- =====================================================
CREATE TABLE IF NOT EXISTS bears_AI (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_log_id UUID REFERENCES ai_external_queries_log(id) ON DELETE SET NULL,
  data_type VARCHAR(50) NOT NULL, -- player_stat, game_info, roster, news, historical
  data_key VARCHAR(255) NOT NULL, -- Unique identifier for the data (e.g., 'player:caleb_williams:2024:passing_yards')
  data_value JSONB NOT NULL, -- The actual data
  related_player_id INTEGER, -- FK to bears_players if applicable
  related_game_id VARCHAR(50), -- FK to bears_games if applicable
  season INTEGER,
  week INTEGER,
  external_source TEXT NOT NULL,
  validation_sources TEXT[], -- Array of sources used to validate
  confidence_score DECIMAL(3,2) DEFAULT 1.00,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ, -- Some data may have expiration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(data_type, data_key)
);

CREATE INDEX IF NOT EXISTS idx_bears_ai_type ON bears_AI(data_type);
CREATE INDEX IF NOT EXISTS idx_bears_ai_key ON bears_AI(data_key);
CREATE INDEX IF NOT EXISTS idx_bears_ai_player ON bears_AI(related_player_id);
CREATE INDEX IF NOT EXISTS idx_bears_ai_game ON bears_AI(related_game_id);
CREATE INDEX IF NOT EXISTS idx_bears_ai_season ON bears_AI(season);

-- =====================================================
-- BULLS_AI - Imported AI data for Bulls
-- =====================================================
CREATE TABLE IF NOT EXISTS bulls_AI (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_log_id UUID REFERENCES ai_external_queries_log(id) ON DELETE SET NULL,
  data_type VARCHAR(50) NOT NULL,
  data_key VARCHAR(255) NOT NULL,
  data_value JSONB NOT NULL,
  related_player_id INTEGER,
  related_game_id VARCHAR(50),
  season INTEGER,
  external_source TEXT NOT NULL,
  validation_sources TEXT[],
  confidence_score DECIMAL(3,2) DEFAULT 1.00,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(data_type, data_key)
);

CREATE INDEX IF NOT EXISTS idx_bulls_ai_type ON bulls_AI(data_type);
CREATE INDEX IF NOT EXISTS idx_bulls_ai_key ON bulls_AI(data_key);
CREATE INDEX IF NOT EXISTS idx_bulls_ai_player ON bulls_AI(related_player_id);
CREATE INDEX IF NOT EXISTS idx_bulls_ai_season ON bulls_AI(season);

-- =====================================================
-- CUBS_AI - Imported AI data for Cubs
-- =====================================================
CREATE TABLE IF NOT EXISTS cubs_AI (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_log_id UUID REFERENCES ai_external_queries_log(id) ON DELETE SET NULL,
  data_type VARCHAR(50) NOT NULL,
  data_key VARCHAR(255) NOT NULL,
  data_value JSONB NOT NULL,
  related_player_id INTEGER,
  related_game_id VARCHAR(50),
  season INTEGER,
  external_source TEXT NOT NULL,
  validation_sources TEXT[],
  confidence_score DECIMAL(3,2) DEFAULT 1.00,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(data_type, data_key)
);

CREATE INDEX IF NOT EXISTS idx_cubs_ai_type ON cubs_AI(data_type);
CREATE INDEX IF NOT EXISTS idx_cubs_ai_key ON cubs_AI(data_key);
CREATE INDEX IF NOT EXISTS idx_cubs_ai_player ON cubs_AI(related_player_id);
CREATE INDEX IF NOT EXISTS idx_cubs_ai_season ON cubs_AI(season);

-- =====================================================
-- WHITESOX_AI - Imported AI data for White Sox
-- =====================================================
CREATE TABLE IF NOT EXISTS whitesox_AI (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_log_id UUID REFERENCES ai_external_queries_log(id) ON DELETE SET NULL,
  data_type VARCHAR(50) NOT NULL,
  data_key VARCHAR(255) NOT NULL,
  data_value JSONB NOT NULL,
  related_player_id INTEGER,
  related_game_id VARCHAR(50),
  season INTEGER,
  external_source TEXT NOT NULL,
  validation_sources TEXT[],
  confidence_score DECIMAL(3,2) DEFAULT 1.00,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(data_type, data_key)
);

CREATE INDEX IF NOT EXISTS idx_whitesox_ai_type ON whitesox_AI(data_type);
CREATE INDEX IF NOT EXISTS idx_whitesox_ai_key ON whitesox_AI(data_key);
CREATE INDEX IF NOT EXISTS idx_whitesox_ai_player ON whitesox_AI(related_player_id);
CREATE INDEX IF NOT EXISTS idx_whitesox_ai_season ON whitesox_AI(season);

-- =====================================================
-- BLACKHAWKS_AI - Imported AI data for Blackhawks
-- =====================================================
CREATE TABLE IF NOT EXISTS blackhawks_AI (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_log_id UUID REFERENCES ai_external_queries_log(id) ON DELETE SET NULL,
  data_type VARCHAR(50) NOT NULL,
  data_key VARCHAR(255) NOT NULL,
  data_value JSONB NOT NULL,
  related_player_id INTEGER,
  related_game_id VARCHAR(50),
  season INTEGER,
  external_source TEXT NOT NULL,
  validation_sources TEXT[],
  confidence_score DECIMAL(3,2) DEFAULT 1.00,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(data_type, data_key)
);

CREATE INDEX IF NOT EXISTS idx_blackhawks_ai_type ON blackhawks_AI(data_type);
CREATE INDEX IF NOT EXISTS idx_blackhawks_ai_key ON blackhawks_AI(data_key);
CREATE INDEX IF NOT EXISTS idx_blackhawks_ai_player ON blackhawks_AI(related_player_id);
CREATE INDEX IF NOT EXISTS idx_blackhawks_ai_season ON blackhawks_AI(season);

-- =====================================================
-- AI VALIDATION SOURCES - Reference table for validation sources
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_validation_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_name VARCHAR(100) NOT NULL UNIQUE,
  source_type VARCHAR(50) NOT NULL, -- api, website, database
  base_url TEXT,
  reliability_score DECIMAL(3,2) DEFAULT 0.80, -- 0.00 to 1.00
  is_active BOOLEAN DEFAULT true,
  rate_limit_per_minute INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pre-seed validation sources
INSERT INTO ai_validation_sources (source_name, source_type, base_url, reliability_score, notes) VALUES
  ('ESPN API', 'api', 'https://site.api.espn.com', 0.95, 'Official ESPN sports data'),
  ('Sports Reference', 'website', 'https://www.sports-reference.com', 0.90, 'Comprehensive historical stats'),
  ('NFL.com', 'website', 'https://www.nfl.com', 0.95, 'Official NFL data'),
  ('NBA.com', 'website', 'https://www.nba.com', 0.95, 'Official NBA data'),
  ('MLB.com', 'website', 'https://www.mlb.com', 0.95, 'Official MLB data'),
  ('NHL.com', 'website', 'https://www.nhl.com', 0.95, 'Official NHL data'),
  ('Pro Football Reference', 'website', 'https://www.pro-football-reference.com', 0.92, 'Detailed NFL statistics'),
  ('Basketball Reference', 'website', 'https://www.basketball-reference.com', 0.92, 'Detailed NBA statistics'),
  ('Baseball Reference', 'website', 'https://www.baseball-reference.com', 0.92, 'Detailed MLB statistics'),
  ('Hockey Reference', 'website', 'https://www.hockey-reference.com', 0.92, 'Detailed NHL statistics'),
  ('Datalab Database', 'database', NULL, 1.00, 'Internal SM Datalab database')
ON CONFLICT (source_name) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE ai_external_queries_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE bears_AI ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulls_AI ENABLE ROW LEVEL SECURITY;
ALTER TABLE cubs_AI ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitesox_AI ENABLE ROW LEVEL SECURITY;
ALTER TABLE blackhawks_AI ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_validation_sources ENABLE ROW LEVEL SECURITY;

-- Public read for AI tables (used by AI queries)
CREATE POLICY "ai_log_public_read" ON ai_external_queries_log
  FOR SELECT USING (true);

CREATE POLICY "bears_ai_public_read" ON bears_AI
  FOR SELECT USING (true);

CREATE POLICY "bulls_ai_public_read" ON bulls_AI
  FOR SELECT USING (true);

CREATE POLICY "cubs_ai_public_read" ON cubs_AI
  FOR SELECT USING (true);

CREATE POLICY "whitesox_ai_public_read" ON whitesox_AI
  FOR SELECT USING (true);

CREATE POLICY "blackhawks_ai_public_read" ON blackhawks_AI
  FOR SELECT USING (true);

CREATE POLICY "validation_sources_public_read" ON ai_validation_sources
  FOR SELECT USING (true);

-- Service role can do everything (for API operations)
-- These are handled via supabaseAdmin client with service role key

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to check if similar query exists in AI tables
CREATE OR REPLACE FUNCTION check_ai_cache(
  p_team VARCHAR(50),
  p_query TEXT
)
RETURNS TABLE (
  found BOOLEAN,
  data_value JSONB,
  source TEXT,
  confidence DECIMAL
) AS $$
DECLARE
  v_table_name TEXT;
  v_result RECORD;
BEGIN
  -- Normalize team name
  v_table_name := LOWER(REPLACE(p_team, ' ', '')) || '_AI';

  -- Check if we have cached data for similar queries
  EXECUTE format(
    'SELECT data_value, external_source, confidence_score
     FROM %I
     WHERE is_active = true
     AND data_key ILIKE $1
     ORDER BY created_at DESC
     LIMIT 1',
    v_table_name
  ) INTO v_result USING '%' || p_query || '%';

  IF v_result IS NOT NULL THEN
    RETURN QUERY SELECT true, v_result.data_value, v_result.external_source, v_result.confidence_score;
  ELSE
    RETURN QUERY SELECT false, NULL::JSONB, NULL::TEXT, NULL::DECIMAL;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_ai_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_ai_log_updated
BEFORE UPDATE ON ai_external_queries_log
FOR EACH ROW EXECUTE FUNCTION update_ai_timestamp();

CREATE TRIGGER trigger_bears_ai_updated
BEFORE UPDATE ON bears_AI
FOR EACH ROW EXECUTE FUNCTION update_ai_timestamp();

CREATE TRIGGER trigger_bulls_ai_updated
BEFORE UPDATE ON bulls_AI
FOR EACH ROW EXECUTE FUNCTION update_ai_timestamp();

CREATE TRIGGER trigger_cubs_ai_updated
BEFORE UPDATE ON cubs_AI
FOR EACH ROW EXECUTE FUNCTION update_ai_timestamp();

CREATE TRIGGER trigger_whitesox_ai_updated
BEFORE UPDATE ON whitesox_AI
FOR EACH ROW EXECUTE FUNCTION update_ai_timestamp();

CREATE TRIGGER trigger_blackhawks_ai_updated
BEFORE UPDATE ON blackhawks_AI
FOR EACH ROW EXECUTE FUNCTION update_ai_timestamp();

-- =====================================================
-- VIEWS FOR ADMIN DASHBOARD
-- =====================================================

-- View for recent external queries summary
CREATE OR REPLACE VIEW ai_external_queries_summary AS
SELECT
  team,
  COUNT(*) as total_queries,
  COUNT(*) FILTER (WHERE is_validated = true) as validated_queries,
  COUNT(*) FILTER (WHERE data_imported = true) as imported_queries,
  AVG(validation_match_score) FILTER (WHERE validation_match_score IS NOT NULL) as avg_validation_score,
  MAX(created_at) as last_query_at
FROM ai_external_queries_log
GROUP BY team;

-- View for all AI data across teams
CREATE OR REPLACE VIEW ai_imported_data_all AS
SELECT 'bears' as team, id, data_type, data_key, data_value, confidence_score, created_at FROM bears_AI WHERE is_active = true
UNION ALL
SELECT 'bulls' as team, id, data_type, data_key, data_value, confidence_score, created_at FROM bulls_AI WHERE is_active = true
UNION ALL
SELECT 'cubs' as team, id, data_type, data_key, data_value, confidence_score, created_at FROM cubs_AI WHERE is_active = true
UNION ALL
SELECT 'whitesox' as team, id, data_type, data_key, data_value, confidence_score, created_at FROM whitesox_AI WHERE is_active = true
UNION ALL
SELECT 'blackhawks' as team, id, data_type, data_key, data_value, confidence_score, created_at FROM blackhawks_AI WHERE is_active = true;
