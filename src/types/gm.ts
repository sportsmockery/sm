/**
 * GM Trade Simulator - Centralized Type Definitions
 */

// Asset types for unified handling
export type AssetType = 'PLAYER' | 'DRAFT_PICK' | 'PROSPECT'

// Draft pick with extended metadata
export interface DraftPick {
  year: number
  round: number
  condition?: string
  pickNumber?: number     // If known (e.g., "Pick 12")
  originalTeam?: string   // "Own" or team abbreviation
}

// Universal prospect interface (works for MLB and NHL)
export interface ProspectData {
  // Core fields
  id?: string                 // UUID
  prospect_id?: string        // Alias for id (backend compatibility)
  prospectid?: string         // Alias for id (API compatibility)
  name: string
  position: string
  team_key: string            // 'chw', 'chc', 'blackhawks', etc.
  team_name?: string          // 'Chicago White Sox', 'Chicago Blackhawks'
  org_rank: number            // Organization ranking (1-30 for MLB, 1-20 for NHL)
  orgrank?: number            // Alias for org_rank (API compatibility)
  age?: number | null
  prospect_grade: string      // Tier label: "Elite", "High-End", "A+", "B", etc.
  prospectgrade?: string      // Alias for prospect_grade
  prospect_grade_numeric?: number  // Numeric grade: 40-80 for NHL, 20-80 for MLB
  prospectgradenumeric?: number    // Alias for prospect_grade_numeric
  trade_value: number         // Trade value (1-100)
  tradevalue?: number         // Alias for trade_value
  source?: string             // 'Prospects1500', 'EliteProspects', etc.

  // Level and ETA
  current_level?: string      // MLB: 'R', 'A', 'A+', 'AA', 'AAA' | NHL: 'AHL', 'OHL', 'NCAA', etc.
  currentlevel?: string       // Alias for current_level
  level?: string              // Alias for current_level
  eta?: string                // "Late 2025", "2026", "2026-27", "NHL", etc.

  // Scouting
  scouting_summary?: string
  scoutingreport?: string     // Alias for scouting_summary
  headshot_url?: string
  headshoturl?: string        // Alias for headshot_url

  // MLB valuation fields
  prospect_fv_bucket?: number
  fvbucket?: number           // Alias for prospect_fv_bucket
  prospect_tier?: string      // 'elite', 'plus', 'average', 'organizational'
  tier?: string               // Alias for prospect_tier
  risk_level?: 'low' | 'medium' | 'high'
  position_group?: 'pitcher' | 'catcher' | 'up_the_middle' | 'corner'
  prospect_surplus_value_millions?: number

  // MLB-specific scouting grades
  hitgrade?: number
  powergrade?: number
  rungrade?: number
  armgrade?: number
  fieldgrade?: number

  // NHL-specific fields
  shoots_catches?: string     // 'L' or 'R'
  shootscatches?: string      // Alias for shoots_catches
  nhl_projection?: string     // "Top-6 Forward", "Top-4 Defenseman", etc.
  nhlprojection?: string      // Alias for nhl_projection
  contract_status?: string    // 'ELC', 'Unsigned', 'RFA', etc.
  contractstatus?: string     // Alias for contract_status
  nationality?: string

  // Backwards compatibility aliases
  team_rank?: number          // Alias for org_rank
  rank?: number               // Alias for org_rank
}

// Backwards compatibility type alias
export type MLBProspect = ProspectData

// MLB salary retention tracking (0-50% per CBA rules)
export interface SalaryRetention {
  player_id: string
  retention_pct: number  // 0-50
}

// MLB cash considerations for trades
export interface MLBCashConsiderations {
  cash_sent: number       // Max $100,000 per CBA
  cash_received: number   // Max $100,000 per CBA
}

// Player data (mirrors PlayerData from PlayerCard.tsx)
export interface GMPlayerData {
  player_id: string
  full_name: string
  position: string
  jersey_number: number | null
  headshot_url: string | null
  age: number | null
  weight_lbs: number | null
  college: string | null
  years_exp: number | null
  draft_info: string | null
  espn_id: string | null
  stat_line: string
  stats: Record<string, number | string | null>
  status?: string
  base_salary?: number | null
  cap_hit?: number | null
  contract_years?: number | null
  contract_expires_year?: number | null
  contract_signed_year?: number | null
  is_rookie_deal?: boolean | null
  trend?: 'hot' | 'rising' | 'stable' | 'declining' | 'cold' | null
  performance_vs_projection?: number | null
  market_sentiment?: 'buy' | 'hold' | 'sell' | null
}

