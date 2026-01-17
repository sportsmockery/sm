/**
 * Auto-link HTML transformer
 *
 * Transforms article HTML by automatically linking the first occurrence
 * of team and player names to their respective pages.
 */

import type { AutoLinkContext } from './entities'
import { teamUrlFromSlug, playerUrlFromId } from './entities'
import { getAutoLinkConfig } from './config'

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Check if a position is inside an HTML tag
 */
function isInsideTag(html: string, position: number): boolean {
  let depth = 0
  for (let i = 0; i < position; i++) {
    if (html[i] === '<') depth++
    if (html[i] === '>') depth--
  }
  return depth > 0
}

/**
 * Check if a position is inside an anchor tag
 */
function isInsideAnchor(html: string, position: number): boolean {
  // Find all anchor tags before this position
  const beforeText = html.slice(0, position)

  // Count open and close anchor tags
  const openTags = (beforeText.match(/<a\s/gi) || []).length
  const closeTags = (beforeText.match(/<\/a>/gi) || []).length

  return openTags > closeTags
}

/**
 * Create a link HTML element
 */
function createLink(text: string, href: string): string {
  return `<a href="${href}">${text}</a>`
}

/**
 * Apply auto-links to HTML content
 *
 * This function transforms HTML by:
 * 1. Finding the first occurrence of each team name and linking it
 * 2. Finding the first occurrence of each player name and linking it
 * 3. Skipping text that's already inside an <a> tag
 * 4. Preserving all other HTML structure
 *
 * @param html - The HTML content to transform
 * @param ctx - The auto-link context with teams and players
 * @returns The transformed HTML with auto-links applied
 */
export function applyAutoLinksToHtml(
  html: string,
  ctx: AutoLinkContext
): string {
  if (!html || (!ctx.teams.length && !ctx.players.length)) {
    return html
  }

  const config = getAutoLinkConfig()
  let result = html
  const linkedNames = new Set<string>()

  // Process team links first (they're typically more important)
  if (config.enableTeamLinks) {
    for (const team of ctx.teams) {
      if (linkedNames.has(team.name)) continue

      // Create regex to find the team name (word boundary match)
      const pattern = new RegExp(
        `\\b(${escapeRegex(team.name)})\\b`,
        config.caseSensitive ? 'g' : 'gi'
      )

      let match: RegExpExecArray | null
      let found = false

      // Reset lastIndex for fresh search
      pattern.lastIndex = 0

      while ((match = pattern.exec(result)) !== null) {
        const position = match.index

        // Skip if inside an HTML tag or anchor
        if (isInsideTag(result, position) || isInsideAnchor(result, position)) {
          continue
        }

        // Found a valid match - replace it
        const url = teamUrlFromSlug(team.slug)
        const link = createLink(match[1], url)

        result =
          result.slice(0, position) +
          link +
          result.slice(position + match[1].length)

        linkedNames.add(team.name)
        found = true
        break // Only link first occurrence
      }

      if (found) {
        // Continue with updated result
      }
    }
  }

  // Process player links
  if (config.enablePlayerLinks) {
    for (const player of ctx.players) {
      if (linkedNames.has(player.name)) continue

      // Create regex to find the player name (word boundary match)
      const pattern = new RegExp(
        `\\b(${escapeRegex(player.name)})\\b`,
        config.caseSensitive ? 'g' : 'gi'
      )

      let match: RegExpExecArray | null

      // Reset lastIndex for fresh search
      pattern.lastIndex = 0

      while ((match = pattern.exec(result)) !== null) {
        const position = match.index

        // Skip if inside an HTML tag or anchor
        if (isInsideTag(result, position) || isInsideAnchor(result, position)) {
          continue
        }

        // Found a valid match - replace it
        const url = playerUrlFromId(player.id)
        const link = createLink(match[1], url)

        result =
          result.slice(0, position) +
          link +
          result.slice(position + match[1].length)

        linkedNames.add(player.name)
        break // Only link first occurrence
      }
    }
  }

  return result
}

/**
 * Apply auto-links with per-article opt-out support
 *
 * @param html - The HTML content to transform
 * @param ctx - The auto-link context
 * @param disableAutoLinks - If true, returns the original HTML unchanged
 */
export function applyAutoLinksWithOptOut(
  html: string,
  ctx: AutoLinkContext,
  disableAutoLinks?: boolean
): string {
  if (disableAutoLinks) {
    return html
  }
  return applyAutoLinksToHtml(html, ctx)
}

/**
 * Synchronous team-only auto-linking for simpler use cases
 * Does not require async context building
 */
export function applyTeamAutoLinks(
  html: string,
  teams: Array<{ name: string; slug: string }>
): string {
  const ctx: AutoLinkContext = {
    teams: teams,
    players: [],
  }
  return applyAutoLinksToHtml(html, ctx)
}
