-- Image variants column for /lib/image-optimization.ts aspect-ratio outputs.
-- See plan: /Users/christopherburhans/.claude/plans/rippling-soaring-ember.md  (PR-7)
--
-- Object shape (NOT array — lookup pattern uses key access):
-- {
--   "16x9": { "url": "...", "width": 1200, "height":  675 },
--   "4x3":  { "url": "...", "width": 1200, "height":  900 },
--   "1x1":  { "url": "...", "width": 1200, "height": 1200 }
-- }

alter table sm_posts add column if not exists image_variants jsonb;
