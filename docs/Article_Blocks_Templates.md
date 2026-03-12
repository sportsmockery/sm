# Article Blocks & Templates — Production Spec

> **Last Updated:** March 12, 2026 (V3 — production hardening)
> **Purpose:** Definitive reference for the SM Edge block-driven content system. Covers blocks, templates, automated editorial features, article-level fields, platform inserts, and production requirements.

---

## 1. Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ARTICLE RECORD (sm_posts)                    │
│                                                                     │
│  Article-Level Fields          Block JSON (content column)          │
│  ┌──────────────────┐          ┌──────────────────────────┐        │
│  │ title            │          │ { version: 1,            │        │
│  │ dek              │          │   template: "...",       │        │
│  │ excerpt          │          │   blocks: [              │        │
│  │ heroImage        │          │     { type, data },      │        │
│  │ tags             │          │     ...                  │        │
│  │ author metadata  │          │   ] }                    │        │
│  │ publishedAt      │          └──────────────────────────┘        │
│  │ updatedAt        │                                              │
│  │ seo fields       │          Automated Editorial Layer           │
│  │ social fields    │          ┌──────────────────────────┐        │
│  └──────────────────┘          │ keyTakeaways (3 bullets) │        │
│                                │ keyTakeawaysStatus       │        │
│                                │ scoutSummary             │        │
│                                │ contentHash              │        │
│                                └──────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘

                                │
                    ┌───────────┼──────────┐
                    ▼           ▼          ▼
             Article Page    Feed Cards   Platform Inserts
             (renderer)     (extractor)   (render-time)
```

### Data Flow

```
Writer → PostIQ (Block Editor) → Article JSON + Article Fields → Save to sm_posts
Scout AI (DataLab) → Key Takeaways + Scout Summary → Save to sm_posts
Article Page Load → Block Renderer + Automated Layer Renderer + Platform Insert Logic → Final Page
Feed Extractor → Block JSON → Feed Cards → Homepage Feed
```

### Ownership Boundaries

| Layer | Owned By | Stored Where | Writer Controls? |
|-------|----------|-------------|-----------------|
| Block content | Writer via PostIQ | `sm_posts.content` (JSON) | Yes |
| Article-level fields | Writer + system | `sm_posts` columns | Partially |
| Automated editorial | Scout AI (DataLab) | `sm_posts` columns | No (preview/refresh in PostIQ) |
| Platform inserts | Frontend render logic | Not stored | No |

---

## 2. Block Types (17 Active + Legacy)

### Category: Content

Writer-authored editorial primitives.

#### 1. `paragraph`
- **Data:** `{ html: string }`
- **Renders:** `<p>` at 18px, line-height 1.7

#### 2. `heading`
- **Data:** `{ text: string; level: 2 | 3 | 4 }`
- **Renders:** H2 (24px), H3 (20px), H4 (18px)

#### 3. `image`
- **Data:** `{ src: string; alt: string; caption?: string }`
- **Renders:** Next/Image, aspect-video, rounded-xl, optional figcaption

#### 4. `video`
- **Data:** `{ url: string; caption?: string }`
- **Renders:** iframe embed, aspect-video

#### 5. `quote`
- **Data:** `{ text: string; speaker: string; team?: string }`
- **Renders:** Cyan left-bordered blockquote with speaker attribution

#### 6. `social-embed`
- **Data:** `{ url: string; platform: 'twitter' | 'youtube' | 'tiktok' | 'instagram' }`
- **Supported platforms:** Twitter/X, YouTube, TikTok, Instagram
- **Rendering strategy:**
  - Twitter: oEmbed API → rendered HTML card (SSR-safe with hydration)
  - YouTube: iframe with `loading="lazy"`, `srcdoc` placeholder until interaction
  - TikTok: oEmbed API → rendered card
  - Instagram: oEmbed API → rendered card
- **Fallback behavior:** If embed fails (blocked, rate-limited, deleted), render a styled link card with platform icon, URL, and "View on [Platform]" CTA. Never render a broken iframe or blank space.
- **SSR safety:** No platform SDK scripts at initial render. Load embed scripts client-side only, behind IntersectionObserver.
- **Security:** Sanitize all embed HTML. Only allow whitelisted iframe `src` domains. Strip `<script>` tags from oEmbed responses. CSP headers must allow embed domains.
- **Performance:** All embeds lazy-load via IntersectionObserver (threshold 0.1). Use `srcdoc` placeholders for YouTube. Estimated CLS impact: 0 (use fixed aspect-ratio containers). Do not let embeds block article LCP.

#### 7. `divider`
- **Data:** `{}` (empty)
- **Renders:** `<hr>` separator

---

### Category: Analysis

Data-driven intelligence blocks. Accent: **Cyan (`#00D4FF`)**.

