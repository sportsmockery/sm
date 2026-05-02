# Performance Budget — SEO Tip #24

Per-route first-load JS targets for `sportsmockery.com`. Measured from
`next build` output (`First Load JS shared by all` + per-route delta).

## Targets

| Route group                              | First-load JS budget | Notes                                                                |
| ---------------------------------------- | -------------------- | -------------------------------------------------------------------- |
| `/` (homepage)                           | ≤ 250 KB             | Hot path; force-dynamic for personalized greeting.                   |
| `/chicago-{team}` evergreen hubs         | ≤ 220 KB             | ISR (`revalidate=300`); static where possible.                       |
| `/home/article/[slug]`                   | ≤ 230 KB             | ISR (`revalidate=600`); deferred chart/poll embeds in article body.  |
| `/gm`                                    | ≤ 450 KB             | Heavy interactive surface; modals/exports are dynamic-imported.      |
| `/admin/*`, `/studio/*`                  | ≤ 500 KB             | Internal-only; ChartBuilder + PollBuilder lazy-loaded on click.      |
| All other public routes                  | ≤ 280 KB             |                                                                      |

## Hydration / `'use client'` policy

- A component should only carry `'use client'` when it has *measurable* client interactivity (state, effects, browser APIs, event handlers attached to dynamic data).
- Decorative or static UI (badges, headings, layout containers, presentational cards) belongs in server components — moving them off the client cuts hydration JS.
- When a server component needs to render an interactive child, prefer importing the child directly (Next will split the boundary) over marking the parent `'use client'`.

## Third-party `<Script>` strategies

| Script                              | Strategy           | Reason                                                          |
| ----------------------------------- | ------------------ | --------------------------------------------------------------- |
| Google Tag Manager (`gtm-init`)     | `afterInteractive` | Required for analytics correctness; loads after hydration.      |
| Future chat widgets / late pixels   | `lazyOnload`       | Non-critical; should wait for browser idle.                     |
| Future ad tags                      | `afterInteractive` | Reliability over INP — keep above the fold light.               |

`worker` strategy is **not** used yet — Partytown integration requires careful auditing of analytics + consent flows; revisit when the strategy is stable.

## Measuring

- Local: `ANALYZE=true npm run build` opens the bundle analyzer report (requires `npm i -D @next/bundle-analyzer`).
- CI: route-level first-load JS appears at the end of `next build`. PRs that bump a route past its budget should justify the regression in the description.
- Field: monitor INP via Vercel Speed Insights / CrUX; budget here targets desktop p75 ≤ 200 ms, mobile p75 ≤ 300 ms.

## Code-split inventory (Tip #24)

These heavy interactive components are now loaded via `next/dynamic` and gated on user action:

- `ChartBuilderModal` (echarts + framer-motion) — `RichTextEditor`, `AdvancedPostEditor`, `StudioPostEditor`
- `PollBuilder` — `RichTextEditor`
- `PreferencesModal` — `/gm` page
- `SkipLoginModal` — `HomeLoginForm`

Future candidates: `ExportModal`, `PostIQChartGenerator`, `BlockEditor` for view-only routes.
