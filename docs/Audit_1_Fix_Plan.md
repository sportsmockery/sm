# MASTER FIX PLAN — SportsMockery Pre-Launch Remediation

**Based on:** `docs/Audit_1.md` (2026-04-10)
**Created:** 2026-04-10
**Architect:** Principal Systems Architect (Claude Opus 4.6)

---

# AUDIT CORRECTIONS (Updated After Deeper Investigation)

The initial audit identified some issues that, upon deeper code inspection, are **less severe than reported**:

| Audit Finding | Revised Status | Evidence |
|---------------|---------------|----------|
| "Admin routes — no role check" | **PARTIALLY MITIGATED** — `requireAdmin()` exists in `src/lib/admin-auth.ts:59-82` and is used by 10 admin API routes. But **22 admin API routes lack any auth**. Middleware still only checks `if (!user)`. | `grep requireAdmin` found 10 routes; `grep` found 22 routes with no auth |
| "Cron endpoints publicly accessible" | **MITIGATED** — All 15 cron routes check `CRON_SECRET`. However, `verifyCronSecret()` helper in admin-auth.ts is never imported — each route rolls its own check inline. | `grep CRON_SECRET` found checks in all cron routes |
| "ParticleBg contradiction" | **DEAD IMPORT ONLY** — Imported at layout.tsx:22 but JSX is commented out: `{/* ParticleBg removed */}` (line 193). Not rendered. | layout.tsx:193 |

**Revised risk profile:**
- Admin API auth: HIGH (22 unprotected routes including PostIQ AI, polls, media, subscriptions)
- Cron auth: LOW (all check CRON_SECRET, just inconsistent pattern)
- Middleware admin check: MEDIUM (auth-only, no role — but API routes do per-route role checks where implemented)

---

# TIER 1 — LAUNCH BLOCKERS

---

## ISSUE 1: 22 Admin API Routes Missing Authentication

### WHY THIS IS CRITICAL:

Anyone on the internet can call these endpoints. They include:
- `/api/admin/ai` — PostIQ (calls Anthropic API, costs money per call)
- `/api/admin/polls/*` — Create/edit/delete polls
- `/api/admin/media/*` — Upload/delete media files
- `/api/admin/subscriptions` — View/modify subscriptions
- `/api/admin/tags` — Modify content tags
- `/api/admin/slugs` — Modify URL slugs
- `/api/admin/gm-scoring` — Modify GM scores
- `/api/admin/leaderboard/*` — Modify leaderboard data
- `/api/admin/notifications/history` — Read notification history
- `/api/admin/retransform` — Retransform posts (DB writes)
- `/api/admin/add-comments-column` — DDL operation
- `/api/admin/fix-authors` — Modify author data
- `/api/admin/notify` — Send notifications
- `/api/admin/sync-writers` — Sync writer data
- `/api/admin/ai-logging` — Read/write AI logs

A malicious actor could create polls, upload media, modify content, and burn Anthropic API credits — all without logging in.

### ROOT CAUSE:

These routes were built without importing `requireAdmin` from `@/lib/admin-auth`. The pattern exists and is used by 10 other admin routes, but adoption is incomplete.

### BEFORE STATE (BROKEN):

```typescript
// src/app/api/admin/ai/route.ts (line 1-2)
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
// ... No requireAdmin import, no auth check
```

### FIX PLAN:

Add `requireAdmin` to all 22 unprotected admin routes.

**Files to modify (22 files):**

```
src/app/api/admin/fix-authors/route.ts
src/app/api/admin/notify/route.ts
src/app/api/admin/ai-logging/route.ts
src/app/api/admin/posts/related/route.ts
src/app/api/admin/posts/[id]/category/route.ts
src/app/api/admin/posts/[id]/tags/route.ts
src/app/api/admin/sync-writers/route.ts
src/app/api/admin/retransform/route.ts
src/app/api/admin/polls/link/route.ts
src/app/api/admin/polls/route.ts
src/app/api/admin/polls/[id]/route.ts
src/app/api/admin/leaderboard/competitions/route.ts
src/app/api/admin/leaderboard/scores/route.ts
src/app/api/admin/subscriptions/route.ts
src/app/api/admin/tags/route.ts
src/app/api/admin/slugs/route.ts
src/app/api/admin/ai/route.ts
src/app/api/admin/gm-scoring/route.ts
src/app/api/admin/add-comments-column/route.ts
src/app/api/admin/notifications/history/route.ts
src/app/api/admin/media/route.ts
src/app/api/admin/media/[id]/route.ts
```

