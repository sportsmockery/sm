/**
 * HTML sanitization utility using DOMPurify.
 *
 * Strips dangerous HTML (script, onerror, onclick, etc.) while preserving
 * safe formatting tags used in WordPress-imported article content.
 *
 * Usage:
 *   import { sanitizeHtml } from '@/lib/sanitize-html'
 *   <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
 */

import DOMPurify from 'isomorphic-dompurify'

// Tags allowed in article content
const ALLOWED_TAGS = [
  // Structure
  'p', 'div', 'span', 'br', 'hr',
  // Headings
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  // Formatting
  'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
  // Lists
  'ul', 'ol', 'li',
  // Links & media
  'a', 'img', 'figure', 'figcaption', 'picture', 'source', 'video', 'audio',
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  // Embeds (for tweet/chart/poll shortcodes)
  'blockquote', 'pre', 'code',
  // Semantic
  'article', 'section', 'aside', 'details', 'summary', 'time',
  // Twitter embeds
  'iframe',
]

// Attributes allowed on tags
const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'width', 'height', 'loading', 'decoding',
  'class', 'id', 'style', 'target', 'rel',
  'data-*',  // Allow data attributes for shortcodes
  'colspan', 'rowspan', 'scope', 'headers',
  'datetime', 'cite',
  'srcset', 'sizes', 'media', 'type',
  'controls', 'autoplay', 'muted', 'loop', 'poster',
  'frameborder', 'allowfullscreen', 'allow', 'sandbox',
]

/**
 * Sanitize HTML content for safe rendering with dangerouslySetInnerHTML.
 * Strips script tags, event handlers, javascript: URIs, etc.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: true,
    // Allow safe URI schemes only
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  })
}

/**
 * Lighter sanitization for admin preview contexts where more flexibility is needed.
 * Still strips script/event handlers but allows broader tag set.
 */
export function sanitizeHtmlPermissive(dirty: string): string {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['target', 'allow', 'allowfullscreen', 'frameborder', 'sandbox'],
    ALLOW_DATA_ATTR: true,
  })
}
