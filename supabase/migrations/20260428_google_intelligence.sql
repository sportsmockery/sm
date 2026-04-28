-- 20260428_google_intelligence.sql
-- Persistence layer for the Google intelligence pipeline.
-- All tables are append-only or upsert-on-key; the worker is responsible for
-- reconciliation (history rows are immutable, current rows are upserted).
--
-- Conventions:
--   * snake_case columns to match the rest of the SM Supabase schema.
--   * jsonb for shapes that change with rulesets (sub-scores, weighting, payload).
--   * created/updated tracked explicitly; trigger only on rows that mutate.
--   * idempotent: every CREATE uses IF NOT EXISTS; every INSERT uses ON CONFLICT
--     where appropriate.

begin;

-- ── Ruleset versions ────────────────────────────────────────────────────────
create table if not exists google_ruleset_versions (
  version          text primary key,
  description      text not null,
  published_at     timestamptz not null default now(),
  is_active        boolean not null default false,
  weighting        jsonb not null,
  rule_count       integer not null default 0,
  created_at       timestamptz not null default now()
);

create unique index if not exists google_ruleset_versions_active_uniq
  on google_ruleset_versions ((is_active)) where is_active = true;

-- ── Scoring jobs queue ──────────────────────────────────────────────────────
create table if not exists google_scoring_jobs (
  id               text primary key,
  article_id       text not null,
  trigger          text not null,
  ruleset_version  text not null references google_ruleset_versions(version),
  status           text not null check (status in ('queued','running','succeeded','failed','cancelled')),
  attempts         integer not null default 0,
  enqueued_at      timestamptz not null default now(),
  started_at       timestamptz,
  completed_at     timestamptz,
  error_message    text,
  payload          jsonb not null default '{}'::jsonb
);
create index if not exists google_scoring_jobs_status_idx       on google_scoring_jobs(status, enqueued_at);
create index if not exists google_scoring_jobs_article_idx      on google_scoring_jobs(article_id);
create index if not exists google_scoring_jobs_active_dedup_idx on google_scoring_jobs(article_id, ruleset_version, trigger) where status in ('queued','running');

