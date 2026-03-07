# EDGE v2 — Cursor Build Instructions

> **Goal:** Build `/edge2` as an evolution of `/edge`. Transform from click-and-wait into a proactive, infinite-scroll Chicago fan home base with streaming AI, live pulse data, and zero-friction consumption.
>
> **Reference:** The existing `/edge` page is at `src/app/edge/page.tsx`. Study it for brand tokens, Scout API patterns, and component style. Do NOT modify it — build v2 alongside it.

---

## Critical Project Context

### Tech Stack
- **Next.js 16+ App Router** (NOT Pages Router)
- **Tailwind CSS** with CSS custom properties (tokens defined in `src/app/globals.css`)
- **Framer Motion** (already installed as `framer-motion@^12.35.0`)
- **Supabase** for auth and data
- **Vercel** for deployment

### What NOT to install
- Do NOT install shadcn/ui — this project does not use it. Build UI with Tailwind + inline styles.
- Do NOT install `@ai-sdk/openai` or `@ai-sdk/anthropic` — we use our own Scout AI backend, not direct OpenAI/Anthropic calls.
- Do NOT install Pusher — use polling or Supabase Realtime (already configured).
- Do NOT install `ai` (Vercel AI SDK) — we don't use `useChat` or `streamText` from it.

### Data Architecture (IMPORTANT — read this first)

EDGE v2 uses **two data layers**:

**Layer 1: Pre-computed feed + pulse data (Supabase reads — FAST)**
The feed and pulse strip read from DataLab Supabase tables that are updated by cron jobs every 15-30 minutes. This means page load is a single Supabase query (~200ms), NOT multiple AI calls.

```typescript
import { datalabClient } from '@/lib/supabase-datalab'
// datalabClient is the public read-only Supabase client for DataLab
// Already exists at: src/lib/supabase-datalab.ts
```

**Tables (in DataLab Supabase):**

`edge_feed` — Pre-generated AI feed cards:
| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | PK |
| `feed_type` | text | `'recap'`, `'pulse'`, `'rumors'`, `'headlines'`, `'team_spotlight'` |
| `title` | text | Card title (e.g. "Morning Bears EDGE") |
| `content` | text | AI-generated text |
| `team_key` | text | nullable — `'bears'`, `'bulls'`, etc. or null for multi-team |
| `accent_color` | text | `'cyan'` or `'red'` |
| `sort_order` | int | Display priority |
| `time_slot` | text | `'morning'`, `'afternoon'`, `'evening'` |
| `created_at` | timestamptz | When generated |
| `expires_at` | timestamptz | When stale (cron replaces before this) |

`edge_pulse` — Live-ish team metrics:
| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | PK |
| `team_key` | text | `'bears'`, `'bulls'`, `'blackhawks'`, `'cubs'`, `'whitesox'` |
| `label` | text | "Anxiety Level", "Playoff Odds", etc. |
| `value` | text | "87%", "-3.2", "+450" |
| `trend` | text | `'up'`, `'down'`, `'flat'` |
| `accent_color` | text | `'cyan'` or `'red'` |
| `sort_order` | int | |
| `updated_at` | timestamptz | |

**Layer 2: Live user queries (Scout AI — on-demand)**
When a user types a question in the mini prompt bar, that goes through `/api/edge/stream` to Scout AI. This is the ONLY time an AI call happens per user interaction.

### Supabase Client Usage
```typescript
// For reading edge_feed and edge_pulse (public, no auth needed):
import { datalabClient } from '@/lib/supabase-datalab'

// Example: fetch current feed
const { data } = await datalabClient
  .from('edge_feed')
  .select('*')
  .eq('time_slot', getCurrentTimeSlot())  // 'morning' | 'afternoon' | 'evening'
  .order('sort_order')
  .limit(10)

// Example: fetch pulse strip
const { data } = await datalabClient
  .from('edge_pulse')
  .select('*')
  .order('sort_order')
```

