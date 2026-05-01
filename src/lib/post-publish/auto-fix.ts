import type { AutoFixResult, PreflightInput } from './types'

/**
 * Title auto-formatter — rule #2.
 * Strips trailing ellipsis and converts SHOUTING all-caps to title case.
 */
export function autoFixTitle(input: PreflightInput): AutoFixResult | null {
  const original = input.title
  if (!original) return null

  let next = original
  let changed = false

  // Strip a trailing run of dots / ellipsis characters.
  const trimmed = next.replace(/[\s.…]+$/u, '')
  if (trimmed !== next) {
    next = trimmed
    changed = true
  }

  // Convert all-caps headlines (≥4 letters all upper) to title case.
  const letters = next.replace(/[^A-Za-z]/g, '')
  if (letters.length >= 4 && letters === letters.toUpperCase()) {
    next = toTitleCase(next)
    changed = true
  }

  if (!changed) return null
  return {
    rule: 'title_format',
    note: 'Auto-formatted title.',
    patch: { title: next },
  }
}

/**
 * Slug auto-generator — rule #3.
 * Lowercase, ASCII-fold, kebab-case, drop stop-words, cap to 75 chars.
 * Note: collision suffixing is the publish endpoint's job (it has DB access).
 */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'be', 'but', 'by', 'for', 'from', 'in', 'is',
  'it', 'of', 'on', 'or', 'so', 'than', 'that', 'the', 'to', 'with',
])

export function generateSlugFromTitle(title: string): string {
  if (!title) return ''
  const folded = title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
  const tokens = folded
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t && !STOP_WORDS.has(t))
  let slug = tokens.join('-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  if (slug.length > 75) slug = slug.slice(0, 75).replace(/-[^-]*$/, '') || slug.slice(0, 75)
  return slug
}

export function autoFixSlug(input: PreflightInput): AutoFixResult | null {
  // Only auto-generate when the writer hasn't typed a slug yet. Once a slug
  // is set we leave it alone — collision handling lives in the publish path.
  if (input.slug && input.slug.trim()) return null
  if (!input.title) return null
  const slug = generateSlugFromTitle(input.title)
  if (!slug) return null
  return {
    rule: 'slug_format',
    note: 'Auto-generated slug from title.',
    patch: { slug },
  }
}

/**
 * Mixed-content rewriter — rule #14.
 * Upgrade `http://` to `https://` for asset attributes inside the body HTML.
 * Returns null if the body had nothing to rewrite.
 */
const MIXED_CONTENT_RE = /(\b(?:src|href)\s*=\s*")http:\/\//gi

export function autoFixMixedContent(input: PreflightInput): AutoFixResult | null {
  // Only meaningful for HTML inside paragraph/heading blocks. We rewrite
  // each block's data.html in place rather than serializing → re-parsing.
  const doc = input.document
  if (!doc?.blocks?.length) {
    if (!input.contentHtml) return null
    const updated = input.contentHtml.replace(MIXED_CONTENT_RE, '$1https://')
    if (updated === input.contentHtml) return null
    return {
      rule: 'mixed_content',
      note: 'Auto-upgraded asset URLs to HTTPS.',
      patch: { contentHtml: updated },
    }
  }

  let changedCount = 0
  const blocks = doc.blocks.map((block) => {
    const data = block.data as Record<string, unknown>
    if (typeof data.html === 'string' && MIXED_CONTENT_RE.test(data.html)) {
      MIXED_CONTENT_RE.lastIndex = 0 // reset stateful regex
      const fixed = data.html.replace(MIXED_CONTENT_RE, '$1https://')
      if (fixed !== data.html) {
        changedCount++
        return { ...block, data: { ...data, html: fixed } } as typeof block
      }
    }
    if (block.type === 'image' && block.data.src.startsWith('http://')) {
      changedCount++
      return {
        ...block,
        data: { ...block.data, src: 'https://' + block.data.src.slice('http://'.length) },
      }
    }
    return block
  })

  if (changedCount === 0) return null
  return {
    rule: 'mixed_content',
    note: `Auto-upgraded ${changedCount} URL${changedCount === 1 ? '' : 's'} to HTTPS.`,
    patch: { document: { ...doc, blocks } },
  }
}

/**
 * Heading-quality auto-fix — rule #11.
 * Drops empty heading blocks. Returns null if there were none.
 */
export function autoFixEmptyHeadings(input: PreflightInput): AutoFixResult | null {
  const doc = input.document
  if (!doc?.blocks?.length) return null
  const before = doc.blocks.length
  const filtered = doc.blocks.filter(
    (b) => !(b.type === 'heading' && (!b.data.text || !b.data.text.trim()))
  )
  if (filtered.length === before) return null
  return {
    rule: 'heading_quality',
    note: `Removed ${before - filtered.length} empty heading${before - filtered.length === 1 ? '' : 's'}.`,
    patch: { document: { ...doc, blocks: filtered } },
  }
}

/**
 * Run every auto-fixer in order, threading the patched input through each.
 * Caller is responsible for re-running validators against the final state.
 */
export function runAutoFixers(input: PreflightInput): {
  patched: PreflightInput
  fixes: AutoFixResult[]
} {
  let current = input
  const fixes: AutoFixResult[] = []
  for (const fix of [autoFixTitle, autoFixSlug, autoFixMixedContent, autoFixEmptyHeadings]) {
    const result = fix(current)
    if (result) {
      current = { ...current, ...result.patch }
      fixes.push(result)
    }
  }
  return { patched: current, fixes }
}

/* ---------------- helpers ---------------- */

function toTitleCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    // Keep common acronyms uppercase (cheap pass — we only handle a few).
    .replace(/\b(Nfl|Nba|Nhl|Mlb|Cba|Wbc|Mvp|Gm|Ot|Pf|Pg|Sg|Sf|C)\b/g, (m) => m.toUpperCase())
}
