# SportsMockery (SM Edge) — Full Pre-Launch Systems Audit

**Audit Date:** 2026-04-10
**Auditor:** Principal Systems Auditor (Claude Opus 4.6)
**Codebase Branch:** `2026-04-01-onhr-f0fc3`
**Last Commit:** `d722a7e2` — Add /training feature walkthrough page

---

## CRITICAL FINDING: Audit Framework Mismatch

The audit request referenced enterprise architecture concepts that **DO NOT EXIST** in this codebase:

| Requested System | Search Result | Status |
|-----------------|---------------|--------|
| AgentOS | 0 matches in `src/` | **DOES NOT EXIST** |
| Flow (data ingestion engine) | 0 matches | **DOES NOT EXIST** |
| OS (workflow engine) | 0 matches | **DOES NOT EXIST** |
| Clear (BI dashboards) | 0 matches | **DOES NOT EXIST** |
| IQ (AI model layer) | 0 matches as named system | **DOES NOT EXIST** |
| /x system (queues, x_enqueue, x_claim_job) | 0 matches | **DOES NOT EXIST** |
| /lab system (experiments, simulations) | 0 matches as named system | **DOES NOT EXIST** |

**Evidence:** `grep -r "AgentOS\|x_enqueue\|x_claim_job\|workflow.engine\|task.orchestrat" src/` returned 0 results.

**Confidence: 100%** | Evidence Type: Code search | Risk Level: N/A

> The audit framework assumes an enterprise multi-system architecture (AgentOS/Flow/OS/Clear/IQ). This project is a **Next.js 16 monolith** with Supabase backend. The audit below covers the **actual systems that exist**.

---

# ACTUAL ARCHITECTURE AUDIT

## What This Project Actually Is

SportsMockery is a **Next.js 16+ App Router monolith** deployed on Vercel, backed by two Supabase instances:
- **Main SM Supabase** — auth, posts, polls, users, subscriptions
- **DataLab Supabase** (`siwoqfzzcxmngnseyzpv.supabase.co`) — sports data, game stats, GM trades, live games

External dependencies:
- **DataLab API** (`datalab.sportsmockery.com`) — Scout AI, GM simulation, live data
- **Anthropic Claude** — GM trade grading, PostIQ, fan chat AI
- **Stripe** — subscription payments
- **Vercel** — hosting, cron jobs, edge runtime

---

## SYSTEM 1: SUPABASE DATABASE LAYER

### STATUS: ⚠️ PARTIAL — Dual-database architecture verified, but hardcoded credentials found

### WHAT EXISTS:

**Three Supabase client patterns verified in code:**

| Client | File | Purpose | Verified |
|--------|------|---------|----------|
| Browser singleton | `src/lib/supabase-browser.ts` | Client-side, globalThis singleton | ✅ |
| Re-export | `src/lib/supabase.ts` | Delegates to browser singleton | ✅ |
| Server admin | `src/lib/supabase-server.ts` | Service role key, server-only | ✅ |
| DataLab public | `src/lib/supabase-datalab.ts` | Anon key, read-only sports data | ✅ |
| DataLab admin | `src/lib/supabase-datalab.ts` | Service key for writes | ✅ |

### PROOF:

**Browser singleton** (`src/lib/supabase-browser.ts:16-31`):
```typescript
export function getBrowserClient() {
  if (typeof window !== 'undefined' && (globalThis as any)[GLOBAL_KEY]) {
    return (globalThis as any)[GLOBAL_KEY]!
  }
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  // ...
}
```
Correctly uses globalThis to prevent multiple GoTrueClient instances.

**DataLab client** (`src/lib/supabase-datalab.ts:1-33`):
Both `datalabClient` (anon) and `datalabAdmin` (service key) are properly constructed with 15-second timeout.

### GAPS:

1. **HARDCODED DATALAB ANON KEY** — `src/lib/supabase-datalab.ts:8` contains the full anon key inline:
   ```
   const DATALAB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...'
   ```
   While anon keys are public by design, this is a maintenance risk if the key rotates. Should use `process.env.DATALAB_SUPABASE_ANON_KEY`.

2. **29 files call `createClient()` or `createBrowserClient()` directly** — Some may violate the singleton rule. Files include `src/lib/db.ts`, `src/lib/admin-auth.ts`, `src/lib/gm-auth.ts`, `src/lib/settings.ts`, multiple cron routes, and admin pages. Each needs individual verification.

3. **Placeholder fallback in server client** — `src/lib/supabase-server.ts:5-6`:
   ```typescript
   const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
   const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
   ```
   If env vars are missing at runtime, this silently creates a non-functional client instead of failing fast.

### TEST PROCEDURE:
1. Grep for all `createClient` / `createBrowserClient` calls
2. Verify each one either uses the singleton or is server-side only
3. Check env vars are set in Vercel dashboard

### RISK LEVEL: Medium
### CONFIDENCE: 85%

---

## SYSTEM 2: AUTHENTICATION & AUTHORIZATION

### STATUS: ⚠️ PARTIAL — Auth flow exists, admin protection weak

### WHAT EXISTS:

| Component | File | Verified |
|-----------|------|----------|
| Sign in/up/out/reset | `src/lib/auth.ts` | ✅ |
| Auth context provider | `src/contexts/AuthContext.tsx` (layout import) | ✅ |
| Middleware auth check | `src/middleware.ts:86-149` | ✅ |
| Auth callback | `src/app/api/auth/callback/route.ts` | ✅ |
| GM auth | `src/lib/gm-auth.ts` | ✅ |
| Admin auth | `src/lib/admin-auth.ts` | ✅ |