// Trade mode for 2-team vs 3-team trades
export type TradeMode = '2-team' | '3-team'

// Asset with destination (for 3-team trades)
export interface TradeAsset {
  type: 'player' | 'pick' | 'prospect'
  playerId?: string
  player?: GMPlayerData
  pick?: DraftPick
  prospect?: MLBProspect
  fromTeam: string  // team key
  toTeam: string    // team key
}

// Trade flow between two specific teams
export interface TradeFlow {
  from: string
  to: string
  players: GMPlayerData[]
  picks: DraftPick[]
  prospects?: MLBProspect[]
}

// Complete 3-team trade structure
export interface ThreeTeamTrade {
  team1: string // Chicago team key
  team2: string // First opponent key
  team3: string // Second opponent key
  flows: TradeFlow[]
}

// Helper to get flows for a specific direction
export function getFlowBetween(trade: ThreeTeamTrade, from: string, to: string): TradeFlow | undefined {
  return trade.flows.find(f => f.from === from && f.to === to)
}

// Helper to get all assets a team is sending
export function getTeamSending(trade: ThreeTeamTrade, teamKey: string): TradeFlow[] {
  return trade.flows.filter(f => f.from === teamKey)
}

// Helper to get all assets a team is receiving
export function getTeamReceiving(trade: ThreeTeamTrade, teamKey: string): TradeFlow[] {
  return trade.flows.filter(f => f.to === teamKey)
}

// Opponent team metadata
export interface OpponentTeam {
  team_key: string
  team_name: string
  abbreviation: string
  logo_url: string
  primary_color: string
  secondary_color?: string
  sport: string
  conference?: string
  division?: string
}

// Asset row configuration for unified rendering
export interface AssetRowConfig {
  type: AssetType
  accentColor: string     // Left border color
  icon: 'player' | 'pick' | 'prospect'
  primaryText: string
  secondaryText: string
  rightText?: string
  rightBadge?: string
  tooltip?: string
}

// Accent colors for each asset type
export const ASSET_ACCENT_COLORS = {
  PLAYER: null,           // Uses team color
  DRAFT_PICK: '#8b5cf6',  // Purple
  PROSPECT: '#22c55e',    // Green
} as const

// Format a draft pick for display
export function formatDraftPick(pick: DraftPick): { primary: string; secondary: string } {
  const pickNum = pick.pickNumber ? ` Pick ${pick.pickNumber}` : ''
  const primary = `${pick.year} Round ${pick.round}${pickNum}`
  const secondary = pick.originalTeam && pick.originalTeam !== 'Own'
    ? `Original: ${pick.originalTeam}`
    : pick.condition || ''
  return { primary, secondary }
}

// Format salary for display
export function formatSalary(amount: number | null | undefined): string {
  if (!amount) return ''
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount}`
}

// Format prospect for display
export function formatProspect(prospect: ProspectData): { primary: string; secondary: string } {
  const rank = prospect.org_rank || prospect.orgrank || prospect.team_rank || prospect.rank
  const rankPrefix = rank ? `#${rank} ` : ''
  const primary = `${rankPrefix}${prospect.name}`
  const level = prospect.current_level || prospect.currentlevel || prospect.level || ''
  const secondary = `${level} - ${prospect.position} - Age ${prospect.age || '?'}`
  return { primary, secondary }
}

// Get tier color for prospect display (handles both NHL and MLB tier names)
export function getProspectTierColor(tier: string | undefined): string {
  if (!tier) return '#808080'
  const t = tier.toLowerCase()
  if (t.includes('elite')) return '#FFD700'       // Gold
  if (t.includes('high-end') || t.includes('plus')) return '#9B30FF' // Purple
  if (t.includes('very good')) return '#1E90FF'    // Blue
  if (t.includes('good') || t.includes('average')) return '#32CD32' // Green
  if (t.includes('below') || t.includes('organizational')) return '#808080' // Gray
  if (t.includes('fringe') || t.includes('longshot')) return '#404040' // Dark gray
  // MLB letter grades
  if (t.startsWith('a')) return '#22c55e'  // Green for A grades
  if (t.startsWith('b')) return '#3b82f6'  // Blue for B grades
  if (t.startsWith('c')) return '#f59e0b'  // Orange for C grades
  if (t.startsWith('d')) return '#ef4444'  // Red for D grades
  return '#808080'
}