**Pattern to apply to each exported handler (GET, POST, PUT, DELETE, PATCH):**

```typescript
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  // ... existing logic
}
```

For routes that already have their own cookie-based auth (like `admin/ai/route.ts` which creates its own Supabase client), replace that custom auth with `requireAdmin()` — it handles both cookie and Bearer token auth and checks the admin role.

### AFTER STATE (CORRECT):

Every admin API route returns 401 for unauthenticated requests and 403 for non-admin users.

### TEST PROCEDURE:

```bash
# 1. Hit unprotected route without auth — should return 401
curl -s https://test.sportsmockery.com/api/admin/polls | jq .error
# Expected: "Authentication required"

# 2. Hit with non-admin user token — should return 403
curl -s -H "Authorization: Bearer <non-admin-token>" \
  https://test.sportsmockery.com/api/admin/polls | jq .error
# Expected: "Admin access required"

# 3. Hit with admin token — should return data
curl -s -H "Authorization: Bearer <admin-token>" \
  https://test.sportsmockery.com/api/admin/polls | jq .
# Expected: poll data
```

**Automated verification:**
```bash
# After fix, re-run the audit check:
for f in $(find src/app/api/admin -name "route.ts"); do
  if ! grep -q "requireAdmin\|getAuthUser\|verifyCronSecret" "$f"; then
    echo "STILL NO AUTH: $f"
  fi
done
# Expected: no output (all routes protected)
```

### FAILURE SIGNAL:

Any admin API endpoint returns 200 with data when called without auth headers.

### CONFIDENCE: 95%
### RISK IF NOT FIXED: **Critical** — data manipulation, API cost abuse, content defacement
### EFFORT: Medium (22 files, ~3 lines each, but must verify each route's handler signatures)
### BLAST RADIUS: All admin functionality

---

## ISSUE 2: Global No-Cache Headers Kill CDN Performance

### WHY THIS IS CRITICAL:

`vercel.json` applies `Cache-Control: no-store, no-cache` to **every single route** via wildcard `(.*)`. This means:
- Static assets (_next/static, images, fonts) are re-fetched every request
- Public content pages can't be cached at edge
- Every page load hits origin servers
- Vercel edge network provides zero benefit

For a sports platform with bursty traffic (game days, breaking news), this means every concurrent user hits the origin. At scale this will cause timeouts and high Vercel bills.

### ROOT CAUSE:

`vercel.json:74-92` — overly broad cache-control header applied to all routes.

### BEFORE STATE (BROKEN):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
        { "key": "Pragma", "value": "no-cache" },
        { "key": "Expires", "value": "0" }
      ]
    }
  ]
}
```

### FIX PLAN:

Replace the single wildcard rule with scoped rules:

**File:** `vercel.json` — Replace the entire `headers` array.

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, no-cache, must-revalidate, max-age=0" },
        { "key": "Pragma", "value": "no-cache" }
      ]
    },
    {
      "source": "/admin/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store, no-cache, must-revalidate, max-age=0" },
        { "key": "Pragma", "value": "no-cache" }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)\\.(ico|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=86400, stale-while-revalidate=604800" }
      ]
    }
  ]
}
```

**Logic:**
1. API routes: always no-cache (dynamic data)
2. Admin routes: always no-cache (authenticated, dynamic)
3. _next/static: immutable cache (fingerprinted by Next.js)
4. Static assets: 1-day cache with 7-day stale-while-revalidate
5. All other routes: use Next.js default cache headers (ISR/SSR controls)

### AFTER STATE (CORRECT):

- Static assets cached at edge globally
- API and admin routes remain uncached
- Public pages use Next.js built-in cache control
- Origin load drops significantly on repeat visits

### TEST PROCEDURE:

```bash
# After deploy, check static asset headers:
curl -sI https://test.sportsmockery.com/_next/static/chunks/main.js | grep -i cache-control
# Expected: "public, max-age=31536000, immutable"

# Check API route still uncached:
curl -sI https://test.sportsmockery.com/api/live-games | grep -i cache-control
# Expected: "no-store, no-cache, ..."

# Check image caching:
curl -sI https://test.sportsmockery.com/favicon.ico | grep -i cache-control
# Expected: "public, max-age=86400, ..."
```

