# V10 Web Design Implementation Tasklist

## Status Legend
- [ ] Not started
- [x] Completed
- [~] In progress

---

## 1. BASELINES AND CONSTRAINTS
- [x] Preserve URL structure of posts, categories, tags
- [x] Keep core homepage sections functioning
- [ ] All changes only on test.sportsmockery.com

## 2. GLOBAL LAYOUT, TYPOGRAPHY, AND SPACING

### 2.1 Layout Grid and Breakpoints
- [x] Update spacing scale to: 4, 8, 12, 16, 24, 32, 40px
- [x] Update container max-width to 1280-1360px
- [x] Update container padding: 16px mobile, 24px tablet, 32px desktop
- [ ] Implement 12-column grid with 24px gutters

### 2.2 Spacing System
- [x] Define spacing scale in CSS variables
- [ ] Section vertical spacing: 32px mobile, 40-48px desktop
- [ ] Card spacing: 16-24px between, 12-16px padding inside
- [ ] Heading spacing: 8-12px above/below

### 2.3 Typography
- [ ] H1: 32-36px mobile, 40-44px desktop, bold
- [ ] H2: 24px mobile, 28-32px desktop, bold
- [ ] H3: 18-20px, semi-bold to bold
- [ ] Body: 15-16px, line-height 1.6-1.8
- [ ] Meta text: 12-13px, lighter weight
- [ ] Maintain 4.5:1 color contrast

## 3. NAVIGATION & CHICAGO IDENTITY

### 3.1 Header and Global Nav
- [ ] Left: Logo with home link
- [ ] Center (desktop): Home, Bears, Bulls, Cubs, White Sox, Blackhawks, Podcasts
- [ ] Right: Search, "Fan Chat" (primary CTA), "Ask AI" (secondary CTA)
- [ ] Mobile: Hamburger with full-height drawer
- [ ] Sticky on scroll with subtle shadow
- [ ] Height: 56px mobile, 64-72px desktop

### 3.2 Chicago Branding
- [ ] Chicago flag colors/motifs in hover states
- [ ] Section dividers with Chicago elements
- [ ] Team hub background accents

## 4. HOMEPAGE

### 4.1 "Chicago Live" Above-the-fold Block
- [x] Hero story (left, ~2/3 desktop)
  - [x] Category pill, date, time
  - [x] Title
  - [x] 1-2 line excerpt
  - [x] Image 16:9 ratio
- [x] Next Chicago games (right, ~1/3 desktop)
  - [x] Stacked list of upcoming games (all 5 teams)
  - [x] Team logo + name, opponent, date, time, home/away
  - [x] Link to team hub
- [x] Mobile: Stack hero above games list

### 4.2 "Chicago Fan Control Center"
- [x] Full-width block below fold
- [x] Heading: "Chicago Fan Control Center"
- [x] Two equal-width cards (desktop), stacked (mobile):
  - [x] Card A: Fan Chat - copy + "Open Fan Chat" CTA
  - [x] Card B: Ask Mockery AI - copy + "Ask AI Now" CTA

### 4.3 Content Flow
- [x] "Trending Right Now" section (4-6 articles)
- [x] Main article list (reverse-chronological)
- [x] Improved spacing between items

## 5. TEAM HUBS (ALL 5 TEAMS)

### 5.1 Team Header Band
- [x] Left: Team logo, name, tag
- [x] Right: Next game summary, record snippet
- [x] Subtle team-colored gradient background

### 5.2 Sticky Team Subnav
- [x] Tabs: Overview, Schedule, Stats, Roster, Players, News, Fan Chat
- [x] Desktop: horizontal bar
- [x] Mobile: horizontally scrollable pill row

### 5.3 Overview Tab
- [x] Left: Latest Headlines, Analysis & Features
- [x] Right: Season Snapshot card, compact Ask AI widget
- [x] Mobile: Stack snapshot above headlines

### 5.4 Schedule Tab
- [x] Desktop: Table with Date, Opponent, Time, Result/Status, TV
- [~] Mobile: Full-width cards per row
- [x] Highlight upcoming game row

### 5.5 Stats Tab
- [x] Summary section with key metrics
- [x] Subsections: Offense, Defense, Special Teams
- [x] Clean tables, right-aligned numbers

