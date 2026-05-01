import type { ArticleDocument, ContentBlock } from '@/components/admin/BlockEditor'
import { blocksToHtml } from '@/components/admin/BlockEditor/serializer'
import type { PreflightInput } from './types'

const HTML_TAG_REGEX = /<[^>]+>/g

/**
 * Convert an HTML string to plain text. Cheap, lossy, sufficient for word
 * counting and entity scanning in the validators.
 */
export function htmlToText(html: string): string {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>(?=\s|$)/gi, '\n')
    .replace(/<\/(p|div|li|h\d)>/gi, '\n')
    .replace(HTML_TAG_REGEX, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

/**
 * Pull every block into a flat list so validators can iterate without
 * worrying about whether the document was provided or only HTML existed.
 */
export function getBlocks(input: PreflightInput): ContentBlock[] {
  return input.document?.blocks ?? []
}

/**
 * Render the canonical HTML view of the article body. For block-mode posts
 * we run blocksToHtml; for legacy HTML posts we use the contentHtml field.
 */
export function getBodyHtml(input: PreflightInput): string {
  if (input.document?.blocks?.length) {
    return blocksToHtml(input.document.blocks)
  }
  return input.contentHtml ?? ''
}

/**
 * Plain-text projection of the body. Used by the lede / analysis / word
 * count validators.
 */
export function getBodyText(input: PreflightInput): string {
  return htmlToText(getBodyHtml(input))
}

/**
 * Walk the block document collecting paragraph-style HTML in document
 * order. Used by the lede validator (only the first 1–2 paragraphs).
 */
export function getProseParagraphs(doc: ArticleDocument | null): string[] {
  if (!doc?.blocks?.length) return []
  const out: string[] = []
  for (const block of doc.blocks) {
    if (block.type === 'paragraph' && typeof block.data.html === 'string') {
      const text = htmlToText(block.data.html).trim()
      if (text) out.push(text)
    }
  }
  return out
}

/**
 * Collect every heading block as `{ level, text }` in document order.
 */
export function getHeadings(
  doc: ArticleDocument | null
): { level: 2 | 3 | 4; text: string; blockId: string }[] {
  if (!doc?.blocks?.length) return []
  const out: { level: 2 | 3 | 4; text: string; blockId: string }[] = []
  for (const block of doc.blocks) {
    if (block.type === 'heading') {
      out.push({
        level: block.data.level,
        text: htmlToText(block.data.text).trim(),
        blockId: block.id,
      })
    }
  }
  return out
}

/**
 * Collect every inline image block (excludes featured image, which is
 * stored on the post row).
 */
export function getImageBlocks(
  doc: ArticleDocument | null
): { src: string; alt: string; caption?: string; blockId: string }[] {
  if (!doc?.blocks?.length) return []
  const out: { src: string; alt: string; caption?: string; blockId: string }[] = []
  for (const block of doc.blocks) {
    if (block.type === 'image') {
      out.push({
        src: block.data.src,
        alt: block.data.alt,
        caption: block.data.caption,
        blockId: block.id,
      })
    }
  }
  return out
}

/**
 * Extract every <a href="..."> from the body html. Returns absolute URLs as
 * strings so validators can categorise internal vs external.
 */
export function extractLinks(html: string): string[] {
  if (!html) return []
  const out: string[] = []
  const re = /<a\b[^>]*\bhref\s*=\s*"([^"]+)"/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    if (m[1]) out.push(m[1])
  }
  return out
}

/**
 * Word count for a plain-text string (single source of truth across rules).
 */
export function countWordsInText(text: string): number {
  if (!text) return 0
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}
