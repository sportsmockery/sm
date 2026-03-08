# SM EDGE — Component Planning Document

> **Generated:** 2026-03-08
> **Source:** Figma file "SM EDGE" + codebase audit
> **Figma pages:** Platform Flow, Homepage, Article Templates, Tools, Scout AI, Sidebar + Cards, Mobile, Components

This document defines every component needed for the SM EDGE frontend. It is split into two parts:

1. **New Component Architecture** — the cleaned list of components to build, grouped by domain
2. **Existing Component Reference** — what already exists in the codebase and needs design alignment

---

# Part 1: New Component Architecture

This is what the real architecture should look like. These are the components to build or formalize.

---

## Layout Primitives

```
ContentArea
SidebarSection
SectionHeader
```

---

### ContentArea — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/ui/ContentArea.tsx` |
| **Purpose** | Main content column with consistent max-width and padding |

**Props**
```ts
interface ContentAreaProps {
  children: ReactNode
  width?: 'narrow' | 'standard' | 'wide' | 'full'
  className?: string
}
```

**Variants**
| Variant | Max Width | Use Case |
|---------|-----------|----------|
| Narrow | 680px | Article body |
| Standard | 900px | Feed, team pages |
| Wide | 1200px | Tool pages (GM, Mock Draft) |
| Full | 100% | Immersive pages |

**Reuse:** Every page's main content column. Standardizes content width instead of ad-hoc padding.

---

### SidebarSection — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/ui/SidebarSection.tsx` |
| **Purpose** | Collapsible section with header — building block for left nav, right rail, article sidebar |

**Props**
```ts
interface SidebarSectionProps {
  title: string
  icon?: ReactNode
  defaultOpen?: boolean       // default: true
  collapsible?: boolean       // default: true
  children: ReactNode
  className?: string
}
```

**Variants**
| Variant | Use Case |
|---------|----------|
| Default | Open with title bar |
| Collapsed | Title only, expand on click |
| Flat | No title bar, just grouped content |

**Reuse:** LeftSidebar sections, RightRailModules sections, ArticleSidebar sections, Mobile drawer sections. Uses `SectionHeader` internally for its title bar.

---

### SectionHeader — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/ui/SectionHeader.tsx` |
| **Purpose** | Consistent section title used across every page — eliminates duplicated heading styles |

Every content section on the site starts with a heading: "Trending", "Latest Bears News", "Scout Insights", "Top Discussions". Today these are ad-hoc `<h2>` / `<h3>` elements with inconsistent sizing, spacing, and link placement. `SectionHeader` standardizes all of them.

**Props**
```ts
interface SectionHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  link?: {
    label: string              // "View all", "See more", etc.
    href: string
  }
  size?: 'sm' | 'md' | 'lg'   // default: 'md'
  className?: string
}
```

**Variants**
| Size | Use Case | Example |
|------|----------|---------|
| `sm` | Sidebar sections, right rail cards, compact lists | Right rail "Trending" |
| `md` | Standard page sections, feed groups | "Latest Bears News", "Scout Insights" |
| `lg` | Page-level hero headings, top-of-section anchors | "Top Discussions", category hub title |

**Visual anatomy:**
```
┌─────────────────────────────────────────────┐
│  [icon]  Title                  [View all →] │
│          subtitle (optional, muted)          │
└─────────────────────────────────────────────┘
```

**Reuse map:**
| Surface | Size | Example Title |
|---------|------|---------------|
| Homepage feed sections | `md` | "Trending", "For You", "Editor's Picks" |
| Team hub sections | `md` | "Latest Bears News", "Upcoming Games" |
| Right rail cards | `sm` | "Trending", "Live Scores", "Fan Tools" |
| Sidebar sections | `sm` | "Teams", "Tools" |
| Article sidebar | `sm` | "Table of Contents", "Related Articles" |
| Scout AI | `md` | "Scout Insights", "Recent Queries" |
| Category pages | `lg` | Category name as page heading |
| Tool pages | `lg` | "GM War Room", "Mock Draft" |

