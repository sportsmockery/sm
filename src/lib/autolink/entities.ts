/**
 * Auto-linking entity types and URL helpers
 *
 * This module provides types and functions for automatically linking
 * team and player names in article content.
 */

// Team link configuration
export interface TeamLink {
  name: string      // Full display name, e.g., "Chicago Bears"
  slug: string      // URL slug, e.g., "chicago-bears"
}

// Player link configuration
export interface PlayerLink {
  name: string      // Full display name, e.g., "Caleb Williams"
  id: string        // Player ID for URL routing
}

// Context for auto-linking a specific article
export interface AutoLinkContext {
  teams: TeamLink[]
  players: PlayerLink[]
}

// Base URL for team category pages (per spec: test.sportsmockery.com)
const CATEGORY_BASE = 'https://test.sportsmockery.com'

/**
 * Generate team category URL from slug
 * Uses the pattern: https://test.sportsmockery.com/<team-slug>
 *
 * @example teamUrlFromSlug('chicago-bears') -> 'https://test.sportsmockery.com/chicago-bears'
 */
export function teamUrlFromSlug(slug: string): string {
  return `${CATEGORY_BASE}/${slug}`
}

/**
 * Generate player profile URL from player ID
 * Uses the existing /players/[playerId] route pattern
 *
 * @example playerUrlFromId('caleb-williams') -> '/players/caleb-williams'
 */
export function playerUrlFromId(id: string): string {
  return `/players/${id}`
}

/**
 * Generate a URL-safe slug from a player name
 * Used when player record doesn't have a slug field
 *
 * @example generatePlayerSlug('Caleb Williams') -> 'caleb-williams'
 */
export function generatePlayerSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')    // Remove special characters
    .replace(/\s+/g, '-')             // Replace spaces with hyphens
    .replace(/-+/g, '-')              // Remove multiple hyphens
    .replace(/^-|-$/g, '')            // Remove leading/trailing hyphens
}