#### 8. `scout-insight`
- **Data:** `{ insight: string; confidence: 'low' | 'medium' | 'high'; autoGenerate?: boolean }`
- **Default:** `confidence: 'high', autoGenerate: true`
- **Behavior:** When `autoGenerate: true`, Scout AI fills insight text on publish via DataLab. Manual text takes priority if provided.

#### 9. `stats-chart`
- **Data:**
```typescript
{
  title: string;
  chartType: 'bar' | 'line';
  color: string;
  dataPoints: { label: string; value: number }[];
}
```
- **Default:** `chartType: 'bar', color: '#00D4FF'`
- **Animation:** IntersectionObserver (threshold 0.3). Bar: width 0→100%. Line: stroke-dasharray draw + staggered dot fade-in.
- **Extensibility note:** The `chartType` field is intentionally typed as a string union for forward compatibility. Future chart types — `stacked`, `comparison`, `trendline`, `radar` — can be added by extending the union and adding renderer cases. The `dataPoints` schema supports these without structural changes. Do not restructure `dataPoints` into a format that only works for bar/line; keep it generic (`label + value` pairs, with future support for multi-series via an optional `series` wrapper).

#### 10. `player-comparison`
- **Data:**
```typescript
{
  playerA: { name: string; team: string; headshot: string };
  playerB: { name: string; team: string; headshot: string };
  stats: {
    label: string;
    playerA: number;
    playerB: number;
    higherWins?: boolean;  // false for INTs, sacks, turnovers, ERA
  }[];
}
```
- **Animation:** Stat bars animate from 0% on scroll. Winner = full opacity, loser = 30% opacity.

#### 11. `trade-scenario`
- **Data:** `{ teamA: string; teamB: string; teamAReceives: { type: 'player' | 'pick'; label: string }[]; teamBReceives: [...] }`
- **Accent:** Red

#### 12. `mock-draft`
- **Data:** `{ picks: { pickNumber: number; team: string; player: string; position: string; school: string }[] }`
- **Accent:** Gold (first pick highlighted)

#### 13. `sentiment-meter`
- **Data:** `{ mode: 'rumor' | 'heat' | 'confidence' | 'panic'; level: number }`
- **Default:** `mode: 'rumor', level: 2`
- **Accent:** Red (`#BC0000`)
- **Modes:**

| Mode | Label | Segments |
|------|-------|----------|
| `rumor` | Rumor Confidence | Low, Medium, Strong, Heating Up |
| `heat` | Heat Meter | Warm, Hot, Nuclear |
| `confidence` | Confidence | Low, Moderate, High, Lock |
| `panic` | Panic Meter | Calm, Uneasy, Alarmed, Full Panic |

#### 14. `hot-take`
- **Data:** `{ text: string }`
- **Accent:** Gold (`#D6B05E`)
- **Category: Analysis** (not Fan Interaction)
- **Rationale:** A hot take is an editorial assertion — a bold analytical claim made by the writer. It is not an interactive element that users engage with (no voting, no input). It belongs alongside scout-insight and other writer-driven analysis blocks, not alongside polls and debates which require user participation.

---

### Category: Fan Interaction

User engagement and participation blocks. Require user action (voting, choosing).

#### 15. `interaction`
- **Data:** `{ variant: 'poll' | 'gm-pulse'; question: string; options: string[]; reward: number }`
- **Default:** `variant: 'gm-pulse', options: ['YES','NO'], reward: 3`
- **Accent:** Cyan
- **Behavior:** User clicks option → button fills → "+X GM Score" floats 2s → vote locked