---

## Feed Primitives

```
FeedCard
ArticleCard
TrendingCard
```

---

### FeedCard — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/ui/FeedCard.tsx` |
| **Purpose** | The universal content card — used everywhere content is previewed in a feed |

**Props**
```ts
interface FeedCardProps {
  title: string
  href: string
  image?: string
  team?: {
    key: string
    name: string
  }
  author?: {
    name: string
    avatarUrl?: string
  }
  time: string
  engagement?: {
    views?: number
    reactions?: number
    comments?: number
  }
  excerpt?: string
  badge?: string               // "LIVE", "BREAKING", "RUMOR", etc.
  variant?: 'default' | 'compact' | 'featured' | 'video' | 'stat'
  className?: string
  onClick?: () => void
}
```

**Variants**
| Variant | Layout | Use Case |
|---------|--------|----------|
| `default` | Image top, title, meta row, excerpt | Homepage feed, category pages, search results |
| `compact` | Thumbnail left (80px), title + meta right | Related articles, mobile list |
| `featured` | Full-width hero image, large title overlay | Editor picks, top story, homepage hero slot |
| `video` | Image with play button overlay + duration badge | Video content, Film Room |
| `stat` | No image — stat highlight header, title, team badge | Scout results, data hub |

**Visual anatomy (all variants share these slots):**
```
┌─────────────────────────────┐
│  [image / video / stat]     │
│  [badge]          [team]    │
│  title                      │
│  author • time • engagement │
│  [excerpt]                  │
└─────────────────────────────┘
```

**Reuse:** Homepage river, team hub articles, category pages, search results, mobile feed.

---

### ArticleCard — EXISTS (refactor to use FeedCard internally)

| Field | Value |
|-------|-------|
| **File** | `src/components/article/ArticleCard.tsx` |
| **Purpose** | Article-specific card with category routing, reading time, and content-aware metadata |

`ArticleCard` is a higher-level wrapper around `FeedCard` that adds article-specific concerns: category links, reading time calculation, content excerpting, and article-specific click tracking. It maps article data into FeedCard props.

**Props**
```ts
interface ArticleCardProps {
  title: string
  slug: string
  excerpt?: string
  featuredImage?: string
  category: { name: string; slug: string }
  author?: { id: string; name: string; avatarUrl?: string }
  publishedAt: string
  readingTime?: number
  variant?: 'default' | 'compact' | 'featured' | 'video'
  className?: string
}
```

**Relationship to FeedCard:** ArticleCard owns the article domain logic (slug → href, category routing, reading time). It renders a FeedCard internally and passes the mapped props through.

**Reuse:** Article lists, category pages, related articles, search results.

---

### TrendingCard — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/ui/TrendingCard.tsx` |
| **Purpose** | Ranked trending item — numbered position + compact content preview |

Trending lists have a distinct visual pattern: a large rank number, tight content preview, and engagement signal. This is different enough from FeedCard to warrant its own component.

**Props**
```ts
interface TrendingCardProps {
  rank: number                 // 1, 2, 3, etc.
  title: string
  href: string
  team?: {
    key: string
    name: string
  }
  time: string
  engagement?: {
    views?: number
    reactions?: number
  }
  image?: string               // optional small thumbnail
  isLive?: boolean             // live indicator dot
  className?: string
}
```

**Visual anatomy:**
```
┌───┬──────────────────────────┐
│ 1 │  Title text here         │
│   │  team • 2h ago • 1.2k   │
└───┴──────────────────────────┘
```

- Large rank number left-aligned, brand-colored for top 3
- Compact single-line meta: team badge, relative time, engagement count
- Optional small thumbnail right-aligned
- Optional live dot next to title when `isLive`