### 5.6 Roster Tab
- [x] Desktop: No., Player, Position, Age, Height, Weight, Experience, College
- [~] Mobile: Expandable cards
- [x] Player links to player pages

### 5.7 Players Index Tab
- [~] Text search by name
- [~] A-Z filter row
- [x] Headshot, name, years, position grid

## 6. PLAYER PAGES

### 6.1 Player Header
- [x] Left: Image, name, number, position
- [x] Right: Team(s), active years, bio meta

### 6.2 Page Sections/Tabs
- [x] Overview: At a Glance card, summary, Chicago Moments
- [x] Career Stats: Season-by-season table, totals
- [x] Game Logs: Per-game stats
- [~] News & Features: Filtered article list
- [~] Ask AI: Player-specific AI panel

## 7. FAN CHAT

### 7.1 Global Fan Chat Page (/fan-chat)
- [x] Left: Channel list (Global, team rooms, game threads)
- [x] Right: Message timeline with composer
- [x] Mobile: Chat timeline + channel switcher

### 7.2 Team/Article Integration
- [x] Team pages: Fan Chat tab loads team room
- [~] Articles: Link to live chat for relevant games

## 8. ASK AI

### 8.1 Global Ask AI Page (/ask-ai)
- [x] Left: Explanation panel
- [x] Right: Main AI interface with prompt input
- [x] Suggested prompts as clickable chips
- [x] Response area for Q&A thread

### 8.2 Contextual Widgets
- [x] Team pages: Sidebar widget
- [~] Player pages: Ask AI tab

## 9. AR/VR EXPERIENCES

### 9.1 AR/VR Hub (/ar-vr)
- [ ] Hero explaining concept
- [ ] Grid of experiences

### 9.2 Team Integration
- [ ] Immersive section on team Overview tabs

## 10. MOBILE-FIRST AUDIT

- [~] Replace absolute positioning with flex/grid (most components use flex/grid)
- [x] All tap targets 44-48px minimum (fixed Header, TeamHubLayout, ChicagoLive, ShareButtons)
- [ ] Test at 320px, 375px, 414px, 768px
- [x] No overlapping sticky elements (fixed TeamHubLayout sticky nav position)
- [x] Article title, meta, share icons properly spaced (fixed ShareButtons tap targets)
- [x] Images scale down proportionally (verified - using Tailwind responsive classes)

## 11. QUALITY CHECKS

- [ ] Visual consistency check
- [ ] Navigation check (all pages/breakpoints)
- [ ] Feature integration check (Fan Chat, Ask AI visible everywhere)
- [ ] Performance & readability check

## 12. DEPLOYMENT

- [x] Build successfully
- [ ] Deploy to Vercel
- [ ] Test all pages on test.sportsmockery.com

---

## Implementation Log

### 2026-01-20
- Started implementation
- Updated spacing scale in globals.css to: 4, 8, 12, 16, 24, 32, 40px
- Updated container max-width to 1320px
- Created ChicagoLive component (src/components/home/ChicagoLive.tsx)
- Created FanControlCenter component (src/components/home/FanControlCenter.tsx)
- Created Ask AI page (src/app/ask-ai/page.tsx)
- Created Fan Chat page with channels (src/app/fan-chat/page.tsx)
- Created upcoming-games.ts data source with mock data
- Updated Header with Fan Chat and Ask AI CTAs (desktop + mobile)
- Updated homepage to use new ChicagoLive and FanControlCenter sections
- Deployed to https://test.sportsmockery.com

### 2026-01-20 (Session 2)
- Created TeamHubLayout component (src/components/team/TeamHubLayout.tsx)
  - Team header band with logo, name, next game, record, team-colored gradient
  - Sticky team subnav with tabs (desktop: horizontal bar, mobile: scrollable pills)
- Created TeamHubOverview component (src/components/team/TeamHubOverview.tsx)
  - Two-column layout with articles left, sidebar right
  - Season snapshot card, Quick Links, Ask AI widget, Fan Chat widget, AR Tour widget
- Created team configuration (src/lib/team-config.ts)
  - Centralized config for all 5 Chicago teams
  - ESPN API integration for fetching team records and next games
