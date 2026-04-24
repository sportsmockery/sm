/**
 * AI prompt sanitization for user-submitted queries.
 *
 * Enforces length limits and strips common prompt injection patterns
 * before forwarding to AI models (Perplexity, Claude, etc.).
 */

/** Maximum query length in characters */
const MAX_QUERY_LENGTH = 2000

/** Maximum content length for PostIQ actions */
const MAX_CONTENT_LENGTH = 50000

/**
 * Sanitize a user query before sending to an AI model.
 * Returns { safe: true, query } or { safe: false, reason }.
 */
export function sanitizeQuery(raw: string): { safe: true; query: string } | { safe: false; reason: string } {
  if (!raw || typeof raw !== 'string') {
    return { safe: false, reason: 'Query is required' }
  }

  const trimmed = raw.trim()

  if (trimmed.length < 3) {
    return { safe: false, reason: 'Query must be at least 3 characters' }
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return { safe: false, reason: `Query must be under ${MAX_QUERY_LENGTH} characters` }
  }

  // Strip null bytes and control characters (except newlines/tabs)
  const cleaned = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  return { safe: true, query: cleaned }
}

/**
 * Sanitize content submitted to PostIQ (article content for analysis).
 */
export function sanitizeContent(raw: string): string {
  if (!raw || typeof raw !== 'string') return ''
  // Truncate to max length and strip control chars
  return raw.slice(0, MAX_CONTENT_LENGTH).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Sanitize chat message content for AI personality chat.
 */
export function sanitizeChatMessage(raw: string): string {
  if (!raw || typeof raw !== 'string') return ''
  // Chat messages: max 1000 chars, strip control chars
  return raw.slice(0, 1000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim()
}
