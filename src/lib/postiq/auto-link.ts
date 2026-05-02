import { isBlockContent, parseDocument, serializeDocument } from '@/components/admin/BlockEditor/serializer'
import type { ContentBlock } from '@/components/admin/BlockEditor'

/**
 * PostIQ Auto-Linker (server-side).
 *
 * Walks article HTML and inserts a single internal link the first time each
 * Chicago team or active-roster player is mentioned by full name. Backed by
 * `https://datalab.sportsmockery.com/api/v2/postiq/suggest` (task=auto-link).
 *
 * Spec: docs from sm-data-lab/docs/PostIQ_AutoLinker_Frontend_Guide.md.
 *
 * - Server-side only — never call from the browser. The internal-key header
 *   is a trusted-proxy auth path.
 * - Failure is non-fatal. If the linker is unreachable we return the input
 *   unchanged so publish still goes through.
 * - Idempotent: already-linked text inside `<a>` tags is skipped by the
 *   linker, so re-running doesn't double-link.
 */
const POSTIQ_BASE_URL =
  process.env.POSTIQ_BASE_URL || process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

const AUTO_LINK_TIMEOUT_MS = 8_000

interface AutoLinkOptions {
  userId?: string | null
  /** Override base URL — useful for staging/QA. */
  baseUrl?: string
  /** Class applied to inserted anchors. */
  linkClass?: string
}

/**
 * Auto-link a single HTML string. Returns the linked HTML, or the original
 * string on any failure.
 */
async function autoLinkHtml(html: string, opts: AutoLinkOptions = {}): Promise<string> {
  if (!html || !html.trim()) return html
  if (!process.env.POSTIQ_INTERNAL_KEY) return html

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), AUTO_LINK_TIMEOUT_MS)
  try {
    const res = await fetch(`${POSTIQ_BASE_URL}/api/v2/postiq/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-postiq-internal-key': process.env.POSTIQ_INTERNAL_KEY,
      },
      body: JSON.stringify({
        task: 'auto-link',
        articleContent: html,
        user_id: opts.userId ?? undefined,
        baseUrl: opts.baseUrl,
        linkClass: opts.linkClass ?? 'post-internal-link',
        openInNewTab: false,
      }),
      signal: ctrl.signal,
    })
    if (!res.ok) {
      console.warn('[postiq/auto-link] non-200:', res.status)
      return html
    }
    const data = (await res.json()) as { linkedHtml?: string }
    return typeof data.linkedHtml === 'string' && data.linkedHtml.trim()
      ? data.linkedHtml
      : html
  } catch (err) {
    console.warn('[postiq/auto-link] failed, returning original:', err)
    return html
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Auto-link the body of a post. Accepts either:
 *   - legacy HTML body (string of HTML)
 *   - SM_BLOCKS-wrapped JSON document
 *
 * Returns content in the same shape as it received (HTML stays HTML; block
 * doc stays serialized block doc with each text-bearing block patched).
 */
export async function autoLinkPostContent(
  content: string,
  opts: AutoLinkOptions = {}
): Promise<string> {
  if (!content) return content

  if (!isBlockContent(content)) {
    return autoLinkHtml(content, opts)
  }

  const doc = parseDocument(content)
  if (!doc?.blocks?.length) return content

  // Collect every text-bearing field across the article, send them as ONE
  // joined HTML string with sentinel comments, then split the linked output
  // back into per-block fields. One round-trip preserves the linker's
  // "first mention wins" guarantee across the whole article.
  const SENTINEL = (i: number) => `<!--SM_AL_${i}-->`
  const targets: Array<{ blockIdx: number; field: 'html' | 'text' | 'insight' | 'caption'; value: string }> = []

  doc.blocks.forEach((block, idx) => {
    const fields = textFieldsForBlock(block)
    for (const f of fields) {
      targets.push({ blockIdx: idx, field: f.field, value: f.value })
    }
  })

  if (targets.length === 0) return content

  const joined = targets.map((t, i) => `${SENTINEL(i)}${t.value}`).join('')
  const linkedJoined = await autoLinkHtml(joined, opts)
  if (linkedJoined === joined) return content

  const pieces = splitBySentinels(linkedJoined, targets.length)
  if (!pieces || pieces.length !== targets.length) {
    // Sentinel split failed (shouldn't happen — linker leaves comments alone).
    // Fall back to leaving content unchanged rather than corrupting blocks.
    console.warn('[postiq/auto-link] sentinel split mismatch — skipping patch')
    return content
  }

  const blocks = doc.blocks.map((block, idx) => {
    const updates = targets
      .map((t, i) => ({ ...t, linked: pieces[i] }))
      .filter((t) => t.blockIdx === idx && t.linked !== t.value)
    if (updates.length === 0) return block
    return applyTextFieldUpdates(block, updates)
  })

  return serializeDocument({ ...doc, blocks })
}

/* ---------------- internals ---------------- */

type TextField = 'html' | 'text' | 'insight' | 'caption'

function textFieldsForBlock(
  block: ContentBlock
): Array<{ field: TextField; value: string }> {
  switch (block.type) {
    case 'paragraph':
    case 'analysis':
    case 'tldr':
    case 'key-facts':
    case 'why-it-matters':
    case 'whats-next':
      return block.data.html ? [{ field: 'html', value: block.data.html }] : []
    case 'heading':
      return block.data.text ? [{ field: 'text', value: block.data.text }] : []
    case 'scout-insight':
      return block.data.insight ? [{ field: 'insight', value: block.data.insight }] : []
    case 'hot-take':
    case 'update':
      return block.data.text ? [{ field: 'text', value: block.data.text }] : []
    default:
      return []
  }
}

function applyTextFieldUpdates(
  block: ContentBlock,
  updates: Array<{ field: TextField; linked: string }>
): ContentBlock {
  const next = { ...block, data: { ...block.data } } as ContentBlock
  for (const u of updates) {
    ;(next.data as Record<string, unknown>)[u.field] = u.linked
  }
  return next
}

function splitBySentinels(joined: string, count: number): string[] | null {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    const start = joined.indexOf(`<!--SM_AL_${i}-->`)
    if (start === -1) return null
    const after = start + `<!--SM_AL_${i}-->`.length
    const nextSentinel = i + 1 < count ? joined.indexOf(`<!--SM_AL_${i + 1}-->`, after) : joined.length
    if (nextSentinel === -1) return null
    out.push(joined.slice(after, nextSentinel))
  }
  return out
}