-- ── Current article scores (one row per article) ───────────────────────────
create table if not exists google_article_scores (
  article_id           text primary key,
  author_id            text,
  ruleset_version      text not null references google_ruleset_versions(version),
  total                integer not null check (total between 0 and 100),
  sub                  jsonb not null,
  headline_score       integer not null default 0,
  status               text not null check (status in ('green','amber','red')),
  content_hash         text not null,
  author_profile_hash  text not null,
  last_trigger         text not null,
  scored_at            timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists google_article_scores_author_idx on google_article_scores(author_id);
create index if not exists google_article_scores_status_idx on google_article_scores(status);
create index if not exists google_article_scores_total_idx  on google_article_scores(total);

-- ── Article score history (immutable) ───────────────────────────────────────
create table if not exists google_article_score_history (
  id                   bigserial primary key,
  article_id           text not null,
  ruleset_version      text not null,
  total                integer not null,
  sub                  jsonb not null,
  prev_total           integer,
  delta                integer,
  trigger              text not null,
  content_hash         text not null,
  author_profile_hash  text not null,
  scored_at            timestamptz not null default now()
);
create index if not exists google_article_score_history_article_idx on google_article_score_history(article_id, scored_at desc);

-- ── Rule evaluations (one row per article * rule * ruleset) ────────────────
create table if not exists google_rule_evaluations (
  id               text primary key,
  article_id       text not null,
  rule_id          text not null,
  rule_family      text not null,
  source_type      text not null check (source_type in ('official-policy','internal-heuristic','sportsmockery-opportunity')),
  status           text not null check (status in ('pass','warn','fail','not_applicable')),
  confidence       numeric(4,3) not null,
  impacted_field   text,
  explanation      text not null,
  remediation      text,
  ruleset_version  text not null,
  evaluated_at     timestamptz not null default now()
);
create index if not exists google_rule_evaluations_article_idx on google_rule_evaluations(article_id, ruleset_version);
create index if not exists google_rule_evaluations_rule_idx    on google_rule_evaluations(rule_id, status);

-- ── Recommendations ─────────────────────────────────────────────────────────
create table if not exists google_recommendations (
  id               text primary key,
  scope            text not null check (scope in ('article','author','sitewide')),
  scope_id         text not null,
  title            text not null,
  detail           text not null,
  severity         text not null check (severity in ('critical','high','medium','low','info')),
  owner            text not null,
  impact_score     integer not null default 0,
  confidence       numeric(4,3) not null default 0,
  status           text not null check (status in ('open','in_progress','resolved','suppressed','expired')),
  source_type      text not null check (source_type in ('official-policy','internal-heuristic','sportsmockery-opportunity')),
  rule_ids         text[] not null default '{}',
  ruleset_version  text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  resolved_at      timestamptz,
  aging_hours      numeric(8,1) not null default 0
);
create index if not exists google_recommendations_scope_idx    on google_recommendations(scope, scope_id);
create index if not exists google_recommendations_status_idx   on google_recommendations(status);
create index if not exists google_recommendations_severity_idx on google_recommendations(severity);

-- ── Recommendation state history (immutable) ────────────────────────────────
create table if not exists google_recommendation_state_history (
  id                  bigserial primary key,
  recommendation_id   text not null references google_recommendations(id) on delete cascade,
  from_status         text not null,
  to_status           text not null,
  actor               text not null,
  reason              text,
  occurred_at         timestamptz not null default now()
);
create index if not exists google_recommendation_state_history_rec_idx on google_recommendation_state_history(recommendation_id, occurred_at desc);

-- ── System events (every event that could change scoring state) ────────────
create table if not exists google_system_events (
  id            bigserial primary key,
  type          text not null,
  article_id    text,
  author_id     text,
  payload       jsonb not null default '{}'::jsonb,
  occurred_at   timestamptz not null default now()
);
create index if not exists google_system_events_type_idx    on google_system_events(type, occurred_at desc);
create index if not exists google_system_events_article_idx on google_system_events(article_id, occurred_at desc);

-- ── Suppressions / overrides ────────────────────────────────────────────────
create table if not exists google_suppressions (
  id            bigserial primary key,
  scope         text not null check (scope in ('article','author','rule')),
  scope_id      text not null,
  rule_id       text,
  reason        text not null,
  created_by    text not null,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz
);
create index if not exists google_suppressions_scope_idx on google_suppressions(scope, scope_id);

-- ── Audit log (append-only) ─────────────────────────────────────────────────
create table if not exists google_audit_log (
  id            bigserial primary key,
  actor         text not null,
  action        text not null,
  target        text not null,
  metadata      jsonb not null default '{}'::jsonb,
  occurred_at   timestamptz not null default now()
);
create index if not exists google_audit_log_target_idx on google_audit_log(target, occurred_at desc);
create index if not exists google_audit_log_action_idx on google_audit_log(action, occurred_at desc);

-- ── Updated-at trigger for current rows ─────────────────────────────────────
create or replace function google_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end
$$ language plpgsql;

drop trigger if exists google_article_scores_updated_at on google_article_scores;
create trigger google_article_scores_updated_at
before update on google_article_scores
for each row execute function google_set_updated_at();

drop trigger if exists google_recommendations_updated_at on google_recommendations;
create trigger google_recommendations_updated_at
before update on google_recommendations
for each row execute function google_set_updated_at();

-- ── Seed initial active ruleset ─────────────────────────────────────────────
insert into google_ruleset_versions (version, description, is_active, weighting, rule_count, published_at)
values (
  '2026.04.28-1',
  'Initial Google intelligence ruleset aligned to Search Essentials, spam policy, and Google News transparency.',
  true,
  '{
    "searchEssentials": 25,
    "googleNews": 20,
    "trust": 15,
    "spamSafety": 15,
    "technical": 15,
    "opportunity": 10
  }'::jsonb,
  19,
  now()
)
on conflict (version) do update set
  description = excluded.description,
  is_active   = true,
  weighting   = excluded.weighting,
  rule_count  = excluded.rule_count;

-- ── RLS (admin-only access via service role) ───────────────────────────────
-- These tables are only ever read/written by server-side admin code.
-- Enable RLS but do not create permissive policies; the service role bypasses RLS.
alter table google_ruleset_versions             enable row level security;
alter table google_scoring_jobs                 enable row level security;
alter table google_article_scores               enable row level security;
alter table google_article_score_history        enable row level security;
alter table google_rule_evaluations             enable row level security;
alter table google_recommendations              enable row level security;
alter table google_recommendation_state_history enable row level security;
alter table google_system_events                enable row level security;
alter table google_suppressions                 enable row level security;
alter table google_audit_log                    enable row level security;

commit;
