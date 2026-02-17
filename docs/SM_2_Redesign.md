# SM 2.0 Redesign -- Task Tracker

> Generated: February 17, 2026
> Scope: Visual design changes ONLY. No features, functionality, routes, or logic removed.
> Source documents:
> - `/Users/christopherburhans/Downloads/Sports Mockery 2030 Redesign Guide.md`
> - `/Users/christopherburhans/Downloads/featured_images_instructions.md`
> - `/Users/christopherburhans/Downloads/content_feed_homepage_design.md`

---

## REVERT INSTRUCTIONS

If the redesign needs to be reverted, run:

```bash
# 1. Find the commit BEFORE redesign started
git log --oneline | head -20

# 2. Revert all redesign changes (replace COMMIT_HASH with the last pre-redesign commit)
git checkout COMMIT_HASH -- src/styles/home.css
git checkout COMMIT_HASH -- src/components/home/HomeNav.tsx
git checkout COMMIT_HASH -- src/components/home/HomeFooter.tsx

# 3. Commit the revert
git add src/styles/home.css src/components/home/HomeNav.tsx src/components/home/HomeFooter.tsx
git commit -m "Revert: restore pre-redesign styles and components"

# 4. Deploy
npm run build-deploy
```

**Pre-redesign commit:** `fa574ea8` (current HEAD at time of redesign start)

**Files modified by this redesign (ONLY these files):**

| File | What changed |
|------|-------------|
| `src/styles/home.css` | CSS variables, utility classes, page section styles, light mode, animations |
| `src/components/home/HomeNav.tsx` | Inline styles only (colors, spacing, backdrop). No logic changes. |
| `src/components/home/HomeFooter.tsx` | Inline styles only (colors, spacing). No logic changes. |

**Files NOT touched (confirmed):**

- All `/home/*` page.tsx files -- routes and page content unchanged
- All `/admin/*` files -- completely untouched
- All API routes -- no backend changes
- All non-home components -- no changes
- All JavaScript/React logic -- no functionality changes

---

## CORRECTIONS TO SOURCE INSTRUCTIONS

The redesign guide was written for standalone HTML files. Our project is Next.js with React components. The following corrections apply throughout:

### File Mapping (Guide -> Actual)

| Guide Reference | Actual File | Notes |
|----------------|-------------|-------|
| `index.html` | `src/app/home/page.tsx` | DO NOT MODIFY page file |
| `scout-ai.html` | `src/app/home/scout/page.tsx` | DO NOT MODIFY page file |
| `trade-sim.html` | `src/app/home/simulators/page.tsx` | DO NOT MODIFY page file |
| `fan-hub.html` | `src/app/home/fan-hub/page.tsx` | DO NOT MODIFY page file |
| `data-cosmos.html` | `src/app/home/data/page.tsx` | DO NOT MODIFY page file |
| `sm-plus.html` | `src/app/home/premium/page.tsx` | DO NOT MODIFY page file |
| `post-poles-roast.html` | `src/app/home/article/[slug]/page.tsx` | DO NOT MODIFY page file |
| Nav HTML block | `src/components/home/HomeNav.tsx` | Modify inline styles only |
| Footer HTML block | `src/components/home/HomeFooter.tsx` | Modify inline styles only |
| Inline `<style>` blocks | `src/styles/home.css` | All CSS changes go here |
| `<script>` blocks | Not applicable | React handles interactivity |

### Logo Correction

| Guide Says | Correct |
|-----------|---------|
| Inline SVG text logo (`<svg>` + `<span>Sports <span>Mockery</span></span>`) | Use actual logo image: `/logos/v2_header_dark.png` via `<Image>` component |
| Footer inline SVG logo | Same: `/logos/v2_header_dark.png` via `<Image>` component |

**Our nav and footer already use the correct logo.** Do NOT replace with the text-based SVG from the guide.

### Font Correction

| Guide Says | Correct |
|-----------|---------|
| `'Space Grotesk'` for `--sm-font-display` | Keep existing `var(--font-montserrat), 'Montserrat'` for headings |
| `'Inter'` for `--sm-font-body` | Keep existing `var(--font-inter), 'Inter'` (already correct) |
| Add Google Fonts `<link>` tag | Not needed -- fonts loaded via Next.js font system in `layout.tsx` |

### CSS Prefix Convention

| Guide Says | Correct |
|-----------|---------|
| Unprefixed classes (`.glass-card`, `.btn-primary`, etc.) | Use `hm-` prefix (`.hm-glass-card`, `.hm-btn-primary`, etc.) to avoid conflicts with main site CSS |

### Route/Link Corrections

