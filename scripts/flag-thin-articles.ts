/**
 * Flag thin articles for editorial review.
 *
 * Walks all published sm_posts, computes word_count from the block JSON
 * (or falls back to stripping HTML from the raw `content` string for
 * legacy WordPress imports), and sets:
 *
 *   - word_count: integer
 *   - needs_expansion: true when below MIN_WORDS[article_type ?? 'news']
 *   - has_tldr / has_key_facts / has_why_it_matters / has_whats_next:
 *     true when those structured blocks exist with non-empty content
 *
 * Writes a CSV to audit/thin-articles.csv summarizing flagged posts so
 * editorial can prioritize expansion. Idempotent — safe to re-run.
 *
 * Usage:
 *   npx tsx scripts/flag-thin-articles.ts             # live
 *   npx tsx scripts/flag-thin-articles.ts --dry-run   # preview only
 *   npx tsx scripts/flag-thin-articles.ts --limit 50  # cap rows
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const MIN_WORDS: Record<string, number> = {
  news: 600,
  analysis: 1200,
  rumor: 500,
  recap: 700,
  feature: 1000,
}

const SCOUT_BLOCKS = new Set(['scout-summary', 'scout-recap'])

interface PostRow {
  id: string | number
  slug: string
  title: string
  content: string | null
  article_type: string | null
}

const BLOCKS_RE = /<!--\s*SM_BLOCKS\s*-->([\s\S]*?)<!--\s*\/SM_BLOCKS\s*-->/i

function extractBlockJson(content: string | null): unknown[] | null {
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
    else if (typeof (data as { question?: string }).question === 'string')
      total += countWords((data as { question?: string }).question || '')
    else if (typeof (data as { insight?: string }).insight === 'string')
      total += countWords((data as { insight?: string }).insight || '')
  }
  return total
}

function hasNonEmpty(blocks: unknown[], type: string): boolean {
  return blocks.some((raw) => {
    const b = raw as { type?: string; data?: Record<string, unknown> }
    if (b?.type !== type) return false
    const html = (b.data as { html?: string } | undefined)?.html ?? ''
    return html.trim().length > 0
  })
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const limitIdx = args.indexOf('--limit')
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : undefined

  console.log('=== Flag Thin Articles ===')
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`)
  if (limit) console.log(`Limit: ${limit} posts`)

  let query = supabase
    .from('sm_posts')
    .select('id, slug, title, content, article_type')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (limit) query = query.limit(limit)

  const { data: posts, error } = await query
  if (error) {
    console.error('Failed to fetch posts:', error.message)
    process.exit(1)
  }
  if (!posts || posts.length === 0) {
    console.log('No published posts found.')
    return
  }

  console.log(`Scanning ${posts.length} posts\n`)

  const flagged: Array<{
    id: string | number
    slug: string
    title: string
    type: string
    word_count: number
    min: number
    shortfall: number
  }> = []

  let updated = 0
  let alreadyOk = 0

  for (const post of posts as PostRow[]) {
    const blocks = extractBlockJson(post.content)
    let wordCount: number
    let flags = {
      has_tldr: false,
      has_key_facts: false,
      has_why_it_matters: false,
      has_whats_next: false,
    }
    if (blocks) {
      wordCount = countBlockWords(blocks)
      flags = {
        has_tldr: hasNonEmpty(blocks, 'tldr'),
        has_key_facts: hasNonEmpty(blocks, 'key-facts'),
        has_why_it_matters: hasNonEmpty(blocks, 'why-it-matters'),
        has_whats_next: hasNonEmpty(blocks, 'whats-next'),
      }
    } else {
      wordCount = countWords(post.content || '')
    }

    const articleType = (post.article_type as keyof typeof MIN_WORDS) || 'news'
    const min = MIN_WORDS[articleType] ?? MIN_WORDS.news
    const needsExpansion = wordCount < min

    if (needsExpansion) {
      flagged.push({
        id: post.id,
        slug: post.slug,
        title: post.title,
        type: articleType,
        word_count: wordCount,
        min,
        shortfall: min - wordCount,
      })
    } else {
      alreadyOk++
    }

    if (!dryRun) {
      const { error: updateError } = await supabase
        .from('sm_posts')
        .update({
          word_count: wordCount,
          needs_expansion: needsExpansion,
          ...flags,
        })
        .eq('id', post.id)
      if (updateError) {
        console.error(`Update failed for ${post.slug}:`, updateError.message)
      } else {
        updated++
      }
    }
  }

  // Write CSV report
  const auditDir = resolve(process.cwd(), 'audit')
  mkdirSync(auditDir, { recursive: true })
  const csvHeader = 'id,slug,article_type,word_count,min_required,shortfall,title\n'
  const csvBody = flagged
    .map((f) => {
      const safeTitle = `"${f.title.replace(/"/g, '""')}"`
      return `${f.id},${f.slug},${f.type},${f.word_count},${f.min},${f.shortfall},${safeTitle}`
    })
    .join('\n')
  const csvPath = resolve(auditDir, 'thin-articles.csv')
  writeFileSync(csvPath, csvHeader + csvBody + '\n')

  console.log(`\n=== Results ===`)
  console.log(`Total scanned:       ${posts.length}`)
  console.log(`Above minimum:       ${alreadyOk}`)
  console.log(`Below minimum:       ${flagged.length}`)
  console.log(`Updated rows:        ${updated}`)
  console.log(`CSV report:          ${csvPath}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
