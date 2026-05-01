-- Author SEO metadata + slug uniqueness for /author/[slug] route + Person JSON-LD
-- See plan: /Users/christopherburhans/.claude/plans/rippling-soaring-ember.md  (PR-4)

-- Slug is the foundation for /author/[slug] — add first if missing, before any
-- backfill that references it. Some environments had it from supabase-setup.sql;
-- others did not.
alter table sm_authors add column if not exists slug text;
alter table sm_authors add column if not exists job_title text;
alter table sm_authors add column if not exists alumni_of text;
alter table sm_authors add column if not exists knows_about text[];
alter table sm_authors add column if not exists same_as text[];
alter table sm_authors add column if not exists active boolean default true;

create index if not exists sm_authors_active_idx on sm_authors (active);

-- Backfill slugs for ACTIVE authors missing one (skip archived/deleted to avoid collisions)
update sm_authors
   set slug = lower(regexp_replace(display_name, '[^a-zA-Z0-9]+', '-', 'g'))
 where slug is null
   and active = true
   and display_name is not null;

-- Trim leading/trailing dashes that the slugify regex may produce
update sm_authors
   set slug = regexp_replace(slug, '(^-+|-+$)', '', 'g')
 where slug ~ '(^-|-$)';

-- Resolve any slug collisions deterministically BEFORE creating the unique index
update sm_authors a
   set slug = a.slug || '-' || a.id::text
 where exists (
   select 1 from sm_authors b
    where b.slug = a.slug
      and b.id <> a.id
      and a.active = true
      and b.active = true
 );

create unique index if not exists sm_authors_slug_unique
  on sm_authors (slug)
  where slug is not null;