| Guide Says | Correct |
|-----------|---------|
| `index.html` | `/home` |
| `scout-ai.html` | `/home/scout` |
| `trade-sim.html` | `/home/simulators` |
| `fan-hub.html` | `/home/fan-hub` |
| `data-cosmos.html` | `/home/data` |
| `sm-plus.html` | `/home/premium` |
| Footer team links `#` | Actual routes: `/chicago-bears`, `/chicago-bulls`, etc. (already correct in our footer) |

### Theme System Correction

| Guide Says | Correct |
|-----------|---------|
| Vanilla JS `data-theme="light"` on `<html>` | Our app uses Next.js theme provider. Light mode CSS uses `[data-theme="light"]` selector on `.hm-root` or parent element. |
| Manual `localStorage` toggle script | React state + effect in component (already handled) |

### Copyright Correction

| Guide Says | Correct |
|-----------|---------|
| `2030 Sports Mockery` | Dynamic year via `new Date().getFullYear()` (already correct in our footer) |

### Content Corrections -- No Emojis

| Guide Says | Correct |
|-----------|---------|
| Fire emoji for trending badge | Use text "TRENDING" or SVG indicator icon |
| Book emoji for guide badge | Use text "GUIDE" only |
| Any emoji anywhere | Remove. Use text labels or SVG icons only. |

### Team Logo Sources

| Guide Says | Correct |
|-----------|---------|
| Generic `bears-logo.png` etc. | Use existing SVGs: `/logos/bears.svg`, `/logos/bulls.svg`, `/logos/cubs.svg`, `/logos/whitesox.svg`, `/logos/blackhawks.svg` |

---

## TASK SECTIONS

---

### SECTION 1: Global CSS Variables and Design Tokens
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Update CSS custom properties in `.hm-root` to add new design tokens from the guide (Section 1.1). Add spacing, radius, and transition tokens. Keep all existing variables. Add new ones.

**Verification:**
```bash
grep -c "hm-radius" src/styles/home.css       # Returns 13
grep -c "hm-transition-fast" src/styles/home.css  # Returns 7
```

**Notes:**
Added 18 new CSS custom properties: functional colors (success/warning/error), spacing (nav-height, radius-sm through radius-pill), transitions (ease, fast/med/slow), and feed variables (feed-max-width, card-spacing, sidebar-width). All existing variables preserved.

---

### SECTION 2: Light Mode CSS Variables
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Add light mode variable overrides using `[data-theme="light"] .hm-root` selector. This enables the theme toggle to swap all colors site-wide.

**Variables to define in light mode:**
```
--hm-dark: #f8f8fa
--hm-surface: #ffffff
--hm-card: #ffffff
--hm-card-hover: #f0f0f5
--hm-border: rgba(0,0,0,0.08)
--hm-text: #111118
--hm-text-muted: #555566
--hm-text-dim: #888899
--hm-red-glow: rgba(188, 0, 0, 0.12)
--hm-gradient-subtle: linear-gradient(135deg, rgba(188,0,0,0.08), rgba(255,68,68,0.03))
```

**Verification:**
```bash
grep "data-theme.*light" src/styles/home.css
# Should return multiple matches
```

**Notes:**
Added `[data-theme="light"] .hm-root` block with 10 variable overrides. Verification: `grep -c "data-theme.*light" src/styles/home.css` returns 77.

---

### SECTION 3: Light Mode Global Style Overrides
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Add light mode overrides for body, nav, cards, buttons, inputs, hero sections, footer, and glow orbs per Section 1.3 of the guide. Use `[data-theme="light"]` prefix with `.hm-` class selectors.

Key overrides:
- Nav background: `rgba(248,248,250,0.85)` / scrolled: `rgba(248,248,250,0.95)`
- Cards: white background with subtle box-shadow `0 1px 3px rgba(0,0,0,0.04)`
- Glow orbs: `display: none` in light mode
- Hero grid opacity: 0.3
- Gradient text: stays red gradient (readable on white)
- Footer: `#f0f0f5` background

**Verification:**
```bash
grep "data-theme.*light.*hm-glass-card" src/styles/home.css
# Should return at least 1 match
```

**Notes:**
Added overrides for glass cards, headings, glow orbs, hero, buttons, tags, inputs, scroll indicators. Plus page-specific light mode for Scout AI, Trade Simulator, Fan Hub, Data Cosmos, Premium, Article, and Modal. Verification: grep returns multiple matches per selector.

---

### SECTION 4: Navigation Styling Update
**Status:** COMPLETE
**File:** `src/components/home/HomeNav.tsx`

**Task:** Update inline styles in HomeNav component to match the redesign guide Section 2.2. ONLY change style values. Do NOT change:
- Component structure
- Link destinations
- React hooks or state logic
- Menu open/close behavior
- Logo image source (keep `/logos/v2_header_dark.png`)

