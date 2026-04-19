# Launch Cleanup Plan — Pages, Features & Dead Code to Remove

**Date:** 2026-04-10
**Method:** Git history analysis (last-modified dates), internal link graph analysis (grep for `href=`), and API reference counting.

---

## Summary

| Category | Count | Removable Lines |
|----------|-------|----------------|
| Dead public pages (zero/near-zero links) | 25 page dirs | ~10,100 |
| Dead component directories | 4 dirs | ~6,700 |
| Dead/unused API routes | 5-7 routes | ~1,000 |
| npm packages removable with dead pages | 6 packages | ~1.9MB bundle reduction |
| **Total removable** | | **~16,800 lines** |

---

## TIER 1 — SAFE TO DELETE (zero internal links, no user impact)

These pages have **zero links from any navigation, sidebar, or component** outside their own directory. No user can reach them through normal browsing.

### Dead Public Pages

| Page | Last Modified | Internal Links | What It Is | Verdict |
|------|-------------|----------------|-----------|---------|
| `/ar` | Feb 18 | **0** | AR overlay experiment | DELETE |
| `/ar2` | Feb 18 | **0** | AR v2 experiment | DELETE |
| `/ar3` | Mar 11 | **0** | AR v3 experiment | DELETE |
| `/metaverse` | Mar 11 | **0** | Metaverse portal | DELETE |
| `/collectibles` | Mar 11 | **0** (only from own NFTShowcase component) | NFT/collectibles page | DELETE |
| `/governance` | Mar 11 | **0** (only from own FanSenate component) | Fan governance/senate | DELETE |
| `/home1` | Mar 11 | **0** (only self-referencing) | Old homepage experiment v1 | DELETE |
| `/home2` | Mar 27 | **0** | Old homepage experiment v2 | DELETE |
| `/chicago-bears1` | Mar 11 | **0** (only from bears1 component) | Alternate Bears page experiment | DELETE |
| `/designs/spotlight` | Jan 20 | **0** | Design prototype | DELETE |
| `/designs/immersive` | Mar 11 | **0** | Design prototype | DELETE |
| `/designs/ultimate` | Mar 11 | **0** | Design prototype | DELETE |
| `/designs/river-layout` | Mar 7 | **0** | Design prototype | DELETE |
| `/river` | Mar 7 | **0** | River layout experiment | DELETE |
| `/home/scout` | Feb 16 | **0** | Scout marketing page | DELETE |
| `/home/data` | Mar 27 | **0** | Data marketing page | DELETE |
| `/home/fan-hub` | Mar 27 | **0** | Fan hub marketing page | DELETE |
| `/home/simulators` | Mar 27 | **0** | Simulators marketing page | DELETE |
| `/training` | Apr 10 | **0** | Feature walkthrough (just added, never linked) | KEEP or DELETE |
| `/edge` | Apr 1 | **0** | Edge page | DELETE |
| `/predictions` | Mar 11 | **0** (only from dead AIInsights component) | Predictions page | DELETE |

### Dead Component Directories (only used by dead pages above)

| Directory | Files | Lines | Used Only By | Verdict |
|-----------|-------|-------|-------------|---------|
| `src/components/ar/` | 7 | 1,053 | `/ar`, `/ar2`, `/ar3` pages | DELETE with AR pages |
| `src/components/bears1/` | 9 | 1,723 | `/chicago-bears1` page | DELETE with bears1 page |
| `src/components/home1/` | 8 | 1,981 | `/home1` page | DELETE with home1 page |
| `src/components/homepage-v2/` | 11 | 1,905 | 1 external ref — verify before delete | VERIFY then DELETE |

### Dead Standalone Components (only referenced from dead pages)

Check before deleting — grep each to confirm no live references:

| Component | Referenced From |
|-----------|----------------|
| `src/components/MetaversePortal.tsx` | `/metaverse` only |
| `src/components/FanSenate.tsx` | `/governance` only |
| `src/components/NFTShowcase.tsx` | `/collectibles` only |
| `src/components/AIInsights.tsx` | `/predictions` only |
| `src/components/PredictionCard.tsx` | `/predictions` only |

### npm Packages Removable (only used by dead AR/metaverse/bears1 pages)