**Reuse:** Homepage right rail "Trending", team hub trending, category page trending, mobile trending section (via SwipeableRow).

---

## Tool Components

```
ToolPageShell
PlayerCard
StatTable
ComparisonChart
```

---

### ToolPageShell — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/tools/ToolPageShell.tsx` |
| **Purpose** | Shared layout wrapper for all tool pages — consistent header, team context, back nav |

**Props**
```ts
interface ToolPageShellProps {
  title: string
  teamKey?: string
  teamColor?: string
  backHref?: string            // default: /home
  headerActions?: ReactNode    // share button, settings, etc.
  children: ReactNode
}
```

**Reuse:** GM page, Mock Draft page, Season Simulator, Leaderboards. Gives tools a consistent chrome without duplicating header/nav logic.

---

### PlayerCard — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/tools/PlayerCard.tsx` |
| **Purpose** | Unified player display — used across roster, GM, mock draft, stats |

**Props**
```ts
interface PlayerCardProps {
  name: string
  position: string
  number?: string | number
  headshotUrl?: string
  teamKey?: string
  variant?: 'roster' | 'trade' | 'draft' | 'stat' | 'compact'
  stats?: Record<string, string | number>
  salary?: { capHit: string; years: string }
  onClick?: () => void
  selected?: boolean
  draggable?: boolean
}
```

**Variants**
| Variant | Use Case | Layout |
|---------|----------|--------|
| `roster` | Team roster page | Headshot + name + position + number |
| `trade` | GM trade board | Headshot + name + position + salary |
| `draft` | Mock draft board | Headshot + name + school/team + grade |
| `stat` | Stats page | Compact row with key stats |
| `compact` | Sidebar, search results | Small — avatar + name + position |

**Reuse:** Team roster, GM trade board, Mock Draft prospect list, Player profile header, Stats tables, Search results, Scout responses.

---

### StatTable — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/tools/StatTable.tsx` |
| **Purpose** | Sortable, responsive statistics table for player and team data |

**Props**
```ts
interface StatTableProps {
  columns: Array<{
    key: string
    label: string
    abbr?: string              // short label for mobile ("Passing Yards" → "YDS")
    sortable?: boolean         // default: true
    align?: 'left' | 'center' | 'right'  // default: 'right' for numbers
    format?: 'number' | 'decimal' | 'percent' | 'string'
  }>
  rows: Array<Record<string, string | number>>
  defaultSort?: { key: string; direction: 'asc' | 'desc' }
  highlightRow?: (row: Record<string, string | number>) => boolean
  onRowClick?: (row: Record<string, string | number>) => void
  compact?: boolean            // fewer columns on mobile
  stickyHeader?: boolean       // default: true
  className?: string
}
```

**Variants**
| Variant | Trigger | Behavior |
|---------|---------|----------|
| Default | Desktop | Full columns, sticky header, sort arrows |
| Compact | `compact` or mobile breakpoint | Abbreviated column labels, fewer visible columns, horizontal scroll |

**Reuse:** Team stats page, player game log, player season stats, leaderboards, Scout AI stat responses, GM analytics, roster salary table.

---

### ComparisonChart — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/tools/ComparisonChart.tsx` |
| **Purpose** | Side-by-side comparison visualization — players, teams, or trade scenarios |

**Props**
```ts
interface ComparisonChartProps {
  subjects: Array<{
    name: string
    imageUrl?: string
    teamKey?: string
    color?: string
  }>
  metrics: Array<{
    label: string
    values: number[]           // one per subject, same order
    format?: 'number' | 'decimal' | 'percent'
    higherIsBetter?: boolean   // default: true — determines bar color
  }>
  variant?: 'bar' | 'radar' | 'table'
  title?: string
  className?: string
}
```

**Variants**
| Variant | Use Case |
|---------|----------|
| `bar` | Horizontal bar comparison — player vs player, before/after trade |
| `radar` | Spider/radar chart — multi-dimensional team or player profile |
| `table` | Side-by-side stat table — compact comparison |

