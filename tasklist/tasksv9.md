# Sports Mockery /sm Project Fixes - Task List v9

**Project:** test.sportsmockery.com (`/sm`)
**Created:** 2026-01-17

---

## Tasks

### 1. Twitter (X) URLs not embedding in posts
- **Status:** ✅ Completed
- **Priority:** High (broken interaction)
- **Description:** URLs from `twitter.com` and `x.com` posts should auto-convert to embeds in articles
- **Requirements:**
  - Normalize `x.com` URLs to `twitter.com` format
  - Load Twitter embed script (`platform.twitter.com/widgets.js`) once per page
  - Call `twttr.widgets.load()` after content renders
  - Check CSP/ad-block issues

---

### 2. Audio articles: iPhone lock screen playback
- **Status:** ✅ Completed
- **Priority:** High (broken interaction)
- **Description:** Audio articles stop playing when iPhone screen locks
- **Requirements:**
  - Use HTML5 `<audio>` elements (not just Web Audio API)
  - Set `playsinline` for Safari
  - Start playback from user gesture
  - Configure audio libraries to use `html5: true` mode

---

### 3. Audio menu for voices is off screen on mobile
- **Status:** ✅ Completed
- **Priority:** High (mobile usability)
- **Description:** Voice selection menu renders off screen on mobile
- **Requirements:**
  - Use responsive CSS media queries
  - Position as bottom sheet, modal, or below player
  - Use relative/transform positioning within viewport
  - Prevent horizontal scrolling with `max-width: 100%`

---

### 4. Search screen buttons below search bar don't work
- **Status:** ✅ Completed
- **Priority:** High (broken interaction)
- **Description:** Buttons below the search bar don't respond to taps/clicks
- **Requirements:**
  - Check for overlay/z-index/pointer-events blocking clicks
  - Verify onClick handlers are wired correctly
  - Ensure proper button elements with accessibility
  - Fix any invisible overlapping elements

---

### 5. Alerts button at top doesn't work
- **Status:** ✅ Completed
- **Priority:** High (broken interaction)
- **Description:** Alerts button in header navigation is not functional
- **Requirements:**
  - Implement show/hide logic for alerts panel/modal
  - Add proper ARIA attributes
  - Fix pointer-events/z-index issues if present
  - Ensure works on mobile and desktop

---

### 6. No AI bot for Bears questions (Perplexity AI from Datalabs)
- **Status:** ✅ Completed
- **Priority:** Medium (new feature)
- **Description:** Need Bears Q&A AI bot using Perplexity AI from Datalabs
- **Requirements:**
  - Embed Datalabs AI experience into /sm
  - Create "Ask the AI" entry point (header link or floating button)
  - Mobile-friendly UI (full-screen modal on small screens)
  - Configure CORS, auth, rate limiting

---

### 7. Text size over images too big (mobile category pages, desktop articles)
- **Status:** ✅ Completed
- **Priority:** Medium (mobile usability)
- **Description:** Text overlays on images are too large
- **Requirements:**
  - Reduce font sizes on mobile (<768px) for image overlays
  - Scale down desktop article overlay text
  - Set `max-width` on large screens
  - Prevent awkward wrapping/clipping

---

### 8. Team banners on article cards misaligned
- **Status:** ✅ Completed
- **Priority:** Medium (visual bug)
- **Description:** Team banners/icons on article cards are misaligned
- **Requirements:**
  - Standardize card layout with flex/grid
  - Fix banner icon dimensions (width, height, padding)
  - Ensure consistent alignment regardless of title length
  - Avoid absolute positioning hacks

---

### 9. Bulls category page shortcode `[icon name=icon-star]` not rendering
- **Status:** ✅ Completed
- **Priority:** Medium (content rendering)
- **Description:** `[icon name=icon-star]` shows as literal text instead of icon
- **Requirements:**
  - Implement shortcode parser/renderer
  - Replace `[icon name=...]` with icon component/SVG
  - Handle unknown names gracefully
  - Integrate into content rendering pipeline

---

### 10. Mobile footer off, with dark empty space
- **Status:** ✅ Completed
- **Priority:** Medium (mobile usability)
- **Description:** Mobile footer has excessive dark empty space
- **Requirements:**
  - Remove/reduce large min-height, margin-bottom, spacer elements
  - Collapse multi-column layouts to vertical stack on mobile
  - Reduce vertical padding to 16-24px
  - Fix invisible extending containers

---

## Progress Summary

| Task | Status |
|------|--------|
| 1. Twitter embeds | ✅ Completed |
| 2. iPhone audio lock screen | ✅ Completed |
| 3. Audio menu mobile | ✅ Completed |
| 4. Search buttons | ✅ Completed |
| 5. Alerts button | ✅ Completed |
| 6. Bears AI bot | ✅ Completed |
| 7. Text size overlays | ✅ Completed |
| 8. Team banner alignment | ✅ Completed |
| 9. Icon shortcode | ✅ Completed |
| 10. Mobile footer | ✅ Completed |

**Completed:** 10/10