### FAILURE SIGNAL:

Static assets still show `no-store` cache headers after deploy.

### CONFIDENCE: 90%
### RISK IF NOT FIXED: **High** — poor performance under load, high Vercel costs, slow page loads
### EFFORT: Low (1 file, config change)
### BLAST RADIUS: All routes (positive impact)

---

## ISSUE 3: Middleware Lets All API Routes Through Without Auth

### WHY THIS IS CRITICAL:

`src/middleware.ts:107` passes ALL `/api/*` requests through without any auth check. While individual routes can self-enforce auth (and many do), **the default is open**. Any new API route created without auth is publicly accessible. This is a systemic design flaw — security should be **opt-out**, not **opt-in**.

### ROOT CAUSE:

```typescript
// middleware.ts:103-108
const isApiPath = pathname.startsWith('/api')
// 1. Allow static assets and API routes immediately
if (isStaticAsset || isApiPath) {
  return NextResponse.next()
}
```

### FIX PLAN:

**This is a DESIGN decision, not a simple fix.** Two approaches:

**Option A (Recommended — lower risk, immediate):** Keep middleware as-is. Add a **lint rule / CI check** that ensures every `src/app/api/admin/**/*.ts` file imports `requireAdmin`. This is less invasive than changing middleware behavior.

**Implementation:**

Create file: `scripts/check-admin-auth.sh`
```bash
#!/bin/bash
# Verify all admin API routes use requireAdmin
FAILED=0
for f in $(find src/app/api/admin -name "route.ts"); do
  if ! grep -q "requireAdmin\|getAuthUser" "$f"; then
    echo "ERROR: $f missing auth check"
    FAILED=1
  fi
done
if [ $FAILED -eq 1 ]; then
  echo "FAIL: Some admin routes lack authentication"
  exit 1
fi
echo "PASS: All admin routes have auth checks"
```

Add to `package.json` scripts:
```json
"check:auth": "bash scripts/check-admin-auth.sh"
```

Add to pre-commit or CI pipeline.

**Option B (More secure but higher risk):** Add `/api/admin/*` to the middleware admin check block. This requires careful testing since middleware auth may conflict with routes that handle their own auth differently.

### TEST PROCEDURE:

```bash
# Run the check script:
npm run check:auth
# Expected: "PASS: All admin routes have auth checks"

# Verify it catches missing auth:
# Temporarily remove requireAdmin from one route, run again
# Expected: "ERROR: ... missing auth check" + exit 1
```

### CONFIDENCE: 85%
### RISK IF NOT FIXED: **High** — any new admin route is open by default
### EFFORT: Low (script + CI integration)
### BLAST RADIUS: Developer workflow (prevents future mistakes)

---

# TIER 2 — HIGH RISK

---

## ISSUE 4: In-Memory Rate Limiting Is Non-Functional on Vercel Serverless

### WHY THIS IS CRITICAL:

Fan chat AI response route uses `new Map()` for rate limiting. On Vercel serverless:
- Each invocation may get a cold-started function instance
- The Map is empty on every cold start
- Under load, instances scale horizontally — each has its own empty Map
- **Rate limiting is effectively disabled in production**

This means an attacker (or a bug) could trigger unlimited AI responses, burning DataLab/Anthropic API credits.

### ROOT CAUSE:

`src/app/api/fan-chat/ai-response/route.ts:13`:
```typescript
const rateLimitStore: Map<string, { count: number; lastReset: number; lastMessage: number }> = new Map()
```

### FIX PLAN:

**Option A (Recommended — no new dependencies):** Use Vercel KV (Redis) or the existing DataLab Supabase for rate limit state.

**Option B (Simplest):** Use a lightweight approach with Supabase — check the last N messages from the same user in the `fan_chat_messages` table within the last minute. This avoids adding any new dependency.

**Option C (Most robust):** Add `@upstash/ratelimit` package (designed for Vercel serverless).

```bash
npm install @upstash/ratelimit @upstash/redis
```

