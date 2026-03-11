# Figma Branch Changes — Merged to Main

> **Date:** 2026-03-10
> **Branch:** Figma → main
> **Purpose:** Homepage redesign (SearchHero, three-column feed, EDGE branding)
> **Revert:** `git revert <merge-commit-hash>` or `git reset --hard <commit-before-merge>`

---

## Last Main Commit Before Merge

```
7a66fcd1 Replace EDGE page title with EdgeLogo component for improved branding consistency
```

## Figma Commits (newest first)

```
c7502758 Add 25px padding between headline and search box
cd5ae756 Move Scout icon above headline with greeting to its right, headline and search below
3f500eb5 Force headline to single line with whitespace-nowrap
f7fcdb20 Polish SearchHero: two-column layout, tighter spacing, Tailwind cleanup
3c0347a1 Add welcome subtitle, change headline to What can I help you with?
3baeb4aa Fix bottom-alignment and spacing with inline styles instead of Tailwind
875539d4 Bigger Scout icon, bottom-align greeting, wider search box, more spacing
c893bbfd Align SearchHero to middle feed column instead of full viewport
6319fdd8 Replace For You SVG icon with Edge_Dash.png Chicago star image
d55cbca4 Add more padding between headline and Ask Scout input box
2413238a Update headline text, add spacing, and center search box
f11fcbed Replace For You icon with red Chicago six-pointed star SVG
c3addfd7 Align SearchHero layout: left-align greeting/headline, widen input, increase sizes
d71ca4ea Force homepage to light mode and use EDGE logo in SearchHero
3659aa33 Adjust SearchHero layout: Scout icon left, greeting right with better spacing
e7e315f7 Add v0 homepage redesign with three-column feed layout
dd642c59 Add Figma article templates, block editor, and integrate into post system
fab7f24f Update GM Score integration in War Room specification
10897ace Refine SM Edge Components
4ee9f42e Refactor audio playback in ScoutBox component
829a178c Update package-lock.json and sitemap
7a6e5598 Add Figma sync pipeline with development blueprint and component plan
f6e53206 Add pulse line animations to homepage background
8f4a0a83 Implement special case handling for 'scout-briefing' slug
72548985 Increase EDGE logo and EDGE+ image sizes in RiverLayout right rail
5c24bce1 Add dash streak animations behind feature cards on /home
deb91a73 Update icons in FanToolsCard, LeftSidebar, and MobileBottomNav
3b7df814 Refactor ScoutBox audio playback and enhance button functionality
631dca76 Update Scout icon with cleaned-up version, add Scout voice to ElevenLabs
bb045b68 Integrate audio playback functionality in ScoutBox component
34426935 Add Scout voice ID to ElevenLabs voice IDs in audio route
9f2f669f Refactor ScoutBox button layout and styling
9a7c3966 Enhance Scout components and layout
f3f4c1e7 Implement left rail glass card styling and enhance Scout components
e0ed0552 Add EDGE Plus download image asset
f8f58575 Refactor SportsRiver cards to use CardActionButtons
48b35269 Fix WordPress sync fetching oldest posts instead of newest
0c49e833 Enhance RiverLayout with new RightUtilityRail component
9016fce7 Update WordPress sync logic to fetch posts in reverse order
02e2ea52 Refactor layout and components for improved design and consistency
729f1182 Move sidebar to left, integrate Scout into unified briefing module
731ee8af Fix build: remove stale feedRef, inline opacity styles from RiverFeed
7c4efe06 Rename River to Dash in TeamPicker, replace GSAP card reveals
8b9fd3f9 Update audio player and feed components
06594df0 Redesign homepage: wider feed, animated Scout greeting, glass briefing cards
c73ba971 Update feed components, team picker, user preferences
76479599 Add feed mode selector, team filter pills, since-last-visit card, team picker
18a48103 Include pending changes: river API, card fixes, newsletter route, audio player provider
55dd9af2 Move right sidebar to floating left panel, remove old LeftSidebar
7c396e7d Add gsap, react-intersection-observer deps and updated RiverFeed card rendering
bdfa10b8 Add Scout greeting, briefing grid, improved right rail, and T5 feed cards
22e39aca Add remaining river/scout components and docs
08a85c19 Add river feed, updated homepage, and pending changes
22f8eb54 Remove footer from layout
34d4968d Remove NavigationOrb, center right sidebar vertically
09d34c6a Update left sidebar to 75px collapsed with matching glassmorphism
5a64bef4 Update left sidebar to 75px collapsed, match CommandPanel glassmorphism styling
6c81931a Add EDGE left sidebar rail
e99f8d5b Make 1/3 of hero orbs cyan #00D4FF
820638f2 Remove briefing strip, feed toggle, personalize banner
718ef930 Add admin user profile detail page and fix Badge export
6d70cfd9 Update package-lock.json to add new dependencies
```

