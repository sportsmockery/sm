-- =====================================================
-- SM 2.0 Feed ("Sports Mockery River") Schema Migration
-- Created: 2026-03-07
-- Ticket: T1 — Database Schema: New Tables & Migrations
-- =====================================================

-- =====================================================
-- 1. NEW TABLES
-- =====================================================

-- sm_hub_updates: Twitter-style fast updates from editors
CREATE TABLE IF NOT EXISTS sm_hub_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_slug TEXT NOT NULL,
  category TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar_url TEXT,
  content TEXT NOT NULL,
  confidence_pct INTEGER,
  is_live BOOLEAN DEFAULT false,
  reply_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  feed_eligible BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- sm_box_scores: Game result cards for the feed
CREATE TABLE IF NOT EXISTS sm_box_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id TEXT UNIQUE NOT NULL,
  team_slug TEXT NOT NULL,
  home_team_abbr TEXT NOT NULL,
  away_team_abbr TEXT NOT NULL,
  home_team_logo_url TEXT,
  away_team_logo_url TEXT,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  game_status TEXT DEFAULT 'scheduled',
  quarter_scores JSONB DEFAULT '[]',
  top_performers JSONB DEFAULT '[]',
  game_narrative TEXT,
  game_date DATE NOT NULL,
  feed_eligible BOOLEAN DEFAULT false,
  target_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- sm_trade_proposals_feed: User-submitted trade proposals surfaced in feed
CREATE TABLE IF NOT EXISTS sm_trade_proposals_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by_username TEXT NOT NULL,
  team_a_slug TEXT NOT NULL,
  team_b_slug TEXT NOT NULL,
  team_a_receives JSONB NOT NULL,
  team_b_receives JSONB NOT NULL,
  trade_score INTEGER NOT NULL,
  ai_reasoning TEXT NOT NULL,
  editor_approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  rejected BOOLEAN DEFAULT false,
  simulator_trade_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- sm_feed_rules: Controls card frequency/spacing in the feed
CREATE TABLE IF NOT EXISTS sm_feed_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_type TEXT UNIQUE NOT NULL,
  max_per_n_cards INTEGER NOT NULL,
  n_cards_window INTEGER NOT NULL,
  min_gap_cards INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT true,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- sm_feed_interactions: Analytics for feed cards (no PII)
CREATE TABLE IF NOT EXISTS sm_feed_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_token TEXT NOT NULL,
  card_id TEXT NOT NULL,
  card_type TEXT NOT NULL,
  user_segment TEXT NOT NULL,
  session_id TEXT NOT NULL,
  team_slug TEXT,
  action TEXT NOT NULL,
  dwell_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- sm_river_cards: Short-lived pre-composed feed cache
CREATE TABLE IF NOT EXISTS sm_river_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_segment TEXT NOT NULL,
  team_filter TEXT DEFAULT 'all',
  feed_mode TEXT DEFAULT 'for_you',
  cards_json JSONB NOT NULL,
  cursor TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 2. SCHEMA CHANGES TO EXISTING TABLES
-- =====================================================

-- sm_posts: Add Scout AI summary and engagement velocity
-- Guard: only alter if the table exists
ALTER TABLE IF EXISTS sm_posts ADD COLUMN IF NOT EXISTS scout_summary TEXT;
ALTER TABLE IF EXISTS sm_posts ADD COLUMN IF NOT EXISTS engagement_velocity FLOAT DEFAULT 0;

-- sm_user_preferences: Create minimal table if absent, then add columns
CREATE TABLE IF NOT EXISTS sm_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sm_user_preferences ADD COLUMN IF NOT EXISTS feed_mode TEXT DEFAULT 'for_you';
ALTER TABLE sm_user_preferences ADD COLUMN IF NOT EXISTS ignored_card_types TEXT[] DEFAULT '{}';

-- user_engagement_profile: Create minimal table if absent, then add column
CREATE TABLE IF NOT EXISTS user_engagement_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE user_engagement_profile ADD COLUMN IF NOT EXISTS dwell_by_card_type JSONB DEFAULT '{}';

-- =====================================================
-- 3. INDEXES
-- =====================================================

