# SM EDGE — Development Blueprint

> **Generated:** 2026-03-08
> **Source:** Figma file "SM EDGE" (C9SGx9mgtT3U9FPYBcE3IW)
> **Figma last modified:** 2026-03-08T15:04:44Z

This document maps the 8 Figma pages to product areas, existing code, planned routes, component needs, and mobile/sidebar considerations. It serves as the implementation plan for aligning the frontend with the design system.

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| BUILT | Route and core components exist in codebase |
| PARTIAL | Route exists but needs redesign or missing pieces |
| PLANNED | No implementation yet — needs new work |

---

## 1. Platform Flow

| Field | Value |
|-------|-------|
| **Figma Page** | `00 Platform Flow` |
| **Figma Frame** | "Sports Mockery EDGE – User Flow" (1920x1200, 6 children) |
| **Product Area** | Information architecture / navigation map |
| **Status** | Reference only — not a buildable page |

### What This Page Represents

The user flow diagram contains labeled cards for "Homepage" and "Article" with connector rectangles, mapping how users navigate between sections. This is the **site map** — the blueprint for all other pages.

### Observed Flow Nodes (from file.json)

| Node | Text | Purpose |
|------|------|---------|
| 3:8 / 3:9 | "Homepage" | Entry point — river feed or /home hub |
| 3:13 / 3:14 | "Article" | Content detail — /(category)/[slug] |

### Action Items

- [ ] As you add more flow nodes in Figma (Tools, Scout, Team Pages, etc.), re-run `npm run figma:sync` to capture them
- [ ] Use this page as the canonical navigation map — every product area below should trace back to a node here
- [ ] No code to write for this page — it's a reference document

---

## 2. Homepage

| Field | Value |
|-------|-------|
| **Figma Page** | `01 Homepage` |
| **Product Area** | Primary landing experience |
| **Status** | BUILT — multiple variants exist, needs design consolidation |

### Existing Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` (root) | `RiverPageClient` | AI-curated sports river feed (current default) |
| `/home` | Home hub | Feature grid with Scout, GM, Mock Draft links |
| `/river` | River feed | Alternate river entry |
| `/home1` | Legacy layout | Old homepage (deprecated) |

### Existing Components

**River/Feed:** `RiverLayout`, `RiverFeed`, `ScoutBriefingCard`, `ScoutBriefingGrid`, `FanToolsCard`, `RightRailCard`, `BaseGlassCard`, `TeamFilterPills`, `TeamPicker`

**Homepage variants:** `Homepage2030`, `HomepageV3`, `ForYouFeed`, `EditorPicksHero`, `TrendingSection`, `StorylineBlock`, `CatchUpTimeline`, `TeamFilterTabs`, `PostCard`

### What Needs Design Alignment

- [ ] **Consolidate homepage variants** — The codebase has 4+ homepage layouts. Figma should define THE homepage, then we retire the others.
- [ ] **River feed layout** — Confirm the 3-column layout (left sidebar / main feed / right rail) matches Figma intent
- [ ] **Hero treatment** — Define whether homepage leads with editor picks hero, scout briefing, or personalized feed
- [ ] **Card system** — Standardize article card sizes (compact, standard, large, video) to match Figma card designs

### Reusable Components Needed

| Component | Shared By | Notes |
|-----------|-----------|-------|
| `ArticleCard` (3 sizes) | Homepage, Team Pages, Category Pages | Already exists in multiple variants — unify to Figma spec |
| `ScoutBriefingCard` | Homepage, Sidebar | Already built — verify matches design |
| `TeamFilterPills` | Homepage, River | Already built |
| `LiveScoreStrip` | Homepage top, all pages | Already built as `LiveTicker` / `LiveGamesTopBar` |

### Mobile Considerations

- Bottom tab nav (`MobileBottomNav`) already exists — verify Figma mobile page aligns with tab structure
- River feed should be single-column on mobile with no right rail
- Scout briefing card needs mobile-optimized layout (currently collapses)
- Pull-to-refresh pattern for feed updates

### Sidebar / Card Reuse

- Right rail on desktop shows: trending articles, live scores, Scout AI prompt, fan tools
- `RightRailCard` and `FanToolsCard` already exist — match to Figma spec
- Sidebar content should collapse into expandable sections on tablet

---

## 3. Article Templates

| Field | Value |
|-------|-------|
| **Figma Page** | `02 Article Templates` |
| **Product Area** | Content consumption — article detail pages |
| **Status** | BUILT — extensive component library exists, needs design polish |

