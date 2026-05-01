-- Auto-bump sm_posts.updated_at on every UPDATE so the NewsArticle JSON-LD
-- dateModified field stays accurate even for direct SQL writes that bypass
-- the API (e.g. ad-hoc fixes, batch jobs, future Supabase Studio edits).
--
-- Playbook tip #21: dateModified must change on every edit.

CREATE OR REPLACE FUNCTION public.sm_posts_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only bump if any column actually changed (defensive — Postgres fires
  -- BEFORE UPDATE even for no-op writes via UPDATE ... SET col = col).
  IF NEW IS DISTINCT FROM OLD THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sm_posts_set_updated_at ON public.sm_posts;
CREATE TRIGGER sm_posts_set_updated_at
  BEFORE UPDATE ON public.sm_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.sm_posts_touch_updated_at();
