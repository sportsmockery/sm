# SportsMockery Platform Updates — March 8–11, 2026

---

## New Homepage Experience

The homepage got a complete makeover. When you first open the site, you're now greeted with a **full-screen welcome from Scout**, our AI sports analyst. A large headline reads **"What can I help you with?"** with a search bar right below it. The search bar rotates through suggested questions pulled from that day's actual SM articles — things like "Why did the Bears lose Sunday?" or "Should the Cubs trade Bellinger?" Below the search bar are quick-tap chips for popular topics like Bears rumors, Cubs outlook, and Bulls debate.

Behind all of this, **subtle floating Chicago six-pointed stars** drift across the background — two-thirds red, one-third cyan — each slowly spinning with fading trails. It's meant to feel ambient and premium, not flashy. If you have motion sensitivity settings turned on, the animation automatically turns off.

The branding has shifted from **SM EDGE to SM Blitz**, with a new Blitz logo in the top-left corner of the hero.

Once you scroll past the hero, you enter the **new three-column feed layout**:
- **Left column:** Navigation sidebar
- **Center column:** Your main content feed
- **Right column:** Team stats, Scout access, and platform tools

On mobile, the sidebars collapse and you get a **bottom navigation bar** (like Instagram/Twitter) with tabs for Home, Explore, Create, Reels, and Profile. There's also a **compose button** in the center that lets you draft posts with text, photos, reels, or stories.

---

## Left Sidebar Navigation

A brand-new **persistent sidebar** on the left gives you one-click access to everything on the platform:

- **For You** — your personalized feed
- **Scout** — jump straight into the AI analyst
- **All five Chicago teams** — Bears, Bulls, Cubs, Blackhawks, White Sox (each with their team logo)
- **Discover section** — Trending stories, Debates, Rumors, and Analytics
- **Your stuff** (when logged in) — Profile, Saved items, and Settings

The currently active page is highlighted in cyan with a colored accent bar on the left edge. On mobile, it becomes a hamburger menu that slides in from the left.

---

## Team Stats Sidebar

When you select a team (or land on a team hub page), the **right sidebar transforms into a team intelligence panel** with three sections:

### Season Snapshot
A color-coded card (team colors) showing:
- Current record in large numbers with win percentage
- League standing (e.g., "1st in NFC North")
- Next game with opponent, date, and time (or "Offseason" if none)
- Last game result with a green W or red L badge and the final score
- Quick links to Roster, Stats, Schedule, and the full team hub

### Key Players
The top 5 stat leaders on the roster, each showing:
- Player headshot (or jersey number if no photo available)
- Position badge in team colors
- Their standout stat in large text (e.g., "4,200 Pass Yds" or "28.3 PPG")
- Tap any player to go to their full profile

### Trending Topics
The 3–5 hottest discussion topics for that team, ranked by how many articles mention them. Topics like "Caleb Williams Development" or "Connor Bedard Watch" show article counts and a red "Hot" badge when they're surging. Tap any topic to dive into the coverage.

All of these stats pull from the same data source used on the full team pages, so the numbers are always consistent and accurate. Leaderboard accuracy was also improved for the Bulls, Cubs, and White Sox during this update.

---

## Smarter Feed Cards

The main content feed now supports **10 different card types**, each designed for a different kind of content:

- **Editorial cards** — Headlines with author bylines, Scout AI commentary, trending context badges, and a new emoji reaction system (Smart Take, Hot, Bad Take)
- **Poll cards** — Fan vote questions with up to 4 options, live percentage bars, and total vote counts
- **Stats/Chart cards** — Team-colored area charts showing player performance trends with a written takeaway below
- **Hub Update cards** — Breaking front office moves or tracker changes, with a pulsing red "LIVE" dot when active
- **Box Score cards** — Final (or live) game scores showing team logos, large score numbers, quarter/period info, and the key performer
- **GM Pulse questions** — Quick yes/no fan polls embedded inside editorial cards with live vote percentages

Every card shows the relevant team color, a timestamp (e.g., "2h ago"), and engagement stats. Cards tagged "BREAKING" or "RUMOR" get red labels. Stories with high traffic show a trending badge with context like "Trending: 3rd mock draft of the week."

---

## Scout AI Prompt Suggestions

Scout's search bar now shows **daily rotating questions inspired by real SM articles**. Every day, the platform reads what the newsroom published and generates 5 fresh, specific questions fans might want to ask — grounded in actual coverage, not generic prompts. If you're not sure what to ask Scout, just tap one of the suggestions to get started.

---

## Site-Wide Visual Refresh

The entire site — every page, every button, every label — was migrated to the **Space Grotesk** typeface, replacing the old Barlow font across 162 files. The result is a cleaner, more modern, more editorial feel.

The color palette was also tightened up. Every page now strictly follows the **five-color system**:
- **Red** — brand identity, breaking news, alerts
- **Cyan** — AI and data features (Scout, analytics, charts)
- **Gold** — premium content and top-tier features
- **Black/White** — backgrounds and text (swapping between light and dark mode)

Button gradients were flattened to solid colors for a sharper look. Light mode is now the default when you first visit.

---

## Right Sidebar Tools & Profile

When no team is selected, the right sidebar shows:

- **Your profile card** — avatar, username, and a quick link to your full profile
- **Ask Scout button** — with Scout's avatar, an "Online" status indicator, and a direct link to start a conversation
- **Blitz Features** — a scrollable list of the platform's key tools:
  - **Trade Simulator** — "Play GM and build trades now"
  - **Mock Draft** — "Run mock drafts with instant grades"
  - **Fan Chat** — "Live chat and conversation"
  - **Team Analytics** — "Stats, rosters, scores, and more"
  - **Vision Theater** — "Stream all the latest SM videos"

Each tool card has an icon that turns red on hover, a title, and a short description.

---

## Studio Improvements (for writers)

- **Autosave** — The post editor now saves your work automatically as you type, Google Docs-style. No more losing drafts.
- **Scout Insight blocks** — Writers can auto-generate AI-powered commentary and drop it directly into articles.
- **Template switching** — Easily swap between article layouts (standard news, stats breakdown, rumor report, etc.) without starting over.
- **Reaction Stream block** — A new dynamic block type that surfaces fan reactions within articles.

---

## Admin & Backend Improvements

- **Avatar uploads fixed** — Profile photo uploads were failing for some users due to a permissions issue. Now works reliably.
- **Admin authentication hardened** — All admin and scheduled task endpoints now use a centralized security layer.
- **Layout cleanup** — Removed floating breadcrumbs and a Scout orb button that were cluttering the interface on team pages.
- **Sitemap updated** — Search engines now have a current map of all site pages.