#### 16. `debate`
- **Data:** `{ proArgument: string; conArgument: string; reward: number }`
- **Default:** `reward: 3`
- **Accent:** Cyan (PRO) / Red (CON)

#### 17. `live-update`
- **Data:** `{ timestamp: string; text: string }`
- **Default:** Auto-populates timestamp with current Chicago time ("9:39 PM CT")
- **Accent:** Red
- **Renamed from:** `update` → `live-update`
- **Rationale:** "update" is too generic and collides with common programming terms. "live-update" clearly communicates the block's purpose: timestamped editorial additions for breaking news, live game developments, rumor changes, trade deadline updates, and evolving stories. It also distinguishes from system "updates" in code and UI.

---

### Category: Platform (System-Managed)

Auto-inserted by render logic. **NOT available in the block editor.** NOT stored in article block JSON.

| Module | Purpose | Insertion Logic |
|--------|---------|----------------|
| Reaction Stream | Fan reactions from debates, polls, fan chat | See Platform Insert Rules below |
| Trending Discussion | Community pulse on high-engagement stories | See Platform Insert Rules below |

---

### Legacy Blocks (Auto-Migration)

Old blocks in DB are auto-migrated when loaded:

| Old Type | New Type | Migration |
|----------|----------|-----------|
| `gm-interaction` | `interaction` (variant: `gm-pulse`) | Auto on load |
| `poll` | `interaction` (variant: `poll`) | Auto on load |
| `rumor-meter` | `sentiment-meter` (mode: `rumor`) | Strength→level mapping |
| `heat-meter` | `sentiment-meter` (mode: `heat`) | Level→number mapping |
| `reaction-stream` | Stripped from editor | Platform-managed |
| `update` | `live-update` | Direct rename, data unchanged |
| `hot-take` (in Fan Interaction category) | `hot-take` (in Analysis category) | Category change only, no data migration |

---

## 3. Block Inserter Categories

| Category | Blocks | Accent |
|----------|--------|--------|
| **Content** | Paragraph, Heading, Image, Video, Quote, Social Embed, Divider | Cyan |
| **Analysis** | Scout Insight, Stats Chart, Player Comparison, Trade Scenario, Mock Draft, Sentiment Meter, Hot Take | Cyan |
| **Fan Interaction** | Interaction (GM Pulse / Fan Poll), Debate, Live Update | Red |

---

## 4. Templates (7)

All templates use exact block type names. No friendly aliases in template definitions.

### 1. `standard-news` — Standard News
**Blocks:** `paragraph` → `paragraph` → `interaction` (gm-pulse) → `paragraph` → `scout-insight` → `paragraph` → `live-update` → `paragraph`
**Best for:** News stories, roster moves, press coverage

### 2. `stats-comparison` — Stats / Player Comparison
**Blocks:** `paragraph` → `player-comparison` → `paragraph` → `stats-chart` → `paragraph` → `stats-chart` → `interaction` (gm-pulse)
**Best for:** Player matchups, stat deep dives, draft evaluations

### 3. `rumor-trade` — Rumor / Trade Simulator
**Blocks:** `sentiment-meter` (rumor) → `paragraph` → `trade-scenario` → `paragraph` → `mock-draft` → `paragraph` → `interaction` (gm-pulse)
**Best for:** Trade rumors, FA speculation, mock drafts

### 4. `trending` — Trending Story
**Blocks:** `sentiment-meter` (heat) → `paragraph` → `hot-take` → `interaction` (poll) → `scout-insight`
**Best for:** Viral moments, trending debates, social reactions

### 5. `fan-debate` — Fan Debate
**Blocks:** `paragraph` → `debate` → `paragraph` → `scout-insight`
**Best for:** Pro/con analysis, should-they-trade debates

### 6. `game-recap` — Game Recap
**Blocks:** `paragraph` → `stats-chart` → `paragraph` → `quote` → `paragraph` → `scout-insight` → `interaction` (poll)
**Best for:** Post-game summaries, box score breakdowns, player of the game