Create `src/lib/rate-limit.ts`:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Falls back to no-op if Upstash env vars not set
let ratelimit: Ratelimit | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
    })
  }
} catch {
  console.warn('[RateLimit] Failed to initialize — rate limiting disabled')
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
  if (!ratelimit) return { success: true, remaining: -1 }
  const result = await ratelimit.limit(identifier)
  return { success: result.success, remaining: result.remaining }
}
```

Then in fan-chat route:
```typescript
import { checkRateLimit } from '@/lib/rate-limit'

// Inside POST handler, before AI processing:
const rl = await checkRateLimit(`fan-chat:${channelId}:${currentUser || 'anon'}`)
if (!rl.success) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
}
```

### BEFORE STATE:
In-memory Map, resets on cold start, no real rate limiting.

### AFTER STATE:
Persistent rate limiting across all serverless instances via Redis.

### TEST PROCEDURE:

```bash
# Send 11 rapid requests to fan-chat AI:
for i in $(seq 1 11); do
  curl -s -X POST https://test.sportsmockery.com/api/fan-chat/ai-response \
    -H "Content-Type: application/json" \
    -d '{"channelId":"bears","messages":[],"currentUser":"test"}' &
done
wait
# Requests 1-10: 200 OK
# Request 11: 429 Rate limit exceeded
```

### FAILURE SIGNAL:

All 11 requests return 200 (rate limiting not enforced).

### CONFIDENCE: 80%
### RISK IF NOT FIXED: **High** — API cost abuse, potential Anthropic rate limit triggering
### EFFORT: Medium (new dependency + env vars + code changes)
### BLAST RADIUS: Fan chat AI, potentially reusable for GM grade, Scout AI

---

## ISSUE 5: Inconsistent Cron Secret Verification Pattern

### WHY THIS IS CRITICAL:

All 15 cron routes check `CRON_SECRET`, but each implements its own inline check. This means:
- Copy-paste errors are likely
- Some may have subtle bugs (different header formats, missing early returns)
- `verifyCronSecret()` in `admin-auth.ts` exists but is **never imported by any cron route**

### ROOT CAUSE:

Each cron route reinvents the wheel instead of using the shared helper.

### FIX PLAN:

Refactor all cron routes to use `verifyCronSecret()` from `src/lib/admin-auth.ts`.

**Pattern to apply to each cron route:**

```typescript
import { verifyCronSecret } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... existing logic
}
```

**Files to modify (15 cron routes):**

```
src/app/api/cron/sync-teams/route.ts
src/app/api/cron/team-pages-health/route.ts
src/app/api/cron/sync-bears-data/route.ts
src/app/api/cron/live-games/route.ts
src/app/api/cron/send-chicago-daily/route.ts
src/app/api/cron/cleanup-scout-history/route.ts
src/app/api/cron/sync-gm-rosters/route.ts
src/app/api/cron/audit-gm/route.ts
src/app/api/cron/mobile-alerts/route.ts
src/app/api/cron/audit-orbs/route.ts
src/app/api/cron/sync-wordpress/route.ts
src/app/api/cron/sync-writer-views/route.ts
src/app/api/cron/sync-article-views/route.ts
src/app/api/cron/sync-article-comments/route.ts
src/app/api/cron/scout-prompts/route.ts
```

### TEST PROCEDURE:

```bash
# Verify no cron route has inline CRON_SECRET check (should use verifyCronSecret):
for f in $(find src/app/api/cron -name "route.ts"); do
  if grep -q "process.env.CRON_SECRET" "$f" && ! grep -q "verifyCronSecret" "$f"; then
    echo "INLINE AUTH: $f"
  fi