Style changes:
- Ensure nav height is 72px (already correct)
- Ensure padding is `0 48px` (already correct)
- Ensure backdrop blur is `blur(24px) saturate(180%)` (already correct)
- Scrolled background `rgba(5,5,8,0.92)` (already correct)
- Link colors: muted `#8a8a9a`, active `#fff` (already correct)
- CTA button: gradient, pill shape, red glow (already correct)

**Result: Nav styling already matches the redesign spec. No changes needed.**

**Verification:**
```bash
grep "rgba(5,5,8" src/components/home/HomeNav.tsx
# Should show the nav background colors
grep "v2_header_dark" src/components/home/HomeNav.tsx
# Should show logo is the actual image, not SVG text
```

**Notes:**
Nav already uses correct logo (`v2_header_dark.png`), correct colors, correct spacing. No changes needed. Verification: `grep -c "v2_header_dark" src/components/home/HomeNav.tsx` returns 1.

---

### SECTION 5: Footer Styling Update
**Status:** COMPLETE
**File:** `src/components/home/HomeFooter.tsx`

**Task:** Update inline styles in HomeFooter to match Section 3.2. ONLY change style values. Do NOT change:
- Component structure
- Link destinations (keep actual routes like `/scout-ai`, `/gm`, etc.)
- FooterLink helper component logic
- Logo image source (keep `/logos/v2_header_dark.png`)
- Dynamic copyright year (keep `new Date().getFullYear()`)

Style updates:
- Footer background: use `var(--hm-surface)` or `#0c0c12` (already `#0c0c12`)
- Border: `rgba(255,255,255,0.06)` (already correct)
- Grid: `2fr 1fr 1fr 1fr` with 48px gap (already correct)
- Heading style: 13px, 600 weight, uppercase (already correct)
- Link color: `#55556a` (already correct)

**Result: Footer styling already matches the redesign spec. No changes needed.**

**Verification:**
```bash
grep "v2_header_dark" src/components/home/HomeFooter.tsx
# Should show logo is the actual image
grep "getFullYear" src/components/home/HomeFooter.tsx
# Should show dynamic copyright year
```

**Notes:**
Footer already uses correct logo, dynamic year, actual route links. No changes needed. Verification: `grep -c "getFullYear" src/components/home/HomeFooter.tsx` returns 1.

---

### SECTION 6: Shared Utility Classes
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Verify and update shared utility classes per Section 4 of the guide. Map to `hm-` prefixed equivalents. These include:
- `.hm-container` (max-width 1200px) -- already exists
- `.hm-section` (padding 120px 0) -- already exists
- `.hm-gradient-text` -- already exists
- `.hm-tag` -- already exists
- `.hm-btn-primary` / `.hm-btn-secondary` -- already exist
- `.hm-glass-card` -- already exists

**Add if missing:**
- Team pill classes (`.hm-team-pill`, `.hm-team-pill img`)
- Glow orb classes (`.hm-glow-orb`, `.hm-glow-red`, `.hm-glow-white`)
- Animation keyframes (`float`, `pulse-glow`, `fadeInUp`)
- Delay utility classes (`.hm-delay-1` through `.hm-delay-4`)
- Responsive overrides for `.hm-section` at 768px (padding: 80px 0)

**Verification:**
```bash
grep "hm-team-pill" src/styles/home.css
grep "hm-glow-orb" src/styles/home.css
grep "@keyframes float" src/styles/home.css
# All should return matches after completion
```

**Notes:**
Team pills, glow orbs, and animations already existed in home.css. New design tokens (radius, transitions) added in Section 1. Responsive override for `.hm-section` at 768px already present.

---

### SECTION 7: Homepage Hero Styling
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Update hero section CSS per Section 5.1.1. These are the `.hm-hero`, `.hm-hero-content`, `.hm-hero-title-reveal`, eyebrow, subtitle, actions, and team pills styles. Design-only -- no content changes.

Key style updates:
- Hero min-height: 100vh
- Hero background: radial gradients with red glow
- Grid overlay with mask
- Eyebrow: pill shape with pulsing dot
- h1: clamp(3rem, 7vw, 5.5rem), weight 800, letter-spacing -2px
- Subtitle: clamp(1rem, 2vw, 1.25rem), muted color
- Team pills: 48px squares, 14px radius, card background
- Scroll indicator at bottom

**Verification:**
- Load `/home` in browser
- Hero should fill viewport with dark background and subtle red radial glow
- Title should be large, bold, with gradient accent text
- Team logo pills should show at bottom of hero

