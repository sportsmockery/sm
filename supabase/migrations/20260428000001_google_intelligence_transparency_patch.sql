-- 20260428_google_intelligence_transparency_patch.sql
-- Adds transparency-asset scoring to the existing Google intelligence pipeline.
-- Idempotent: every CREATE uses IF NOT EXISTS, every ALTER uses IF NOT EXISTS,
-- every UPDATE/INSERT is conditional on missing state.

begin;

-- ── google_transparency_assets ──────────────────────────────────────────────
create table if not exists google_transparency_assets (
  id                    text primary key,
  asset_type            text not null check (asset_type in ('about_page','author_page','contact_page','publisher_identity','editorial_policy_page','disclosure_page')),
  url                   text not null,
  label                 text not null,
  owner_scope           text not null check (owner_scope in ('site','author')),
  owner_id              text,
  content_hash          text not null default '',
  last_crawled_at       timestamptz,
  last_evaluated_at     timestamptz,
  status                text not null default 'red' check (status in ('green','amber','red')),
  total                 integer not null default 0 check (total between 0 and 100),
  findings_count        integer not null default 0,
  recommendation_count  integer not null default 0,
  ruleset_version       text not null references google_ruleset_versions(version),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists google_transparency_assets_type_idx  on google_transparency_assets(asset_type);
create index if not exists google_transparency_assets_owner_idx on google_transparency_assets(owner_scope, owner_id);
create index if not exists google_transparency_assets_status_idx on google_transparency_assets(status);

-- ── google_transparency_asset_evaluations (one row per asset × rule × ruleset)
create table if not exists google_transparency_asset_evaluations (
  id               text primary key,
  asset_id         text not null references google_transparency_assets(id) on delete cascade,
  rule_id          text not null,
  rule_family      text not null default 'transparency_assets',
  source_type      text not null check (source_type in ('official-policy','internal-heuristic','sportsmockery-opportunity')),
  status           text not null check (status in ('pass','warn','fail','not_applicable')),
  confidence       numeric(4,3) not null,
  impacted_field   text,
  explanation      text not null,
  remediation      text,
  ruleset_version  text not null,
  evaluated_at     timestamptz not null default now()
);
create index if not exists google_transparency_asset_evaluations_asset_idx on google_transparency_asset_evaluations(asset_id, ruleset_version);
create index if not exists google_transparency_asset_evaluations_rule_idx  on google_transparency_asset_evaluations(rule_id, status);

-- ── google_transparency_asset_history (immutable score history) ─────────────
create table if not exists google_transparency_asset_history (
  id               bigserial primary key,
  asset_id         text not null,
  ruleset_version  text not null,
  total            integer not null,
  prev_total       integer,
  delta            integer,
  trigger          text not null,
  content_hash     text not null,
  scored_at        timestamptz not null default now()
);
create index if not exists google_transparency_asset_history_asset_idx on google_transparency_asset_history(asset_id, scored_at desc);

-- ── Updated-at trigger for the mutable assets table ─────────────────────────
drop trigger if exists google_transparency_assets_updated_at on google_transparency_assets;
create trigger google_transparency_assets_updated_at
before update on google_transparency_assets
for each row execute function google_set_updated_at();

-- ── Patch google_recommendations: support transparency_asset scope + new
--    evidence/suggested_fix columns + admin owner.
alter table google_recommendations
  drop constraint if exists google_recommendations_scope_check;
alter table google_recommendations
  add  constraint google_recommendations_scope_check
       check (scope in ('article','author','sitewide','transparency_asset'));

alter table google_recommendations add column if not exists evidence       text;
alter table google_recommendations add column if not exists suggested_fix  text;

-- Owner column was free text; nothing to change here, but document the new
-- 'admin' value as canonical for transparency assets:
comment on column google_recommendations.owner is 'writer | editor | seo | engineering | admin | unassigned';

-- ── Seed the four real production assets so /about and the named author
--    pages are scored from day one. All seed rows are guarded by ON CONFLICT
--    DO NOTHING so re-running this migration is a no-op.
insert into google_transparency_assets (id, asset_type, url, label, owner_scope, owner_id, ruleset_version, status, total)
values
  ('asset:about',                  'about_page',         'https://test.sportsmockery.com/about',                       'About SM Edge',     'site',   null,             '2026.04.28-1', 'red', 0),
  ('asset:contact',                'contact_page',       'https://test.sportsmockery.com/about#contact',               'Contact',           'site',   null,             '2026.04.28-1', 'red', 0),
  ('asset:publisher',              'publisher_identity', 'https://test.sportsmockery.com/about#publisher',             'Publisher / Contact','site',  null,             '2026.04.28-1', 'red', 0),
  ('asset:author:erik-lambert',    'author_page',        'https://test.sportsmockery.com/authors/erik-lambert',        'Erik Lambert',      'author', 'w-erik-lambert', '2026.04.28-1', 'red', 0),
  ('asset:author:aldo-soto',       'author_page',        'https://test.sportsmockery.com/authors/aldo-soto',           'Aldo Soto',         'author', 'w-aldo-soto',    '2026.04.28-1', 'red', 0)
on conflict (id) do nothing;

-- ── Enqueue an initial scoring job per asset so the worker picks them up on
--    its next tick. Guarded so re-running the migration doesn't double-enqueue.
insert into google_scoring_jobs (id, article_id, trigger, ruleset_version, status, attempts, enqueued_at, payload)
select  encode(digest(a.id || ':seed:2026.04.28-1', 'sha256'), 'hex'),
        a.id,
        case a.asset_type
          when 'about_page'           then 'transparency.about_updated'
          when 'contact_page'         then 'transparency.contact_updated'
          when 'author_page'          then 'transparency.author_page_updated'
          when 'publisher_identity'   then 'transparency.publisher_updated'
          when 'editorial_policy_page' then 'transparency.editorial_policy_updated'
          when 'disclosure_page'      then 'transparency.editorial_policy_updated'
        end,
        '2026.04.28-1',
        'queued', 0, now(),
        jsonb_build_object('kind', 'transparency_asset', 'assetId', a.id, 'seed', true)
from    google_transparency_assets a
where   not exists (
          select 1 from google_scoring_jobs j
          where j.article_id = a.id and j.payload->>'seed' = 'true'
        );

-- ── RLS (admin-only access via service role) ───────────────────────────────
alter table google_transparency_assets             enable row level security;
alter table google_transparency_asset_evaluations  enable row level security;
alter table google_transparency_asset_history      enable row level security;

commit;
