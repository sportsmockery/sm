# Mobile Pillars — Follow-Up Tracker

Status of the three "Native Feel" pillars and the items deferred from each.
Everything below is **deferred work**, not blockers — primitives are landed and
the app builds clean. Use this doc as the next-sprint backlog.

> Last updated: 2026-05-02

---

## Pillar 1 — Tactile Responsiveness (`InteractivePress` + Haptics)

### Landed
- `src/lib/haptics.ts` — tiered fallback (Capacitor → `navigator.vibrate` → no-op)
- `src/components/motion/InteractivePress.tsx` — universal tactile wrapper with
  haptics, spring press, keyboard activation, polymorphic `as` prop
- Compat aliases (`haptic`, `selection`, `notify`) so `mobile-next` consolidates
  onto the same module

### Follow-ups
- [ ] **Roll out across high-traffic surfaces.** Wrap with `InteractivePress`:
  - Homepage feed cards (`MainFeed.tsx` river cards: `EditorialCard`,
    `BoxScoreCard`, `PollCard`, `DebateCard`, `RumorCard`, `TopIntelligenceCard`)
  - Team subnav tabs (`TeamHubLayout.tsx` line ~206) — `hapticStyle="selection"`
  - Mobile bottom nav tabs (`MobileBottomNav.tsx`) — `hapticStyle="selection"`
  - GM trade actions: Add Player, Remove, Reset, Simulate Trade
  - Mock Draft prospect rows + Draft button
  - Scout AI suggested-prompt chips and "Ask" button — `hapticStyle="medium"`
  - Login/Signup submit + tab switcher
  - Vision Theater video tiles
- [ ] **Install `@capacitor/haptics`** in the `mobile-next/` workspace when the
  Capacitor wrap is built. The web bundle does **not** need it; the dynamic
  import already no-ops gracefully.
- [ ] **Migrate `mobile-next/src/lib/haptics.ts`** to re-export from the main
  app file (or delete and update the alias). Single source of truth.
- [ ] **Check root `tsconfig.json`** — currently includes `mobile-next/**/*.tsx`
  via the `**/*.tsx` glob, which causes alias-resolution mismatches. Either
  `exclude: ["mobile-next/**"]` or move mobile-next into a true workspace.
- [ ] **Audit existing framer-motion `whileTap`** usages (`grep -r "whileTap"
  src/`) and migrate to `InteractivePress` so haptics + scale stay synchronized
  in one primitive.

---

## Pillar 2 — Fluid Navigation (`template.tsx` Page Transitions)

### Landed
- `src/app/template.tsx` — root-level page transition wrapper
- iOS-style cubic-bezier `[0.32, 0.72, 0, 1]` at 320ms
- Mobile-only via `(pointer: coarse)`; desktop swaps instantly
- `prefers-reduced-motion` and SSR/hydration safe
- `mode="wait"` for clean push semantics

### Follow-ups
- [ ] **Back/forward direction detection.** Currently both nav directions look
  identical. To match iOS push (slide in from right) vs pop (slide back to
  right), wire a `popstate` listener that tracks last nav direction in a
  context, then switch the `initial`/`exit` x-offset signs accordingly.
  Sketch:
  ```tsx
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  useEffect(() => {
    const onPop = () => setDirection('back')
    window.addEventListener('popstate', onPop)
    // Reset to 'forward' on next non-pop nav (Link click)
  }, [])
  ```
- [ ] **Audit compounding entrance animations.** Pages that already have their
  own framer-motion entrance now play AFTER the page-level transition. Check:
  - `/login` — `auth-panel-in`, `auth-enter-up`, `auth-card-in`
  - `/chicago-bears` etc. — `TeamHubLayout` hero entrance, shimmer logo
  - `/scout-ai` — empty-state illustration entrance
  - Article pages — block staggered entrance (if present)
  
  If any feel busy on mobile, two clean fixes: (a) remove the route-local
  entrance, or (b) move that route under a route group like `src/app/(plain)/`
  with its own `template.tsx` that skips the page transition.
