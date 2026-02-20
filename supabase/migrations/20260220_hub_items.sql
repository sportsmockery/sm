-- Hub Items: Admin-managed intel feed for Bears hub pages
-- Run this in the DataLab Supabase instance (siwoqfzzcxmngnseyzpv)

CREATE TABLE hub_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  team_slug TEXT NOT NULL DEFAULT 'chicago-bears',
  hub_slug TEXT NOT NULL,  -- trade-rumors | draft-tracker | cap-tracker | depth-chart | game-center
  status TEXT NOT NULL DEFAULT 'draft',  -- draft | published
  headline TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_name TEXT,
  source_url TEXT,
  summary TEXT NOT NULL,
  what_it_means TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  author_id TEXT,
  author_name TEXT,
  hub_meta JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_hub_items_team_hub ON hub_items (team_slug, hub_slug);
CREATE INDEX idx_hub_items_published ON hub_items (status, timestamp DESC) WHERE status = 'published';

-- hub_meta JSONB schema per hub type:
-- trade-rumors: { playerName, position, otherTeam, estimatedCost, capImpact }
-- draft-tracker: { prospectName, position, college, projectedRound, pickRange }
-- cap-tracker: { playerName, moveType, capChange, yearImpacted }
-- depth-chart: { positionGroup, playersInvolved, status }
-- game-center: { gameId, opponent, date, noteType }
