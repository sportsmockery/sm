import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase-server'
import { isBlockContent, parseDocument } from '@/components/admin/BlockEditor/serializer'
import type { FAQItem } from '@/lib/seo/schema/faq-page'

/**
 * Article FAQ resolution.
 *
 * Priority order:
 *   1. Cached `sm_posts.faq_json` (set by a previous run, or written by editors).
 *   2. FAQ blocks in the BlockEditor document — explicit, writer-authored Q&A.
 *   3. AI-generated via Claude Sonnet (PostIQ pattern — same model and SDK
 *      already used for headlines/seo/toc/poll generation).
 *
 * Result is persisted back to `sm_posts.faq_json` so the model is called at
 * most once per article. `[]` means "we tried and there's nothing eligible";
 * `null` means "not yet attempted".
 *
 * Google's FAQPage rich result requires ≥3 Q&A pairs, so we ask the model for
 * 5 and only emit JSON-LD when there are at least 3.
 *
 * NB: Scout (DataLab `/api/query`) is a sports stats Q&A model — when fed a
 * "generate JSON FAQs" prompt it responds conversationally and refuses, which
 * is why this helper does NOT route through Scout.
 */

const MIN_ITEMS_FOR_RICH_RESULT = 3

const anthropic = new Anthropic()

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

/**
 * Pull readable prose from either WordPress HTML or BlockEditor JSON content.
 * For block content, we walk paragraph/subheading/list/quote blocks (where
 * the actual prose lives) and concat their HTML, then strip tags. Anything
 * that fails to parse falls through to plain HTML stripping.
 */
function extractArticleProse(content: string | null | undefined): string {
  if (!content) return ''
  if (isBlockContent(content)) {
    try {
      const doc = parseDocument(content)
      if (doc) {
        const buf: string[] = []
        for (const block of doc.blocks) {
          const data = block.data as { html?: string; text?: string; items?: unknown }
          const text = data?.html || data?.text
          if (typeof text === 'string' && text.trim()) {
            buf.push(text)
          }
        }
        if (buf.length > 0) return htmlToPlainText(buf.join(' \n '))
      }
    } catch {
      // fall through to raw stripping
    }
  }
  return htmlToPlainText(content)
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

interface ModelFaqResponse {
  items?: Array<{ question?: string; answer?: string }>
}

/** Pull a JSON object out of model output — handles bare JSON, fenced JSON,
 *  or prose with a JSON object inside. Mirrors the PostIQ extractor. */
function extractJsonObject(text: string): string | null {
  if (!text) return null
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) return fenced[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  return text.slice(start, end + 1)
}

/**
 * Ask Claude Sonnet to generate 5 FAQ pairs for an article. Mirrors the
 * existing PostIQ pattern (`generateTOC`, `generateHeadlines`, etc.) — same
 * SDK, same model, same JSON-extraction style.
 */
async function generateFaqsViaPostIQ(input: ArticleFaqInput): Promise<FAQItem[]> {
  const plain = extractArticleProse(input.content).slice(0, 6000)
  if (plain.length < 400) return [] // Article too short to support a useful FAQ.

  const prompt = `You are generating an FAQ section for a Chicago sports article on SportsMockery. Return STRICT JSON only — no prose, no code fences.

Schema:
{"items":[{"question":"...","answer":"..."}]}

Generate exactly 5 frequently-asked-questions a reader would Google after reading this article. Rules:
- Questions are natural-language, complete, end with a question mark
- Questions are *answered* by content in the article — do not invent facts
- Answers are 1–3 sentences, factual, grounded in the article, no speculation
- No URLs, no marketing fluff, no "according to the article"
- Use fan-friendly Chicago sports voice

Article title: ${input.title}

Article:
${plain}

Return ONLY the JSON object.`

  let responseText = ''
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })
    responseText = message.content[0]?.type === 'text' ? message.content[0].text : ''
  } catch (err) {
    console.error('[articleFaq] Anthropic call failed', err)
    return []
  }

  const jsonText = extractJsonObject(responseText)
  if (!jsonText) {
    console.error('[articleFaq] no JSON in model output', responseText.slice(0, 200))
    return []
  }

  let parsed: ModelFaqResponse
  try {
    parsed = JSON.parse(jsonText) as ModelFaqResponse
  } catch (err) {
    console.error('[articleFaq] JSON parse failed', err, jsonText.slice(0, 200))
    return []
  }

  return (parsed.items || [])
    .map((it) => ({
      question: (it.question || '').trim(),
      answer: (it.answer || '').trim(),
    }))
    .filter((it): it is FAQItem => it.question.length > 0 && it.answer.length > 0)
    .slice(0, 5)
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
  const generated = await generateFaqsViaPostIQ(post)
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