// =====================
// Season Simulation Types
// =====================

export interface SeasonRecord {
  wins: number
  losses: number
  otLosses?: number // NHL only
  madePlayoffs: boolean
  playoffSeed?: number
  divisionRank?: number
  conferenceRank?: number
}

export interface SimulationScoreBreakdown {
  tradeQualityScore: number
  winImprovementScore: number
  playoffBonusScore: number
  championshipBonus: number
  winImprovement: number
}

// Team standing in league standings
export interface TeamStanding {
  teamKey: string
  teamName: string
  abbreviation: string
  logoUrl: string
  primaryColor: string
  wins: number
  losses: number
  otLosses?: number // NHL
  winPct: number
  division: string
  conference: string
  divisionRank: number
  conferenceRank: number
  playoffSeed: number | null
  gamesBack: number
  isUserTeam: boolean
  isTradePartner: boolean
  tradeImpact?: number // +/- wins from trade
}

// Playoff matchup
export interface PlayoffMatchup {
  round: number // 1 = Wild Card/First Round, 2 = Divisional/Semis, 3 = Conference/Finals, 4 = Championship
  roundName: string
  homeTeam: {
    teamKey: string
    teamName: string
    abbreviation: string
    logoUrl: string
    primaryColor: string
    seed: number
    wins: number
  }
  awayTeam: {
    teamKey: string
    teamName: string
    abbreviation: string
    logoUrl: string
    primaryColor: string
    seed: number
    wins: number
  }
  seriesWins: [number, number] // [home, away]
  winner: 'home' | 'away' | null
  isComplete: boolean
  gamesPlayed: number
  userTeamInvolved: boolean
}

// Championship result
export interface ChampionshipResult {
  winner: {
    teamKey: string
    teamName: string
    abbreviation: string
    logoUrl: string
    primaryColor: string
  }
  runnerUp: {
    teamKey: string
    teamName: string
    abbreviation: string
    logoUrl: string
    primaryColor: string
  }
  seriesScore: string // "4-2", "4-3", etc.
  mvp?: string
  userTeamWon: boolean
  userTeamInFinals: boolean
}

// Season summary narrative
export interface SeasonSummary {
  headline: string // "Bears Make Playoff Push After Strategic Trade"
  narrative: string // Full paragraph explaining the season
  tradeImpactSummary: string // How the trade affected the team
  keyMoments: string[] // "Week 12: Clinched playoff berth", etc.
  affectedTeams: {
    teamName: string
    impact: string // "Lost their starting QB, dropped from 10-7 to 7-10"
  }[]
}

export interface SimulationResult {
  success: boolean
  baseline: SeasonRecord
  modified: SeasonRecord
  gmScore: number
  scoreBreakdown: SimulationScoreBreakdown
  // Extended data for full simulation
  standings?: {
    conference1: TeamStanding[] // AFC/Eastern/etc.
    conference2: TeamStanding[] // NFC/Western/etc.
    conference1Name: string
    conference2Name: string
  }
  playoffs?: {
    bracket: PlayoffMatchup[]
    userTeamResult?: {
      madePlayoffs: boolean
      eliminatedRound?: number
      eliminatedBy?: string
      wonChampionship: boolean
    }
  }
  championship?: ChampionshipResult
  seasonSummary?: SeasonSummary
  // Video game-style simulation data (Feb 2026)
  games?: SimulatedGame[]
  segments?: SeasonSegment[]
  playerImpacts?: PlayerSimImpact[]
  baselinePowerRating?: number
  modifiedPowerRating?: number
  previousSeasonRecord?: { wins: number; losses: number; otLosses?: number; playoffRound?: number }
}

export interface SimulationRequest {
  sessionId: string
  sport: string
  teamKey: string
  seasonYear: number
}

// =====================
// Video Game Simulation Types (Feb 2026)
// =====================

export interface SimulatedGame {
  gameNumber: number
  week?: number
  date: string
  opponent: string
  opponentName: string
  opponentLogoUrl: string
  isHome: boolean
  teamScore: number
  opponentScore: number
  result: 'W' | 'L' | 'T' | 'OTL'
  isOvertime: boolean
  runningRecord: { wins: number; losses: number; otLosses?: number }
  teamPowerRating: number
  opponentPowerRating: number
  highlight?: string
  segment: string
}

export interface SeasonSegment {
  label: string
  wins: number
  losses: number
  otLosses?: number
  winPct: number
  avgTeamScore: number
  avgOppScore: number
}