### PROOF:

**Middleware** (`src/middleware.ts:86-148`):
- Static assets and API routes pass through immediately (line 107-108)
- Public paths enumerated (lines 5-56) — team pages, content, auth routes
- Article URLs (2+ segment paths) pass through for SEO (line 127)
- Admin routes require authenticated user (lines 137-148)
- Masters subdomain rewriting (lines 91-100)

**Auth functions** (`src/lib/auth.ts:15-50`):
```typescript
export async function signIn(email, password) { ... }
export async function signUp(email, password, metadata?) { ... }
export async function signOut() { ... }
export async function resetPassword(email) { ... }
export async function updatePassword(newPassword) { ... }
```
All use `getBrowserClient()` singleton correctly.

### GAPS:

1. **ADMIN ROUTE PROTECTION IS AUTH-ONLY, NOT ROLE-BASED** — Middleware at line 137-148 only checks `if (!user)`. Any authenticated user can access `/admin/*`. There is no role check (admin, editor, writer) in middleware. Role checking may exist at component level but is not enforced at the gateway.

2. **API ROUTES HAVE NO AUTH** — Middleware line 107: `if (isStaticAsset || isApiPath) return NextResponse.next()`. ALL API routes (`/api/*`) bypass auth entirely. Individual routes must self-enforce auth. This is a **systemic risk** — any new API route is unprotected by default.

3. **GM AUTH SEPARATE PATTERN** — `src/lib/gm-auth.ts` implements its own auth check, separate from main auth. This creates two auth systems to maintain.

4. **Freestar admin bypass** — Middleware line 132: `/admin/freestar` explicitly bypasses auth check.

### TEST PROCEDURE:
1. Access `/admin` without auth → should redirect to `/login` ✅ (verified in code)
2. Access `/admin` as any authenticated user → should it work? (No role check = yes)
3. Access `/api/admin/posts` without auth → middleware passes it through
4. Verify individual API routes check auth themselves

### RISK LEVEL: **HIGH**
### CONFIDENCE: 90%

---

## SYSTEM 3: SCOUT AI (Ask AI)

### STATUS: ✅ VERIFIED — Proxy to DataLab with team/player detection

### WHAT EXISTS:

| Component | File | Verified |
|-----------|------|----------|
| API proxy | `src/app/api/ask-ai/route.ts` | ✅ |
| V2 query route | `src/app/api/v2/scout/query/route.ts` | ✅ |
| Edge scout | `src/app/api/edge/scout/route.ts` | ✅ |
| Scout summary | `src/app/api/scout/summary/route.ts` | ✅ |
| Since last visit | `src/app/api/scout/since-last-visit/route.ts` | ✅ |
| Error logging | `src/lib/scoutErrorLogger.ts` | ✅ |
| Query history | `src/lib/scoutQueryHistory.ts` | ✅ |
| Scout prompts | `src/app/api/scout-prompts/route.ts` | ✅ |
| Track scout | `src/app/api/track-scout/route.ts` | ✅ |

### PROOF:

**API route** (`src/app/api/ask-ai/route.ts:1-49`):
- Proxies to `datalab.sportsmockery.com`
- Team detection via regex patterns (Bears, Bulls, Blackhawks, Cubs, White Sox)
- Player-to-team mapping (Caleb Williams → Bears, Bedard → Blackhawks, etc.)
- Sends `{ query, sessionId }` to DataLab

**Error logger** (`src/lib/scoutErrorLogger.ts:1-50`):
- Logs to `scout_errors` table in DataLab Supabase
- Types: timeout, cors, parse, network, api, unknown
- Never throws — error logging won't break the app

### GAPS:

1. **Player mappings are hardcoded** — `src/app/api/ask-ai/route.ts:32-48`. Traded/signed players won't be detected correctly without code updates.
2. **Dependency on DataLab uptime** — If `datalab.sportsmockery.com` is down, Scout AI is fully offline. No cached fallback.

### RISK LEVEL: Medium
### CONFIDENCE: 90%

---

## SYSTEM 4: GM TRADE SIMULATOR

### STATUS: ✅ VERIFIED — Full trade + simulation + grading system

### WHAT EXISTS:

**API Routes (18 endpoints):**

| Endpoint | Purpose | Auth | Verified |
|----------|---------|------|----------|
| `/api/gm/grade` | AI trade grading (Claude + Edge Function) | GM Auth | ✅ |
| `/api/gm/teams` | League teams | GM Auth | ✅ |
| `/api/gm/roster` | Team rosters | GM Auth | ✅ |
| `/api/gm/trades` | Trade CRUD | GM Auth | ✅ |
| `/api/gm/sessions` | Session management | GM Auth | ✅ |
| `/api/gm/simulate-season` | V3 season simulation proxy | GM Auth | ✅ |
| `/api/gm/sim/season` | V1 simulation | GM Auth | ✅ |
| `/api/gm/simulate` | Basic simulation | GM Auth | ✅ |
| `/api/gm/share/[code]` | Share trade | Public | ✅ |
| `/api/gm/user-score` | User GM score | GM Auth | ✅ |
| `/api/gm/user-position` | Leaderboard position | GM Auth | ✅ |
| `/api/gm/leaderboard` | GM leaderboard | Public | ✅ |
| `/api/gm/cap` | Salary cap data | GM Auth | ✅ |
| `/api/gm/fit` | Player fit analysis | GM Auth | ✅ |
| `/api/gm/validate` | Trade validation | GM Auth | ✅ |
| `/api/gm/audit` | Trade audit | GM Auth | ✅ |
| `/api/gm/scenarios` | Trade scenarios | GM Auth | ✅ |
| `/api/gm/preferences` | User preferences | GM Auth | ✅ |

