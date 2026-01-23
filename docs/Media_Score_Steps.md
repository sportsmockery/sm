# Media Score System - Implementation Steps

> **Project:** test.sportsmockery.com
> **Agent:** Claude/PostIQ (Primary Engineer/Ops)
> **Framework:** Next.js 16+ (App Router), Supabase (PostgreSQL), Vercel
> **Last Updated:** January 23, 2026

---

## Prerequisites

The following are already configured in Vercel environment variables:
- `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET` - X/Twitter API
- `FB_PAGE_ID`, `FB_PAGE_ACCESS_TOKEN` - Facebook Pages API
- `YOUTUBE_API_KEY` - YouTube Data API v3
- `ANTHROPIC_API_KEY` - PostIQ/Claude API

The human will provide written guardrails and editorial preferences. All other implementation is handled end-to-end by PostIQ.

---

## Global Scope

Build and operate the **Media Score** system for Chicago sports:

### Teams Covered
- Chicago Bears
- Chicago Bulls
- Chicago Blackhawks
- Chicago Cubs
- Chicago White Sox

### Sources
- Reference: `/docs/Post_IQ/PostIQ_Media_Score.md`

### Rules
- Only include accounts/outlets with **~5,000+ followers/subscribers**
- All content normalized into JSON rows in PostgreSQL (Supabase)
- Media Score computed per team and globally with:
  - **Media Score** in `[-1, 1]`
  - **Narrative tags:** `rage`, `panic`, `hope`, `joy`, `apathy`
  - Engagement weighting
  - Source reputation weighting

### Outputs
- API endpoints exposing Media Score and raw context
- Admin page (`/admin/media-score`) and Studio page (`/studio/media-score`) to run Media Score and show 10 headline ideas
- Integration into `/admin/posts/new` and `/studio/posts/new` via PostIQ

---

## Task 1: Database Schema, Models, and Migrations

### 1.1 Define Tables in Supabase

Create migration file: `supabase/media-score-schema.sql`

#### Table: `media_sources`

```sql
CREATE TABLE IF NOT EXISTS media_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  outlet_type TEXT NOT NULL CHECK (outlet_type IN ('rss', 'site', 'twitter', 'facebook', 'youtube')),
  team_tags TEXT[] DEFAULT '{}',
  url TEXT,
  handle TEXT,
  platform_id TEXT,
  followers_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_reputable BOOLEAN DEFAULT true,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_media_sources_outlet_type ON media_sources(outlet_type);
CREATE INDEX idx_media_sources_team_tags ON media_sources USING GIN(team_tags);
CREATE INDEX idx_media_sources_is_active ON media_sources(is_active);
```

#### Table: `media_items`

```sql
CREATE TABLE IF NOT EXISTS media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES media_sources(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('rss', 'site', 'twitter', 'facebook', 'youtube')),
  external_id TEXT NOT NULL,
  url TEXT,
  title TEXT,
  raw_html TEXT,
  raw_json JSONB,
  text_content TEXT,
  team_tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  score REAL,
  narrative_tags TEXT[] DEFAULT '{}',
  UNIQUE(platform, external_id)
);

CREATE INDEX idx_media_items_source_id ON media_items(source_id);
CREATE INDEX idx_media_items_platform ON media_items(platform);
CREATE INDEX idx_media_items_team_tags ON media_items USING GIN(team_tags);
CREATE INDEX idx_media_items_published_at ON media_items(published_at DESC);
CREATE INDEX idx_media_items_fetched_at ON media_items(fetched_at DESC);
CREATE INDEX idx_media_items_score ON media_items(score);
```

#### Table: `media_score_snapshots`

