/**
 * Post Transformation Pipeline
 *
 * Converts raw WordPress HTML content into structured ArticleDocument
 * block format. Reusable for both batch transforms and on-import hooks.
 *
 * Flow: Raw HTML (sm_posts.content) → parse → ContentBlock[] → ArticleDocument JSON
 */

import type { ContentBlock, ArticleDocument } from '@/components/admin/BlockEditor/types'

// ─── Category → Team mapping ───

const CATEGORY_TEAM_MAP: Record<number, { name: string; id: string; color: string }> = {
  1: { name: 'Bears', id: 'bears', color: '#0B162A' },
  2: { name: 'Blackhawks', id: 'blackhawks', color: '#CF0A2C' },
  3: { name: 'Bulls', id: 'bulls', color: '#CE1141' },
  4: { name: 'Cubs', id: 'cubs', color: '#0E3386' },
  6: { name: 'White Sox', id: 'whitesox', color: '#27251F' },
}

export function getTeamFromCategory(categoryId: number | null): { name: string; id: string; color: string } | null {
  if (!categoryId) return null
  return CATEGORY_TEAM_MAP[categoryId] || null
}

// ─── HTML Parsing Utilities ───

/** Strip HTML tags and decode common entities */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

/** Count words in plain text */
function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

/** Generate a stable block ID */
function blockId(prefix: string, index: number): string {
  return `${prefix}-${index}-${Date.now().toString(36)}`
}

// ─── Core HTML → Blocks Parser ───

interface ParsedElement {
  tag: string
  content: string
  rawHtml: string
}

/**
 * Parse WordPress HTML into semantic elements.
 * WP content uses <!-- wp:paragraph --> comments wrapping standard HTML.
 */
function parseWpHtml(html: string): ParsedElement[] {
  const elements: ParsedElement[] = []

  // Strip WP block comments
  const cleaned = html.replace(/<!--\s*\/?wp:\w[\w-]*(?:\s+\{[^}]*\})?\s*-->/g, '').trim()

  // Split on major block-level elements
  const blockRegex = /<(p|h[1-6]|blockquote|ul|ol|figure|img)[^>]*>([\s\S]*?)<\/\1>|<(img)\s+[^>]*\/?>/gi
  let match: RegExpExecArray | null

  while ((match = blockRegex.exec(cleaned)) !== null) {
    const tag = (match[1] || match[3] || 'p').toLowerCase()
    const content = match[2] || ''
    const rawHtml = match[0]

    // Skip empty paragraphs
    if (tag === 'p' && !stripHtml(content).trim()) continue

    elements.push({ tag, content, rawHtml })
  }

  // If regex parsing yielded nothing (malformed HTML), fall back to splitting on <p> tags
  if (elements.length === 0 && cleaned.length > 0) {
    const pSplit = cleaned.split(/<\/?p[^>]*>/i).filter(s => stripHtml(s).trim())
    pSplit.forEach((text, i) => {
      elements.push({ tag: 'p', content: text.trim(), rawHtml: `<p>${text.trim()}</p>` })
    })
  }

  return elements
}

/**
 * Extract a direct quote from blockquote or from content patterns.
 * Looks for blockquote elements or common quote patterns like "..." said X.
 */
