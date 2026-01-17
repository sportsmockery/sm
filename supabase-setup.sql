-- =====================================================
-- SPORTSMOCKERY SUPABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
-- =====================================================

-- =====================================================
-- 1. CREATE USER PREFERENCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS sm_user_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  favorite_teams TEXT[] DEFAULT ARRAY['bears']::TEXT[],
  notification_prefs JSONB DEFAULT '{
    "breaking_news": true,
    "game_alerts": true,
    "weekly_digest": true,
    "trade_rumors": false
  }'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON sm_user_preferences(user_id);

-- =====================================================
-- 2. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE sm_user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Users can read own preferences" ON sm_user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON sm_user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON sm_user_preferences;
DROP POLICY IF EXISTS "Service role full access" ON sm_user_preferences;
DROP POLICY IF EXISTS "Anon can read with header" ON sm_user_preferences;
DROP POLICY IF EXISTS "Anon can insert with header" ON sm_user_preferences;
DROP POLICY IF EXISTS "Anon can update with header" ON sm_user_preferences;

-- Policy: Authenticated users can manage their own preferences
CREATE POLICY "Users can read own preferences" ON sm_user_preferences
  FOR SELECT USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert own preferences" ON sm_user_preferences
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update own preferences" ON sm_user_preferences
  FOR UPDATE USING (auth.uid()::TEXT = user_id);

-- Policy: Service role bypasses RLS (for API routes)
CREATE POLICY "Service role full access" ON sm_user_preferences
  FOR ALL USING (true);

-- =====================================================
-- 3. VERIFY EXISTING TABLES HAVE REQUIRED COLUMNS
-- =====================================================

-- Add any missing columns to sm_posts (run these - they're safe if columns exist)
DO $$
BEGIN
  -- Add views column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sm_posts' AND column_name = 'views') THEN
    ALTER TABLE sm_posts ADD COLUMN views INTEGER DEFAULT 0;
  END IF;

  -- Add importance_score column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sm_posts' AND column_name = 'importance_score') THEN
    ALTER TABLE sm_posts ADD COLUMN importance_score INTEGER DEFAULT 0;
  END IF;

  -- Add updated_at column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sm_posts' AND column_name = 'updated_at') THEN
    ALTER TABLE sm_posts ADD COLUMN updated_at TIMESTAMPTZ;
  END IF;
END $$;

-- Add slug column to sm_authors if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sm_authors' AND column_name = 'slug') THEN
    ALTER TABLE sm_authors ADD COLUMN slug TEXT;
  END IF;
END $$;

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_status ON sm_posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON sm_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON sm_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON sm_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON sm_posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_views ON sm_posts(views DESC);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON sm_categories(slug);

-- Authors indexes
CREATE INDEX IF NOT EXISTS idx_authors_slug ON sm_authors(slug);

-- =====================================================
-- 5. VERIFICATION QUERIES (Check these return results)
-- =====================================================

-- Verify sm_user_preferences table exists
SELECT 'sm_user_preferences table created' AS status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sm_user_preferences');

-- Verify sm_posts has required columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sm_posts'
AND column_name IN ('id', 'slug', 'title', 'content', 'excerpt', 'featured_image', 'published_at', 'status', 'views', 'category_id', 'author_id');

-- Verify sm_categories has required columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sm_categories'
AND column_name IN ('id', 'name', 'slug');

-- Verify sm_authors has required columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sm_authors'
AND column_name IN ('id', 'display_name', 'bio', 'avatar_url', 'slug');

-- =====================================================
-- 6. TEST INSERT (Optional - creates test preference)
-- =====================================================

-- Uncomment to test:
-- INSERT INTO sm_user_preferences (user_id, favorite_teams, notification_prefs)
-- VALUES ('test-user-123', ARRAY['bears', 'cubs'], '{"breaking_news": true}')
-- ON CONFLICT (user_id) DO UPDATE SET favorite_teams = EXCLUDED.favorite_teams;

-- Verify test:
-- SELECT * FROM sm_user_preferences WHERE user_id = 'test-user-123';

-- Clean up test:
-- DELETE FROM sm_user_preferences WHERE user_id = 'test-user-123';

-- =====================================================
-- DONE! All tables and indexes created.
-- =====================================================
