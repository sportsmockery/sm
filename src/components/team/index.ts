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

// Nav & Layout upgrade components
export { default as OrbNav } from './OrbNav'
export { default as ToolGrid } from './ToolGrid'
export { default as QuickStats } from './QuickStats'
export { default as CountUpValue } from './CountUp'
export { default as HeroParticles } from './HeroParticles'
export { default as HeroSearchBar } from './HeroSearchBar'

// Shared sub-components
export {
  SectionHeader,
  ArticleCard,
  AskAIWidget,
  FanChatWidget,
  FeatureCard,
} from './shared'
export type { TeamPost as SharedTeamPost } from './shared'
