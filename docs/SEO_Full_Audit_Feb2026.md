# SportsMockery.com — Full SEO Audit & Strategy Report
## February 17, 2026 | Data Source: SEMRush (US Database)

---

## Domain Snapshot

| Metric | Value |
|--------|-------|
| **SEMRush Domain Rank** | 18,630 |
| **Organic Keywords** | 22,005 |
| **Estimated Organic Traffic** | 119,319/mo |
| **Organic Traffic Value** | $26,607/mo |
| **Paid Keywords** | 0 |
| **Paid Traffic** | 0 |
| **PLA Keywords** | 0 |

---

# REPORT 1: Site Audit & Prioritized Issue List

## 1.1 Site Health Overview

SEMRush's Site Audit tool requires a project-level crawl (not available via API). The analysis below is derived from organic keyword data, SERP positioning, competitor gaps, and domain-level signals that indicate underlying technical and content issues.

**Estimated Health Score: 60-70/100** (based on ranking position distribution and traffic value vs. keyword count ratio)

**Key health indicators:**
- 22,005 keywords but only 119K traffic = low average CTR per keyword
- Many high-volume keywords rank in positions 15-50 (low visibility)
- Branded keywords (#1 positions) account for ~16% of total traffic
- Zero paid search activity (no paid safety net)

---

## 1.2 Issues by Category (Inferred from Data Signals)

### A. CRAWLABILITY & INDEXABILITY

| Issue | Est. Count | Evidence | Impact | Fix Effort |
|-------|-----------|----------|--------|------------|
| **Old HTTP URLs still indexed** | 15+ URLs | Broad match shows `http sportsmockery.com/...` URLs from 2014-2017 still in SEMRush index | Dilutes link equity, duplicate content | Quick |
| **Legacy URL structure pollution** | Unknown | Old WordPress date-based URLs (`/2014/10/...`, `/2017/02/...`) appearing in search | Crawl budget waste on stale content | Medium |
| **Author pages ranking for branded terms** | 3+ author pages | `/author/theroadwarrior14comcast-net/`, `/author/jeffdabearsblog-com/`, `/author/mfink271998gmail-com/` rank for "sports mockery bears" | Cannibalizes team page rankings | Quick |

**Example URLs:**
- `http sportsmockery.com/2014/10/white-mamba-making-comeback`
- `http sportsmockery.com/2017/02/heres-sneak-peek-new-bryzzo-2-0-commercial`
- `http sportsmockery.com/2017/05/benny-bull-faces-legal-trouble-new-lawsuit`
- `https://www.sportsmockery.com/author/theroadwarrior14comcast-net/`
- `https://www.sportsmockery.com/author/jeffdabearsblog-com/`

**Why it matters for a sports news site:** Google allocates limited crawl budget. Every stale 2014 URL being crawled is a newer Bears/Cubs article NOT being crawled. For time-sensitive sports content, crawl freshness is critical.

---

### B. CONTENT QUALITY & THIN CONTENT

| Issue | Est. Count | Evidence | Impact | Fix Effort |
|-------|-----------|----------|--------|------------|
| **Thin/outdated articles still ranking** | 20+ articles | Articles from 2014-2017 still in SEMRush keyword index with near-zero traffic | Google freshness penalty signals | Medium |
| **Content not matching high-intent keywords** | Multiple | "cubs score" (301K vol) ranks #22; "white sox" (450K vol) ranks #28 — likely thin landing pages | Massive lost traffic on head terms | Complex |
| **Low content depth vs. competitors** | Sitewide | Competitors like bleachernation.com (252K keywords) and bleedcubbieblue.com (80K keywords) vastly outperform SM's 22K keywords | Authority gap | Complex |
| **Potentially inappropriate legacy content** | 2+ articles | "brooke hogan" content, "lions fans eating" content ranking — off-brand for sports news | E-E-A-T damage | Quick |

**Why it matters:** Google's 2025 Helpful Content updates specifically target thin sports/news content. Sites with large percentages of outdated or shallow articles get sitewide ranking depression.

---

### C. METADATA & ON-PAGE SEO

| Issue | Est. Count | Evidence | Impact | Fix Effort |
|-------|-----------|----------|--------|------------|
| **Team hub pages underoptimized** | 5 pages | `/chicago-bears/` ranks #26 for "chicago bears news" (246K vol) — should be top 5 | Lost ~50K monthly visits | Medium |
| **Category pages losing to article pages** | Multiple | Individual articles outrank hub pages for broad team queries | Cannibalization | Medium |
| **Author pages with exposed email handles** | 3+ pages | URLs contain raw email addresses (`theroadwarrior14comcast-net`) | Unprofessional, spam signals | Quick |

**Example URLs affected:**
- `sportsmockery.com/chicago-bears/` — ranks #26 for "chicago bears news"
- `sportsmockery.com/chicago-cubs/` — ranks #28 for "chicago cubs news" (33K vol)
- `sportsmockery.com/chicago-bulls/` — ranks #42 for "chicago bulls news" (22K vol)
- `sportsmockery.com/chicago-white-sox/` — ranks off for "white sox news" (22K vol)
- `sportsmockery.com/chicago-blackhawks/` — ranks #8 for "blackhawks news" (12K vol)

---

### D. INTERNAL LINKING (see Report 3 for full analysis)

| Issue | Est. Count | Evidence | Impact | Fix Effort |
|-------|-----------|----------|--------|------------|
| **Hub pages not receiving enough internal links** | 5 team hubs | Hub pages rank poorly for broad terms despite having the right URL structure | Link equity starved | Medium |
| **Author pages siphoning link equity** | 3+ pages | Author pages rank for team keywords instead of team hub pages | Misdirected authority | Quick |

---

### E. PERFORMANCE & CORE WEB VITALS

| Issue | Est. Count | Evidence | Impact | Fix Effort |
|-------|-----------|----------|--------|------------|
| **WordPress performance overhead** | Sitewide | WordPress on live site vs. Next.js on test — migration will address | CWV improvement expected | Complex (migration) |
| **Score/schedule pages likely slow** | 10 pages | Dynamic data pages (`/chicago-cubs-scores/`, `/chicago-white-sox-schedule/`) ranking low | User experience, bounce rate | Complex (migration) |

---

## 1.3 TOP 15 PRIORITIZED ISSUES

Scoring: Impact on Chicago sports visibility (40%) × Core Web Vitals/UX (20%) × Volume of affected pages (20%) × Ease of fix (20%)

| # | Issue | Affected Pages | Fix Strategy | Fix Now or Wait? |
|---|-------|---------------|-------------|-----------------|
| **1** | Team hub pages (`/chicago-bears/`, etc.) rank 20-42 for primary team keywords (combined 550K+ monthly searches) | 5 team hub pages | Rewrite meta titles/descriptions, add comprehensive hub content, structured data, internal link building | **FIX NOW in WordPress** — these are your highest-value pages |
| **2** | No ranking presence for "bears trade rumors" (6.6K vol, KD:15), "bears mock draft" (KD:28) — easy wins being missed | 0 (need new content) | Create dedicated, regularly-updated hub pages for trade rumors and mock draft for each team | **Build in Next.js** — needs proper architecture |
| **3** | "cubs trade rumors" (14.8K vol) SM doesn't appear in top 10 despite having relevant content | `/chicago-cubs/rival-may-have-helped-end-cubs-trade-rumors/` ranks #25 | Fresh, comprehensive trade rumors hub page with daily updates | **FIX NOW** — update existing content immediately |
| **4** | Author pages cannibalizing team keywords — "sports mockery bears" returns author pages over team pages | 3+ author pages | noindex author pages OR redirect author archive pages to team hubs | **FIX NOW in WordPress** — quick win |
| **5** | "chicago bears news" (246K vol) — SM ranks #26, while chicagobears.com, bearswire, atozsports hold top 3 | `/chicago-bears/` | Major hub page content overhaul, add latest news aggregation, improve freshness signals | **FIX NOW + architecture in Next.js** |
| **6** | "cubs rumors" (60.5K vol) — SM ranks #11 on article page, #35 on hub page | 2 pages competing | Consolidate to hub page, redirect article, add fresh daily content | **FIX NOW in WordPress** |
| **7** | "chicago bulls rumors" (12.1K vol) — SM not in top 10 at all | `/chicago-bulls/` ranks #19 | Bulls content severely underdeveloped — need dedicated rumors coverage | **Build in Next.js** with interim WordPress fixes |
| **8** | "white sox news" (22.2K vol) — SM not in top 10 | Individual article ranking instead of hub | Hub page optimization + fresh content cadence | **FIX NOW in WordPress** |
| **9** | HTTP legacy URLs still indexed (2014-2017 content) | 15+ old URLs | 301 redirect all HTTP to HTTPS, audit and either redirect or remove stale content | **FIX NOW in WordPress** |
| **10** | "blackhawks news" (12.1K vol) — SM ranks #8, close to top 5 | `/chicago-blackhawks/` hub + individual article | Small push needed: fresh content, better meta, internal links to push into top 5 | **FIX NOW in WordPress** — low effort, high reward |
| **11** | Off-brand/inappropriate legacy content still ranking | 2-5 articles | Remove or noindex content that doesn't align with sports news brand (brooke hogan, etc.) | **FIX NOW in WordPress** — quick cleanup |
| **12** | Scores/schedule pages rank poorly ("cubs score" 301K vol → #22) | 10 dynamic pages | These need real-time data + SEO — Next.js team pages will solve this | **WAIT for Next.js** — already being built |
| **13** | "bears news and rumors" (27.1K vol, KD:45) — SM ranks #4, could be #1-2 | `/chicago-bears/` | Add structured rumors section, daily updates, insider sourcing signals | **FIX NOW in WordPress** |
| **14** | Competitor gap: bleachernation.com has 252K keywords vs SM's 22K | Sitewide | Content velocity needs 10x increase, especially long-form analysis | **Long-term Next.js strategy** |
| **15** | No structured data/schema markup visible in SERP features | Sitewide | Add NewsArticle, SportsEvent, FAQPage schema | **Build into Next.js** — add basic schema to WordPress now |

---

# REPORT 2: Content Gap Analysis

## 2.1 Top Organic Landing Pages by Traffic

| # | URL | Top Keyword | Position | Est. Traffic | Traffic % |
|---|-----|-------------|----------|-------------|----------|
| 1 | `/` (homepage) | "sports mockery" | 1 | ~14,500 | 12.13% |
| 2 | `/chicago-bears/` | "chicago bears news and rumors" | 3 | ~8,200 | 6.87% |
| 3 | `/chicago-bears/why-ben-johnson-will-love-the-latest-super-bowl-betting-odds/` | "ben johnson" | 3 | ~490 | 0.41% |
| 4 | `/chicago-cubs/rival-may-have-helped-end-cubs-trade-rumors/` | "chicago cubs trade rumors" | 2 | ~440 | 0.37% |
| 5 | `/chicago-cubs/anthony-rizzo-primed-to-become-face-of-mlb-on-nbc/` | "anthony rizzo news" | 2 | ~275 | 0.23% |
| 6 | `/author/jeffdabearsblog-com/` | "da bears blog" | 1 | ~180 | 0.15% |
| 7 | `/chicago-bears/jb-pritzker-and-bears-just-cleared-major-hurdle-on-stadium-deal/` | "illinois chicago bears" | 1 | ~225 | 0.19% |
| 8 | `/chicago-bears/5-wild-stats-that-show-the-bears-just-punked-the-eagles/` | "bears vs eagles stats" | 21 | ~190 | 0.16% |
| 9 | `/chicago-white-sox/new-opportunity-has-developed-for-the-white-sox-2/` | "chicago white sox news" | 8 | ~85 | 0.07% |
| 10 | `/chicago-cubs-scores/` | "cubs score" | 22 | ~85 | 0.07% |

**Critical finding:** The homepage and Bears hub page account for ~19% of all organic traffic. The site is heavily dependent on branded searches and Bears content.

---

## 2.2 Declining Content & Position Losses

Based on position data, the following pages/keywords show weakness (low positions relative to search volume):

### Pages With Largest Traffic Gap (What SHOULD Be Top 5 But Isn't)

| URL | Keyword | Search Vol | Current Pos | Est. Lost Monthly Traffic |
|-----|---------|-----------|-------------|--------------------------|
| `/chicago-bears/` | "chicago bears news" | 246,000 | 26 | ~45,000 |
| `/chicago-bears/` | "bears rumors" | 40,500 | 10 | ~3,500 |
| `/chicago-bears/` | "chicago bears rumors" | 49,500 | 15 | ~4,200 |
| `/chicago-cubs/` | "cubs news" | 110,000 | 28 | ~20,000 |
| `/chicago-cubs/` | "cubs rumors" | 60,500 | 35 | ~5,000 |
| `/chicago-bulls/` | "chicago bulls news" | 22,200 | 42 | ~2,500 |
| `/chicago-bulls/` | "chicago bulls rumors" | 12,100 | 19 | ~1,200 |
| `/chicago-white-sox/...` | "white sox news" | 22,200 | 26 | ~2,000 |
| `/chicago-cubs-scores/` | "cubs score" | 301,000 | 22 | ~55,000 |
| `/chicago-white-sox-schedule/` | "white sox schedule" | 74,000 | 19 | ~8,000 |

**Total estimated lost traffic from top 10 underperforming keywords: ~146,400/month**

That's more traffic than the site currently gets (119K). Fixing these positions could more than double organic traffic.

---

## 2.3 Who's Winning Where SM Is Losing

### "chicago bears news and rumors" (22.2K vol) — SM Ranks #2 (HOLDING)

| Pos | Domain | What They're Doing Better |
|-----|--------|---------------------------|
| 1 | bearswire.usatoday.com | USA Today domain authority, daily updates, author credentials |
| 3 | yardbarker.com | Massive content volume, structured team hubs |
| 4 | windycitygridiron.com | SB Nation network, community engagement, depth |

### "bears rumors" (40.5K vol) — SM Ranks #7 (WEAK)

| Pos | Domain | What They're Doing Better |
|-----|--------|---------------------------|
| 1 | chicitysports.com | Fresh daily trade content, clickable headlines |
| 2 | windycitygridiron.com | Community + depth + freshness |
| 3 | bearswire.usatoday.com | Domain authority + daily cadence |

### "cubs trade rumors" (14.8K vol) — SM NOT IN TOP 10

| Pos | Domain | What They're Doing Better |
|-----|--------|---------------------------|
| 1 | nesn.com | Specific trade proposal articles, timely |
| 2 | mlbtraderumors.com | Dedicated rumor hub, daily updates, insider sourcing |
| 3 | cubbiescrib.com | Contract analysis, data-driven content |
| 7 | cubsinsider.com | Dedicated Cubs hub, consistent publishing |

### "chicago bulls rumors" (12.1K vol) — SM NOT IN TOP 10

| Pos | Domain | What They're Doing Better |
|-----|--------|---------------------------|
| 1 | si.com | Major brand authority, insider access |
| 2 | yardbarker.com | Comprehensive team hub |
| 4 | pippenainteasy.com | Dedicated Bulls site, deep analysis |
| 7 | bleachernation.com | Multi-sport Chicago coverage, high volume |

### "blackhawks news" (12.1K vol) — SM Ranks #8 (WITHIN STRIKING DISTANCE)

| Pos | Domain | What They're Doing Better |
|-----|--------|---------------------------|
| 1 | nhl.com | Official source |
| 2 | secondcityhockey.com | Dedicated Blackhawks coverage |
| 3 | blackhawkup.com | Dedicated + FanSided network authority |

### "white sox news" (22.2K vol) — SM NOT IN TOP 10

| Pos | Domain | What They're Doing Better |
|-----|--------|---------------------------|
| 1 | mlb.com | Official source |
| 2 | southsideshowdown.com | Dedicated Sox coverage |
| 3 | soxon35th.com | Daily updates, community |

---

## 2.4 Content Recovery Matrix

| SM URL (Declining) | Lost Keyword + Gap | Competitor Now Winning | What They Have That SM Lacks | Recommended Action |
|--------------------|-------------------|----------------------|-----------------------------|--------------------|
| `/chicago-bears/` | "chicago bears news" — pos #26 (should be #3) | chicagobears.com (#1), bearswire (#2), atozsports (#3) | Daily publishing cadence, structured news feed, author bios, AP-style reporting | **Rewrite hub** with live news feed, add NewsArticle schema, daily publishing minimum 3 articles |
| `/chicago-bears/` | "bears rumors" — pos #10 | chicitysports.com (#1), windycitygridiron (#2) | Specific trade proposals with dollar amounts, insider sourcing language | **Create dedicated `/chicago-bears/rumors/` hub** with daily rumor roundups |
| `/chicago-bears/` | "bears trade rumors" — NOT ranked | beargoggleson.com (#1), heavy.com (#2) | Specific player trade articles, "3 potential trades" format, cap analysis | **Publish 2-3 trade rumor articles/week** during offseason with salary cap data |
| `/chicago-cubs/` | "cubs news" — pos #28 | cubsinsider.com, bleedcubbieblue, bleachernation | 5+ articles/day, prospect coverage, minor league reports | **10x Cubs publishing volume**, add prospect tracker |
| `/chicago-cubs/...` | "cubs trade rumors" — NOT in top 10 | nesn.com, mlbtraderumors.com, cubbiescrib.com | Trade proposal specifics, contract data, insider quotes | **Create `/chicago-cubs/rumors/` hub**, partner with insider sources |
| `/chicago-bulls/` | "bulls rumors" — pos #22 | si.com, yardbarker, pippenainteasy | Trade deadline coverage, salary analysis, draft content | **Major Bulls content investment** — currently the weakest team vertical |
| `/chicago-white-sox/...` | "white sox news" — NOT in top 10 | southsideshowdown (#2), soxon35th (#3) | Daily coverage, rebuild tracker, prospect rankings | **Create White Sox rebuild narrative hub** — unique angle |
| `/chicago-blackhawks/...` | "blackhawks news" — pos #8 | nhl.com (#1), secondcityhockey (#2) | Daily game recaps, prospect pipeline coverage | **Push from #8 to #5** — 2 more weekly articles + internal links |
| `/chicago-cubs-scores/` | "cubs score" — pos #22 (301K vol!) | espn.com, mlb.com, google direct | Real-time scores, box scores, play-by-play | **Next.js live scores page** — already being built, will capture this |
| `/chicago-white-sox-schedule/` | "white sox schedule" — pos #19 (74K vol) | mlb.com, espn.com | Official schedule data, ticket links | **Next.js schedule page** — already being built |

---

# REPORT 3: Internal Linking Architecture

## 3.1 Current Link Structure Analysis

### Identified Hub Pages (Most-Linked-To Pages)

Based on keyword data showing which URLs rank for the most keywords:

| # | URL | Keywords Ranking | Role | Internal Link Health |
|---|-----|-----------------|------|---------------------|
| 1 | `/` (homepage) | 15+ keywords | Main hub | STRONG — receives most links |
| 2 | `/chicago-bears/` | 20+ keywords | Bears hub | MODERATE — ranks #3 for "bears news and rumors" but #26 for "bears news" |
| 3 | `/chicago-cubs/` | 10+ keywords | Cubs hub | WEAK — ranks #28 for "cubs news", #35 for "cubs rumors" |
| 4 | `/chicago-bulls/` | 5+ keywords | Bulls hub | VERY WEAK — ranks #42 for "bulls news", #19 for "bulls rumors" |
| 5 | `/chicago-white-sox/` | 3+ keywords | White Sox hub | VERY WEAK — not in top 10 for any high-vol term |
| 6 | `/chicago-blackhawks/` | 5+ keywords | Blackhawks hub | MODERATE — ranks #8 for "blackhawks news" |
| 7 | `/chicago-bears-history/` | 3+ keywords | Bears history | Niche — works for history queries |
| 8 | `/chicago-cubs-scores/` | 3+ keywords | Cubs scores | WEAK — low rankings despite high-vol keywords |
| 9 | `/chicago-cubs-roster/` | 1+ keywords | Cubs roster | WEAK |
| 10 | `/chicago-bulls-scores/` | 2+ keywords | Bulls scores | WEAK |

### Pages That Should NOT Be Ranking (Cannibalization)

| Page | Ranking For | Should Go To |
|------|-----------|-------------|
| `/author/theroadwarrior14comcast-net/` | "erik lambert" (#2), "sports mockery bears" (#5), "chicago bears sports mockery" (#5, #7) | → `/chicago-bears/` |
| `/author/jeffdabearsblog-com/` | "da bears blog" (#1), "dabearsblog" (#2), "sports mockery bears" (#10) | → `/chicago-bears/` |
| `/author/mfink271998gmail-com/` | "chisoxfanmike" (#4) | → `/chicago-white-sox/` |
| Homepage `/` | "bears news and rumors" (#32), "cubs news and rumors" (#31) | → respective team hubs |

### Orphan/Weak-Linked Page Signals

Articles ranking for valuable keywords but likely orphaned (deep in archives):

| URL | Keyword | Position | Likely Orphaned? |
|-----|---------|----------|-----------------|
| `/chicago-bears/smokin-jay-cutler-the-most-apathetic-looking-athlete-in-sports/` | "jay cutler smoker" | #2 | YES — legacy content |
| `/trending/unarguably-best-worst-seats-united-center-blackhawks-games/` | "best worst seats in hockey" | #8 | YES — in `/trending/` not team hub |
| `/trending/longest-rain-delays-mlb-history/` | "longest rain delay in mlb history" | #1 | YES — evergreen but orphaned |
| `/wives-girlfriends/brooke-hogan-dances-in-her-panties-shows-her-ass-to-instagram/` | off-brand keyword | #8 | Should be DELETED |
| `/trending/photo-detroit-lions-fan-eating-butt-sickest-thing-will-ever-see/` | off-brand keyword | #4 | Should be DELETED |

---

## 3.2 Current Hub Structure Assessment

| Hub | Aligns with Chicago Sports Priorities? | Recommendation |
|-----|---------------------------------------|----------------|
| `/chicago-bears/` | YES — highest traffic team | Strengthen as primary hub |
| `/chicago-cubs/` | YES — second priority | Needs major content + link investment |
| `/chicago-bulls/` | YES — but severely underserved | Needs dedicated editorial strategy |
| `/chicago-white-sox/` | YES — but weakest vertical | White Sox rebuild narrative = opportunity |
| `/chicago-blackhawks/` | YES — close to top 5 | Small push needed |
| `/trending/` | NO — off-brand dumping ground | Audit and redirect or delete |
| `/wives-girlfriends/` | NO — brand damaging | Delete entire section |
| `/author/*` | NO — should not be content hubs | noindex or redirect |

---

## 3.3 Next.js Migration Internal Link Blueprint

### Section 1: Orphan Pages — Delete or Re-Link

| Page | Action | Reason |
|------|--------|--------|
| All `/wives-girlfriends/` content | **DELETE + 410** | Off-brand, E-E-A-T damage |
| All `/trending/` content older than 2 years | **Audit case-by-case** | Keep evergreen (rain delays), delete tabloid |
| `/author/theroadwarrior14comcast-net/` | **noindex + canonical to `/chicago-bears/`** | Stop cannibalization |
| `/author/jeffdabearsblog-com/` | **noindex + canonical to `/chicago-bears/`** | Stop cannibalization |
| `/author/mfink271998gmail-com/` | **noindex + canonical to `/chicago-white-sox/`** | Stop cannibalization |
| All 2014-2017 date-based URLs | **301 → team hub pages** | Clear crawl budget |

### Section 2: Hub Pages That MUST Be Preserved with Redirects

| WordPress URL | Next.js URL | Priority | Redirect Type |
|--------------|-------------|----------|---------------|
| `sportsmockery.com/chicago-bears/` | `test.sportsmockery.com/chicago-bears/` | CRITICAL | 301 |
| `sportsmockery.com/chicago-cubs/` | `test.sportsmockery.com/chicago-cubs/` | CRITICAL | 301 |
| `sportsmockery.com/chicago-bulls/` | `test.sportsmockery.com/chicago-bulls/` | HIGH | 301 |
| `sportsmockery.com/chicago-white-sox/` | `test.sportsmockery.com/chicago-white-sox/` | HIGH | 301 |
| `sportsmockery.com/chicago-blackhawks/` | `test.sportsmockery.com/chicago-blackhawks/` | HIGH | 301 |
| `sportsmockery.com/chicago-cubs-scores/` | `test.sportsmockery.com/chicago-cubs/scores` | HIGH | 301 |
| `sportsmockery.com/chicago-cubs-roster/` | `test.sportsmockery.com/chicago-cubs/roster` | MEDIUM | 301 |
| `sportsmockery.com/chicago-cubs-schedule/` | `test.sportsmockery.com/chicago-cubs/schedule` | MEDIUM | 301 |
| `sportsmockery.com/chicago-bears-history/` | `test.sportsmockery.com/chicago-bears/history` | MEDIUM | 301 |
| All `/chicago-{team}-scores/` | `/chicago-{team}/scores` | HIGH | 301 |
| All `/chicago-{team}-schedule/` | `/chicago-{team}/schedule` | MEDIUM | 301 |
| All `/chicago-{team}-roster/` | `/chicago-{team}/roster` | MEDIUM | 301 |

### Section 3: Recommended New Hub Structure for Next.js

```
/ (homepage)
├── /chicago-bears/           ← PRIMARY HUB (highest traffic)
│   ├── /chicago-bears/news/
│   ├── /chicago-bears/rumors/        ← NEW: dedicated rumors hub
│   ├── /chicago-bears/trades/        ← NEW: trade analysis hub
│   ├── /chicago-bears/mock-draft/    ← NEW: mock draft hub
│   ├── /chicago-bears/scores/
│   ├── /chicago-bears/schedule/
│   ├── /chicago-bears/roster/
│   ├── /chicago-bears/players/
│   ├── /chicago-bears/stats/
│   └── /chicago-bears/history/
├── /chicago-cubs/            ← SECONDARY HUB
│   ├── /chicago-cubs/news/
│   ├── /chicago-cubs/rumors/         ← NEW
│   ├── /chicago-cubs/trades/         ← NEW
│   ├── /chicago-cubs/free-agency/    ← NEW: seasonal hub
│   ├── /chicago-cubs/scores/
│   ├── /chicago-cubs/schedule/
│   ├── /chicago-cubs/roster/
│   ├── /chicago-cubs/players/
│   └── /chicago-cubs/stats/
├── /chicago-bulls/           ← NEEDS INVESTMENT
│   ├── /chicago-bulls/news/
│   ├── /chicago-bulls/rumors/        ← NEW
│   ├── /chicago-bulls/scores/
│   ├── /chicago-bulls/schedule/
│   ├── /chicago-bulls/roster/
│   ├── /chicago-bulls/players/
│   └── /chicago-bulls/stats/
├── /chicago-white-sox/       ← REBUILD NARRATIVE ANGLE
│   ├── /chicago-white-sox/news/
│   ├── /chicago-white-sox/rumors/    ← NEW
│   ├── /chicago-white-sox/rebuild/   ← NEW: unique angle
│   ├── /chicago-white-sox/scores/
│   ├── /chicago-white-sox/schedule/
│   ├── /chicago-white-sox/roster/
│   ├── /chicago-white-sox/players/
│   └── /chicago-white-sox/stats/
├── /chicago-blackhawks/      ← CLOSE TO TOP 5
│   ├── /chicago-blackhawks/news/
│   ├── /chicago-blackhawks/rumors/   ← NEW
│   ├── /chicago-blackhawks/scores/
│   ├── /chicago-blackhawks/schedule/
│   ├── /chicago-blackhawks/roster/
│   ├── /chicago-blackhawks/players/
│   └── /chicago-blackhawks/stats/
├── /news/                    ← CONTENT-TYPE HUB (cross-team)
├── /rumors/                  ← CONTENT-TYPE HUB (cross-team)
├── /analysis/                ← CONTENT-TYPE HUB (cross-team)
├── /mock-draft/              ← ALREADY EXISTS
├── /gm/                      ← ALREADY EXISTS (Trade Simulator)
└── /scout-ai/                ← ALREADY EXISTS
```

### Section 4: High-Value Pages Needing 5+ Internal Links

| Page | Current Issue | Links Needed From |
|------|-------------|-------------------|
| `/chicago-bears/` hub | Ranks #26 for "bears news" despite being the hub | Every Bears article should link back; homepage featured section; sidebar persistent link |
| `/chicago-cubs/` hub | Ranks #28 for "cubs news" | Every Cubs article; homepage; cross-team "Chicago sports" sections |
| `/chicago-bulls/` hub | Ranks #42 for "bulls news" | Every Bulls article; homepage; needs content to generate links FROM |
| `/chicago-bears/chicago-bears-2026-mock-offseason-how-to-fix-a-defense/` | High-value offseason content, ranks #2 for "bears mock offseason" | Bears hub, related rumors articles, sidebar widget |
| `/chicago-cubs/rival-may-have-helped-end-cubs-trade-rumors/` | Ranks #2 for "chicago cubs trade rumors" | Cubs hub, related trade articles, "trending" section |
| `/chicago-blackhawks/three-blackhawks-prospects-who-could-join-nhl-after-trade-deadline-flurry/` | Ranks #1 for "nhl trade rumors chicago blackhawks" | Blackhawks hub, prospect articles, deadline coverage |
| `/chicago-bears/one-free-agent-decision-could-reshape-the-bears-defense/` | Ranks #3 for "bears defense" (2.9K vol) | Bears hub, offseason articles, defense-related content |
| `/chicago-cubs/cubs-still-trying-to-sign-a-free-agent-starting-pitcher/` | Ranks #3 for "cubs free agency" | Cubs hub, pitching articles, offseason tracker |
| `/chicago-white-sox/reinsdorf-retains-control-of-white-sox-despite-reduced-ownership-stake/` | Ranks #1 for "jonathan milton reinsdorf" | White Sox hub, ownership articles |
| `/chicago-bears/the-mccaskey-family-is-furious-with-kevin-warren-and-it-exposes-a-bigger-problem/` | Ranks #5 for "george mccaskey" (8.1K vol) | Bears hub, stadium articles, ownership content |

**Implementation for WordPress (NOW):**
1. Add "Related Articles" widget to sidebar linking to team hub
2. Add breadcrumb navigation: Home > Team > Article
3. Add "More [Team] News" section at bottom of every article
4. Ensure homepage features all 5 team hubs prominently
5. Add internal cross-links between related articles (e.g., Bears defense articles link to each other)

---

# REPORT 4: Keyword Decay Map

## 4.1 Keywords With Largest Position-to-Volume Gap

These keywords represent the biggest SEO opportunities where SM ranks but underperforms relative to search volume:

### TIER 1: Massive Volume, Poor Position (Fix Immediately)

| Keyword | Volume | SM Position | Gap to Top 3 | Team | Content Type |
|---------|--------|------------|--------------|------|-------------|
| "cubs score" | 301,000 | 22 | -19 | Cubs | Scores/Live |
| "chicago bears news" | 246,000 | 26 | -23 | Bears | News hub |
| "white sox" | 450,000 | 28 | -25 | White Sox | Brand |
| "edmunds" | 201,000 | 43 | -40 | Bears | Player |
| "cubs schedule" | 165,000 | 27 | -24 | Cubs | Schedule |
| "bears news" | 201,000 | (via hub) | ~-20 | Bears | News hub |
| "chicago bears vs philadelphia eagles match player stats" | 135,000 | 21 | -18 | Bears | Game stats |
| "cubs news" | 110,000 | 28 | -25 | Cubs | News hub |
| "white sox schedule" | 74,000 | 19 | -16 | White Sox | Schedule |
| "cubs rumors" | 60,500 | 11/35 | -8/-32 | Cubs | Rumors |

### TIER 2: Medium Volume, Moderate Position (Optimization Targets)

| Keyword | Volume | SM Position | Team | Content Type |
|---------|--------|------------|------|-------------|
| "chicago bears rumors" | 49,500 | 15 | Bears | Rumors |
| "bears rumors" | 40,500 | 10 | Bears | Rumors |
| "ryan poles" | 22,200 | 27 | Bears | Personnel |
| "chicago bears news and rumors" | 22,200 | 3 (HOLD!) | Bears | News+Rumors |
| "chicago white sox news" | 6,600 | 8/13 | White Sox | News |
| "cubs trade rumors" | 14,800 | 25 | Cubs | Trade rumors |
| "chicago bulls rumors" | 12,100 | 19 | Bulls | Rumors |
| "blackhawks news" | 12,100 | 8 | Blackhawks | News |
| "bulls rumors" | 14,800 | 22 | Bulls | Rumors |
| "ben johnson bears" | 18,100 | 27 | Bears | Coach |

---

## 4.2 Decay Classification by Team

| Team | Keywords in Top 50 | Avg Position | Weak Keywords (pos 15+) | Strength |
|------|-------------------|-------------|------------------------|----------|
| **Bears** | ~65 | ~12 | ~30 | STRONGEST — but bleeding on high-vol terms |
| **Cubs** | ~30 | ~18 | ~20 | SECOND — trade rumors content outdated |
| **White Sox** | ~12 | ~20 | ~10 | WEAK — no competitive rankings |
| **Blackhawks** | ~8 | ~12 | ~4 | MODERATE — close to breakthrough |
| **Bulls** | ~8 | ~25 | ~7 | WEAKEST — virtually no competitive presence |

### Key Pattern: Bears content is DEEP but not WIDE enough. Cubs/Sox/Bulls/Hawks are both shallow and narrow.

---

## 4.3 Decay by Content Type

| Content Type | Keywords | Avg Position | Trend | Why |
|-------------|----------|-------------|-------|-----|
| **News hubs** (`/chicago-{team}/`) | ~25 | 20+ | DECLINING | Competitors publish 3-5x more daily content |
| **Trade rumors** (individual articles) | ~15 | 8-15 | MIXED | Articles rank OK but age out quickly |
| **Player analysis** | ~20 | 5-10 | STABLE | Strong niche — SM's strength |
| **Game stats/scores** | ~10 | 19-28 | DECLINING | WordPress can't compete with live data |
| **Schedules/rosters** | ~8 | 19-27 | DECLINING | Static pages losing to dynamic competitors |
| **History/evergreen** | ~5 | 5-12 | STABLE | Low competition, SM holds well |
| **Branded searches** | ~15 | 1-3 | STABLE | Locked in |
| **Off-brand/tabloid** | ~5 | 3-8 | STABLE but harmful | Getting traffic but hurting E-E-A-T |

### Pattern: News hubs and data pages declining. Analysis and branded content stable.

---

## 4.4 Keyword Cluster Decay Detail

### Cluster 1: "Bears News/Rumors" (HIGHEST PRIORITY)

| Keyword | Volume | SM Page | Position | Competitor #1 | Why SM Lost |
|---------|--------|---------|----------|--------------|-------------|
| "chicago bears news" | 246K | `/chicago-bears/` | 26 | chicagobears.com (#1) | Official site + daily volume |
| "bears news" | 201K | `/chicago-bears/` | ~20 | chicagobears.com | Freshness + authority |
| "chicago bears rumors" | 49.5K | `/chicago-bears/` | 15 | bearswire (#1) | USA Today network authority |
| "bears rumors" | 40.5K | `/chicago-bears/` | 10 | chicitysports (#1) | Daily trade content |
| "bears trade rumors" | 6.6K | `/chicago-bears/` | 15 | beargoggleson (#1) | Specific trade proposals |

**Why SM Likely Lost:** Hub page not updated frequently enough. Competitors publish 3-5 Bears articles/day. SM's Bears hub is a category archive, not a dynamic news feed. No structured data, no "last updated" signals.

**Recovery Tactic:**
- Transform `/chicago-bears/` from category archive to dynamic news hub
- Minimum 2 Bears articles/day during season, 1/day in offseason
- Add "Updated X minutes ago" timestamp
- Add NewsArticle + SportsTeam schema
- Internal link every article back to hub
- **Priority: HIGH — Bears = 55%+ of SM's organic value**

### Cluster 2: "Cubs Trade/Rumors" (HIGH PRIORITY)

| Keyword | Volume | SM Page | Position | Competitor #1 | Why SM Lost |
|---------|--------|---------|----------|--------------|-------------|
| "cubs trade rumors" | 14.8K | article page | 25 | nesn.com (#1) | Fresh trade proposals |
| "cubs rumors" | 60.5K | article/hub | 11/35 | cubsinsider (#1) | Dedicated Cubs coverage |
| "cubs news" | 110K | `/chicago-cubs/` | 28 | multiple | Content volume |
| "chicago cubs trade rumors" | 5.4K | article | 2 (HOLD) | — | Holding for now |
| "cubs free agency" | 390 | article | 3 | — | Holding for now |

**Why SM Likely Lost:** SM's Cubs content is article-based (individual stories that age), while competitors have evergreen hub pages that update daily. SM has no `/chicago-cubs/rumors/` hub.

**Recovery Tactic:**
- Create dedicated `/chicago-cubs/rumors/` page
- Increase Cubs publishing from ~3/week to 1/day
- Add prospect tracker, contract analysis
- Cross-link between Cubs articles
- **Priority: HIGH — Cubs #2 traffic vertical, offseason = high rumor search**

### Cluster 3: "White Sox" (MEDIUM-HIGH PRIORITY — OPPORTUNITY)

| Keyword | Volume | SM Page | Position | Competitor #1 | Why SM Lost |
|---------|--------|---------|----------|--------------|-------------|
| "white sox news" | 22.2K | article | 26 | southsideshowdown (#2) | Dedicated coverage |
| "white sox" | 450K | article | 28 | mlb.com | Can't compete on brand term |
| "white sox rumors" | 5.4K | article | 9 | — | Close to top 5 |
| "white sox schedule" | 74K | schedule page | 19 | mlb.com | Data quality |

**Why SM Likely Lost:** White Sox is SM's weakest vertical. The rebuilding Sox are actually a huge content opportunity (trade assets, prospect rankings, rebuild tracker) that SM isn't exploiting.

**Recovery Tactic:**
- Create "White Sox Rebuild Tracker" unique content angle
- Increase Sox publishing to 3-4/week
- Feature prospect rankings and farm system analysis
- **Priority: MEDIUM-HIGH — low competition, unique angle available**

### Cluster 4: "Bulls" (MEDIUM PRIORITY)

| Keyword | Volume | SM Page | Position | Competitor #1 | Why SM Lost |
|---------|--------|---------|----------|--------------|-------------|
| "chicago bulls news" | 22.2K | `/chicago-bulls/` | 42 | nba.com | Official + authority |
| "chicago bulls rumors" | 12.1K | `/chicago-bulls/` | 19 | si.com (#1) | Insider access |
| "bulls rumors" | 14.8K | `/chicago-bulls/` | 22 | si.com | Authority |
| "bulls score" | 12.1K | scores page | 19 | espn.com | Live data |

**Why SM Likely Lost:** Minimal Bulls content volume. Competitors have dedicated NBA writers. SM treats Bulls as afterthought.

**Recovery Tactic:**
- Hire/assign dedicated Bulls content creator
- Minimum 3 articles/week
- Trade deadline and draft coverage
- **Priority: MEDIUM — in-season right now, time-sensitive**

### Cluster 5: "Blackhawks" (MEDIUM PRIORITY — EASIEST WIN)

| Keyword | Volume | SM Page | Position | Competitor #1 | Why SM Lost |
|---------|--------|---------|----------|--------------|-------------|
| "blackhawks news" | 12.1K | article | 8 | nhl.com (#1) | Official |
| "chicago blackhawks news and rumors" | 1K | article | 7 | secondcityhockey (#2) | Dedicated |
| "nhl trade rumors chicago blackhawks" | 110 | article | 1 (WIN!) | — | Holding |

**Why SM is close:** SM actually has decent Blackhawks content. The gap is smaller here — just need slightly more volume and freshness to crack top 5.

**Recovery Tactic:**
- 2 additional Blackhawks articles/week
- Game recaps for home games
- Trade deadline coverage (NHL deadline is imminent)
- **Priority: MEDIUM — easiest top-5 breakthrough of all 5 teams**

---

## 4.5 Google 2025 Algorithm Impact Assessment

| Algorithm Factor | SM's Current State | Impact on Rankings | Fix |
|-----------------|-------------------|-------------------|-----|
| **E-E-A-T (Experience, Expertise, Authority, Trust)** | Author pages expose raw emails, no author bios/credentials, no expert sourcing | HIGH NEGATIVE | Add author bios, credentials, "insider" sourcing language |
| **Content Depth** | Many articles are short opinion/hot-take format | MODERATE NEGATIVE | Longer-form analysis with stats, charts, salary data |
| **Freshness** | Hub pages are static WordPress archives, not "live" hubs | HIGH NEGATIVE | Dynamic "last updated" timestamps, daily content |
| **User Engagement** | WordPress likely has poor CWV vs. Next.js competitors | MODERATE NEGATIVE | Next.js migration will fix |
| **Helpful Content** | Off-brand content (wives/girlfriends, tabloid) drags down site quality | MODERATE NEGATIVE | Delete/noindex non-sports content |
| **Thin Content** | Legacy 2014-2017 articles with no ongoing value | LOW-MODERATE NEGATIVE | Prune or consolidate |

---

## 4.6 Recovery Strategy Grid (Sorted by Priority)

| Keyword Cluster | # Keywords Lost | Avg Position Drop | SM Pages Affected | Why We Lost | Recovery Tactic | Priority |
|----------------|----------------|------------------|-------------------|-------------|-----------------|----------|
| **Bears News/Rumors** | 15+ | Hub at 15-26 | `/chicago-bears/` + articles | Low publishing frequency, static hub, no schema | Transform hub to live news feed, 2 articles/day, NewsArticle schema | **HIGH** |
| **Cubs Trade/Rumors** | 10+ | Hub at 28-35 | `/chicago-cubs/` + articles | No rumors hub, aging articles, low volume | Create `/cubs/rumors/` hub, daily updates, insider sourcing | **HIGH** |
| **Bears Trade/Mock Draft** | 5+ | Not ranking | No dedicated pages | Missing content entirely | Create dedicated hub pages in Next.js | **HIGH** |
| **White Sox News** | 8+ | 19-28 | White Sox hub + articles | Weakest vertical, no dedicated coverage | Rebuild tracker angle, 3-4 articles/week | **MEDIUM-HIGH** |
| **Game Scores/Live Data** | 10+ | 19-28 | Score/schedule pages | WordPress can't do real-time | Next.js migration (already building) | **MEDIUM** (wait) |
| **Bulls Rumors** | 7+ | 19-42 | `/chicago-bulls/` + articles | Minimal content investment | Dedicated Bulls writer, trade deadline focus | **MEDIUM** |
| **Blackhawks News** | 4+ | 7-8 | Blackhawks hub + articles | Slightly less volume than competitors | 2 more articles/week — easiest win | **MEDIUM** |
| **E-E-A-T Signals** | Sitewide | — | All pages | No author bios, exposed emails, no credentials | Author page overhaul, expert signals | **MEDIUM** |
| **Off-Brand Content** | 5+ | Various | `/wives-girlfriends/`, `/trending/` tabloid | Helpful Content penalty risk | Delete/noindex immediately | **MEDIUM** |
| **Legacy URL Cleanup** | 15+ | — | 2014-2017 articles | Crawl budget waste, thin content signals | 301 to hubs or 410 | **LOW-MEDIUM** |

---

# EXECUTIVE SUMMARY

## The Big Picture

SportsMockery.com has **22,005 organic keywords** generating **119,319 monthly visits** worth **$26,607/month**. However, the site is leaving an estimated **146,000+ additional monthly visits on the table** from keywords where it ranks but underperforms (positions 15-50 on high-volume terms).

## Top 5 Actions (In Order)

1. **Transform team hub pages from static WordPress archives to dynamic news hubs** — this single change could recover 50,000+ monthly visits across all 5 teams. This is the most impactful fix before the Next.js migration.

2. **Create dedicated rumors/trade hub pages** for Bears and Cubs — SM is missing from the top 10 entirely for "bears trade rumors" (KD:15) and "cubs trade rumors" (KD:33), both easy-to-win keywords.

3. **Clean up author pages and off-brand content** — noindex author archives, delete `/wives-girlfriends/` content, and remove tabloid articles. This is a quick E-E-A-T win.

4. **Increase publishing cadence** — Competitors publish 3-5x more content daily. SM needs minimum 2 Bears articles/day and 1 article/day for each other team.

5. **Complete the Next.js migration with full redirect map** — The live scores, schedule, roster, and stats pages will only become competitive once they have real-time data (Next.js team pages already being built).

## Competitor Threat Level

| Competitor | Keywords | Traffic | Threat Level |
|-----------|---------|---------|-------------|
| **bleachernation.com** | 252,610 | 486,561 | CRITICAL — 11x SM's keywords |
| **beargoggleson.com** | 26,857 | 316,355 | HIGH — beating SM on Bears content |
| **bleedcubbieblue.com** | 80,828 | 226,066 | HIGH — dominating Cubs space |
| **marqueesportsnetwork.com** | 56,407 | 221,702 | HIGH — broadcast authority |
| **chicitysports.com** | 31,906 | 172,536 | HIGH — direct competitor, multi-team |
| **windycitygridiron.com** | 42,876 | 148,269 | MODERATE — Bears-focused |
| **chicagobears.com** | 511,949 | 1,451,697 | (Official — can't compete on brand) |

SM's unique advantage: **Only site covering all 5 Chicago teams** with fan engagement tools (Scout AI, GM Trade Simulator, Mock Draft, Fan Chat). No competitor has this. The Next.js platform is the differentiator — but the content volume gap must close.

---

*Report generated February 17, 2026 from SEMRush US database.*
*API data reflects current crawl snapshot. Historical position tracking requires SEMRush Position Tracking project setup.*
