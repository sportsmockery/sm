# Load tests

This directory holds [k6](https://k6.io) load tests for sportsmockery.com.

## `draft-spike.k6.js`

Simulates Draft-day traffic: a burst of homepage browsing, deep-link article reads, and aggregator polling against `/api/rss` and `/news-sitemap.xml`.

### Stages

| Phase     | Duration | VUs            |
|-----------|----------|----------------|
| Warm-up   | 1 min    | 0 → 50         |
| Ramp      | 2 min    | 50 → 500       |
| Peak      | 3 min    | 500 (steady)   |
| Ramp-down | 1 min    | 500 → 0        |

Each of the three scenarios (`homepage_browse`, `article_read`, `breaking_news`) follows this curve in parallel, so peak combined load is ~1,500 VUs.

### How to run

> **Pre-launch:** Do not run this against `test.sportsmockery.com` without coordinating with infra. The combined 1,500-VU peak will trigger Vercel's bot-protection and may saturate origin compute. Coordinate a run window in `#sm-infra` first.

Install k6:
```bash
brew install k6           # macOS
sudo apt-get install k6   # Debian / Ubuntu
```

Run against staging:
```bash
k6 run -e BASE_URL=https://test.sportsmockery.com tests/load/draft-spike.k6.js
```

Run against a local dev server (lower VU count for sanity check):
```bash
k6 run -e BASE_URL=http://localhost:3000 \
  --vus 5 --duration 30s \
  tests/load/draft-spike.k6.js
```

Output to JSON for later analysis:
```bash
k6 run -e BASE_URL=https://test.sportsmockery.com \
  --out json=results.json \
  tests/load/draft-spike.k6.js
```

### Thresholds

The script will exit non-zero if any of these are violated:

- **`http_req_duration p(95) < 800ms`** — 95th-percentile response time under 800 ms.
- **`http_req_failed < 1%`** — fewer than 1% of requests return a non-2xx/3xx status.
- **`homepage_cache_hits > 95%`** — more than 95% of homepage responses come back with `x-vercel-cache: HIT` or `STALE`.

### Interpreting results

After a run, k6 prints a summary table. The signals to read first:

| Metric                | What it tells you                                                                 |
|-----------------------|-----------------------------------------------------------------------------------|
| `http_req_duration`   | End-to-end latency. Compare p95 across runs — sudden growth signals a regression. |
| `http_req_failed`     | Non-2xx/3xx ratio. Even a fraction of a percent at peak means real users see errors. |
| `homepage_cache_hits` | Custom metric — fraction of homepage responses served by Vercel's edge cache.     |
| `iteration_duration`  | Time per scenario loop. Useful for spotting backend slowdowns isolated to a route.|

### What "cache hit" means in Vercel terms

Vercel sets the `x-vercel-cache` response header on every edge-served response. The values you'll see:

- **`HIT`** — Served fully from the edge cache. No origin compute, no database calls. This is what we want for the homepage and article pages under spike conditions.
- **`STALE`** — Served from the edge cache while a background revalidation is in flight (Incremental Static Regeneration). Still effectively free; we count this as a "good" cache result.
- **`MISS`** — Not in the edge cache; Vercel went to the origin (Next.js function) to render. A handful of MISSes are expected after a deploy or a cache purge; sustained MISS rates are a problem.
- **`BYPASS`** — Cache was intentionally bypassed (cookie, query param, or response header). On our site this should be near-zero for read-only public pages.
- **`PRERENDER`** — Statically prerendered at build time. Treat the same as HIT.

The `homepage_cache_hits` custom metric counts only `HIT` and `STALE` as a hit. If that rate drops below 95% during a spike, the edge is doing more origin work than it should — investigate cache headers, ISR settings, or cookies inadvertently fragmenting cache keys.

### Updating the article list

`ARTICLE_PATHS` in `draft-spike.k6.js` should reflect a representative mix of recent, popular content. Rotate quarterly. Pick paths that exist in production; missing paths will inflate the error rate metric and obscure real regressions.

### `BUILD_ID` placeholder

The `_next/data/BUILD_ID/...` paths in the script are placeholders. Real `next/data` URLs include the deployed build hash (e.g., `_next/data/abc123.../`). For accurate testing, capture a real build ID from a browser network tab and substitute it before a run, or accept that those subset requests will return 404 and treat the homepage HTML cache hit as the primary signal.