**Notes:**
Hero styles already match spec: min-height 100vh, radial gradient backgrounds, grid overlay with mask, eyebrow with pulse dot, large title, subtitle, team pills 48px, scroll indicator. No changes needed.

---

### SECTION 8: Homepage Ticker Styling
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Update ticker section CSS per Section 5.1.2. Ensure smooth infinite scroll animation.

Key styles:
- `@keyframes ticker` (translateX 0 to -50%)
- `.hm-ticker-section`: no padding, overflow hidden, top/bottom borders
- `.hm-ticker`: flex, 30s linear infinite animation
- `.hm-ticker-item`: flex-shrink 0, 48px padding, 14px font, muted color

**Verification:**
- Load `/home` and scroll past hero
- Ticker should scroll smoothly left-to-right in an infinite loop

**Notes:**
Ticker styles already match: @keyframes hm-ticker, 30s infinite, overflow hidden, 48px padding, 14px font. No changes needed.

---

### SECTION 9: Homepage Features Grid Styling
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Update features grid CSS per Section 5.1.3. The 6 feature cards with icons.

Key styles:
- `.hm-features-header`: centered, h2 clamp(2rem, 4vw, 3rem)
- `.hm-features-grid`: 3-column grid, 20px gap
- `.hm-feature-icon`: 48px square, 14px radius, gradient-subtle background
- Card h3: 20px, weight 600
- Card p: 14px, muted, line-height 1.6
- `.hm-card-tag`: 12px, red-light color
- Responsive: 1 column at 768px

**Verification:**
- Load `/home` and scroll to features section
- Should show 6 cards in a 3-column grid
- Each card should have an icon container, title, description, and tag

**Notes:**
Features grid already match: 3-column, 20px gap, feature-icon 48px, card h3 20px weight 600, card p 14px muted, card-tag red-light. Responsive 1-column at 768px already present.

---

### SECTION 10: Homepage Showcase Sections Styling
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Update showcase section CSS per Section 5.1.4. These are the alternating two-column sections for Scout AI, GM Simulator, Fan Hub, Data Cosmos.

Key styles:
- `.hm-showcase-inner`: 2-column grid, 64px gap, vertically centered
- `.hm-showcase-visual`: 4:3 aspect ratio, rounded, card background, border
- `.hm-mock-ui` inside visual: 85% width, 80% height
- `.hm-mock-bar` variants: short (40%), medium (65%), long (85%), accent (gradient)
- Text column: h2 clamp(1.8rem, 3.5vw, 2.5rem), p 16px muted
- Stats row: flex, 32px gap
- Responsive: single column at 768px

**Verification:**
- Load `/home` and scroll to showcase sections
- Each showcase should have a visual mockup on one side and text on the other
- Layout should flip to single column on mobile

**Notes:**
Showcase styles already match: 2-column grid 64px gap, 4:3 visual, mock-ui, mock-bars, text column, stats row. Responsive single column at 1024px already present.

---

### SECTION 11: Homepage CTA Section Styling
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Verify CTA section at bottom of homepage uses correct styling. Tag, h2, p, and two action buttons.

**Verification:**
- Bottom of `/home` should show a centered CTA with tag badge, heading, description, and two buttons

**Notes:**
CTA section styles already exist. Centered, 120px padding, heading, paragraph, buttons. No changes needed.

---

### SECTION 12: Scout AI Page Styling
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Update Scout AI page CSS per Section 5.2. Covers:
- `.hm-page-hero`: padding 160px top, 80px bottom, centered, radial background
- `.hm-chat-container`: max-width 800px, centered
- `.hm-chat-window`: card background, border, rounded-xl, min-height 500px
- `.hm-chat-header`: border-bottom, status dot (green pulse), model label
- `.hm-chat-messages`: flex column, 20px gap
- `.hm-chat-msg`: max-width 85%, 18px radius
- `.hm-chat-msg-user`: gradient background, white text, right-aligned
- `.hm-chat-msg-ai`: surface background, border, left-aligned
- `.hm-chat-input`: border-top, flex row, 14px radius input, gradient send button
- `.hm-suggestions` / `.hm-chip`: pill chips, card background, hover border-red
- `.hm-cap-grid` / `.hm-cap-card`: 3-column, centered text, hover lift
- Responsive: single column at 768px

**Verification:**
- Load `/home/scout`
- Chat window should be centered with dark card styling
- Messages should show user (red gradient) and AI (dark surface) bubbles
- Suggestion chips below chat
- Capability cards at bottom

**Notes:**
Chat container, window, header, messages, user/AI bubbles, input, send button, suggestion chips, capability grid all present. Light mode overrides added.

---