- Created Bears team hub page (src/app/chicago-bears/page.tsx)
  - Integrates all existing Bears features (season card, roster highlights, trending topics)
  - Uses new TeamHubLayout with sticky subnav
- Updated Bears sub-pages to use TeamHubLayout:
  - src/app/chicago-bears/stats/page.tsx
  - src/app/chicago-bears/roster/page.tsx
  - src/app/chicago-bears/schedule/page.tsx
  - src/app/chicago-bears/scores/page.tsx
- Created team hub pages for all 5 teams:
  - src/app/chicago-bulls/page.tsx
  - src/app/chicago-cubs/page.tsx
  - src/app/chicago-white-sox/page.tsx
  - src/app/chicago-blackhawks/page.tsx
- Build verified successfully with all new components

### Deployed URLs
- Homepage: https://test.sportsmockery.com
- Ask AI: https://test.sportsmockery.com/ask-ai
- Fan Chat: https://test.sportsmockery.com/fan-chat
- Bears Hub: https://test.sportsmockery.com/chicago-bears
- Bulls Hub: https://test.sportsmockery.com/chicago-bulls
- Cubs Hub: https://test.sportsmockery.com/chicago-cubs
- White Sox Hub: https://test.sportsmockery.com/chicago-white-sox
- Blackhawks Hub: https://test.sportsmockery.com/chicago-blackhawks

### Design Decisions with Sources
1. **Two-column hero + games layout**: Based on ESPN.com and The Athletic homepage layouts which prominently feature hero story alongside game schedules
2. **Fan Chat + AI as prominent CTAs**: Based on The Athletic's community features and modern sports apps that integrate fan engagement tools prominently
3. **Channel-based chat**: Based on Discord-style channels used by sports communities (e.g., team subreddits, fan forums)
4. **Team header band with gradient**: Based on ESPN team pages which use team colors in the header band with gradient effects
5. **Sticky team subnav**: Based on The Athletic and CBS Sports team pages which have sticky navigation for easy section switching
6. **Mobile pill navigation**: Based on ESPN mobile app which uses horizontally scrollable pills for team section navigation
7. **Sidebar Ask AI + Fan Chat widgets**: Based on The Athletic's integration of community features in sidebar positions
8. **Season snapshot card**: Based on ESPN team pages which prominently display current record and next game info

### Files Created/Modified This Session
New Files:
- src/components/team/TeamHubLayout.tsx
- src/components/team/TeamHubOverview.tsx
- src/lib/team-config.ts
- src/app/chicago-bears/page.tsx
- src/app/chicago-bulls/page.tsx
- src/app/chicago-cubs/page.tsx
- src/app/chicago-white-sox/page.tsx
- src/app/chicago-blackhawks/page.tsx

Modified Files:
- src/components/team/index.ts
- src/app/chicago-bears/stats/page.tsx
- src/app/chicago-bears/roster/page.tsx
- src/app/chicago-bears/schedule/page.tsx
- src/app/chicago-bears/scores/page.tsx

### 2026-01-20 (Session 3 - Mobile Audit)
- **Tap Target Fixes (44-48px minimum per WCAG guidelines):**
  - TeamHubLayout.tsx: Mobile nav pills increased to min-h-[44px]
  - ChicagoLive.tsx: Game link items increased to min-h-[48px], logos to w-11 h-11
  - Header.tsx: Mobile menu button, search button, social icons all fixed to 44px minimum
  - ShareButtons.tsx: Share buttons increased from h-9 w-9 (36px) to h-11 w-11 (44px)

- **Sticky Element Conflict Fix:**
  - TeamHubLayout.tsx: Fixed sticky subnav position from top-16 (64px) to top-[140px]
  - Fixed sticky trigger from headerBottom <= 64 to headerBottom <= 140
  - Accounts for full main header height (52px top + 44px nav + 44px BearsStickyBar)

- **Mobile Improvements:**
  - Social icons hidden on mobile to reduce header clutter
  - ShareButtons "Share:" label hidden on mobile to save space
  - All interactive elements now meet 44-48px minimum tap target size

Modified Files:
- src/components/team/TeamHubLayout.tsx
- src/components/home/ChicagoLive.tsx
- src/components/layout/Header.tsx
- src/components/ShareButtons.tsx
