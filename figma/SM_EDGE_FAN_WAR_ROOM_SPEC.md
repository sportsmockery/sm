# SM Edge Fan War Room — Specification

Product specification for the Fan War Room feature. Authoritative reference for design, product, and engineering.

---

## Overview

The Fan War Room is a persistent personal GM dashboard where fans manage their own team, compete on leaderboards, and earn GM Score through strategic decisions. It creates three psychological drivers: identity (I'm a GM), competition (I'm ranked), and progress (I'm earning points), which drive daily return traffic and social sharing.

**Mental Models**
- Fantasy sports dashboard (persistent team management)
- Draft war room (strategic decision-making)
- Bloomberg terminal for sports fans (data-driven insights)
- Madden franchise mode (long-term progression)

**Success Metrics**
- Daily active users (DAU)
- Daily return rate
- Average session length
- GM Score earned per session
- Leaderboard engagement rate
- Social shares of War Room achievements

---

## Where It Lives

**Route:** `/war-room`

**Entry Points**

| Location | Placement | CTA |
|----------|-----------|-----|
| Left rail (global nav) | Persistent nav item | "Open Your War Room" |
| GM Score footer | Footer when GM Score is displayed | "Open Your War Room" |
| Trade simulator (`/gm`) | Post-trade / header | "Open Your War Room" |
| Mock draft | Post-draft / header | "Open Your War Room" |

**CTA Rules**
- Primary CTA text: **"Open Your War Room"** on all entry points
- Secondary inline links may use "View War Room" or "Go to War Room"
- CTA visible without scroll on desktop; above fold or in persistent nav on mobile
- All entry points resolve to `/war-room`

---

## Layout

3-column desktop layout:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GLOBAL HEADER (sticky, 60px)                             │
│  Logo | Nav | Search | User Menu | Theme Toggle                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┬──────────────────────────────┬──────────────────────────┐ │
│  │  LEFT RAIL   │      CENTER WORKSPACE        │    RIGHT INTELLIGENCE    │ │
│  │  (260px)     │      (minmax(680px, 1fr))    │    RAIL (320px)          │ │
│  │              │                              │                          │ │
│  │ • Profile    │ Workspace Tabs               │ • Scout Insights         │ │
│  │ • Strategy   │ (Roster, Cap, Trade,         │ • Trade Suggestions      │ │
│  │   Tools      │  Draft, Predictions)         │ • Draft Risers           │ │
│  │ • Quick      │                              │ • GM Leaderboard         │ │
│  │   Actions    │ Tab Content + Actions        │ • Achievements           │ │
│  │ [sticky]     │                              │ • Daily Streak           │ │
│  └──────────────┴──────────────────────────────┴──────────────────────────┘ │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  MOBILE BOTTOM NAV (sticky): Home | Scout | War Room | Fan Hub | Profile    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Specifications**

| Region | Width | Padding | Sticky | Background |
|--------|-------|---------|--------|------------|
| Container | max-width 1680px | 0 (full bleed) | — | — |
| Left Rail | 260px | 20px | Yes (top: 60px) | var(--sm-card) |
| Center | minmax(680px, 1fr) | 24px desktop, 16px tablet, 12px mobile | — | var(--sm-dark) |
| Right Rail | 320px | 20px | Yes (top: 60px) | var(--sm-card) |

**Right Rail:** Hidden when viewport < 1440px. Border-left 1px solid var(--sm-border).

**Breakpoints:** Mobile < 640px | Tablet 640–1024px | Desktop 1024–1440px | Wide ≥ 1440px

---

## Left Rail Navigation

### WarRoomProfileCard (Top, Sticky)

- Avatar, username, GM rank badge
- GM Score with trend indicator (e.g., ↑ +150 this week)
- Current streak with fire emoji
- Edit Profile, Settings links

Props: `user`, `gmScore`, `gmRank`, `totalParticipants`, `streakDays`, `onEditProfile`, `onSettings`, `className`

### WarRoomNav (Middle, Sticky)

- **Strategy Tools:** My Roster, Cap Space, Trade Center, Draft Board, Predictions, Saved Scenarios
- **Recent Activity:** Last 5 actions

Features: Icons per item; active tab with red underline; recent activity feed.

Props: `activeTab`, `onTabChange`, `recentActivity`, `className`

### WarRoomActions (Bottom, Sticky)

- Run Mock Draft
- Propose Trade
- Ask Scout
- View Leaderboard

Props: `onMockDraft`, `onProposeTrade`, `onAskScout`, `onViewLeaderboard`, `className`

---

## Center Workspace

### My Roster
Manage roster with depth chart. Drag-and-drop reorder; mark starters; team selector; export/share; save.

**Components:** RosterDepthChart, PositionGroup, PlayerCard, StarterBadge

### Cap Space
Manage salary cap and contracts. Current/projected cap; multi-year breakdown; cap impact simulator; cut/restructure/extend; save/share cap plans.

**Components:** CapTable, ContractRow, CapImpactSimulator, CapSpaceBar

### Trade Center
Build and submit trades. Add players/picks; opponent selector; real-time value; AI grading; submit to community; save draft; trade history.

**Components:** TradeBuilder, TradeTeamPanel, PlayerPickSelector, TradeSummary, TradeGradeCard, TradeVoteCard

### Draft Board
Build draft strategy and simulate picks. Drag-and-drop prospects; rounds 1–7; prospect board with search/filter; mock draft simulation; save/share.

**Components:** DraftBoard, DraftPickSlot, ProspectCard, ProspectBoard, DraftSimulationResults

### Predictions
Make predictions and earn points for correct outcomes. Types: record, playoffs, draft, stats; prediction history; save/share.

**Components:** PredictionCard, OutcomeVote, PredictionHistory, PredictionResult

---

## Right Intelligence Rail

| Module | Purpose |
|--------|---------|
| ScoutInsightCard | Scout AI insight; confidence, reasoning, link to analysis |
| TradeSuggestionCard | Suggested trade; trade value, AI grade; Build/Vote CTAs |
| DraftRiserCard | Rising prospect; rank change, stats |
| GMLeaderboardCard | Top users; user rank; weekly change |
| AchievementBadge | Achievement display; progress; share CTA |
| DailyStreakCard | Streak display; next milestone |

---

## GM Score Integration

**Action-Based Rewards (per tab)**

| Tab | Actions | Max/Session |
|-----|---------|-------------|
| Roster | Reorder +5, Mark starter +2, Save +3, Share +5 | 20 |
| Cap Space | Simulate +5, Save +3, Share +5 | 15 |
| Trade | Build +5, Submit +10, Voted on +5, Graded +5 | 30 |
| Draft | Build +5, Run sim +10, Save +3, Share +5 | 25 |
| Predictions | Make +3, Correct +20, Share +5 | 30 |
| Articles | Vote +5, Comment +5, Share +3, Bookmark +2 | 20 |

**Caps:** Daily 500 points | Weekly 3,000 points

**Streak Bonuses:** 3-day +10/day | 7-day +20/day | 14-day +50/day | 30-day +100/day | 100-day +250/day. Streak resets if no engagement for 24 hours.

**Achievements:** Four tiers (10, 25, 50, 100 pts). Examples: First Trade, Trade Master, Leaderboard #1, 100-Day Streak.

---

## User Flows

**Daily Engagement Loop** — Login → War Room CTA → Roster tab → View streak → Reorder roster → Check leaderboard → Propose trade → Build & submit → Toast confirmation → Share achievement → Return next day

**Trade Submission & Voting** — Build trade → Submit → Appears in feed → Others vote → AI grades → User sees results → Earns bonus → Optional share

**Prediction Resolution** — Make prediction → Season progresses → Outcome determined → Mark correct/incorrect → Display points → New predictions for next season

---

## Gamification

- **Daily Streaks:** Fire emoji indicator; milestone notifications (3, 7, 14, 30, 100 days)
- **Achievements:** Four tiers; unlock by action; progress bars; shareable
- **Leaderboards:** Global, weekly, team-specific; rank in profile; top 10 in right rail
- **Badges & Titles:** Shown in profile; shareable on social
- **Social Sharing:** War Room, trades, drafts, predictions, rank; +3 points per share

**Viral Loop:** User earns → shares → friend clicks → signs up → competes → both share more

---

## Component Architecture

| Component | Purpose | Location |
|-----------|---------|----------|
| WarRoomProfileCard | Profile, rank, score, streak | Left rail |
| WarRoomNav | Navigation, active tab, recent activity | Left rail |
| WarRoomActions | Quick action buttons | Left rail |
| RosterDepthChart, PlayerCard | Roster management | Center |
| CapTable, ContractRow | Cap management | Center |
| TradeBuilder, TradeSummary, TradeVoteCard | Trade building | Center |
| DraftBoard, ProspectCard, DraftPickSlot | Draft strategy | Center |
| PredictionCard, OutcomeVote | Predictions | Center |
| ScoutInsightCard, TradeSuggestionCard, DraftRiserCard | Intelligence modules | Right rail |
| GMLeaderboardCard, AchievementBadge, DailyStreakCard | Rankings and progress | Right rail |

---

## Mobile Behavior

**Mobile (< 640px)**
- Left rail: Hidden; accessible via hamburger
- Center: Full-width; 12px padding
- Right rail: Inline below workspace
- Tabs: Horizontal scroll
- Sticky: Tab nav below header; action buttons at bottom; bottom nav always visible

**Tablet (640–1024px)**
- Same as mobile; 16px center padding
