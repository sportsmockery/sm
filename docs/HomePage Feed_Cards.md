# SM 2.0 Feed — Card Components Guide

## Overview

The SM 2.0 feed ("Sports Mockery River") renders 17 distinct card types in a virtualized scroll feed. Each card wraps `<BaseGlassCard>` for consistent glassmorphism styling, dwell tracking, and entrance animations.

## Architecture

```
RiverFeed.tsx
  └── switch(card.card_type)
        └── <SpecificCard card={card} />
              └── <BaseGlassCard> (glassmorphism wrapper)
```

**Key files:**
- `src/lib/river-types.ts` — `RiverCard`, `CardType` types
- `src/components/SportsRiver/BaseGlassCard.tsx` — shared glass wrapper (bg, border, dwell tracking, breathing animation)
- `src/components/SportsRiver/RiverFeed.tsx` — virtualized feed with card-type switch
- `src/components/SportsRiver/cards/utils.ts` — shared labels & timestamp formatter
- `src/components/SportsRiver/cards/*.tsx` — all 17 card components
- `src/hooks/useGhostUpdate.ts` — real-time data updates via WebSocket
- `src/context/AudioPlayerContext.tsx` — audio state for ListenNowCard

## Card Types

| # | Component | card_type | Badge Color | Special Features |
|---|-----------|-----------|-------------|-----------------|
| 1 | ScoutArticleCard | `scout_summary` | #00D4FF (Cyan) | Hold-to-Scout overlay with AnimatePresence |
| 2 | HubUpdateCard | `hub_update` | #BC0000 (Red) | Confidence bar, live indicator |
| 3 | TradeProposalCard | `trade_proposal` | #D6B05E (Gold) | Split-screen layout, trade score badge |
| 4 | VisionTheaterCard | `vision_theater` | #BC0000 | 16:9 video thumbnail, play button overlay |
| 5 | TrendingArticleCard | `trending_article` | #00D4FF | Featured image, velocity badge |
| 6 | BoxScoreCard | `box_score` | #BC0000 | **useGhostUpdate** for live scores, glow animation |
| 7 | TrendingPlayerCard | `trending_player` | #BC0000 | Trending rank badge, player silhouette |
| 8 | FanChatCard | `fan_chat` | #00FF00 (Green) | **useGhostUpdate** for live user count |
| 9 | MockDraftCard | `mock_draft` | #BC0000 | Centered layout, CTA to /mock-draft |
| 10 | SmPlusCard | `sm_plus` | #D6B05E (Gold) | Gold glow border, tier list |
| 11 | InfographicCard | `infographic` | #0891B2 (Cyan Deep) | recharts BarChart |
| 12 | ChartCard | `chart` | #00D4FF | recharts LineChart |
| 13 | PollCard | `poll` | #BC0000 | Optimistic voting UI, animated progress bars |
| 14 | CommentSpotlightCard | `comment_spotlight` | #00D4FF | Quote bubble blockquote |
| 15 | ListenNowCard | `listen_now` | #BC0000 | Voice selector, AudioPlayerContext integration |
| 16 | JoinNewsletterCard | `join_newsletter` | #00D4FF | Email input, inline success state |
| 17 | DownloadAppCard | `download_app` | #BC0000 | App Store + Google Play buttons |

## Design Tokens

- **Paper text:** `text-[#FAFAFB]`
- **Mist secondary:** `text-[#E6E8EC]`
- **SM Red:** `#BC0000`
- **Electric Cyan:** `#00D4FF`
- **SM+ Gold:** `#D6B05E`
- **Cyan Deep:** `#0891B2`
- **Headlines:** Space Grotesk (default `font-sans`)
- **Body text:** Inter (via inline `style={{ fontFamily: 'Inter, sans-serif' }}`)
- **No team-specific colors** (no Bears navy, Bulls red, etc.)

## Ghost Updates (Real-Time)

`BoxScoreCard` and `FanChatCard` use `useGhostUpdate(cardId, content, table)` from `src/hooks/useGhostUpdate.ts`. This subscribes to Supabase Realtime via `WebSocketProvider` and returns:
- `liveData` — merged content with latest patches
- `isUpdating` — true for 1.5s after each update (drives glow animations)

## Hold-to-Scout (ScoutArticleCard)

Press and hold on a ScoutArticleCard to reveal an overlay with the Scout AI summary:
- Uses `onMouseDown/Up` (desktop) and `onTouchStart/End` (mobile)
- Overlay animated with `framer-motion` `AnimatePresence`
- Cyan border glow while holding

## AudioPlayerContext

`src/context/AudioPlayerContext.tsx` provides `play()`, `pause()`, `setVoice()` and state (`isPlaying`, `currentArticle`, `voice`). Used by `ListenNowCard` to trigger audio playback. The mini-player UI that consumes this context is built in T7.

## Adding a New Card Type

1. Add the type to `CardType` in `src/lib/river-types.ts`
2. Add its label to `CARD_TYPE_LABELS` in `src/components/SportsRiver/cards/utils.ts`
3. Create `src/components/SportsRiver/cards/YourCard.tsx` wrapping `<BaseGlassCard>`
4. Add the import and switch case in `RiverFeed.tsx`
