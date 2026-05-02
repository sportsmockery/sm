/**
 * Tip #18 — pre-launch thin-content candidate list.
 *
 * Read-only scan over sm_posts. For each published article we compute
 * word_count from the structured blocks JSON (or, for legacy WP imports
 * that haven't been re-blocked yet, by stripping HTML from the raw
 * content string). Articles with word_count below WORD_FLOOR are written
 * to audit/thin-content-candidates-{date}.csv sorted by published date,
 * giving editorial a starting list before launch — without GSC clicks
 * data (deferred to post-launch; see docs/seo/thin-content-process.md).
 *
 * Distinct from scripts/flag-thin-articles.ts:
 *   - This script is read-only; flag-thin-articles writes word_count
 *     and needs_expansion back to the DB.
 *   - This script uses a low pre-launch threshold (300) to surface the
 *     "almost certainly should be removed" set, vs the per-type
 *     editorial floors (600+).
 *
 * Usage:
 *   npx tsx scripts/thin-content-analysis.ts
 *   WORD_FLOOR=400 npx tsx scripts/thin-content-analysis.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Optional dotenv — only loaded when present so the script runs in CI
// without requiring an .env file.
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv/config')
} catch {
  /* no env file is fine */
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const WORD_FLOOR = parseInt(process.env.WORD_FLOOR || '300', 10)

const BLOCKS_RE = /<!--\s*SM_BLOCKS\s*-->([\s\S]*?)<!--\s*\/SM_BLOCKS\s*-->/i
const SCOUT_BLOCKS = new Set(['scout-summary', 'scout-recap'])

interface PostRow {
  id: string | number
  slug: string
  title: string | null
  content: string | null
  article_type: string | null
  published_at: string | null
}

function extractBlocks(content: string | null): unknown[] | null {
  if (!content) return null
  const m = content.match(BLOCKS_RE)
  if (!m) return null
  try {
    const parsed = JSON.parse(m[1])
    if (Array.isArray(parsed)) return parsed
    if (parsed && Array.isArray(parsed.blocks)) return parsed.blocks
  } catch {
    return null
  }
  return null
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ')
}

function countWords(value: string): number {
  if (!value) return 0
  const text = stripHtml(value).trim()
  if (!text) return 0
  return text.split(/\s+/).length
}

function countBlockWords(blocks: unknown[]): number {
  let total = 0
  for (const raw of blocks) {
    const b = raw as { type?: string; data?: Record<string, unknown> }
    if (!b?.type || !b.data) continue
    if (SCOUT_BLOCKS.has(b.type)) continue
    const data = b.data
    if (typeof data.html === 'string') total += countWords(data.html)
    else if (typeof data.text === 'string') total += countWords(data.text)
  }
  return total
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Set them or copy .env.example to .env.local.'
    )
    process.exit(1)
  }
  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  console.log(`=== Thin-content analysis (floor: ${WORD_FLOOR} words) ===`)

  const PAGE = 1000
  let from = 0
  const rows: PostRow[] = []
  while (true) {
    const { data, error } = await supabase
      .from('sm_posts')
      .select('id, slug, title, content, article_type, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, from + PAGE - 1)
    if (error) {
      console.error('Supabase error:', error.message)
      process.exit(1)
    }
    if (!data || data.length === 0) break
    rows.push(...(data as PostRow[]))
    if (data.length < PAGE) break
    from += PAGE
  }
  console.log(`Scanned ${rows.length} published posts`)

  type Flagged = {
    id: string | number
    slug: string
    title: string
    type: string
    published_at: string
    word_count: number
  }
  const flagged: Flagged[] = []

  for (const post of rows) {
    const blocks = extractBlocks(post.content)
    const wc = blocks ? countBlockWords(blocks) : countWords(post.content || '')
    if (wc < WORD_FLOOR) {
      flagged.push({
        id: post.id,
        slug: post.slug,
        title: post.title || '',
        type: post.article_type || 'news',
        published_at: post.published_at || '',
        word_count: wc,
      })
    }
  }

  // Sort by published_at ascending so the oldest (most likely to have
  // accumulated noise links) surface first for editorial triage.
  flagged.sort((a, b) => {
    const ad = a.published_at || ''
    const bd = b.published_at || ''
    return ad.localeCompare(bd)
  })

  const auditDir = resolve(process.cwd(), 'audit')
  mkdirSync(auditDir, { recursive: true })
  const date = new Date().toISOString().slice(0, 10)
  const csvPath = resolve(auditDir, `thin-content-candidates-${date}.csv`)

  const header = 'id,slug,article_type,published_at,word_count,title\n'
  const body = flagged
    .map((f) =>
      [f.id, f.slug, f.type, f.published_at, f.word_count, f.title]
        .map((v) => csvEscape(String(v)))
        .join(',')
    )
    .join('\n')
  writeFileSync(csvPath, header + body + '\n')

  console.log(`\n=== Results ===`)
  console.log(`Total scanned:    ${rows.length}`)
  console.log(`Below ${WORD_FLOOR} words: ${flagged.length}`)
  console.log(`CSV written:      ${csvPath}`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
