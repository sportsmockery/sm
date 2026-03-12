# Article Blocks & Templates — Complete Breakdown

> **Last Updated:** March 11, 2026 (V2 — unified block system)
> **Purpose:** Detailed reference for every block type and template in the SM Edge block editor.

---

## How It Works

Articles are built from **blocks** — reusable content primitives stored as JSON. The flow:

```
Writer → Block Editor → Article JSON (sm_posts.content) → BlockPreviewRenderer → Article Page
                                                        → Feed Extractor → Feed Cards → Homepage
```

### Block Classification (V2)

Blocks are separated into three categories by who controls them:

| Category | Purpose | Writer Controls? |
|----------|---------|-----------------|
| **Content** | Editorial text, media, quotes | Yes |
| **Analysis** | Data, intelligence, roster analysis | Yes |
| **Fan Interaction** | User engagement and participation | Yes |
| **Platform** | System-generated (reactions, trending) | No — auto-inserted |

### Stored Document Format

```json
{
  "version": 1,
  "template": "standard-news",
  "blocks": [
    { "id": "uuid", "type": "paragraph", "data": { "html": "..." } },
    { "id": "uuid", "type": "interaction", "data": { "variant": "gm-pulse", "question": "...", "options": ["YES","NO"], "reward": 3 } }
  ]
}
```

### Legacy Migration

Old blocks stored in the DB are auto-migrated when loaded into the editor:

| Old Type | New Type | Migration |
|----------|----------|-----------|
| `gm-interaction` | `interaction` (variant: `gm-pulse`) | Auto |
| `poll` | `interaction` (variant: `poll`) | Auto |
| `rumor-meter` | `sentiment-meter` (mode: `rumor`) | Auto |
| `heat-meter` | `sentiment-meter` (mode: `heat`) | Auto |
| `reaction-stream` | Stripped from editor | Auto (platform-managed) |

Legacy blocks still render in the preview for backwards compat.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/components/admin/BlockEditor/types.ts` | Block types, `createBlock()`, `migrateBlock()`, `SENTIMENT_CONFIGS` |
| `src/components/admin/BlockEditor/BlockEditor.tsx` | Main editor (edit/preview, undo/redo, migration on load) |
| `src/components/admin/BlockEditor/BlockEditorPanels.tsx` | Edit panel UI for each block type |
| `src/components/admin/BlockEditor/BlockInserter.tsx` | "Add Block" dropdown with search |
| `src/components/admin/BlockEditor/TemplatePresets.tsx` | 7 template definitions + preview content |
| `src/components/admin/BlockEditor/BlockPreviewRenderer.tsx` | Maps blocks → rendered preview components |
| `src/components/articles/ArticleBlockContent.tsx` | Public article page renderer |
| `src/components/articles/PreviewPrimitives.tsx` | Shared rendering primitives |
| `src/components/articles/PlayerComparison.tsx` | Player comparison with `higherWins` support |
| `src/components/articles/StatsChart.tsx` | Animated charts (IntersectionObserver) |

---

## All Block Types

### Category: Content

#### 1. Paragraph (`paragraph`)
- **Data:** `{ html: string }`
- **Default:** `html: ''`
- **Editor:** TextArea, 4 rows
- **Renders:** `<p>` at 18px, line-height 1.7

#### 2. Heading (`heading`)
- **Data:** `{ text: string; level: 2 | 3 | 4 }`
- **Default:** `text: '', level: 2`
- **Editor:** Text input + H2/H3/H4 selector
- **Renders:** H2 (24px), H3 (20px), H4 (18px)

#### 3. Image (`image`)
- **Data:** `{ src: string; alt: string; caption?: string }`
- **Default:** `src: '', alt: ''`
- **Editor:** URL + Alt + Caption, shows preview
- **Renders:** Next/Image, aspect-video, rounded-xl, optional figcaption

#### 4. Video (`video`)
- **Data:** `{ url: string; caption?: string }`
- **Default:** `url: ''`
- **Editor:** URL + Caption
- **Renders:** iframe, aspect-video

#### 5. Quote (`quote`) — NEW
- **Data:** `{ text: string; speaker: string; team?: string }`
- **Default:** all empty
- **Editor:** Quote text (3 rows) + Speaker + Team (optional)
- **Renders:** Cyan left-bordered blockquote with speaker attribution
- **Use for:** Player/coach quotes, press conference pulls

#### 6. Social Embed (`social-embed`) — NEW
- **Data:** `{ url: string; platform: 'twitter' | 'youtube' | 'tiktok' | 'instagram' }`
- **Default:** `url: '', platform: 'twitter'`
- **Editor:** URL input + Platform toggle chips (Twitter/X, YouTube, TikTok, Instagram)
- **Renders:** Platform-branded embed card with URL preview

#### 7. Divider (`divider`)
- **Data:** `{}` (empty)
- **Editor:** No controls
- **Renders:** `<hr>` separator

---

### Category: Analysis

#### 8. Scout Insight (`scout-insight`)
- **Data:** `{ insight: string; confidence: 'low' | 'medium' | 'high'; autoGenerate?: boolean }`
- **Default:** `confidence: 'high', autoGenerate: true`
- **Accent:** Cyan (`#00D4FF`)
- **Behavior:** When `autoGenerate: true`, Scout AI fills on publish. Otherwise manual text.