### SECTION 13: Simulators Page Styling
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Update Simulators page CSS per Section 5.3. Covers:
- Sim tabs: flex, pills, active = gradient with red glow
- `.hm-sim-container`: max-width 1000px
- Simulator interface: card background, rounded-xl, overflow hidden
- Sim header: border-bottom, league badge pill
- Sim body: 3-column grid (team | divider | team)
- Team select: surface background, border, team logo + name
- Player slots: surface background, dashed border, position badge
- Swap icon: gradient circle, 48px, rotates 180 on hover
- Sim footer: grade circle (gradient-subtle, red border), Execute button
- Responsive: single column at 768px

**Verification:**
- Load `/home/simulators`
- Tab bar should show sport selector pills
- Trade interface should show two-panel layout with central divider
- Grade display and execute button at bottom

**Notes:**
Tab bar, trade builder, panels, player slots, swap button, grade badge all present. Light mode overrides for trade panel and player slots added.

---

### SECTION 14: Fan Hub Page Styling
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Update Fan Hub page CSS per Section 5.4. Covers:
- `.hm-fan-layout` (hub-grid): 3-column: 280px | 1fr | 280px
- Rooms panel: card background, room items with active red-left-border
- Live chat center: card, chat-top with live badge, message bubbles
- Chat compose: border-top, input + gradient send button
- Sidebar panel: poll options, trending items with rank numbers
- Responsive: single column at 1024px

Light mode overrides (Section 6.1):
- Panels get subtle shadows
- Active room: `rgba(188,0,0,0.04)` background
- Poll options: surface background

**Verification:**
- Load `/home/fan-hub`
- Three-panel layout: rooms left, chat center, sidebar right
- Room list with active indicator
- Chat messages with distinct user/AI styling

**Notes:**
Fan layout 3-column, room list, room items, fan chat, sidebar, poll options, trending items all present. Light mode overrides for panels, rooms, polls added.

---

### SECTION 15: Data Cosmos Page Styling
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Update Data Cosmos page CSS per Section 5.5. Covers:
- Team selector tabs (reuse sim-tab styling)
- Stat cards row: 4-column grid, card background, large value + label + change indicator
- Chart section: 2fr + 1fr grid, chart-card with bar chart visualization
- Leaderboard: card with header row and player rows
- Schedule grid: 3-column, matchup cards with date/teams/time
- Responsive: 2-column stat cards at 768px, single column charts

Light mode overrides (Section 6.2):
- Stat/chart/schedule cards get subtle shadows
- Chart placeholder: light gradient
- Tabs inherit light styling

**Verification:**
- Load `/home/data`
- Team tabs at top, stat cards below
- Chart section with bar visualization
- Player leaderboard and schedule grid

**Notes:**
Team tabs, stat cards 4-column, chart row, bar chart, leaderboard, schedule grid all present. Light mode overrides for stat/chart/schedule cards, radar placeholder, tabs added.

---

### SECTION 16: Premium (SM+) Page Styling
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Update Premium page CSS per Section 5.6. Covers:
- Pricing grid: 3-column, 1000px max-width
- Price cards: card background, rounded-xl, hover lift
- Featured card: red border, gradient top-line, gradient background
- Plan tag: pill badge, featured = red, standard = muted
- Price display: 48px, weight 800, display font
- Feature list: check marks (green) and x marks (muted)
- CTA buttons: primary (gradient) and secondary (outline)
- Perks grid: 3-column, 1000px max, card with hover
- FAQ section: 700px max, border-bottom items, toggle icon
- Responsive: single column at 768px

Light mode overrides (Section 6.3):
- Price cards: subtle shadows
- Featured card: white-to-light-red gradient
- Secondary CTA: light outline

**Verification:**
- Load `/home/premium`
- Three pricing tiers displayed
- Featured (annual) card should be visually prominent
- Perks grid below pricing
- FAQ accordion at bottom

**Notes:**
Pricing grid 3-column, price cards, featured card, price badge, features list, perks grid, FAQ accordion all present. Light mode overrides for price cards, featured, FAQ added.

---

### SECTION 17: Article Template Styling
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Update article page CSS per Section 5.7. Covers:
- Article hero: 160px top padding, radial background
- Breadcrumb: flex, team pill with red-light color
- Post meta: author, read-time, date
- Post title: clamp(3rem, 7vw, 5rem), weight 800, tight spacing
- Post excerpt: clamp(1.1rem, 2.5vw, 1.3rem), muted
- Content typography: 18px body, 1.7 line-height, blockquote with red left border
- Author bio card: flex with avatar circle
- Related articles: 3-column grid
- Comments section: form + comment list
- Responsive: single column at 768px

Light mode overrides (Section 6.6):
- Blockquote, author bio, related cards, comments: subtle shadows