| Package | Size (approx) | Used Only By |
|---------|--------------|-------------|
| `three` | ~600KB | AR pages, bears1, metaverse |
| `@react-three/fiber` | ~200KB | Same |
| `@react-three/drei` | ~300KB | Same |
| `@react-three/postprocessing` | ~100KB | Same |
| `@react-three/xr` | ~100KB | Same |
| `@mediapipe/tasks-vision` | ~500KB | AR pages only |
| **Total** | **~1.8MB** | |

**Verify before removing:** `grep -r "from.*three\|@react-three\|@mediapipe" src/ --include="*.tsx" --include="*.ts"` — after deleting dead pages, this should return 0 results.

---

## TIER 2 — REVIEW BEFORE REMOVING (low usage, may have residual value)

### Public Pages with Minimal Links

| Page | Last Modified | Internal Links | What It Is | Recommendation |
|------|-------------|----------------|-----------|----------------|
| `/chat` | Feb 19 | 3 links (FloatingChatButton, FanControlCenter, subscription success) | Old chat page — superseded by `/fan-chat` | **DELETE** — fan-chat is the live version |
| `/datahub` | Mar 11 | 1 link (HomeFooter) | Data hub landing — team datahubs exist at `/{category}/datahub` | **DELETE** if team datahubs are the real product |
| `/vision-theater` | Feb 22 | 1 self-link + home1 link | YouTube/video theater | **DELETE** — `/pinwheels-and-ivy` serves video |
| `/home/premium` | Mar 11 | 1 link | Premium marketing page | **DELETE** — `/pricing` exists |
| `/home/login` | Mar 11 | 10 links | Marketing login page | **REVIEW** — may redirect to `/login`? |
| `/home/signup` | Mar 11 | 2 links | Marketing signup page | **REVIEW** — `/signup` exists |
| `/home/article/[slug]` | Mar 27 | 1 link | Marketing article preview | **DELETE** — articles render at `/{category}/{slug}` |
| `/leaderboard` | Mar 17 | 0 direct links | Leaderboard v1 | **DELETE** if `/leaderboards` is canonical |
| `/leaderboards` | Mar 17 | 0 direct links | Leaderboard v2 | **REVIEW** — which is used by GM? |
| `/game-center` | Mar 16 | 2 links | Game center hub | **REVIEW** — team-specific game-centers exist at `/chicago-{team}/game-center` |

### Duplicate Route Systems

| System A (Active) | System B (Duplicate) | Recommendation |
|-------------------|---------------------|----------------|
| `/chicago-bears/*`, `/chicago-bulls/*`, etc. | `/teams/[team]/*` (roster, schedule, standings, stats) | `/teams/*` has only 6 links — all from `components/teams/` and `components/players/`. **Consolidate to `/chicago-*`** and update those 6 components. |
| `/api/gm/grade` | `/api/v2/gm/grade` | Audit which one the frontend calls. Delete the other. |
| `/api/gm/audit` | `/api/v2/gm/audit` | Same |
| `/api/ask-ai` | `/api/v2/scout/query` | Same |
| `/api/v2/postiq/suggest` | `/api/admin/ai` | Same |

---

## TIER 3 — ADMIN PAGES (keep for internal use, but identify dead weight)

### Admin Pages Linked from Admin Dashboard

The admin dashboard (`/admin/page.tsx`) only links to:
- `/admin/posts` (+ new, by status)
- `/admin/analytics`
- `/admin/writers`
- `/admin/categories`

### Admin Pages NOT Linked from Dashboard Navigation

These are reachable only by direct URL or from within other admin pages:

| Page | Last Modified | Refs | What It Is | Recommendation |
|------|-------------|------|-----------|----------------|
| `/admin/copilot` | Mar 15 | 2 | AI copilot admin | **REVIEW** — is this used? |
| `/admin/perplexity` | Mar 27 | 1 | Perplexity integration | **REVIEW** — active feature? |
| `/admin/bot` | Mar 11 | 1 | Twitter/X bot admin | **REVIEW** — is bot active? |
| `/admin/freestar` | Mar 21 | 3 | Ad revenue dashboard (SPA) | **KEEP** if running ads |
| `/admin/feed-scoring` | Mar 11 | 2 | Feed scoring config | **KEEP** for content ops |
| `/admin/ai-logging` | Mar 11 | 4 | AI query logs | **KEEP** for monitoring |
| `/admin/team-pages-sync` | Mar 11 | 2 | Team data sync admin | **KEEP** for data ops |
| `/admin/exec-dashboard` | Mar 27 | 2 | Executive dashboard | **REVIEW** — is this used by anyone? |
| `/admin/gm-errors` | Mar 11 | 2 | GM error log | **KEEP** for debugging |
| `/admin/user-gm-scoring` | Mar 11 | 2 | User GM scoring admin | **KEEP** if leaderboard is live |
| `/admin/seo` | Mar 27 | **0** | SEO admin | **DELETE** or link it — 0 refs means nobody uses it |
| `/admin/hub` | Mar 27 | 8 | Hub content admin | **KEEP** |
| `/admin/leaderboard` | Mar 17 | 1 | Leaderboard admin | **KEEP** if feature is live |
| `/admin/settings` | Mar 11 | 8 | Site settings | **KEEP** |

