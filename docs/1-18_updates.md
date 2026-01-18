# SportsMockery Feature Updates - January 18, 2026

This document covers all features added/updated during the January 18, 2026 session.

---

## Table of Contents

1. [AI-Generated Highlights with Video Clips](#1-ai-generated-highlights-with-video-clips)
2. [Auto-Embedded YouTube Game Highlights](#2-auto-embedded-youtube-game-highlights)
3. [Disqus Comments Integration](#3-disqus-comments-integration)
4. [Homepage V3 - Chicago Tonight Layout](#4-homepage-v3---chicago-tonight-layout)
5. [Ad Inserter Admin System](#5-ad-inserter-admin-system)
6. [AR Overlay & Stadium Tours](#6-ar-overlay--stadium-tours)

---

## 1. AI-Generated Highlights with Video Clips

### Overview
AI-powered highlights for team pages featuring charts, stats, memes, commentary, and video clips.

### Files
- `/src/components/ai/AIHighlights.tsx` - Main component
- `/src/app/api/generate-highlights/route.ts` - API route with Claude AI integration

### Usage
```tsx
import { AIHighlights } from '@/components/ai'

<AIHighlights teamSlug="chicago-bears" teamName="Bears" />
```

### Highlight Types
| Type | Icon | Description |
|------|------|-------------|
| `chart` | 📊 | Chart.js line/bar visualizations |
| `data` | 📈 | Key statistics display |
| `meme` | 😂 | AI meme concepts |
| `commentary` | 💬 | Witty commentary/hot takes |
| `video_highlight` | 🎬 | YouTube clips with mockery overlays |

### Video Clip Fair Use Guidelines
- 5-15 second clips only
- Official NFL/NBA/MLB/NHL YouTube channels only
- Must include transformative mockery overlay
- Credit displayed per clip
- Fair use disclaimer in footer

### Caching
- Results cached in `sm_highlights` Supabase table
- 60-minute cache duration
- Automatic fallback to mock data if API fails

### Environment Variables
```env
ANTHROPIC_API_KEY=your_claude_api_key
```

---

## 2. Auto-Embedded YouTube Game Highlights

### Overview
Automatic YouTube highlight fetching for box score pages - no user input required.

### Files
- `/src/app/api/highlights/youtube/route.ts` - YouTube search API
- `/src/components/scores/GameHighlights.tsx` - Video embed component

### How It Works
1. User visits `/chicago-bears/scores`
2. Selects a game from horizontal selector
3. `GameHighlights` component auto-fetches from YouTube Data API
4. Displays embedded videos with mockery overlays
5. Results cached for 24 hours

### API Endpoint
```
POST /api/highlights/youtube

{
  "gameId": "123",
  "homeTeam": "CHI",
  "awayTeam": "GB",
  "gameDate": "2025-01-05",
  "week": 18
}
```

### YouTube API Setup
1. Create Google Cloud project
2. Enable YouTube Data API v3
3. Create API key
4. Add to environment:
```env
YOUTUBE_API_KEY=your_api_key
```

### Fallback Behavior
Without YouTube API key, uses curated fallback video IDs for common Bears matchups.

### Database Table
```sql
CREATE TABLE sm_youtube_highlights (
  game_id VARCHAR(100) PRIMARY KEY,
  videos JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Disqus Comments Integration

### Overview
Disqus commenting system on all single post pages.

### Files
- `/src/components/article/CommentSection.tsx` - Disqus component
- Used in `/src/app/[category]/[slug]/page.tsx`

### Setup
1. Create Disqus site at https://disqus.com/admin/create/
2. Use shortname: `sportsmockery`
3. Add to environment:
```env
NEXT_PUBLIC_DISQUS_SHORTNAME=sportsmockery
```

### Usage
```tsx
<CommentSection
  articleId={post.id}
  articleUrl={articleUrl}
  articleTitle={post.title}
/>
```

### Features
- Auto-resets on article navigation
- Loading spinner while Disqus loads
- Noscript fallback
- Theme-aware styling

### Migration to Paid Plan
When going live:
1. Upgrade Disqus plan
2. Import existing comments via Disqus admin
3. No code changes needed

---

## 4. Homepage V3 - Chicago Tonight Layout

### Overview
Modern, text-first homepage with dashboard-like above-the-fold layout.

### Files
- `/src/components/homepage/HomepageV3.tsx` - Main component
- `/src/components/homepage/homepagev3.css` - Styles
- `/src/app/page.tsx` - Uses HomepageV3

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                    CHICAGO TONIGHT                       │
├──────────────────┬────────────────┬────────────────────┤
│  PRIMARY STORY   │  TOP HEADLINES │  TONIGHT IN CHI    │
│  + 2 support     │  (10 items)    │  (Live scores)     │
├──────────────────┴────────────────┴────────────────────┤
│                 CHICAGO FRONT PAGE                       │
│                    (6 featured)                          │
├─────────────────────────────────────────────────────────┤
│                 LATEST FROM CHICAGO                      │
│                   (15 items)                             │
├─────────────────────────────────────────────────────────┤
│                  IN SEASON RIGHT NOW                     │
│                 (Up to 3 teams)                          │
├─────────────────────────────────────────────────────────┤
│                   CHICAGO CLASSICS                       │
│                    (4 evergreen)                         │
└─────────────────────────────────────────────────────────┘
```

### Theme Support
Supports both light and dark modes via CSS variables:
- `body.theme-light` for light mode
- `body.theme-dark` or `.dark` for dark mode

### Headline Population Logic
| Rows | Source |
|------|--------|
| 1-3 | LATEST_GLOBAL |
| 4-6 | EDITOR_PICK |
| 7-8 | SEASON_ACTIVE |
| 9 | EVERGREEN_TOP |
| 10 | PERSONALIZED_OR_BALANCE |

### Team Colors
- Bears: `#0b162a` (navy) + `#dc4405` (orange)
- Bulls: `#ce1141` (red)
- Cubs: `#0e3386` (blue)
- White Sox: `#27251f` (black)
- Blackhawks: `#cf0a2c` (red)
- Citywide: `#f5a623` (gold)

### Responsive Breakpoints
- Desktop: 3-column info deck
- Tablet (≤1024px): 2-column, primary spans full
- Mobile (≤768px): Single column stack

---

## 5. Ad Inserter Admin System

### Overview
WordPress Ad Inserter-style system for managing ad placements across the site.

### Files
- `/src/app/admin/ads/page.tsx` - Admin interface
- `/src/app/api/admin/ads/route.ts` - CRUD API
- `/src/components/ads/AdRenderer.tsx` - Ad renderer
- `/src/components/ads/index.ts` - Exports

### Admin Page
Access at: `/admin/ads`

Features:
- Create/Edit/Delete ad placements
- HTML/JavaScript code input
- Custom CSS support
- Placement location selection
- Priority ordering
- Device targeting (all/mobile/desktop)
- Enable/disable toggle
- Preview functionality

### Placement Types
| Type | Description |
|------|-------------|
| `AFTER_FEATURED_IMAGE` | Below featured image on single posts |
| `IN_CONTENT_PARAGRAPH_3` | After 3rd paragraph |
| `IN_CONTENT_PARAGRAPH_5` | After 5th paragraph |
| `IN_CONTENT_PARAGRAPH_8` | After 8th paragraph |
| `HOMEPAGE_HERO` | In hero region |
| `HOMEPAGE_FEATURED` | Between featured posts |
| `HOMEPAGE_LATEST` | In latest stream |
| `SIDEBAR` | Sidebar widget area |
| `FOOTER` | Above site footer |
| `MOBILE_STICKY` | Sticky bottom on mobile |

### Database Setup
```sql
CREATE TABLE sm_ad_placements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  placement_type VARCHAR(100) NOT NULL,
  html_code TEXT NOT NULL,
  css_code TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 10,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_placements_type ON sm_ad_placements(placement_type);
CREATE INDEX idx_ad_placements_active ON sm_ad_placements(is_active);
```

### Using AdRenderer Component
```tsx
import { AdRenderer } from '@/components/ads'

// In single post page, after featured image:
<AdRenderer placement="AFTER_FEATURED_IMAGE" />

// In sidebar:
<AdRenderer placement="SIDEBAR" />
```

### In-Content Ad Insertion
```tsx
import { insertAdsIntoContent, countParagraphs } from '@/components/ads'

const paragraphCount = countParagraphs(content)
const contentWithAds = insertAdsIntoContent(content, ads, paragraphCount)
```

### Example Ad Codes

**Google AdSense:**
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXX"
     data-ad-slot="XXXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

**Custom Banner:**
```html
<div class="custom-ad-banner">
  <a href="https://sponsor.com" target="_blank" rel="sponsored">
    <img src="/ads/sponsor-banner.jpg" alt="Sponsor" />
  </a>
</div>
```

---

## 6. AR Overlay & Stadium Tours

See `/docs/AR_Overlay_Guide.md` for full documentation.

### Quick Reference
- AR Quick Look for iOS (`.usdz` files)
- Interactive 3D viewer for desktop
- Mockery overlays on stadium tours
- Elite membership required for access

---

## Deployment

All features are deployed to:
- **Production:** https://test.sportsmockery.com

### Deploy Command
```bash
vercel --prod
```

---

## Environment Variables Summary

```env
# AI Highlights
ANTHROPIC_API_KEY=your_claude_api_key

# YouTube Highlights
YOUTUBE_API_KEY=your_youtube_api_key

# Disqus Comments
NEXT_PUBLIC_DISQUS_SHORTNAME=sportsmockery

# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

---

## Database Tables Summary

| Table | Purpose |
|-------|---------|
| `sm_highlights` | AI highlight cache (60min) |
| `sm_youtube_highlights` | YouTube video cache (24hr) |
| `sm_ad_placements` | Ad placement configurations |

---

## Support

For issues or questions:
- GitHub: https://github.com/sportsmockery/sm
- Contact: dev@sportsmockery.com