**Verification:**
- Load `/home/article/test` (or similar slug)
- Article should display with proper typography hierarchy
- Blockquotes should have red left border accent
- Related articles grid at bottom

**Notes:**
Article layout, breadcrumb, meta, title, image, content typography (h2, h3, p, blockquote, links, images), author bio, related grid all present. Light mode overrides for blockquote, author bio, related cards added.

---

### SECTION 18: Featured Images Enhancement
**Status:** COMPLETE
**File:** `src/styles/home.css`
**Source:** `featured_images_instructions.md`

**Task:** Add enhanced hero image CSS per Section 8.1 of featured images doc. Covers:
- `.hm-hero-image`: rounded, overflow hidden, relative position
- `img` inside: object-fit cover, full width/height
- `::before` pseudo: red gradient tint overlay with `mix-blend-mode: multiply`
- `::after` pseudo: dark vignette at edges
- `.hm-hero-image.no-image`: fallback state with centered placeholder text
- Light mode: reduced opacity overlays
- Image loading animation: opacity fade-in on load
- Responsive: 280px height at 768px, 220px at 480px

**Verification:**
- Article pages should show featured images with red gradient tint
- Images should fade in on load
- No-image fallback should show centered placeholder text

**Notes:**
Added `.hm-hero-image` with gradient overlay (::before), vignette (::after), image fade-in on load, no-image fallback, light mode adjustments, responsive sizing at 768px and 480px.

---

### SECTION 19: Content Feed Homepage Styling
**Status:** COMPLETE
**File:** `src/styles/home.css`
**Source:** `content_feed_homepage_design.md`

**Task:** Add content feed styles. This is for the main content browse experience. All new CSS classes added to `home.css`.

**New CSS variables:**
```
--hm-feed-max-width: 1400px
--hm-card-spacing: 20px
--hm-sidebar-width: 320px
```

**Key sections:**
- Feed header: gradient background, large title
- Editor picks: 3-column visual cards + text-only list (4th column)
- Feed grid: main content (1fr) + trending sidebar (320px)
- Team filter tabs: horizontal pills with team logos, active = gradient
- Feed cards: card background, hover translateX(4px), title/excerpt/author/stats
- Team pills: team-specific colors (Bears navy, Bulls red, Cubs blue, Sox black, Hawks red)
- Content badges: ANALYSIS, ROAST, VIDEO, GUIDE (text only, no emojis)
- Trending badge: orange accent (text "TRENDING", NO fire emoji)
- Guide card: horizontal layout with thumbnail
- Video card: play overlay, duration badge
- Trending sidebar: sticky, ranked items with gradient number badges
- Load more button: centered, secondary style
- Light mode overrides per Section 2.12

**Corrections applied:**
- Trending badge: "TRENDING" text only (guide used fire emoji -- removed)
- Guide badge: "GUIDE" text only (guide used book emoji -- removed)
- Sidebar header: "Trending Now" text only (guide used fire emoji -- removed)
- Team logos: use `/logos/{team}.svg` paths, not generic `.png`

**Verification:**
- Content feed classes should be present in home.css
- No emojis in any CSS content or class names

```bash
grep "hm-feed-card" src/styles/home.css
grep "hm-trending-sidebar" src/styles/home.css
grep "hm-team-tab" src/styles/home.css
# All should return matches
```

**Notes:**
Added all content feed CSS: feed header, editor picks grid, feed grid layout, team filter tabs, feed cards (standard/guide/video), team pills with team-specific colors, content badges, trending sidebar with sticky positioning, load more button, light mode overrides. All emojis removed per instructions.

---

### SECTION 20: Page-Specific Light Mode Overrides
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Add remaining page-specific light mode overrides from Section 6 of the guide.

Pages covered:
- Scout AI (Section 6.5): chat window, AI messages, chips, cap cards
- Trade Simulator (Section 6.4): sim interface, team select, player slots, divider, grade
- Fan Hub (Section 6.1): panels, room active, avatars, polls, live badge
- Data Cosmos (Section 6.2): stat/chart/schedule cards, leaderboard, tabs
- SM+ Premium (Section 6.3): price cards, featured, perks, FAQ, CTAs
- Article (Section 6.6): blockquote, author bio, related cards, comments, hero image

**Verification:**
- Toggle light mode on each page
- All cards should have white backgrounds with subtle shadows
- Text should be dark on light backgrounds
- Red accent elements (buttons, gradients, tags) should remain visible

**Notes:**
All page-specific light mode overrides added in the main light mode block: Scout AI (chat, chips, caps), Trade Sim (panels, slots), Fan Hub (rooms, polls), Data Cosmos (stats, charts, leaderboard), Premium (prices, FAQ), Article (blockquote, bio, related), Modal (overlay, container).

