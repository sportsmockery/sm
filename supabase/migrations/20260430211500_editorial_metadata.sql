-- Editorial template metadata + soft word-count gate columns.
-- See plan: /Users/christopherburhans/.claude/plans/rippling-soaring-ember.md  (PR-8)
--
-- Article body is 100% human-written (per addendum 2026-04-30). Scout only
-- produces the visibly-labeled summary and recap blocks within the article.
-- These columns track structural completeness and word count for HCU-driven
-- editorial standards — NOT AI-authored content tracking.

alter table sm_posts add column if not exists article_type text
  check (article_type in ('news','analysis','rumor','recap','feature'))
  default 'news';

alter table sm_posts add column if not exists word_count int;
alter table sm_posts add column if not exists has_tldr boolean default false;
alter table sm_posts add column if not exists has_key_facts boolean default false;
alter table sm_posts add column if not exists has_why_it_matters boolean default false;
alter table sm_posts add column if not exists has_whats_next boolean default false;
alter table sm_posts add column if not exists needs_expansion boolean default false;

-- Soft-gate audit: writer published below the per-type minimum word count.
-- Editorial reviews override frequency before flipping the gate to hard.
alter table sm_posts add column if not exists published_under_min boolean default false;

create index if not exists sm_posts_needs_expansion_idx
  on sm_posts (needs_expansion)
  where needs_expansion = true;

create index if not exists sm_posts_published_under_min_idx
  on sm_posts (published_under_min)
  where published_under_min = true;
