import type { ContentBlock, ArticleDocument } from './types';

/**
 * Serialize block document to JSON string for storage.
 * Stored in sm_posts.content as: <!-- SM_BLOCKS -->JSON<!-- /SM_BLOCKS -->
 * This allows the existing HTML renderer to detect block-based content
 * and route to the block renderer instead.
 */
export function serializeDocument(doc: ArticleDocument): string {
  return `<!-- SM_BLOCKS -->${JSON.stringify(doc)}<!-- /SM_BLOCKS -->`;
}

/**
 * Detect if content string is block-based.
 */
export function isBlockContent(content: string): boolean {
  return content.trimStart().startsWith('<!-- SM_BLOCKS -->');
}

/**
 * Parse block content from stored string.
 */
export function parseDocument(content: string): ArticleDocument | null {
  if (!isBlockContent(content)) return null;
  try {
    const json = content.replace('<!-- SM_BLOCKS -->', '').replace('<!-- /SM_BLOCKS -->', '').trim();
    return JSON.parse(json) as ArticleDocument;
  } catch {
    return null;
  }
}

/**
 * Convert block document to plain HTML for fallback/RSS/SEO.
 * Strips interactive elements, keeps text + images.
 */
export function blocksToHtml(blocks: ContentBlock[]): string {
  return blocks.map((block) => {
    switch (block.type) {
      case 'paragraph':
        return `<p>${block.data.html}</p>`;
      case 'heading':
        return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
      case 'image':
        return block.data.src
          ? `<figure><img src="${block.data.src}" alt="${block.data.alt}" />${block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : ''}</figure>`
          : '';
      case 'video':
        return block.data.url ? `<div class="video-embed"><iframe src="${block.data.url}" allowfullscreen></iframe></div>` : '';
      case 'analysis':
        return block.data.html
          ? `<aside class="sm-analysis" data-sm-section="analysis">${block.data.html}</aside>`
          : '';
      case 'scout-insight':
        return block.data.insight ? `<blockquote class="scout-insight"><p>${block.data.insight}</p></blockquote>` : '';
      case 'hot-take':
        return block.data.text ? `<blockquote class="hot-take"><p>${block.data.text}</p></blockquote>` : '';
      case 'update':
        return block.data.text ? `<div class="update-block"><strong>UPDATE ${block.data.timestamp}:</strong> ${block.data.text}</div>` : '';
      case 'divider':
        return '<hr />';
      default:
        // Interactive blocks (GM, trade, debate, etc.) render as placeholder in HTML
        return `<div data-block-type="${block.type}" data-block-id="${block.id}"></div>`;
    }
  }).filter(Boolean).join('\n');
}
