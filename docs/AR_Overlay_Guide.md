# AR Overlay & AI Highlights User Guide

## Overview

SportsMockery features two immersive features for Chicago sports fans:
1. **AR Stadium Tours** - Interactive 3D/AR experiences of Chicago stadiums
2. **AI-Generated Highlights** - Dynamic AI-powered content with charts, stats, memes, commentary, and video clips

---

## AR Stadium Tours

### Supported Stadiums

| Team | Stadium | Features |
|------|---------|----------|
| Chicago Bears | Soldier Field | Colonnades, Field Turf, Suites |
| Chicago Bulls | United Center | Center Court, Championship Banners, Upper Deck |
| Chicago Blackhawks | United Center | Ice Surface, Goal Horn, Hawks Nest |
| Chicago Cubs | Wrigley Field | Ivy Wall, Marquee, Rooftops |
| Chicago White Sox | Guaranteed Rate Field | Outfield, Scoreboard, Upper Deck |

### How to Access AR Tours

#### On iOS (iPhone/iPad)
1. Navigate to any team page (e.g., `/teams/chicago-bears`)
2. Tap the **"AR Stadium Tour"** button
3. Safari will prompt to open AR Quick Look
4. Point your camera at a flat surface
5. The stadium 3D model appears in your space
6. Walk around to explore different angles

#### On Android
1. Navigate to any team page
2. Tap the **"AR Stadium Tour"** button
3. If your device supports ARCore:
   - The WebXR experience loads
   - Point at a flat surface to place the model
4. If ARCore not available:
   - Falls back to interactive 3D viewer

#### On Desktop
1. Navigate to any team page
2. Click the **"AR Stadium Tour"** button
3. Interactive 3D viewer opens in a modal
4. **Controls:**
   - Click + drag: Rotate model
   - Scroll: Zoom in/out
   - Double-click: Reset view

### Requirements

- **iOS:** iPhone 6s or newer, iOS 12+, Safari browser
- **Android:** ARCore-compatible device, Chrome browser
- **Desktop:** Modern browser (Chrome, Firefox, Safari, Edge)

### Elite Access

AR Stadium Tours are exclusive to **Elite members**. Non-Elite users will see an upgrade prompt when attempting to access.

---

## AI-Generated Highlights

### What Are AI Highlights?

AI Highlights are dynamically generated content pieces created by Claude AI specifically for each Chicago sports team. They appear in the sidebar on team pages and refresh every hour.

### Highlight Types

#### 1. Charts (`chart`)
- **Icon:** 📊
- **Description:** Interactive Chart.js visualizations
- **Examples:** Win probability trends, performance metrics, season stats
- **Features:**
  - Line or bar charts
  - Team-colored styling
  - Hover for detailed values

#### 2. Stats Data (`data`)
- **Icon:** 📈
- **Description:** Key statistics and probability updates
- **Examples:** "Win Probability: 58%", "Playoff Odds: 23%"
- **Features:**
  - Large, bold numbers
  - Real-time feel

#### 3. Memes (`meme`)
- **Icon:** 😂
- **Description:** AI-generated meme concepts
- **Examples:** "POV: You're a Bears fan checking the score..."
- **Features:**
  - Placeholder image area
  - Witty captions
  - Shareable format

#### 4. Commentary (`commentary`)
- **Icon:** 💬
- **Description:** Witty mockery and hot takes
- **Examples:** "The Bears continue to provide Chicago with its favorite pastime..."
- **Features:**
  - Blockquote styling
  - "AI Mockery Bot" attribution

#### 5. Video Clips (`video_highlight`)
- **Icon:** 🎬
- **Description:** Short video clips from official sources with mockery overlays
- **Examples:** Key plays, highlights, memorable moments
- **Features:**
  - YouTube embed (official NFL/NBA/MLB/NHL channels only)
  - Mockery overlay text
  - Source credit
  - Duration indicator (5-15 seconds)
  - Fair use disclaimer

### How It Works

1. **Page Load:** When you visit a team page, the component calls `/api/generate-highlights`
2. **Cache Check:** The API checks Supabase for cached highlights (valid for 60 minutes)
3. **AI Generation:** If no cache, Claude AI generates 4-5 new highlights
4. **Caching:** Results are stored in `sm_highlights` table
5. **Display:** Highlights render with animations and interactive expand/collapse

### User Interaction

1. **Expand/Collapse:** Click any highlight to expand full content
2. **Share to X:** Click "Share to X" button to tweet the highlight
3. **Local Insights:** Geo-detection may show location-specific content (e.g., "Tinley Park Special")

### API Endpoint

```
POST /api/generate-highlights
Content-Type: application/json

{
  "teamSlug": "chicago-bears"
}
```

**Response:**
```json
{
  "highlights": [...],
  "cached": true|false,
  "fallback": true|false
}
```

---

## Video Clip Fair Use Policy

### Guidelines

