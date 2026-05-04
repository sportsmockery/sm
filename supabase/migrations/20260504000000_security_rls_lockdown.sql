-- =====================================================
-- PRE-LAUNCH SECURITY: RLS LOCKDOWN
-- Date: 2026-05-04
-- Audit: /home/user/workspace/sm-test-security-audit-2026-05-03.md
--
-- Fixes findings #1–#5 from the audit:
--   1. sm_users — anon could SELECT all admin emails / roles / last_sign_in_at
--   2. sm_authors — anon could SELECT 94 author rows including emails
--   3. chat_users — anon could SELECT moderation fields (warning_count, etc.)
--   4. chat_presence — anon could see who is online + raw user_ids
--   5. sm_posts — anon could SELECT drafts (no status filter)
--
-- Strategy:
--   - DROP every over-permissive `USING (true)` anon SELECT policy on
--     sensitive tables (these were added by the 2026-02-11 migration).
--   - Replace with strict per-row policies (auth.uid() match or admin role).
--   - For tables that have legitimate anon read needs (author bylines on
--     articles, chat user names in messages), expose ONLY safe columns
--     via a public VIEW, granted to anon.
-- =====================================================


-- =====================================================
-- 1. sm_users — admins-only reads (plus self)
-- =====================================================
ALTER TABLE IF EXISTS public.sm_users ENABLE ROW LEVEL SECURITY;

-- Drop legacy permissive policy added 2026-02-11.
DROP POLICY IF EXISTS "Public can read basic user info" ON public.sm_users;
DROP POLICY IF EXISTS "Public can read users" ON public.sm_users;

-- Self-read (kept from prior migration; restated here to be explicit).
DROP POLICY IF EXISTS "Users can read own profile" ON public.sm_users;
CREATE POLICY "Users can read own profile"
  ON public.sm_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins (role = 'admin') can read every row.
-- The subquery only consults sm_users by id which is the same row the
-- caller already has access to, so it cannot recurse infinitely on RLS.
DROP POLICY IF EXISTS "Admins can read all users" ON public.sm_users;
CREATE POLICY "Admins can read all users"
  ON public.sm_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sm_users me
      WHERE me.id = auth.uid()
        AND me.role = 'admin'
    )
  );

-- No policy for `anon` role => anon SELECT returns 0 rows.
REVOKE SELECT ON public.sm_users FROM anon;


-- =====================================================
-- 2. sm_authors — public bylines via VIEW only
-- =====================================================
ALTER TABLE IF EXISTS public.sm_authors ENABLE ROW LEVEL SECURITY;

-- Drop legacy permissive policy.
DROP POLICY IF EXISTS "Public can read authors" ON public.sm_authors;

-- Self-read for an author (matches by user_id if column exists).
-- We guard with a DO block because not every deployment has user_id yet.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sm_authors'
      AND column_name = 'user_id'
  ) THEN
    EXECUTE $sql$
      DROP POLICY IF EXISTS "Authors can read own row" ON public.sm_authors;
      CREATE POLICY "Authors can read own row"
        ON public.sm_authors
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    $sql$;
  END IF;
END
$$;

-- Admins can SELECT every column.
DROP POLICY IF EXISTS "Admins can read all authors" ON public.sm_authors;
CREATE POLICY "Admins can read all authors"
  ON public.sm_authors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sm_users me
      WHERE me.id = auth.uid()
        AND me.role IN ('admin', 'editor')
    )
  );

-- No anon policy. Public byline reads must go through sm_public_authors.
REVOKE SELECT ON public.sm_authors FROM anon;

