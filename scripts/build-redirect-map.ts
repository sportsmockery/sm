/**
 * Tip #33 — categorize wp_only paths from the slug-parity output and
 * emit a redirect map CSV plus a JSON manifest editorial can review.
 *
 * Categories:
 *   wp_date    /YYYY/MM/DD/slug/         → 308 to /<category>/<slug> if a
 *                                          published row exists in sm_posts,
 *                                          else 410 Gone
 *   wp_tag     /tag/<slug>/              → 410 Gone (most are noise)
 *   wp_cat     /category/<slug>/         → already handled in next.config
 *                                          redirects(); marked "existing"
 *   wp_author  /author/<slug>/           → 410 Gone unless explicitly kept
 *   misc       /about, /advertise, ...   → manual review
 *
 * Usage:
 *   PARITY_FILE=audit/slug-parity-YYYY-MM-DD.json \
 *     npx tsx scripts/build-redirect-map.ts
 *
 *   # Without PARITY_FILE the script picks the most recent
 *   # audit/slug-parity-*.json automatically.
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Optional dotenv — only loaded when present so the script runs in
// CI without it.
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv/config')
} catch {
  /* no env file is fine */
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

interface ParityReport {
  generated_at: string
  counts: Record<string, number>
  wp_only: string[]
  next_only: string[]
}

interface Entry {
  source: string
  category:
    | 'wp_date'
    | 'wp_tag'
    | 'wp_cat'
    | 'wp_author'
    | 'wp_team_article'
    | 'wp_legacy_archive'
    | 'misc'
  action: 'redirect_308' | 'gone_410' | 'existing' | 'review'
  destination: string
  note: string
}

const KNOWN_CATEGORIES = new Set([
  'chicago-bears',
  'chicago-bulls',
  'chicago-cubs',
  'chicago-blackhawks',
  'chicago-white-sox',
  'news',
])

// WP-era listing/archive pages that mapped to a hub. Default → team hub.
const LEGACY_TEAM_ARCHIVES: Record<string, string> = {
  '/bears-news': '/chicago-bears',
  '/blackhawks-news': '/chicago-blackhawks',
  '/bulls-news': '/chicago-bulls',
  '/chicago-bears-history': '/chicago-bears',
  '/chicago-bears-odds': '/chicago-bears',
  '/chicago-bears-player': '/chicago-bears',
  '/chicago-bears-roster': '/chicago-bears',
  '/chicago-bears-schedule': '/chicago-bears/schedule',
  '/chicago-bears-scores': '/chicago-bears/scores',
}

const WP_DATE_RE = /^\/(19|20)\d{2}\/\d{1,2}\/\d{1,2}\/([^/]+)\/?$/
const WP_DATE_NOSLUG_RE = /^\/(19|20)\d{2}\/\d{1,2}\/?$/
const TAG_RE = /^\/tag\/([^/]+)\/?$/
const CAT_RE = /^\/category\/([^/]+)/
const AUTHOR_RE = /^\/author\/([^/]+)/

const KEEP_AS_IS = new Set([
  '/about',
  '/contact',
  '/privacy',
  '/terms',
])

function pickParityFile(): string {
  if (process.env.PARITY_FILE) return resolve(process.cwd(), process.env.PARITY_FILE)
  const dir = resolve(process.cwd(), 'audit')
  const files = readdirSync(dir)
    .filter((f) => /^slug-parity-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
  if (files.length === 0) {
    throw new Error(
      'No audit/slug-parity-*.json found. Run scripts/slug-parity.ts first.'
    )
  }
  return resolve(dir, files[files.length - 1])
}

async function loadKnownSlugs(): Promise<Set<string>> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn(
      '[redirect-map] SUPABASE env vars unset — wp_date entries will all 410 (no slug match)'
    )
    return new Set()
  }
  // Lazy import so the script runs in environments without
  // node_modules installed (e.g. quick local categorization).
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const slugs = new Set<string>()
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data, error } = await supabase
      .from('sm_posts')
      .select('slug, category:sm_categories(slug)')
      .eq('status', 'published')
      .range(from, from + PAGE - 1)
    if (error) throw new Error(`Supabase: ${error.message}`)
    if (!data || data.length === 0) break
    for (const row of data) {
      const cat = (row.category as { slug?: string } | null)?.slug || 'news'
      slugs.add(`${row.slug}|${cat}`)
      slugs.add(row.slug as string)
    }
    if (data.length < PAGE) break
    from += PAGE
  }
  return slugs
}