### 7. `film-room` — Film Room
**Blocks:** `video` → `paragraph` → `stats-chart` → `player-comparison` → `scout-insight` → `interaction` (poll)
**Best for:** BFR (Bears Film Room), Pinwheels & Ivy, play breakdowns

---

## 5. Automated Editorial Layer (Not Blocks)

These are **NOT writer-authored content blocks**. They do not exist in the article `blocks[]` array. They are article-level features generated by the platform (Scout AI) and stored as columns on the article record.

### 5a. Key Takeaways

**What:** 3-bullet summary generated by Scout AI in DataLab.

**Lifecycle:**
1. Writer publishes/updates article in PostIQ
2. PostIQ computes `contentHash` from title + dek + extracted body text
3. If hash changed since last generation → status set to `stale`
4. DataLab Scout generates 3 takeaway bullets → stored on article record
5. Article renderer shows takeaways below headline/dek/meta, above body
6. If generation fails or status is not `ready` → section hidden entirely

**Status model:**

| Status | Meaning |
|--------|---------|
| `idle` | Never generated (new article) |
| `generating` | Scout is processing |
| `ready` | Valid takeaways available |
| `stale` | Article content changed meaningfully since last generation |
| `failed` | Generation failed — hidden from readers, logged |

**Rules:**
- Always exactly 3 bullets when present
- Not manually authored by writers
- Previewed and refreshable inside PostIQ (button, not auto)
- Not generated client-side
- Not regenerated on every page request — read from stored data
- Persisted on article record (`key_takeaways` column, JSON array of 3 strings)
- Hidden if `keyTakeawaysStatus !== 'ready'`

**"Meaningful change" definition:** Hash/version change to any of:
- `title`
- `dek`
- Extracted plain text from paragraph/heading blocks (concatenated, trimmed, lowercased, whitespace-normalized)

Changes to non-text blocks (charts, images, polls) do NOT trigger staleness.

### 5b. Scout Summary Metadata

**What:** Article-level AI summary used for feeds, search, recommendations, and internal intelligence.

- Generated by Scout in DataLab alongside key takeaways
- Stored as `scout_summary` on the article record (plain text, ~150 chars)
- **Not rendered in article body** by default
- Used by: feed card excerpts, search indexing, recommendation engine, internal analytics
- Follows same staleness rules as key takeaways

### 5c. Platform Insert Rules

These modules are auto-inserted by the article renderer at render time. They are **not stored in block JSON** and are **not controlled by writers**.

**Insert rules:**

| Module | Trigger | Placement |
|--------|---------|-----------|
| Reaction Stream | Article has ≥1 debate or interaction block | After the last content block, or after 6+ paragraphs (whichever comes first) |
| Trending Discussion | Article engagement exceeds threshold (TBD by feature flag) | Near article end, before reaction stream |
| Scout Follow-Up | Future: Scout-generated related questions | After key takeaways (optional, feature-flagged) |

**Ownership:** Frontend render logic, driven by:
- Article type / template
- Block composition (presence of debate/poll blocks)
- Engagement metrics (from analytics)
- Feature flags (for rollout control)

Writers see no evidence of these inserts in PostIQ. They appear only on the published article page.

---

## 6. Article-Level Fields (Outside Block JSON)

These fields live on the `sm_posts` record, NOT inside the `blocks[]` array. This separation is critical for PostIQ, DataLab, and frontend consistency.

### Writer-Controlled Fields

| Field | Type | Purpose |
|-------|------|---------|
| `title` | string | Article headline |
| `dek` | string | Sub-headline / summary line |
| `excerpt` | string | Short summary (manual or auto-generated) |
| `featured_image` | string (URL) | Hero image |
| `category_id` | FK | Article category |
| `tags` | string[] | Topic tags |
| `author_id` | FK | Author reference |
| `status` | enum | `draft`, `published`, `scheduled` |
| `scheduled_at` | timestamp | Scheduled publish time |
| `social_caption` | string | Social media post copy |
| `seo_title` | string | Meta title (50-60 chars) |
| `seo_description` | string | Meta description (150-160 chars) |
| `seo_keywords` | string | SEO keywords |

### System-Managed Fields

