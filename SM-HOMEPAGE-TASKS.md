# SM Homepage Redesign - Implementation Tasks

**Project:** SportsMockery.com Next.js Migration
**Location:** /Users/christopherburhans/Documents/projects/sm
**Goal:** Implement new homepage with Oracle Feed, theme toggle, and AR features

---

## PREREQUISITES

Before starting, run these commands:

```bash
cd /Users/christopherburhans/Documents/projects/sm
npm install three @react-three/fiber @react-three/xr @react-three/drei
```

---

## SECTION 1: Theme System (5 tasks)

### 1.1 Update ThemeContext
- [x] Check if `src/contexts/ThemeContext.tsx` exists
- [x] Ensure it defaults to 'light' mode (not dark)
- [x] Ensure it adds/removes 'dark' class on document.documentElement
- [x] Ensure it persists to localStorage as 'sm-theme'

### 1.2 Update ThemeToggle Component
- [x] Replace `src/components/layout/ThemeToggle.tsx` (or `src/components/ThemeToggle.tsx`) with simplified star-only version:
```tsx
'use client'

import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bc0000] focus-visible:ring-offset-2"
      style={{ backgroundColor: isDark ? '#27272a' : '#e5e7eb' }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span
        className="inline-flex h-5 w-5 transform items-center justify-center rounded-full shadow-md transition-all duration-300 ease-in-out"
        style={{ 
          transform: isDark ? 'translateX(26px)' : 'translateX(4px)',
          backgroundColor: isDark ? '#0a0a0b' : '#ffffff',
        }}
      >
        <span className="text-xs font-black" style={{ color: '#bc0000' }}>✶</span>
      </span>
    </button>
  )
}
```

### 1.3 Update Tailwind Config
- [x] Ensure `tailwind.config.ts` has `darkMode: 'class'`

### 1.4 Update Layout with Flash Prevention
- [x] Add flash prevention script to `src/app/layout.tsx` in `<head>`:
```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      (function() {
        try {
          var theme = localStorage.getItem('sm-theme');
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          }
        } catch (e) {}
      })();
    `,
  }}