**Reuse:** GM trade analysis (before/after), player comparison, team comparison, Scout AI comparison responses, season simulation results.

---

## Scout AI

```
ScoutAvatar
ScoutQueryInput
ScoutResponseBubble
ScoutInsightCard
```

---

### ScoutAvatar — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/scout/ScoutAvatar.tsx` |
| **Purpose** | Scout AI persona icon — consistent across all Scout touchpoints |

**Props**
```ts
interface ScoutAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'    // 20, 28, 40, 64px
  animate?: boolean                     // pulse when processing
  className?: string
}
```

**Source:** `/downloads/scout-v2.png` (existing)

**Reuse:** Scout AI page header, Scout response bubbles, insight cards, sidebar nav, mobile bottom nav, notification badges.

---

### ScoutQueryInput — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/scout/ScoutQueryInput.tsx` |
| **Purpose** | Text input for asking Scout questions — with suggestion chips |

**Props**
```ts
interface ScoutQueryInputProps {
  onSubmit: (query: string) => void
  placeholder?: string
  suggestions?: string[]       // "Ask me about..." chips
  loading?: boolean
  disabled?: boolean
  variant?: 'full' | 'compact'
}
```

**Variants**
| Variant | Location |
|---------|----------|
| Full | Scout AI page — large input with suggestions below |
| Compact | Sidebar widget, homepage card — single line |

**Reuse:** Scout AI page, homepage Scout card, right rail Scout widget, mobile Scout tab.

---

### ScoutResponseBubble — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/scout/ScoutResponseBubble.tsx` |
| **Purpose** | Rendered Scout AI response with streaming text support |

**Props**
```ts
interface ScoutResponseBubbleProps {
  response: string
  isStreaming?: boolean
  chartData?: ChartData
  bonusInsight?: string
  citations?: string[]
  timestamp?: string
}
```

**Contains:** Markdown renderer, inline chart (DataVisualization), citation links, bonus insight callout, ScoutAvatar.

**Reuse:** Scout AI page. Inner DataVisualization component reusable for charts elsewhere.

---

### ScoutInsightCard — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/scout/ScoutInsightCard.tsx` |
| **Purpose** | AI-generated insight card — proactive Scout content that appears in feeds and sidebars |

Unlike ScoutResponseBubble (which is a conversation reply), ScoutInsightCard is a standalone content card that Scout generates proactively — news briefings, rumor analysis, player trends, game previews.

**Props**
```ts
interface ScoutInsightCardProps {
  type: 'news' | 'rumor' | 'trend' | 'game_preview' | 'recap'
  title: string
  summary: string
  team?: {
    key: string
    name: string
  }
  confidence?: number          // 0-100, shown as meter for rumors
  trendDirection?: 'up' | 'down' | 'neutral'
  isLive?: boolean
  timestamp?: string
  href?: string
  className?: string
}
```

**Variants** (by `type`)
| Type | Visual |
|------|--------|
| `news` | Standard card with timestamp |
| `rumor` | Confidence meter + source indicator |
| `trend` | Trend arrow + stat delta |
| `game_preview` | Team matchup header + key stats |
| `recap` | Score + highlights summary |

**Reuse:** Homepage feed (inline Scout cards), homepage right rail, team hub pages, Scout AI page as conversation starters.

---

## Mobile Primitives

```
BottomSheet
SwipeableRow
PullToRefresh
```

---

### BottomSheet — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/ui/BottomSheet.tsx` |
| **Purpose** | Slide-up panel from bottom — mobile alternative to modals and dropdowns |

**Props**
```ts
interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  height?: 'auto' | 'half' | 'full'
  children: ReactNode
  showHandle?: boolean         // default: true — drag handle at top
}
```

