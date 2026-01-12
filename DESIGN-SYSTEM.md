# DESIGN-SYSTEM.md - Visual Polish & Feature Discovery

**Goal:** Make all 200+ components visually cohesive and ensure every feature is discoverable and configurable through the UI.

**CRITICAL:** Before starting, read CHANGELOG.md to see what exists.
**CRITICAL:** Add your work to CHANGELOG.md when done.

---

## SECTION 1: Design Tokens & Theme (15 tasks)

### 1.1 Create Design Tokens File
- [ ] Create `src/styles/tokens.css`:
```css
:root {
  /* Colors - Dark Theme (Primary) */
  --bg-primary: #0a0a0b;
  --bg-secondary: #111113;
  --bg-tertiary: #18181b;
  --bg-card: #1c1c1f;
  --bg-hover: #252528;
  
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  --text-disabled: #52525b;
  
  --border-default: #27272a;
  --border-subtle: #1f1f23;
  --border-strong: #3f3f46;
  
  --accent-red: #FF0000;
  --accent-red-hover: #CC0000;
  --accent-red-glow: rgba(255, 0, 0, 0.2);
  
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Team Colors */
  --bears-primary: #0B162A;
  --bears-secondary: #C83200;
  --bulls-primary: #CE1141;
  --bulls-secondary: #000000;
  --cubs-primary: #0E3386;
  --cubs-secondary: #CC3433;
  --whitesox-primary: #27251F;
  --whitesox-secondary: #C4CED4;
  --blackhawks-primary: #CF0A2C;
  --blackhawks-secondary: #000000;
  
  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px var(--accent-red-glow);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

### 1.2 Create Component Base Styles
- [ ] Create `src/styles/components.css` with base styles for:
  - Buttons (primary, secondary, ghost, danger)
  - Cards (default, glass, glow)
  - Inputs (text, select, checkbox, radio)
  - Tables
  - Badges
  - Modals
  - Dropdowns

### 1.3 Update Tailwind Config
- [ ] Update `tailwind.config.js` to use design tokens
- [ ] Add custom colors, spacing, fonts
- [ ] Configure dark mode

### 1.4 Create Button Component Library
- [ ] Create `src/components/ui/Button.tsx` with variants:
  - Primary (red)
  - Secondary (gray)
  - Ghost (transparent)
  - Danger (red outline)
  - Sizes: sm, md, lg
  - States: loading, disabled

### 1.5 Create Input Component Library
- [ ] Create `src/components/ui/Input.tsx`
- [ ] Create `src/components/ui/Select.tsx`
- [ ] Create `src/components/ui/Checkbox.tsx`
- [ ] Create `src/components/ui/TextArea.tsx`
- [ ] All with consistent styling, error states, labels

### 1.6 Create Card Component Library
- [ ] Update `src/components/ui/` card components:
  - Card (base)
  - GlassCard (frosted glass effect)
  - GlowCard (red glow on hover)
  - StatCard (for numbers/metrics)

### 1.7 Create Modal Component
- [ ] Create `src/components/ui/Modal.tsx`:
  - Backdrop blur
  - Slide-up animation
  - Close button
  - Sizes: sm, md, lg, full

### 1.8 Create Dropdown Component
- [ ] Create `src/components/ui/Dropdown.tsx`:
  - Animated open/close
  - Keyboard navigation
  - Search/filter option

### 1.9 Create Toast/Notification System
- [ ] Create `src/components/ui/Toast.tsx`
- [ ] Create toast context/provider
- [ ] Success, error, warning, info variants
- [ ] Auto-dismiss with progress bar

### 1.10 Create Table Component
- [ ] Create `src/components/ui/Table.tsx`:
  - Sortable columns
  - Sticky header
  - Row hover states
  - Selection checkboxes
  - Pagination

### 1.11 Create Tabs Component
- [ ] Create `src/components/ui/Tabs.tsx`:
  - Horizontal tabs
  - Underline indicator with animation
  - Team color theming option

### 1.12 Create Badge Component
- [ ] Update `src/components/ui/Badge.tsx`:
  - Team color variants
  - Status variants (live, final, upcoming)
  - Size variants

### 1.13 Create Avatar Component
- [ ] Create `src/components/ui/Avatar.tsx`:
  - Image with fallback initials
  - Sizes: xs, sm, md, lg, xl
  - Status indicator (online, away)

### 1.14 Create Skeleton Components
- [ ] Create consistent skeleton loaders for:
  - Article cards
  - Stats cards
  - Tables
  - Player cards
  - Team headers

### 1.15 Import Fonts
- [ ] Add Inter font (Google Fonts or local)
- [ ] Add JetBrains Mono for code/stats
- [ ] Configure in layout.tsx

**Run notification, continue to Section 2**

---

## SECTION 2: Admin Dashboard Redesign (20 tasks)

### 2.1 Redesign Admin Sidebar
- [ ] Update `src/components/admin/Sidebar.tsx`:
```
Logo: SM (red square)
─────────────────
📊 Dashboard
─────────────────
CONTENT
  📝 Posts
  📁 Categories
  👤 Authors
  🖼️ Media Library
