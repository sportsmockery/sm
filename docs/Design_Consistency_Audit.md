# SportsMockery Design Consistency Audit

> **Date:** February 27, 2026
> **Scope:** Full analysis of test.sportsmockery.com and all sub-pages
> **Methodology:** Codebase analysis (17,000+ lines of CSS, 500+ components) + live page inspection

---

## Executive Summary

The SportsMockery codebase has a **well-intentioned design system** (`tokens.css`, `components.css`, CSS variables) that is **severely underutilized**. The primary issues are:

1. **6 competing CSS variable namespaces** defining the same concepts with different values
2. **~8,300 inline style declarations** across 528 files, bypassing the design system
3. **5 homepage CSS variants** with conflicting class definitions
4. **Undefined CSS variables** referenced in production components (`--font-montserrat`, `--sm-accent`)
5. **3 different brand red values** used interchangeably (`#bc0000`, `#FF0000`, `#8B0000`)

The result: pages look *similar* but have subtle visual drift in card backgrounds, border radii, spacing, text colors, and button styling that undermines the premium feel.

---

## Part 1: CSS Architecture Issues

### 1.1 Six Competing Variable Systems

The project defines the same design concepts in 6 different CSS variable namespaces:

| System | File | Prefix | Used By |
|--------|------|--------|---------|
| **Primary** | `globals.css` | `--sm-*` | Most production components |
| **Design Tokens** | `tokens.css` | `--bg-*`, `--text-*`, `--accent-*` | `components.css` (.btn, .card, .modal) |
| **Home** | `home.css` | `--hm-*` | `/home` page |
| **Home1** | `home1.css` | `--h1-*` | `/home1` page |
| **Bears1** | `bears1.css` | `--b1-*` | `/chicago-bears1` page |
| **HomepageV3** | `homepagev3.css` | `--color-*`, `--bg-*` | `HomepageV3.tsx` |

**Same concept, 6 different variable names:**

| Concept | globals.css | tokens.css | home.css | home1.css | bears1.css |
|---------|-------------|------------|----------|-----------|------------|
| Card bg | `--sm-card` #13131d | `--bg-card` #1c1c1f | `--hm-card` #13131d | N/A | N/A |
| Primary text | `--sm-text` | `--text-primary` | `--hm-text` | `--h1-text` | `--b1-text` |
| Muted text | `--sm-text-muted` #8a8a9a | `--text-muted` #71717a | `--hm-text-muted` | `--h1-text-muted` #888 | `--b1-text-muted` #888 |
| Brand red | `--sm-red` #bc0000 | `--accent-red` #FF0000 | `--hm-red` #bc0000 | `--h1-red` #bc0000 | `--b1-red` #bc0000 |
| Small radius | `--sm-radius-sm` 10px | `--radius-sm` 4px | `--hm-radius-sm` 10px | `--h1-radius-sm` 8px | N/A |

**Impact:** A "small radius" is **4px, 8px, or 10px** depending on which system a component happens to use. Card backgrounds are **#13131d or #1c1c1f** depending on the variable referenced.

### 1.2 Conflicting CSS Files (17,026 Lines Total)

| File | Lines | Status |
|------|-------|--------|
| `globals.css` | 4,763 | **Active** -- loaded on every page |
| `homepage.css` | 5,677 | **Active** -- imported in root layout AND page.tsx |
| `components.css` | 845 | **Active** -- loaded via tokens.css |
| `tokens.css` | 332 | **Active** -- imported in globals.css |
| `home.css` | 1,945 | Experimental -- only `/home` route |
| `home1.css` | 234 | Experimental -- only `/home1` route |
| `bears1.css` | 230 | Experimental -- only `/chicago-bears1` route |
| `homepage2030.css` | 1,236 | Component-level -- `Homepage2030.tsx` |
| `homepagev3.css` | 1,669 | Component-level -- `HomepageV3.tsx` |
| `article-grid.css` | 95 | Active -- imported in globals.css |

