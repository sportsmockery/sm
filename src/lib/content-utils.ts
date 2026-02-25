/**
 * Content utilities for article processing
 */

/**
 * Sanitize WordPress imported content for safe React rendering.
 *
 * Strips:
 * - Inline <script> tags (WordPress embeds include redundant twitter widgets.js
 *   scripts that execute during SSR hydration and corrupt the DOM, causing
 *   "Couldn't load article" errors on client-side navigation)
 * - WordPress block editor comments (<!-- wp:paragraph --> etc.)
 * - Unprocessed WordPress shortcodes ([caption], [gallery], [embed])
 */
export function sanitizeWordPressContent(content: string): string {
  if (!content) return content

  let result = content

  // 1. Strip <script> tags and their contents — critical fix.
  //    WordPress tweet embeds include <script async src="...widgets.js"></script>
  //    after every blockquote. These execute during initial page load, modify the
  //    DOM (blockquotes → iframes), and break React hydration + subsequent navigations.
  //    The ArticleContentWithEmbeds component already loads widgets.js properly.
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // 2. Strip WordPress block editor comments (<!-- wp:paragraph --> etc.)
  //    These are invisible but add noise and can interfere with paragraph splitting.
  result = result.replace(/<!--\s*\/?wp:\w[^>]*-->/g, '')

  // 3. Strip unprocessed WordPress [caption] shortcodes, keeping inner content
  result = result.replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/g, '$1')

  // 4. Strip [embed] shortcodes, keeping the URL inside
  result = result.replace(/\[embed\]([\s\S]*?)\[\/embed\]/g, '$1')

  // 5. Strip [gallery] shortcodes (no useful fallback)
  result = result.replace(/\[gallery[^\]]*\]/g, '')

  // 6. Collapse excessive whitespace left by removals (3+ newlines → 2)
  result = result.replace(/\n{3,}/g, '\n\n')

  return result
}

/**
 * Strips duplicate featured image from article body content
 * If the featured image URL appears in the first 3 image blocks, remove it
 */
export function stripDuplicateFeaturedImage(
  content: string,
  featuredImageUrl: string | null
): string {
  if (!content || !featuredImageUrl) return content;

  // Extract the filename from the featured image URL for matching
  const featuredFilename = featuredImageUrl.split('/').pop()?.split('?')[0];
  if (!featuredFilename) return content;

  // Parse the content to find images in the first portion
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let matchCount = 0;

  return content.replace(imgRegex, (match, src) => {
    matchCount++;
    // Only check first 3 image blocks
    if (matchCount <= 3) {
      const srcFilename = src.split('/').pop()?.split('?')[0];
      if (srcFilename === featuredFilename || src === featuredImageUrl) {
        // Return empty string to remove the duplicate image
        return '';
      }
    }
    return match;
  });
}

/**
 * Wraps standalone images in article-image containers
 */
export function wrapImagesInContainer(content: string): string {
  if (!content) return content;

  // Find standalone <img> tags not already in figure or article-image
  const imgRegex = /(?<!<figure[^>]*>.*?)(?<!<div[^>]*class="article-image"[^>]*>.*?)<img([^>]+)>(?!.*?<\/figure>)/gi;

  return content.replace(imgRegex, (match, attrs) => {
    return `<div class="article-image"><img${attrs}></div>`;
  });
}

/**
 * Calculate word count from HTML content
 */
export function getWordCount(content: string): number {
  if (!content) return 0;
  const text = content.replace(/<[^>]*>/g, '');
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate reading time from word count
 * Uses 225 words per minute as standard
 */
export function calculateReadTime(content: string): number {
  const wordCount = getWordCount(content);
  return Math.max(1, Math.ceil(wordCount / 225));
}

/**
 * Determine article context label based on category/tags
 */
export function getContextLabel(
  categoryName: string | null | undefined,
  tags: string[]
): { label: string; type: 'rumor' | 'film-room' | 'opinion' | null } | null {
  const normalizedCategory = categoryName?.toLowerCase() || '';
  const normalizedTags = tags.map(t => t.toLowerCase());

  // Check for Rumor
  if (normalizedCategory.includes('rumor') || normalizedTags.includes('rumor') || normalizedTags.includes('rumors')) {
    return { label: 'Rumor', type: 'rumor' };
  }

  // Check for Film Room
  if (normalizedTags.includes('film-room') || normalizedTags.includes('film room')) {
    return { label: 'Film Room', type: 'film-room' };
  }

  // Check for Opinion
  if (normalizedCategory.includes('opinion') || normalizedTags.includes('opinion')) {
    return { label: 'Opinion', type: 'opinion' };
  }

  return null;
}