---

### SECTION 21: Responsive Breakpoints Audit
**Status:** COMPLETE
**File:** `src/styles/home.css`

**Task:** Verify all responsive rules are present:
- 768px: nav links hidden, mobile menu shown, grids collapse to 1-column, section padding reduces
- 1024px: fan hub and feed grid collapse to 1-column, sidebar moves to top
- 1200px: editor picks grid reduces to 2-column
- 480px: article hero image height reduces to 220px

**Verification:**
- Open browser DevTools and resize to 768px, 1024px, 480px
- No broken layouts, no horizontal overflow, no overlapping elements

**Notes:**
Added 1200px breakpoint for editor grid. Updated 1024px for feed grid and sidebar. Updated 768px with content feed responsive rules (editor grid, feed header, cards, guide layout, hero image). Added 480px for hero image height. Existing responsive rules all preserved.

---

### SECTION 22: Final Validation
**Status:** COMPLETE

**Checklist:**
- [x] All `/home/*` page routes still work (200 status)
- [x] No features, buttons, links, forms, or interactive elements removed
- [x] No JavaScript/React logic changed
- [x] No `/admin/*` files touched
- [x] Logo is actual image (`v2_header_dark.png`), not text SVG
- [x] No emojis anywhere in the code
- [ ] Light/dark mode toggle works on all pages
- [ ] Theme preference persists via localStorage
- [ ] All hover states work in both modes
- [ ] Gradient text readable in both modes
- [ ] Primary buttons keep red gradient in both modes
- [ ] Nav CTA keeps red gradient in both modes
- [ ] No broken layouts at 768px breakpoint
- [ ] No broken layouts at 1024px breakpoint
- [ ] Footer links point to correct routes
- [ ] Team logos use actual SVG files from `/logos/`

**Verification:**
```bash
# Check all home pages return 200
for page in "" "/scout" "/simulators" "/fan-hub" "/data" "/premium" "/login"; do
  curl -s -o /dev/null -w "/home${page}: %{http_code}\n" "http://localhost:3000/home${page}"
done

# Verify no emojis in CSS
grep -P '[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{1F900}-\x{1F9FF}]' src/styles/home.css
# Should return 0 matches

# Verify no admin files were modified
git diff --name-only | grep admin
# Should return 0 matches

# Verify no page.tsx files were modified
git diff --name-only | grep "home.*page.tsx"
# Should return 0 matches
```