**Critical conflict:** `homepagev3.css` **redefines** `.sm-main`, `.sm-section`, and `.sm-container` with different `max-width` and `padding` values than `homepage2030.css`. Both are loaded for components in the `/src/components/homepage/` directory.

### 1.3 Legacy Variable Proliferation

`globals.css` :root alone defines **100+ CSS variables** including extensive "legacy compat" aliases:

```
--bg-page, --bg-surface, --bg-header, --bg-footer, --bg-elevated
--text-primary, --text-muted, --text-inverse
--border-color, --border-subtle
--link-color, --link-hover
--badge-bg, --badge-text
--color-primary, --color-primary-dark, --color-primary-light
--color-text-primary, --color-text-secondary, --color-text-muted
--color-background, --color-background-alt, --color-border
--background, --foreground
--bg-primary, --bg-secondary, --bg-tertiary
--card-bg, --card-border, --card-hover-bg, --bg-card
--border-primary, --border-secondary, --border-default
--accent-red, --accent-red-glow
--input-bg, --input-border, --input-text, --input-placeholder
--footer-text-muted, --footer-bottom-bg
```

Many of these duplicate each other (e.g., `--card-bg` and `--bg-card` are both `#13131d`).

---

## Part 2: Color Inconsistencies

### 2.1 Brand Red -- Three Values in Production

| Hex | Where Defined | Where Used |
|-----|---------------|------------|
| `#bc0000` | `--sm-red` in globals.css | Most CSS-variable-aware components |
| `#FF0000` | `--accent-red` in tokens.css (dark) | `components.css` (.btn-primary, .badge-live, focus rings) |
| `#8B0000` | `--accent-red` in tokens.css (light) | Header search, Footer hover, ArticleCard hover, UserMenu |

**Files using hardcoded red hex values instead of variables:** 103 occurrences across 30+ component files.

### 2.2 Hardcoded Colors Across Components

**Worst offenders by count:**

| File | Hardcoded Colors |
|------|-----------------|
| `gm/SimulationResults.tsx` | 253 inline styles |
| `mock/MockDraftGradePanel.tsx` | 40+ unique hex values |
| `home1/AIHud.tsx` | 30+ (`#bc0000`, `#fff`, `#111`, `#555`, `#999`, `#ddd`) |
| `mock-draft/page.tsx` | 114 inline styles, `isDark` ternaries throughout |
| `profile/page.tsx` | 94 inline styles |
| `gm/page.tsx` | 91 inline styles |

**Total inline `style={{` across codebase: ~8,300** (3,635 in components + 4,661 in pages).

### 2.3 Undefined CSS Variables in Production

| Variable | Files Using It | Defined? |
|----------|---------------|----------|
| `--font-montserrat` | 16 locations (Footer, ArticleCard, HeroSection, GradientHeader) | **NO** |
| `--sm-accent` | 18 files (category, article components) | **NO** -- never defined in any CSS |

These components silently fall back to inherited font/color, creating invisible inconsistencies.

### 2.4 Team Color Conflicts

Bears secondary color defined differently across files:

| File | `--bears-secondary` |
|------|---------------------|
| `tokens.css` | `#C83200` |
| `globals.css` | `#C83803` |
| `tailwind.config.ts` | `#C83200` |

### 2.5 White Sox Contrast Problem

White Sox accent `#27251F` is nearly invisible on dark background `#050508`. Other teams use high-contrast accents (Bears orange, Bulls red, Cubs blue, Blackhawks red). White Sox OrbNav, ToolGrid borders, and accent elements appear broken/invisible. **Recommendation:** Use secondary color `#C4CED4` (silver) as the visible accent on dark backgrounds.

---

## Part 3: Component-Level Inconsistencies

### 3.1 Buttons -- 4 Implementation Patterns

