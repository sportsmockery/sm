# TTFB Optimization — SEO Tip #27

Target: production p75 TTFB ≤ 600 ms across the public catalog (homepage, team hubs, article detail pages).

## Levers in this codebase

### 1. ISR on stable routes

Public routes that don't depend on per-user state are statically generated and revalidated:

| Route                          | `revalidate` | Notes                                          |
| ------------------------------ | ------------ | ---------------------------------------------- |
| `/home/article/[slug]`         | `600`        | Added in this PR.                              |
| `/chicago-bears`               | `300`        | Existing.                                      |
| `/chicago-bulls`               | `300`        | Existing.                                      |
| `/chicago-cubs`                | `300`        | Existing.                                      |
| `/chicago-blackhawks`          | `300`        | Existing.                                      |
| `/chicago-white-sox`           | `300`        | Existing.                                      |
| `/chicago-bears/schedule`      | `300`        | Existing.                                      |

Game-day live routes (`/chicago-*/live`) intentionally keep `dynamic = 'force-dynamic'` — we accept the TTFB cost in exchange for sub-minute score freshness. The homepage stays `force-dynamic` because it renders a personalized greeting based on the auth cookie.

### 2. Object-cache via `unstable_cache`

Supabase reads that are high-traffic and low-mutability are wrapped with `unstable_cache` so repeated invocations within the revalidation window become memoized fetches instead of network round-trips.

Cached data fetchers added/updated in this PR:

- `getPost(slug)` — article body lookup (`tags: ['articles']`, 600 s)
- `getCategory(id)` — article hub lookup (`tags: ['categories']`, 3600 s)
- `getRelated(categoryId, excludeId)` — sidebar related links (`tags: ['articles']`, 600 s)
- `getAuthor(authorId)` — bylines (`tags: ['authors']`, 3600 s)
- `getBearsCategoryIds()` — team→category resolver (`tags: ['categories']`, 86400 s — effectively immutable post-launch)

Existing wrappers (kept):

- `getSlugForAuthorId` in `src/lib/data/authors.ts`

**Not cached on purpose:** authenticated reads (`/admin/*`, `/studio/*`, anything that calls `auth.getUser()`), live game state, anything that mutates as a result of the request.

### 3. Brotli at the edge

Vercel automatically applies Brotli on text/css/js/json/svg responses; no Next.js config change is required. Verification on the staging host:

```sh
# Should return content-encoding: br
curl -sI -H 'Accept-Encoding: br' https://test.sportsmockery.com/ | grep -i content-encoding
curl -sI -H 'Accept-Encoding: br' https://test.sportsmockery.com/_next/static/chunks/main.js | grep -i content-encoding
curl -sI -H 'Accept-Encoding: br' https://test.sportsmockery.com/chicago-bears | grep -i content-encoding
```

Re-run on apex (`https://sportsmockery.com`) after launch.

If a request lands on a non-Vercel hop (e.g. a custom proxy) and Brotli is missing, the next escalation is to set `compress: true` in `next.config.ts` (already on) and confirm no upstream re-compression strips `br`.

## Verifying the gain

- **Local sanity:** `npm run build` then `npm start` — first request to `/home/article/<slug>` populates the cache; immediately repeating the request shows the cached path in server logs (no Supabase fetch trace).
- **Field:** Vercel Analytics → "TTFB by route" panel. Compare 7-day p75 before/after merge.
- **CrUX:** Search Console → Core Web Vitals → TTFB chart.

## What to NOT regress

- Admin and studio routes must remain dynamic — `unstable_cache` must not wrap any reads downstream of `auth.getUser()`.
- Live score routes (`/chicago-*/live`, `/api/bears/games`, etc.) must remain `force-dynamic`.
- `/` (homepage) personalization relies on `force-dynamic` for the auth cookie read.
