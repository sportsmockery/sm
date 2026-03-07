# DataLab Request: EDGE Feed + Pulse Tables & Crons

> **Requested by:** SM Frontend (test.sportsmockery.com)
> **Purpose:** Power the `/edge2` page with pre-computed AI content so page loads are instant Supabase reads instead of live AI calls.
> **Priority:** Required before `/edge2` can go live with real data

---

## Problem

The current `/edge` page fires 3+ Scout AI queries on every page load. This is:
- **Slow** (5-10s per visit while AI generates)
- **Expensive** (every page view = multiple Perplexity API calls)
- **Unscalable** (100 visitors/hr = 300+ AI calls/hr)

## Solution

Create two tables in DataLab Supabase. A cron job regenerates the content every 15-30 minutes using Scout AI. The frontend reads the pre-computed rows — zero AI calls per page view.

---

## Table 1: `edge_feed`

AI-generated feed cards for the EDGE page. Each row is one card.

```sql
CREATE TABLE edge_feed (
  id SERIAL PRIMARY KEY,
  feed_type TEXT NOT NULL,          -- 'recap', 'pulse', 'rumors', 'headlines', 'team_spotlight'
  title TEXT NOT NULL,              -- Card title: "Morning Bears EDGE"
  content TEXT NOT NULL,            -- AI-generated text (SM voice, witty, unfiltered)
  team_key TEXT,                    -- NULL for multi-team, or 'bears'/'bulls'/'blackhawks'/'cubs'/'whitesox'
  accent_color TEXT DEFAULT 'cyan', -- 'cyan' or 'red' (frontend maps to #00D4FF / #BC0000)
  sort_order INT DEFAULT 0,        -- Display priority (lower = higher)
  time_slot TEXT NOT NULL,          -- 'morning', 'afternoon', 'evening'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL   -- When this content goes stale
);

-- Index for the primary query pattern
CREATE INDEX idx_edge_feed_slot_expires ON edge_feed (time_slot, expires_at);
```

### Content Generation Rules

The cron generates feed cards by calling the existing **Scout AI** endpoint (`/api/query`). Scout already has the SM voice built into its system prompt — do NOT create a separate voice/persona. Just send the query to Scout and store whatever it returns.

Cards to generate per time slot:

| feed_type | title pattern | Scout query | accent_color | sort_order |
|-----------|--------------|-------------|--------------|------------|
| `recap` | "Morning/Afternoon/Evening EDGE" | "Give me a morning/afternoon/evening Chicago sports recap. Cover all 5 teams, 3-5 key items." | `cyan` | 1 |
| `pulse` | "Chicago Pulse" | "What's the vibe across all 5 Chicago teams today? Games, trends, energy level." | `cyan` | 2 |
| `rumors` | "Trade Buzz" | "Latest Chicago sports rumors, trades, signings, and buzz. Be specific with names and sources." | `red` | 3 |
| `headlines` | "What You Need to Know" | "Top 5 Chicago sports headlines right now. One sentence each." | `red` | 4 |
| `team_spotlight` | "{Team} Spotlight" | "Deep take on the {team}'s current situation." (rotate team daily) | `cyan` | 5 |

### Time Slots

| Slot | Hours (CT) | Query flavor |
|------|-----------|--------------|
| `morning` | 5am - 10:59am | "morning" — recap yesterday's results |
| `afternoon` | 11am - 4:59pm | "afternoon" — preview tonight's games |
| `evening` | 5pm - 4:59am | "evening" — gameday context |

### Expiration

Set `expires_at` to the end of the current time slot:
- Morning cards expire at 11:00am CT
- Afternoon cards expire at 5:00pm CT
- Evening cards expire at 5:00am CT next day

The cron should upsert (delete old + insert new) for the current time slot on each run.

---

## Table 2: `edge_pulse`

Live-ish team metrics for the EDGE pulse strip. One row per team metric.

```sql
CREATE TABLE edge_pulse (
  id SERIAL PRIMARY KEY,
  team_key TEXT NOT NULL,           -- 'bears', 'bulls', 'blackhawks', 'cubs', 'whitesox'
  label TEXT NOT NULL,              -- "Anxiety Level", "Playoff Odds", "Net Rating L10"
  value TEXT NOT NULL,              -- "87%", "-3.2", "+450"
  trend TEXT DEFAULT 'flat',        -- 'up', 'down', 'flat'
  accent_color TEXT DEFAULT 'cyan', -- 'cyan' or 'red'
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- One row per team
CREATE UNIQUE INDEX idx_edge_pulse_team ON edge_pulse (team_key);
```

### Pulse Metric Ideas (per team)

These can be computed from existing DataLab tables — no AI needed:

| Team | Label | Source | Notes |
|------|-------|--------|-------|
| Bears | "Season Record" | `bears_season_record` | e.g. "11-6" |
| Bulls | "Net Rating L10" | `bulls_player_game_stats` / `bulls_seasons` | Compute from last 10 games |
| Blackhawks | "Points Pace" | `blackhawks_seasons` | Project from current pace |
| Cubs | "Playoff Odds" | External or computed | If available |
| White Sox | "Rebuild Index" | Creative metric | Fun SM-style stat |

Or use Scout AI to generate creative metrics (one AI call for all 5, runs on cron).

### Trend Logic