/>
```

### 1.5 Verify Theme Works
- [x] Test that clicking toggle switches between light/dark
- [x] Test that page background changes (white ↔ dark gray)
- [x] Test that preference persists on refresh

---

## SECTION 2: Oracle Feed API (6 tasks)

### 2.1 Create Feed API Route
- [x] Create directory `src/app/api/feed/`
- [x] Create `src/app/api/feed/route.ts` with:
  - POST handler for personalized feed (accepts viewed_ids, team_preferences)
  - GET handler for default feed (first-time visitors)
  - Query sm_posts with importance_score, publish_date ordering
  - Exclude viewed articles from results
  - Apply team preference boost (+15 points)
  - Apply recency decay (-5 points per day)
  - Return: featured, topHeadlines, latestNews, teamSections, trending

### 2.2 Create useOracleFeed Hook
- [x] Create `src/hooks/useOracleFeed.ts` with:
  - localStorage tracking for viewed article IDs (48hr expiry)
  - localStorage tracking for team preferences (inferred from reading)
  - fetchFeed() function that calls /api/feed
  - trackView(article) function to save viewed ID
  - isUnseen(articleId) function to check if new
  - Auto-refresh every 5 minutes (optional)

### 2.3 Database Schema
- [x] Add to sm_posts table (if not exists):
  - `importance_score INTEGER DEFAULT 50`
  - `view_count INTEGER DEFAULT 0`
- [x] Create `sm_user_views` table for logged-in user tracking
- [x] Create `sm_user_preferences` table for user prefs
- [x] Add indexes for feed queries
- Note: Run `migrations/oracle-feed-schema.sql` in Supabase SQL Editor

### 2.4 Test Feed API
- [x] Test GET /api/feed returns articles
- [x] Test POST /api/feed with viewed_ids excludes those articles
- [x] Test that importance_score affects ordering

---

## SECTION 3: Homepage Layout (12 tasks)

### 3.1 Create Scores Bar Component
- [x] Create sticky top bar with live scores
- [x] Horizontally scrollable on mobile
- [x] Show: status (LIVE/FINAL/time), teams, scores
- [x] Red pulsing dot for LIVE games
- [x] ThemeToggle on right side

### 3.2 Create Header/Navigation
- [x] Logo (left) - swap between light/dark versions (existing Header component)
- [x] Team nav links: Bears, Bulls, Blackhawks, Cubs, White Sox, Podcasts (existing Header)
- [x] Each team has dropdown: Scores, Schedule, Roster, Stats (existing Header)
- [x] Search icon button (existing Header)
- [x] Sign In link (existing Header)
- [x] Mobile hamburger menu (existing Header)

### 3.3 Create Hero Section
- [x] 60/40 split: Featured article (left), Top Headlines (right)
- [x] Featured article:
  - Large image with gradient overlay
  - Team badge (colored by team)
  - Title, author, date
  - "NEW" badge if unseen
  - Auto-rotate through top 3 articles (8 second intervals)
  - Dot indicators for rotation position
- [x] Top Headlines:
  - Numbered list (1-6)
  - Team badge + title + date for each
  - Red dot for unseen articles
  - Hover state with color change

### 3.4 Create Team Quick Nav
- [x] Horizontal row of team pill buttons
- [x] Each pill: colored border + dot + team name
- [x] Scrollable on mobile
- [x] Links to team category pages

### 3.5 Create Latest News Grid
- [x] Section header: "Latest News" + "View All →" link
- [x] Grid layout: 4 columns on desktop, 2 on tablet, 1 on mobile
- [x] First article spans 2 columns
- [x] Each card: image, team badge, title, excerpt (first only), author, date
- [x] "NEW" dot indicator for unseen
- [x] Hover effects: scale image, color title

### 3.6 Create Team Sections
- [x] For Bears, Bulls, Blackhawks (top 3 teams):
  - Section header with team color bar + "More [Team] →" link
  - 4-column grid of article cards
  - Standard card format

### 3.7 Create Load More Button
- [x] Centered red button
- [x] "Load More Articles" text
- [x] Hover state

### 3.8 Create Footer
- [x] 4-column layout: Logo/Social, Teams, Podcasts, Legal (existing Footer component)
- [x] Social icons: Facebook, Twitter/X, Instagram, YouTube (existing Footer)
- [x] Copyright line at bottom (existing Footer)

### 3.9 Implement Light/Dark Styles
- [x] All backgrounds use: `bg-gray-50 dark:bg-[#0a0a0b]` pattern
- [x] All cards use: `bg-white dark:bg-[#111113]`
- [x] All borders use: `border-gray-200 dark:border-[#27272a]`
- [x] All text uses: `text-gray-900 dark:text-white` etc.
- [x] Transition colors smoothly: `transition-colors duration-300`

### 3.10 Implement Loading States
- [x] Skeleton loaders for hero section
- [x] Skeleton loaders for article cards
- [x] Skeleton loaders for headlines list
- [x] Animate with pulse effect

### 3.11 Connect to Oracle Feed
- [x] Use useOracleFeed hook
- [x] Display feed.featured as hero
- [x] Display feed.topHeadlines in headlines list
- [x] Display feed.latestNews in grid
- [x] Display feed.teamSections in team rows
- [x] Call trackView() on article click
- [x] Show "NEW" indicators using isUnseen()

### 3.12 Mobile Optimization
- [x] Scores bar scrollable
- [x] Navigation collapses to hamburger (existing Header)
- [x] Hero stacks vertically
- [x] Grids reduce columns
- [x] Touch-friendly tap targets (44px min)
- [x] Full-width on small screens (minimal padding)

---

## SECTION 4: AR Feature (5 tasks)

### 4.1 Create AR Directory
- [ ] Create `src/components/ar/` directory

### 4.2 Create AROverlay Component
- [ ] Create `src/components/ar/AROverlay.tsx`
- [ ] Check WebXR AR support on mount
- [ ] Show "Launch AR" button if supported
- [ ] Show "Not Supported" message if not
- [ ] Start immersive-ar session on button click
- [ ] Render Three.js canvas with XR provider
- [ ] Display mockery text on floating panel
- [ ] Exit button to end session
- [ ] Instructions overlay at top

### 4.3 Create ARButton Component
- [ ] Create `src/components/ar/ARButton.tsx`
- [ ] Dynamic import AROverlay (avoid SSR issues)
- [ ] Show/hide overlay on click
- [ ] Optional: FloatingARButton variant for article pages
- [ ] Optional: Premium gating for Elite users

### 4.4 Create AR Index Export
- [ ] Create `src/components/ar/index.ts`
- [ ] Export AROverlay, ARButton, FloatingARButton

### 4.5 Test AR Feature
- [ ] Test on Android Chrome with ARCore
- [ ] Verify camera permission prompt appears
- [ ] Verify overlay displays in AR view
- [ ] Test exit button works

---

## SECTION 5: Integration & Polish (5 tasks)

### 5.1 Update Page Metadata
- [ ] Title: "Sports Mockery | Chicago Sports News and Rumors"
- [ ] Description: "Chicago sports news, rumors, and analysis for Bears, Bulls, Blackhawks, Cubs, and White Sox fans."

### 5.2 Add Inter Font
- [ ] Import Inter from Google Fonts or next/font
- [ ] Apply to body via layout.tsx

### 5.3 Add Scrollbar Hide Utility
- [ ] Add `.scrollbar-hide` class to globals.css:
```css
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

### 5.4 Test Full Flow
- [ ] Load homepage - verify light mode default
- [ ] Click theme toggle - verify dark mode
- [ ] Click article - verify trackView called
- [ ] Refresh - verify viewed articles de-prioritized
- [ ] Check mobile responsive layout

### 5.5 Update CHANGELOG.md
- [ ] Add entry for homepage redesign
- [ ] List all new files created
- [ ] Note Oracle Feed integration
- [ ] Note AR feature addition

---

## VERIFICATION CHECKLIST

After completing all tasks, verify:

- [ ] Homepage loads without errors
- [ ] Theme toggle works (light ↔ dark)
- [ ] Theme persists on refresh
- [ ] Scores bar displays and scrolls
- [ ] Navigation dropdowns work
- [ ] Hero article displays with image
- [ ] Hero rotates through articles
- [ ] Top Headlines show numbered list
- [ ] "NEW" badges appear on unread articles
- [ ] Team quick nav pills link correctly
- [ ] Latest News grid displays properly
- [ ] Team sections display with articles
- [ ] Footer displays all links
- [ ] Mobile layout is responsive
- [ ] AR button appears (on supported devices)
- [ ] No console errors

---

## FILE LOCATIONS SUMMARY

```
src/
├── app/
│   ├── page.tsx                    # Homepage (replace)
│   ├── layout.tsx                  # Add ThemeProvider + flash script
│   ├── globals.css                 # Add scrollbar-hide + theme vars
│   └── api/
│       └── feed/
│           └── route.ts            # Oracle Feed API (create)
├── components/
│   ├── ThemeToggle.tsx             # Star toggle (replace)
│   └── ar/
│       ├── index.ts                # AR exports (create)
│       ├── AROverlay.tsx           # AR overlay (create)
│       └── ARButton.tsx            # AR button (create)
├── contexts/
│   └── ThemeContext.tsx            # Theme provider (verify/update)
└── hooks/
    └── useOracleFeed.ts            # Feed hook (create)

tailwind.config.ts                   # Add darkMode: 'class'
```

---

## NOTES

- All files reference downloaded zip at ~/Downloads/sm-homepage-complete.zip
- Test on http://localhost:3000 after each section
- Commit after each section completes
- AR only works on HTTPS (use Vercel deploy or ngrok for testing)