**Variants**
| Variant | Use Case |
|---------|----------|
| Auto | Content-sized — filters, options |
| Half | Half-screen — player selection, search results |
| Full | Full-screen — Scout AI chat, GM roster picker |

**Reuse:** Any mobile context that needs an overlay — player selection, filters, Scout chat, share options. Generic primitive, not feature-specific.

---

### SwipeableRow — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/ui/SwipeableRow.tsx` |
| **Purpose** | Horizontal scrolling container with snap behavior |

**Props**
```ts
interface SwipeableRowProps {
  children: ReactNode
  showIndicators?: boolean     // default: true — dot indicators
  snapToCard?: boolean         // default: true — snap scroll
  gap?: number                 // default: 12 — gap between items in px
  className?: string
}
```

**Reuse:** Any horizontal card list on mobile — trending, briefings, quick stats, tool cards, player carousel. Generic layout primitive.

---

### PullToRefresh — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/ui/PullToRefresh.tsx` |
| **Purpose** | Pull-down-to-refresh gesture wrapper for scrollable content |

**Props**
```ts
interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: ReactNode
  disabled?: boolean
}
```

**Reuse:** Any scrollable feed on mobile — homepage, River, team hub, Scout query history. No-op on desktop.

---

## Feature Modules

```
FloatingShareBar
MiniPlayer
SubscriptionBadge
```

---

### FloatingShareBar — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/article/FloatingShareBar.tsx` |
| **Purpose** | Fixed bottom share/action bar on mobile article pages |

**Props**
```ts
interface FloatingShareBarProps {
  url: string
  title: string
  showBookmark?: boolean
  showReactions?: boolean
}
```

**Behavior:** Fixed at bottom above MobileBottomNav. Shows on scroll after hero passes viewport. Replaces inline ShareBar on mobile.

**Reuse:** Article pages, GM trade share pages. Article/content feature — knows about sharing, bookmarks, reactions.

---

### MiniPlayer — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/video/MiniPlayer.tsx` |
| **Purpose** | Compact audio/video player that persists while scrolling |

**Props**
```ts
interface MiniPlayerProps {
  src: string
  title: string
  type: 'audio' | 'video'
  isPlaying: boolean
  onToggle: () => void
  onClose: () => void
}
```

**Behavior:** Docks above MobileBottomNav. Appears when user scrolls past the full player. Tap expands back to full player.

**Reuse:** Article audio player, Bears Film Room, Pinwheels & Ivy, Vision Theater. Media feature component.

---

### SubscriptionBadge — NEW

| Field | Value |
|-------|-------|
| **Location** | `src/components/subscription/SubscriptionBadge.tsx` |
| **Purpose** | Visual indicator of user subscription tier |

**Props**
```ts
interface SubscriptionBadgeProps {
  tier: 'free' | 'edge' | 'edge-plus'
  variant?: 'badge' | 'banner' | 'inline'
}
```

**Variants**
| Variant | Use Case |
|---------|----------|
| Badge | Next to username — small label |
| Banner | Upgrade CTA on gated content |
| Inline | Profile page tier display |

**Reuse:** UserMenu, profile page, paywall overlays, article gates, header.

---

## Component Dependency Map

```
Level 0 (primitives — build first):
  Button, Card, Badge, Avatar, Input, Modal, Tabs, Skeleton,
  FeedCard, SectionHeader, TrendingCard

Level 1 (composed from primitives):
  SidebarSection, RightRailCard, GlassCard, ArticleCard, PlayerCard,
  AuthorCard, ChatBubble, ScoutAvatar, ScoutInsightCard, StatTable

Level 1m (mobile primitives — no feature dependencies):
  BottomSheet, SwipeableRow, PullToRefresh

Level 2 (sections — composed from Level 1):
  LeftSidebar, RightRailModules, ArticleSidebar, ShareBar, TeamFilterPills,
  FanToolsCard, ScoutQueryInput, LeaderboardTable, ComparisonChart,
  PollWidget, ReactionButtons

Level 3 (page-level — composed from Level 2):
  PageShell, ContentArea, ToolPageShell, MobileBottomNav, MobileMenu,
  TradeBoard, SimulationResults, GradeReveal, ScoutResponseBubble,
  CommentSection, QueryHistory

Level 3f (feature modules — depend on feature context):
  FloatingShareBar (article), MiniPlayer (video), SubscriptionBadge (subscription)
```

