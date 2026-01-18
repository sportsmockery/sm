# SESSION 1 - DESIGN SYSTEM & CORE UI
## SportsMockery.com Migration

**INSTRUCTIONS:** Complete each section in order. Mark tasks [x] as you complete them. When a section is done, immediately start the next section. Run the notification command after each section.

When you complete a section, run:
```
osascript -e 'display notification "Section complete!" with title "Session 1"' && afplay /System/Library/Sounds/Glass.aiff
```

---

## SECTION 1: Design Foundation (15 tasks) ✅ COMPLETE
- [x] 1. Create src/styles/colors.ts with full brand palette:
  ```typescript
  export const colors = {
    primary: { red: '#FF0000', black: '#000000', white: '#FFFFFF' },
    bears: { navy: '#0B162A', orange: '#C83200' },
    bulls: { red: '#CE1141', black: '#000000' },
    cubs: { blue: '#0E3386', red: '#CC3433' },
    whiteSox: { black: '#27251F', silver: '#C4CED4' },
    blackhawks: { red: '#CF0A2C', black: '#000000' },
    accent: { glow: '#FF000033', success: '#10B981', warning: '#F59E0B' }
  }
  ```
- [x] 2. Update tailwind.config.ts with all colors, gradients, and custom animations
- [x] 3. Install fonts: npm install @fontsource/montserrat @fontsource/georgia
- [x] 4. Create src/styles/fonts.ts - Configure Montserrat (headlines) and Georgia (body)
- [x] 5. Update src/app/layout.tsx with font imports and base styles
- [x] 6. Create src/styles/animations.ts - Define reusable animations (fadeIn, slideUp, pulse, glow)
- [x] 7. Create src/components/ui/GlowCard.tsx - Card with glowing border effect on hover
- [x] 8. Create src/components/ui/GradientText.tsx - Text with gradient fill
- [x] 9. Create src/components/ui/PulsingDot.tsx - Live indicator dot with pulse animation
- [x] 10. Create src/components/ui/TeamColorBadge.tsx - Badge that uses team colors based on prop
- [x] 11. Create src/components/ui/GlassCard.tsx - Glass morphism card component
- [x] 12. Create src/components/ui/AnimatedCounter.tsx - Number that animates counting up
- [x] 13. Create src/components/ui/SkeletonLoader.tsx - Loading skeleton for cards/text
- [x] 14. Create src/components/ui/Tooltip.tsx - Hover tooltip component
- [x] 15. Create src/components/ui/Badge.tsx - Reusable badge component with variants

**Run notification command, then continue to Section 2**

---

## SECTION 2: Header & Navigation (15 tasks) ✅ COMPLETE
- [x] 1. Create src/components/layout/Header.tsx:
  - Sticky with glass morphism backdrop blur
  - Red accent bar at very top (3px)
  - "SPORTS MOCKERY" bold logo left side
  - Team dropdown navigation center
  - Search icon, notification bell, user avatar right side
  - Glowing hover states
- [x] 2. Create src/components/layout/TeamDropdown.tsx:
  - Dropdown with all Chicago teams
  - Team color accent on hover
  - Links to /team/bears, /team/bulls, etc.
  - Smooth animation open/close
- [x] 3. Create src/components/layout/MobileMenu.tsx:
  - Full screen overlay
  - Slide in from right
  - Team links with color accents
  - Close X button
  - Animated staggered list items
- [x] 4. Create src/components/layout/SearchModal.tsx:
  - Full screen search overlay
  - Large centered search input
  - Real-time results as you type
  - Recent searches
  - Keyboard shortcut Cmd+K to open
  - ESC to close
- [x] 5. Create src/components/layout/UserMenu.tsx:
  - Avatar icon trigger
  - Dropdown: Login, Sign Up (logged out) or Profile, Settings, Logout (logged in)
  - Glass morphism style
- [x] 6. Create src/components/layout/NotificationBell.tsx:
  - Bell icon with red badge count
  - Dropdown showing recent alerts
  - "Mark all read" link