- [ ] **Page-state preservation review.** The template re-mounts on every nav
  (already true of any App Router nav). Verify nothing critical relies on
  in-page state surviving navigation:
  - GM trade in-progress (currently page-level state)
  - Mock draft active session (URL-param or DB-backed)
  - Scout AI conversation (lost on nav — confirm acceptable)
- [ ] **Performance check on low-end Android.** 320ms transform animation on
  every navigation can drop frames on older devices. Profile on a Pixel 3a /
  similar; if frame budget is tight, drop to 240ms or remove the scale
  component.
- [ ] **Header guard parity.** `Header.tsx` already returns null on
  `/home` and `/chicago-bears1`. Confirm no other guards depend on layout
  persistence vs template re-mount.

---

## Pillar 3 — Perceived Performance (`LiquidSkeleton`)

### Landed
- `src/components/ui/LiquidSkeleton.tsx` — frosted-glass placeholder with
  translating gradient sweep, light/dark/`prefers-reduced-motion` aware
- `liquid-shimmer` keyframe + `.liquid-skeleton` / `.liquid-skeleton-sweep`
  classes in `globals.css`
- Variants: `rectangular`, `circular`, `text` + `count` prop for stacked rows

### Follow-ups
- [ ] **Replace existing gray-box skeletons** across the app. Find call sites:
  ```bash
  grep -rn "Skeleton\b" src/ | grep -v "LiquidSkeleton"
  grep -rn "skeleton-shimmer\b" src/
  grep -rn "className=\"skeleton" src/
  ```
  Known existing components to retire / wrap:
  - `src/components/ui/skeleton.tsx`
  - `src/components/ui/SkeletonLoader.tsx`
  - `src/components/ArticleCardSkeleton.tsx`
  - Inline `.skeleton` class usages
- [ ] **Resolve casing conflict.** `skeleton.tsx` (lowercase) coexists with
  `Skeleton` (capital) imports from `mobile-next/`. TypeScript flags this as a
  case-only collision. Pick one, fix both call sites and the file.
- [ ] **Build composed skeletons** for each major loading state so consumers
  use one ready-made skeleton instead of hand-stacking primitives:
  - `<ArticleCardSkeleton />` (image 4:3, two text lines, metadata row)
  - `<TeamHeaderSkeleton />` (logo circle 64, name text, record pill)
  - `<RosterRowSkeleton />` for player tables
  - `<ScoutThinkingSkeleton />` for the chat thread (replaces the
    bouncing-dots block in `scout-ai/page.tsx` at message stream)
  - `<MockDraftPickSkeleton />` for prospect list rows
  - `<BoxScoreSkeleton />` for live game cards
- [ ] **Bundle/perf check.** `backdrop-filter: blur(12px)` on many stacked
  skeletons can be GPU-heavy on iPhone XR-class devices. If lists ever render
  >20 simultaneous skeletons, consider a static-no-blur variant for that case.

---

## Pillar 4 — The Reading Experience (`ArticleProgressHeader` + reader typography)

### Landed
- `src/components/article/ArticleProgressHeader.tsx` — fixed top header for
  article surfaces. Background fades from transparent → frosted past 50px,
  title fades in at 40-120px scroll, brand-red `scaleX` progress bar at the
  bottom edge. Theme-aware (dark + light), `prefers-reduced-motion` safe,
  hydration-safe, `InteractivePress` back button with `'selection'` haptic.
- `globals.css` — mobile-only `.article-body` typography refinements scoped
  under `@media (max-width: 768px)`: 17px / 1.65 / -0.011em letter-spacing,
  18px first paragraph, refined blockquote with brand-red border, calmer
  h2/h3 rhythm, hyphenation + legibility hints. Desktop `.article-body` is
  unchanged.
- New `.article-reader-mode` utility — adds top padding to clear the
  ArticleProgressHeader (`56px + safe-area-inset-top`).