function extractQuotes(elements: ParsedElement[]): { text: string; speaker: string }[] {
  const quotes: { text: string; speaker: string }[] = []

  for (const el of elements) {
    if (el.tag === 'blockquote') {
      const text = stripHtml(el.content)
      if (text.length > 10) {
        quotes.push({ text, speaker: '' })
      }
    }
  }

  // Look for inline quote patterns: "..." said/according to X
  for (const el of elements) {
    if (el.tag !== 'p') continue
    const plain = stripHtml(el.content)
    const quoteMatch = plain.match(/["\u201C]([^"\u201D]{20,})["\u201D]\s*(?:said|according to|per|told)\s+([^.]+)/i)
    if (quoteMatch && !quotes.some(q => q.text === quoteMatch[1])) {
      quotes.push({ text: quoteMatch[1].trim(), speaker: quoteMatch[2].trim() })
    }
  }

  return quotes.slice(0, 2) // Max 2 quotes per article
}

/**
 * Extract list/bullet items from ul/ol elements.
 */
function extractLists(elements: ParsedElement[]): string[][] {
  const lists: string[][] = []

  for (const el of elements) {
    if (el.tag === 'ul' || el.tag === 'ol') {
      const items: string[] = []
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
      let liMatch: RegExpExecArray | null
      while ((liMatch = liRegex.exec(el.content)) !== null) {
        const text = stripHtml(liMatch[1]).trim()
        if (text) items.push(text)
      }
      if (items.length > 0) lists.push(items)
    }
  }

  return lists
}

// ─── Key Takeaways Generator ───

/**
 * Generate 3 key takeaways from article content.
 * Grounded in actual content — extracts the most informative sentences.
 */
function generateKeyTakeaways(plainText: string, title: string): string[] {
  // Split into sentences
  const sentences = plainText
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 250)

  if (sentences.length < 3) return []

  // Score sentences by informativeness
  const scored = sentences.map(sentence => {
    let score = 0
    // Prefer sentences with numbers/stats
    if (/\d+/.test(sentence)) score += 3
    // Prefer sentences with strong signal words
    if (/key|important|significant|major|critical|notably|reportedly|according|sources/i.test(sentence)) score += 2
    // Prefer mid-article sentences (not opening fluff)
    const idx = sentences.indexOf(sentence)
    if (idx > 1 && idx < sentences.length - 1) score += 1
    // Penalize very short sentences
    if (sentence.length < 50) score -= 1
    // Penalize sentences that are just the title restated
    const titleWords = title.toLowerCase().split(/\s+/)
    const overlap = titleWords.filter(w => w.length > 3 && sentence.toLowerCase().includes(w)).length
    if (overlap > titleWords.length * 0.7) score -= 3
    return { sentence, score }
  })

  // Sort by score, take top 3, maintaining document order
  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 6) // Take top 6 candidates
    .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence)) // Restore order
    .slice(0, 3) // Take first 3 in order

  return top.map(t => t.sentence)
}

// ─── Main Transform Function ───

export interface TransformResult {
  /** Structured article document (JSON) to store in sm_posts.content */
  document: ArticleDocument
  /** Auto-generated excerpt if post has none */
  excerpt: string
  /** Key takeaways (empty array if <250 words) */
  keyTakeaways: string[]
  /** Word count of original content */
  wordCount: number
}

/**
 * Transform raw WordPress HTML content into structured ArticleDocument.
 *
 * @param rawContent - The raw HTML content from sm_posts.content
 * @param title - The post title (used for takeaway deduplication)
 * @returns TransformResult with document, excerpt, and takeaways
 */
