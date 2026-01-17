/**
 * Auto-linking module
 *
 * Automatically links the first occurrence of team and player names
 * in article content to their respective pages.
 *
 * Usage:
 * ```ts
 * import { buildAutoLinkContextForPost, applyAutoLinksToHtml } from '@/lib/autolink'
 *
 * const ctx = await buildAutoLinkContextForPost(post.id, post.categorySlug)
 * const linkedHtml = applyAutoLinksToHtml(post.contentHtml, ctx)
 * ```
 */

// Entity types and URL helpers
export type { TeamLink, PlayerLink, AutoLinkContext } from './entities'
export { teamUrlFromSlug, playerUrlFromId, generatePlayerSlug } from './entities'

// Configuration
export type { AutoLinkConfig } from './config'
export { getAutoLinkConfig, defaultAutoLinkConfig } from './config'

// Context building
export {
  buildAutoLinkContextForPost,
  buildTeamOnlyContext,
  getAllTeamLinks,
  getTeamLinkByCategorySlug,
  getBearsPlayerLinks,
} from './context'

// HTML transformation
export {
  applyAutoLinksToHtml,
  applyAutoLinksWithOptOut,
  applyTeamAutoLinks,
} from './applyAutoLinks'
