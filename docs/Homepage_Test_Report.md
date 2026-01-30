# Homepage Test Report

**Date:** January 29, 2026
**URL Tested:** https://test.sportsmockery.com/

---

## Test Summary

| Test | Status | Notes |
|------|--------|-------|
| HTTP Status | ✅ PASS | 200 OK |
| Response Time | ⚠️ WARN | 1.57s (target <1s) |
| No Fallbacks | ✅ PASS | Real content loading |
| Post Count | ✅ PASS | 28 post links found |
| Team Coverage | ⚠️ WARN | Heavily Bears-skewed |
| SEO Meta Tags | ✅ PASS | Title and description present |
| Images Loading | ❌ FAIL | Only 1 img tag rendered |
| Trending Section | ⚠️ WARN | Only 1 trending reference |
| Content Type Badges | ❌ FAIL | No badges displayed |
| Team Filter Tabs | ✅ PASS | All 5 teams + "All" present |
| Live Games Widget | ❌ FAIL | Not present on homepage |
| Navigation Links | ✅ PASS | All main links present |

---

## Database Statistics

| Metric | Value |
|--------|-------|
| Total Published Posts | 31,106 |
| Posts with Category | 31,096 (99.9%) |
| Posts with Featured Image | 31,051 (99.8%) |
| Posts from Last 7 Days | 10 (all test posts) |
| Posts with Views > 0 | 13 |
| Posts with importance_score > 50 | 0 |

### Team Distribution

| Team | Posts | Percentage |
|------|-------|------------|
| Bears | 18,435 | 59.2% |
| Cubs | 4,744 | 15.3% |
| White Sox | 3,632 | 11.7% |
| Bulls | 1,861 | 6.0% |
| Blackhawks | 1,267 | 4.1% |
| Other | 1,167 | 3.7% |

**Issue:** Bears content dominates, potentially alienating fans of other Chicago teams.

---

## Critical Issues

### 1. Featured Images Not Rendering
- **Problem:** Database has 31,051 posts with images, but homepage shows almost none
- **Cause:** Images may be broken links (old WordPress URLs from 2014-2017) or lazy loading not triggering
- **Impact:** Poor visual appeal, lower engagement

### 2. Trending System Broken
- **Problem:** Only 10 posts in last 7 days, only 13 posts have any views recorded
- **Cause:** View tracking not working or not being recorded
- **Impact:** "Trending" section shows random content, not actually trending

### 3. No Content Differentiation
- **Problem:** All posts have importance_score = 50
- **Cause:** No editorial curation of importance
- **Impact:** Editor picks are random, not actually curated

### 4. No Content Type Badges
- **Problem:** Only 1,000 posts have content_type set (all "article")
- **Cause:** 30,000+ posts missing content_type
- **Impact:** No VIDEO, ANALYSIS, GUIDE badges appear

### 5. No Live Games Integration
- **Problem:** Live games widget missing from homepage
- **Impact:** Fans can't see current game scores at a glance

---

## Recommendations

### Priority 1: Critical (Immediate)

#### 1.1 Fix Image Loading
```typescript
// Verify image URLs are accessible before rendering
// Add fallback placeholder for broken images
// Consider migrating old WordPress URLs to new CDN
```

**Action Items:**
- [ ] Audit featured_image URLs for broken links
- [ ] Add image error handling with placeholder
- [ ] Consider lazy loading implementation review

#### 1.2 Fix View Tracking
```typescript
// Ensure /api/views endpoint is being called on page load
// Verify view increments are being recorded
```

**Action Items:**
- [ ] Verify view tracking API is called on post pages
- [ ] Check if views are being written to database
- [ ] Add view tracking debug logging

### Priority 2: High (This Week)

#### 2.1 Add Live Games Widget to Homepage

Chicago sports fans want to see current game scores immediately. Add a live games ticker/widget to the homepage.

```typescript
// Add to HomepageFeed.tsx
import { LiveGamesWidget } from '@/components/LiveGamesWidget'

// In render:
<LiveGamesWidget teams={['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']} />
```

**Benefits:**
- Increases time on site during game days
- Provides real-time value to fans
- Differentiates from static news sites

#### 2.2 Implement Team-Balanced Feed

Currently 59% Bears content. Implement a balanced feed algorithm:

```typescript
function balanceTeamContent(posts: Post[]): Post[] {
  const teams = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox'];
  const postsPerTeam = Math.ceil(posts.length / teams.length);

  // Ensure each team gets fair representation
  const balanced: Post[] = [];
  for (let i = 0; i < postsPerTeam; i++) {
    for (const team of teams) {
      const teamPost = posts.find(p => p.team_slug === team && !balanced.includes(p));
      if (teamPost) balanced.push(teamPost);
    }
  }
  return balanced;
}
```

**Benefits:**
- Fair coverage for all 5 Chicago teams
- Bulls/Blackhawks fans don't feel neglected
- More diverse content mix

#### 2.3 Add Personalized Team Quick-Switch

Let users quickly filter by their favorite team without navigating away:

```typescript
// Sticky team filter bar at top
<TeamQuickSwitch
  teams={['all', 'bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']}
  userPreference={userTeamPreference}
  onSelect={setActiveTeam}
/>
```

### Priority 3: Medium (This Month)

#### 3.1 Editorial Curation Tools

Add admin tools to set importance_score on posts:
- Breaking news = 90-100
- Major stories = 70-89
- Standard news = 50-69
- Evergreen/Archive = 30-49

#### 3.2 Content Type Tagging

Batch-update existing posts with appropriate content_type:
- Scan for video embeds → content_type = 'video'
- Scan for analysis keywords → content_type = 'analysis'
- Scan for podcast references → content_type = 'podcast'

#### 3.3 Trending Algorithm Enhancement

If views aren't being tracked, consider alternative trending signals:
- Social media shares (if tracked)
- Comment count
- Time on page
- Recency + importance hybrid score

### Priority 4: Nice to Have (Future)

#### 4.1 Game Day Mode
- Auto-enable during Chicago team games
- Show live score prominently
- Surface related articles for teams playing
- Real-time play-by-play integration

#### 4.2 Breaking News Banner
- Slide-down banner for major Chicago sports news
- Push notification integration
- Auto-dismiss after user acknowledges

#### 4.3 Personalized "My Teams" Section
- For logged-in users, show dedicated section for their selected teams
- Quick access to team-specific stats, schedule, roster

#### 4.4 Chicago Sports Calendar Widget
- Show upcoming games for all 5 teams
- One-week lookahead
- Links to ticket purchases

---

## Performance Recommendations

### Current Performance
- Page size: 265 KB (acceptable)
- Response time: 1.57s (needs improvement)
- JS bundles: Multiple (consider consolidation)

### Optimization Targets
- Response time: < 1 second
- Largest Contentful Paint: < 2.5 seconds
- First Input Delay: < 100ms

### Actions
1. **Enable edge caching** for homepage (1-5 minute TTL)
2. **Optimize database queries** - consider materialized views for homepage data
3. **Image optimization** - use Next.js Image with proper sizing
4. **Code splitting** - lazy load below-fold components

---

## Mobile Experience Recommendations

### Current State
- Responsive CSS classes present
- Team filter tabs work on mobile
- No mobile-specific optimizations detected

### Recommendations
1. **Swipeable team tabs** - horizontal scroll for team filters
2. **Bottom navigation** - persistent nav for key sections
3. **Pull-to-refresh** - native mobile UX pattern
4. **Reduced data mode** - option to hide images on slow connections
5. **App-like transitions** - smooth page transitions

---

## SEO Recommendations

### Current State
- Title: ✅ "Sports Mockery | Bears News, Chicago Sports Analysis & Rumors"
- Meta description: ✅ Present and descriptive
- Open Graph tags: ❓ Not verified

### Recommendations
1. **Dynamic title** based on trending content: "BREAKING: [Top Story] | Sports Mockery"
2. **Structured data** - Add NewsArticle schema for posts
3. **Canonical URLs** - Ensure proper canonicalization
4. **XML sitemap** - Already present, verify all posts indexed

---

## Summary

The homepage is functional but has significant data quality issues that limit its effectiveness:

1. **Images don't load** - Major visual impact
2. **Trending is broken** - No view data
3. **No editorial curation** - All posts equal weight
4. **Bears-heavy content** - Unbalanced team coverage
5. **No live games** - Missing key fan feature

Fixing view tracking and image loading should be the immediate priority, followed by adding live games integration and implementing team-balanced content distribution.