export function transformPostContent(rawContent: string, title: string): TransformResult {
  const elements = parseWpHtml(rawContent)
  const plainText = elements.map(el => stripHtml(el.content)).join(' ')
  const totalWords = wordCount(plainText)
  const blocks: ContentBlock[] = []
  let blockIndex = 0

  // Track which elements are special (quotes, lists) to avoid duplication
  const quotesFound = extractQuotes(elements)
  const listsFound = extractLists(elements)
  let quoteInserted = false
  let listInsertIndex = 0

  // ── Build blocks ──

  // Separate intro paragraphs (first 1-2) from body
  const paragraphs = elements.filter(el => el.tag === 'p')
  const introCount = Math.min(paragraphs.length <= 3 ? 1 : 2, paragraphs.length)
  let paragraphIndex = 0

  for (const el of elements) {
    switch (el.tag) {
      case 'p': {
        const text = stripHtml(el.content).trim()
        if (!text) break

        // Keep anchor tags and basic formatting in paragraphs
        const html = el.content
          .replace(/<a\s+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '<a href="$1">$2</a>')
          .trim()

        blocks.push({
          id: blockId('p', blockIndex++),
          type: 'paragraph',
          data: { html },
        } as ContentBlock)

        paragraphIndex++

        // Insert quote after 2nd or 3rd paragraph if we have one
        if (!quoteInserted && quotesFound.length > 0 && paragraphIndex === Math.min(3, paragraphs.length)) {
          const q = quotesFound[0]
          blocks.push({
            id: blockId('quote', blockIndex++),
            type: 'quote',
            data: { text: q.text, speaker: q.speaker, team: '' },
          } as ContentBlock)
          quoteInserted = true
        }

        // Insert list block if we have lists, after ~60% of paragraphs
        if (listsFound.length > listInsertIndex && paragraphIndex === Math.ceil(paragraphs.length * 0.6)) {
          const items = listsFound[listInsertIndex]
          // Encode list as a paragraph with HTML list
          blocks.push({
            id: blockId('list', blockIndex++),
            type: 'paragraph',
            data: { html: '<ul>' + items.map(item => `<li>${item}</li>`).join('') + '</ul>' },
          } as ContentBlock)
          listInsertIndex++
        }
        break
      }

      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': {
        const text = stripHtml(el.content).trim()
        if (!text) break
        const level = Math.max(2, Math.min(4, parseInt(el.tag[1]))) as 2 | 3 | 4
        blocks.push({
          id: blockId('h', blockIndex++),
          type: 'heading',
          data: { text, level },
        } as ContentBlock)
        break
      }

      case 'blockquote': {
        // Already handled via extractQuotes insertion
        break
      }

      case 'ul':
      case 'ol': {
        // Already handled via extractLists insertion
        break
      }

      case 'figure':
      case 'img': {
        // Extract image src from figure or img tag
        const srcMatch = el.rawHtml.match(/src="([^"]+)"/i)
        const altMatch = el.rawHtml.match(/alt="([^"]*)"?/i)
        const captionMatch = el.rawHtml.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i)

        if (srcMatch) {
          blocks.push({
            id: blockId('img', blockIndex++),
            type: 'image',
            data: {
              src: srcMatch[1],
              alt: altMatch ? stripHtml(altMatch[1]) : '',
              caption: captionMatch ? stripHtml(captionMatch[1]) : undefined,
            },
          } as ContentBlock)
        }
        break
      }
    }
  }

  // If no blocks were generated, create a single paragraph from raw text
  if (blocks.length === 0 && plainText.trim()) {
    blocks.push({
      id: blockId('p', 0),
      type: 'paragraph',
      data: { html: `<p>${plainText}</p>` },
    } as ContentBlock)
  }

  // ── Generate key takeaways (only for 250+ word articles) ──
  const keyTakeaways = totalWords >= 250 ? generateKeyTakeaways(plainText, title) : []

  // If we have takeaways, insert them as a heading + paragraph after the intro
  if (keyTakeaways.length === 3) {
    const takeawayBlocks: ContentBlock[] = [
      {
        id: blockId('h-takeaway', blockIndex++),
        type: 'heading',
        data: { text: 'Key Takeaways', level: 3 },
      } as ContentBlock,
      {
        id: blockId('takeaways', blockIndex++),
        type: 'paragraph',
        data: {
          html: '<ul>' + keyTakeaways.map(t => `<li>${t}</li>`).join('') + '</ul>',
        },
      } as ContentBlock,
    ]
    // Insert after intro paragraphs (position 2 typically)
    const insertAt = Math.min(introCount, blocks.length)
    blocks.splice(insertAt, 0, ...takeawayBlocks)
  }

  // ── Build excerpt ──
  const excerptText = plainText.slice(0, 160).trimEnd()
  const excerpt = excerptText.length < plainText.length ? excerptText + '...' : excerptText

  // ── Assemble document ──
  const document: ArticleDocument = {
    version: 1,
    template: 'standard-news',
    blocks,
  }

  return { document, excerpt, keyTakeaways, wordCount: totalWords }
}

// ─── Batch Transform Helper ───

export interface PostToTransform {
  id: number | string
  title: string
  content: string
  excerpt: string | null
  slug: string
  featured_image: string | null
  category_id: number | null
  published_at: string | null
}

export interface TransformedPost {
  id: number | string
  content: string // JSON stringified ArticleDocument
  excerpt: string
  template_version: number
  keyTakeaways: string[]
  wordCount: number
}

/**
 * Transform a batch of posts. Safe — never throws on individual failures.
 */
export function transformPosts(posts: PostToTransform[]): { transformed: TransformedPost[]; errors: { id: number | string; error: string }[] } {
  const transformed: TransformedPost[] = []
  const errors: { id: number | string; error: string }[] = []

  for (const post of posts) {
    try {
      // Skip posts that already have JSON block content
      if (post.content.trim().startsWith('{') && post.content.includes('"version"')) {
        errors.push({ id: post.id, error: 'Already transformed (JSON content detected)' })
        continue
      }

      const result = transformPostContent(post.content, post.title)

      transformed.push({
        id: post.id,
        content: JSON.stringify(result.document),
        excerpt: post.excerpt || result.excerpt,
        template_version: 1,
        keyTakeaways: result.keyTakeaways,
        wordCount: result.wordCount,
      })
    } catch (err) {
      errors.push({
        id: post.id,
        error: err instanceof Error ? err.message : 'Unknown transform error',
      })
    }
  }

  return { transformed, errors }
}