#### 9. Stats Chart (`stats-chart`)
- **Data:** `{ title: string; chartType: 'bar' | 'line'; color: string; dataPoints: [{ label, value }] }`
- **Default:** `chartType: 'bar', color: '#00D4FF'`
- **Accent:** Cyan
- **Animation:** Charts start blank and animate in when scrolled into view (IntersectionObserver, threshold 0.3). Bar charts grow from 0% width. Line charts draw with stroke-dasharray animation. Data point dots fade in sequentially with staggered delays.

#### 10. Player Comparison (`player-comparison`)
- **Data:**
```typescript
{
  playerA: { name, team, headshot },
  playerB: { name, team, headshot },
  stats: [{
    label: "Passing Yards",
    playerA: 3800,
    playerB: 3100,
    higherWins: true  // false for INTs, sacks, turnovers
  }]
}
```
- **`higherWins` (new):** Controls which player's bar is highlighted as the "winner." Defaults to `true` (higher = better). Set to `false` for stats where lower is better (interceptions, sacks allowed, turnovers, ERA, etc.).
- **Editor:** Hi/Lo toggle per stat row with tooltip
- **Animation:** Stat bars animate from 0% width on scroll into view. Winner gets full-opacity color, loser gets 30% opacity.

#### 11. Trade Scenario (`trade-scenario`)
- **Data:** `{ teamA, teamB, teamAReceives: [{ type: 'player'|'pick', label }], teamBReceives: [...] }`
- **Accent:** Red

#### 12. Mock Draft (`mock-draft`)
- **Data:** `{ picks: [{ pickNumber, team, player, position, school }] }`
- **Accent:** Gold for first pick

#### 13. Sentiment Meter (`sentiment-meter`) — NEW (replaces `rumor-meter` + `heat-meter`)
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

- **Editor:** Mode toggle chips + clickable segment gauge to set level
- **Renders:** Horizontal gauge with red-filled segments up to the selected level

---

### Category: Fan Interaction

#### 14. Interaction (`interaction`) — NEW (replaces `gm-interaction` + `poll`)
- **Data:** `{ variant: 'poll' | 'gm-pulse'; question: string; options: string[]; reward: number }`
- **Default:** `variant: 'gm-pulse', options: ['YES','NO'], reward: 3`
- **Accent:** Cyan
- **Editor:** Variant toggle (GM Pulse / Fan Poll) + Question + Options + Reward slider
- **Behavior:** User clicks option → button fills → "+X GM Score" floats for 2s → vote locked

#### 15. Debate (`debate`)
- **Data:** `{ proArgument: string; conArgument: string; reward: number }`
- **Default:** `reward: 3`
- **Accent:** Cyan (PRO) / Red (CON)