## All Files Changed (A=Added, M=Modified)

### Homepage Components
- M `src/app/page.tsx`
- A `src/components/homepage/SearchHero.tsx`
- A `src/components/homepage/HomepageFeedV2.tsx`
- A `src/components/homepage/HomeSidebar.tsx`
- A `src/components/homepage/MainFeed.tsx`
- A `src/components/homepage/TrendsSidebar.tsx`
- A `src/components/homepage/TopIntelligenceCard.tsx`
- A `src/components/homepage/RiverCards.tsx`
- M `src/components/homepage/HomepageFeed.tsx`
- M `src/components/homepage/HeroStatsOrbs.tsx`
- M `src/components/homepage/ScoutSearchBox.tsx`
- A `src/styles/homepage-v2.css`

### Homepage Assets
- A `public/edge-dash.png`
- A `public/downloads/edge-logo.png`
- A `public/downloads/edge-plus.png`
- M `public/downloads/scout-v2.png`
- A `public/images/edge/edge-compact.png`
- A `public/images/edge/edge-dash.png`
- A `public/images/edge/edge-full.png`
- A `public/images/edge/edge-plus.png`
- A `public/images/edge/edge-sm-2.png`
- A `public/images/edge/edge-sm.png`

### SportsRiver (Feed System)
- A `src/components/SportsRiver/AudioMiniPlayer.tsx`
- A `src/components/SportsRiver/BaseGlassCard.tsx`
- A `src/components/SportsRiver/CardActionButtons.tsx`
- A `src/components/SportsRiver/FanToolsCard.tsx`
- A `src/components/SportsRiver/FeedModeSelector.tsx`
- A `src/components/SportsRiver/RightRailCard.tsx`
- A `src/components/SportsRiver/RiverFeed.tsx`
- A `src/components/SportsRiver/RiverGhostPill.tsx`
- A `src/components/SportsRiver/RiverLayout.tsx`
- A `src/components/SportsRiver/RiverOfflineBanner.tsx`
- A `src/components/SportsRiver/ScoutBriefingCard.tsx`
- A `src/components/SportsRiver/ScoutBriefingGrid.tsx`
- A `src/components/SportsRiver/ScoutBriefingText.tsx`
- A `src/components/SportsRiver/ScoutGreeting.tsx`
- A `src/components/SportsRiver/ScoutRadar.tsx`
- A `src/components/SportsRiver/ScoutRadarChip.tsx`
- A `src/components/SportsRiver/ScoutReportCard.tsx`
- A `src/components/SportsRiver/SinceLastVisitCard.tsx`
- A `src/components/SportsRiver/TeamFilterPills.tsx`
- A `src/components/SportsRiver/TeamPicker.tsx`
- A `src/components/SportsRiver/cards/BoxScoreCard.tsx`
- A `src/components/SportsRiver/cards/ChartCard.tsx`
- A `src/components/SportsRiver/cards/CommentSpotlightCard.tsx`
- A `src/components/SportsRiver/cards/DownloadAppCard.tsx`
- A `src/components/SportsRiver/cards/FanChatCard.tsx`
- A `src/components/SportsRiver/cards/HubUpdateCard.tsx`
- A `src/components/SportsRiver/cards/InfographicCard.tsx`
- A `src/components/SportsRiver/cards/JoinNewsletterCard.tsx`
- A `src/components/SportsRiver/cards/ListenNowCard.tsx`
- A `src/components/SportsRiver/cards/MockDraftCard.tsx`
- A `src/components/SportsRiver/cards/PollCard.tsx`
- A `src/components/SportsRiver/cards/ScoutArticleCard.tsx`
- A `src/components/SportsRiver/cards/SmPlusCard.tsx`
- A `src/components/SportsRiver/cards/TradeProposalCard.tsx`
- A `src/components/SportsRiver/cards/TrendingArticleCard.tsx`
- A `src/components/SportsRiver/cards/TrendingPlayerCard.tsx`
- A `src/components/SportsRiver/cards/VisionTheaterCard.tsx`
- A `src/components/SportsRiver/cards/utils.ts`