done
# Expected: no output (all use verifyCronSecret)
```

### CONFIDENCE: 90%
### RISK IF NOT FIXED: **Medium** — works today but fragile; one typo breaks cron auth
### EFFORT: Low (mechanical refactor, same pattern per file)
### BLAST RADIUS: All cron jobs

---

## ISSUE 6: Dead Import — ParticleBg in layout.tsx

### WHY THIS IS CRITICAL:

Not functionally critical — component is imported but not rendered. However:
- Import triggers module evaluation (potential side effects)
- Adds to bundle size (tree-shaking may or may not remove it)
- Confuses future developers

### ROOT CAUSE:

`src/app/layout.tsx:22`: `import ParticleBg from "@/components/layout/ParticleBg"` — import kept after component was removed from JSX.

### FIX PLAN:

**File:** `src/app/layout.tsx`

Remove line 22:
```diff
- import ParticleBg from "@/components/layout/ParticleBg";
```

Remove line 193:
```diff
- {/* ParticleBg removed — replaced by Chicago star canvas in hero */}
```

### TEST PROCEDURE:

```bash
# Build should succeed:
npm run build
# Verify no ParticleBg references in layout:
grep -n "ParticleBg" src/app/layout.tsx
# Expected: no output
```

### CONFIDENCE: 99%
### RISK IF NOT FIXED: **Low** — dead code, minor bundle impact
### EFFORT: Low (2 line deletions)
### BLAST RADIUS: Root layout only

---

# TIER 3 — OPTIMIZATION

---

## ISSUE 7: Four Charting Libraries in Bundle

### WHY THIS IS CRITICAL (at scale):

`package.json` includes:
- `echarts` + `echarts-for-react` (~800KB minified)
- `recharts` (~400KB)
- `d3` (~500KB)
- `chart.js` + `react-chartjs-2` (~200KB)

Total: ~1.9MB of charting libraries. Even with tree-shaking, this significantly impacts:
- First load JS size
- Client-side hydration time
- Build time

### FIX PLAN:

**Phase 1 (Audit usage):** Determine which libraries are actually used in production pages.

```bash
# Check import counts per library:
grep -r "from 'echarts\|from \"echarts\|from 'echarts-for-react" src/ --include="*.tsx" --include="*.ts" -l | wc -l
grep -r "from 'recharts\|from \"recharts" src/ --include="*.tsx" --include="*.ts" -l | wc -l
grep -r "from 'd3\|from \"d3" src/ --include="*.tsx" --include="*.ts" -l | wc -l
grep -r "from 'chart.js\|from \"chart.js\|from 'react-chartjs" src/ --include="*.tsx" --include="*.ts" -l | wc -l
```

**Phase 2:** Consolidate to 1-2 libraries (likely echarts as primary, d3 for custom viz).

**Phase 3:** Dynamic imports for all chart components:
```typescript
const EChartsReact = dynamic(() => import('echarts-for-react'), { ssr: false })
```

### CONFIDENCE: 75%
### RISK IF NOT FIXED: **Medium** — slow page loads, especially mobile
### EFFORT: High (requires auditing every chart component, migration)
### BLAST RADIUS: All pages with charts

---

## ISSUE 8: 3D/AR/XR Dependencies for Low-Traffic Pages

### WHY THIS IS CRITICAL (at scale):

Three.js ecosystem adds significant weight:
- `three` (~600KB)
- `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `@react-three/xr`
- `@mediapipe/tasks-vision`

Used only on `/ar`, `/ar2`, `/ar3`, and `/metaverse` — likely very low traffic pages.

### FIX PLAN:

Ensure all 3D imports use `next/dynamic` with `{ ssr: false }` so they're code-split and only loaded when those pages are visited. Verify this is already the case.

```bash
# Check if 3D imports are dynamic:
grep -r "from 'three\|from '@react-three\|from '@mediapipe" src/ --include="*.tsx" --include="*.ts" -l
# For each file found, verify it uses dynamic() or is only imported from ar/metaverse pages
```

### CONFIDENCE: 70%
### RISK IF NOT FIXED: **Low** — only affects users who visit AR/metaverse pages
### EFFORT: Low (verify + wrap in dynamic if needed)
### BLAST RADIUS: Bundle size

---

## ISSUE 9: Supabase Server Client Placeholder Fallback

### WHY THIS IS CRITICAL:

`src/lib/supabase-server.ts:5-6`:
```typescript
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
```

If env vars are missing, this creates a client that silently fails — operations return undefined/null instead of throwing. This masks configuration errors.

### FIX PLAN:

**File:** `src/lib/supabase-server.ts`

```typescript
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('[Supabase Server] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

export const supabaseAdmin = url && key
  ? createClient(url, key)
  : (new Proxy({}, {
      get: () => { throw new Error('Supabase server client not configured — check env vars') }
    }) as any)
```

**Note:** The placeholder pattern exists to prevent build-time failures (Next.js evaluates server modules during `next build`). A simpler fix:

```typescript
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'

export const supabaseAdmin = createClient(url, key)

// Fail loudly at runtime if env vars are missing
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && url.includes('placeholder')) {
  console.error('CRITICAL: Supabase server client using placeholder credentials in production!')
}
```