-- sm_hub_updates
CREATE INDEX IF NOT EXISTS idx_hub_updates_team_slug ON sm_hub_updates(team_slug);
CREATE INDEX IF NOT EXISTS idx_hub_updates_published_at ON sm_hub_updates(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_hub_updates_is_live ON sm_hub_updates(is_live) WHERE is_live = true;

-- sm_box_scores
CREATE INDEX IF NOT EXISTS idx_box_scores_team_slug ON sm_box_scores(team_slug);
CREATE INDEX IF NOT EXISTS idx_box_scores_game_status ON sm_box_scores(game_status);
CREATE INDEX IF NOT EXISTS idx_box_scores_feed_eligible ON sm_box_scores(feed_eligible) WHERE feed_eligible = true;

-- sm_trade_proposals_feed
CREATE INDEX IF NOT EXISTS idx_trade_proposals_editor_approved ON sm_trade_proposals_feed(editor_approved, approved_at DESC);

-- sm_feed_interactions (most queried table — exec dashboard)
CREATE INDEX IF NOT EXISTS idx_feed_interactions_card_type ON sm_feed_interactions(card_type);
CREATE INDEX IF NOT EXISTS idx_feed_interactions_user_segment ON sm_feed_interactions(user_segment);
CREATE INDEX IF NOT EXISTS idx_feed_interactions_created_at ON sm_feed_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_interactions_composite ON sm_feed_interactions(card_type, user_segment, created_at DESC);

-- sm_feed_rules
CREATE UNIQUE INDEX IF NOT EXISTS idx_feed_rules_card_type ON sm_feed_rules(card_type);

-- sm_river_cards
CREATE INDEX IF NOT EXISTS idx_river_cards_segment_filter ON sm_river_cards(user_segment, team_filter, feed_mode);
CREATE INDEX IF NOT EXISTS idx_river_cards_expires_at ON sm_river_cards(expires_at);

-- =====================================================
-- 4. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE sm_hub_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_box_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_trade_proposals_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_feed_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_feed_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_river_cards ENABLE ROW LEVEL SECURITY;

-- Public read policies (feed is publicly readable)
DROP POLICY IF EXISTS "Public can read hub_updates" ON sm_hub_updates;
CREATE POLICY "Public can read hub_updates" ON sm_hub_updates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can read box_scores" ON sm_box_scores;
CREATE POLICY "Public can read box_scores" ON sm_box_scores FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can read approved trade_proposals" ON sm_trade_proposals_feed;
CREATE POLICY "Public can read approved trade_proposals" ON sm_trade_proposals_feed FOR SELECT USING (editor_approved = true);
DROP POLICY IF EXISTS "Public can read feed_rules" ON sm_feed_rules;
CREATE POLICY "Public can read feed_rules" ON sm_feed_rules FOR SELECT USING (true);

-- feed_interactions: no direct client inserts (server-only via service role)
DROP POLICY IF EXISTS "No direct client insert to feed_interactions" ON sm_feed_interactions;
CREATE POLICY "No direct client insert to feed_interactions" ON sm_feed_interactions FOR INSERT WITH CHECK (false);

-- =====================================================
-- 5. SEED DATA — sm_feed_rules
-- =====================================================

INSERT INTO sm_feed_rules (card_type, max_per_n_cards, n_cards_window, min_gap_cards, enabled, notes) VALUES
('scout_summary',     8, 20, 2,  true, 'Primary content type. Max 8 per 20 cards (40% cap with hub_update combined).'),
('hub_update',        8, 20, 1,  true, 'Twitter-style fast updates. Combined with scout_summary: max 40% of feed.'),
('trade_proposal',    1, 15, 8,  true, 'User-generated. Strict spam prevention: max 1 per 15 cards, min 8-card gap.'),
('vision_theater',    1, 10, 8,  true, 'Video cards. Insert every 8-12 cards for video-affinity users.'),
('trending_article',  3, 20, 3,  true, 'Popularity-recirculated articles. Max 3 per 20 cards.'),
('box_score',         2, 20, 5,  true, 'Game result cards. Auto-inserted within 90s of game end.'),
('trending_player',   2, 20, 4,  true, 'Player trend cards. Max 2 per 20 cards, 4-card min gap.'),
('fan_chat',          1, 10, 6,  true, 'Live community signal. Max 1 per 10 cards, 6-card min gap.'),
('mock_draft',        1, 30, 15, true, 'Demand-gen card. Only for draft-eligible teams. Max 1 per 30 cards.'),
('sm_plus',           1, 30, 15, true, 'Marketing. Max 1 per 30 cards, min 15-card gap. Suppressed for SM+ users.'),
('infographic',       1, 15, 8,  true, 'Next Gen data cards. Max 1 per 15 cards.'),
('chart',             1, 20, 10, true, 'Article-linked charts. Max 1 per 20 cards.'),
('poll',              1, 12, 6,  true, 'Engagement driver. Max 1 per 12 cards.'),
('comment_spotlight', 1, 15, 8,  true, 'Community social proof. Max 1 per 15 cards.'),
('listen_now',        1, 15, 10, true, 'Audio card. Max 1 per 15 cards, 10-card min gap.'),
('join_newsletter',   1, 40, 20, true, 'Low-friction CTA. Max 1 per 40 cards.'),
('download_app',      1, 40, 20, true, 'App download CTA. Max 1 per 40 cards.')
ON CONFLICT (card_type) DO NOTHING;
