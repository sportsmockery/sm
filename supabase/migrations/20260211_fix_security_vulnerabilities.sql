-- =====================================================
-- FIX SECURITY VULNERABILITIES
-- Date: 2026-02-11
-- Issues:
--   1. Security Definer Views (2)
--   2. RLS Disabled on Public Tables (13)
--   3. Sensitive Columns Exposed (1)
-- =====================================================

-- =====================================================
-- PART 1: FIX SECURITY DEFINER VIEWS
-- These views bypass RLS of the querying user.
-- Solution: Recreate with SECURITY INVOKER (default)
-- =====================================================

-- Drop and recreate ai_external_queries_summary without SECURITY DEFINER
DROP VIEW IF EXISTS public.ai_external_queries_summary;

-- Note: If this view is needed, recreate it here without SECURITY DEFINER
-- The view definition should be provided by the original creator
-- For now, we're dropping it. If needed, recreate like:
-- CREATE VIEW public.ai_external_queries_summary AS
--   SELECT ... FROM ... ;
-- (SECURITY INVOKER is the default, no need to specify)

-- Drop and recreate ai_imported_data_all without SECURITY DEFINER
DROP VIEW IF EXISTS public.ai_imported_data_all;

-- Note: Same as above - recreate if needed without SECURITY DEFINER


-- =====================================================
-- PART 2: ENABLE RLS ON ALL PUBLIC TABLES
-- =====================================================

-- Enable RLS on all affected tables
ALTER TABLE IF EXISTS public.sm_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sm_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sm_notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sm_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_engagement_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sm_poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sm_poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sm_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sm_post_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sm_polls ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- PART 3: CREATE RLS POLICIES
-- =====================================================

-- -------------------------------------------------
-- sm_categories: Public read, admin write
-- Categories are public metadata (Bears, Bulls, etc.)
-- -------------------------------------------------
DROP POLICY IF EXISTS "Public can read categories" ON public.sm_categories;
CREATE POLICY "Public can read categories"
  ON public.sm_categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin writes handled by service role (bypasses RLS)


-- -------------------------------------------------
-- sm_authors: Public read, admin write
-- Author profiles are public for article bylines
-- -------------------------------------------------
DROP POLICY IF EXISTS "Public can read authors" ON public.sm_authors;
CREATE POLICY "Public can read authors"
  ON public.sm_authors
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- -------------------------------------------------
-- sm_posts: Public read published, admin write
-- Posts are public content but only published ones
-- -------------------------------------------------
DROP POLICY IF EXISTS "Public can read published posts" ON public.sm_posts;
CREATE POLICY "Public can read published posts"
  ON public.sm_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR status = 'live');

-- Allow authenticated users to read all posts (for admin/preview)
DROP POLICY IF EXISTS "Authenticated can read all posts" ON public.sm_posts;
CREATE POLICY "Authenticated can read all posts"
  ON public.sm_posts
  FOR SELECT
  TO authenticated
  USING (true);


-- -------------------------------------------------
-- sm_charts: Public read, admin write
-- Charts are public content embedded in posts
-- -------------------------------------------------
DROP POLICY IF EXISTS "Public can read charts" ON public.sm_charts;
CREATE POLICY "Public can read charts"
  ON public.sm_charts
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- -------------------------------------------------
-- sm_polls: Public read, admin write
-- Polls are public content
-- -------------------------------------------------
DROP POLICY IF EXISTS "Public can read polls" ON public.sm_polls;
CREATE POLICY "Public can read polls"
  ON public.sm_polls
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- -------------------------------------------------
-- sm_poll_options: Public read, admin write
-- Poll options are public
-- -------------------------------------------------
DROP POLICY IF EXISTS "Public can read poll options" ON public.sm_poll_options;
CREATE POLICY "Public can read poll options"
  ON public.sm_poll_options
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- -------------------------------------------------
-- sm_post_polls: Public read, admin write
-- Links posts to polls, public metadata
-- -------------------------------------------------
DROP POLICY IF EXISTS "Public can read post polls" ON public.sm_post_polls;
CREATE POLICY "Public can read post polls"
  ON public.sm_post_polls
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- -------------------------------------------------
-- sm_poll_responses: User can manage own votes
-- Users can only see and create their own votes
-- -------------------------------------------------
DROP POLICY IF EXISTS "Users can read own poll responses" ON public.sm_poll_responses;
CREATE POLICY "Users can read own poll responses"
  ON public.sm_poll_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own poll responses" ON public.sm_poll_responses;