#### 16. Hot Take (`hot-take`)
- **Data:** `{ text: string }`
- **Accent:** Gold (`#D6B05E`)

#### 17. Breaking Update (`update`)
- **Data:** `{ timestamp: string; text: string }`
- **Default:** Auto-populates timestamp with current Chicago time (e.g. "9:39 PM CT")
- **Accent:** Red

---

### Category: Platform (System-Managed)

These blocks are NOT available in the editor. They are auto-inserted by the platform at render time.

| Block | Purpose |
|-------|---------|
| Reaction Stream | Fan reactions from debates, polls, fan chat |
| Trending Discussion | Auto-populated community pulse |

---

## Templates (7)

### 1. Standard News
- **Blocks:** Paragraph → Paragraph → GM Pulse → Paragraph → Scout Insight → Paragraph → Update → Paragraph
- **Best for:** News stories, roster moves, game recaps, press coverage

### 2. Stats / Player Comparison
- **Blocks:** Paragraph → Player Comparison → Paragraph → Chart → Paragraph → Chart → GM Pulse
- **Best for:** Player matchups, stat deep dives, draft evaluations

### 3. Rumor / Trade Simulator
- **Blocks:** Sentiment Meter (rumor) → Paragraph → Trade Scenario → Paragraph → Mock Draft → Paragraph → GM Pulse
- **Best for:** Trade rumors, FA speculation, mock drafts

### 4. Trending
- **Blocks:** Sentiment Meter (heat) → Paragraph → Hot Take → Fan Poll → Scout Insight
- **Best for:** Viral moments, trending debates, social reactions

### 5. Fan Debate
- **Blocks:** Paragraph → Debate → Paragraph → Scout Insight
- **Best for:** Pro/con analysis, should-they-trade debates

### 6. Game Recap — NEW
- **Blocks:** Paragraph → Stats Chart → Paragraph → Quote → Paragraph → Scout Insight → Fan Poll
- **Best for:** Post-game summaries, box score breakdowns, player of the game

### 7. Film Room — NEW
- **Blocks:** Video → Paragraph → Stats Chart → Player Comparison → Scout Insight → Fan Poll
- **Best for:** BFR (Bears Film Room), Pinwheels & Ivy, play breakdowns, film analysis

---

## Block Inserter Categories

| Category | Blocks | Accent |
|----------|--------|--------|
| **Content** | Paragraph, Heading, Image, Video, Quote, Social Embed, Divider | Cyan |
| **Analysis** | Scout Insight, Chart, Player Comparison, Trade Scenario, Mock Draft, Sentiment Meter | Cyan |
| **Fan Interaction** | Fan Poll / GM Pulse, Debate, Hot Take, Breaking Update | Red |

---

## Architecture Decisions

### Why `interaction` replaces `gm-interaction` + `poll`
Both had identical schemas: `{ question, options[], reward }`. The only difference was the label. Now a single `interaction` block with `variant: 'poll' | 'gm-pulse'` handles both, reducing code duplication and writer confusion.

### Why `sentiment-meter` replaces `rumor-meter` + `heat-meter`
Same UI pattern (segmented gauge) with different labels. Now one component with `mode` config handles rumor, heat, confidence, and panic — extensible without new block types.

### Why `reaction-stream` moved to platform layer
Writers shouldn't control platform-generated content. Reaction streams should auto-appear based on article engagement, not manual writer toggles. This prevents the "forgot to enable it" problem.

### Why `higherWins` on player stats
Stats like interceptions, sacks allowed, turnovers, and ERA are "lower is better." Without `higherWins: false`, the comparison bars would highlight the wrong player as the winner. The editor shows a Hi/Lo toggle per stat row.

### Why charts animate on scroll
Charts that start blank and populate when visible create a "reveal" moment that makes data feel more impactful. Uses IntersectionObserver (threshold 0.3) — no performance impact when off-screen.