### Follow-ups
- [x] **Wired into the article route.** `src/app/[category]/[slug]/page.tsx`
  now mounts `<ArticleProgressHeader title={post.title} backHref={`/${category}`} />`
  in place of the old `<ReadingProgressBar />`. Hero `paddingTop` adjusted to
  clear the new 56px header instead of the global 72px nav.
- [x] **Global `<Header />` suppressed on article routes.** `Header.tsx`
  exports an `isArticleRoute(pathname)` helper that returns `true` when the
  URL has exactly 2 segments and the first isn't in the `HARDCODED_TOP_LEVEL`
  set (every directory currently under `src/app/`). Returns `null` early so
  the nav, drawer, spacer, `<LiveGamesTopBar>`, and `<TeamStickyBarRouter>`
  all suppress together — no chrome doubling, no z-index battles.

  > **Maintenance note:** when you add a new top-level directory under
  > `src/app/`, append its segment to `HARDCODED_TOP_LEVEL` in
  > `src/components/layout/Header.tsx`. Otherwise visiting that route would
  > be misidentified as an article and the global header would disappear.
- [ ] **Direction detection for back button.** `router.back()` falls back to
  `backHref` when no history exists. Confirm `backHref` defaults make sense
  per category (Bears article → `/chicago-bears`, etc.).
- [ ] **Reading-progress accuracy.** `useScroll()` tracks the **window**.
  If the article body has its own scrollable container, swap to
  `useScroll({ target: articleRef })`. Verify on the actual article route
  before declaring this done.
- [ ] **Drop-cap polish (optional).** Current first-paragraph emphasis is a
  subtle font-size bump. If you want a real drop-cap, add via
  `.article-body > p:first-of-type::first-letter { float: left; … }` —
  hold off until after rollout to confirm fit with existing leads.
- [ ] **Light mode visual QA.** The header has a light-mode backdrop layer
  driven by `[data-theme="light"]`. Confirm the fade looks right against
  white article hero images (especially full-bleed photo headers) — may
  need a slight gradient mask if backdrop blur fights with image content.
- [ ] **Mobile typography on legacy article HTML.** Pre-WordPress-import
  articles may have inline color/size overrides that override our mobile
  `@media` rules. Spot-check a few imported pieces; if needed, add
  `:where()` specificity layering.

---

## Carry-over from Mobile UX Pass (2026-05-02)

These were flagged but deliberately deferred from the first pass; logging here
so they don't get lost.

### High-impact, larger surface
- [ ] **Mobile-card refactor for tabular data.** `roster`, `stats`, `cap-tracker`
  pages currently rely on `overflow-x-auto` tables. Replace with stacked
  cards on `< 768px`. Build a shared `<PlayerTableMobile />` so all 5 teams
  benefit. (Owner: separate sprint with product input.)
- [ ] **GM Trade Simulator mobile workflow restructure.** 1600-line page
  collapses 3 columns into nested scrolling on mobile. Rebuild as tabs (Your
  Team / Trade / Their Team) + sticky bottom action tray. Needs product call
  on mobile UX direction.
- [ ] **Mock Draft sticky pinned-pick context.** Current pick info scrolls
  away. Add a sticky badge below header showing pick #, team on the clock,
  and recommended action. Use the `.sticky-context-badge` utility already in
  `globals.css`.
- [ ] **Persistent team identity on deep team pages.** Stats, roster,
  schedule pages lose the team badge below the header. Add a persistent
  team-identity strip in `TeamHubLayout` or each page template.
- [ ] **Back-to-hub FAB on deep team pages.** Player profile / stats deep
  dives need a quick return path beyond the breadcrumb.
- [ ] **Owner / League comparison table** — add a left-edge gradient fade
  affordance and snap-scroll on mobile so users discover horizontal scroll.

### Architectural
- [ ] **Nav data consolidation.** Nav items duplicated across
  `Header.tsx`, `AppSidebar.tsx`, `MobileBottomNav.tsx`, `Footer.tsx`. Extract
  to `src/lib/nav-config.ts` and import everywhere.