### Existing Routes

| Route | Purpose |
|-------|---------|
| `/(category)/[slug]` | Primary article detail (dynamic by team/topic) |
| `/home/article/[slug]` | Alternate article route |

### Existing Components (48 article-related)

**Core:** `ArticleContent`, `ArticleHero`, `ArticleBodyCard`, `ArticleSidebar`
**Navigation:** `TableOfContents`, `NextPrevArticle`, `RelatedArticles`
**Metadata:** `ArticleMeta`, `ReadingTime`, `ReadingProgressBar`, `ViewCount`
**Social:** `ArticleShareBar`, `ShareButtons`, `BookmarkButton`, `ReactionButtons`, `CommentSection`
**Media:** `ArticleChart`, `ImageGallery`, `EmbedVideo`, `TwitterEmbed`, `ArticleAudioPlayer`
**Cards:** `ArticleCard`, `ArticleCardCompact`, `ArticleCardLarge`, `ArticleCardVideo`
**Special:** `MockeryCommentary`, `PullQuote`, `FactBox`, `ScoutRecapCard`

### What Needs Design Alignment

- [ ] **Article hero variants** — Define 2-3 hero templates (standard image, video, immersive full-bleed) in Figma
- [ ] **Body typography** — Figma text styles should map to article body CSS (currently using Inter 32px from flow — needs article-specific sizes)
- [ ] **Sidebar layout** — Confirm article sidebar matches `05 Sidebar + Cards` Figma page
- [ ] **Chart/data embeds** — Standardize how inline charts and stat cards appear within article body
- [ ] **Scout recap integration** — Define placement of AI-generated recap cards within articles

### Reusable Components Needed

| Component | Shared By | Notes |
|-----------|-----------|-------|
| `ArticleSidebar` | Article pages, Team hub articles | Reuse sidebar card system from page 05 |
| `AuthorCard` | Article detail, Author profile | Already exists |
| `RelatedArticles` | Article bottom, Category pages | Already exists — verify card style |
| `ShareButtons` | Articles, GM trades, Mock drafts | Already exists — ensure consistent placement |

### Mobile Considerations

- Article sidebar drops below content on mobile
- Reading progress bar should be sticky on mobile
- Share buttons should float as a bottom bar on mobile (not inline)
- Image gallery needs swipe support
- Audio player needs mini-player mode when scrolling

### Sidebar / Card Reuse

- Article sidebar should use the same card components as homepage right rail
- "Related articles" section at bottom should use the same `ArticleCard` variants as homepage

---

## 4. Tools

| Field | Value |
|-------|-------|
| **Figma Page** | `03 Tools` |
| **Product Area** | Interactive fan tools — GM Simulator, Mock Draft, Season Sim, Leaderboards |
| **Status** | BUILT — all major tools exist, need design refresh |

### Existing Routes

| Route | Tool | Status |
|-------|------|--------|
| `/gm` | GM Trade Simulator | BUILT — war room UI with AI grading |
| `/gm/analytics` | GM Analytics | BUILT |
| `/gm/share/[code]` | Shared Trades | BUILT |
| `/mock-draft` | Mock Draft | BUILT — NFL/MLB draft simulation |
| `/mock-draft/share/[mockId]` | Shared Mocks | BUILT |
| `/home/simulators` | Season Simulator | BUILT — V3 with DataLab AI |
| `/leaderboards` | GM Leaderboard | BUILT |
| `/predictions` | Game Predictions | PARTIAL |

### Existing Components

**GM (12 files):** `TradeBoard`, `RosterPanel`, `SimulationResults`, `GradeReveal`, `LeaderboardPanel`, `DraftPickList`, `TeamFitRadar`, `ThreeTeamTradeBoard`, `WarRoomHeader`, `SimulationTrigger`, `SimulationChart`

**Mock Draft:** `DraftPickSelector`, `ProspectCard`

### What Needs Design Alignment

- [ ] **Tool landing/picker** — Define a unified tools hub page (currently scattered across `/home` feature grid)
- [ ] **GM war room layout** — Match trade board + roster panels + grade reveal to Figma
- [ ] **Mock draft flow** — Team picker → draft board → results flow
- [ ] **Simulation results** — 6-tab results view (overview, records, playoffs, roster, narrative, Monte Carlo)
- [ ] **Shared view templates** — Public share pages for trades and mocks need branded treatment