- [x] 7. Create src/components/layout/LiveTicker.tsx:
  - Horizontal scrolling headlines below header
  - Red background, white text
  - Infinite smooth scroll
  - Pause on hover
  - Example headlines hardcoded
- [x] 8. Create src/components/layout/Breadcrumbs.tsx:
  - Home > Category > Article style
  - Chevron separators
  - Current page not linked
- [x] 9. Create src/components/layout/Footer.tsx:
  - Black background
  - 4 columns: Teams, Company, Legal, Social
  - Chicago skyline SVG silhouette
  - Copyright 2026
  - Newsletter signup input
- [x] 10. Create src/components/layout/ChicagoSkyline.tsx:
  - SVG Chicago skyline silhouette
  - Can be used in header/footer
  - Subtle parallax option
- [x] 11. Create src/components/layout/ScrollToTop.tsx:
  - Floating button bottom right
  - Appears after scrolling 500px
  - Smooth scroll to top
  - Red with white arrow
- [x] 12. Create src/components/layout/CookieBanner.tsx:
  - Bottom banner for cookie consent
  - Accept/Decline buttons
  - Saves preference to localStorage
- [x] 13. Update src/app/layout.tsx - Add Header, Footer, LiveTicker, ScrollToTop, CookieBanner
- [x] 14. Create src/hooks/useScrollPosition.ts - Track scroll position
- [x] 15. Create src/hooks/useKeyboardShortcut.ts - Handle keyboard shortcuts (Cmd+K for search)

**Run notification command, then continue to Section 3**

---

## SECTION 3: Homepage Layout (20 tasks) ✅ COMPLETE
- [x] 1. Create src/components/home/HeroSection.tsx:
  - Full width featured article
  - Large image with gradient overlay
  - Title, excerpt, category badge overlaid
  - Author, date, reading time
  - Animated entrance
- [x] 2. Create src/components/home/FeaturedGrid.tsx:
  - 4 featured articles in grid
  - 1 large left, 3 stacked right
  - Hover effects with glow
- [x] 3. Create src/components/home/LatestNews.tsx:
  - "Latest News" section header with red underline
  - Grid of ArticleCards
  - "Load More" button
- [x] 4. Create src/components/home/TeamSection.tsx:
  - Horizontal scrollable team cards
  - Each team card shows latest headline
  - Team color gradient background
  - Links to team page
- [x] 5. Create src/components/home/TrendingSidebar.tsx:
  - "Trending Now" header with fire icon
  - Numbered list 1-10
  - Red number badges
  - Compact article titles
  - Glass morphism card
- [x] 6. Create src/components/home/ProphecySection.tsx:
  - "AI Prophecies" section
  - Glowing border cards
  - Prediction text with confidence percentage
  - "Powered by Claude AI" badge
  - Example predictions:
    - "Bears clinch NFC North by Week 17 (78% confidence)"
    - "Cubs trade for ace pitcher before deadline (65% confidence)"
- [x] 7. Create src/components/home/PopularThisWeek.tsx:
  - Top 5 articles by views
  - Thumbnail, title, view count
- [x] 8. Create src/components/home/NewsletterCTA.tsx:
  - Large newsletter signup section
  - "Get the Mockery delivered" headline
  - Email input with red submit button
  - Privacy note
- [x] 9. Create src/components/home/PollWidget.tsx:
  - Weekly fan poll
  - Question, 4 options
  - Vote button
  - Show results after voting
  - Example: "Will Bears make playoffs?" Yes/No/Maybe/Who cares
- [x] 10. Create src/components/home/SocialFeed.tsx:
  - Latest tweets/posts placeholder
  - Twitter embed style cards
- [x] 11. Create src/components/home/VideoHighlights.tsx:
  - Video thumbnails grid
  - Play button overlay
  - Duration badge
  - Placeholder for future video content