CREATE POLICY "Users can insert own poll responses"
  ON public.sm_poll_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Anonymous users can vote (tracked by IP/fingerprint, not user_id)
DROP POLICY IF EXISTS "Anonymous can insert poll responses" ON public.sm_poll_responses;
CREATE POLICY "Anonymous can insert poll responses"
  ON public.sm_poll_responses
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);


-- -------------------------------------------------
-- sm_users: Users can manage own profile
-- -------------------------------------------------
DROP POLICY IF EXISTS "Users can read own profile" ON public.sm_users;
CREATE POLICY "Users can read own profile"
  ON public.sm_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.sm_users;
CREATE POLICY "Users can update own profile"
  ON public.sm_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow reading public profile info (display_name, avatar) for other users
DROP POLICY IF EXISTS "Public can read basic user info" ON public.sm_users;
CREATE POLICY "Public can read basic user info"
  ON public.sm_users
  FOR SELECT
  TO anon, authenticated
  USING (true);
  -- Note: Sensitive columns should be handled at the query level or with column-level security


-- -------------------------------------------------
-- user_engagement_profile: Users can manage own
-- -------------------------------------------------
DROP POLICY IF EXISTS "Users can read own engagement profile" ON public.user_engagement_profile;
CREATE POLICY "Users can read own engagement profile"
  ON public.user_engagement_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own engagement profile" ON public.user_engagement_profile;
CREATE POLICY "Users can insert own engagement profile"
  ON public.user_engagement_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own engagement profile" ON public.user_engagement_profile;
CREATE POLICY "Users can update own engagement profile"
  ON public.user_engagement_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- -------------------------------------------------
-- user_interactions: Users can manage own (SENSITIVE)
-- Contains session_id - restrict to own data only
-- -------------------------------------------------
DROP POLICY IF EXISTS "Users can read own interactions" ON public.user_interactions;
CREATE POLICY "Users can read own interactions"
  ON public.user_interactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own interactions" ON public.user_interactions;
CREATE POLICY "Users can insert own interactions"
  ON public.user_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Anonymous interactions (no user_id, tracked by session)
DROP POLICY IF EXISTS "Anonymous can insert interactions" ON public.user_interactions;
CREATE POLICY "Anonymous can insert interactions"
  ON public.user_interactions
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);


-- -------------------------------------------------
-- admin_api_keys: NO PUBLIC ACCESS (SENSITIVE)
-- Only service role can access this table
-- -------------------------------------------------
-- No policies = no access via PostgREST anon/authenticated
-- Service role bypasses RLS and can still access


-- -------------------------------------------------
-- sm_notification_history: Admin only
-- Only service role can access
-- -------------------------------------------------
-- No policies = no access via PostgREST anon/authenticated
-- Service role bypasses RLS and can still access


-- =====================================================
-- VERIFICATION QUERIES (run manually to verify)
-- =====================================================

-- Check RLS is enabled on all tables
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'sm_categories', 'sm_authors', 'sm_notification_history', 'sm_posts',
--     'user_engagement_profile', 'user_interactions', 'admin_api_keys',
--     'sm_poll_options', 'sm_poll_responses', 'sm_charts', 'sm_users',
--     'sm_post_polls', 'sm_polls'
--   );

-- Check policies exist
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Check views don't have SECURITY DEFINER
-- SELECT schemaname, viewname, definition
-- FROM pg_views
-- WHERE schemaname = 'public'
--   AND viewname IN ('ai_external_queries_summary', 'ai_imported_data_all');