**Mock Draft (8 endpoints):**

| Endpoint | Purpose | Verified |
|----------|---------|----------|
| `/api/gm/draft/start` | Start mock draft | ✅ |
| `/api/gm/draft/pick` | Make a pick | ✅ |
| `/api/gm/draft/auto` | Auto-advance | ✅ |
| `/api/gm/draft/prospects` | Get prospects | ✅ |
| `/api/gm/draft/eligibility` | Check team eligibility | ✅ |
| `/api/gm/draft/grade` | Grade draft (Claude AI) | ✅ |
| `/api/gm/draft/history` | Draft history | ✅ |
| `/api/gm/draft/share/[mockId]` | Share mock draft | ✅ |

### PROOF:

**Grade route** (`src/app/api/gm/grade/route.ts:1-58`):
- Uses Anthropic SDK directly (`@anthropic-ai/sdk`)
- Calls DataLab Edge Function (`grade-trade`) for deterministic scoring
- Falls back to AI grading if Edge Function fails
- Version: `v3.0.0-ai-authority`

**Season simulation** (`src/app/api/gm/simulate-season/route.ts:1-50`):
- Proxies to `datalab.sportsmockery.com/api/gm/simulate-season`
- Fetches accepted trades from `gm_trades` table
- Auth via `getGMAuthUser()`
- 30s max duration

**Local simulation fallback** exists at `src/lib/sim/`:
- `season-engine.ts`, `game-engine.ts`, `power-ratings.ts`, `data-fetcher.ts`, `constants.ts`

### GAPS:

1. **V2 GM routes exist alongside V1** — Both `/api/gm/grade` and `/api/v2/gm/grade` exist. Unclear which is canonical.
2. **Rate limiting is in-memory** — No Redis or persistent rate limiting for grading endpoint (10/min/user per CLAUDE.md, but enforcement unclear).

### RISK LEVEL: Medium
### CONFIDENCE: 85%

---

## SYSTEM 5: LIVE GAMES

### STATUS: ✅ VERIFIED — Supabase-first with DataLab fallback

### WHAT EXISTS:

| Component | File | Verified |
|-----------|------|----------|
| List endpoint | `src/app/api/live-games/route.ts` | ✅ |
| Detail endpoint | `src/app/api/live-games/[gameId]/route.ts` | ✅ |
| Hero games | `src/app/api/hero-games/route.ts` | ✅ |
| Live cron | `src/app/api/cron/live-games/route.ts` | ✅ |
| Live page | `src/app/live/page.tsx` | ✅ |
| Live game page | `src/app/live/[sport]/[gameId]/page.tsx` | ✅ |
| Live utils | `src/lib/live-games-utils.ts` | ✅ |
| Live cache | `src/lib/live-games-cache.ts` | ✅ |
| Live components | `src/components/live/` | ✅ |

### PROOF:

**Live games API** (`src/app/api/live-games/route.ts:18-47`):
```typescript
// Prefer Supabase (shared DB) first
const supabaseResult = await fetchFromSupabase(team)
if (supabaseResult?.games && supabaseResult.games.length > 0) {
  return NextResponse.json(supabaseResult)
}
// Fallback: DataLab REST API
const datalabGames = await fetchFromDatalabApi(team)
```
Correctly implements Supabase-first, DataLab-fallback pattern.

**Central Time formatting** verified at line 49: `const CENTRAL_TZ = 'America/Chicago'`

**Cron:** `vercel.json` line 28: `/api/cron/live-games` runs every minute (`* * * * *`)

### GAPS:

1. **Per-minute cron on Vercel** — Vercel cron has minimum 1-minute granularity but docs say 10-second polling. The 10-second polling must happen client-side, not via cron.
2. **Boxscore routes are per-team** — Bears, Bulls, Blackhawks, Cubs, White Sox each have separate `/api/{team}/boxscore/[gameId]` routes. Code duplication risk.

### RISK LEVEL: Low
### CONFIDENCE: 90%

---

## SYSTEM 6: TEAM PAGES DATA LAYER

### STATUS: ✅ VERIFIED — Five team data files with proper patterns

### WHAT EXISTS:

| File | Team | Verified |
|------|------|----------|
| `src/lib/bearsData.ts` | Bears (NFL) | ✅ |
| `src/lib/bullsData.ts` | Bulls (NBA) | ✅ |
| `src/lib/blackhawksData.ts` | Blackhawks (NHL) | ✅ |
| `src/lib/cubsData.ts` | Cubs (MLB) | ✅ |
| `src/lib/whitesoxData.ts` | White Sox (MLB) | ✅ |
| `src/lib/team-config.ts` | Season helpers | ✅ |
| `src/lib/team-sidebar-data.ts` | Sidebar data extraction | ✅ |
| `src/lib/season-status.ts` | Season status detection | ✅ |
| `src/lib/team-data.ts` | Shared team data | ✅ |

**Team page routes (5 teams x ~10 sub-pages each):**