- [ ] **Live Strip / LiveGamesTopBar / TeamStickyBar stacking.** On a team
  page during a live game, ~300px of chrome stacks before content begins.
  Decide which bar wins on mobile or merge into a single contextual bar.
- [ ] **Dead component cleanup.** `PersonalizedFeed`, `SocialFeed`,
  `LatestStream`, `ForYouFeed`, `StorylineFeed`, `EdgeIntro`, `RiverFeed`,
  `ProphecyFeed`, `HomepageFeed` (v1), `MobileMenu` (unused) — verified not
  imported. Safe to delete after one more grep pass.
- [ ] **Two `Header.tsx` files.** Legacy `src/components/Header.tsx` is unused;
  active is `src/components/layout/Header.tsx`. Delete the legacy.

### Accessibility / polish
- [ ] **Universal focus-visible audit.** Several components still rely on
  default browser focus rings. Apply `.focus-ring` utility to interactive
  controls system-wide, especially in admin/owner surfaces.
- [ ] **Reduce-motion compliance audit.** Vision Theater orbs (1000-count)
  already gated. Confirm GM/Mock Draft/SimulationResults animations also
  respect `prefers-reduced-motion`.
- [ ] **iOS safe-area pass on all overlays.** Drawer + bottom-nav now
  notch-aware. Verify modals (`SimulationResults`, methodology, scout sheet,
  vision-theater scout modal) all respect `env(safe-area-inset-*)`.

---

## Quick reference — primitives now available

| Primitive | Import | Use for |
|---|---|---|
| `InteractivePress` | `@/components/motion` | Cards, list items, major buttons — tactile + haptic + a11y |
| `triggerHaptic`, `haptic`, `selection`, `notify` | `@/lib/haptics` | Standalone haptic taps without the wrapper |
| `LiquidSkeleton` | `@/components/ui/LiquidSkeleton` | Loading placeholders that match Liquid Glass |
| `ArticleProgressHeader` | `@/components/article/ArticleProgressHeader` | Immersive top header for article routes — fades, blurs, scroll-progress bar |
| Page transitions | `src/app/template.tsx` | Automatic — applies to every route on touch devices |
| Mobile reader mode | `globals.css` `.article-reader-mode` + `@media` rules | Tighter typography below 768px on `.article-body`, top spacer for the progress header |
| Mobile CSS utilities | `globals.css` | `.tap-target`, `.focus-ring`, `.safe-*`, `.scout-ai-sheet`, `.sticky-action-bar`, `.sticky-context-badge`, `.touch-press`, `.scroll-snap-x`, `.liquid-skeleton`, `.liquid-skeleton-sweep` |

---

## Pillar 4 — `/mobile-next` Capacitor rebuild (added 2026-05-02)

Phases 1–5 of `~/.claude/plans/you-are-an-expert-expressive-gosling.md` shipped:
Next 16 + Tailwind v4 + Capacitor 7 shell at `/mobile-next/`, 30+ routes, 87 TS
files, `npm run build` produces 45 static pages (4.8 MB out, ~1.9 MB JS,
largest chunk ~60 KB), iOS Xcode workspace + pods installed (deployment target
iOS 15 for AdMob 8), Android Gradle workspace generated.

`/mobile` (the Expo app) is still the shipping artifact. Cutover deferred until
TestFlight QA confirms parity.

### Outstanding work (in execution order)

