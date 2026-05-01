-- One-time backfill: rewrite hardcoded absolute SportsMockery URLs inside
-- post content to their relative form. Render-time sweep covers anything
-- this misses (e.g. content edited after this runs but before the
-- save-time validator catches it).
--
-- Playbook tip #14. Conservative — only matches inside href / src
-- attribute contexts so we never rewrite a literal mention of the URL
-- inside body text.

UPDATE public.sm_posts
SET content = regexp_replace(
  content,
  '(\b(?:href|src)\s*=\s*"|\b(?:href|src)\s*=\s*'')https?://(?:www\.)?sportsmockery\.com/',
  '\1/',
  'g'
)
WHERE content ~ 'https?://(?:www\.)?sportsmockery\.com/';