─────────────────
FEATURES
  📈 Charts
  🔮 AI Assistant
  📊 Analytics
─────────────────
SETTINGS
  ⚙️ General
  🔍 SEO
  🔗 Social
  👥 Users
─────────────────
```
- Active item: red left border + red text
- Hover: subtle background
- Collapsible on mobile

### 2.2 Redesign Dashboard Home
- [ ] Update `src/app/admin/page.tsx` with sections:
```
Welcome back, [Name]!
─────────────────────────────────────
[Quick Stats Row]
Posts: 31,099 | Views Today: 12,847 | Authors: 9

[Quick Actions Grid]
+ New Post    📊 Create Chart    🖼️ Upload Media    👤 Add Author

[Two Column Layout]
LEFT (60%):
  📈 Views This Week [Line Chart]
  📝 Recent Posts [Table with edit links]
  
RIGHT (40%):
  🔥 Top Posts Today [Ranked list]
  📊 Category Breakdown [Pie chart]
  ⚡ Recent Activity [Feed]
```

### 2.3 Create Quick Actions Component
- [ ] Create `src/components/admin/QuickActions.tsx`:
  - Large clickable cards
  - Icons + labels
  - Links to: New Post, Create Chart, Upload Media, Add Author, Site Settings

### 2.4 Create Admin Stats Overview
- [ ] Update `src/components/admin/StatsCard.tsx`:
  - Large number with label
  - Trend indicator (↑ 12% vs last week)
  - Sparkline mini-chart
  - Click to see details

### 2.5 Create Charts Management Page
- [ ] Create `src/app/admin/charts/page.tsx`:
  - Grid of saved charts
  - Preview thumbnails
  - Edit/Delete actions
  - "Create New Chart" button
  - Filter by type (bar, line, pie, etc.)

### 2.6 Create Chart Builder Page
- [ ] Create `src/app/admin/charts/new/page.tsx`:
  - Full-page chart builder
  - Step-by-step wizard OR all-in-one view
  - Live preview
  - Save & get shortcode

### 2.7 Create AI Assistant Page
- [ ] Create `src/app/admin/ai/page.tsx`:
  - AI content generation interface
  - Prompt templates
  - History of generations
  - Settings (tone, length, style)

### 2.8 Create Analytics Dashboard Page
- [ ] Create `src/app/admin/analytics/page.tsx`:
  - Views over time (line chart)
  - Top posts (bar chart)
  - Traffic sources (pie chart)
  - Device breakdown
  - Date range selector

### 2.9 Redesign Posts List Page
- [ ] Update `src/app/admin/posts/page.tsx`:
  - Clean table with thumbnails
  - Status badges (published, draft, scheduled)
  - Quick actions (edit, view, delete)
  - Bulk select and actions
  - Better filters UI

### 2.10 Redesign Post Editor
- [ ] Update post editor layout:
  - Full-width editor area
  - Collapsible right sidebar
  - Floating toolbar (sticky)
  - Autosave indicator
  - Word/character count
  - Preview button

### 2.11 Create Editor Feature Bar
- [ ] Add toolbar above editor with:
  - Insert Chart [icon]
  - Insert Image [icon]
  - Insert Video [icon]
  - AI Assist [icon]
  - Voice Input [icon]

### 2.12 Redesign Media Library
- [ ] Update `src/app/admin/media/page.tsx`:
  - Grid view with larger thumbnails
  - List view option
  - Drag-drop upload zone
  - Folder organization (optional)
  - Image editing (crop, resize)

### 2.13 Redesign Categories Page
- [ ] Update `src/app/admin/categories/page.tsx`:
  - Cards showing post count per category
  - Team logos for team categories
  - Drag to reorder
  - Inline edit

### 2.14 Redesign Authors Page
- [ ] Update `src/app/admin/authors/page.tsx`:
  - Author cards with avatars
  - Post count, last active
  - Role badges
  - Quick edit modal

### 2.15 Redesign Settings Page
- [ ] Update `src/app/admin/settings/page.tsx`:
  - Tab navigation (General, SEO, Social, Advanced)
  - Clean form layout
  - Save button with success toast
  - Reset to defaults option

### 2.16 Create Admin Header
- [ ] Update `src/components/admin/AdminTopBar.tsx`:
  - Search bar
  - Notifications bell
  - User avatar dropdown
  - "View Site" link
  - Help/docs link

### 2.17 Create Command Palette
- [ ] Create `src/components/admin/CommandPalette.tsx`:
  - Cmd+K to open
  - Search all admin functions
  - Recent pages
  - Quick actions

### 2.18 Create Admin Notifications
- [ ] Create notification system:
  - New comments
  - Post published
  - Scheduled posts going live
  - Error alerts

### 2.19 Create Help Tooltips
- [ ] Add help icons (?) next to complex features
- [ ] Hover to show explanation
- [ ] Link to documentation

### 2.20 Mobile Admin Optimization
- [ ] Ensure all admin pages work on mobile
- [ ] Collapsible sidebar
- [ ] Touch-friendly buttons
- [ ] Simplified tables

**Run notification, continue to Section 3**

---

## SECTION 3: Homepage Redesign - ESPN Style (20 tasks)

### 3.1 Create Homepage Layout Structure
- [ ] Update `src/app/page.tsx` with clean structure:
```
[OracleScoresBar - sticky, 50px]
[Header]
[ProphecyTicker - slim, one line]