| Pattern | Usage | Example |
|---------|-------|---------|
| **A. Full `.btn` system** | ~80 locations | `className="btn btn-md btn-primary"` |
| **B. Partial `.btn-*` (missing `.btn` base)** | ~20 locations | `className="btn-primary btn-full"` (LoginForm, SignupForm) |
| **C. Pure inline styles** | ~21 locations | `style={{ background: 'none', border: 'none', color: '#bc0000' }}` |
| **D. Tailwind-only** | Various | Tailwind classes + inline color overrides |

**Total `<button>` elements: 840 across 279 files.** Only ~12% use the intended `.btn` system correctly.

### 3.2 Cards -- 7+ Implementation Patterns

| Pattern | System | Background Color |
|---------|--------|-----------------|
| `.card` (components.css) | tokens.css | `--bg-card` (#1c1c1f) |
| Inline `var(--sm-card)` | globals.css | `--sm-card` (#13131d) |
| `.glass-card` (homepage.css) | globals.css | `--sm-card` (#13131d) |
| `.hm-glass-card` (home.css) | home.css | `--hm-card` (#13131d) |
| `.b1-holo-card` (bears1.css) | bears1.css | Holographic effect |
| `.h1-glass` (home1.css) | home1.css | Glass morphism |
| Tailwind `bg-zinc-900` | Tailwind | zinc-900 |

The `.card` class from `components.css` is only used in **17 files** despite being the canonical card component.

### 3.3 Border Radius -- 3 Conflicting Scales

| Size | tokens.css | globals.css `--sm-*` | home.css `--hm-*` | home1.css `--h1-*` |
|------|------------|---------------------|-------------------|--------------------|
| Small | 4px | **10px** | 10px | 8px |
| Medium | 6px | **16px** | 16px | 14px |
| Large | 8px | **20px** | 20px | 20px |
| XL | 12px | **24px** | 24px | N/A |

Plus **2,076 Tailwind `rounded-*` usages** and **60+ hardcoded `borderRadius` pixel values** (0, 3, 4, 6, 8, 10, 12, 14, 16, 20, 100) in inline styles.

### 3.4 Tables -- Dual Systems

- `components.css` defines `.table` with `.table th`, `.table td`, `.table-sortable`
- Leaderboards page uses `.sm-table` with `.sm-table-wrapper` -- completely separate class names
- Team stats pages use inline-styled `<table>` elements

---

## Part 4: Page-Level Inconsistencies

### 4.1 Container Width -- 4 Different Values

| Page | Max Width | Source |
|------|-----------|--------|
| Team pages (Bears, Bulls, etc.) | **1320px** | `TeamHubLayout.tsx` |
| Fan Chat | **1200px** | `var(--sm-max-width)` |
| Mock Draft | **1400px** | Hardcoded inline |
| Leaderboards | **1000px** | Hardcoded inline |
| CSS variable `--sm-max-width` | 1200px | globals.css |
| CSS variable `--container-max-width` | 1320px | globals.css |

### 4.2 Top Padding (Header Offset) -- No Standard

| Page | paddingTop |
|------|-----------|
| Team pages | Handled by `TeamHubLayout` hero |
| Mock Draft | `80px` |
| Fan Chat | `96px` |
| Leaderboards | `96px` (via hero) |
| Scout AI | Variable (hero-based) |

### 4.3 Theming Approach -- Two Systems

**System A (correct):** CSS variables with `[data-theme="light"]` overrides. Used by most pages.

**System B (problematic):** JavaScript `isDark` ternary conditionals:
```tsx
color: isDark ? '#fff' : '#1a1a1a'
backgroundColor: isDark ? '#374151' : '#f3f4f6'
```
Used heavily in: `mock-draft/page.tsx` (114 inline styles), `MockDraftGradePanel.tsx`.

System B creates maintenance burden, can drift from CSS variables, and uses Tailwind gray hex values (`#374151`, `#f3f4f6`) that don't match the SM design system surface colors.

### 4.4 Team Page Feature Parity

| Feature | Bears | Bulls | Cubs | White Sox | Blackhawks |
|---------|-------|-------|------|-----------|------------|
| Season Card | Custom component | None | None | None | None |
| Roster Highlights | Custom component | None | None | None | None |
| Trending Topics | Custom component | None | None | None | None |
| AR Tour Button | Yes | No | No | No | No |
| Data fetching | Dedicated `lib/bears.ts` | Inline in page | Inline | Inline | Inline |
| Grid class name | `hub-grid` | `hub-grid-bulls` | `hub-grid-cubs` | `hub-grid-sox` | `hub-grid-hawks` |

Bears has significantly more features and polish than other team pages.

### 4.5 Experimental/Duplicate Routes

Active routes that appear to be experimental variants:

| Route | Purpose | Status |
|-------|---------|--------|
| `/home` | Alternative homepage (home.css) | Experimental |
| `/home1` | "Command Center" homepage (home1.css) | Experimental |
| `/chicago-bears1` | "Obsidian Intelligence Hub" (bears1.css) | Experimental |
| `/fan-zone` | Alternative fan engagement page | Experimental |

These routes have their own CSS systems and aren't linked from the main navigation.

### 4.6 CSS Browser Compatibility

`color-mix()` is used in the Header and 8 other components:
```tsx
backgroundColor: 'color-mix(in srgb, var(--sm-card) 80%, transparent)'
```
While well-supported in modern browsers, this CSS function has no fallback defined, which could cause issues in older browsers.

### 4.7 Semantic HTML Issues

- **Leaderboards page:** Two `<main>` elements (invalid HTML5)
- **Fan Chat page:** No `<main>` landmark at all
- **Mock Draft page:** No semantic landmarks within the page content

### 4.8 Spinner Animation Inconsistency

- Mock Draft uses `animation: 'spin-2030'`
- Leaderboards uses `animation: 'spin'`
- If keyframes aren't both defined in the loaded CSS, one spinner silently breaks.

---

## Part 5: Remediation Plan

### Phase 1: Foundation (Critical -- Do First)

**1.1 Define missing variables**
- Add `--sm-accent` to globals.css (maps to `--sm-red` by default, overridable per-page)
- Remove all `font-[var(--font-montserrat)]` references -- replace with `font-sans` (Space Grotesk)
- Estimated files: ~34

**1.2 Unify brand red**
- Canonical value: `#bc0000` (per CLAUDE.md "Brand Primary Red")
- Update tokens.css: `--accent-red: #bc0000` (currently `#FF0000`)
- Search-and-replace `#8B0000` and `#FF0000` brand red usages with `var(--sm-red)`
- Estimated files: ~30

**1.3 Unify card background**
- Canonical value: `#13131d` (via `--sm-card`)
- Update tokens.css: `--bg-card: #13131d` (currently `#1c1c1f`)
- Estimated files: ~17

**1.4 Fix White Sox accent contrast**
- Use `#C4CED4` (silver) as the display accent on dark backgrounds
- Keep `#27251F` as primary for light contexts only

### Phase 2: Consolidation (High Priority)

**2.1 Consolidate to one variable namespace**
- Keep `--sm-*` as the canonical system (most widely used)
- Map `tokens.css` variables as aliases: `--bg-card: var(--sm-card)`
- Deprecate `--hm-*`, `--h1-*`, `--b1-*` systems (only used in experimental pages)

**2.2 Standardize container width**
- Set `--sm-max-width: 1320px` as the single source
- Apply to all pages consistently
- Allow narrow pages (leaderboards) to set a `max-width` on the content area only, not the outer container

**2.3 Standardize header offset**
- Define `--sm-header-offset: 80px` (or calculate from `--sm-nav-height` + `LiveStrip` + `BriefingStrip`)
- Apply consistently to all page top padding

**2.4 Unify border radius scale**
- Adopt the globals.css `--sm-radius-*` scale as canonical (10/16/20/24px)
- Update tokens.css to match
- Gradually replace Tailwind `rounded-*` with `var(--sm-radius-*)` in critical components

### Phase 3: Component Standardization (Medium Priority)

**3.1 Buttons**
- Audit all 840 `<button>` elements
- Ensure all use `.btn` base class + size + variant
- Move inline color overrides to the design system where possible
- Create team-accent button variant

**3.2 Cards**
- Consolidate to `.glass-card` as the primary card pattern
- Phase out `.card` from components.css or align it with `.glass-card`
- Replace inline card styling with class-based approach

**3.3 Tables**
- Unify `.table` and `.sm-table` into one system
- Apply to all data table instances (team stats, leaderboards, cap tracker)

**3.4 Replace `isDark` ternaries**
- In mock-draft and MockDraftGradePanel, replace JavaScript theme checks with CSS variables
- Eliminates ~150 inline styles in those files alone

### Phase 4: Cleanup (Lower Priority)

**4.1 Remove/archive experimental CSS**
- Move `home.css`, `home1.css`, `bears1.css` to an `/experiments` directory
- Remove their route imports if the pages are not publicly linked
- Reduces active CSS from 17,000 to ~11,500 lines

**4.2 Reduce inline styles**
- Target the top 15 files (253-40 inline styles each)
- Extract repeated patterns into CSS classes
- Goal: reduce from ~8,300 to under 3,000

**4.3 Deduplicate legacy variables**
- Remove aliases where both sides resolve to the same value
- Keep only the `--sm-*` canonical names + any truly needed for Tailwind integration

**4.4 Team page parity**
- Create shared `TeamSeasonCard`, `TeamRosterHighlights`, `TeamTrendingTopics` components
- Apply to all 5 team pages (not just Bears)
- Standardize grid class name to one shared class

**4.5 Fix semantic HTML**
- Ensure single `<main>` element per page
- Add proper landmarks to Fan Chat and Mock Draft

---

## Appendix A: File Impact Matrix

| File | Issues Found | Priority |
|------|-------------|----------|
| `globals.css` | Legacy variables, duplicate definitions | Phase 2 |
| `tokens.css` | Wrong red value, radius conflicts | Phase 1 |
| `components.css` | Low adoption, namespace mismatch | Phase 2 |
| `homepage.css` | Loaded globally but page-specific | Phase 4 |
| `home.css` / `home1.css` / `bears1.css` | Separate variable systems | Phase 4 |
| `Header.tsx` | `color-mix()`, hardcoded colors | Phase 1 |
| `Footer.tsx` | `--font-montserrat`, hardcoded gradients | Phase 1 |
| `ArticleCard.tsx` | `--font-montserrat`, hardcoded `#8B0000` | Phase 1 |
| `HeroSection.tsx` | `--font-montserrat`, hardcoded colors | Phase 1 |
| `mock-draft/page.tsx` | 114 inline styles, `isDark` pattern | Phase 3 |
| `gm/SimulationResults.tsx` | 253 inline styles | Phase 3 |
| `MockDraftGradePanel.tsx` | 55 inline styles, hardcoded hex | Phase 3 |
| `fan-chat/page.tsx` | Hardcoded `#bc0000`, JS hover states | Phase 3 |
| `leaderboards/page.tsx` | Dual `<main>`, `.sm-table` vs `.table` | Phase 3 |

## Appendix B: Quick Wins (Can Fix Today)

1. **Add `--sm-accent: var(--sm-red)` to globals.css** -- fixes 18 component files
2. **Replace `font-[var(--font-montserrat)]` with `font-sans`** -- fixes 16 locations in 7 files
3. **Update tokens.css `--accent-red` from `#FF0000` to `#bc0000`** -- aligns with brand
4. **Update tokens.css `--bg-card` from `#1c1c1f` to `#13131d`** -- matches globals.css
5. **Fix Bears secondary color in globals.css** from `#C83803` to `#C83200` -- matches tokens + Tailwind