---

## TIER 4 — API ROUTES WITH ZERO FRONTEND REFERENCES

| Route | Lines | What It Does | Recommendation |
|-------|-------|-------------|----------------|
| `/api/debug/bulls-schedule` | ~50 | Debug endpoint | **DELETE** — debug code shouldn't ship |
| `/api/debug/cubs-schedule` | ~50 | Debug endpoint | **DELETE** |
| `/api/optimize-image` | 131 | Image optimization | **REVIEW** — may be called from external/build tools |
| `/api/ownership-grades` | 59 | Ownership grades data | **REVIEW** — `/owner` pages may fetch client-side with different path pattern |
| `/api/post-to-x` | 67 | Post to Twitter/X | **REVIEW** — may be called from admin bot system |
| `/api/broker` | 57 | Data broker | **REVIEW** — check if called by DataLab |
| `/api/freestar-revenue` | 73 | Ad revenue data | **REVIEW** — may be called by admin/freestar SPA |

---

## EXECUTION ORDER

### Phase 1: Safe Deletes (30 min, zero risk)

Delete these directories — they have zero external links and zero functional impact:

```
rm -rf src/app/ar src/app/ar2 src/app/ar3
rm -rf src/app/metaverse
rm -rf src/app/collectibles
rm -rf src/app/governance
rm -rf src/app/home1 src/app/home2
rm -rf src/app/chicago-bears1
rm -rf src/app/designs
rm -rf src/app/river
rm -rf src/app/edge
rm -rf src/app/predictions
rm -rf src/app/home/scout src/app/home/data src/app/home/fan-hub src/app/home/simulators
rm -rf src/app/home/premium src/app/home/article
```

Delete dead components:
```
rm -rf src/components/ar
rm -rf src/components/bears1
rm -rf src/components/home1
rm -f src/components/MetaversePortal.tsx
rm -f src/components/FanSenate.tsx
rm -f src/components/NFTShowcase.tsx
rm -f src/components/AIInsights.tsx
rm -f src/components/PredictionCard.tsx
```

Delete debug API routes:
```
rm -rf src/app/api/debug
```

### Phase 2: Remove 3D Packages (5 min, big bundle win)

After Phase 1 deletions, verify no references remain:
```
grep -r "from.*three\|@react-three\|@mediapipe" src/ --include="*.tsx" --include="*.ts"
```

If clean:
```
npm uninstall three @react-three/fiber @react-three/drei @react-three/postprocessing @react-three/xr @mediapipe/tasks-vision
```

### Phase 3: Review Decisions (needs your input)

For each item in Tier 2, you decide: keep or kill.

Key questions:
1. Is `/teams/*` used at all, or should everything go through `/chicago-*`?
2. Is the Twitter bot (`/admin/bot`) active?
3. Is `/admin/exec-dashboard` used by anyone?
4. Which is canonical: `/leaderboard` or `/leaderboards`?
5. Should `/chat` be removed now that `/fan-chat` exists?
6. Should `/home/login` and `/home/signup` redirect to `/login` and `/signup`?
7. Is `/admin/copilot` a live feature?
8. Is `/admin/seo` used? (0 links anywhere)

### Phase 4: Build + Deploy

```bash
npm run build   # verify no broken imports
npm run build-deploy
```

---

## Impact Estimate

| Metric | Before | After Phase 1+2 |
|--------|--------|-----------------|
| page.tsx files | 199 | ~174 |
| Component files | ~600 | ~570 |
| npm bundle (3D libs) | ~1.8MB | **0** |
| Dead code lines | ~16,800 | **0** |
| Build time | baseline | ~10-15% faster (fewer pages to compile) |