- [ ] **Set env vars.** Copy `mobile-next/.env.example` → `.env.local` and fill
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_ONESIGNAL_APP_ID`, `NEXT_PUBLIC_ADMOB_*` (reuse IDs from
  `/mobile/eas.json`).
- [ ] **Install OneSignal Capacitor plugin.** The `@onesignal/onesignal-capacitor`
  name was wrong; install the right package and update the dynamic import in
  `src/lib/push.ts`:
  ```sh
  cd mobile-next
  npm i onesignal-cordova-plugin
  npx cap sync
  ```
  Wrapper already lazy-loads with try/catch so it no-ops cleanly until then.
- [ ] **Update `ios/App/App/Info.plist`:** add `UIBackgroundModes → audio` (for
  HTML5 audio + Media Session lock-screen playback per Directive 1),
  `CFBundleURLTypes → sportsmockery` (Supabase OAuth callback),
  `NSUserTrackingUsageDescription` (AdMob), AdMob `GADApplicationIdentifier`.
- [ ] **Update `android/app/src/main/AndroidManifest.xml`:** add `sportsmockery://`
  deep-link `<intent-filter>`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permission,
  AdMob `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID">`,
  OneSignal manifest entries.
- [ ] **Port app icons + splash** from `/mobile/assets/` (or run
  `npx capacitor-assets generate`).
- [ ] **Install Android SDK + Studio** (currently absent on this machine —
  `ANDROID_HOME` empty, no `~/Library/Android/sdk`). Then `npx cap open android`.
- [ ] **Real-device test (iOS first):** OAuth deep-link round-trip, AdMob banner
  fill, audio background playback + lock-screen metadata, Liquid Glass
  `backdrop-filter` on iPhone 12 / iOS 15+, `prefers-reduced-motion` gate on
  Vision Theater + GradeRing reveal, Dynamic Type at 200%.
- [ ] **Bundle analyzer report.** `@next/bundle-analyzer` didn't emit under
  Turbopack. Either run with the webpack builder
  (`ANALYZE=true NEXT_BUILD_LEGACY=1 next build`) or use `source-map-explorer`
  against `out/_next/static`. Target: initial JS < 250 KB gzipped.
- [ ] **Lighthouse mobile** on the static `out/` (target Perf ≥ 85, A11y ≥ 95).
- [ ] **TestFlight + Play Console internal track** — alongside the existing
  Expo binary, NOT replacing it. Document the native value-adds (push,
  AdMob, haptics, deep-links) for the App Store Guideline 4.2 review notes.
- [ ] **API contract sync hygiene.** `npm run build` runs `sync-api`
  automatically (copies `mobile/lib/{api,gm-api,gm-types,mock-draft-api,mock-draft-types}.ts`
  into `mobile-next/src/lib/`). Don't hand-edit the synced files in
  `mobile-next/` — edit them in `/mobile/lib/` so the Expo app keeps shipping
  with the same contract.
- [ ] **Cutover (only after QA sign-off):**
  ```sh
  git mv mobile mobile-legacy
  git mv mobile-next mobile
  # update CLAUDE.md and any /docs references, delete the sync-api script
  git commit -m "cutover: replace Expo /mobile with Next/Capacitor build"
  ```
  Keep the legacy binary in stores 30 days post-cutover via App Store Connect
  phased release to soft-cushion AdMob fill-rate / OneSignal subscription drift.
- [ ] **Delete `/mobile-legacy`** after the 30-day overlap window.

### Known caveats baked into the rebuild

- **Audio is single-track only (Directive 1).** No gapless playback, no queue UI
  — HTML5 `<audio>` + Media Session API only. `react-native-track-player`
  parity not pursued; revisit if user feedback demands it.
- **Dynamic routes use a `view` placeholder** (`/article/view?id=…`,
  `/live/view?id=…`) under `output: 'export'`. Internal links already point at
  the placeholder paths — don't hand-write `/article/123` URLs.
- **Capacitor 8 doesn't exist.** The original blueprint said "Capacitor 8";
  pinned to v7 (current stable) instead.
- **Framer Motion `layoutId` is reserved for hero moments only** (Vision
  Theater expansion, GradeRing reveal). Standard transitions use Vaul +
  hardware-accelerated Tailwind utilities to keep 60fps on lower-end Android
  WebViews.

### Reference

- Plan file: `~/.claude/plans/you-are-an-expert-expressive-gosling.md`
- Status doc inside the rebuild: `mobile-next/STATUS.md`
