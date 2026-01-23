# SSB TikTok - Manual Curation

## Overview

The Southside Behavior TikTok page (`/southside-behavior`) displays videos from the `@southsidebehavior` TikTok account.

**Note:** TikTok blocks server-side scraping, so videos must be manually curated.

## How to Add Videos

### 1. Go to the TikTok Profile

Visit: https://www.tiktok.com/@southsidebehavior

### 2. Find Original Videos

Only add **original posts** - skip these types:
- Replies (videos responding to someone)
- Duets (side-by-side with another video)
- Stitches (clips from other videos)

### 3. Copy the Video URL

Click on a video and copy the URL from your browser. It looks like:
```
https://www.tiktok.com/@southsidebehavior/video/7127779450061704490
```

### 4. Get the Publish Date

The date is shown on the video page. Format as `YYYY-MM-DD`.

### 5. Edit the File

Open: `src/lib/getSouthsideBehaviorEmbeds.ts`

Add new videos to the top of the `SOUTHSIDE_TIKTOKS` array:

```typescript
const SOUTHSIDE_TIKTOKS: { url: string; publishedAt: string }[] = [
  // Add new videos at the TOP (newest first)
  { url: 'https://www.tiktok.com/@southsidebehavior/video/NEW_VIDEO_ID', publishedAt: '2025-01-22' },
  // ... existing videos below
];
```

### 6. Deploy

Commit and push the changes. The page will update automatically.

## File Location

```
src/lib/getSouthsideBehaviorEmbeds.ts
```

## Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| `DISPLAY_COUNT` | `12` | Max videos shown (1 featured + 11 grid) |
| `revalidate` | `1800` | oEmbed cache duration (30 min) |

## Why No Auto-Scraping?

TikTok actively blocks server-side requests:
- Profile pages require JavaScript to render
- API endpoints require authentication
- Rate limiting is aggressive

The oEmbed API (used to get embed HTML) works, but only with known video URLs.

## Data Flow

```
Manual: Add video URL to file
           │
           ▼
Page Load: Fetch oEmbed for each URL
           │
           ▼
oEmbed returns: HTML, thumbnail, title
           │
           ▼
Display: 1 featured + grid of recent
```