export interface PlayerSimImpact {
  playerName: string
  position: string
  direction: 'added' | 'removed'
  powerRatingDelta: number
  category: string
}

// =====================
// Enhanced Historical Context Types (Feb 2026)
// =====================

// Similar historical trade with detailed comparison data
export interface SimilarTrade {
  trade_id?: string              // If from our database
  date: string                   // When it happened
  description: string            // "Bears traded Jay Cutler for 2 1sts + Kyle Orton"
  teams: string[]                // ["CHI_Bears", "DEN_Broncos"]
  outcome: 'worked' | 'failed' | 'neutral'
  grade_given?: number           // If from our system
  similarity_score: number       // 0-100, how similar to user's trade
  key_difference?: string        // What makes it different
}

// Historical precedent for suggested trades
export interface HistoricalPrecedent {
  example_trades: string[]       // "Similar to Khalil Mack trade (2018): Bears sent 2 1sts for star EDGE"
  success_rate_for_structure: number  // "68% of trades with this structure accepted by both teams"
  realistic_because: string      // Why this has historical backing
}

// Trade item for suggested trade structure
export interface TradeItem {
  type: 'player' | 'pick' | 'prospect' | 'cash'
  name?: string
  position?: string
  year?: number
  round?: number
  amount?: number
}

// Value balance for suggested trades
export interface ValueBalance {
  chicago_value: number
  partner_value: number
  difference: number
  fair_value_range: [number, number]
}

// Enhanced historical context section
export interface HistoricalContext {
  similar_trades: SimilarTrade[]  // 2-3 most relevant historical trades
  success_rate: number            // % of similar trades that worked (0-100)
  key_patterns: string[]          // Bullet points of patterns from history
  why_this_fails_historically?: string   // Only if rejected
  what_works_instead?: string            // Only if rejected
}

// Enhanced suggested trade with full structure
export interface EnhancedSuggestedTrade {
  description: string
  chicago_sends: TradeItem[]
  chicago_receives: TradeItem[]
  value_balance: ValueBalance
  cap_salary_notes: string
  why_this_works: string
  likelihood: string
  historical_precedent: HistoricalPrecedent
  // Backwards compatible fields from original SuggestedTrade
  type?: 'add_picks' | 'add_players' | 'remove_players' | 'restructure' | 'three_team'
  summary?: string
  reasoning?: string
  specific_suggestions?: string[]
  estimated_grade_improvement?: number
}

// Legacy historical trade reference (for backwards compatibility)
export interface LegacyHistoricalTradeRef {
  trade: string
  haul: string
  year: number
  outcome: string
}

// Legacy suggested trade (for backwards compatibility)
export interface LegacySuggestedTrade {
  type: 'add_picks' | 'add_players' | 'remove_players' | 'restructure' | 'three_team'
  summary: string
  reasoning: string
  specific_suggestions: string[]
  historical_precedent?: string
  estimated_grade_improvement: number
}

// Type guard to check if historical context is the new enhanced format
export function isEnhancedHistoricalContext(
  ctx: HistoricalContext | LegacyHistoricalTradeRef[] | undefined
): ctx is HistoricalContext {
  if (!ctx) return false
  if (Array.isArray(ctx)) return false
  return 'similar_trades' in ctx && 'success_rate' in ctx
}

// Type guard to check if suggested trade is the new enhanced format
export function isEnhancedSuggestedTrade(
  trade: EnhancedSuggestedTrade | LegacySuggestedTrade | null | undefined
): trade is EnhancedSuggestedTrade {
  if (!trade) return false
  return 'chicago_sends' in trade && 'value_balance' in trade
}

// =====================
// Data Freshness Types (Feb 2026)
// =====================

export interface DataFreshness {
  roster_updated_at: string        // ISO timestamp of last roster sync
  stats_updated_at: string         // ISO timestamp of last stats sync
  contracts_updated_at: string     // ISO timestamp of last contract data sync
  age_hours: number                // Hours since oldest data was updated
  is_stale: boolean                // True if any data is older than threshold (24h)
  warning?: string                 // Optional warning message if data is stale
}

// Validity indicator for pre-submission validation
export interface ValidityIndicator {
  is_valid: boolean
  issues: ValidationIssue[]
  cap_room_available: boolean
  roster_spots_available: boolean
  trade_deadline_status: 'open' | 'closed' | 'approaching'
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  player_name?: string
  resolution?: string
}
