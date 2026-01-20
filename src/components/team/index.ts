/**
 * Team Hub Components
 *
 * Reusable components for all 5 Chicago team hub pages.
 */

// Legacy TeamHub component (for backwards compatibility)
export { default as TeamHub } from './TeamHub'

// V10 Team Hub components
export { default as TeamHubLayout } from './TeamHubLayout'
export type { TeamInfo, NextGameInfo, TeamRecord } from './TeamHubLayout'

export { default as TeamHubOverview } from './TeamHubOverview'
export type { TeamPost, SeasonStats } from './TeamHubOverview'