| Field | Type | Purpose |
|-------|------|---------|
| `published_at` | timestamp | Publish time (set on first publish) |
| `updated_at` | timestamp | Last modification |
| `social_posted_at` | timestamp | When shared to social |

### Automated Editorial Fields

| Field | Type | Purpose |
|-------|------|---------|
| `key_takeaways` | JSON (string[3]) | Scout-generated 3-bullet summary |
| `key_takeaways_status` | enum | `idle`, `generating`, `ready`, `stale`, `failed` |
| `scout_summary` | string | AI summary for feeds/search/recs (~150 chars) |
| `content_hash` | string | Hash of title+dek+body text for staleness detection |

### What Does NOT Belong Here

- Block content → inside `blocks[]` array
- Platform insert decisions → render logic, not stored
- Vote counts, reaction data → separate tables
- Live game context → fetched at render time

---

## 7. Block-to-Feed-Card Mapping

| Article Block | Feed Card Kind | Accent | Feed Label | Criteria |
|---------------|---------------|--------|------------|----------|
| (always) | `article` | Red | SM Edge | First card always generated. Uses `featured_image` + first 160 chars |
| `scout-insight` | `analytics` | Cyan | Scout Insight | `.data.insight` non-empty |
| `stats-chart` | `analytics` | Cyan | Analytics | `.data.dataPoints.length > 0` |
| `player-comparison` | `analytics` | Cyan | Player Comparison | playerA.name or playerB.name present |
| `mock-draft` | `analytics` | Gold | Mock Draft | `.data.picks.length > 0` |
| `debate` | `debate` | Red | Edge Debate | proArgument or conArgument present |
| `hot-take` | `debate` | Gold | Top Take | `.data.text` non-empty |
| `trade-scenario` | `rumor` | Red | Trade Scenario | teamA or teamB present |
| `sentiment-meter` | `rumor` | Red | Rumor Alert / Trending | Always (always has level) |
| `live-update` | `rumor` | Red | Breaking | `.data.text` non-empty |
| `interaction` | `poll` | Cyan | GM Pulse / Fan Poll | `.data.question` non-empty |

**Rules:** Max 4 feed cards per article (1 article card + up to 3 block cards, in document order).

---

## 8. Block Schema (TypeScript)

```typescript
// ─── Block Type Union ───
export type BlockType =
  // Content
  | 'paragraph' | 'heading' | 'image' | 'video' | 'quote' | 'social-embed' | 'divider'
  // Analysis
  | 'scout-insight' | 'stats-chart' | 'player-comparison' | 'trade-scenario'
  | 'mock-draft' | 'sentiment-meter' | 'hot-take'
  // Fan Interaction
  | 'interaction' | 'debate' | 'live-update'
  // Legacy (mapped at load time)
  | 'gm-interaction' | 'poll' | 'rumor-meter' | 'heat-meter' | 'update' | 'reaction-stream';

export type SocialPlatform = 'twitter' | 'youtube' | 'tiktok' | 'instagram';
export type SentimentMode = 'rumor' | 'heat' | 'confidence' | 'panic';
export type InteractionVariant = 'poll' | 'gm-pulse';
export type ChartType = 'bar' | 'line';
// Future: | 'stacked' | 'comparison' | 'trendline' | 'radar'

// ─── Article Document ───
export interface ArticleDocument {
  version: 1;
  template?: string;
  blocks: ContentBlock[];
}

// ─── Automated Editorial (article-level, NOT in blocks[]) ───
export type KeyTakeawaysStatus = 'idle' | 'generating' | 'ready' | 'stale' | 'failed';

export interface ArticleEditorialFields {
  key_takeaways: string[] | null;        // exactly 3 when present
  key_takeaways_status: KeyTakeawaysStatus;
  scout_summary: string | null;
  content_hash: string | null;
}

// ─── Validation ───
export function isValidBlock(block: unknown): block is ContentBlock {
  if (!block || typeof block !== 'object') return false;
  const b = block as Record<string, unknown>;
  return typeof b.id === 'string' && typeof b.type === 'string' && typeof b.data === 'object';
}

export function isValidDocument(doc: unknown): doc is ArticleDocument {
  if (!doc || typeof doc !== 'object') return false;
  const d = doc as Record<string, unknown>;
  return d.version === 1 && Array.isArray(d.blocks) && d.blocks.every(isValidBlock);
}
```