### Reusable Components Needed

| Component | Shared By | Notes |
|-----------|-----------|-------|
| `PlayerCard` | GM roster, Mock draft, Team roster, Stats | Needs unified design across all contexts |
| `GradeReveal` | GM trades, Mock draft picks | Already exists for GM — extend to mock |
| `TeamLogo` | All tools, team pages, sidebar | Already scattered — consolidate |
| `ToolPageShell` | All tool pages | Shared header/nav/layout for tool pages |

### Mobile Considerations

- GM trade board needs completely different mobile layout (stacked panels, not side-by-side)
- Mock draft should support swipe between picks on mobile
- Simulation results tabs should be swipeable
- Share pages must be fully responsive (often viewed on phones via social links)
- Consider bottom sheet pattern for player selection on mobile

### Sidebar / Card Reuse

- Tools pages don't currently use sidebar — consider adding contextual tips or related content
- Leaderboard cards could appear in homepage right rail as a teaser

---

## 5. Scout AI

| Field | Value |
|-------|-------|
| **Figma Page** | `04 Scout AI` |
| **Product Area** | AI sports assistant — conversational query interface |
| **Status** | BUILT — full query flow exists, needs design refinement |

### Existing Routes

| Route | Purpose |
|-------|---------|
| `/home/scout` | Primary Scout AI page |
| `/ask-ai` | Alternate entry (legacy) |
| `/scout-ai` | Another alias |

### Existing Components

**Scout UI:** Query input, response display, session history, chart rendering, citation display
**Integration points:** Scout briefing cards (homepage), Scout concierge overlay, Scout radar

### What Needs Design Alignment

- [ ] **Chat interface** — Define the query/response conversation layout in Figma
- [ ] **Scout persona** — Visual treatment for Scout's avatar, response bubbles, loading states
- [ ] **Chart/data rendering** — How Scout-generated charts and tables appear inline
- [ ] **Session history** — Sidebar or drawer for past conversations
- [ ] **Proactive suggestions** — "Ask me about..." prompt chips before first query
- [ ] **Scout icon** — Currently uses `/downloads/scout-v2.png` — confirm this is the canonical icon

### Reusable Components Needed

| Component | Shared By | Notes |
|-----------|-----------|-------|
| `ScoutAvatar` | Scout page, briefing cards, sidebar, mobile nav | Icon already exists — needs component wrapper |
| `ChatBubble` | Scout AI, Fan Chat | Different styling but similar structure |
| `QueryInput` | Scout AI (could share with search) | Specialized but pattern is reusable |
| `InlineChart` | Scout responses, articles, team stats | Chart rendering component |

### Mobile Considerations

- Chat interface should be full-screen on mobile (no sidebar)
- Input should be sticky at bottom with keyboard-aware positioning
- Response streaming needs mobile-optimized rendering
- Session history accessible via hamburger or swipe gesture
- Scout briefing notifications on mobile home screen

### Sidebar / Card Reuse

- `ScoutBriefingCard` already appears in homepage right rail — confirm Figma spec
- Scout could appear as a floating action button on other pages
- Session context sidebar (player/team/season) useful on desktop

---

## 6. Sidebar + Cards

| Field | Value |
|-------|-------|
| **Figma Page** | `05 Sidebar + Cards` |
| **Product Area** | Shared UI patterns — sidebar layouts and card components |
| **Status** | PARTIAL — components exist but not unified to a design system spec |

### This Is the Most Important Design System Page

This page should define the canonical card and sidebar patterns used across the entire platform. Every other page references these components.

### Existing Sidebar Components

| Component | Location | Used By |
|-----------|----------|---------|
| `LeftSidebar` | `/layout/LeftSidebar.tsx` | Root layout — global left nav |
| `ArticleSidebar` | `/article/ArticleSidebar.tsx` | Article pages |
| `RightRailCard` | `/SportsRiver/RightRailCard.tsx` | Homepage right rail |
| `FanToolsCard` | `/SportsRiver/FanToolsCard.tsx` | Homepage right rail |
| `BaseGlassCard` | `/SportsRiver/BaseGlassCard.tsx` | Homepage cards |

### Existing Card Components

| Component | Purpose |
|-----------|---------|
| `Card` (ui) | Base card primitive |
| `GlassCard` (ui) | Frosted glass variant |
| `GlowCard` (ui) | Glowing border variant |
| `AnimatedCard` (ui) | Motion-enabled card |
| `ArticleCard` (3 sizes) | Content cards |
| `PostCard` | Feed post card |
| `ScoutBriefingCard` | AI briefing card |
| `ErrorCard` | Error state card |
| `TeamSeasonCard` | Team hub season card |

