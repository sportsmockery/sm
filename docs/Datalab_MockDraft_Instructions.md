# Mock Draft - Datalab Database Instructions

**From:** SM Frontend Team
**To:** Datalab Team
**Date:** January 29, 2026
**Priority:** HIGH

---

## Overview

The Mock Draft feature on SM (`/mock-draft`) currently calls Datalab API endpoints that return "Draft validation failed". We need to switch to **direct Supabase queries** (like Trade Grading works).

SM already has access to the Datalab Supabase via `datalabAdmin` client. We need the following tables created and populated.

---

## Required Tables

### 1. `gm_draft_prospects`

Draft-eligible prospects for each sport/year.

```sql
CREATE TABLE gm_draft_prospects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sport TEXT NOT NULL,                    -- 'nfl', 'nba', 'nhl', 'mlb'
  draft_year INTEGER NOT NULL,            -- 2025, 2026, etc.

  -- Player Info
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  school TEXT,                            -- College/junior team
  height TEXT,                            -- e.g., "6'4"
  weight INTEGER,                         -- lbs
  age INTEGER,
  headshot_url TEXT,

  -- Draft Projections
  projected_round INTEGER,                -- 1-7 for NFL, 1-2 for NBA, etc.
  projected_pick INTEGER,                 -- Overall pick projection
  grade NUMERIC(4,1),                     -- Prospect grade 0-100

  -- Scouting
  strengths TEXT[],                       -- Array of strength descriptions
  weaknesses TEXT[],                      -- Array of weakness descriptions
  comparison TEXT,                        -- "Comparable to Patrick Mahomes"

  -- Metadata
  espn_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(sport, draft_year, name)
);

-- Index for common queries
CREATE INDEX idx_prospects_sport_year ON gm_draft_prospects(sport, draft_year);
CREATE INDEX idx_prospects_position ON gm_draft_prospects(position);
```

**Sample Data Needed:**
- **NFL 2025**: Top 100-150 prospects (QBs, WRs, OL, EDGE, CB, etc.)
- **NBA 2025**: Top 60 prospects
- **NHL 2025**: Top 100 prospects
- **MLB 2025**: Top 100 prospects

---

### 2. `gm_draft_order`

Draft order for each team by sport/year. This defines which picks each team has.

```sql
CREATE TABLE gm_draft_order (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sport TEXT NOT NULL,
  draft_year INTEGER NOT NULL,

  pick_number INTEGER NOT NULL,           -- Overall pick (1-256 for NFL, 1-60 for NBA)
  round INTEGER NOT NULL,                 -- Round number
  team_key TEXT NOT NULL,                 -- Team key (e.g., 'chi', 'gb', 'det')
  team_name TEXT NOT NULL,                -- Full name (e.g., 'Chicago Bears')
  team_logo TEXT,                         -- Logo URL
  team_color TEXT,                        -- Hex color (e.g., '#0B162A')

  -- For traded picks
  original_team_key TEXT,                 -- If pick was traded
  is_conditional BOOLEAN DEFAULT FALSE,
  condition_note TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(sport, draft_year, pick_number)
);

-- Index
CREATE INDEX idx_draft_order_sport_year ON gm_draft_order(sport, draft_year);
CREATE INDEX idx_draft_order_team ON gm_draft_order(team_key);
```

**Sample Data Needed:**
- Full draft order for each sport's upcoming draft
- Chicago team keys: `chi` (Bears/Bulls/Blackhawks), `chc` (Cubs), `chw` (White Sox)

---

### 3. `gm_mock_drafts`

User's mock draft sessions.

```sql
CREATE TABLE gm_mock_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_email TEXT,

  chicago_team TEXT NOT NULL,             -- 'bears', 'bulls', etc.
  sport TEXT NOT NULL,
  draft_year INTEGER NOT NULL,

  status TEXT DEFAULT 'in_progress',      -- 'in_progress', 'completed', 'graded'
  current_pick INTEGER DEFAULT 1,
  total_picks INTEGER NOT NULL,

  -- Results (after grading)
  overall_grade INTEGER,
  letter_grade TEXT,                      -- 'A+', 'B-', etc.
  analysis TEXT,
  strengths TEXT[],
  weaknesses TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_mock_drafts_user ON gm_mock_drafts(user_id);
CREATE INDEX idx_mock_drafts_status ON gm_mock_drafts(status);
```

---

### 4. `gm_mock_draft_picks`

Individual picks within a mock draft.

```sql
CREATE TABLE gm_mock_draft_picks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mock_draft_id UUID REFERENCES gm_mock_drafts(id) ON DELETE CASCADE,

  pick_number INTEGER NOT NULL,
  round INTEGER NOT NULL,
  team_key TEXT NOT NULL,
  team_name TEXT NOT NULL,
  team_logo TEXT,
  team_color TEXT,

  is_user_pick BOOLEAN DEFAULT FALSE,     -- TRUE if this is the user's team's pick

  -- Selected prospect (NULL until picked)
  prospect_id UUID REFERENCES gm_draft_prospects(id),
  prospect_name TEXT,
  prospect_position TEXT,

  -- AI pick info (for non-user picks)
  ai_reasoning TEXT,

  -- Grading (after draft is graded)
  pick_grade INTEGER,
  pick_analysis TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(mock_draft_id, pick_number)
);

-- Index
CREATE INDEX idx_mock_picks_draft ON gm_mock_draft_picks(mock_draft_id);
```

