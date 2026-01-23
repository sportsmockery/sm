# SSB TikTok Scraper

## Overview

The Southside Behavior TikTok page (`/southside-behavior`) automatically scrapes videos from the `@southsidebehavior` TikTok profile. No manual curation or cron jobs required.

## How It Works

### 1. Profile Scraping

When the page loads, the scraper fetches the TikTok profile page:

```
https://www.tiktok.com/@southsidebehavior
```

The scraper uses a standard browser User-Agent to avoid blocks.

### 2. Data Extraction

TikTok embeds video data in their HTML. The scraper tries multiple methods:

**Method 1: Universal Data (Primary)**
- Looks for `<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__">`
- Parses JSON to extract video list from `__DEFAULT_SCOPE__.webapp.user-detail.itemList`

**Method 2: SIGI State (Fallback)**
- Looks for `<script id="SIGI_STATE__DEFAULT_SCOPE__">`
- Parses JSON to extract videos from `ItemModule`

**Method 3: HTML Regex (Last Resort)**
- Extracts video IDs using pattern: `/@southsidebehavior/video/(\d+)`

### 3. Filtering

Only **original posts** are included. The scraper filters out:
- Replies (videos responding to other users)
- Duets (side-by-side collaborations)
- Stitches (videos using clips from others)

### 4. oEmbed Enrichment

For each video ID found, the scraper fetches TikTok's oEmbed API:

```
https://www.tiktok.com/oembed?url=https://www.tiktok.com/@southsidebehavior/video/{VIDEO_ID}
```

This provides:
- Embed HTML code
- Thumbnail URL
- Video title/caption

### 5. Caching

Results are cached for **30 minutes** using Next.js `revalidate`:
- Profile page fetch: 30 min cache
- oEmbed requests: 30 min cache

## File Location

```
src/lib/getSouthsideBehaviorEmbeds.ts
```

## Configuration

| Constant | Value | Description |
|----------|-------|-------------|
| `TIKTOK_PROFILE_URL` | `https://www.tiktok.com/@southsidebehavior` | Profile to scrape |
| `DISPLAY_COUNT` | `12` | Max videos to display (1 featured + 11 grid) |
| `revalidate` | `1800` | Cache duration in seconds (30 min) |

## Data Flow

```
Page Load
    │
    ▼
Scrape TikTok Profile (cached 30 min)
    │
    ▼
Parse JSON / Extract Video IDs
    │
    ▼
Filter: Remove replies, duets, stitches
    │
    ▼
Fetch oEmbed for each video (cached 30 min)
    │
    ▼
Sort by publish date (newest first)
    │
    ▼
Return: 1 featured + remaining for grid
```

## Troubleshooting

### No videos showing

1. TikTok may have changed their HTML structure
2. Check server logs for `[TikTok]` prefixed messages
3. TikTok may be blocking the request (rate limiting)

### Old videos showing

- Cache lasts 30 minutes
- Wait for cache to expire or redeploy to clear

### Missing thumbnails

- oEmbed API sometimes fails
- Falls back to thumbnails from scraped data

## Limitations

1. **TikTok can change their page structure** - May break parsing
2. **Rate limiting** - Too many requests may be blocked
3. **No publish dates in HTML fallback** - Uses current date if JSON parsing fails
4. **Server-side only** - Uses `server-only` import, cannot run in browser

## Future Improvements

- Add fallback to manual video list if scraping fails
- Implement retry logic for failed requests
- Add monitoring/alerting for scraper failures