### What Needs Design Alignment

- [ ] **Card hierarchy** — Define 3-4 canonical card sizes/styles that everything else derives from
- [ ] **Sidebar anatomy** — Left nav sections, right rail sections, article sidebar sections
- [ ] **Card states** — Default, hover, active, loading (skeleton), error, empty
- [ ] **Card content slots** — Image, title, meta, action area — standardize across all card types
- [ ] **Glass/glow treatment** — When to use glass vs solid vs glow cards — make this a clear rule

### Reusable Components to Standardize

| Component | Current State | Design System Target |
|-----------|--------------|---------------------|
| `Card` | Base primitive exists | Add size variants (sm, md, lg) matching Figma |
| `SidebarSection` | Not formalized | Collapsible section with header — reuse in left nav, right rail, article sidebar |
| `CardSkeleton` | `SkeletonLoader` exists | Match skeleton shapes to each card variant |
| `LiveScoreCard` | Inline in ticker | Extract as standalone card for sidebar use |
| `TrendingCard` | Part of `TrendingSection` | Extract as standalone for right rail |

### Mobile Considerations

- Left sidebar becomes `MobileMenu` (slide-out drawer) — verify Figma mobile page matches
- Right rail cards stack vertically below main content on mobile
- Cards should maintain tap targets >= 44px on mobile
- Consider horizontal scroll for card rows on mobile (e.g., trending)

### Sidebar / Card Reuse

This IS the sidebar/card reference page. Key decisions to make in Figma:

1. **Left sidebar** — What sections? Teams, navigation, Scout shortcut, live scores?
2. **Right rail** — What cards appear? Trending, Scout, live scores, ad slots, fan tools?
3. **Article sidebar** — Related articles, author card, newsletter signup, ad slot?
4. **Card border radius** — Currently 12px from flow frame — confirm as standard

---

## 7. Mobile

| Field | Value |
|-------|-------|
| **Figma Page** | `06 Mobile` |
| **Product Area** | Mobile-specific layouts and responsive patterns |
| **Status** | PARTIAL — mobile components exist but need design-driven polish |

### Existing Mobile Components

| Component | Purpose |
|-----------|---------|
| `MobileBottomNav` | Bottom tab bar (Home, Search, Scout, Profile) |
| `MobileMenu` | Slide-out hamburger menu |
| `MobileMenu` variants | Team-specific mobile menus |

### Existing Mobile Patterns

- Responsive breakpoints via Tailwind (`sm`, `md`, `lg`, `xl`)
- Bottom nav hides on scroll down, shows on scroll up
- Sidebar collapses to drawer
- Article sidebar drops below content

### What Needs Design Alignment

- [ ] **Bottom tab bar** — Define exactly which tabs and icons (currently: Home, Search, Scout, Profile)
- [ ] **Mobile homepage** — Single-column feed layout
- [ ] **Mobile article** — Reading experience with floating share bar
- [ ] **Mobile tools** — GM and Mock Draft mobile layouts (currently weak)
- [ ] **Mobile Scout** — Full-screen chat interface
- [ ] **Mobile navigation** — Team switching, hamburger menu contents
- [ ] **Touch patterns** — Swipe gestures, pull-to-refresh, bottom sheets
- [ ] **Safe areas** — Bottom nav + iOS safe area handling

### Reusable Components Needed

| Component | Notes |
|-----------|-------|
| `BottomSheet` | For player selection, filters, settings on mobile |
| `SwipeableCards` | Horizontal card carousel for mobile feeds |
| `MiniPlayer` | Compact audio/video player when scrolling |
| `FloatingActionButton` | Scout AI quick-access on mobile |

### Key Mobile Breakpoints (Current)

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, bottom nav, no sidebars |
| Tablet | 640-1024px | Two columns, collapsible sidebar |
| Desktop | > 1024px | Three columns, full sidebar |

---

## 8. Components

| Field | Value |
|-------|-------|
| **Figma Page** | `07 Components` |
| **Product Area** | Design system component library |
| **Status** | PARTIAL — 32 UI components exist, need Figma-driven spec |

### Existing UI Component Library (`src/components/ui/`)

