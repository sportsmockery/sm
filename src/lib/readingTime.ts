/**
 * Calculate reading time from content
 * Based on average reading speed of ~200 words per minute
 */

const WORDS_PER_MINUTE = 200

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .length
}

/**
 * Calculate reading time in minutes from HTML content
 * @param content - HTML content string
 * @returns Reading time in minutes (minimum 1)
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1

  const text = stripHtml(content)
  const wordCount = countWords(text)
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE)

  return Math.max(1, minutes)
}

/**
 * Format reading time for display
 * @param content - HTML content string
 * @returns Formatted string like "5 min read"
 */
export function formatReadingTime(content: string): string {
  const minutes = calculateReadingTime(content)
  return `${minutes} min read`
}

/**
 * Get word count from HTML content
 * @param content - HTML content string
 * @returns Word count
 */
export function getWordCount(content: string): number {
  if (!content) return 0
  const text = stripHtml(content)
  return countWords(text)
}