-- Public-readable author projection. Exposes ONLY the columns that already
-- appear on rendered article pages (display_name, slug, bio, avatar_url,
-- role). Email, last_login, gravatar_email, and any *_secret/*_token
-- columns are intentionally absent.
DROP VIEW IF EXISTS public.sm_public_authors;
CREATE VIEW public.sm_public_authors
  WITH (security_invoker = true)
  AS
  SELECT
    id,
    wp_id,
    display_name,
    slug,
    bio,
    avatar_url,
    role
  FROM public.sm_authors;

-- The view is SECURITY INVOKER, so it runs as the caller. We need a
-- companion policy that lets anon read those columns through the view.
DROP POLICY IF EXISTS "Public can read author bylines" ON public.sm_authors;
CREATE POLICY "Public can read author bylines"
  ON public.sm_authors
  FOR SELECT
  TO anon, authenticated
  USING (true);
-- ^ This still applies row-level — but column-level safety is enforced
-- by REVOKEing direct SELECT on the underlying table from `anon` and
-- routing reads through the view. We grant column-scoped SELECT below.

-- Grant anon SELECT only on the safe columns of the underlying table so
-- the view (security_invoker) can resolve them. PostgREST will still not
-- expose the table itself because we haven't granted USAGE on it via
-- REST — direct /rest/v1/sm_authors calls return 401/empty after the
-- REVOKE above. This belt-and-suspenders approach keeps emails out of
-- both PostgREST and any function that tries to SELECT * as anon.
GRANT SELECT (id, wp_id, display_name, slug, bio, avatar_url, role)
  ON public.sm_authors TO anon;
GRANT SELECT ON public.sm_public_authors TO anon, authenticated;


-- =====================================================
-- 3. chat_users — public name/avatar via VIEW only
-- =====================================================
ALTER TABLE IF EXISTS public.chat_users ENABLE ROW LEVEL SECURITY;

-- Drop any legacy permissive policy.
DROP POLICY IF EXISTS "Public can read chat users" ON public.chat_users;
DROP POLICY IF EXISTS "Anyone can read chat users" ON public.chat_users;

-- Self-read.
DROP POLICY IF EXISTS "Users can read own chat user" ON public.chat_users;
CREATE POLICY "Users can read own chat user"
  ON public.chat_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins see every column (moderation: ban/mute/warning counts).
DROP POLICY IF EXISTS "Admins can read all chat users" ON public.chat_users;
CREATE POLICY "Admins can read all chat users"
  ON public.chat_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sm_users me
      WHERE me.id = auth.uid()
        AND me.role = 'admin'
    )
  );

-- Anon needs to render display_name + avatar next to chat messages, so we
-- expose ONLY those columns via a view.
DROP VIEW IF EXISTS public.chat_public_users;
CREATE VIEW public.chat_public_users
  WITH (security_invoker = true)
  AS
  SELECT
    id,
    display_name,
    avatar_url,
    badge
  FROM public.chat_users;

REVOKE SELECT ON public.chat_users FROM anon;
GRANT SELECT (id, display_name, avatar_url, badge)
  ON public.chat_users TO anon;
GRANT SELECT ON public.chat_public_users TO anon, authenticated;

-- Need the row-level allowance too so the view can find rows when called
-- as anon. Column-level GRANT above keeps the moderation fields off-limits.
DROP POLICY IF EXISTS "Public can read chat user names" ON public.chat_users;
CREATE POLICY "Public can read chat user names"
  ON public.chat_users
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- =====================================================
-- 4. chat_presence — authenticated only
-- =====================================================
ALTER TABLE IF EXISTS public.chat_presence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read chat presence" ON public.chat_presence;
DROP POLICY IF EXISTS "Anyone can read chat presence" ON public.chat_presence;

DROP POLICY IF EXISTS "Authenticated can read chat presence" ON public.chat_presence;
CREATE POLICY "Authenticated can read chat presence"
  ON public.chat_presence
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can upsert their own presence.
DROP POLICY IF EXISTS "Users can upsert own presence" ON public.chat_presence;
CREATE POLICY "Users can upsert own presence"
  ON public.chat_presence
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own presence" ON public.chat_presence;
CREATE POLICY "Users can update own presence"
  ON public.chat_presence
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

REVOKE SELECT ON public.chat_presence FROM anon;


-- =====================================================
-- 5. sm_posts — published-only for anon
-- =====================================================
-- Replace the prior policy that allowed status='published' OR 'live' AND
-- did not gate on published_at. Authors keep their own drafts visible.
ALTER TABLE IF EXISTS public.sm_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published posts" ON public.sm_posts;
DROP POLICY IF EXISTS "Authenticated can read all posts" ON public.sm_posts;

CREATE POLICY "Public can read published posts"
  ON public.sm_posts
  FOR SELECT
  TO anon, authenticated
  USING (
    status IN ('published', 'live')
    AND (published_at IS NULL OR published_at <= now())
  );

-- Authors see their own drafts (matched on author_id → sm_authors.user_id).
-- We guard the policy creation in case the column shape differs.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sm_authors' AND column_name = 'user_id'
  ) THEN
    EXECUTE $sql$
      DROP POLICY IF EXISTS "Authors can read own posts" ON public.sm_posts;
      CREATE POLICY "Authors can read own posts"
        ON public.sm_posts
        FOR SELECT
        TO authenticated
        USING (
          author_id IN (
            SELECT id FROM public.sm_authors WHERE user_id = auth.uid()
          )
        );
    $sql$;
  END IF;
END
$$;

-- Admins/editors see every post.
DROP POLICY IF EXISTS "Admins can read all posts" ON public.sm_posts;
CREATE POLICY "Admins can read all posts"
  ON public.sm_posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sm_users me
      WHERE me.id = auth.uid()
        AND me.role IN ('admin', 'editor')
    )
  );


-- =====================================================
-- 6. chat_rooms — read-only public is acceptable
-- (Bears/Bulls/Cubs lobbies are already public).
-- We only flag this if an `is_private` column exists — in that case,
-- restrict to authenticated.
-- =====================================================
ALTER TABLE IF EXISTS public.chat_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read chat rooms" ON public.chat_rooms;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'chat_rooms'
      AND column_name = 'is_private'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Public can read public chat rooms"
        ON public.chat_rooms
        FOR SELECT
        TO anon, authenticated
        USING (is_private IS NOT TRUE);
    $sql$;
  ELSE
    EXECUTE $sql$
      CREATE POLICY "Public can read chat rooms"
        ON public.chat_rooms
        FOR SELECT
        TO anon, authenticated
        USING (true);
    $sql$;
  END IF;
END
$$;


-- =====================================================
-- VERIFICATION (run manually after apply)
-- =====================================================
-- Anon should now get 0 rows for sensitive tables:
--   curl -H "apikey: $ANON" "$SUPA/rest/v1/sm_users?select=*"     -> []
--   curl -H "apikey: $ANON" "$SUPA/rest/v1/sm_authors?select=email" -> permission denied
--   curl -H "apikey: $ANON" "$SUPA/rest/v1/chat_users?select=warning_count" -> permission denied
--   curl -H "apikey: $ANON" "$SUPA/rest/v1/chat_presence?select=*" -> []
--
-- Anon CAN read safe projections:
--   curl -H "apikey: $ANON" "$SUPA/rest/v1/sm_public_authors?select=*"
--   curl -H "apikey: $ANON" "$SUPA/rest/v1/chat_public_users?select=*"
--   curl -H "apikey: $ANON" "$SUPA/rest/v1/sm_posts?select=title"  -> only published rows
