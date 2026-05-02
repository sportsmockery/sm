# Thin-content review process

This is the operating procedure for triaging and resolving thin
articles. There are two phases — pre-launch (what we can do today) and
post-launch (the full Google Search Console-driven workflow).

## Pre-launch: word-count-only triage

We don't have GSC clicks data yet — the property only starts collecting
once the new site is live. So pre-launch we triage on raw word count
alone.

### Run

```bash
npx tsx scripts/thin-content-analysis.ts
# or with a custom floor:
WORD_FLOOR=400 npx tsx scripts/thin-content-analysis.ts
```

The script reads every `published` row from `sm_posts`, parses the
structured `blocks` JSON (or strips HTML from the raw content for
legacy WP imports), and writes
`audit/thin-content-candidates-{date}.csv` listing every article below
the floor (default 300 words), sorted by `published_at` ascending so
the oldest candidates surface first.

The CSV schema:

```
id,slug,article_type,published_at,word_count,title
```

### Editorial action

For each row in the CSV, editorial picks one of:

1. **Expand** — rewrite to clear the per-type word floor (see
   `scripts/flag-thin-articles.ts` for the live thresholds).
2. **Consolidate** — merge into a related, stronger article and
   redirect the thin URL to the survivor (308 in `next.config.ts`).
3. **Remove** — set status to a non-published state and add the URL
   to `LEGACY_GONE_410` in `src/middleware.ts`.

The script is read-only — it does **not** flip
`needs_expansion` / `word_count` columns. That's
`scripts/flag-thin-articles.ts`'s job, run separately when editorial
is ready to commit the verdict.

## Post-launch: GSC clicks-based triage

Once the new site has been live and indexed for at least 28 days the
GSC property has real clicks data. The post-launch workflow:

1. Export GSC Performance → Pages over a 12-month window as CSV.
2. Join the GSC export to `sm_posts.slug` via the URL path. Articles
   with **fewer than 50 clicks in 12 months** are the redirect/expand
   candidates regardless of word count.
3. Apply a two-axis decision matrix:

   | clicks/12mo | word_count | action          |
   | ----------- | ---------- | --------------- |
   | < 50        | < 600      | redirect or 410 |
   | < 50        | ≥ 600      | expand + repromote |
   | ≥ 50        | < 600      | expand          |
   | ≥ 50        | ≥ 600      | leave alone     |

4. Persist the decision in `sm_posts.needs_expansion` /
   `sm_posts.archived_at` and re-run the redirect-map builder so the
   parity diff stays clean.

### Cadence

Run the full workflow monthly for the first quarter post-launch, then
quarterly. The pre-launch script can stay on a weekly schedule
indefinitely as a sanity check that new articles meet the per-type
word floor.

### Cross-references

- `scripts/thin-content-analysis.ts` — this script
- `scripts/flag-thin-articles.ts` — DB-writing flagger with per-type
  floors (`MIN_WORDS`)
- `scripts/build-redirect-map.ts` — builds the redirect map consumed
  by `next.config.ts`; re-run after editorial removes thin URLs so
  the 410 list stays current