### Article Templates & Block Editor
- A `src/components/articleTemplates/FanChatTemplate.tsx`
- A `src/components/articleTemplates/RumorTemplate.tsx`
- A `src/components/articleTemplates/StandardNewsTemplate.tsx`
- A `src/components/articleTemplates/StatsTemplate.tsx`
- A `src/components/articleTemplates/TrendingTemplate.tsx`
- A `src/components/articleTemplates/index.ts`
- A `src/components/articles/ArticleBlockContent.tsx`
- A `src/components/articles/ArticleHeader.tsx`
- A `src/components/articles/DebateBlock.tsx`
- A `src/components/articles/GMInteraction.tsx`
- A `src/components/articles/PlayerComparison.tsx`
- A `src/components/articles/ReactionStream.tsx`
- A `src/components/articles/ReadingProgressBar.tsx`
- A `src/components/articles/ScoutInsight.tsx`
- A `src/components/articles/StatsChart.tsx`
- A `src/components/articles/TagChip.tsx`
- A `src/components/articles/TradeScenarioCard.tsx`
- A `src/components/articles/UpdateBlock.tsx`
- A `src/components/articles/index.ts`
- A `src/components/admin/BlockEditor/BlockEditor.tsx`
- A `src/components/admin/BlockEditor/BlockEditorPanels.tsx`
- A `src/components/admin/BlockEditor/BlockInserter.tsx`
- A `src/components/admin/BlockEditor/BlockPreviewRenderer.tsx`
- A `src/components/admin/BlockEditor/TemplatePresets.tsx`
- A `src/components/admin/BlockEditor/index.ts`
- A `src/components/admin/BlockEditor/serializer.ts`
- A `src/components/admin/BlockEditor/types.ts`

### Layout & Shared
- M `src/app/globals.css`
- M `src/app/layout.tsx`
- M `src/components/layout/Header.tsx`
- A `src/components/layout/LeftSidebar.tsx`
- M `src/components/layout/MobileBottomNav.tsx`
- M `src/components/ui/Badge.tsx`
- M `src/components/ui/index.ts`
- A `src/components/ui/scroll-area.tsx`
- A `src/components/ui/skeleton.tsx`
- A `src/components/ui/sonner.tsx`

### Routes & APIs
- M `src/app/[category]/[slug]/page.tsx`
- M `src/app/edge/page.tsx`
- M `src/app/home/article/[slug]/page.tsx`
- M `src/app/home/page.tsx`
- A `src/app/river/page.tsx`
- A `src/app/river/RiverPageClient.tsx`
- A `src/app/designs/river-layout/page.tsx`
- A `src/app/api/river/route.ts`
- A `src/app/api/newsletter/subscribe/route.ts`
- M `src/app/api/audio/[slug]/route.ts`
- M `src/app/api/cron/sync-wordpress/route.ts`
- M `src/app/api/user/preferences/route.ts`
- A `src/app/admin/users/[id]/layout.tsx`
- A `src/app/admin/users/[id]/page.tsx`
- A `src/app/api/admin/users/[id]/route.ts`
- M `src/app/admin/analytics/page.tsx`
- M `src/components/admin/AnalyticsDashboard.tsx`
- M `src/components/admin/PostEditor/AdvancedPostEditor.tsx`
- M `src/components/admin/UsersTable.tsx`

### Lib & Hooks
- A `src/lib/homepage-river-data.ts`
- A `src/lib/homepage-team-data.ts`
- A `src/lib/river-scoring.ts`
- A `src/lib/river-tokens.ts`
- A `src/lib/river-types.ts`
- A `src/hooks/useCardReveal.ts`
- A `src/hooks/useGhostUpdate.ts`
- A `src/hooks/useRiverFeed.ts`
- A `src/context/AudioPlayerContext.tsx`
- A `src/context/MediaControllerContext.tsx`
- A `src/context/WebSocketProvider.tsx`

### Config & Docs
- A `.env.example`
- M `.gitignore`
- A `components.json`
- M `package.json`
- M `package-lock.json`
- M `public/sitemap.xml`
- M `vercel.json`
- M `src/styles/home.css`
- M `src/styles/homepage.css`
- A `supabase/migrations/20260307000001_sm_river_feed.sql`
- A `docs/DataLab_Request_EDGE_Tables.md`
- A `docs/EDGE/*.svg` (5 files)
- A `docs/EDGE2_Cursor_Instructions.md`
- A `docs/HomePage Feed_Cards.md`
- A `docs/Home_Feed.md`
- A `docs/User_Profile_Onboarding_Spec.md`
- A `docs/edge2-preview.html`
- A `figma/*` (5 files)
- A `scripts/figma/*` (7 files)
- A `mobile/.env.example`

## How to Revert

```bash
# Option 1: Revert the merge commit
git revert <merge-commit-hash>

# Option 2: Hard reset to pre-merge state
git reset --hard 7a66fcd1
```
