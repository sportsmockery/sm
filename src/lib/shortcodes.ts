import React from 'react'

/**
 * Shortcode patterns for embedded content
 * [chart:123] - Embeds chart with ID 123
 * [poll:456] - Embeds poll with ID 456
 */

export interface ParsedShortcode {
  type: 'chart' | 'poll'
  id: string
  originalMatch: string
}

// Regex patterns for shortcodes
const CHART_PATTERN = /\[chart:(\d+)\]/g
const POLL_PATTERN = /\[poll:(\d+)\]/g

/**
 * Find all shortcodes in HTML content
 */
export function findShortcodes(html: string): ParsedShortcode[] {
  const shortcodes: ParsedShortcode[] = []

  // Find chart shortcodes
  let match
  while ((match = CHART_PATTERN.exec(html)) !== null) {
    shortcodes.push({
      type: 'chart',
      id: match[1],
      originalMatch: match[0],
    })
  }

  // Reset lastIndex
  CHART_PATTERN.lastIndex = 0

  // Find poll shortcodes
  while ((match = POLL_PATTERN.exec(html)) !== null) {
    shortcodes.push({
      type: 'poll',
      id: match[1],
      originalMatch: match[0],
    })
  }

  // Reset lastIndex
  POLL_PATTERN.lastIndex = 0

  return shortcodes
}

/**
 * Check if content contains any shortcodes
 */
export function hasShortcodes(html: string): boolean {
  return CHART_PATTERN.test(html) || POLL_PATTERN.test(html)
}

/**
 * Replace shortcodes with placeholder divs for client-side hydration
 * Used for server-side rendering where we can't use React components directly
 */
export function replaceShortcodesWithPlaceholders(html: string): string {
  let result = html

  // Replace chart shortcodes
  result = result.replace(CHART_PATTERN, (match, id) => {
    return `<div data-shortcode="chart" data-id="${id}" class="shortcode-placeholder chart-placeholder"></div>`
  })

  // Replace poll shortcodes
  result = result.replace(POLL_PATTERN, (match, id) => {
    return `<div data-shortcode="poll" data-id="${id}" class="shortcode-placeholder poll-placeholder"></div>`
  })

  return result
}

/**
 * Extract shortcode IDs from content for prefetching
 */
export function extractShortcodeIds(html: string): { chartIds: string[]; pollIds: string[] } {
  const chartIds: string[] = []
  const pollIds: string[] = []

  let match
  while ((match = CHART_PATTERN.exec(html)) !== null) {
    chartIds.push(match[1])
  }
  CHART_PATTERN.lastIndex = 0

  while ((match = POLL_PATTERN.exec(html)) !== null) {
    pollIds.push(match[1])
  }
  POLL_PATTERN.lastIndex = 0

  return { chartIds, pollIds }
}

/**
 * Parse a single shortcode string
 */
export function parseShortcode(shortcode: string): ParsedShortcode | null {
  const chartMatch = shortcode.match(/^\[chart:(\d+)\]$/)
  if (chartMatch) {
    return {
      type: 'chart',
      id: chartMatch[1],
      originalMatch: shortcode,
    }
  }

  const pollMatch = shortcode.match(/^\[poll:(\d+)\]$/)
  if (pollMatch) {
    return {
      type: 'poll',
      id: pollMatch[1],
      originalMatch: shortcode,
    }
  }

  return null
}

/**
 * Validate shortcode format
 */
export function isValidShortcode(shortcode: string): boolean {
  return /^\[(chart|poll):\d+\]$/.test(shortcode)
}

/**
 * Create a shortcode string
 */
export function createShortcode(type: 'chart' | 'poll', id: string | number): string {
  return `[${type}:${id}]`
}

/**
 * Split content into segments (text and shortcodes)
 * Useful for rendering content with embedded components
 */
export interface ContentSegment {
  type: 'html' | 'chart' | 'poll'
  content: string // HTML content or shortcode ID
}

export function splitContentByShortcodes(html: string): ContentSegment[] {
  const segments: ContentSegment[] = []
  const combinedPattern = /\[(chart|poll):(\d+)\]/g

  let lastIndex = 0
  let match

  while ((match = combinedPattern.exec(html)) !== null) {
    // Add HTML before shortcode
    if (match.index > lastIndex) {
      const htmlContent = html.slice(lastIndex, match.index)
      if (htmlContent.trim()) {
        segments.push({
          type: 'html',
          content: htmlContent,
        })
      }
    }

    // Add shortcode segment
    segments.push({
      type: match[1] as 'chart' | 'poll',
      content: match[2], // The ID
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining HTML
  if (lastIndex < html.length) {
    const remainingHtml = html.slice(lastIndex)
    if (remainingHtml.trim()) {
      segments.push({
        type: 'html',
        content: remainingHtml,
      })
    }
  }

  return segments
}