| Team | Pages Verified |
|------|---------------|
| Bears | hub, players, [slug], schedule, scores, stats, roster, cap-tracker, depth-chart, draft-tracker, game-center, live |
| Bulls | hub, players, [slug], schedule, scores, stats, roster, cap-tracker |
| Blackhawks | hub, players, [slug], schedule, scores, stats, roster, cap-tracker |
| Cubs | hub, players, [slug], schedule, scores, stats, roster, cap-tracker |
| White Sox | hub, players, [slug], schedule, scores, stats, roster, cap-tracker |

### PROOF:

Type definitions in `src/lib/supabase-datalab.ts:36-390` define interfaces for all five teams:
- `BearsGame`, `BearsPlayer`, `BearsPlayerGameStats`, `BearsPlayerSeasonStats`, `BearsTeamSeasonStats`
- `BullsGame`, `BullsPlayer`, `BullsPlayerGameStats`
- `BlackhawksGame`, `BlackhawksPlayer`, `BlackhawksPlayerGameStats`
- `CubsGame`, `CubsPlayer`, `CubsPlayerGameStats`
- `WhiteSoxGame`, `WhiteSoxPlayer`, `WhiteSoxPlayerGameStats`

### RISK LEVEL: Low
### CONFIDENCE: 90%

---

## SYSTEM 7: POSTIQ (Admin AI Content Assistant)

### STATUS: ✅ VERIFIED — Claude Sonnet 4 integration for admin content

### WHAT EXISTS:

| Component | File | Verified |
|-----------|------|----------|
| API route | `src/app/api/admin/ai/route.ts` | ✅ |
| V2 suggest | `src/app/api/v2/postiq/suggest/route.ts` | ✅ |
| Poll generator | `src/app/api/postiq/generate-poll/route.ts` | ✅ |
| Chart generator | `src/app/api/postiq/generate-chart/route.ts` | ✅ |
| Knowledge base | `src/lib/postiq-knowledge.ts` | ✅ |
| Media scanner | `src/lib/postiq-media-scanner.ts` | ✅ |
| Admin page | `src/app/admin/postiq/page.tsx` | ✅ |
| Components | `src/components/postiq/` | ✅ |

### PROOF:

**API route** (`src/app/api/admin/ai/route.ts:1-10`):
```typescript
import Anthropic from '@anthropic-ai/sdk'
const anthropic = new Anthropic()
```
Uses direct Anthropic SDK (not DataLab). Includes poll creation from DataLab suggestions, team theme mapping.

### RISK LEVEL: Low
### CONFIDENCE: 85%

---

## SYSTEM 8: FAN CHAT

### STATUS: ✅ VERIFIED — AI personalities per team channel

### WHAT EXISTS:

| Component | File | Verified |
|-----------|------|----------|
| AI response route | `src/app/api/fan-chat/ai-response/route.ts` | ✅ |
| Messages route | `src/app/api/fan-chat/messages/route.ts` | ✅ |
| Presence route | `src/app/api/fan-chat/presence/route.ts` | ✅ |
| Online counts | `src/app/api/fan-chat/online-counts/route.ts` | ✅ |
| User route | `src/app/api/fan-chat/user/route.ts` | ✅ |
| AI personalities | `src/lib/ai-personalities.ts` | ✅ |
| Chat page | `src/app/fan-chat/page.tsx` | ✅ |
| Components | `src/components/fan-chat/` | ✅ |

### PROOF:

**AI response** (`src/app/api/fan-chat/ai-response/route.ts:1-49`):
- Uses personality system (`getPersonalityForChannel`)
- Has rate limiting (in-memory Map)
- Accepts channel, messages, user, trigger reason

### GAPS:

1. **Rate limiting is in-memory** — `const rateLimitStore: Map<...> = new Map()` at line 13. Resets on every cold start. On Vercel serverless, this means rate limits are effectively **non-functional** since each invocation may get a new instance.

### RISK LEVEL: Medium
### CONFIDENCE: 85%

---

## SYSTEM 9: REALTIME / WEBSOCKETS

### STATUS: ⚠️ PARTIAL — Supabase Realtime channels, not raw WebSockets

### WHAT EXISTS:

| Component | File | Verified |
|-----------|------|----------|
| WebSocket Provider | `src/context/WebSocketProvider.tsx` | ✅ |
| Layout integration | `src/app/layout.tsx:25` (import) | ✅ |

### PROOF:

**WebSocketProvider** (`src/context/WebSocketProvider.tsx:1-60`):
- Uses Supabase Realtime (`RealtimeChannel`, `RealtimePostgresChangesPayload`)
- Subscribes to tables: `sm_box_scores`, `sm_hub_updates`, `chat_presence`
- Converts Supabase INSERT payloads into `RiverCard` objects
- Uses card_id prefix stripping for DB row identification

This is **NOT raw WebSocket** — it's Supabase Realtime (Postgres Changes), which is a higher-level abstraction.

### GAPS:

1. **No error recovery visible** in the provider — if Supabase Realtime disconnects, reconnection behavior depends on the Supabase client library defaults.

### RISK LEVEL: Low
### CONFIDENCE: 80%

---

## SYSTEM 10: CRON JOBS

### STATUS: ✅ VERIFIED — 15 cron jobs configured in vercel.json

### WHAT EXISTS:

| Cron | Schedule | Route File | Verified |
|------|----------|------------|----------|
| sync-teams | Hourly (:00) | `src/app/api/cron/sync-teams/route.ts` | ✅ |
| team-pages-health | Hourly (:15) | `src/app/api/cron/team-pages-health/route.ts` | ✅ |
| sync-bears-data | Hourly (:30) | `src/app/api/cron/sync-bears-data/route.ts` | ✅ |
| live-games | Every minute | `src/app/api/cron/live-games/route.ts` | ✅ |
| send-chicago-daily | Daily 12:00 UTC | `src/app/api/cron/send-chicago-daily/route.ts` | ✅ |
| cleanup-scout-history | Daily 03:00 UTC | `src/app/api/cron/cleanup-scout-history/route.ts` | ✅ |
| sync-gm-rosters | Hourly (:45) | `src/app/api/cron/sync-gm-rosters/route.ts` | ✅ |
| audit-gm | Hourly (:50) | `src/app/api/cron/audit-gm/route.ts` | ✅ |
| mobile-alerts | Every minute | `src/app/api/cron/mobile-alerts/route.ts` | ✅ |
| audit-orbs | Daily 12:00 UTC | `src/app/api/cron/audit-orbs/route.ts` | ✅ |
| sync-wordpress | Daily 04:00 UTC | `src/app/api/cron/sync-wordpress/route.ts` | ✅ |
| sync-writer-views | Daily 05:00 UTC | `src/app/api/cron/sync-writer-views/route.ts` | ✅ |
| sync-article-views | Hourly (:00) | `src/app/api/cron/sync-article-views/route.ts` | ✅ |
| sync-article-comments | Hourly (:00) | `src/app/api/cron/sync-article-comments/route.ts` | ✅ |
| scout-prompts | Daily 06:00 UTC | `src/app/api/cron/scout-prompts/route.ts` | ✅ |

### PROOF:

`vercel.json:12-72` — All 15 crons defined with paths and schedules. Every path has a corresponding `route.ts` file verified via glob.

### GAPS:

1. **Two per-minute crons** — `live-games` and `mobile-alerts` both run every minute. On Vercel Pro plan this is fine, but on Hobby it may hit limits.
2. **No cron auth** — Crons run via GET. Middleware passes `/api/cron` through (line 52). Anyone who knows the URL can trigger them externally. Vercel cron uses a `CRON_SECRET` header in newer versions — unclear if this is enforced.

### RISK LEVEL: Medium
### CONFIDENCE: 95%

---

## SYSTEM 11: STRIPE / SUBSCRIPTIONS

### STATUS: ✅ VERIFIED — Full Stripe integration

### WHAT EXISTS:

| Component | File | Verified |
|-----------|------|----------|
| Stripe library | `src/lib/stripe.ts` | ✅ |
| Checkout route | `src/app/api/stripe/checkout/route.ts` | ✅ |
| Portal route | `src/app/api/stripe/portal/route.ts` | ✅ |
| Webhook route | `src/app/api/stripe/webhook/route.ts` | ✅ |
| Subscription context | `src/contexts/SubscriptionContext.tsx` (layout import) | ✅ |
| Pricing page | `src/app/pricing/page.tsx` | ✅ |
| Subscription API | `src/app/api/subscription/route.ts` | ✅ |
| Admin subscriptions | `src/app/api/admin/subscriptions/route.ts` | ✅ |

### PROOF:

**Webhook** (`src/app/api/stripe/webhook/route.ts:1-50`):
- Verifies webhook signature (`stripe.webhooks.constructEvent`)
- Handles: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_failed`
- Uses `supabaseAdmin` for DB writes

### RISK LEVEL: Low
### CONFIDENCE: 90%

---

## SYSTEM 12: CONTENT MANAGEMENT (POSTS/ARTICLES)

### STATUS: ✅ VERIFIED — Full admin CMS with block editor

### WHAT EXISTS:

| Component | File | Verified |
|-----------|------|----------|
| Posts API | `src/app/api/admin/posts/route.ts` | ✅ |
| Post by ID | `src/app/api/posts/[id]/route.ts` | ✅ |
| Post by slug | `src/app/api/posts/slug/[slug]/route.ts` | ✅ |
| Post library | `src/lib/posts.ts` | ✅ |
| Transform | `src/lib/transform-post.ts` | ✅ |
| Admin post editor | `src/app/admin/posts/[id]/edit/page.tsx` | ✅ |
| Admin new post | `src/app/admin/posts/new/page.tsx` | ✅ |
| Studio editor | `src/app/studio/posts/[id]/edit/page.tsx` | ✅ |
| Article rendering | `src/components/article/ArticleContent.tsx` | ✅ |
| Block preview | `src/components/admin/BlockEditor/BlockPreviewRenderer.tsx` | ✅ |
| Article page | `src/app/[category]/[slug]/page.tsx` | ✅ |

**dangerouslySetInnerHTML usage:** 29 occurrences across 21 files — block content HTML is rendered correctly per CLAUDE.md rule #9.

### RISK LEVEL: Low
### CONFIDENCE: 85%

---

## SYSTEM 13: POLLS

### STATUS: ✅ VERIFIED

### WHAT EXISTS:

| Component | Verified |
|-----------|----------|
| `src/app/api/polls/route.ts` | ✅ |
| `src/app/api/polls/[id]/route.ts` | ✅ |
| `src/app/api/polls/[id]/vote/route.ts` | ✅ |
| `src/app/api/polls/[id]/results/route.ts` | ✅ |
| `src/app/polls/page.tsx` | ✅ |
| `src/app/polls/[id]/results/page.tsx` | ✅ |
| `src/app/polls/embed/[id]/page.tsx` | ✅ |
| `src/app/polls/new/page.tsx` | ✅ |
| `src/components/polls/` | ✅ |
| Admin polls: create, edit, link | ✅ |

### RISK LEVEL: Low
### CONFIDENCE: 85%

---

## SYSTEM 14: HOMEPAGE / FEED

### STATUS: ✅ VERIFIED — Hero + infinite feed architecture

### WHAT EXISTS:

| Component | File | Verified |
|-----------|------|----------|
| Homepage | `src/app/page.tsx` | ✅ |
| HomepageFeedV2 | `src/components/homepage/HomepageFeedV2.tsx` | ✅ |
| Hero data | `src/lib/hero-data.ts` | ✅ |
| Feed data | `src/lib/homepage-river-data.ts` | ✅ |
| River composer | `src/lib/river-composer.ts` | ✅ |
| Feed intelligence | `src/lib/feed-intelligence.ts` | ✅ |
| Feed scoring | `src/lib/river-scoring.ts` | ✅ |
| Article extractor | `src/lib/article-feed-extractor.ts` | ✅ |
| Homepage API | `src/app/api/homepage/route.ts` | ✅ |
| Feed API | `src/app/api/feed/route.ts` | ✅ |
| River API | `src/app/api/river/route.ts` | ✅ |
| Hero stats API | `src/app/api/hero-stats/route.ts` | ✅ |
| Team sidebar API | `src/app/api/team-sidebar/route.ts` | ✅ (referenced in CLAUDE.md) |

### PROOF:

**Homepage** (`src/app/page.tsx:52-71`):
```typescript
export default async function HomePage() {
  const { firstName, userId } = await getUser()
  const heroData = await getHeroData(userId)
  return <HomepageFeedV2 firstName={...} featuredStory={...} ... />
}
```
Server component with user detection and hero data fetching.

### RISK LEVEL: Low
### CONFIDENCE: 85%

---

## SYSTEM 15: FRONTEND UI FRAMEWORK

### STATUS: ✅ VERIFIED — Next.js 16 + React 19 + Tailwind 4

### WHAT EXISTS:

| Property | Value | Verified |
|----------|-------|----------|
| Framework | Next.js 16.1.6 | ✅ (`package.json:66`) |
| React | 19.2.3 | ✅ (`package.json:68`) |
| CSS | Tailwind CSS 4 | ✅ (`package.json:104`) |
| Font | Space Grotesk (400, 500, 700) | ✅ (`layout.tsx:35-39`) |
| Pages | **199 page.tsx files** | ✅ |
| API Routes | **192 route.ts files** | ✅ |
| Component dirs | **43 component directories** | ✅ |
| Lib files | **86+ lib files** | ✅ |
| globals.css | **5,737 lines** | ⚠️ Very large |
| Charting | echarts, recharts, d3, chart.js | ✅ (4 charting libs!) |
| 3D/AR | three.js, @react-three/fiber, @react-three/xr | ✅ |
| Animation | framer-motion, gsap | ✅ |
| Rich text | TipTap | ✅ |

### PROOF:

**Layout** (`src/app/layout.tsx:1-80`):
- Space Grotesk font loaded correctly
- Providers: ThemeProvider, AuthProvider, SubscriptionProvider, TeamRecordProvider, WebSocketProvider, MediaControllerProvider, AudioPlayerProvider, MotionProvider
- Components: SidebarLayout, SkipToContent, ScrollToTop, BackToTop, CookieBanner, NavigationProgress, Breadcrumb, NavigationOrb, ParticleBg, LiveStrip, MobileBottomNav, AudioMiniPlayer

### GAPS:

1. **4 charting libraries** — echarts, recharts, d3, chart.js all in dependencies. This is significant bundle bloat. Should consolidate to one.
2. **globals.css is 5,737 lines** — Extremely large for a Tailwind project. Likely contains a lot of one-off styles that should be components or Tailwind utilities.
3. **3D/AR/XR dependencies** — three.js, @react-three/fiber, @react-three/xr, @mediapipe/tasks-vision — significant bundle weight for features (AR pages) that may see low usage.
4. **ParticleBg still imported in layout** — CLAUDE.md says "Old ParticleBg dots removed from layout.tsx" but `import ParticleBg from "@/components/layout/ParticleBg"` is at layout.tsx line 22 and presumably rendered.

### RISK LEVEL: Medium (bundle size / performance)
### CONFIDENCE: 90%

---

## SYSTEM 16: FEATURE FLAGS

### STATUS: ⚠️ MINIMAL — Only 2 flags, env-based

### WHAT EXISTS:

```typescript
// src/lib/feature-flags.ts
export const FEATURE_FLAGS = {
  USE_MOCK_MODEL: process.env.NEXT_PUBLIC_USE_MOCK_MODEL === 'true',
  SHOW_SEASON_IMPACT: process.env.NEXT_PUBLIC_SHOW_SEASON_IMPACT === 'true',
} as const
```

Plus: `src/app/api/feature-flags/check/route.ts` — API endpoint for checking flags.

### GAPS:

1. **No runtime flag system** — flags are compile-time env vars baked into the bundle. No ability to toggle features without redeployment.

### RISK LEVEL: Low
### CONFIDENCE: 95%

---

## SYSTEM 17: EMAIL / NEWSLETTERS

### STATUS: ⚠️ PARTIAL

### WHAT EXISTS:

| Component | File | Verified |
|-----------|------|----------|
| Newsletter subscribe | `src/app/api/newsletter/subscribe/route.ts` | ✅ |
| Chicago Daily cron | `src/app/api/cron/send-chicago-daily/route.ts` | ✅ |
| Email lib | `src/lib/email/` | ✅ |
| Email templates | `src/emails/` | ✅ |
| Resend SDK | `package.json` (resend: ^6.7.0) | ✅ |

### RISK LEVEL: Low
### CONFIDENCE: 75%

---

## SYSTEM 18: SOCIAL / BOT INTEGRATIONS

### STATUS: ⚠️ PARTIAL

### WHAT EXISTS:

| Component | File | Verified |
|-----------|------|----------|
| Post to X | `src/app/api/post-to-x/route.ts` | ✅ |
| Social X | `src/app/api/social/x/route.ts` | ✅ |
| Social Facebook | `src/app/api/social/facebook/route.ts` | ✅ |
| Bot monitor | `src/app/api/bot/monitor/route.ts` | ✅ |
| Bot post | `src/app/api/bot/post/route.ts` | ✅ |
| Bot config | `src/app/api/bot/config/route.ts` | ✅ |
| Bot status | `src/app/api/bot/status/route.ts` | ✅ |
| Bot lib | `src/lib/bot/` | ✅ |
| twitter-api-v2 | `package.json` | ✅ |

### RISK LEVEL: Low
### CONFIDENCE: 70%

---

## SYSTEM 19: MOBILE

### STATUS: ⚠️ PARTIAL — Config endpoint exists, mobile directory present

### WHAT EXISTS:

| Component | File | Verified |
|-----------|------|----------|
| Mobile config API | `src/app/api/mobile/config/route.ts` | ✅ |
| Mobile alerts cron | `src/app/api/cron/mobile-alerts/route.ts` | ✅ |
| Mobile directory | `mobile/` (25 items) | ✅ (exists) |
| Mock draft mobile | `mobile/app/mock-draft/index.tsx` | Referenced in CLAUDE.md |

### GAPS:

❌ **UNVERIFIED — Mobile app not audited in detail.** The `mobile/` directory exists but was not deeply explored. Cannot confirm build status or completeness.

### RISK LEVEL: Unknown
### CONFIDENCE: 40%

---

## SYSTEM 20: SEO

### STATUS: ✅ VERIFIED

### WHAT EXISTS:

| Component | File | Verified |
|-----------|------|----------|
| SEO audit API | `src/app/api/seo/audit/route.ts` | ✅ |
| SEO keywords API | `src/app/api/seo/keywords/route.ts` | ✅ |
| SEO suggest API | `src/app/api/seo/suggest-keywords/route.ts` | ✅ |
| SEO library | `src/lib/seo.ts` | ✅ |
| SEO components | `src/components/seo/` | ✅ |
| Admin SEO page | `src/app/admin/seo/page.tsx` | ✅ |
| next-sitemap | `next-sitemap.config.js` | ✅ |
| RSS feed | `src/app/api/rss/route.ts` | ✅ |
| Structured data | `ArticleSchema.tsx`, `BreadcrumbSchema.tsx`, `SportsEventSchema.tsx` | ✅ |
| Metadata | OG tags, Twitter cards in `layout.tsx` | ✅ |

### RISK LEVEL: Low
### CONFIDENCE: 85%

---

# SECURITY AUDIT

## FINDING S1: ALL API ROUTES BYPASS MIDDLEWARE AUTH
**Severity: HIGH**

`src/middleware.ts:107`:
```typescript
if (isStaticAsset || isApiPath) return NextResponse.next()
```
Every `/api/*` route is accessible without auth at the middleware level. Auth must be self-enforced by each route individually.

## FINDING S2: HARDCODED SUPABASE ANON KEY
**Severity: LOW** (anon keys are public by design)

`src/lib/supabase-datalab.ts:8` — Full JWT token hardcoded in source.

## FINDING S3: IN-MEMORY RATE LIMITING ON SERVERLESS
**Severity: MEDIUM**

Fan chat AI response (`src/app/api/fan-chat/ai-response/route.ts:13`) uses in-memory `Map` for rate limiting. On Vercel serverless, each invocation may be a fresh instance, making rate limits ineffective.

## FINDING S4: ADMIN ROUTES — AUTH BUT NO ROLE CHECK
**Severity: HIGH**

Middleware checks `if (!user)` for admin routes but does not verify admin role. Any authenticated user could potentially access admin pages.

## FINDING S5: CRON ENDPOINTS PUBLICLY ACCESSIBLE
**Severity: MEDIUM**

No `CRON_SECRET` verification visible in cron routes. External actors could trigger data syncs.

## FINDING S6: NO-CACHE HEADERS ON ALL ROUTES
**Severity: LOW** (intentional but aggressive)

`vercel.json:74-92` sets `Cache-Control: no-store, no-cache` on ALL routes (`/(.*)`), including static assets. This prevents CDN caching entirely, increasing origin load and latency.

---

# PERFORMANCE AUDIT

## P1: BUNDLE SIZE CONCERNS
- **4 charting libraries** (echarts, recharts, d3, chart.js)
- **3D libraries** (three.js, react-three-fiber, react-three-xr, mediapipe)
- **2 animation libraries** (framer-motion, gsap)
- **5,737-line globals.css**

## P2: 9 CONTEXT PROVIDERS IN LAYOUT
The root layout wraps content in 9+ providers:
ThemeProvider → AuthProvider → SubscriptionProvider → TeamRecordProvider → WebSocketProvider → MediaControllerProvider → AudioPlayerProvider → MotionProvider → ConditionalChatProvider

Each provider adds to the React tree depth and initial render cost.

## P3: AGGRESSIVE NO-CACHE
`vercel.json` disables caching on all routes. Static assets are not benefiting from CDN caching.

---

# FALSE POSITIVES — Things That Look Built But Aren't Real

| System | Why It's False |
|--------|---------------|
| **AgentOS** | Referenced in audit prompt only. Does not exist in codebase. 0 code. |
| **Flow (data ingestion engine)** | Does not exist. Data comes from DataLab Supabase and WordPress sync. |
| **OS (workflow engine)** | Does not exist. No task queues, no orchestration, no job lifecycle. |
| **Clear (BI dashboards)** | Does not exist. Admin analytics page exists but is not a "BI layer". |
| **IQ (AI model layer)** | Does not exist as a named system. AI capabilities exist but are ad-hoc API routes calling Anthropic/DataLab. |
| **/x system (queues)** | Does not exist. 0 matches for `x_enqueue`, `x_claim_job`. |
| **/lab system (experiments)** | Does not exist. Local sim engine exists in `src/lib/sim/` but is a fallback, not an experiment platform. |