---

## Summary

| Group | Components | Status |
|-------|-----------|--------|
| Layout Primitives | ContentArea, SidebarSection, SectionHeader | NEW |
| Feed Primitives | FeedCard, ArticleCard, TrendingCard | 1 EXISTS + 2 NEW |
| Tool Components | ToolPageShell, PlayerCard, StatTable, ComparisonChart | NEW |
| Scout AI | ScoutAvatar, ScoutQueryInput, ScoutResponseBubble, ScoutInsightCard | NEW |
| Mobile Primitives | BottomSheet, SwipeableRow, PullToRefresh | NEW |
| Feature Modules | FloatingShareBar, MiniPlayer, SubscriptionBadge | NEW |
| **Total new** | **20 components** | |

---

# Part 2: Existing Component Reference

These components already exist in the codebase. They need Figma alignment, not rebuilding. Listed here for reference during implementation.

---

## Layout (EXISTS)

### PageShell
- **File:** `src/app/layout.tsx`
- **Purpose:** Root layout — header + left sidebar + content + footer
- **Variants:** Default, Admin, Tool, Immersive

### Header
- **File:** `src/components/layout/Header.tsx`
- **Purpose:** Top nav bar with logo, nav links, search, user menu, theme toggle
- **Contains:** LiveGamesTopBar, TeamStickyBarRouter, SearchModal trigger

### LeftSidebar
- **File:** `src/components/layout/LeftSidebar.tsx`
- **Purpose:** Persistent left navigation — tools, teams, profile
- **Sections:** Scout AI, Simulators, Fan Hub, Data Cosmos, Teams (5), Profile

### Footer
- **File:** `src/components/layout/Footer.tsx`
- **Purpose:** Global footer with links and legal

### RightRailCard
- **File:** `src/components/SportsRiver/RightRailCard.tsx`
- **Props:** `title`, `children`, `accentColor?`, `glass?`

---

## Navigation (EXISTS)

### TeamFilterPills
- **File:** `src/components/SportsRiver/TeamFilterPills.tsx`
- **Props:** `selected`, `onChange`, `teams?`, `showAll?`

### TeamPicker
- **File:** `src/components/SportsRiver/TeamPicker.tsx`
- **Props:** `selected?`, `onSelect`, `mode?` (cards/dropdown), `filter?`

### Breadcrumb
- **File:** `src/components/layout/Breadcrumb.tsx`
- **Props:** `items` (label + href array)

### Tabs
- **File:** `src/components/ui/Tabs.tsx`
- **Props:** `defaultTab?`, `teamColor?`, `onChange?`
- **Tab props:** `id`, `icon?`, `disabled?`

### LiveScoreStrip
- **Files:** `LiveTicker.tsx`, `LiveGamesTopBar.tsx`, `LiveStrip.tsx`
- **Note:** 3 implementations — should consolidate into one

---

## Article (EXISTS)

### ArticleHero
- **File:** `src/components/article/ArticleHero.tsx`
- **Props:** `title`, `featuredImage?`, `category`, `author`, `publishedAt`, `variant?` (standard/immersive/video)

### ArticleBody
- **File:** `src/components/article/ArticleContent.tsx`
- **Props:** `content` (HTML string)
- **Supports:** Charts, pull quotes, fact boxes, embeds, galleries

### ArticleSidebar
- **File:** `src/components/article/ArticleSidebar.tsx`
- **Props:** `author?`, `content?`, `relatedPosts?`, `showTableOfContents?`, `showAuthor?`, `showRelated?`, `showAd?`