---

## Chicago Team Picks

For mock drafts, we need to identify which picks belong to the Chicago team. Current 2025 NFL draft order example:

| Team | Round 1 | Round 2 | Round 3 | Notes |
|------|---------|---------|---------|-------|
| Bears | Pick 10 | Pick 42 | Pick 73 | May have traded picks |

SM identifies user picks by matching `team_key` to the Chicago team's key.

---

## Data Flow (How SM Will Query)

### 1. Start Draft (`/api/gm/draft/start`)

```typescript
// SM will run these queries directly:

// 1. Get draft order for the sport/year
const { data: draftOrder } = await datalabAdmin
  .from('gm_draft_order')
  .select('*')
  .eq('sport', 'nfl')
  .eq('draft_year', 2025)
  .order('pick_number')

// 2. Create mock draft session
const { data: mockDraft } = await datalabAdmin
  .from('gm_mock_drafts')
  .insert({
    user_id,
    chicago_team: 'bears',
    sport: 'nfl',
    draft_year: 2025,
    total_picks: draftOrder.length,
  })
  .select()
  .single()

// 3. Create all picks (initially empty)
const picks = draftOrder.map(p => ({
  mock_draft_id: mockDraft.id,
  pick_number: p.pick_number,
  round: p.round,
  team_key: p.team_key,
  team_name: p.team_name,
  team_logo: p.team_logo,
  team_color: p.team_color,
  is_user_pick: p.team_key === 'chi', // Bears
}))

await datalabAdmin.from('gm_mock_draft_picks').insert(picks)
```

### 2. Get Prospects (`/api/gm/draft/prospects`)

```typescript
const { data: prospects } = await datalabAdmin
  .from('gm_draft_prospects')
  .select('*')
  .eq('sport', 'nfl')
  .eq('draft_year', 2025)
  .order('projected_pick')
```

### 3. Submit Pick (`/api/gm/draft/pick`)

```typescript
// Update the pick with selected prospect
await datalabAdmin
  .from('gm_mock_draft_picks')
  .update({
    prospect_id,
    prospect_name: prospect.name,
    prospect_position: prospect.position,
  })
  .eq('mock_draft_id', mock_id)
  .eq('pick_number', pick_number)

// Advance current_pick
await datalabAdmin
  .from('gm_mock_drafts')
  .update({ current_pick: pick_number + 1 })
  .eq('id', mock_id)
```

### 4. Auto-Advance (AI picks for other teams)

SM will use Claude to simulate other teams' picks based on:
- Team needs
- Best player available
- Prospect grades

### 5. Grade Draft (`/api/gm/draft/grade`)

SM will use Claude (like trade grading) to analyze the user's picks and provide:
- Overall grade (0-100)
- Letter grade
- Analysis
- Per-pick grades

---

## Expected API Response Formats

### Start Draft Response

```json
{
  "draft": {
    "id": "uuid",
    "chicago_team": "bears",
    "sport": "nfl",
    "draft_year": 2025,
    "status": "in_progress",
    "current_pick": 1,
    "total_picks": 256,
    "picks": [
      {
        "pick_number": 1,
        "round": 1,
        "team_key": "ten",
        "team_name": "Tennessee Titans",
        "team_logo": "https://...",
        "team_color": "#4B92DB",
        "is_user_pick": false,
        "is_current": true
      },
      // ... more picks
      {
        "pick_number": 10,
        "round": 1,
        "team_key": "chi",
        "team_name": "Chicago Bears",
        "team_logo": "https://...",
        "team_color": "#0B162A",
        "is_user_pick": true,
        "is_current": false
      }
    ],
    "user_picks": [10, 42, 73, 105, 140, 180, 220]
  }
}
```

### Prospects Response

```json
{
  "prospects": [
    {
      "id": "uuid",
      "name": "Cam Ward",
      "position": "QB",
      "school": "Miami",
      "height": "6'2\"",
      "weight": 215,
      "age": 22,
      "headshot_url": "https://...",
      "projected_round": 1,
      "projected_pick": 1,
      "grade": 94,
      "strengths": ["Arm talent", "Mobility", "Clutch performer"],
      "weaknesses": ["Decision making", "Ball security"],
      "comparison": "Patrick Mahomes"
    }
  ]
}
```

---

## Prospect Data Sources

For populating `gm_draft_prospects`:

| Sport | Sources |
|-------|---------|
| NFL | ESPN, NFL.com, The Athletic mock drafts |
| NBA | ESPN, NBA.com, The Ringer |
| NHL | NHL Central Scouting, Elite Prospects |
| MLB | MLB Pipeline, Baseball America |

---

## Priority Order

1. **NFL 2025** - Highest priority (Bears fans, NFL Draft in April)
2. **NBA 2025** - Bulls fans
3. **NHL 2025** - Blackhawks fans
4. **MLB 2025** - Cubs/White Sox fans

---

## Questions for Datalab

1. Do these tables already exist in any form?
2. Is there existing prospect data we can use?
3. Can you populate NFL 2025 prospects first as a test?
4. What's the timeline for getting this data?

---

## Contact

Once tables are created and populated, let SM team know and we'll update the API routes to use direct Supabase queries instead of the failing API endpoints.
