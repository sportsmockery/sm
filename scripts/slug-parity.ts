/**
 * Slug-parity diff between WordPress production and the new Next site.
 *
 * Pulls every URL from the WP `sitemap_index.xml` and from the new Next
 * `sitemap_index.xml`, normalizes hosts to apex, and outputs:
 *
 *   wp_only:   present on WP, missing on Next  → redirect or migrate
 *   next_only: present on Next, missing on WP  → new content
 *   both:      present on both                  → already migrated
 *
 * Writes to audit/slug-parity-{YYYY-MM-DD}.json so editorial / CI can
 * track drift over time.
 *
 * Usage:
 *   npx tsx scripts/slug-parity.ts
 *   WP_INDEX=https://www.sportsmockery.com/sitemap_index.xml \
 *     NEXT_INDEX=https://test.sportsmockery.com/sitemap_index.xml \
 *     npx tsx scripts/slug-parity.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const WP_INDEX = process.env.WP_INDEX || 'https://www.sportsmockery.com/sitemap_index.xml'
const NEXT_INDEX = process.env.NEXT_INDEX || 'https://test.sportsmockery.com/sitemap_index.xml'

const APEX = 'sportsmockery.com'

interface ParityReport {
  generated_at: string
  sources: { wp: string; next: string }
  counts: { wp: number; next: number; wp_only: number; next_only: number; both: number }
  wp_only: string[]
  next_only: string[]
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'sportsmockery-slug-parity/1.0' },
  })
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  return res.text()
}

function extractLocs(xml: string): string[] {
  const out: string[] = []
  const re = /<loc>([^<]+)<\/loc>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) {
    out.push(m[1].trim())
  }
  return out
}

/**
 * Rewrite a child sitemap URL onto the same origin as the index URL.
 * The Next index advertises canonical `sportsmockery.com` URLs but the
 * fetchable origin pre-launch is `test.sportsmockery.com`; without
 * this, every child fetch 404s.
 */
function rebaseToIndexOrigin(childUrl: string, indexUrl: string): string {
  try {
    const c = new URL(childUrl)
    const i = new URL(indexUrl)
    c.protocol = i.protocol
    c.host = i.host
    return c.toString()
  } catch {
    return childUrl
  }
}

/**
 * Walk a sitemap-index URL and return every leaf <loc>. Handles both:
 *   - flat <urlset> sitemaps: returns each <url><loc>
 *   - <sitemapindex> sitemaps: recurses one level into each child
 */
async function fetchAllUrls(indexUrl: string): Promise<string[]> {
  const xml = await fetchText(indexUrl)
  const locs = extractLocs(xml)
  if (xml.includes('<sitemapindex')) {
    const all: string[] = []
    for (const child of locs) {
      const fetchUrl = rebaseToIndexOrigin(child, indexUrl)
      try {
        const childXml = await fetchText(fetchUrl)
        all.push(...extractLocs(childXml))
      } catch (err) {
        console.warn(`[slug-parity] skipping ${fetchUrl}: ${(err as Error).message}`)
      }
    }
    return all
  }
  return locs
}

/**
 * Strip protocol, www., trailing slash, and query/fragment so we can
 * match WP `/foo/` against Next `/foo`. Keeps the path portion only,
 * normalized as the comparison key. Skips off-domain URLs entirely.
 */
function normalizePath(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host !== APEX) return null
    let p = u.pathname || '/'
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
    return p
  } catch {
    return null
  }
}

function dedupeNormalized(urls: string[]): Set<string> {
  const set = new Set<string>()
  for (const u of urls) {
    const k = normalizePath(u)
    if (k) set.add(k)
  }
  return set
}

async function main() {
  console.log('=== Slug parity diff ===')
  console.log(`WP   index: ${WP_INDEX}`)
  console.log(`Next index: ${NEXT_INDEX}`)

  const [wpUrls, nextUrls] = await Promise.all([
    fetchAllUrls(WP_INDEX),
    fetchAllUrls(NEXT_INDEX),
  ])

  const wp = dedupeNormalized(wpUrls)
  const next = dedupeNormalized(nextUrls)

  const wp_only: string[] = []
  const next_only: string[] = []
  let both = 0
  for (const p of wp) {
    if (next.has(p)) both++
    else wp_only.push(p)
  }
  for (const p of next) {
    if (!wp.has(p)) next_only.push(p)
  }
  wp_only.sort()
  next_only.sort()

  const report: ParityReport = {
    generated_at: new Date().toISOString(),
    sources: { wp: WP_INDEX, next: NEXT_INDEX },
    counts: {
      wp: wp.size,
      next: next.size,
      wp_only: wp_only.length,
      next_only: next_only.length,
      both,
    },
    wp_only,
    next_only,
  }

  const auditDir = resolve(process.cwd(), 'audit')
  mkdirSync(auditDir, { recursive: true })
  const date = new Date().toISOString().slice(0, 10)
  const outPath = resolve(auditDir, `slug-parity-${date}.json`)
  writeFileSync(outPath, JSON.stringify(report, null, 2))

  console.log('\n=== Results ===')
  console.log(`wp:        ${report.counts.wp}`)
  console.log(`next:      ${report.counts.next}`)
  console.log(`wp_only:   ${report.counts.wp_only}`)
  console.log(`next_only: ${report.counts.next_only}`)
  console.log(`both:      ${report.counts.both}`)
  console.log(`Written:   ${outPath}`)

  // Threshold gating for CI: fail if wp_only is unexpectedly large.
  // Tune via env; default 40000 is permissive for pre-launch state
  // and should be tightened once the redirect map + Next-side
  // migration are in place.
  const threshold = parseInt(process.env.WP_ONLY_THRESHOLD || '40000', 10)
  if (report.counts.wp_only > threshold) {
    console.error(
      `\n[slug-parity] wp_only (${report.counts.wp_only}) exceeds threshold (${threshold})`
    )
    process.exit(2)
  }
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
