-- Pre-publish guardrails: schema constraints + audit log
-- Adds: case-insensitive partial unique index on (slug) for published posts,
-- and the sm_posts_publish_audits log table that the publish endpoint
-- writes to on every attempt (success or fail).

-- 1) Slug uniqueness for published posts (case-insensitive).
-- Drafts can share slugs (writers fork drafts during editorial review);
-- the index only fires once a post hits status='published'.
CREATE UNIQUE INDEX IF NOT EXISTS sm_posts_slug_published_unique
  ON public.sm_posts (lower(slug))
  WHERE status = 'published';

-- 2) Publish-attempt audit log.
-- We log every attempt so editorial can review which rules fire most often
-- and tune the soft / hard mode per rule. NOT a foreign key on user_id —
-- mirrors the auth.users → sm_users mapping the rest of the codebase uses.
-- post_id type matches sm_posts.id (bigint/integer in this schema). user_id
-- stays uuid since it points at auth.users / sm_users.
CREATE TABLE IF NOT EXISTS public.sm_posts_publish_audits (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       bigint NOT NULL REFERENCES public.sm_posts(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL,
  attempted_at  timestamptz NOT NULL DEFAULT now(),
  passed        boolean NOT NULL,
  failed_rules  jsonb NOT NULL DEFAULT '[]'::jsonb,
  word_count    integer,
  enforce_mode  boolean NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS sm_posts_publish_audits_post_id_idx
  ON public.sm_posts_publish_audits (post_id);

CREATE INDEX IF NOT EXISTS sm_posts_publish_audits_attempted_at_idx
  ON public.sm_posts_publish_audits (attempted_at DESC);

-- RLS: only admins read this table (matches the rest of sm_* admin tables).
ALTER TABLE public.sm_posts_publish_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read publish audits" ON public.sm_posts_publish_audits;
CREATE POLICY "Admins read publish audits"
  ON public.sm_posts_publish_audits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sm_users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- 3) author_id NOT NULL — staged.
-- The sm_posts schema currently allows NULL for backwards-compat with
-- legacy WordPress imports that lacked an author. We backfill missing
-- authors to the brand "Sports Mockery" account before flipping NOT NULL.
DO $$
DECLARE
  brand_id bigint;
BEGIN
  SELECT id INTO brand_id
  FROM public.sm_authors
  WHERE display_name ILIKE '%Sports Mockery%'
  ORDER BY id ASC
  LIMIT 1;

  IF brand_id IS NOT NULL THEN
    UPDATE public.sm_posts
    SET author_id = brand_id
    WHERE author_id IS NULL;
  END IF;
END $$;

-- Only flip NOT NULL if every row has an author (no surprise breakage in
-- environments where the brand author hasn't been seeded).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.sm_posts WHERE author_id IS NULL) THEN
    ALTER TABLE public.sm_posts ALTER COLUMN author_id SET NOT NULL;
  END IF;
END $$;