### CONFIDENCE: 80%
### EFFORT: Low
### BLAST RADIUS: All server-side Supabase operations

---

## ISSUE 10: DataLab Anon Key Hardcoded in Source

### ROOT CAUSE:

`src/lib/supabase-datalab.ts:8`:
```typescript
const DATALAB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...'
```

### FIX PLAN:

```typescript
const DATALAB_ANON_KEY = process.env.DATALAB_SUPABASE_ANON_KEY
  || process.env.NEXT_PUBLIC_DATALAB_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIs...' // fallback for build time
```

Add `DATALAB_SUPABASE_ANON_KEY` to Vercel env vars, then remove the inline fallback after confirming deployment works.

### CONFIDENCE: 90%
### EFFORT: Low
### BLAST RADIUS: DataLab connection

---

# SYSTEM-LEVEL IMPROVEMENTS

## Structural Weakness: No Shared Auth Middleware Pattern

The codebase has three auth patterns:
1. Middleware auth (pages only, auth-only, no role)
2. `requireAdmin()` (admin API routes, role-checked)
3. `getGMAuthUser()` (GM routes, separate pattern)

**Recommendation:** Keep `requireAdmin()` as the canonical admin auth. Adopt it everywhere. Do NOT try to unify middleware auth with route-level auth — they serve different purposes.

## Missing System: No Request Logging / APM

There is no centralized request logging, no performance monitoring, no alerting. The `scout_errors` table exists but only covers Scout AI errors.

**Recommendation:** Add Vercel Analytics (free tier) or Sentry for error tracking. This is post-launch but important for operations.

## Simplification: Remove V1/V2 API Route Duplication

Both exist:
- `/api/gm/grade` and `/api/v2/gm/grade`
- `/api/gm/audit` and `/api/v2/gm/audit`
- `/api/gm/validate` and `/api/v2/gm/validate-salary`
- `/api/ask-ai` and `/api/v2/scout/query`

**Recommendation:** Audit which version the frontend actually calls (grep component code for fetch URLs). Deprecate and remove the unused version.

---

# EXECUTION PLAN

---

## DAY 1 — Launch Readiness (4-6 hours)

### Priority Order:

| # | Task | Issue | Effort | Files |
|---|------|-------|--------|-------|
| 1 | Add `requireAdmin` to 22 admin API routes | ISSUE 1 | 2-3 hrs | 22 files |
| 2 | Fix vercel.json cache headers | ISSUE 2 | 15 min | 1 file |
| 3 | Remove ParticleBg dead import | ISSUE 6 | 5 min | 1 file |
| 4 | Create `scripts/check-admin-auth.sh` | ISSUE 3 | 15 min | 2 files |
| 5 | Build + deploy | — | 20 min | — |
| 6 | Verify all fixes via test procedures | — | 30 min | — |

**Order matters:** Issue 1 first (highest risk), then Issue 2 (highest perf impact), then the rest.

### Day 1 Verification Checklist:

```bash
# 1. All admin routes have auth:
bash scripts/check-admin-auth.sh

# 2. No ParticleBg in layout:
grep "ParticleBg" src/app/layout.tsx && echo "FAIL" || echo "PASS"

# 3. Build succeeds:
npm run build

# 4. After deploy — cache headers correct:
curl -sI https://test.sportsmockery.com/_next/static/chunks/main.js | grep cache-control
# Expected: public, max-age=31536000, immutable

# 5. After deploy — admin routes return 401:
curl -s https://test.sportsmockery.com/api/admin/polls | jq .error
# Expected: "Authentication required"
```

---

## DAY 2-3 — Stabilization

| # | Task | Issue | Effort |
|---|------|-------|--------|
| 1 | Refactor cron routes to use `verifyCronSecret()` | ISSUE 5 | 1-2 hrs |
| 2 | Implement persistent rate limiting (Upstash or Supabase) | ISSUE 4 | 2-3 hrs |
| 3 | Fix supabase-server.ts placeholder warning | ISSUE 9 | 15 min |
| 4 | Move DataLab anon key to env var | ISSUE 10 | 15 min |
| 5 | Audit V1/V2 route usage, deprecate unused | Simplification | 1-2 hrs |

---

## WEEK 1 — Hardening