Compare current value to previous cron run:
- Value went up → `'up'`
- Value went down → `'down'`
- Same or N/A → `'flat'`

---

## Cron Schedule

**IMPORTANT: Check if existing crons already cover this data before creating new ones.** If there's already a cron that generates recaps, pulse metrics, or headlines, reuse it — just have it also write to these tables. Do NOT create duplicate crons that call Scout for the same data.

| Cron | Frequency | What it does |
|------|-----------|-------------|
| `edge_feed_refresh` | Every 30 min | Generate feed cards for current time slot, upsert into `edge_feed` |
| `edge_pulse_refresh` | Every 15 min | Compute/refresh pulse metrics, upsert into `edge_pulse` |

### Feed Refresh Logic

```
1. Determine current time_slot ('morning' / 'afternoon' / 'evening')
2. Delete existing rows for that time_slot
3. Call Scout (/api/query) with each prompt (5 queries, can run in parallel)
4. Insert new rows with appropriate expires_at
5. Log success/failure
```

### Pulse Refresh Logic

```
1. For each team, compute current metric from existing tables (no AI needed)
2. Compare to previous value (if exists) to determine trend
3. Upsert into edge_pulse (ON CONFLICT team_key DO UPDATE)
```

---

## RLS / Permissions

Both tables should be **readable by anon key** (the frontend uses `datalabClient` with the anon key):

```sql
ALTER TABLE edge_feed ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read edge_feed" ON edge_feed FOR SELECT USING (true);

ALTER TABLE edge_pulse ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read edge_pulse" ON edge_pulse FOR SELECT USING (true);
```

Write access should be restricted to the service role (used by the cron).

---

## Seed Data (for testing before crons are live)

Insert a few rows so the frontend can develop against real data:

```sql
INSERT INTO edge_feed (feed_type, title, content, team_key, accent_color, sort_order, time_slot, expires_at)
VALUES
  ('recap', 'Morning EDGE', E'The Bears OTA reports keep trickling in and the vibe is cautiously optimistic — which in Chicago means we''re two bad practices from full panic mode.\n\n- Caleb Williams connecting on deep balls to Rome Odunze. The arm talent is real, the protection is still a question mark.\n- Bulls sitting at 23-22, somehow still alive for the play-in. Net rating says no. Heart says maybe. Copium says definitely.\n- Blackhawks quietly on a 3-game point streak. Bedard with 5 points in that stretch.\n- Cubs spring training ERA sitting at 3.21 — don''t read into it but also definitely read into it.\n- White Sox exist. They''re rebuilding. It''s fine. Everything is fine.', NULL, 'cyan', 1, 'morning', NOW() + INTERVAL '6 hours'),

  ('rumors', 'Trade Buzz', E'Rumor mill is quiet but keep your ears open:\n\n- Bears being connected to veteran pass rusher help. Nothing concrete but the cap space is there.\n- Bulls front office reportedly split on whether to buy or sell at the deadline. Classic.\n- Cubs eyeing bullpen arms per multiple sources. The rotation depth is there but the pen needs work.\n- Blackhawks prospect Artyom Levshunov drawing elite comparisons in AHL. ETA could be sooner than expected.', NULL, 'red', 3, 'morning', NOW() + INTERVAL '6 hours'),

  ('pulse', 'Chicago Pulse', E'The temperature across the city right now:\n\nBears: Offseason optimism at 7/10. The Caleb hype train is loading passengers.\nBulls: Existential crisis mode. Too good to tank, too mid to contend. Classic Bulls purgatory.\nBlackhawks: Patient rebuild actually showing signs of life. Bedard is that dude.\nCubs: Cautiously excited. The young pitching is real but can it hold up?\nWhite Sox: Full rebuild acceptance stage. It''s actually kind of peaceful down on 35th.', NULL, 'cyan', 2, 'morning', NOW() + INTERVAL '6 hours');

INSERT INTO edge_pulse (team_key, label, value, trend, accent_color, sort_order)
VALUES
  ('bears', 'Anxiety Level', '72%', 'down', 'red', 1),
  ('bulls', 'Playoff Odds', '34%', 'up', 'cyan', 2),
  ('blackhawks', 'Bedard Hype', '+520', 'up', 'cyan', 3),
  ('cubs', 'Rotation ERA', '3.21', 'down', 'cyan', 4),
  ('whitesox', 'Rebuild Pain', '94%', 'flat', 'red', 5);
```

---

## Frontend Query Patterns

The SM frontend will query these tables via `datalabClient` (anon key, read-only):

```typescript
// Feed
const { data } = await datalabClient
  .from('edge_feed')
  .select('*')
  .eq('time_slot', 'morning')  // or 'afternoon' or 'evening'
  .gte('expires_at', new Date().toISOString())
  .order('sort_order')
  .limit(10)

// Pulse
const { data } = await datalabClient
  .from('edge_pulse')
  .select('*')
  .order('sort_order')
```

---

## Success Criteria

- [ ] Tables created with RLS (anon read, service write)
- [ ] Seed data inserted for all 3 time slots
- [ ] Feed cron runs every 30 min, generates 3-5 cards per slot
- [ ] Pulse cron runs every 15 min, updates 5 team metrics
- [ ] Frontend can read both tables with anon key
- [ ] Content uses SM voice (witty, Bears-first, unfiltered)
