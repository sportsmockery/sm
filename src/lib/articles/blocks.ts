import type {
  ArticleDocument,
  BlockType,
  ContentBlock,
} from '@/components/admin/BlockEditor'

/**
 * Per-type minimum word counts (HCU compliance — see CLAUDE_INSTRUCTIONS).
 * Soft gate first 2 weeks, then flip to hard once editorial reviews override frequency.
 */
export const MIN_WORDS: Record<ArticleType, number> = {
  news: 600,
  analysis: 1200,
  rumor: 500,
  recap: 700,
  feature: 1000,
}

export type ArticleType = 'news' | 'analysis' | 'rumor' | 'recap' | 'feature'

export const ARTICLE_TYPES: ArticleType[] = ['news', 'analysis', 'rumor', 'recap', 'feature']

const HTML_TAG_REGEX = /<[^>]+>/g

function stripHtml(value: string): string {
  return value.replace(HTML_TAG_REGEX, ' ').replace(/&[a-z]+;/gi, ' ')
}

function countWordsInString(value: string): number {
  if (!value) return 0
  const text = stripHtml(value).trim()
  if (!text) return 0
  return text.split(/\s+/).length
}

/**
 * Counts words across all content blocks. Skips Scout-generated blocks
 * (summary/recap) — those don't count toward the human-written floor.
 */
export function countWords(blocks: ContentBlock[]): number {
  let total = 0
  for (const block of blocks) {
    if (block.type === 'scout-summary' || block.type === 'scout-recap') continue
    const data = block.data as Record<string, unknown>
    if (typeof data.html === 'string') total += countWordsInString(data.html)
    else if (typeof data.text === 'string') total += countWordsInString(data.text)
    else if (typeof (data as { question?: string }).question === 'string')
      total += countWordsInString((data as { question?: string }).question || '')
    else if (typeof (data as { insight?: string }).insight === 'string')
      total += countWordsInString((data as { insight?: string }).insight || '')
  }
  return total
}

export interface StructuredFlags {
  has_tldr: boolean
  has_key_facts: boolean
  has_why_it_matters: boolean
  has_whats_next: boolean
}

const STRUCTURED_TYPES: Record<keyof StructuredFlags, BlockType> = {
  has_tldr: 'tldr',
  has_key_facts: 'key-facts',
  has_why_it_matters: 'why-it-matters',
  has_whats_next: 'whats-next',
}

export function extractStructuredFlags(blocks: ContentBlock[]): StructuredFlags {
  const flags: StructuredFlags = {
    has_tldr: false,
    has_key_facts: false,
    has_why_it_matters: false,
    has_whats_next: false,
  }
  const presentTypes = new Set(blocks.map((b) => b.type))
  for (const [flag, blockType] of Object.entries(STRUCTURED_TYPES) as Array<
    [keyof StructuredFlags, BlockType]
  >) {
    if (!presentTypes.has(blockType)) continue
    const block = blocks.find(
      (b) =>
        b.type === blockType &&
        typeof (b.data as { html?: string }).html === 'string' &&
        ((b.data as { html?: string }).html || '').trim().length > 0
    )
    flags[flag] = Boolean(block)
  }
  return flags
}

export interface WordCountStatus {
  wordCount: number
  minWords: number
  meetsMinimum: boolean
  shortfall: number
  flags: StructuredFlags
  articleType: ArticleType
}

export function computeStatus(
  blocks: ContentBlock[],
  articleType: ArticleType = 'news'
): WordCountStatus {
  const wordCount = countWords(blocks)
  const minWords = MIN_WORDS[articleType]
  const flags = extractStructuredFlags(blocks)
  return {
    wordCount,
    minWords,
    meetsMinimum: wordCount >= minWords,
    shortfall: Math.max(0, minWords - wordCount),
    flags,
    articleType,
  }
}

/**
 * Default seeded document for new posts (gated on NEXT_PUBLIC_SEED_DEFAULT_BLOCKS=true).
 * Provides the editorial structure scaffold — TL;DR, body, Key Facts, Why It Matters,
 * What's Next. The writer fills the empty slots; Scout produces the summary later.
 */
export function buildDefaultArticleDocument(): ArticleDocument {
  const id = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `block-${Math.random().toString(36).slice(2)}`

  return {
    version: 1,
    template: 'standard-news',
    blocks: [
      { id: id(), type: 'tldr', data: { html: '' } },
      { id: id(), type: 'paragraph', data: { html: '' } },
      { id: id(), type: 'key-facts', data: { html: '' } },
      { id: id(), type: 'paragraph', data: { html: '' } },
      { id: id(), type: 'why-it-matters', data: { html: '' } },
      { id: id(), type: 'paragraph', data: { html: '' } },
      { id: id(), type: 'whats-next', data: { html: '' } },
    ],
  }
}