```sql
CREATE TABLE IF NOT EXISTS media_score_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calculated_at TIMESTAMPTZ DEFAULT now(),
  team TEXT NOT NULL CHECK (team IN ('bears', 'bulls', 'hawks', 'cubs', 'sox', 'all')),
  media_score REAL NOT NULL,
  inputs_summary JSONB,
  top_topics JSONB
);

CREATE INDEX idx_media_score_snapshots_team ON media_score_snapshots(team);
CREATE INDEX idx_media_score_snapshots_calculated_at ON media_score_snapshots(calculated_at DESC);
```

### 1.2 TypeScript Service Layer

Create file: `/src/lib/media-score-service.ts`

Implement functions:
- `upsertMediaSource(input: MediaSourceInput): Promise<MediaSource>`
- `upsertMediaItem(input: MediaItemInput): Promise<MediaItem>`
- `getRecentMediaItems({ team?: string, hoursBack?: number, limit?: number }): Promise<MediaItem[]>`
- `getLatestSnapshotsPerTeam(): Promise<MediaScoreSnapshot[]>`
- `insertMediaScoreSnapshot(snapshot: MediaScoreSnapshotInput): Promise<MediaScoreSnapshot>`

Include proper error handling and logging to console.

### 1.3 Apply Migrations and Verify

- Run migrations via Supabase Dashboard or CLI
- Insert test rows via the service layer
- Log "DB OK" on success or detailed errors on failure
- Verify all tables can be joined via `source_id` foreign key

---

## Task 2: Media Sources Seed and Key Validation

### 2.1 Build Initial Media Sources Seed

Create file: `/src/lib/media-score-seed.ts`

Include reputable Chicago sports media sources:

| Name | Outlet Type | Team Tags | Estimated Followers |
|------|-------------|-----------|---------------------|
| Sports Mockery | site, twitter, facebook | bears, bulls, hawks, cubs, sox | 100,000+ |
| CHGO Sports | youtube, twitter | bears, bulls, hawks, cubs, sox | 200,000+ |
| NBC Sports Chicago | site, twitter, facebook | bears, bulls, hawks, cubs, sox | 500,000+ |
| ESPN Chicago | site, twitter | bears, bulls, hawks, cubs, sox | 1,000,000+ |
| Chicago Tribune Sports | site, twitter | bears, bulls, hawks, cubs, sox | 500,000+ |
| Chicago Sun-Times Sports | site, twitter | bears, bulls, hawks, cubs, sox | 300,000+ |
| CBS Chicago Sports | site, twitter | bears, bulls, hawks, cubs, sox | 200,000+ |
| Fox 32 Chicago Sports | site, twitter | bears, bulls, hawks, cubs, sox | 150,000+ |
| ChicagoSportsHQ | twitter | bears, bulls, hawks, cubs, sox | 50,000+ |

For each source set:
- `outlet_type` (rss, site, twitter, facebook, youtube)
- `url`, `handle`, `platform_id`
- `team_tags` (bears, bulls, hawks, cubs, sox)
- `is_reputable = true`
- `followers_count` (conservative estimate)

Optionally add large Chicago sports personalities/shows (Dan Bernstein, Laurence Holmes, etc.).

### 2.2 Seed Script

Create file: `/scripts/seed-media-sources.ts`

- Insert seed data into `media_sources`
- Ensure slug uniqueness
- Log number of rows inserted

### 2.3 Validate API Keys via Code

Create file: `/src/app/api/media-score/validate-keys/route.ts`

For each platform, attempt one read operation:

**X/Twitter:**
```typescript
// For each 'twitter' source, fetch user profile
// Log SUCCESS or FAILURE with HTTP status
```

**Facebook:**
```typescript
// For each 'facebook' source, fetch page info
// Log SUCCESS or FAILURE with HTTP status
```

**YouTube:**
```typescript
// For each 'youtube' source, fetch channel info
// Log SUCCESS or FAILURE with HTTP status
```

Do not rely on manual testing; execute checks in code with visible logs.

---

## Task 3: Ingestion Pipeline and Scheduling

### 3.1 RSS/Site Ingestion

Create file: `/src/lib/media-score-ingestors/rss-ingestor.ts`

