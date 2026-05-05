-- FAQ cache for articles. Auto-generated FAQs (via Scout) or block-extracted
-- FAQs are stored here so the page renders Google's FAQPage rich-result
-- schema without re-calling the model on every request.
--
-- Shape: jsonb array of { question: string, answer: string } objects.
-- NULL = not yet generated; [] = generated and intentionally empty
-- (e.g. article too short to support 3+ Q&A pairs — Google's threshold).

ALTER TABLE IF EXISTS public.sm_posts
  ADD COLUMN IF NOT EXISTS faq_json JSONB;

COMMENT ON COLUMN public.sm_posts.faq_json IS
  'Cached FAQ Q&A pairs (Google FAQPage schema). NULL = not yet generated. [] = generated, no eligible FAQs. Generated server-side via Scout when missing.';
