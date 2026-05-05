import { supabaseAdmin } from '@/lib/supabase-server'
import { isBlockContent, parseDocument } from '@/components/admin/BlockEditor/serializer'
import type { FAQItem } from '@/lib/seo/schema/faq-page'

/**
 * Article FAQ resolution.
 *
 * Priority order:
 *   1. Cached `sm_posts.faq_json` (set by a previous run, or written by editors).
 *   2. FAQ blocks in the BlockEditor document — explicit, writer-authored Q&A.
 *   3. AI-generated via Scout (DataLab) — only when nothing else is available.
 *
 * Result is persisted back to `sm_posts.faq_json` so the model is called at
 * most once per article. `[]` means "we tried and there's nothing eligible";
 * `null` means "not yet attempted".
 *
 * Google's FAQPage rich result requires ≥3 Q&A pairs, so we ask the model for
 * 5 and only emit JSON-LD when there are at least 3.
 */

const DATALAB_API_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

const MIN_ITEMS_FOR_RICH_RESULT = 3

export interface ArticleFaqInput {
  id: number
  title: string
  content: string | null
}

/** Strip HTML tags and collapse whitespace for the model prompt. */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** Pull writer-authored FAQ blocks out of a BlockEditor document. */
export function extractFaqsFromBlocks(content: string | null | undefined): FAQItem[] {
  if (!content || !isBlockContent(content)) return []
  const doc = parseDocument(content)
  if (!doc) return []
  const items: FAQItem[] = []
  for (const block of doc.blocks) {
    if (block.type !== 'faq') continue
    const blockItems = (block.data as { items?: { question?: string; answer?: string }[] })?.items || []
    for (const item of blockItems) {
      const q = (item.question || '').trim()
      const a = (item.answer || '').trim()
      if (q && a) items.push({ question: q, answer: a })
    }
  }
  return items
}

interface ScoutFaqResponse {
  items: Array<{ question?: string; answer?: string }>
}

/**
 * Ask Scout (DataLab) to generate 5 FAQ pairs for an article. Per project
 * rule, all AI work routes through Scout — we ask for strict JSON so the
 * response is parseable.
 */
async function generateFaqsViaScout(input: ArticleFaqInput): Promise<FAQItem[]> {
  const plain = htmlToPlainText(input.content || '').slice(0, 6000)
  if (plain.length < 400) return [] // Article too short to support a useful FAQ.

  const prompt = `You are generating an FAQ section for a Chicago sports article. Return STRICT JSON only — no prose, no code fences. Schema: {"items":[{"question":"...","answer":"..."}]}. Provide exactly 5 frequently-asked-questions a reader would search for after reading this article. Questions must be natural-language, complete, and end with a question mark. Answers must be 1–3 sentences, factual, and grounded in the article (no speculation, no marketing fluff). Do NOT include URLs.\n\nArticle title: ${input.title}\n\nArticle:\n${plain}`

  let response: Response
  try {
    response = await fetch(`${DATALAB_API_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'sportsmockery.com',
      },
      body: JSON.stringify({ query: prompt }),
      // 20s budget — Scout responses for short prompts typically return in ~5–8s.
      signal: AbortSignal.timeout(20_000),
    })
  } catch (err) {
    console.error('[articleFaq] Scout fetch failed', err)
    return []
  }

  if (!response.ok) {
    console.error('[articleFaq] Scout returned', response.status)
    return []
  }

  let raw: string
  try {
    const data = (await response.json()) as { response?: string }
    raw = data.response || ''
  } catch {
    return []
  }

  // Scout sometimes wraps JSON in code fences or adds intro text; carve out
  // the first balanced {...} block.
  const jsonStart = raw.indexOf('{')
  const jsonEnd = raw.lastIndexOf('}')
  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) return []
  const jsonSlice = raw.slice(jsonStart, jsonEnd + 1)

  let parsed: ScoutFaqResponse
  try {
    parsed = JSON.parse(jsonSlice) as ScoutFaqResponse
  } catch (err) {
    console.error('[articleFaq] Scout JSON parse failed', err)
    return []
  }

  const items = (parsed.items || [])
    .map((it) => ({
      question: (it.question || '').trim(),
      answer: (it.answer || '').trim(),
    }))
    .filter((it): it is FAQItem => it.question.length > 0 && it.answer.length > 0)
    // Cap at 5 — keeps both the visible accordion and JSON-LD payload tight.
    .slice(0, 5)

  return items
}

/** Persist FAQs back to sm_posts.faq_json. Best-effort; never throws. */
async function cacheFaqs(postId: number, items: FAQItem[]): Promise<void> {
  try {
    await supabaseAdmin
      .from('sm_posts')
      .update({ faq_json: items })
      .eq('id', postId)
  } catch (err) {
    console.error('[articleFaq] cache write failed', err)
  }
}

export interface ResolveFaqsOptions {
  /** When true (default), generate via Scout if neither cache nor blocks have FAQs. */
  generateIfMissing?: boolean
  /** Pre-loaded faq_json from sm_posts (skip DB read when caller already has it). */
  cachedFaqJson?: unknown
}

/**
 * Resolve the FAQs for an article: cache → blocks → AI. Persists the result
 * so the next request is instant.
 */
export async function resolveArticleFaqs(
  post: ArticleFaqInput,
  options: ResolveFaqsOptions = {}
): Promise<FAQItem[]> {
  const { generateIfMissing = true } = options

  // 1) Cached value.
  let cached: unknown = options.cachedFaqJson
  if (cached === undefined) {
    try {
      const { data } = await supabaseAdmin
        .from('sm_posts')
        .select('faq_json')
        .eq('id', post.id)
        .single()
      cached = data?.faq_json
    } catch {
      cached = null
    }
  }

  if (Array.isArray(cached) && cached.length > 0) {
    return (cached as FAQItem[]).filter(
      (it) => it && typeof it.question === 'string' && typeof it.answer === 'string'
    )
  }
  if (Array.isArray(cached) && cached.length === 0) {
    // Previously evaluated and intentionally empty — don't re-run the model.
    return []
  }

  // 2) Block-content FAQs (writer-authored).
  const fromBlocks = extractFaqsFromBlocks(post.content)
  if (fromBlocks.length > 0) {
    await cacheFaqs(post.id, fromBlocks)
    return fromBlocks
  }

  // 3) AI generation (cache the empty result too so we don't spin on every load).
  if (!generateIfMissing) return []
  const generated = await generateFaqsViaScout(post)
  await cacheFaqs(post.id, generated)
  return generated
}

/**
 * Returns the resolved FAQs alongside an "eligibleForRichResult" flag — the
 * Google FAQPage rich result requires at least 3 Q&A pairs, so we render the
 * JSON-LD only when that threshold is met. The visible accordion always
 * renders if there's at least one item.
 */
export async function getArticleFaqsForRender(
  post: ArticleFaqInput,
  options: ResolveFaqsOptions = {}
): Promise<{ items: FAQItem[]; eligibleForRichResult: boolean }> {
  const items = await resolveArticleFaqs(post, options)
  return {
    items,
    eligibleForRichResult: items.length >= MIN_ITEMS_FOR_RICH_RESULT,
  }
}

export const FAQ_MIN_ITEMS_FOR_RICH_RESULT = MIN_ITEMS_FOR_RICH_RESULT