For `rss`/`site` media_sources:
- Fetch feeds at configured interval (15-30 minutes)
- For each new item:
  - Extract title, summary, full text, published_at
  - Build raw_json and text_content
  - Tag teams (Task 5)
  - Classify score via PostIQ (Task 4)
  - Upsert into media_items

### 3.2 X/Twitter Ingestion

Create file: `/src/lib/media-score-ingestors/twitter-ingestor.ts`

Using existing `X_*` env keys:
- Fetch recent posts per account within rate limits
- Normalize into media_items:
  - external_id, url, text, metrics (likes, retweets, replies)
- Tag teams
- Classify score
- Upsert into media_items

### 3.3 Facebook Ingestion

Create file: `/src/lib/media-score-ingestors/facebook-ingestor.ts`

Using existing `FB_*` env keys:
- Fetch recent posts per Page
- Normalize into media_items:
  - external_id, url, message, reactions/comments/shares counts
- Tag teams
- Classify score
- Upsert into media_items

### 3.4 YouTube Ingestion

Create file: `/src/lib/media-score-ingestors/youtube-ingestor.ts`

Using `YOUTUBE_API_KEY`:
- Fetch recent videos per channel
- Normalize into media_items:
  - external_id, url, title, description, view_count, like_count, comment_count
- Tag teams
- Classify score
- Upsert into media_items

### 3.5 Scheduling (Vercel Cron)

Create file: `/src/app/api/cron/media-score-ingest/route.ts`

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/media-score-ingest",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

Ensure idempotency via `UNIQUE(platform, external_id)` constraint.

---

## Task 4: Score Classification (PostIQ)

### 4.1 Implement Score Classification

Create file: `/src/lib/media-score-classifier.ts`

```typescript
interface ScoreResult {
  score: number        // [-1, 1]
  narrative_tags: string[]  // ['rage', 'panic', 'hope', 'joy', 'apathy']
}

async function classifyScoreWithPostIQ(text: string): Promise<ScoreResult>
```

Uses PostIQ/Claude model to analyze text and return:
- `score` in [-1, 1]
- `narrative_tags` subset of: `rage`, `panic`, `hope`, `joy`, `apathy`

### 4.2 Scoring Formula Per Item

For each media item, compute:

**Tone Multiplier (m_tone):**
- `rage`, `joy`: 1.2
- `panic`, `hope`: 1.1
- `apathy`: 0.7
- Multiple tags: average

**Engagement Factor (e):**
- Range [0, 1] based on likes, comments, shares, views
- Normalized against platform averages

**Source Weight (w_source):**
- Range [0.5, 1.5] based on outlet reputation

**Item Score:**
```
s_item = s_text * m_tone * (0.5 + 0.5 * e)
```

### 4.3 Rolling Media Score Calculation

For each team T (`bears`, `bulls`, `hawks`, `cubs`, `sox`, `all`) over last 24h:
- Collect items where `T ∈ team_tags`
- Calculate: `w_i = w_source_i * (0.5 + 0.5 * e_i)`
- Compute: `S_T = (Σ w_i * s_item_i) / (Σ w_i)`, clamped to [-1, 1]

Save to `media_score_snapshots`:
- `media_score = S_T`
- `inputs_summary` = counts, average engagement, etc.
- `top_topics` = cluster of themes and sample items

### 4.4 Media Score Cron

Create file: `/src/app/api/cron/media-score-calculate/route.ts`

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/media-score-calculate",
      "schedule": "0 * * * *"
    }
  ]
}
```

Log summary results per team and key topics.

---

## Task 5: Team Tagging

### 5.1 Implement Team Tagging Function

Create file: `/src/lib/media-score-tagger.ts`

```typescript
type Team = 'bears' | 'bulls' | 'hawks' | 'cubs' | 'sox'

