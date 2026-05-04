-- =====================================================
-- PRE-LAUNCH SECURITY: RLS LOCKDOWN — ROUND 2
-- Date: 2026-05-04
-- Audit: /home/user/workspace/sm-test-security-audit-2026-05-03.md
--        /home/user/workspace/sm-test-security-audit-2026-05-03-post-fix.md
--
-- Follow-up to 20260504000000_security_rls_lockdown.sql (PR #100).
-- Addresses post-fix audit findings #12, #13, #14, #15.
--
-- Findings:
--   12. storage.objects — broad "Public read access" SELECT policy lets anon
--       LIST every uploaded file on the `media` and `public` buckets via
--       POST /storage/v1/object/list/{bucket}. Per-object public reads stay
--       working through bucket.public = true.
--   13. chat_notifications / scout_events — INSERT WITH CHECK (true) lets any
--       authenticated user (or anon, in scout_events' case) forge rows.
--   14. function_search_path_mutable on 14 public functions.
--   15. Eleven RLS-enabled-no-policy sensitive tables. Functionally
--       deny-by-default today; we add explicit admin-read policies for
--       operational visibility and clarity. Analytics-only google_*
--       tables intentionally remain deny-by-default.
-- =====================================================


-- =====================================================
-- 12. storage.objects — drop broad anon SELECT policies
-- =====================================================
-- Public buckets serve individual file URLs through Supabase Storage's
-- own auth path when bucket.public = true; the SELECT policy on
-- storage.objects only governs the LIST endpoint and direct row reads.
-- We drop every commonly-named permissive SELECT policy and re-grant
-- read access to authenticated users only, which keeps admin tooling
-- functional without exposing the bucket file index to anon.

DROP POLICY IF EXISTS "Public read access"             ON storage.objects;
DROP POLICY IF EXISTS "Public read access on media"    ON storage.objects;
DROP POLICY IF EXISTS "Public read access on public"   ON storage.objects;
DROP POLICY IF EXISTS "Public Access"                  ON storage.objects;
DROP POLICY IF EXISTS "Public can read media"          ON storage.objects;
DROP POLICY IF EXISTS "Public can read public bucket"  ON storage.objects;
DROP POLICY IF EXISTS "Allow public read"              ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read storage"        ON storage.objects;

-- Authenticated users (admins/editors using the dashboard, signed-in
-- members uploading avatars) still need to see object rows for the
-- buckets they have legitimate access to.
DROP POLICY IF EXISTS "Authenticated can read storage" ON storage.objects;
CREATE POLICY "Authenticated can read storage"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (true);


-- =====================================================
-- 13. chat_notifications — sender-scoped INSERT
-- =====================================================
-- The previous policy "System can insert notifications" used
-- WITH CHECK (true) — any authenticated user could forge a row to any
-- recipient. The expected ownership column varies by branch
-- (sender_id vs user_id), so we detect and gate accordingly. If
-- neither column exists, restrict INSERT to service_role only.

ALTER TABLE IF EXISTS public.chat_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert notifications"     ON public.chat_notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications"     ON public.chat_notifications;
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON public.chat_notifications;
DROP POLICY IF EXISTS "Sender can insert own notification"  ON public.chat_notifications;

-- Note on column choice: this table's recipient column is `user_id`
-- and its sender column is `from_user_id` (mentions/notifications
-- schema). The notification rows are produced by an AFTER INSERT
-- trigger on chat_messages whose row sets `from_user_id = NEW.user_id`
-- (the message author). Scoping the policy to `from_user_id =
-- auth.uid()` prevents one user from forging a notification "from"
-- another user, while letting the legitimate trigger path (running
-- as the authoring user) succeed.
DO $$
DECLARE
  has_from_user_id boolean;
  has_sender_id    boolean;
  has_user_id      boolean;
  table_exists     boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'chat_notifications'
  ) INTO table_exists;

  IF NOT table_exists THEN
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'chat_notifications'
      AND column_name = 'from_user_id'
  ) INTO has_from_user_id;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'chat_notifications'
      AND column_name = 'sender_id'
  ) INTO has_sender_id;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'chat_notifications'
      AND column_name = 'user_id'
  ) INTO has_user_id;

  IF has_from_user_id THEN
    EXECUTE $sql$
      CREATE POLICY "Sender can insert own notification"
        ON public.chat_notifications
        FOR INSERT
        TO authenticated
        WITH CHECK (from_user_id = auth.uid());
    $sql$;
  ELSIF has_sender_id THEN
    EXECUTE $sql$
      CREATE POLICY "Sender can insert own notification"
        ON public.chat_notifications
        FOR INSERT
        TO authenticated
        WITH CHECK (sender_id = auth.uid());
    $sql$;
  ELSIF has_user_id THEN
    -- Fallback: only let users create notifications addressed to
    -- themselves. Closes the forge-to-arbitrary-recipient hole.
    EXECUTE $sql$
      CREATE POLICY "Sender can insert own notification"
        ON public.chat_notifications
        FOR INSERT
        TO authenticated
        WITH CHECK (user_id = auth.uid());
    $sql$;
  ELSE
    -- No ownership column we recognize — restrict INSERT to service_role.
    -- Absence of an INSERT policy for authenticated/anon already denies
    -- their writes, so we add a service_role policy purely for clarity.
    EXECUTE $sql$
      CREATE POLICY "Service role can insert notifications"
        ON public.chat_notifications
        FOR INSERT
        TO service_role
        WITH CHECK (true);
    $sql$;
  END IF;
