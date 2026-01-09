-- Oracle Feed Database Schema
-- Run this in Supabase SQL Editor

-- Add importance_score to posts table if not exists
-- Note: 'views' column already exists, 'published_at' is the date column
ALTER TABLE sm_posts
ADD COLUMN IF NOT EXISTS importance_score INTEGER DEFAULT 50;

-- Create index for feed queries
CREATE INDEX IF NOT EXISTS idx_posts_importance ON sm_posts(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON sm_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_status ON sm_posts(status);

-- User views tracking (for logged-in users)
CREATE TABLE IF NOT EXISTS sm_user_views (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id BIGINT REFERENCES sm_posts(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_user_views_user ON sm_user_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_views_post ON sm_user_views(post_id);
CREATE INDEX IF NOT EXISTS idx_user_views_date ON sm_user_views(viewed_at);

-- User preferences (for personalization)
CREATE TABLE IF NOT EXISTS sm_user_preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  favorite_teams TEXT[] DEFAULT '{}',
  notification_prefs JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_prefs_user ON sm_user_preferences(user_id);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(p_post_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE sm_posts
  SET views = COALESCE(views, 0) + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update importance score with decay
CREATE OR REPLACE FUNCTION update_importance_with_decay()
RETURNS VOID AS $$
BEGIN
  -- Decay scores by 5 points per day for posts older than 24 hours
  UPDATE sm_posts
  SET importance_score = GREATEST(COALESCE(importance_score, 50) - 5, 10)
  WHERE published_at < NOW() - INTERVAL '24 hours'
    AND COALESCE(importance_score, 50) > 10;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily decay (run via pg_cron or Supabase scheduled function)
-- SELECT cron.schedule('decay-importance', '0 0 * * *', 'SELECT update_importance_with_decay()');

-- RLS Policies
ALTER TABLE sm_user_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE sm_user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only READ their own views (inserts happen server-side via service role)
DROP POLICY IF EXISTS "Users can view own views" ON sm_user_views;
CREATE POLICY "Users can view own views" ON sm_user_views
  FOR SELECT USING (auth.uid() = user_id);

-- NO INSERT policy for users - views are tracked server-side only
-- Service role bypasses RLS so API can insert views

-- Users can only manage their own preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON sm_user_preferences;
CREATE POLICY "Users can view own preferences" ON sm_user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON sm_user_preferences;
CREATE POLICY "Users can update own preferences" ON sm_user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Grant permissions (SELECT only for views - inserts via service role)
GRANT SELECT ON sm_user_views TO authenticated;
GRANT ALL ON sm_user_preferences TO authenticated;
GRANT USAGE ON SEQUENCE sm_user_preferences_id_seq TO authenticated;