function tagTeamsFromText(text: string): Team[]
```

**Keyword Rules:**
| Team | Keywords |
|------|----------|
| Bears | "Bears", "Halas Hall", "Soldier Field", "Caleb Williams", "Matt Eberflus" |
| Bulls | "Bulls", "United Center", "Coby White", "Zach LaVine" |
| Blackhawks | "Blackhawks", "Hawks" (NHL context), "Connor Bedard" |
| Cubs | "Cubs", "Wrigley", "Wrigley Field" |
| White Sox | "White Sox", "Sox" (baseball context), "South Side", "Guaranteed Rate Field", "Rate Field" |

Include guards to avoid false positives (e.g., "hawks" in non-NHL context).

### 5.2 Integration

For every ingested media item:
- Run `tagTeamsFromText(title + ' ' + text_content)`
- Store result in `team_tags` column

---

## Task 6: PostIQ Wiring and API Routes

### 6.1 PostIQ Helper

Create file: `/src/lib/postiq-client.ts`

```typescript
interface PostIQOptions {
  prompt: string
  maxTokens?: number
}

async function callPostIQ(options: PostIQOptions): Promise<{ response: string }>
```

Requirements:
- Read `ANTHROPIC_API_KEY` from env
- Throw clear error if key missing
- Handle HTTP/network errors with informative messages

### 6.2 API: GET /api/media-score/context

Create file: `/src/app/api/media-score/context/route.ts`

**Response:**
```typescript
{
  snapshots: MediaScoreSnapshot[]  // Latest per team
  items: MediaItem[]               // Recent 24h, limit ~200
}
```

**Error Responses:**
- `500 { error: 'INCOMPLETE_CONTEXT', message: '...' }` - Missing snapshots or items
- `500 { error: 'SERVER_ERROR', message: '...', detail?: any }` - Server error

### 6.3 API: POST /api/media-score/headlines

Create file: `/src/app/api/media-score/headlines/route.ts`

**Steps:**
1. Load snapshots and recent items
2. If none: return `500 { error: 'NO_SNAPSHOTS' }` or `{ error: 'NO_ITEMS' }`
3. Build prompt asking PostIQ to:
   - Detect key storylines and media mood
   - Return 10 headlines with: `title`, `team`, `angle`, `why_now`
4. Call `callPostIQ`
5. Parse JSON response:
   - Success: return `{ headlines }`
   - Parse failure: `500 { error: 'BAD_AI_JSON', message: '...', raw: originalResponse }`
6. Other errors: `500 { error: 'SERVER_ERROR', message: '...' }`

---

## Task 7: Admin/Studio UI Integration

### 7.1 Admin Media Score Page

Create file: `/src/app/admin/media-score/page.tsx`

Features:
- "Run Media Score" button
- Calls `/api/media-score/headlines`
- Displays:
  - Loading state
  - List of `{ title, team, angle, why_now }`
  - Error banner with code and message on failure
- Shows current Media Score per team with visual indicator (gauge or color scale)

### 7.2 Studio Media Score Page

Create file: `/src/app/studio/media-score/page.tsx`

Same features as admin page.

### 7.3 Shared Helpers

Create file: `/src/lib/media-score-helpers.ts`

```typescript
async function fetchMediaScoreContext(): Promise<MediaScoreContext>
// Calls /api/media-score/context
// Throws Error on non-200

