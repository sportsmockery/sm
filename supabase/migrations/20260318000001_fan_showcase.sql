-- Fan Showcase schema
-- Tables for fan-generated content showcase feature

-- 1. fan_creators
CREATE TABLE IF NOT EXISTS fan_creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  handle text,
  email text NOT NULL,
  bio text,
  profile_url text,
  avatar_url text,
  primary_team text NOT NULL CHECK (primary_team IN ('bears', 'bulls', 'cubs', 'white_sox', 'blackhawks')),
  content_focus text CHECK (content_focus IN ('edit', 'art', 'take', 'fantasy_win')),
  social_tag_permission boolean NOT NULL DEFAULT false,
  newsletter_feature_permission boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fan_creators_email ON fan_creators (email);
CREATE INDEX idx_fan_creators_team ON fan_creators (primary_team);

-- 2. fan_submissions
CREATE TABLE IF NOT EXISTS fan_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  creator_id uuid NOT NULL REFERENCES fan_creators(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('edit', 'art', 'take', 'fantasy_win')),
  team text NOT NULL CHECK (team IN ('bears', 'bulls', 'cubs', 'white_sox', 'blackhawks')),
  title text NOT NULL,
  description text,
  written_take text,
  source_platform text CHECK (source_platform IN ('tiktok', 'instagram', 'youtube', 'x', 'other')),
  source_url text,
  medium text,
  league_name text,
  fantasy_platform text,
  brag_line text,
  status text NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'rejected', 'changes_requested', 'featured', 'archived')),
  rights_agreed boolean NOT NULL DEFAULT false,
  moderation_acknowledged boolean NOT NULL DEFAULT false,
  ownership_confirmed boolean NOT NULL DEFAULT false,
  non_infringement_confirmed boolean NOT NULL DEFAULT false,
  ai_relevance_score numeric,
  ai_relevance_reason text,
  ai_non_chicago_flag boolean NOT NULL DEFAULT false,
  ai_safety_flag boolean NOT NULL DEFAULT false,
  ai_caption_1 text,
  ai_caption_2 text,
  ai_caption_3 text,
  featured_at timestamptz,
  viewed_count integer NOT NULL DEFAULT 0,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fan_submissions_slug ON fan_submissions (slug);
CREATE INDEX idx_fan_submissions_creator ON fan_submissions (creator_id);
CREATE INDEX idx_fan_submissions_status ON fan_submissions (status);
CREATE INDEX idx_fan_submissions_team ON fan_submissions (team);
CREATE INDEX idx_fan_submissions_type ON fan_submissions (type);
CREATE INDEX idx_fan_submissions_featured ON fan_submissions (featured_at) WHERE featured_at IS NOT NULL;

-- 3. fan_submission_assets
CREATE TABLE IF NOT EXISTS fan_submission_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES fan_submissions(id) ON DELETE CASCADE,
  asset_type text NOT NULL,
  asset_url text NOT NULL,
  thumbnail_url text,
  width integer,
  height integer,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fan_submission_assets_submission ON fan_submission_assets (submission_id);

-- 4. fan_submission_tags
CREATE TABLE IF NOT EXISTS fan_submission_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES fan_submissions(id) ON DELETE CASCADE,
  tag text NOT NULL
);

CREATE INDEX idx_fan_submission_tags_submission ON fan_submission_tags (submission_id);
CREATE INDEX idx_fan_submission_tags_tag ON fan_submission_tags (tag);

-- 5. fan_moderation_events
CREATE TABLE IF NOT EXISTS fan_moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES fan_submissions(id) ON DELETE CASCADE,
  action text NOT NULL,
  previous_status text,
  new_status text NOT NULL,
  note text,
  acted_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fan_moderation_events_submission ON fan_moderation_events (submission_id);

-- 6. fan_featured_slots
CREATE TABLE IF NOT EXISTS fan_featured_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES fan_submissions(id) ON DELETE CASCADE,
  slot_type text NOT NULL CHECK (slot_type IN ('edit_of_week', 'art_gallery', 'take_of_day', 'fantasy_champion')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fan_featured_slots_active ON fan_featured_slots (active) WHERE active = true;
CREATE INDEX idx_fan_featured_slots_submission ON fan_featured_slots (submission_id);

-- 7. fan_creator_similarity_cache
CREATE TABLE IF NOT EXISTS fan_creator_similarity_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES fan_creators(id) ON DELETE CASCADE,
  similar_creator_id uuid NOT NULL REFERENCES fan_creators(id) ON DELETE CASCADE,
  score numeric NOT NULL DEFAULT 0,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fan_creator_similarity_creator ON fan_creator_similarity_cache (creator_id);

-- RLS policies
ALTER TABLE fan_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_submission_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_submission_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_moderation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_featured_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_creator_similarity_cache ENABLE ROW LEVEL SECURITY;

-- Public read for approved/featured submissions
CREATE POLICY fan_submissions_public_read ON fan_submissions
  FOR SELECT USING (status IN ('approved', 'featured'));

-- Public read for creators with approved submissions
CREATE POLICY fan_creators_public_read ON fan_creators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fan_submissions
      WHERE fan_submissions.creator_id = fan_creators.id
        AND fan_submissions.status IN ('approved', 'featured')
    )
  );

-- Public read for assets of approved submissions
CREATE POLICY fan_submission_assets_public_read ON fan_submission_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fan_submissions
      WHERE fan_submissions.id = fan_submission_assets.submission_id
        AND fan_submissions.status IN ('approved', 'featured')
    )
  );

-- Public read for tags of approved submissions
CREATE POLICY fan_submission_tags_public_read ON fan_submission_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fan_submissions
      WHERE fan_submissions.id = fan_submission_tags.submission_id
        AND fan_submissions.status IN ('approved', 'featured')
    )
  );

-- Public read for featured slots
CREATE POLICY fan_featured_slots_public_read ON fan_featured_slots
  FOR SELECT USING (active = true);

-- Public read for similarity cache
CREATE POLICY fan_creator_similarity_public_read ON fan_creator_similarity_cache
  FOR SELECT USING (true);

-- Anyone can insert creators and submissions (for the submit form)
CREATE POLICY fan_creators_insert ON fan_creators
  FOR INSERT WITH CHECK (true);

CREATE POLICY fan_submissions_insert ON fan_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY fan_submission_assets_insert ON fan_submission_assets
  FOR INSERT WITH CHECK (true);

CREATE POLICY fan_submission_tags_insert ON fan_submission_tags
  FOR INSERT WITH CHECK (true);

-- Service role (admin) gets full access via supabaseAdmin bypassing RLS
