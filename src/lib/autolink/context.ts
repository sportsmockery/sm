/**
 * Auto-link context builder
 *
 * Builds the AutoLinkContext for a given post by gathering
 * team and player information to use for auto-linking.
 */

import { CHICAGO_TEAMS } from '@/lib/teams'
import { datalabClient } from '@/lib/supabase-datalab'
import type { AutoLinkContext, TeamLink, PlayerLink } from './entities'
import { generatePlayerSlug } from './entities'
import { getAutoLinkConfig } from './config'

/**
 * Build all team links from the CHICAGO_TEAMS configuration
 */
export function getAllTeamLinks(): TeamLink[] {
  return Object.values(CHICAGO_TEAMS).map(team => ({
    name: team.name,
    slug: team.slug,
  }))
}

/**
 * Get team link by category slug
 * Handles various slug formats (e.g., 'bears', 'chicago-bears')
 */
export function getTeamLinkByCategorySlug(categorySlug: string): TeamLink | null {
  const normalized = categorySlug.toLowerCase()

  for (const team of Object.values(CHICAGO_TEAMS)) {
    if (
      team.slug === normalized ||
      team.slug.includes(normalized) ||
      normalized.includes(team.shortName.toLowerCase())
    ) {
      return {
        name: team.name,
        slug: team.slug,
      }
    }
  }

  return null
}

/**
 * Fetch Bears players from the datalab database
 * Returns player links for auto-linking
 */
export async function getBearsPlayerLinks(): Promise<PlayerLink[]> {
  if (!datalabClient) {
    console.warn('Datalab client not configured, skipping player links')
    return []
  }

  try {
    const { data: players, error } = await datalabClient
      .from('bears_players')
      .select('id, name, first_name, last_name, is_active')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching Bears players:', error)
      return []
    }

    return (players || []).map(player => ({
      name: player.name,
      id: generatePlayerSlug(player.name), // Use name-based slug for URL
    }))
  } catch (error) {
    console.error('Error fetching Bears players:', error)
    return []
  }
}

/**
 * Build the auto-link context for a specific post
 *
 * @param postId - The post ID (for future use with post-specific player mentions)
 * @param categorySlug - The category/team slug for the post
 * @param options - Optional overrides for the auto-link config
 */
export async function buildAutoLinkContextForPost(
  postId: number,
  categorySlug?: string,
  options?: {
    disableAutoLinks?: boolean
    includeAllTeams?: boolean
  }
): Promise<AutoLinkContext> {
  const config = getAutoLinkConfig()

  // Return empty context if auto-linking is disabled
  if (options?.disableAutoLinks) {
    return { teams: [], players: [] }
  }

  const context: AutoLinkContext = {
    teams: [],
    players: [],
  }

  // Add team links
  if (config.enableTeamLinks) {
    if (options?.includeAllTeams) {
      // Include all Chicago teams
      context.teams = getAllTeamLinks()
    } else if (categorySlug) {
      // Include the primary team for this article + all other teams
      // (We want to link any team mentioned, not just the article's team)
      context.teams = getAllTeamLinks()
    } else {
      // Default: include all teams
      context.teams = getAllTeamLinks()
    }
  }

  // Add player links
  if (config.enablePlayerLinks) {
    // For now, only fetch Bears players (most common)
    // This can be extended to fetch players from other teams based on categorySlug
    if (!categorySlug || categorySlug.includes('bear')) {
      context.players = await getBearsPlayerLinks()
    }
    // TODO: Add support for other teams' players when their data is available
  }

  return context
}

/**
 * Build a lightweight auto-link context with just team links
 * Use this for quick rendering when player data isn't needed
 */
export function buildTeamOnlyContext(): AutoLinkContext {
  const config = getAutoLinkConfig()

  return {
    teams: config.enableTeamLinks ? getAllTeamLinks() : [],
    players: [],
  }
}
