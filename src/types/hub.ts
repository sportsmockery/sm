export type HubSlug = 'trade-rumors' | 'draft-tracker' | 'cap-tracker' | 'depth-chart' | 'game-center'
export type TeamSlug = 'chicago-bears'
export type HubItemStatus = 'draft' | 'published'

export interface HubItem {
  id: string
  created_at: string
  updated_at: string
  team_slug: TeamSlug
  hub_slug: HubSlug
  status: HubItemStatus
  headline: string
  timestamp: string
  source_name: string | null
  source_url: string | null
  summary: string
  what_it_means: string
  featured: boolean
  author_id: string | null
  author_name: string | null
  hub_meta: Record<string, unknown>
}

export interface HubItemFormData {
  team_slug: TeamSlug
  hub_slug: HubSlug
  status: HubItemStatus
  headline: string
  timestamp: string
  source_name: string
  source_url: string
  summary: string
  what_it_means: string
  featured: boolean
  hub_meta: Record<string, unknown>
}

// Hub-specific meta interfaces
export interface TradeRumorsMeta {
  playerName?: string
  position?: string
  otherTeam?: string
  estimatedCost?: string
  capImpact?: string
}

export interface DraftTrackerMeta {
  prospectName?: string
  position?: string
  college?: string
  projectedRound?: string
  pickRange?: string
}

export interface CapTrackerMeta {
  playerName?: string
  moveType?: 'restructure' | 'extension' | 'cut' | 'signing' | 'trade' | ''
  capChange?: string
  yearImpacted?: string
}

export interface DepthChartMeta {
  positionGroup?: string
  playersInvolved?: string
  status?: 'starter' | 'backup' | 'injured' | 'questionable' | 'out' | 'IR' | ''
}

export interface GameCenterMeta {
  gameId?: string
  opponent?: string
  date?: string
  noteType?: 'preview' | 'in-game' | 'postgame' | 'injury' | 'matchup' | ''
}

export const HUB_PAGES: { slug: HubSlug; label: string }[] = [
  { slug: 'trade-rumors', label: 'Trade Rumors' },
  { slug: 'draft-tracker', label: 'Draft Tracker' },
  { slug: 'cap-tracker', label: 'Cap Tracker' },
  { slug: 'depth-chart', label: 'Depth Chart' },
  { slug: 'game-center', label: 'Game Center' },
]

export const TEAM_OPTIONS: { slug: TeamSlug; label: string }[] = [
  { slug: 'chicago-bears', label: 'Chicago Bears' },
]