**Inputs:** `Button`, `Input`, `TextArea`, `Select`, `Checkbox`
**Display:** `Card`, `Badge`, `Avatar`, `Tooltip`, `Table`
**Feedback:** `Modal`, `Toast`, `Sonner`, `LoadingSpinner`, `LoadingDots`, `Skeleton`
**Navigation:** `Tabs`, `Dropdown`, `scroll-area`
**Decorative:** `GlassCard`, `GlowCard`, `AnimatedCard`, `GradientHeader`, `GradientText`
**States:** `EmptyState`, `ErrorCard`, `PulsingDot`

### What Needs Design Alignment

- [ ] **Button variants** — Define primary, secondary, ghost, danger with exact colors (primary = `#bc0000`)
- [ ] **Typography scale** — Map Figma text styles to Tailwind classes (currently Inter, need full scale)
- [ ] **Color tokens** — Extract from Figma styles once defined (brand red `#bc0000`, dark bg `#1e1e1e`, etc.)
- [ ] **Spacing scale** — Confirm Tailwind default or define custom spacing
- [ ] **Icon system** — Standardize icon source (currently mixed: inline SVG, image files, Lucide)
- [ ] **Dark mode tokens** — Define dark/light color pairs in Figma
- [ ] **Animation tokens** — Standard easing curves, durations for transitions

### Priority Component Specs Needed from Figma

| Priority | Component | Why |
|----------|-----------|-----|
| 1 | `Button` | Used everywhere — needs exact spec |
| 2 | `Card` (3 sizes) | Foundation for all content display |
| 3 | `Input` / `SearchInput` | Used in Scout, search, forms |
| 4 | `Badge` / `Tag` | Team labels, status indicators |
| 5 | `Avatar` | Player photos, user profiles, Scout icon |
| 6 | `Tabs` | Used in team pages, GM results, stats |
| 7 | `Modal` / `BottomSheet` | Dialogs and mobile overlays |
| 8 | `Skeleton` | Loading states for every card variant |

---

## Implementation Priority

Based on the Figma structure and what already exists, here's the recommended build order:

### Phase 1 — Design Foundation (Do First)

1. **Fill out `07 Components` in Figma** — Buttons, cards, inputs, typography, colors
2. **Fill out `05 Sidebar + Cards` in Figma** — Card hierarchy, sidebar anatomy
3. Run `npm run figma:sync` → extract tokens → update `tailwind.config.ts`
4. Align existing `src/components/ui/` to match Figma specs

### Phase 2 — Core Pages

5. **`01 Homepage` in Figma** → Consolidate homepage variants to one canonical layout
6. **`02 Article Templates` in Figma** → Polish article hero, body, sidebar
7. Build/update components to match

### Phase 3 — Feature Pages

8. **`03 Tools` in Figma** → GM, Mock Draft, Simulator design refresh
9. **`04 Scout AI` in Figma** → Chat interface, response rendering
10. Build/update tool page layouts

### Phase 4 — Mobile + Polish

11. **`06 Mobile` in Figma** → Mobile-specific layouts for all pages
12. Implement responsive refinements
13. Final cross-page consistency pass

---

## Design Token Pipeline

Once Figma styles are defined, the sync pipeline extracts them automatically:

```bash
npm run figma:sync          # Fetch + extract pages + tokens + summary
```

Then copy `figma/tokens.json` → `tailwind` section into `tailwind.config.ts`:

```ts
// tailwind.config.ts → theme.extend
colors: {
  'brand-red': '#bc0000',
  'dark-bg': '#1e1e1e',
  // ... from tokens.json
},
fontSize: {
  // ... from tokens.json
}
```

---

## File Reference

| File | Purpose |
|------|---------|
| `figma/pages.json` | Figma page/frame structure (re-run to update) |
| `figma/tokens.json` | Extracted design tokens + Tailwind map |
| `figma/sync-summary.json` | Quick overview of Figma file contents |
| `figma/DEVELOPMENT_BLUEPRINT.md` | This document |
| `scripts/figma/README.md` | How to run the sync pipeline |

---

## Next Steps

1. **Design in Figma** — Start with `07 Components` and `05 Sidebar + Cards` — these unlock everything else
2. **Re-sync often** — Run `npm run figma:sync` after each design session to keep this data current
3. **Export assets** — Once icons/logos are placed in Figma, export with `npm run figma:export -- <nodeIds>`
4. **Update this blueprint** — As Figma frames are added, re-generate or manually update section statuses