---

## 9. Migration & Legacy Compatibility

### Block Renames

| Old Name | New Name | Migration Strategy |
|----------|----------|--------------------|
| `update` | `live-update` | `migrateBlock()` renames type, data shape unchanged |
| `gm-interaction` | `interaction` (variant: gm-pulse) | Existing migration, no change |
| `poll` | `interaction` (variant: poll) | Existing migration, no change |
| `rumor-meter` | `sentiment-meter` (mode: rumor) | Existing migration, no change |
| `heat-meter` | `sentiment-meter` (mode: heat) | Existing migration, no change |
| `reaction-stream` | Stripped | Existing migration, no change |

### Category Moves

| Block | Old Category | New Category | Data Change |
|-------|-------------|-------------|-------------|
| `hot-take` | Fan Interaction | Analysis | None — category is UI-only |

### Migration Rules

1. **Never mutate stored JSON in-place.** Migration runs at load time in `migrateDocument()`. Original DB JSON is preserved.
2. **Legacy types stay in the `BlockType` union** as valid parse targets. They are mapped to new types by `migrateBlock()`.
3. **Renderers must handle both old and new names** for at least 6 months after rename. After that, a one-time DB migration script can normalize stored blocks.
4. **createBlock()` must only create new-name blocks.** Legacy names in `createBlock()` should redirect to new types.
5. **Feed extractor must handle both `update` and `live-update`** during transition.

### `update` → `live-update` Migration Addition

Add to `migrateBlock()`:
```typescript
case 'update':
  return { ...block, type: 'live-update', data: block.data } as LiveUpdateBlock;
```

---

## 10. Production Optimization Notes

### A. Rendering Performance
- Article page rendering is **presentation-driven** — all data prepared server-side or at save time
- Block renderer is a pure map over `blocks[]` → React components. No fetches, no side effects.
- Key takeaways rendered from stored data, no Scout calls at render time
- Platform inserts use fixed-height containers to prevent CLS (Content Layout Shift)
- Chart animations use IntersectionObserver — zero cost when off-screen

### B. Caching
- Key takeaways: stored on article record, read once per page load, cached by CDN/ISR
- Scout summary: persisted at article level, never computed client-side
- Feed cards: extracted at publish/update time and cached, not computed per homepage request
- Social embeds: oEmbed responses cached server-side (1-hour TTL minimum)

### C. Lazy Loading
- Social embeds: IntersectionObserver (threshold 0.1), load platform scripts only when visible
- YouTube embeds: `srcdoc` placeholder with thumbnail until user clicks
- Images: Next/Image handles lazy loading automatically
- Charts: Animate on intersection, not on mount
- Below-fold blocks: Consider `loading="lazy"` on iframes

### D. Validation
- **Block-level:** `isValidBlock()` checks structure before rendering. Invalid blocks render nothing (no crash).
- **Document-level:** `isValidDocument()` validates before editor loads. If invalid, show error state, do not corrupt data.
- **Article fields:** Key takeaways must be exactly 3 strings or null. Status must be a valid enum value. Invalid → treat as `failed`.
- **Fallbacks:** Every block renderer has an empty/error state. Missing data → skip block silently in article view, show placeholder in editor.

### E. Backward Compatibility
- Legacy block types in `BlockType` union preserved indefinitely for parsing
- `migrateBlock()` and `migrateDocument()` run on every editor load — no manual migration needed
- New renderers check for both old and new block type names
- Articles saved before V3 continue to render correctly without re-saving
- DB migration script (optional, run after 6 months): normalizes all stored blocks to new names

### F. Observability

| Event | Log Target | Severity |
|-------|-----------|----------|
| Key takeaway generation failure | `scout_errors` table | Error |
| Key takeaway staleness triggered | Application logs | Info |
| Invalid block payload in saved article | Application logs | Warning |
| Social embed render failure | Application logs | Warning |
| Legacy block migration triggered | Application logs | Debug |
| Block validation failure at save time | Application logs + PostIQ UI | Warning |
| Feed extraction produced 0 cards | Application logs | Warning |

Use existing `scoutErrorLogger.ts` for Scout-related failures. For block/embed failures, log to application monitoring (Vercel logs or equivalent).

### G. Author/Editor UX (PostIQ)
- Block inserter shows human-readable labels (e.g., "Live Update" not `live-update`)
- Block categories are visually separated with clear icons
- Template selector shows preview of what blocks are included
- Key Takeaways section: simple "Generate" / "Refresh" button, status badge, read-only preview
- Scout Insight blocks: "Auto-generate" checkbox is default ON — writers opt out, not in
- Sentiment Meter: visual clickable gauge, not a number input
- Invalid blocks in editor show inline warning with "fix or remove" guidance
- Do not expose `contentHash`, migration internals, or technical status enums to writers

---

## 11. DataLab Instructions

### Key Takeaways API

DataLab needs to expose (or update) an endpoint for generating key takeaways:

```
POST /api/scout/takeaways
Body: {
  articleId: string,
  title: string,
  dek: string,
  bodyText: string    // extracted plain text from paragraph + heading blocks
}
Response: {
  takeaways: [string, string, string],
  summary: string,    // ~150 char summary for scout_summary field
  contentHash: string  // hash of title+dek+bodyText for staleness detection
}
```

**Requirements:**
- Use existing Scout/Perplexity pipeline (sonar-pro)
- Takeaways must be exactly 3 bullets, each ≤ 100 chars, no markdown
- Summary must be ≤ 160 chars, plain text, suitable for meta descriptions
- Cache results by `contentHash` — identical content → return cached takeaways
- Log failures to `scout_errors` with type `takeaway_generation`
- Rate limit: 10/min per article (prevent spam-refresh)
- Timeout: 15s max, return error status if exceeded

### Article Record Schema Updates

Add these columns to `sm_posts` (if not already present):

```sql
ALTER TABLE sm_posts ADD COLUMN IF NOT EXISTS key_takeaways JSONB DEFAULT NULL;
ALTER TABLE sm_posts ADD COLUMN IF NOT EXISTS key_takeaways_status TEXT DEFAULT 'idle'
  CHECK (key_takeaways_status IN ('idle', 'generating', 'ready', 'stale', 'failed'));
