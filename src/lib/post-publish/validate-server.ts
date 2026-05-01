import type { SupabaseClient } from '@supabase/supabase-js'
import { runPreflight } from './validate'
import { countWordsInText, getBodyText } from './normalize'
import type {
  AutoFixResult,
  CheckResult,
  PreflightInput,
  PreflightResponse,
} from './types'

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
const SHINGLE_SIZE = 5
const SIMILARITY_THRESHOLD = 0.85

/**
 * Server-side wrapper around the pure preflight pipeline. Adds the checks
 * that need DB access:
 *   - slug uniqueness (rule #3, beyond shape)
 *   - duplicate body via 5-word-shingle Jaccard vs published posts in the
 *     same category within the last 90 days (rule #15)
 *
 * Broken-link HEAD checks are deferred — they need a careful fetch budget
 * and only run on actual publish, not on every preflight.
 */
export async function runPublishGate(
  input: PreflightInput,
  ctx: { supabase: SupabaseClient }
): Promise<{
  response: PreflightResponse
  patched: PreflightInput
  fixes: AutoFixResult[]
}> {
  const { response: pre, patched, fixes } = runPreflight(input)
  const upgraded: CheckResult[] = []

  for (const check of pre.checks) {
    if (check.rule === 'slug_format' && check.passed) {
      upgraded.push(await uniqueSlugCheck(patched, ctx.supabase))
    } else if (check.rule === 'duplicate_body' && check.passed) {
      upgraded.push(await duplicateBodyCheck(patched, ctx.supabase))
    } else {
      upgraded.push(check)
    }
  }

  const passed = upgraded.filter((c) => c.passed).length
  return {
    response: {
      ready: passed === upgraded.length,
      passed,
      total: upgraded.length,
      word_count: pre.word_count,
      checks: upgraded,
      auto_fixed: pre.auto_fixed,
    },
    patched,
    fixes,
  }
}

async function uniqueSlugCheck(
  input: PreflightInput,
  supabase: SupabaseClient
): Promise<CheckResult> {
  const slug = (input.slug || '').trim().toLowerCase()
  if (!slug) return { rule: 'slug_format', passed: true }

  let query = supabase
    .from('sm_posts')
    .select('id')
    .ilike('slug', slug)
    .eq('status', 'published')
    .limit(1)
  if (input.postId) {
    query = query.neq('id', input.postId)
  }
  const { data, error } = await query
  if (error) {
    console.error('[publish-gate] slug uniqueness query failed:', error)
    return { rule: 'slug_format', passed: true }
  }
  if (!data || data.length === 0) return { rule: 'slug_format', passed: true }
  return {
    rule: 'slug_format',
    passed: false,
    what_failed: `Slug "${slug}" is already used by a published post.`,
    why_it_matters: 'Two posts cannot share a URL — Google would index whichever loads first and ignore the other.',
    how_to_fix: ['Edit the slug to something unique (the auto-generator can suggest a variant).'],
    anchor: '#slug',
  }
}

async function duplicateBodyCheck(
  input: PreflightInput,
  supabase: SupabaseClient
): Promise<CheckResult> {
  const text = getBodyText(input)
  const wc = countWordsInText(text)
  // Skip duplicate detection on tiny drafts — under 200 words there's no
  // reliable signal and the false-positive rate is high.
  if (wc < 200) return { rule: 'duplicate_body', passed: true }

  const since = new Date(Date.now() - NINETY_DAYS_MS).toISOString()
  let query = supabase
    .from('sm_posts')
    .select('id, title, content, slug, published_at')
    .eq('status', 'published')
    .gte('published_at', since)
    .limit(50)
  if (input.categoryId) {
    query = query.eq('category_id', input.categoryId)
  }
  if (input.postId) {
    query = query.neq('id', input.postId)
  }

  const { data, error } = await query
  if (error) {
    console.error('[publish-gate] duplicate-body query failed:', error)
    return { rule: 'duplicate_body', passed: true }
  }
  if (!data?.length) return { rule: 'duplicate_body', passed: true }

  const draftShingles = shingles(text)
  if (draftShingles.size < 10) return { rule: 'duplicate_body', passed: true }

  for (const post of data) {
    const otherText = stripHtmlServerSide(String(post.content || ''))
    const otherShingles = shingles(otherText)
    if (otherShingles.size < 10) continue
    const sim = jaccard(draftShingles, otherShingles)
    if (sim >= SIMILARITY_THRESHOLD) {
      const pct = Math.round(sim * 100)
      const date = post.published_at
        ? new Date(post.published_at).toLocaleDateString('en-US')
        : 'a recent date'
      return {
        rule: 'duplicate_body',
        passed: false,
        what_failed: `This article is ${pct}% similar to "${post.title}" (published ${date}).`,
        why_it_matters:
          'Near-duplicate posts compete with each other for the same query and dilute authority across both URLs.',
        how_to_fix: [
          'Substantially rewrite the lede and the analysis sections.',
          `Or update "${post.title}" instead of publishing this draft.`,
        ],
        anchor: '#body-start',
      }
    }
  }
  return { rule: 'duplicate_body', passed: true }
}

/* ---------------- shingle helpers ---------------- */

function shingles(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  const out = new Set<string>()
  for (let i = 0; i + SHINGLE_SIZE <= tokens.length; i++) {
    out.add(tokens.slice(i, i + SHINGLE_SIZE).join(' '))
  }
  return out
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  const union = a.size + b.size - inter
  return union === 0 ? 0 : inter / union
}

function stripHtmlServerSide(html: string): string {
  if (!html) return ''
  // If the stored content is the SM_BLOCKS marker, parse blocks out first.
  // Otherwise treat as legacy HTML.
  const trimmed = html.trim()
  if (trimmed.startsWith('<!-- SM_BLOCKS -->')) {
    try {
      const json = trimmed
        .replace('<!-- SM_BLOCKS -->', '')
        .replace('<!-- /SM_BLOCKS -->', '')
        .trim()
      const doc = JSON.parse(json) as { blocks?: { data?: Record<string, unknown> }[] }
      const parts: string[] = []
      for (const b of doc.blocks || []) {
        const data = b.data as Record<string, unknown> | undefined
        if (!data) continue
        if (typeof data.html === 'string') parts.push(stripTags(data.html))
        else if (typeof data.text === 'string') parts.push(stripTags(data.text))
      }
      return parts.join(' ').trim()
    } catch {
      return stripTags(html)
    }
  }
  return stripTags(html)
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