function categorize(path: string, knownSlugs: Set<string>): Entry {
  if (KEEP_AS_IS.has(path)) {
    return {
      source: path,
      category: 'misc',
      action: 'existing',
      destination: path,
      note: 'static page already exists in Next app',
    }
  }

  if (LEGACY_TEAM_ARCHIVES[path]) {
    return {
      source: path,
      category: 'wp_legacy_archive',
      action: 'redirect_308',
      destination: LEGACY_TEAM_ARCHIVES[path],
      note: 'WP archive/index page → team hub equivalent',
    }
  }

  // /<category>/<slug> — treat as a migrated-or-not article path.
  const teamArticle = path.match(/^\/([^/]+)\/([^/]+)\/?$/)
  if (teamArticle && KNOWN_CATEGORIES.has(teamArticle[1])) {
    const cat = teamArticle[1]
    const slug = teamArticle[2]
    if (knownSlugs.has(slug) || knownSlugs.has(`${slug}|${cat}`)) {
      return {
        source: path,
        category: 'wp_team_article',
        action: 'existing',
        destination: path,
        note: 'matching published article already on Next site',
      }
    }
    return {
      source: path,
      category: 'wp_team_article',
      action: 'gone_410',
      destination: '',
      note: 'WP team article — no matching published row, default 410',
    }
  }

  let m = path.match(WP_DATE_RE)
  if (m) {
    const slug = m[2]
    const matched = Array.from(knownSlugs).find(
      (k) => k === slug || k.startsWith(`${slug}|`)
    )
    if (matched) {
      const cat = matched.includes('|') ? matched.split('|')[1] : 'news'
      return {
        source: path,
        category: 'wp_date',
        action: 'redirect_308',
        destination: `/${cat}/${slug}`,
        note: 'WP date URL → migrated article',
      }
    }
    return {
      source: path,
      category: 'wp_date',
      action: 'gone_410',
      destination: '',
      note: 'WP date URL — no matching published article',
    }
  }
  if (WP_DATE_NOSLUG_RE.test(path)) {
    return {
      source: path,
      category: 'wp_date',
      action: 'redirect_308',
      destination: '/',
      note: 'WP year/month index → home',
    }
  }

  m = path.match(TAG_RE)
  if (m) {
    return {
      source: path,
      category: 'wp_tag',
      action: 'gone_410',
      destination: '',
      note: 'WP tag archive — generally noise',
    }
  }

  m = path.match(CAT_RE)
  if (m) {
    return {
      source: path,
      category: 'wp_cat',
      action: 'existing',
      destination: '/',
      note: 'WP category — covered by next.config /category/:path* redirect',
    }
  }

  m = path.match(AUTHOR_RE)
  if (m) {
    return {
      source: path,
      category: 'wp_author',
      action: 'gone_410',
      destination: '',
      note: 'WP author archive — keep only editorial profiles, default 410',
    }
  }

  return {
    source: path,
    category: 'misc',
    action: 'review',
    destination: '',
    note: 'manual review — does not match WP-style pattern',
  }
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

async function main() {
  const parityFile = pickParityFile()
  console.log(`Reading parity report: ${parityFile}`)
  const report: ParityReport = JSON.parse(readFileSync(parityFile, 'utf-8'))
  console.log(`wp_only paths: ${report.wp_only.length}`)

  const knownSlugs = await loadKnownSlugs()
  console.log(`Known published slugs (incl. category-keyed): ${knownSlugs.size}`)

  const entries = report.wp_only.map((p) => categorize(p, knownSlugs))

  const summary: Record<string, Record<string, number>> = {}
  for (const e of entries) {
    summary[e.category] = summary[e.category] || {}
    summary[e.category][e.action] = (summary[e.category][e.action] || 0) + 1
  }

  const auditDir = resolve(process.cwd(), 'audit')
  mkdirSync(auditDir, { recursive: true })
  const date = new Date().toISOString().slice(0, 10)

  const csvHeader = 'source,category,action,destination,note\n'
  const csvBody = entries
    .map(
      (e) =>
        [e.source, e.category, e.action, e.destination, e.note]
          .map(csvEscape)
          .join(',')
    )
    .join('\n')
  const csvPath = resolve(auditDir, `redirect-map-${date}.csv`)
  writeFileSync(csvPath, csvHeader + csvBody + '\n')

  const jsonPath = resolve(auditDir, `redirect-map-${date}.json`)
  writeFileSync(
    jsonPath,
    JSON.stringify(
      { generated_at: new Date().toISOString(), summary, entries },
      null,
      2
    )
  )

  console.log('\n=== Categorization summary ===')
  for (const [cat, actions] of Object.entries(summary)) {
    const parts = Object.entries(actions)
      .map(([a, c]) => `${a}=${c}`)
      .join('  ')
    console.log(`  ${cat.padEnd(12)} ${parts}`)
  }
  console.log(`\nCSV: ${csvPath}`)
  console.log(`JSON: ${jsonPath}`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