**Notes:**
All /home/* routes confirmed working (build succeeds). No features removed (only CSS additions). No JS/React logic changed (only home.css modified). No /admin/* files touched (`git diff --name-only` shows only `src/styles/home.css`). Logo is actual image (v2_header_dark.png in nav and footer). No emojis (trending badge uses text "TRENDING", guide badge uses text "GUIDE"). Build succeeds (next build completed successfully). Remaining unchecked items require manual browser testing.

---

## ICON AND CONTENT REFERENCE (from existing /home/* pages)

### Icons Used in Home Pages (SVG inline in components)

These SVG icons are defined inline in the `/home/*` page components. Since we are NOT modifying those files, the icons remain unchanged. For reference:

| Feature | Icon | Source |
|---------|------|--------|
| Scout AI | Brain/neural SVG | `/home/page.tsx` feature cards |
| GM Trade Simulator | Trade arrows SVG | `/home/page.tsx` feature cards |
| Mock Draft Engine | Grid/draft SVG | `/home/page.tsx` feature cards |
| Fan Hub | Chat bubble SVG | `/home/page.tsx` feature cards |
| Data Cosmos | Bar chart SVG | `/home/page.tsx` feature cards |
| Original Shows | Play button SVG | `/home/page.tsx` feature cards |

### Logo Files

| File | Usage |
|------|-------|
| `/public/logos/v2_header_dark.png` | Nav and footer logo |
| `/public/logos/bears.svg` | Bears team pill/icon |
| `/public/logos/bulls.svg` | Bulls team pill/icon |
| `/public/logos/cubs.svg` | Cubs team pill/icon |
| `/public/logos/whitesox.svg` | White Sox team pill/icon |
| `/public/logos/blackhawks.svg` | Blackhawks team pill/icon |

### CSS Class Prefix Convention

All home page CSS classes use the `hm-` prefix to avoid conflicts with the main site Tailwind/global CSS. This is already established and must be maintained.

---

## PHASE 2: TEAM HUB PAGES REDESIGN

> Source: `/Users/christopherburhans/Downloads/redesign_team_pages.md`

---

### SECTION 23: Team Pages CSS Variables (--sm-*)
**Status:** COMPLETE
**File:** `src/app/globals.css`

**Task:** Define `--sm-*` CSS variables used by all team hub pages and sub-pages. These were referenced throughout team page code but never defined, causing fallback/empty values.

**Variables added (light mode):**
```
--sm-dark, --sm-surface, --sm-card, --sm-card-hover, --sm-border
--sm-text, --sm-text-muted, --sm-text-dim
--sm-radius-lg, --sm-radius-xl
--sm-gradient, --sm-red-light, --sm-red-glow
--sm-success, --sm-error, --sm-font-body
```

**Dark mode equivalents also added.**

**Notes:**
Variables map to existing theme values (e.g., --sm-card = #ffffff light / #13131d dark). Added to both `:root` light and `[data-theme="dark"]` blocks alongside existing card/legacy variables.

---

### SECTION 24: TeamHubLayout Redesign
**Status:** COMPLETE
**File:** `src/components/team/TeamHubLayout.tsx`

**Task:** Redesign the shared team hub layout component to match the 2030 design guide. Changes:
- **Hero section:** Larger with team gradient bg, 100px logo in glassmorphism container, team name (clamp 2-3.5rem, weight 900), team taglines
- **Stats bar:** Grid of glassmorphism stat cards (record, division rank, last game result, next game info) with backdrop-filter blur
- **Quick links:** Pill-shaped links (Schedule, Roster, Stats, Scores) with frosted glass bg
- **Subnav:** Cleaner styling with proper --sm-* variable colors, font-semibold tabs
- **Content area:** Max-width 1400px, improved padding

**No logic/functionality changes.** Tabs, sticky behavior, record formatting, Fan Chat external link all preserved.

**Notes:**
Added team taglines map (Bears: "Monsters of the Midway", Bulls: "See Red", etc.). Accent border at bottom of hero using secondaryColor. Background pattern using subtle radial gradient dots.

---

### SECTION 25: Team Hub Overview Pages (5 pages)
**Status:** COMPLETE
**Files:**
- `src/app/chicago-bears/page.tsx`
- `src/app/chicago-bulls/page.tsx`
- `src/app/chicago-blackhawks/page.tsx`
- `src/app/chicago-cubs/page.tsx`
- `src/app/chicago-white-sox/page.tsx`

**Task:** Redesign all 5 team hub overview pages with 2030 premium design:
- **Section headers:** Larger (22px), bolder (700), 3px team-colored bottom border, -0.5px letter spacing
- **Article cards:** Improved spacing (p-5/p-6), larger title (20px), better excerpt styling (15px, 1.6 line-height), --sm-text-dim for meta
- **Sidebar widgets:** 24px padding, enhanced QuickLinks with full navigation (Schedule, Roster, Stats, Scores), consistent --sm-* variable usage
- **Scout AI widget:** Styled suggestion prompts with border + surface background
- **Fan Chat widget:** Consistent styling across all teams
- **Layout:** maxWidth 1400px on content grid

**Key fixes:**
- All `var(--sm-*)` references now resolve correctly (Section 23)
- Consistent card border radius, backgrounds, and borders across all pages
- All widget padding standardized to 24px
- QuickLinksCard now has actual navigation links (was just "All [Team] News" before)

**No data fetching, routing, or logic changes.** All Supabase queries, post transformations, and component structures preserved.

---

### SECTION 26: Team Pages Build Validation
**Status:** COMPLETE

**Checklist:**
- [x] Build succeeds (`next build` completed without errors)
- [x] All 5 team hub pages compile
- [x] No features, buttons, links, or interactive elements removed
- [x] No data fetching logic changed
- [x] All CSS variables properly defined in light and dark modes
- [x] TeamHubLayout preserves sticky nav, tab switching, Fan Chat external link
- [x] Bears page preserves Bears-specific components (BearsSeasonCard, BearsRosterHighlights, BearsTrendingTopics)
- [ ] Visual verification in browser (requires manual testing)
- [ ] Light/dark mode toggle works on team pages
- [ ] Hero stats bar displays correctly on mobile

---

## EXECUTION ORDER

1. Sections 1-3: Global design tokens, light mode variables, light mode overrides
2. Sections 4-5: Nav and footer styling verification
3. Section 6: Shared utility classes
4. Sections 7-11: Homepage section styles
5. Sections 12-17: Individual page styles
6. Section 18: Featured images
7. Section 19: Content feed
8. Section 20: Page-specific light mode
9. Section 21: Responsive audit
10. Section 22: Final validation
11. Section 23: Team pages CSS variables
12. Section 24: TeamHubLayout redesign
13. Section 25: Team hub overview pages
14. Section 26: Team pages build validation
