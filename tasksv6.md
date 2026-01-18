# SportsMockery Article Page & Design Tasks v6

## Phase 1: Featured Image & Media Layout ✅
- [x] 1.1 Ensure single primary featured image at top of article template
- [x] 1.2 Strip duplicate featured image from body content (if matches featured image URL in first 3 blocks)
- [x] 1.3 Wrap in-body images in .article-image container with proper styling
- [x] 1.4 Add figcaption/caption support for in-body images

## Phase 2: Header, Bears Band & Hero Stack ✅
- [x] 2.1 Reduce Bears band height from 48px to 36px on article pages
- [x] 2.2 Reduce Bears band horizontal padding (px-4 to px-3 on mobile)
- [x] 2.3 Reorder article page elements (header > bears band > breadcrumb > H1 > meta > hero > body)
- [x] 2.4 Move social share buttons below first paragraph
- [x] 2.5 Slim header row height from h-[60px] to h-[52px]
- [x] 2.6 Slim nav row height from h-[50px] to h-[44px]
- [x] 2.7 Reduce top/bottom padding in header and nav by 2px each

## Phase 3: Typography, Caps & Meta ✅
- [x] 3.1 Set global system font (remove Geist/Inter/Montserrat/JetBrains from body)
- [x] 3.2 Keep Montserrat only on logo text and Bears "B" pill label
- [x] 3.3 Remove all-caps from main nav links (Home, Bears, etc.)
- [x] 3.4 Remove uppercase from article H1s and H2s
- [x] 3.5 Standardize article meta line format: "By {author} · {Date} · {X min read} · {Category}"
- [x] 3.6 Add read-time calculation (ceil(word_count / 225))
- [x] 3.7 Add context label above title (Rumor, Film Room, Opinion)

## Phase 4: In-Page Reading Experience
- [ ] 4.1 Add scroll progress bar under header
- [ ] 4.2 Implement Reader mode toggle (hide sidebar, center content)
- [ ] 4.3 Add inline related snippet every ~5 paragraphs (max 2 per article)

## Phase 5: Bottom of Article & Sidebar
- [ ] 5.1 Create "More in this story" rail (3-5 posts from same category)
- [ ] 5.2 Create "From this writer" sidebar block (up to 4 posts by author)
- [ ] 5.3 Tighten sidebar density (mt-6 between modules, 4 items max)

## Phase 6: Bears-Specific Enhancements
- [ ] 6.1 Add Bears stat chips under meta (Record, Opponent, Spread)
- [ ] 6.2 Add LIVE pill to Bears band on game days

## Phase 7: Mobile-Specific Article Behavior
- [ ] 7.1 Sticky compact header on scroll (back, title, share)
- [ ] 7.2 Mobile bottom action bar (Home, Bears, Ask AI)
- [ ] 7.3 Full-card tap targets (single <a> wrapper)

## Phase 8: Light/Dark Mode Fix
- [ ] 8.1 Define color tokens at :root level for both modes
- [ ] 8.2 Wire body and containers to CSS tokens
- [ ] 8.3 Remove hard-coded light/dark backgrounds from components
- [ ] 8.4 Keep dark: utilities only for special accents

## Phase 9: Bears Data Architecture (Datalab Mirror)
- [ ] 9.1 Create mirrored Bears schema in SportsMockery database
- [ ] 9.2 Build ETL sync job (hourly cron) from Datalab
- [ ] 9.3 Update helpers to read from local mirrored tables

## Phase 10: Bears Page Premium Design
- [ ] 10.1 Bears Player Selector with search, filters, ESPN headshots
- [ ] 10.2 Bears Roster with position groups, ESPN photos, starter highlighting
- [ ] 10.3 Player Profiles with hero, season stats, game log, similar players
- [ ] 10.4 Bears Schedule with game cards, recap links, filters
- [ ] 10.5 Bears Scores with score lines, key stats, W/L indicators
- [ ] 10.6 Bears Stats with team summary, leaderboards, headshots

---

## Progress Log

### Started: January 17, 2026