ALTER TABLE sm_posts ADD COLUMN IF NOT EXISTS scout_summary TEXT DEFAULT NULL;
ALTER TABLE sm_posts ADD COLUMN IF NOT EXISTS content_hash TEXT DEFAULT NULL;
ALTER TABLE sm_posts ADD COLUMN IF NOT EXISTS dek TEXT DEFAULT NULL;
```

---

## 12. Implementation Checklist (Tonight)

### Phase 1: Type System & Migration (Do First)

- [ ] **types.ts:** Add `'live-update'` to `BlockType` union
- [ ] **types.ts:** Add `'update'` to legacy migration in `migrateBlock()`
- [ ] **types.ts:** Create `LiveUpdateBlock` interface (same shape as old `UpdateBlockType`)
- [ ] **types.ts:** Add `LiveUpdateBlock` to `ContentBlock` union
- [ ] **types.ts:** Move `hot-take` from Fan Interaction to Analysis in `BLOCK_CATEGORIES`
- [ ] **types.ts:** Rename `update` → `live-update` in `BLOCK_CATEGORIES` (label: "Live Update", description: "Timestamped update for breaking/evolving stories")
- [ ] **types.ts:** Update `createBlock()` — `'live-update'` creates new block, `'update'` redirects to `'live-update'`
- [ ] **types.ts:** Add `KeyTakeawaysStatus` type, `ArticleEditorialFields` interface
- [ ] **types.ts:** Add `isValidBlock()` and `isValidDocument()` validation functions

### Phase 2: Editor Updates

- [ ] **BlockEditorPanels.tsx:** Rename `UpdatePanel` references to handle `live-update` type
- [ ] **BlockPreviewRenderer.tsx:** Add `'live-update'` case (same renderer as old `update`)
- [ ] **TemplatePresets.tsx:** Replace `createBlock('update')` → `createBlock('live-update')` in standard-news template
- [ ] **TemplatePresets.tsx:** Fix all `blockList` descriptions to use schema names (e.g., "Interaction (gm-pulse)" not "GM Pulse")

### Phase 3: Feed Extractor

- [ ] **article-feed-extractor.ts:** Handle both `update` and `live-update` types → `rumor` feed card
- [ ] **article-feed-extractor.ts:** Verify `hot-take` still maps to `debate` feed card (no change needed)

### Phase 4: Article Renderer

- [ ] **ArticleBlockContent.tsx:** Add `'live-update'` case alongside existing `'update'` case
- [ ] **ArticleBlockContent.tsx:** Add Key Takeaways rendering section (below headline area, above blocks)
- [ ] Key Takeaways component: renders 3 bullets, hidden if status !== 'ready'

### Phase 5: PostIQ Integration

- [ ] Add "Key Takeaways" panel to PostIQ editor sidebar
- [ ] "Generate" button → calls DataLab `/api/scout/takeaways` → saves to article record
- [ ] Display status badge (idle/generating/ready/stale/failed)
- [ ] Auto-detect staleness on content changes (compare `contentHash`)

### Phase 6: DataLab

- [ ] Create/update `/api/scout/takeaways` endpoint
- [ ] Add `key_takeaways`, `key_takeaways_status`, `scout_summary`, `content_hash`, `dek` columns to `sm_posts`
- [ ] Log takeaway failures to `scout_errors`

### Phase 7: Spec & Doc Sync

- [ ] Update `docs/Article_Blocks_Templates.md` (this file — done)
- [ ] Update `docs/posts/Block_Editor.md` user guide with new naming
- [ ] Update CLAUDE.md block references if needed

---

## 13. Naming Decisions Made

| Decision | Choice | Reason |
|----------|--------|--------|
| `update` rename | `live-update` | "update" is too generic, collides with CRUD terminology. "live-update" clearly implies timestamped, evolving editorial additions. Preferred over "story-update" because it covers game developments and breaking news, not just story evolution. |
| `hot-take` category | Analysis | Hot takes are writer assertions, not user interactions. No voting, no user input. Same editorial nature as scout-insight. Keeping it in Fan Interaction confused the distinction between "writer says something bold" and "user does something." |
| Key takeaways storage | Article-level column, not a block | Takeaways are generated by AI, not authored by writers. They have their own lifecycle (stale/regenerate). Putting them in blocks[] would make them editable/deletable/reorderable by writers, which breaks the intent. |
| Reaction stream | Platform insert, not block | Writers should not control system-generated community content. Insertion is algorithmic, based on article composition and engagement. |
| Template naming | Exact block type names | "GM Pulse" and "Fan Poll" are UI labels, not schema names. Templates should reference `interaction` (variant: gm-pulse) so code changes propagate correctly. |
| Chart extensibility | Keep `chartType` as string union, note future types | Adding `stacked`/`radar`/etc. later is a union extension + renderer addition. No schema restructuring needed. |
| Social embed approach | oEmbed + fallback link card | Full SDK embeds are heavy and SSR-hostile. oEmbed gives us rendered HTML without client SDKs. Fallback link card prevents blank spaces when embeds fail. |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/admin/BlockEditor/types.ts` | Block types, createBlock(), migrateBlock(), BLOCK_CATEGORIES |
| `src/components/admin/BlockEditor/BlockEditor.tsx` | Main editor (edit/preview, undo/redo) |
| `src/components/admin/BlockEditor/BlockEditorPanels.tsx` | Edit panel UI per block type |
| `src/components/admin/BlockEditor/BlockInserter.tsx` | "Add Block" dropdown |
| `src/components/admin/BlockEditor/TemplatePresets.tsx` | 7 template definitions |
| `src/components/admin/BlockEditor/BlockPreviewRenderer.tsx` | Block → React component mapping |
| `src/components/articles/ArticleBlockContent.tsx` | Public article page renderer |
| `src/components/articles/PreviewPrimitives.tsx` | Shared rendering primitives |
| `src/lib/article-feed-extractor.ts` | Block → Feed card extraction |
| `src/lib/scoutErrorLogger.ts` | Error logging to scout_errors |
