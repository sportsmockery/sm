# Pre-Launch Recommendations — Deep Code Analysis

**Date:** 2026-04-11
**Scope:** Code quality, security, SEO, performance, reliability
**Method:** Static analysis of all source files, pattern matching, dependency audit

---

## CRITICAL (Fix before launch)

### 1. Six key pages have ZERO SEO metadata

These user-facing feature pages have no `title`, `description`, or `openGraph` tags. Google will index them with auto-generated titles and blank descriptions. Social sharing will show raw URLs.

| Page | Impact |
|------|--------|
| `/gm` | GM Trade Simulator — flagship feature |
| `/mock-draft` | Mock Draft — flagship feature |
| `/fan-chat` | Fan Chat — community feature |
| `/scout-ai` | Scout AI — flagship feature |
| `/live` | Live Games — high-traffic during games |
| `/owner` | Ownership Report Cards |

**Fix:** Add `export const metadata: Metadata = { ... }` to each page with title, description, and openGraph image.

**Effort:** 30 min

---

### 2. Stripe env vars are missing — payments will crash

Code expects `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` (with `!` non-null assertion), but `.env.local` does not have either. Any payment-related action will throw a runtime error.

**Files affected:**
- `src/lib/stripe.ts:9` — `throw new Error('STRIPE_SECRET_KEY is not set')`
- `src/app/api/stripe/webhook/route.ts:6` — `const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!`
- `src/app/api/stripe/checkout/route.ts`
- `src/app/api/stripe/portal/route.ts`

**Fix:** Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `.env.local` and Vercel env vars. If subscriptions aren't launching yet, add a graceful early-return in the Stripe routes instead of crashing.

**Effort:** 10 min (if keys exist), 30 min (if need to set up Stripe)

---

### 3. Twitter/X posting will crash — env var name mismatch

`src/app/api/post-to-x/route.ts` expects `TWITTER_CONSUMER_KEY`, `TWITTER_CONSUMER_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_ACCESS_TOKEN_SECRET`.

But `.env.local` has `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET`.

`src/app/api/social/x/route.ts` correctly uses the `X_*` names. The `post-to-x` route uses the old `TWITTER_*` names.

**Fix:** Either:
- (A) Add `TWITTER_*` aliases in `.env.local` pointing to same values, OR
- (B) Update `post-to-x/route.ts` to use `X_*` env var names

**Effort:** 5 min

---

### 4. Client components calling DataLab directly (CORS risk)

Multiple client-side components (`'use client'`) fetch directly from `datalab.sportsmockery.com` instead of going through the `/api/` proxy. This will fail in production if DataLab has CORS restrictions, and exposes the DataLab URL to end users.

| File | Line | URL |
|------|------|-----|
| `src/app/mock-draft/page.tsx` | 180 | `datalab.sportsmockery.com/api/gm/draft/teams` |
| `src/app/gm/page.tsx` | 362 | `datalab.sportsmockery.com/api/gm/tradeable-picks` |
| `src/components/admin/PostEditor/AdvancedPostEditor.tsx` | 515, 539 | `datalab.sportsmockery.com/api/postiq/ideas` |
| `src/app/studio/posts/new/StudioPostEditor.tsx` | 284, 300 | `datalab.sportsmockery.com/api/postiq/ideas` |
| `src/components/ownership/ScoutCommentary.tsx` | 19 | `datalab.sportsmockery.com` |

**Fix:** Route these through `/api/` proxy routes. For mock-draft and GM, use the existing `/api/gm/draft/eligibility` and `/api/gm/teams` routes.

**Effort:** 1-2 hours

---

## HIGH (Fix before or immediately after launch)

### 5. Homepage is force-dynamic with 21+ async calls

`src/app/page.tsx:13` sets `export const dynamic = 'force-dynamic'` — every visit is a full server render. `hero-data.ts` makes 7+ parallel Supabase queries (featured story, user preferences, live games, story universe, scout live, debate context, team pulse), each with sub-queries.

On game days with traffic spikes, this becomes a bottleneck. Every concurrent user triggers all these queries.

**Fix:** Consider ISR with `revalidate = 30` (30-second cache). Live data can still poll client-side. Or at minimum, add in-memory caching for hero data with a 10-second TTL.

**Effort:** 1 hour

---

### 6. 561 console.log/error/warn calls in API routes

All 190 API routes collectively have 561 console statements. In Vercel's serverless environment, these go to Vercel logs, which is fine — but some log full error objects, request payloads, and database responses that could contain user data.

