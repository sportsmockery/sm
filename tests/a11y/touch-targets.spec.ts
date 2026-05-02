import { test, expect, devices } from '@playwright/test'

/**
 * Tip #32 — Mobile-first touch-target audit.
 *
 * WCAG 2.5.5 (Target Size, Level AAA) and the iOS HIG both put the floor
 * for tappable elements at 44×44 CSS px. We assert that every visible
 * button / link rendered above the fold at 360px (smallest common phone
 * viewport) either:
 *   - has a bounding box ≥ 44×44, or
 *   - has the .touch-target-expand pseudo-element overlay (dense UI), or
 *   - is opted out via data-allow-small-target="true" (e.g. inline links
 *     inside running prose, where TARGET_SIZE_INLINE_EXEMPTION applies).
 *
 * The test runs at three viewports: 360px (Galaxy S8 / iPhone SE), 390px
 * (iPhone 14), and 428px (iPhone 14 Pro Max). It samples the homepage,
 * which transitively exercises Header, Footer, ArticleCard rows,
 * Pagination, and the SocialShareBar.
 */

const ROUTES = ['/']

const VIEWPORTS = [
  { name: '360 (S8)', width: 360, height: 740 },
  { name: '390 (iPhone 14)', width: 390, height: 844 },
  { name: '428 (iPhone 14 Pro Max)', width: 428, height: 926 },
]

const MIN_SIZE = 44
const MIN_GAP = 8

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`touch targets on ${route} @ ${vp.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 14'],
        viewport: { width: vp.width, height: vp.height },
      })
      const page = await context.newPage()
      await page.goto(route, { waitUntil: 'domcontentloaded' })

      // Allow async hydration / layout to settle.
      await page.waitForTimeout(500)

      type Offender = {
        tag: string
        label: string
        width: number
        height: number
        x: number
        y: number
      }

      const offenders: Offender[] = await page.evaluate(
        ({ minSize }) => {
          const results: Offender[] = []
          const selector = [
            'button',
            'a[href]',
            '[role="button"]',
            'input[type="button"]',
            'input[type="submit"]',
          ].join(',')

          const all = Array.from(document.querySelectorAll(selector)) as HTMLElement[]
          for (const el of all) {
            // Opt-out for inline-prose links, etc.
            if (el.dataset.allowSmallTarget === 'true') continue

            // Skip elements rendered off-screen / hidden.
            const style = window.getComputedStyle(el)
            if (
              style.display === 'none' ||
              style.visibility === 'hidden' ||
              style.pointerEvents === 'none'
            ) continue

            const rect = el.getBoundingClientRect()
            if (rect.width === 0 || rect.height === 0) continue
            // Only assert on visible-above-the-fold elements.
            if (rect.top > window.innerHeight) continue
            if (rect.bottom < 0) continue

            // Honor the .touch-target-expand pattern (::before overlay
            // inset: -8px gives an effective hit area ≥ visible + 16).
            if (el.classList.contains('touch-target-expand')) {
              if (rect.width + 16 >= minSize && rect.height + 16 >= minSize) continue
            }

            if (rect.width >= minSize && rect.height >= minSize) continue

            results.push({
              tag: el.tagName.toLowerCase(),
              label:
                el.getAttribute('aria-label') ||
                (el.textContent || '').trim().slice(0, 60) ||
                el.outerHTML.slice(0, 80),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              x: Math.round(rect.x),
              y: Math.round(rect.y),
            })
          }
          return results
        },
        { minSize: MIN_SIZE }
      )

      if (offenders.length > 0) {
        const msg =
          `Found ${offenders.length} interactive element(s) below ${MIN_SIZE}×${MIN_SIZE}px on ${route} @ ${vp.name}:\n` +
          offenders
            .map(
              (o) =>
                `  • <${o.tag}> "${o.label}" — ${o.width}×${o.height} at (${o.x},${o.y})`
            )
            .join('\n')
        throw new Error(msg)
      }

      expect(offenders).toHaveLength(0)
      await context.close()
    })
  }
}

test('horizontal nav clusters keep ≥8px between adjacent targets', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)

  // Find all flex/grid rows that contain ≥3 buttons or anchors.
  const tooClose: Array<{ container: string; gapPx: number }> = await page.evaluate(
    ({ minGap }) => {
      const rows: Array<{ container: string; gapPx: number }> = []
      const containers = Array.from(document.querySelectorAll('nav, [class*="flex"], [class*="grid"]')) as HTMLElement[]
      for (const c of containers) {
        const targets = Array.from(c.querySelectorAll(':scope > button, :scope > a')) as HTMLElement[]
        if (targets.length < 2) continue
        const rects = targets
          .map((t) => t.getBoundingClientRect())
          .filter((r) => r.width > 0 && r.height > 0)
          .sort((a, b) => a.left - b.left)

        for (let i = 1; i < rects.length; i++) {
          const a = rects[i - 1]
          const b = rects[i]
          // Same row?
          if (Math.abs(a.top - b.top) > 4) continue
          const gap = b.left - a.right
          if (gap < minGap && gap >= 0) {
            rows.push({
              container: c.className.slice(0, 80) || c.tagName,
              gapPx: Math.round(gap),
            })
            break
          }
        }
      }
      return rows
    },
    { minGap: MIN_GAP }
  )

  expect(tooClose, `Adjacent tap targets too close: ${JSON.stringify(tooClose, null, 2)}`).toHaveLength(0)
})