END
$$;


-- =====================================================
-- 13. scout_events — authenticated-only INSERT, optional shape gate
-- =====================================================
ALTER TABLE IF EXISTS public.scout_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert scout events"        ON public.scout_events;
DROP POLICY IF EXISTS "Public can insert scout events"        ON public.scout_events;
DROP POLICY IF EXISTS "Authenticated can insert scout events" ON public.scout_events;

-- The legitimate writer for scout_events is the
-- /api/track-scout route, which uses the service_role client and
-- bypasses RLS entirely. Restricting direct REST inserts to
-- authenticated only (no `anon`) is sufficient to close the audit's
-- "anon writes accepted" finding without breaking the app.
DO $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'scout_events'
  ) INTO table_exists;

  IF NOT table_exists THEN
    RETURN;
  END IF;

  EXECUTE $sql$
    CREATE POLICY "Authenticated can insert scout events"
      ON public.scout_events
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  $sql$;
END
$$;


-- =====================================================
-- 14. function_search_path_mutable — pin search_path on 14 functions
-- =====================================================
-- Some are overloaded; loop over pg_proc by name to cover every signature.
-- Setting search_path = '' forces fully-qualified references inside each
-- function body, blocking schema-hijack-via-search-path attacks if an
-- attacker ever obtains write access to a non-pinned schema.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT format(
             'ALTER FUNCTION %I.%I(%s) SET search_path = ''''',
             n.nspname,
             p.proname,
             pg_get_function_identity_arguments(p.oid)
           ) AS cmd
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'update_subscription_timestamp',
        'update_reaction_counts',
        'update_user_message_stats',
        'update_sm_polls_updated_at',
        'check_ai_cache',
        'update_ai_timestamp',
        'can_bot_post',
        'increment_bot_activity',
        'reset_daily_topic_views',
        'google_set_updated_at',
        'sm_seo_tasks_touch_updated_at',
        'sm_posts_touch_updated_at',
        'increment_view_count',
        'update_importance_with_decay'
      )
  LOOP
    EXECUTE r.cmd;
  END LOOP;
END
$$;


-- =====================================================
-- 15. Admin-read policies on RLS-no-policy sensitive tables
-- =====================================================
-- Each of these tables already has RLS enabled with no policies, which
-- means non-service-role traffic is denied by default. We add explicit
-- admin-read policies so operators can read the rows in the dashboard
-- under their own session, and so future contributors can see at a
-- glance who is allowed in.
--
-- We do NOT add policies for the 15 google_* analytics tables — those
-- stay deny-by-default and are accessed by server actions via the
-- service-role client only.

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'admin_api_keys',
    'admin_oauth_tokens',
    'chat_moderation_log',
    'chat_moderation_rules',
    'writer_payments',
    'writer_payment_formulas',
    'writer_payment_syncs',
    'sm_seo_tasks',
    'sm_seo_task_audits',
    'sm_notification_history',
    'image_optimizations'
  ];
  policy_name text;
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

      policy_name := 'Admins can read ' || t;

      EXECUTE format(
        'DROP POLICY IF EXISTS %I ON public.%I',
        policy_name, t
      );

      EXECUTE format(
        $f$
          CREATE POLICY %I
            ON public.%I
            FOR SELECT
            TO authenticated
            USING (
              EXISTS (
                SELECT 1 FROM public.sm_users me
                WHERE me.id = auth.uid()
                  AND me.role = 'admin'
              )
            )
        $f$,
        policy_name, t
      );
    END IF;
  END LOOP;
END
$$;


-- =====================================================
-- VERIFICATION (run manually after apply)
-- =====================================================
-- 12. Storage LIST should now return [] / 401 for anon:
--   curl -X POST -H "apikey: $ANON" "$SUPA/storage/v1/object/list/media"  -> []
--   curl -X POST -H "apikey: $ANON" "$SUPA/storage/v1/object/list/public" -> []
-- Per-object public URLs (https://.../storage/v1/object/public/media/...)
-- continue to render embedded images normally.
--
-- 13. Forging a chat_notifications row as another user should now fail:
--   insert into chat_notifications(sender_id, ...) values ('<other-uuid>', ...)
--     -> new row violates row-level security policy
-- scout_events anon insert should fail with 401 / RLS denial.
--
-- 14. Verify search_path was pinned:
--   select proname, proconfig from pg_proc
--   where proname in ('update_reaction_counts', 'check_ai_cache', ...)
--   -> proconfig contains 'search_path='
--
-- 15. As an admin, SELECT on each table returns rows; as anon, 0 rows.