**Fix:** Audit the worst offenders. Replace `console.error('Error:', error)` with `console.error('[route-name] Error:', error instanceof Error ? error.message : 'Unknown')` to avoid logging full stack traces with PII.

**Effort:** 2-3 hours (can be done post-launch)

---

### 7. globals.css is 5,737 lines with 144 `!important` and duplicate selectors

The CSS file has grown unwieldy with duplicate class names (`article-body`, `article-card`, `ai-thinking-dots`, etc. appear multiple times) and 144 `!important` declarations indicating specificity wars.

**Duplicate selectors found:** `.ai-thinking-dots`, `.app-dock-inner`, `.app-dock-link`, `.article-block-content`, `.article-body`, `.article-body-2030`, `.article-card`, `.article-card-image`, `.article-hero-cinematic`, `.article-sidebar-focus` (and more)

**Risk:** CSS conflicts cause visual bugs that are hard to debug. Different parts of the file override each other.

**Fix:** Post-launch — audit and consolidate. Use component-scoped CSS modules for new work.

**Effort:** 4-6 hours

---

### 8. Four key feature pages are fully client-rendered

`/gm`, `/fan-chat`, `/mock-draft`, `/scout-ai` all use `'use client'` at the page level. This means:
- Zero server-side rendering
- No SEO content (Google sees empty shell)
- Full JS bundle must download before anything renders
- Slower first paint, especially on mobile

For launch this is acceptable, but these are your flagship features.

**Fix (post-launch):** Refactor to server components with client islands. The page shell (layout, metadata, initial data) renders server-side; interactive parts use `'use client'` components.

**Effort:** 4-8 hours per page

---

### 9. Sitemap only includes articles and categories

`next-sitemap.config.js` fetches from `sm_posts` and `sm_categories` only. These important pages are NOT in the sitemap:

- `/gm` — GM Trade Simulator
- `/mock-draft` — Mock Draft
- `/scout-ai` — Scout AI
- `/fan-chat` — Fan Chat
- `/live` — Live Games
- `/chicago-bears`, `/chicago-bulls`, etc. — Team hubs
- `/chicago-bears/roster`, `/schedule`, `/stats`, etc. — Team sub-pages
- `/owner` — Ownership Report Cards
- `/leaderboard` — GM Leaderboard
- `/pricing` — Pricing page

**Fix:** Add static paths to the sitemap config:

```javascript
additionalPaths: async (config) => {
  const paths = [
    // Static feature pages
    { loc: '/gm', priority: 0.9 },
    { loc: '/mock-draft', priority: 0.9 },
    { loc: '/scout-ai', priority: 0.9 },
    { loc: '/fan-chat', priority: 0.8 },
    { loc: '/live', priority: 0.8 },
    { loc: '/leaderboard', priority: 0.7 },
    { loc: '/owner', priority: 0.7 },
    { loc: '/pricing', priority: 0.6 },
    // Team pages...
  ]
  // ...existing post/category fetching
}
```

**Effort:** 20 min

---

## MEDIUM (Improve reliability)

### 10. 58 hardcoded DataLab URLs across the codebase

`https://datalab.sportsmockery.com` appears in 58 places. `process.env.DATALAB_API_URL` exists and is set in `.env.local`, but many files hardcode the URL instead of using the env var. If DataLab ever moves to a different domain or you need a staging URL, you'd need to update 58 files.

**Fix:** Replace hardcoded URLs with `process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'`. For client components, use `process.env.NEXT_PUBLIC_DATALAB_API_URL` or route through `/api/` proxy.

**Effort:** 1-2 hours

---

### 11. Event listeners without cleanup in components

Several components add `window.addEventListener` without corresponding `removeEventListener` in cleanup:

- `AdRenderer.tsx:49` — resize listener
- `HomeNav.tsx:24` — scroll listener
- `TeamHeader.tsx:69` — scroll listener
- `HomepageFeed.tsx:35,66,132` — scroll + mousedown listeners

These leak memory on navigation (SPA transitions). Each page visit adds another listener.

**Fix:** Add cleanup in `useEffect` return functions:
```typescript
useEffect(() => {
  window.addEventListener('scroll', onScroll)
  return () => window.removeEventListener('scroll', onScroll)
}, [])
```

**Effort:** 1 hour

---

### 12. HomepageFeedV2 is missing `'use client'` check