[Hero Section - 500px]
  Featured article with large image
  
[Main Content - max-width 1400px, padding 20px]
  [Left Column - 70%]
    Top Stories (HeadlineStack - 5 items)
    ─────────────
    Latest News (ArticleGrid - 6 items, 2x3)
    ─────────────
    [Team Tabs - Bears | Bulls | Cubs | Sox | Hawks]
    Team-specific news (4 articles)
    
  [Right Column - 30%]
    Upcoming Games Widget
    ─────────────
    Trending (5 text-only links)
    ─────────────
    Newsletter Signup
    ─────────────
    Poll Widget

[Team Section - full width]
  5 team cards with logos, records, next game

[Footer]
```

### 3.2 Redesign OracleScoresBar
- [ ] Update `src/components/scores/OracleScoresBar.tsx`:
  - Horizontal scroll on mobile
  - Team logos (not just text)
  - Live indicator (pulsing dot)
  - Score with W/L color
  - Click to expand game details
  - 50px height max

### 3.3 Redesign ProphecyTicker
- [ ] Update `src/components/headlines/ProphecyTicker.tsx`:
  - Single line, auto-scroll
  - "AI PREDICTION:" prefix in red
  - Smooth animation
  - Click to see full prediction

### 3.4 Redesign HeroSection
- [ ] Update `src/components/home/HeroSection.tsx`:
  - Single featured article
  - Full-width image (16:9 or 21:9)
  - Gradient overlay from bottom
  - Large title (32-40px)
  - Category badge
  - Author + time
  - "Read More" button

### 3.5 Redesign HeadlineStack
- [ ] Update `src/components/headlines/HeadlineStack.tsx`:
  - Clean list style (not cards)
  - Small thumbnail left
  - Title + excerpt
  - Category + time right-aligned
  - Hover: subtle background

### 3.6 Redesign ArticleGrid
- [ ] Update `src/components/home/ArticleGrid.tsx`:
  - 2x3 grid on desktop
  - 1 column on mobile
  - Card style with image on top
  - Category badge overlay
  - Title, excerpt (2 lines max)
  - Author avatar + name + time

### 3.7 Create Team Tabs Section
- [ ] Create `src/components/home/TeamTabs.tsx`:
  - Tab for each team
  - Team color underline on active
  - Shows 4 latest articles for selected team
  - Smooth tab switching

### 3.8 Redesign UpcomingGames
- [ ] Update `src/components/home/UpcomingGames.tsx`:
  - Compact list
  - Team logos
  - Date + time
  - TV channel
  - "Set Reminder" button

### 3.9 Redesign TrendingSidebar
- [ ] Update `src/components/home/TrendingSidebar.tsx`:
  - Numbered list (1-5)
  - Text only (no images)
  - Category label
  - Hover: show preview tooltip

### 3.10 Redesign NewsletterCTA
- [ ] Update `src/components/home/NewsletterCTA.tsx`:
  - Dark card with red accent
  - Compelling headline
  - Email input + button
  - Privacy note
  - Success state

### 3.11 Redesign PollWidget
- [ ] Update `src/components/home/PollWidget.tsx`:
  - Current poll question
  - Vote buttons
  - Results bar chart after voting
  - Total votes count

### 3.12 Redesign TeamSection
- [ ] Update `src/components/home/TeamSection.tsx`:
  - Horizontal row of 5 cards
  - Large team logo
  - Team name
  - Current record
  - Next game
  - Link to team page

### 3.13 Remove Cluttered Components
- [ ] Remove or hide from homepage:
  - WeatherWidget (unless requested)
  - SocialFeed (move to footer)
  - VideoHighlights (move to dedicated page)
  - MockeryOfTheDay (move to sidebar)
  - SentimentOrb (too gimmicky)

### 3.14 Add Section Headers
- [ ] Create consistent section headers:
  - "Top Stories" with red underline
  - "Latest News" 
  - "Trending"
  - Clean typography

### 3.15 Add "Load More" for Articles
- [ ] Add load more button at end of article grid
- [ ] Infinite scroll option

### 3.16 Mobile Homepage
- [ ] Test and fix mobile layout:
  - Scores bar scrolls horizontally
  - Hero takes full width
  - Single column articles
  - Sidebar moves below main content

### 3.17 Add Live Indicator
- [ ] Create live game indicator:
  - Pulsing red dot
  - "LIVE" badge
  - Auto-updates

### 3.18 Add Breaking News Banner
- [ ] Update `src/components/home/BreakingNewsBanner.tsx`:
  - Red background
  - Only shows when there's breaking news
  - Dismissible
  - Links to article

### 3.19 Improve Page Transitions
- [ ] Add smooth page transitions
- [ ] Loading states between pages

### 3.20 Performance Optimization
- [ ] Lazy load below-fold content
- [ ] Optimize images
- [ ] Reduce initial bundle

**Run notification, continue to Section 4**

---

## SECTION 4: Team & Player Pages Polish (15 tasks)

### 4.1 Redesign Team Header
- [ ] Update `src/components/teams/TeamHeader.tsx`:
  - Team logo (large, left)
  - Team name + city
  - Record (W-L-T) with win%
  - Standing (2nd in NFC North)
  - Next game preview
  - Team color gradient background

### 4.2 Redesign Team Nav
- [ ] Update `src/components/teams/TeamNav.tsx`:
  - Horizontal tabs
  - Team color underline on active
  - Icons + text
  - Sticky on scroll

### 4.3 Redesign Schedule Table
- [ ] Update `src/components/teams/ScheduleTable.tsx`:
  - ESPN-style layout
  - Week/Game # column
  - Opponent with logo
  - Date + time
  - Result (W 24-17) with color
  - TV channel
  - Current week highlighted

### 4.4 Redesign Roster Table
- [ ] Update `src/components/teams/RosterTable.tsx`:
  - Player headshot (small)
  - Number + Name (link)
  - Position
  - Physical stats
  - Experience
  - Sortable columns
  - Position filter tabs

### 4.5 Redesign Standings Table
- [ ] Update `src/components/teams/StandingsTable.tsx`:
  - Team logo + name
  - W-L-T, PCT, GB
  - Home/Away records
  - Streak
  - Current team highlighted row
  - Division/Conference toggle

### 4.6 Redesign Team Stats
- [ ] Update `src/components/teams/TeamStatsDisplay.tsx`:
  - Offense/Defense cards
  - Key stats with rankings
  - Comparison to league average
  - Visual charts

### 4.7 Add Team Color Theming
- [ ] Apply team colors dynamically:
  - Headers
  - Active states
  - Accent colors
  - Buttons

### 4.8 Redesign Player Header
- [ ] Update `src/components/players/PlayerHeader.tsx`:
  - Large headshot
  - Name + number
  - Position + team
  - Key stats row
  - Status badge
  - Team color accents

### 4.9 Redesign Player Stats Table
- [ ] Update `src/components/players/PlayerStatsTable.tsx`:
  - Season-by-season rows
  - Career totals
  - Sortable
  - Sport-specific columns

### 4.10 Redesign Player Game Log
- [ ] Update `src/components/players/PlayerGameLog.tsx`:
  - Date + opponent
  - Result
  - Individual stats
  - Expandable rows

### 4.11 Add Player Comparison
- [ ] Create visual player comparison:
  - Side-by-side stats
  - Bar chart comparison
  - Winner indicators

### 4.12 Mobile Team Pages
- [ ] Optimize for mobile:
  - Scrollable tables
  - Stacked layout
  - Touch-friendly tabs

### 4.13 Mobile Player Pages
- [ ] Optimize for mobile:
  - Stacked header
  - Scrollable stats
  - Collapsible sections

### 4.14 Add Team News Integration
- [ ] Show latest articles on team pages
- [ ] Pull from existing article system

### 4.15 Add Player News Integration
- [ ] Show articles mentioning player
- [ ] Search by player name

**Run notification, continue to Section 5**

---

## SECTION 5: Article Page Polish (15 tasks)

### 5.1 Redesign Article Header
- [ ] Update `src/components/article/ArticleHero.tsx`:
  - Full-width featured image
  - Category badge
  - Title (large, bold)
  - Excerpt/subtitle
  - Author byline with avatar
  - Date + read time
  - Share buttons

### 5.2 Redesign Article Content
- [ ] Update `src/components/article/ArticleContent.tsx`:
  - Max-width for readability (680px)
  - Proper typography
  - Image handling
  - Blockquote styling
  - Code block styling

### 5.3 Add Reading Progress Bar
- [ ] Update `src/components/article/ReadingProgressBar.tsx`:
  - Thin bar at top
  - Team/brand color
  - Shows scroll progress

### 5.4 Redesign Table of Contents
- [ ] Update `src/components/article/TableOfContents.tsx`:
  - Sticky sidebar
  - Highlights current section
  - Smooth scroll on click

### 5.5 Redesign Related Articles
- [ ] Update `src/components/article/RelatedArticles.tsx`:
  - 3 cards at bottom
  - Same category or tags
  - Clean card design

### 5.6 Redesign Share Buttons
- [ ] Update `src/components/article/ShareButtons.tsx`:
  - Floating sidebar (desktop)
  - Bottom bar (mobile)
  - Copy link button
  - Native share on mobile

### 5.7 Redesign Author Byline
- [ ] Update `src/components/article/AuthorByline.tsx`:
  - Avatar
  - Name (link to author page)
  - Title/role
  - Follow button

### 5.8 Style Fact Boxes
- [ ] Update `src/components/article/FactBox.tsx`:
  - Colored left border
  - Background
  - Icon
  - Title + content

### 5.9 Style Pull Quotes
- [ ] Update `src/components/article/PullQuote.tsx`:
  - Large text
  - Quotation marks
  - Attribution

### 5.10 Style Embedded Charts
- [ ] Update `src/components/article/ArticleChart.tsx`:
  - Clean container
  - Caption
  - Source link

### 5.11 Style Video Embeds
- [ ] Update `src/components/article/EmbedVideo.tsx`:
  - Responsive container
  - Play button overlay
  - Caption

### 5.12 Add Article Actions Bar
- [ ] Create floating action bar:
  - Bookmark
  - Share
  - React
  - Comment count

### 5.13 Redesign Comment Section
- [ ] Update `src/components/article/CommentSection.tsx`:
  - Disqus or custom
  - Clean styling
  - Load on scroll

### 5.14 Add Next/Prev Navigation
- [ ] Update `src/components/article/NextPrevArticle.tsx`:
  - Previous article (left)
  - Next article (right)
  - Image + title

### 5.15 Mobile Article Optimization
- [ ] Optimize reading experience:
  - Full-width images
  - Larger text
  - Touch-friendly buttons

**Run notification, continue to Section 6**

---

## SECTION 6: Global Polish & Consistency (15 tasks)

### 6.1 Redesign Site Header
- [ ] Update `src/components/layout/Header.tsx`:
  - Logo left
  - Main nav center
  - Search + user right
  - Team mega-menu
  - Sticky on scroll

### 6.2 Redesign Site Footer
- [ ] Update `src/components/layout/Footer.tsx`:
  - Dark background
  - Team links
  - Social icons
  - Newsletter signup
  - Legal links

### 6.3 Redesign Search
- [ ] Update `src/components/search/`:
  - Full-screen modal
  - Recent searches
  - Popular searches
  - Live results

### 6.4 Add 404 Page
- [ ] Create custom 404:
  - Fun sports-themed message
  - Search bar
  - Popular articles

### 6.5 Add Error Pages
- [ ] Create error boundaries:
  - Friendly error messages
  - Retry buttons
  - Contact support link

### 6.6 Add Loading States
- [ ] Ensure all pages have:
  - Skeleton loaders
  - Loading spinners
  - Progress indicators

### 6.7 Improve Accessibility
- [ ] Add proper:
  - ARIA labels
  - Keyboard navigation
  - Focus states
  - Color contrast

### 6.8 Add Animations
- [ ] Subtle animations:
  - Page transitions
  - Card hovers
  - Button clicks
  - Scroll reveals

### 6.9 Dark/Light Mode Toggle
- [ ] Implement theme switching:
  - Toggle in header
  - System preference default
  - Persist choice

### 6.10 Mobile Navigation
- [ ] Update `src/components/layout/MobileMenu.tsx`:
  - Slide-in menu
  - All nav items
  - Team shortcuts
  - User actions

### 6.11 Notification System
- [ ] Create toast notifications:
  - Success/error messages
  - Auto-dismiss
  - Action buttons

### 6.12 Consistent Icons
- [ ] Use single icon library (Lucide)
- [ ] Consistent sizing
- [ ] Proper alignment

### 6.13 Image Optimization
- [ ] All images use Next.js Image
- [ ] Proper sizing
  - Blur placeholders
- [ ] WebP format

### 6.14 SEO Consistency
- [ ] All pages have:
  - Unique titles
  - Meta descriptions
  - Open Graph images
  - JSON-LD schema

### 6.15 Performance Audit
- [ ] Run Lighthouse
- [ ] Fix any issues
- [ ] Target 90+ scores

**Run notification - DESIGN SYSTEM COMPLETE!**

---

## 📋 COMPLETION CHECKLIST

- [ ] All 100 tasks completed
- [ ] Design tokens in use everywhere
- [ ] Admin dashboard is clean and functional
- [ ] Homepage looks like ESPN
- [ ] All features are discoverable
- [ ] Mobile experience is polished
- [ ] Consistent styling throughout

```bash
osascript -e 'display notification "DESIGN SYSTEM COMPLETE!" with title "Claude Code"' && afplay /System/Library/Sounds/Funk.aiff
```
