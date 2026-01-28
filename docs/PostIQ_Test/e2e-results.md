# PostIQ E2E Test Results

**Date:** 2026-01-28
**Target:** https://test.sportsmockery.com
**Framework:** Playwright
**Total Tests:** 96 API-level tests

## Summary

| Category | Passed | Failed | Notes |
|----------|--------|--------|-------|
| Headlines (per team) | 6/6 | 0 | All 5 teams + team selector override |
| Ideas (per team) | 5/5 | 0 | All 5 teams |
| SEO | 7/7 | 0 | `seo` + `generate_seo` + per-team |
| Grammar | 6/6 | 0 | Base + per-team |
| Excerpt | 6/6 | 0 | Base + per-team |
| Analyze Chart | 6/6 | 0 | Base + per-team |
| Generate Chart | 5/5 | 0 | All 5 teams, verified DB persistence |
| Generate Poll | 5/5 | 0 | All 5 teams, verified DB persistence |
| Chart CRUD + Customization | 10/10 | 0 | Create, fetch, line, pie, 5 team themes, delete |
| Poll CRUD + Voting | 5/5 | 0 | Create, fetch results, vote, verify count, delete |
| Consistency Runs (6 actions x 5) | 30/30 | 0 | |
| Full Publish Workflow | 5/5 | 0 | All 5 teams - chart+poll+publish cycle |
| **TOTAL** | **96/96** | **0** | ✅ **ALL PASSING** |

## Bugs Found & Fixed

### BUG 1: POST /api/admin/posts returns 500 ✅ FIXED

**Endpoint:** `POST /api/admin/posts`
**Severity:** Critical — blocked programmatic post creation

**Root cause:** The route was including columns that didn't exist in the `sm_posts` schema cache (e.g., `social_caption`).

**Fix:** Modified the route to only include core columns that definitely exist, and conditionally add optional columns only if they have values.

**Commit:** `f3cc5a19` - "Fix post creation: only include columns that exist in schema"

### BUG 2: GET /api/charts/[id] does not include `id` in response ✅ FIXED

**Fix:** Added `id`, `postId`, `createdAt`, and `updatedAt` fields to the chart GET response.

### BUG 3: analyze_chart returns raw array ✅ FIXED

**Root cause:** The AI sometimes returns a raw array of `{label, value}` objects instead of the documented object shape.

**Fix:** Modified the route to wrap array responses in the expected object format with `shouldCreateChart`, `chartType`, etc.

## Test Validation Details

### PostIQ AI Functions — All Validated

| Function | Response Validation |
|----------|-------------------|
| **headlines** | Array of 3+ strings, each >10 chars |
| **ideas** | Array of objects with `headline` string field |
| **seo** | `seoTitle` (10-80 chars), `metaDescription` (20+ chars) |
| **generate_seo** | Same as seo |
| **grammar** | `correctedContent` string (100+ chars), optional `issues` array |
| **excerpt** | String 30-500 chars |
| **analyze_chart** | Array of `{label, value}` objects |
| **generate_chart** | `success`, `chartId`, `shortcode` matching `[chart:...]`, valid `chartType` |
| **generate_poll** | `success`, `pollId`, `shortcode` matching `[poll:...]`, `question` (10+ chars) |

### Chart Customization — All Validated

- Create bar chart with team colors
- Fetch chart by ID
- Change type: bar -> line (with custom colors + large size)
- Change type: line -> pie
- Change team theme: bears, bulls, cubs, whitesox, blackhawks
- Delete chart

### Poll Lifecycle — All Validated

- Create poll with 5 options
- Fetch results (wrapped in `{results: {poll, options}}`)
- Vote on first option via anonymous ID
- Verify vote count incremented
- Delete poll

## Running the Tests

```bash
# API tests only (no auth needed)
npx playwright test --project=api-tests

# UI tests (requires auth)
TEST_ADMIN_EMAIL=you@example.com TEST_ADMIN_PASSWORD=xxx npx playwright test --project=ui-tests

# All tests
TEST_ADMIN_EMAIL=you@example.com TEST_ADMIN_PASSWORD=xxx npx playwright test
```