### ShareBar
- **File:** `src/components/article/ArticleShareBar.tsx`
- **Props:** `url`, `title`, `variant?` (inline/floating/compact)

### ReadingProgressBar
- **File:** `src/components/article/ReadingProgressBar.tsx`
- **Props:** `color?` (default: `#bc0000`)

### AuthorCard
- **File:** `src/components/article/AuthorCard.tsx`
- **Props:** `author` (id, name, avatarUrl, bio, role), `variant?` (sidebar/inline/full)

---

## Tools (EXISTS)

### TradeBoard
- **File:** `src/components/gm/TradeBoard.tsx`
- **Sub-components:** AssetRow, ValidationIndicator, DraftPickValueWidget, VeteranTradeValueWidget, GradeProgressButton, SuggestedTradePanel

### GradeReveal
- **File:** `src/components/gm/GradeReveal.tsx`
- **Props:** `grade` (0-100), `reasoning`, `status`, `breakdown?`, `isDangerous?`

### SimulationResults
- **File:** `src/components/gm/SimulationResults.tsx`
- **Props:** `result`, `tradeCount`, `teamName`, `teamColor`, `onSimulateAgain`, `onClose`
- **Tabs:** Overview, Analysis, Games, Standings, Playoffs, Summary

### FanToolsCard
- **File:** `src/components/SportsRiver/FanToolsCard.tsx`
- **Note:** Currently standalone with hardcoded tools — should accept props

### DataVisualization
- **File:** `src/components/ask-ai/DataVisualization.tsx`
- **Props:** `chartData` (type, title, labels, datasets), `bonusInsight?`

---

## Community (EXISTS)

### PollWidget
- **Props:** `pollId`, `question`, `options`, `userVote?`, `onVote`, `variant?` (card/inline/embed)

### ReactionButtons
- **Props:** `targetId`, `targetType`, `reactions`, `userReactions?`, `onReact`

### LeaderboardTable
- **Props:** `entries`, `currentUserId?`, `limit?`, `variant?` (full/compact)

### CommentSection
- **Props:** `articleId`, `comments`, `onSubmit`, `currentUser?`

---

## Profile (EXISTS)

### UserMenu
- **File:** `src/components/layout/UserMenu.tsx`
- **Props:** `user` (name, email, avatarUrl, role)

### Avatar
- **File:** `src/components/ui/Avatar.tsx`
- **Props:** `src?`, `alt?`, `name?`, `size?` (xs–2xl), `status?` (online/away/offline)

### FavoriteTeams
- **Props:** `selected`, `onChange`, `showEliminate?`, `variant?` (onboarding/settings)

### QueryHistory
- **Props:** `queries`, `onSelect`, `onClear`, `variant?` (sidebar/drawer)

---

## UI Primitives (EXISTS)

### Button
- **Props:** `variant` (default/destructive/outline/secondary/ghost/link), `size` (default/sm/lg/icon), `asChild?`

### Card
- **Compound:** Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

### Badge
- **Props:** `variant` (default/secondary/destructive/outline)

### Modal
- **Props:** `isOpen`, `onClose`, `title?`, `size?` (sm/md/lg/xl/full), `footer?`, `closeOnOverlay?`, `closeOnEscape?`

### GlassCard
- **Props:** `variant?` (light/dark), `blur?` (sm/md/lg)

---

## Mobile (EXISTS)

### MobileBottomNav
- **File:** `src/components/layout/MobileBottomNav.tsx`
- **Tabs:** Home, Scout AI, GM, Fan Hub, Profile
- **Behavior:** Hides on scroll down, shows on scroll up, iOS safe area

### MobileMenu
- **File:** `src/components/layout/MobileMenu.tsx`
- **Props:** `isOpen`, `onClose`
- **Contains:** All LeftSidebar sections + team links + user menu + theme toggle