async function generateHeadlinesWithMediaScore(options: {
  draftTitle?: string
  draftNotes?: string
  team?: string
}): Promise<string[]>
// Calls fetchMediaScoreContext()
// If success: pass context into PostIQ prompt
// If fail: pass null context, tell model context unavailable
// Returns array of headlines
```

### 7.4 Wire into Post Editors

**File:** `/src/components/admin/PostEditor/AdvancedPostEditor.tsx`

- Use `generateHeadlinesWithMediaScore` when "Generate Headlines" clicked
- Show non-blocking warning if context fails
- Still produce headlines (model works without context, just less informed)

**File:** `/src/app/studio/posts/new/StudioPostEditor.tsx`

- Same behavior as admin editor

### 7.5 Add Sidebar Navigation

**Admin Sidebar:** Add "Media Score" link to `/admin/media-score`

**Studio Sidebar:** Add "Media Score" link to `/studio/media-score`

---

## Task 8: Self-Verification and Status Report

### 8.1 Verify Keys and APIs

Run health checks:
- X/Twitter: Attempt read with existing env vars
- Facebook: Attempt read with existing env vars
- YouTube: Attempt read with existing env vars
- PostIQ/Claude: Attempt simple prompt

Log successes/failures for each.

### 8.2 Verify Database and Migrations

- Insert test rows for all three tables
- Read back to verify
- Test foreign key join: `media_items` → `media_sources`
- Log success or detailed errors

### 8.3 Verify Full Flow

On test.sportsmockery.com:
1. Ensure ingestion has run at least once
2. Ensure Media Score cron has produced snapshots
3. Call `/api/media-score/context` - verify shape
4. Call `/api/media-score/headlines` - verify shape
5. Visit `/admin/media-score` - verify UI loads
6. Visit `/studio/media-score` - verify UI loads

### 8.4 Produce Status Report

Format:
```
=== MEDIA SCORE SYSTEM STATUS REPORT ===
Date: [timestamp]

DATA SOURCES:
- media_sources count: [N]
- Active sources: [N]
- By platform: RSS [N], Twitter [N], Facebook [N], YouTube [N]

INGESTION STATUS:
- Last ingestion: [timestamp]
- media_items count (24h): [N]
- Items by team: Bears [N], Bulls [N], Hawks [N], Cubs [N], Sox [N]

MEDIA SCORE STATUS:
- Latest snapshots: [timestamp]
- Bears: [score], Bulls: [score], Hawks: [score], Cubs: [score], Sox: [score], All: [score]

API ENDPOINTS:
- /api/media-score/context: [OK/FAIL]
- /api/media-score/headlines: [OK/FAIL]
- /api/media-score/validate-keys: [OK/FAIL]

ADMIN/STUDIO INTEGRATION:
- /admin/media-score: [OK/FAIL]
- /studio/media-score: [OK/FAIL]
- PostIQ headline integration: [OK/FAIL]

REMAINING TODOS:
- [list any edge cases or incomplete items]

=== END REPORT ===
```

Do not rely on human to run manual SQL or API tests. Implement, run, and verify as much as the environment allows, then present clear status back.

---

## File Structure Summary

```
/src
  /app
    /admin
      /media-score
        page.tsx
    /studio
      /media-score
        page.tsx
    /api
      /media-score
        /context
          route.ts
        /headlines
          route.ts
        /validate-keys
          route.ts
      /cron
        /media-score-ingest
          route.ts
        /media-score-calculate
          route.ts
  /lib
    media-score-service.ts
    media-score-classifier.ts
    media-score-tagger.ts
    media-score-helpers.ts
    postiq-client.ts
    /media-score-ingestors
      rss-ingestor.ts
      twitter-ingestor.ts
      facebook-ingestor.ts
      youtube-ingestor.ts
/scripts
  seed-media-sources.ts
/supabase
  media-score-schema.sql
/docs
  Media_Score_Steps.md (this file)
  /Post_IQ
    PostIQ_Media_Score.md (reference)
```

---

## Quick Reference: Media Score Scale

| Score | Meaning | Narrative Tags |
|-------|---------|----------------|
| -1.0 | Extremely negative, rage-filled | rage, panic |
| -0.5 | Moderately negative, critical | panic, apathy |
| 0.0 | Neutral, balanced | apathy |
| +0.5 | Moderately positive, hopeful | hope |
| +1.0 | Extremely positive, euphoric | joy, hope |

---

*This document is the implementation blueprint for the Media Score system. PostIQ will execute these tasks end-to-end, verify functionality, and report status.*