- [x] 12. Create src/components/home/UpcomingGames.tsx:
  - Next 5 Chicago team games
  - Date, teams, time, channel
  - Example data:
    ```
    [
      { date: "Sun Dec 22", teams: "Bears vs Lions", time: "12:00 PM", channel: "FOX" },
      { date: "Sun Dec 22", teams: "Bulls @ Bucks", time: "7:00 PM", channel: "NBCSCH" },
      { date: "Mon Dec 23", teams: "Blackhawks vs Blues", time: "7:30 PM", channel: "ESPN+" }
    ]
    ```
- [x] 13. Create src/components/home/MockeryOfTheDay.tsx:
  - Featured sarcastic take
  - Large quote style
  - Author avatar and name
  - Share buttons
- [x] 14. Create src/components/home/SentimentOrb.tsx:
  - Circular fan mood indicator
  - Animated gradient background
  - Percentage and label
  - "Bears fans: 72% optimistic"
- [x] 15. Create src/components/home/BreakingNewsBanner.tsx:
  - Red banner for breaking news
  - Appears at top when active
  - Dismissible X button
  - Pulsing "BREAKING" badge
- [x] 16. Create src/components/home/AdPlaceholder.tsx:
  - Gray box with "Advertisement" text
  - Standard sizes: 300x250, 728x90, 320x50
  - Prop for size variant
- [x] 17. Update src/app/page.tsx - Assemble homepage with all components:
  - OracleScoresBar (if exists)
  - HeroSection
  - FeaturedGrid
  - Two column layout: LatestNews + Sidebar (Trending, Poll, Newsletter)
  - TeamSection
  - ProphecySection
  - UpcomingGames
  - Footer
- [x] 18. Create src/components/home/QuickLinks.tsx:
  - Horizontal row of quick link buttons
  - Scores, Standings, Schedule, Rumors
- [x] 19. Create src/components/home/WeatherWidget.tsx:
  - Chicago weather display
  - Temperature, conditions icon
  - "Game day weather" for outdoor sports
- [x] 20. Add responsive breakpoints to all homepage components

**Run notification command, then continue to Section 4**

---

## SECTION 4: Dark Mode & Accessibility (10 tasks) ✅ COMPLETE
- [x] 1. Create src/contexts/ThemeContext.tsx - Dark mode context provider
- [x] 2. Create src/hooks/useTheme.ts - Hook to access and toggle theme
- [x] 3. Create src/components/layout/ThemeToggle.tsx - Sun/moon toggle button
- [x] 4. Add ThemeToggle to Header
- [x] 5. Update all components with dark: Tailwind variants
- [x] 6. Update colors.ts with dark mode color variants
- [x] 7. Add prefers-color-scheme media query support
- [x] 8. Save theme preference to localStorage
- [x] 9. Add skip-to-content accessibility link in layout
- [x] 10. Audit all components for keyboard navigation and ARIA labels

**Run notification command, then continue to Section 5**

---

## SECTION 5: Loading & Error States (10 tasks) ✅ COMPLETE
- [x] 1. Create src/app/loading.tsx - Global loading state with skeleton
- [x] 2. Create src/app/error.tsx - Global error boundary
- [x] 3. Create src/app/not-found.tsx - Custom 404 page with Chicago theme
- [x] 4. Create src/components/ui/LoadingSpinner.tsx - Animated spinner
- [x] 5. Create src/components/ui/LoadingDots.tsx - Three bouncing dots
- [x] 6. Create src/components/home/HeroSkeleton.tsx - Hero loading skeleton
- [x] 7. Create src/components/ArticleCardSkeleton.tsx - Card loading skeleton
- [x] 8. Add Suspense boundaries to homepage sections
- [x] 9. Create src/components/ui/ErrorCard.tsx - Inline error display
- [x] 10. Create src/components/ui/EmptyState.tsx - "No results" display

**Run notification command - SESSION 1 COMPLETE**

---

## COMPLETION CHECKLIST
When all sections are done:
- [x] All 70 tasks completed
- [x] Run: `osascript -e 'display notification "SESSION 1 FULLY COMPLETE!" with title "Claude Code"' && afplay /System/Library/Sounds/Funk.aiff`
- [x] Report completion status