Video clips in AI Highlights follow strict fair use guidelines:

1. **Duration:** 5-15 seconds maximum per clip
2. **Source:** Official league YouTube channels only (NFL, NBA, MLB, NHL)
3. **Transformative:** Always includes mockery/commentary overlay
4. **Credit:** Source attribution displayed on every clip
5. **Quantity:** Maximum 1-3 clips per highlight reel

### Legal Basis

- Clips are used for **transformative commentary and criticism**
- Short duration and overlay text constitute fair use under 17 U.S.C. § 107
- All original footage remains credited to respective copyright holders
- No downloads or redistribution of source video

### Disclaimer

Displayed on every video highlight:
> "Fair Use: Short clip for transformative commentary. Full video on official channel."

Footer disclaimer:
> "Video clips used under fair use for transformative commentary. All footage from official league channels. © respective owners."

---

## Component Reference

### Files

| File | Purpose |
|------|---------|
| `/src/components/ai/AIHighlights.tsx` | Main AI highlights component |
| `/src/components/ai/index.ts` | Export barrel |
| `/src/app/api/generate-highlights/route.ts` | API route for AI generation |
| `/src/components/ar/ARQuickLookButton.tsx` | iOS AR Quick Look button |
| `/src/components/ar/ARTourButton.tsx` | Universal AR tour button |
| `/src/components/ar/ModelViewerFallback.tsx` | Desktop 3D viewer |
| `/src/components/homepage-v2/AROverlay.tsx` | AR overlay modal with stadium tours |

### Usage Example

```tsx
import { AIHighlights } from '@/components/ai'

export default function TeamPage({ team }) {
  return (
    <div className="flex">
      <main className="flex-1">
        {/* Main content */}
      </main>
      <aside className="w-80">
        <AIHighlights
          teamSlug="chicago-bears"
          teamName="Bears"
        />
      </aside>
    </div>
  )
}
```

### Environment Variables

```env
# Required for AI generation
ANTHROPIC_API_KEY=your_api_key

# Supabase for caching
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

---

## Troubleshooting

### AR Not Working

1. **iOS:** Ensure Safari is used, not in-app browser
2. **Android:** Check if ARCore is installed and updated
3. **Desktop:** Try a different browser

### Highlights Not Loading

1. Check if `ANTHROPIC_API_KEY` is set
2. Verify Supabase connection
3. Check browser console for errors
4. Fallback mock data should display if API fails

### Video Not Playing

1. Ensure video URL is from official YouTube
2. Check if embedded content is blocked by browser
3. Try refreshing the page

---

---

## Auto-Embedded Game Highlights (YouTube)

### How It Works

Game highlights are **automatically fetched** from official NFL YouTube channels when you view a box score. No user input required.

### Flow

1. User visits `/chicago-bears/scores`
2. Selects a game from the horizontal game selector
3. Box score loads with player stats
4. **GameHighlights component** automatically:
   - Calls `/api/highlights/youtube` with game info
   - Searches official NFL YouTube for matching highlights
   - Caches results for 24 hours
   - Displays embedded videos with mockery overlays

### API Endpoint

```
POST /api/highlights/youtube
Content-Type: application/json

{
  "gameId": "123",
  "homeTeam": "CHI",
  "awayTeam": "GB",
  "gameDate": "2025-01-05",
  "week": 18
}
```

**Response:**
```json
{
  "videos": [
    {
      "videoId": "abc123",
      "title": "Bears vs. Packers Highlights",
      "description": "...",
      "thumbnail": "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
      "publishedAt": "2025-01-05T00:00:00Z",
      "channelTitle": "NFL"
    }
  ],
  "cached": true
}
```

### YouTube API Setup

To enable live YouTube search (instead of fallback videos):

1. Create a Google Cloud project
2. Enable YouTube Data API v3
3. Create an API key
4. Add to environment variables:

```env
YOUTUBE_API_KEY=your_api_key_here
```

### Fallback Videos

If no YouTube API key is configured, the system uses curated fallback video IDs for common Bears matchups:
- Bears vs. Packers
- Bears vs. Vikings
- Bears vs. Lions

### Components

| File | Purpose |
|------|---------|
| `/src/app/api/highlights/youtube/route.ts` | YouTube search API |
| `/src/components/scores/GameHighlights.tsx` | Video embed component |
| `/src/app/chicago-bears/scores/BoxScoreClient.tsx` | Box score page (includes GameHighlights) |

### Caching

- Results cached in `sm_youtube_highlights` Supabase table
- 24-hour cache duration
- Reduces API calls and improves performance

### Mockery Overlays

Each video displays a random mockery overlay:
- "Another chapter in Bears history... for better or worse"
- "Bears football: Where hope meets reality"
- "Chicago sports: Building character since forever"

---

## Support

For issues or feature requests:
- GitHub: https://github.com/sportsmockery/sm
- Contact: dev@sportsmockery.com