| # | Task | Issue | Effort |
|---|------|-------|--------|
| 1 | Audit charting library usage, plan consolidation | ISSUE 7 | 2-3 hrs |
| 2 | Verify 3D imports are code-split | ISSUE 8 | 1 hr |
| 3 | Add Vercel Analytics or Sentry | Missing System | 1-2 hrs |
| 4 | Bundle size analysis (`npx @next/bundle-analyzer`) | ISSUE 7/8 | 1 hr |
| 5 | Load test critical paths (homepage, live games, GM) | Scale readiness | 2-3 hrs |

---

# VERIFICATION FRAMEWORK

Another engineer can verify ALL fixes without trusting this document:

## 1. Admin Auth Verification

```bash
# Automated: returns exit 0 if all admin routes have auth
bash scripts/check-admin-auth.sh

# Manual: hit any admin endpoint without auth
curl -s -o /dev/null -w "%{http_code}" https://test.sportsmockery.com/api/admin/polls
# Must return 401 (not 200)
```

## 2. Cache Header Verification

```bash
# Check static asset is cached:
curl -sI "https://test.sportsmockery.com/favicon.ico" | grep -i "cache-control"
# Must NOT contain "no-store"

# Check API is not cached:
curl -sI "https://test.sportsmockery.com/api/live-games" | grep -i "cache-control"
# Must contain "no-store" or "no-cache"
```

## 3. Cron Auth Verification

```bash
# Hit cron without secret — should return 401:
curl -s -o /dev/null -w "%{http_code}" https://test.sportsmockery.com/api/cron/sync-teams
# Must return 401

# Hit cron with secret — should return 200:
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://test.sportsmockery.com/api/cron/sync-teams
# Must return 200
```

## 4. Rate Limiting Verification

```bash
# Rapid-fire 15 requests:
for i in $(seq 1 15); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    https://test.sportsmockery.com/api/fan-chat/ai-response \
    -H "Content-Type: application/json" \
    -d '{"channelId":"bears","messages":[],"currentUser":"test-audit"}')
  echo "Request $i: $CODE"
done
# Later requests must return 429
```

## 5. Build Verification

```bash
npm run build
echo "Exit code: $?"
# Must be 0
```

## 6. Dead Import Verification

```bash
grep -c "ParticleBg" src/app/layout.tsx
# Must return 0
```

---

# FINAL OUTPUT

## NEW LAUNCH READINESS SCORE (After All Tier 1 + Tier 2 Fixes)

### Before: 68/100
### After Tier 1 (Day 1): **78/100**
### After Tier 1 + Tier 2 (Day 3): **85/100**
### After Full Plan (Week 1): **90/100**

| Category | Before | After |
|----------|--------|-------|
| Core functionality | 85 | 85 |
| Data layer | 80 | 83 |
| Authentication | 55 | **85** |
| API security | 45 | **82** |
| Performance | 50 | **72** |
| Error handling | 70 | 75 |
| Monitoring | 60 | **70** |
| Mobile | 40 | 40 |
| Documentation | 85 | 85 |

## REMAINING RISKS

1. **DataLab is still a single point of failure** — no fix possible without building redundancy in DataLab itself. If DataLab goes down: Scout AI, GM Trade, season simulation, live games data all fail.

2. **Mobile app unaudited** — `mobile/` directory exists but was not explored. Unknown state.

3. **No automated test suite** — Playwright config exists (`playwright.config.ts`) with `e2e/` directory, but test coverage is unknown. No unit tests found.

4. **29 files instantiate Supabase clients** — Some may violate the singleton rule. Full audit of each file needed but not launch-blocking.

## WHAT WOULD BREAK AT SCALE

1. **Homepage under load** — `force-dynamic` on homepage (`page.tsx:13`) means every request is a server render. With bursty game-day traffic, this becomes the bottleneck. Consider ISR with short revalidation.

2. **Live games per-minute cron** — At current scale (5 teams), fine. If expanded to more sports or real-time features, the 1-minute Vercel cron becomes insufficient.

3. **Fan chat AI** — Without rate limiting (Issue 4), a viral moment could trigger hundreds of AI responses per minute. With fix, still limited by Anthropic API throughput.

4. **globals.css (5,737 lines)** — Build time and CSS parsing overhead. Not critical but degrades DX and could cause specificity conflicts.

---

*Fix plan created 2026-04-10. Execute in priority order. Verify each fix before proceeding to next.*
