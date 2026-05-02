# SEO — Load testing & edge cache validation

Big news moments — Draft night, opening day, a major trade — drive bursty traffic that hits the homepage, RSS feed, and a small handful of trending articles all at once. If the edge cache holds, the experience is fast and Google sees consistent Core Web Vitals. If the edge cache cracks, p95 climbs into the seconds, CWV regresses, and rankings follow on a lag.

This document defines how we validate the edge under spike conditions and how often we re-run that validation.

## Script & tooling

The reusable load test lives at:

- **Script:** [`tests/load/draft-spike.k6.js`](../../tests/load/draft-spike.k6.js)
- **Runbook:** [`tests/load/README.md`](../../tests/load/README.md)

The script uses [k6](https://k6.io). It defines three parallel scenarios (`homepage_browse`, `article_read`, `breaking_news`) that ramp from 0 → 500 VUs each over 7 minutes, with thresholds on p95 latency (<800 ms), error rate (<1%), and homepage cache-hit rate (>95%).

## Post-launch cadence

| Cadence            | What we run                                                  | Why                                                                                  |
|--------------------|--------------------------------------------------------------|--------------------------------------------------------------------------------------|
| **Pre-launch**     | One full run against `test.sportsmockery.com`                | Establish a baseline before public traffic exists. Coordinate with infra in `#sm-infra`. |
| **Quarterly**      | Full run against staging                                     | Catch regressions from accumulated infra and Next.js changes.                        |
| **Pre-event**      | Full run 48 h before Draft, opening day, trade deadline      | Validate cache behavior under the actual content shape that will be live.            |
| **Post-incident**  | Targeted run focused on the affected scenario                | After any p95 regression in production, re-run to confirm the fix held.              |
| **Post-deploy**    | Smoke run (low VU count, 30 s) against staging               | Catch obvious regressions immediately after merging large infra PRs.                 |

## What "passing" means

A run passes if **all three thresholds** in the k6 script hold:

1. p95 response time stays under 800 ms across the full 7-minute run.
2. Error rate stays under 1% (sustained 5xx or network errors above this rate indicate origin saturation).
3. Homepage cache-hit rate (HIT + STALE) stays above 95%.

If any threshold fails, do not deploy or proceed to the event. File an issue tagged `seo` + `infra`, attach the k6 JSON output, and triage in `#sm-infra`. See [`tests/load/README.md`](../../tests/load/README.md) for what each Vercel cache state means and where to look first.

## Pre-launch status

This document is being added before the public launch of sportsmockery.com. The script has not yet been executed against `test.sportsmockery.com` — the first run will happen during the pre-launch readiness window once infra coordinates a quiet period for the test environment.