---

# HIDDEN RISKS — Things That Appear to Work But Are Fragile

1. **DataLab single point of failure** — Scout AI, GM simulation, live games, team data ALL depend on `datalab.sportsmockery.com`. If DataLab goes down, the majority of the platform's differentiating features go dark.

2. **In-memory rate limiting** — Multiple routes use `Map()` for rate limiting. On Vercel serverless, these reset per cold start. Under load, rate limits are non-functional.

3. **Player name hardcoding** — Scout AI team detection depends on static regex patterns for player names. Trades/signings invalidate these without code changes.

4. **ParticleBg contradiction** — CLAUDE.md says "Old ParticleBg dots removed from layout.tsx" but `import ParticleBg` exists at layout.tsx line 22.

5. **Multiple Supabase client instantiation** — 29 files call `createClient`/`createBrowserClient`. While some are legitimate server-side usage, any browser-side violations cause auth race conditions.

6. **V1/V2 API route duplication** — Both `/api/gm/grade` and `/api/v2/gm/grade` exist. Unclear which is live, creating maintenance confusion.

7. **No-cache on everything** — `vercel.json` forces no-cache on ALL routes including static assets, negating Vercel CDN benefits.

---

# LAUNCH READINESS SCORE

## **68 / 100**

### Breakdown:

| Category | Score | Notes |
|----------|-------|-------|
| Core functionality | 85/100 | Homepage, articles, team pages, GM, Scout all exist |
| Data layer | 80/100 | Proper Supabase patterns, typed interfaces, dual DB |
| Authentication | 55/100 | Auth exists but middleware holes, no admin role check |
| API security | 45/100 | All APIs bypass middleware, crons unprotected |
| Performance | 50/100 | 4 chart libs, 3D deps, no-cache everywhere |
| Error handling | 70/100 | Error logger exists, try/catch patterns present |
| Monitoring | 60/100 | Cron health checks, error table, but no APM |
| Mobile | 40/100 | Exists but unverified |
| Documentation | 85/100 | CLAUDE.md is exceptional, 76+ docs files |

---

# MUST-FIX BEFORE LAUNCH

1. **Add admin role verification to middleware** — Currently any authenticated user can access `/admin/*`. Add role check (`admin`, `editor`, `writer`) at minimum.

2. **Add CRON_SECRET verification** — Vercel cron sends an authorization header. All cron routes should verify it to prevent external triggering.

3. **Fix no-cache headers** — The global `Cache-Control: no-store` in vercel.json should be scoped. Static assets and public pages should be cacheable.

4. **Consolidate charting libraries** — 4 charting libraries (echarts, recharts, d3, chart.js) is excessive. Pick one (echarts is most used) and migrate.

5. **Implement persistent rate limiting** — Replace in-memory `Map()` rate limiting with Vercel KV, Upstash Redis, or similar. Current rate limiting is non-functional on serverless.

6. **Remove or env-var the DataLab hardcoded anon key** — Move `DATALAB_ANON_KEY` from source code to environment variable for key rotation capability.

7. **Resolve ParticleBg contradiction** — Either remove from layout.tsx or update CLAUDE.md.

---

# REPRODUCIBILITY CHECK

Another engineer can verify these findings by:

1. **Architecture search:** Run `grep -r "AgentOS\|x_enqueue\|x_claim_job" src/` — returns 0 results, confirming enterprise systems don't exist.

2. **API route count:** Run `find src/app/api -name "route.ts" | wc -l` — returns 192.

3. **Page count:** Run `find src/app -name "page.tsx" | wc -l` — returns 199.

4. **Middleware auth bypass:** Read `src/middleware.ts:107` — `if (isStaticAsset || isApiPath) return NextResponse.next()`.

5. **Admin no-role-check:** Read `src/middleware.ts:137-148` — only checks `if (!user)`, no role verification.

6. **Cron config:** Read `vercel.json:12-72` — all 15 crons listed.

7. **Rate limiting:** Read `src/app/api/fan-chat/ai-response/route.ts:13` — `const rateLimitStore: Map<...> = new Map()`.

8. **Supabase clients:** Run `grep -r "createClient\|createBrowserClient" src/ --include="*.ts" --include="*.tsx" -l | wc -l` — returns 29 files.

9. **No-cache:** Read `vercel.json:74-92` — global no-cache headers.

10. **Bundle deps:** Read `package.json:23-91` — verify 4 chart libs, 3D deps, 2 animation libs.

---

*Audit completed 2026-04-10. All findings based on static code analysis. Runtime/production behavior may differ.*
