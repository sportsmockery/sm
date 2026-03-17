import React from 'react'

/**
 * Shortcode patterns for embedded content
 * [chart:123] - Embeds chart with ID 123
 * [poll:456] - Embeds poll with ID 456
 * [icon name=icon-star] - Embeds an icon
 */

export interface ParsedShortcode {
  type: 'chart' | 'poll' | 'icon'
  id: string
  originalMatch: string
}

// Regex patterns for shortcodes
const CHART_PATTERN = /\[chart:(\d+)\]/g
const POLL_PATTERN = /\[poll:(\d+)\]/g
const ICON_PATTERN = /\[icon\s+name=([^\]]+)\]/g

// Icon mapping for common WordPress icon shortcodes
const ICON_MAP: Record<string, string> = {
  'icon-star': '★',
  'icon-star-empty': '☆',
  'icon-heart': '❤',
  'icon-heart-empty': '♡',
  'icon-check': '✓',
  'icon-checkmark': '✓',
  'icon-x': '✕',
  'icon-close': '✕',
  'icon-arrow-right': '→',
  'icon-arrow-left': '←',
  'icon-arrow-up': '↑',
  'icon-arrow-down': '↓',
  'icon-fire': '🔥',
  'icon-trophy': '🏆',
  'icon-football': '🏈',
  'icon-basketball': '🏀',
  'icon-baseball': '⚾',
  'icon-hockey': '🏒',
  'icon-warning': '⚠',
  'icon-info': 'ℹ',
  'icon-quote': '"',
  'icon-clock': '🕒',
  'icon-calendar': '📅',
  'icon-user': '👤',
  'icon-users': '👥',
  'icon-dollar': '$',
  'icon-money': '💰',
  'icon-bell': '🔔',
  'icon-flag': '🚩',
  'icon-thumbs-up': '👍',
  // Hide thumbs-down icon across the site (no render)
  'icon-thumbs-down': '',
}

/**
 * Get the icon character or SVG for a given icon name
 */
export function getIconHtml(iconName: string): string {
  const cleanName = iconName.trim().toLowerCase()
  const icon = ICON_MAP[cleanName]

  if (icon) {
    return `<span class="shortcode-icon" aria-hidden="true">${icon}</span>`
  }

  // For unknown icons, try to create an SVG placeholder or just hide it
  return ''
}

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
  const hasChart = CHART_PATTERN.test(html)
  CHART_PATTERN.lastIndex = 0
  const hasPoll = POLL_PATTERN.test(html)
  POLL_PATTERN.lastIndex = 0
  const hasIcon = ICON_PATTERN.test(html)
  ICON_PATTERN.lastIndex = 0
  return hasChart || hasPoll || hasIcon
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

  // Replace icon shortcodes with actual icons (inline)
  result = result.replace(ICON_PATTERN, (match, iconName) => {
    return getIconHtml(iconName)
  })

  return result
}

/**
 * Process icon shortcodes in HTML content
 * This can be used independently for simpler processing
 */
export function processIconShortcodes(html: string): string {
  return html.replace(ICON_PATTERN, (match, iconName) => {
    return getIconHtml(iconName)
  })
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