### Scout AI (for user queries only)
Only used when user submits a question via the mini prompt bar. NEVER on page load.

**Existing endpoint:** `POST /api/edge/scout`
```typescript
// Request: { prompt: string }
// Response: { answer: string, source?: string, sessionId?: string }
```

**Streaming endpoint:** Create `/api/edge/stream` for typewriter effect on user queries:
```typescript
import { NextRequest } from 'next/server'

const DATALAB_API_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

export async function POST(request: NextRequest) {
  const { prompt } = await request.json()

  const response = await fetch(`${DATALAB_API_URL}/api/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Source': 'sportsmockery.com',
    },
    body: JSON.stringify({ query: prompt }),
  })

  if (!response.ok) {
    return new Response('Scout unavailable', { status: 502 })
  }

  const data = await response.json()
  const text = data.response || 'No response from Scout.'

  // Simulate streaming with ReadableStream (typewriter effect)
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < text.length; i++) {
        controller.enqueue(encoder.encode(text[i]))
        await new Promise(r => setTimeout(r, 12))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

### Brand Tokens (already defined in globals.css — USE THESE)
```css
--sm-red: #bc0000;
--sm-dark: #050508;
--sm-surface: #0c0c12;
--sm-card: #13131d;
--sm-card-hover: #1a1a28;
--sm-border: rgba(255, 255, 255, 0.06);
--sm-text: #ffffff;
--sm-text-muted: #8a8a9a;
--sm-text-dim: #55556a;
--sm-gradient: linear-gradient(135deg, #bc0000, #ff4444);
--sm-radius-sm: 10px;
--sm-radius-md: 16px;
--sm-radius-lg: 20px;
--sm-radius-pill: 100px;
--sm-nav-height: 72px;
--sm-nav-bg: rgba(5, 5, 8, 0.7);
--bears-primary: #0B162A;
--bulls-primary: #CE1141;
--cubs-primary: #0E3386;
--blackhawks-primary: #CF0A2C;
--whitesox-primary: #27251F;
```

### NEW accent color for EDGE v2
```css
/* Add to the EDGE v2 page via inline styles or a scoped style block */
--edge-cyan: #00D4FF;
--edge-cyan-glow: rgba(0, 212, 255, 0.15);
--edge-cyan-border: rgba(0, 212, 255, 0.3);
```

Use `#00D4FF` (cyan) for highlights, Scout AI responses, and interactive hover states. Use `#BC0000` (red) for Bears energy, urgency badges, and fire accents. The interplay of cyan + red on dark = the EDGE identity.

### Button Color Rule (CRITICAL)
**Always use inline `style={{}}` for button colors** (backgroundColor, color, border, outline, SVG stroke). Tailwind color classes get overridden by the global theme. Example:
```tsx
<button style={{ backgroundColor: '#bc0000', color: '#ffffff' }}>Click</button>
```

---

## File Structure

Create these files:

```
src/app/edge2/page.tsx                    ← Main page (client component)
src/app/api/edge/feed/route.ts            ← GET: reads edge_feed from Supabase
src/app/api/edge/pulse/route.ts           ← GET: reads edge_pulse from Supabase
src/app/api/edge/stream/route.ts          ← POST: streaming Scout for user queries
src/components/edge2/
  PulseStrip.tsx                          ← Auto-loaded live metrics bar
  FeedCard.tsx                            ← Reusable feed card (Scout take, rumor, pulse)
  MiniPromptBar.tsx                       ← Fixed bottom input bar
  EdgeFeed.tsx                            ← Infinite scroll feed container
  StreamingText.tsx                       ← Typewriter text display component
```

---

## API Routes

### GET `/api/edge/feed` — Pre-computed feed cards
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { datalabClient } from '@/lib/supabase-datalab'

function getCurrentTimeSlot(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

export async function GET(request: NextRequest) {
  const timeSlot = request.nextUrl.searchParams.get('slot') || getCurrentTimeSlot()

  const { data, error } = await datalabClient
    .from('edge_feed')
    .select('id, feed_type, title, content, team_key, accent_color, sort_order, time_slot, created_at')
    .eq('time_slot', timeSlot)
    .gte('expires_at', new Date().toISOString())
    .order('sort_order')
    .limit(10)

  if (error) {
    return NextResponse.json({ items: [], error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    items: data || [],
    timeSlot,
    fetchedAt: new Date().toISOString(),
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
    },
  })
}
```

### GET `/api/edge/pulse` — Team pulse metrics
```typescript
import { NextResponse } from 'next/server'
import { datalabClient } from '@/lib/supabase-datalab'

export async function GET() {
  const { data, error } = await datalabClient
    .from('edge_pulse')
    .select('id, team_key, label, value, trend, accent_color, sort_order, updated_at')
    .order('sort_order')

  if (error) {
    return NextResponse.json({ items: [], error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    items: data || [],
    fetchedAt: new Date().toISOString(),
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
    },
  })
}
```

### POST `/api/edge/stream` — Streaming Scout (user queries only)
See the code in the "Scout AI" section above. This is the ONLY endpoint that calls DataLab's AI.

---

## Page Layout (top to bottom)

```
┌─────────────────────────────────────────────┐
│ (Global site Header renders here via layout)│ DO NOT render a second header
├─────────────────────────────────────────────┤
│ PULSE STRIP: 4-5 horizontal cards           │ fetched from /api/edge/pulse
│ (Anxiety Meter, Playoff Odds, Net Rating..) │ cyan/red accents
├─────────────────────────────────────────────┤
│ HERO HEADLINE                               │ time-of-day tagline, big text
│ "Morning EDGE: What you missed..."          │
├─────────────────────────────────────────────┤
│ FEED (infinite scroll)                      │
│ ┌─────────────────────────────────────────┐ │
│ │ Card: Morning Bears EDGE                │ │ from edge_feed table
│ │ "Caleb looked sharp in OTAs but the..." │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Card: Chicago Pulse                     │ │
│ │ "Bulls copium levels at season high..." │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ Card: Trade Buzz                        │ │
│ │ "Rumor mill quiet but keep eyes on..."  │ │
│ └─────────────────────────────────────────┘ │
│         ▼ Load more (infinite scroll)       │
├─────────────────────────────────────────────┤
│ MINI PROMPT BAR (fixed bottom)              │ glass morphism, always visible
│ "Ask EDGE anything..."           [✶ Submit] │ THIS calls Scout AI on submit
└─────────────────────────────────────────────┘
```

**IMPORTANT: Do NOT render a custom header.** The root layout (`src/app/layout.tsx`) already renders a global `<Header>`. Adding a second one creates a double-header. The EDGE v2 page content starts directly after the global header.

Background: Fixed Chicago-themed dark gradient with faint skyline SVG silhouette (same as `/edge` page's `EdgeSkyline` component but full-width, very low opacity ~4%).

---

## Component Specifications

### 1. `page.tsx` — Main Page

```tsx
'use client';
```

**On mount behavior (the key differentiator from /edge):**
- Immediately show skeleton cards (3-5) while loading
- Fetch from `/api/edge/feed` (single Supabase read, ~200ms) and `/api/edge/pulse` in parallel
- As data arrives, replace skeletons with FeedCards (animated fade-in)
- Time-of-day tagline using `getEdgeTagline()` logic (copy from `/edge`)
- NO AI calls on page load — everything comes from pre-computed Supabase tables

**Background styling:**
```tsx
style={{
  background: 'radial-gradient(ellipse at top, rgba(0,212,255,0.06), transparent 50%), radial-gradient(circle at bottom, rgba(188,0,0,0.12), transparent 55%), #050508',
}}
```

**Page-level state:**
```typescript
const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
const [pulseItems, setPulseItems] = useState<PulseItem[]>([]);
const [loadingFeed, setLoadingFeed] = useState(true);
const [loadingPulse, setLoadingPulse] = useState(true);
```

**Types:**
```typescript
type FeedItem = {
  id: number;
  feed_type: string;        // 'recap' | 'pulse' | 'rumors' | 'headlines' | 'team_spotlight'
  title: string;
  content: string;
  team_key: string | null;
  accent_color: string;     // 'cyan' | 'red'
  sort_order: number;
  time_slot: string;
  created_at: string;
  // Client-side additions for user queries:
  isStreaming?: boolean;
  isUserQuery?: boolean;
};

type PulseItem = {
  id: number;
  team_key: string;
  label: string;
  value: string;
  trend: string;            // 'up' | 'down' | 'flat'
  accent_color: string;     // 'cyan' | 'red'
  sort_order: number;
  updated_at: string;
};
```

**Data fetching (on mount):**
```typescript
useEffect(() => {
  async function loadEdge() {
    const [feedRes, pulseRes] = await Promise.all([
      fetch('/api/edge/feed'),
      fetch('/api/edge/pulse'),
    ]);

    if (feedRes.ok) {
      const { items } = await feedRes.json();
      setFeedItems(items);
    }
    setLoadingFeed(false);

    if (pulseRes.ok) {
      const { items } = await pulseRes.json();
      setPulseItems(items);
    }
    setLoadingPulse(false);
  }
  loadEdge();
}, []);
```

**Fallback:** If `edge_feed` returns 0 rows (tables not populated yet), show a single card that says "EDGE is warming up. Check back shortly." styled as a normal feed card. Do NOT fall back to Scout AI calls.

### 2. `PulseStrip.tsx` — Live Metrics Bar

Horizontal scrollable row of pulse cards. Receives `items: PulseItem[]` and `loading: boolean` as props.

Each card:
- Team name + metric label (small, muted)
- Value (large, bold, colored cyan `#00D4FF` or red `#BC0000` based on `accent_color`)
- Trend arrow (up/down/flat) — use simple unicode arrows or SVG
- Subtle border glow on hover

**Fallback:** If no pulse data yet, show 5 skeleton cards (same dimensions).

**Animation:** Stagger fade-in on mount (Framer Motion, 0.1s delay between cards).

**Styling:** Use `backdrop-blur-md`, dark card background, team-colored left border accent.

**Team color mapping for left border:**
```typescript
const TEAM_COLORS: Record<string, string> = {
  bears: '#0B162A',
  bulls: '#CE1141',
  blackhawks: '#CF0A2C',
  cubs: '#0E3386',
  whitesox: '#27251F',
};
```

### 3. `FeedCard.tsx` — Feed Cards

Each card is a glassmorphism panel:
```tsx
style={{
  background: 'linear-gradient(135deg, rgba(19,19,29,0.96), rgba(10,10,18,0.96))',
  backdropFilter: 'blur(24px)',
  boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
}}
```

**Card structure:**
- Top-left: Type badge ("Scout Take", "Trade Buzz", "Pulse", "Recap") — small pill, accent background at 15% opacity
- Title: 18px bold, cyan (#00D4FF) for Scout types, white for others
- Content: 14px, #b0b0c4, whitespace-pre-wrap
- Bottom: Relative timestamp (e.g. "12 min ago" from `created_at`)
- Hover: border shifts to `rgba(0,212,255,0.3)`

**Badge color mapping:**
```typescript
const BADGE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  recap:          { bg: 'rgba(0,212,255,0.12)', text: '#00D4FF', label: 'Recap' },
  pulse:          { bg: 'rgba(0,212,255,0.12)', text: '#00D4FF', label: 'Pulse' },
  rumors:         { bg: 'rgba(188,0,0,0.15)',   text: '#ff6666', label: 'Trade Buzz' },
  headlines:      { bg: 'rgba(188,0,0,0.15)',   text: '#ff6666', label: 'Headlines' },
  team_spotlight: { bg: 'rgba(0,212,255,0.12)', text: '#00D4FF', label: 'Spotlight' },
  'user-query':   { bg: 'rgba(0,212,255,0.12)', text: '#00D4FF', label: 'Scout Take' },
};
```

**Streaming state (for user queries only):** If `isStreaming` is true, show content with a blinking cursor:
```tsx
{item.isStreaming && <span className="animate-pulse text-[#00D4FF]">|</span>}
```

**Framer Motion:** Each card enters with `initial={{ opacity: 0, y: 20 }}` `animate={{ opacity: 1, y: 0 }}`.

### 4. `MiniPromptBar.tsx` — Fixed Bottom Input

Fixed to bottom of viewport. Glass morphism bar with:
- Text input (full width, transparent bg, placeholder: "Ask EDGE anything about Chicago sports...")
- Submit button (red gradient, "✶" icon)
- `aria-label` on input

**Props:** `onSubmit: (question: string) => void` — the page handles adding the card and streaming.

**On submit flow (handled by page.tsx, not this component):**
1. Add a new FeedItem to the TOP of the feed with `isStreaming: true`, `isUserQuery: true`, empty content
2. Fetch `/api/edge/stream` with the user's prompt
3. Read the response as a stream, updating the card's content character-by-character
4. When stream ends, set `isStreaming: false`
5. Scroll the new card into view

**Streaming read pattern:**
```typescript
const response = await fetch('/api/edge/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: question }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();
let fullText = '';

while (reader) {
  const { done, value } = await reader.read();
  if (done) break;
  fullText += decoder.decode(value, { stream: true });
  // Update the feed item's content with fullText
  setFeedItems(prev => prev.map(item =>
    item.id === newItemId ? { ...item, content: fullText } : item
  ));
}
// Mark streaming complete
setFeedItems(prev => prev.map(item =>
  item.id === newItemId ? { ...item, isStreaming: false } : item
));
```

**Styling:**
```tsx
className="fixed bottom-0 left-0 right-0 z-50 border-t"
style={{
  background: 'rgba(5,5,8,0.85)',
  backdropFilter: 'blur(24px)',
  borderColor: 'rgba(255,255,255,0.06)',
}}
```

**Add bottom padding to main content** so the feed isn't hidden behind the fixed bar:
```tsx
<main className="pb-24"> {/* enough space for the fixed prompt bar */}
```

### 5. `StreamingText.tsx` — Typewriter Component

A simple component that takes `text: string` and `isStreaming: boolean`:
- If streaming, show text with blinking cursor at the end
- If not streaming, just show text
- No character-by-character animation needed here — the streaming already provides that via the ReadableStream

### 6. `EdgeFeed.tsx` — Feed Container

Wraps the feed cards with:
- `aria-live="polite"` for accessibility
- AnimatePresence for card enter/exit animations
- Skeleton loading state
- Empty state ("EDGE is warming up. Check back shortly.")

---

## Visual Design Rules

### Colors
| Element | Color | Usage |
|---------|-------|-------|
| Page background | `#050508` | Base dark |
| Card background | `rgba(19,19,29,0.96)` | Glassmorphism panels |
| Primary accent | `#00D4FF` (cyan) | Scout titles, hover borders, highlights |
| Secondary accent | `#BC0000` (red) | Urgency, Bears, fire energy, submit button |
| Body text | `#b0b0c4` | Card content |
| Muted text | `#9090a8` | Labels, timestamps |
| Dim text | `#787890` | Least important text |
| Borders | `rgba(255,255,255,0.06)` | Default borders |
| Hover borders | `rgba(0,212,255,0.3)` | Cyan glow on hover |

### Typography
- Headings: 18-24px, font-semibold or font-bold
- Body: 14px (text-sm)
- Labels/badges: 11-12px (text-xs), uppercase tracking-wide
- Font: Barlow (already loaded globally as `var(--sm-font-body)`)

### Animations (Framer Motion)
- Page entrance: `initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}`
- Feed cards: stagger with 0.1s delay, slide up from y:20
- Pulse strip cards: stagger with 0.1s delay, scale from 0.95
- Hover on cards: subtle border color transition (CSS transition, not Framer)
- Submit button: `whileHover={{ scale: 1.05 }}` `whileTap={{ scale: 0.95 }}`

### Responsive
- Mobile: Single column, pulse strip horizontal scrolls, mini prompt bar stays fixed
- Desktop: Max-width 4xl (896px) for feed, 6xl (1152px) for pulse strip
- Pulse strip cards: `min-w-[200px]` on mobile, flex-row on desktop

---

## What to Keep from /edge

- The `getEdgeTagline()` time-of-day logic (copy it)
- The glassmorphism card styling (same gradients + backdrop-blur)
- The stadium arch / skyline SVG backdrop concept (reuse at lower opacity as fixed background)
- Focus rings on interactive elements (`focus:outline-none focus:ring-2 focus:ring-[var(--sm-red)]`)
- The "New Session" clear button concept (add a "Clear Feed" option)
- `aria-live="polite"` on the feed container

## What to Change from /edge

- NO mode buttons (Catch Up / Feel It / Control It) — the feed IS the catch-up
- NO example prompt chips below input — the feed already shows what EDGE can do
- NO custom header — use the global site header from root layout
- Prompt bar moves to fixed bottom (not inline middle of page)
- Headline ticker is replaced by the PulseStrip (richer, card-based)
- Session panels become scrollable feed cards
- Content loads PROACTIVELY on mount from Supabase — NOT from AI calls
- AI is ONLY used when user submits a question via the prompt bar

---

## Performance Budget

| Metric | Target | How |
|--------|--------|-----|
| Page load (feed visible) | < 500ms | Supabase read, not AI calls |
| User query response start | < 2s | Scout AI, streamed back |
| Bundle size impact | Minimal | No new heavy deps |
| AI API calls per page view | **0** | All from pre-computed tables |
| AI API calls per user query | **1** | Only when user submits prompt |

---

## Testing Checklist

- [ ] Page loads and shows skeletons immediately
- [ ] Feed cards populate from Supabase within 500ms
- [ ] Pulse strip populates from Supabase
- [ ] If tables are empty, shows "EDGE is warming up" fallback (NOT an error)
- [ ] Typing in mini prompt bar and submitting adds a streaming card to top of feed
- [ ] Streaming text appears character by character
- [ ] New cards animate in smoothly
- [ ] Pulse strip scrolls horizontally on mobile
- [ ] No layout shift when cards load
- [ ] No double header (only the global site header appears)
- [ ] All interactive elements have visible focus states
- [ ] Bottom prompt bar doesn't overlap feed content (padding applied)
- [ ] No console errors
- [ ] Build passes (`npm run build`)

---

## DO NOT

- Do NOT modify any existing files outside of `/edge2/`, `/api/edge/feed/`, `/api/edge/pulse/`, and `/api/edge/stream/`
- Do NOT install shadcn/ui, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `ai`, or any new AI SDK
- Do NOT call OpenAI/Anthropic APIs directly — user queries go through `/api/edge/stream` which proxies to DataLab
- Do NOT call Scout AI on page load — feed data comes from `edge_feed` Supabase table
- Do NOT use `useChat` from `ai/react` — we don't use the Vercel AI SDK
- Do NOT modify the existing `/edge` page or its API routes (`/api/edge/scout`, `/api/edge/catch-up`)
- Do NOT add images to the public folder (use SVG/CSS gradients for all visuals)
- Do NOT use Tailwind color classes for button colors — use inline `style={{}}`
- Do NOT render a custom header — the global Header from root layout already renders