`src/components/homepage/HomepageFeedV2.tsx` was flagged as not having `'use client'` but it's imported as the sole child of the homepage server component. If it uses hooks internally (which it almost certainly does for infinite scroll, polling, etc.), this could cause hydration issues.

**Fix:** Verify it has `'use client'` at the top. If not, add it.

**Effort:** 5 min

---

### 13. `components/homepage-v2/` directory still exists (11 files)

This was flagged as potentially dead but had 1 external reference. It was not deleted in the cleanup.

**Fix:** Check if the reference is live. If not, delete.

**Effort:** 10 min

---

## LOW (Polish for production quality)

### 14. Remove the `FanSenate.tsx` component

`/governance` was kept but `FanSenate.tsx` was referenced only from `/governance`. Verify it's still imported. If `/governance` uses it, it needs to still exist.

**Fix:** Check `src/app/governance/page.tsx` imports. If `FanSenate.tsx` was deleted but is still imported, the governance page will crash.

**Effort:** 5 min

---

### 15. Consolidate charting libraries

Still have `echarts`, `recharts`, `d3`, and `chart.js` in package.json. Each adds hundreds of KB.

**Quick audit to determine which to keep:**
```bash
grep -r "from 'echarts\|from \"echarts" src/ --include="*.tsx" -l | wc -l
grep -r "from 'recharts\|from \"recharts" src/ --include="*.tsx" -l | wc -l
grep -r "from 'd3\|from \"d3" src/ --include="*.tsx" -l | wc -l
grep -r "from 'chart.js\|react-chartjs" src/ --include="*.tsx" -l | wc -l
```

**Effort:** 2-4 hours to audit and migrate

---

### 16. Add monitoring before launch

No APM, no error tracking, no performance monitoring beyond Vercel's built-in analytics. When things break in production, you'll find out from users, not from alerts.

**Options (in order of effort):**
1. **Vercel Analytics** (free) — already included, just needs enabling in Vercel dashboard
2. **Sentry** (free tier) — `npm install @sentry/nextjs && npx @sentry/wizard@latest -i nextjs` — catches runtime errors with stack traces
3. **Vercel Speed Insights** (free) — Core Web Vitals monitoring

**Effort:** 15-30 min for options 1+3, 1 hour for Sentry

---

## LAUNCH CHECKLIST (Quick verification)

Before going live, verify these manually:

- [ ] Homepage loads and hero renders
- [ ] An article page loads (`/{category}/{slug}`)
- [ ] Team page loads (`/chicago-bears`, click roster, schedule, stats)
- [ ] Scout AI responds to a query (`/scout-ai`)
- [ ] GM Trade Simulator loads teams and can start a session (`/gm`)
- [ ] Mock Draft loads eligible teams (`/mock-draft`)
- [ ] Fan Chat loads and shows channels (`/fan-chat`)
- [ ] Live Games page loads (`/live`)
- [ ] Login works (`/login`)
- [ ] Signup works (`/signup`)
- [ ] Admin dashboard loads (`/admin`)
- [ ] Admin can create/edit a post (`/admin/posts/new`)
- [ ] Polls page works (`/polls`)
- [ ] Search works (`/search`)
- [ ] Mobile: homepage renders correctly on phone-width
- [ ] Mobile: navigation works (sidebar/bottom nav)
- [ ] Dark mode toggle works
- [ ] `/governance` page loads (was kept, verify no broken imports)
- [ ] RSS feed works (`/api/rss`)
- [ ] Sitemap loads (`/sitemap.xml`)

---

## Priority Execution Order

| Priority | Item | Time | Impact |
|----------|------|------|--------|
| 1 | Add SEO metadata to 6 feature pages | 30 min | SEO / social sharing |
| 2 | Fix Stripe env vars or add graceful fallback | 10 min | Prevents payment crashes |
| 3 | Fix Twitter env var name mismatch | 5 min | Prevents posting crashes |
| 4 | Add feature pages to sitemap config | 20 min | SEO indexing |
| 5 | Fix client-side DataLab calls (CORS risk) | 1-2 hrs | Prevents feature breakage |
| 6 | Verify /governance page works | 5 min | Prevents 500 error |
| 7 | Enable Vercel Analytics + Speed Insights | 15 min | Monitoring |
| 8 | Add ISR caching to homepage | 1 hr | Performance under load |
| 9 | Fix event listener memory leaks | 1 hr | Client-side stability |
| 10 | DataLab URL consolidation | 1-2 hrs | Maintainability |
