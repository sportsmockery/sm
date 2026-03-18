// All TypeScript interfaces for the /dash page data

export interface HomepageData {
  hero: {
    mode: 'live' | 'breaking' | 'pulse'
    live_games: LiveGame[]
    breaking: BreakingStory | null
    city_pulse: CityPulse
  }
  pulse_row: {
    todays_debate: TodaysDebate | null
    scout_says: ScoutSays | null
  }
  spotlight: {
    data_card: DataCardSpotlight | null
    trending_take: TrendingTake | null
  }
  team_grid: TeamCard[]
  feed: FeedItem[]
  injuries: Injury[]
  fan_zone: {
    scout_suggestions: string[]
    todays_poll: TodaysPoll | null
  }
  generated_at: string
  generated_at_central: string
  cache_age_ms: number
}

export interface LiveGame {
  game_id: string
  team_id: string
  sport: string
  home_team: string
  away_team: string
  home_abbr: string
  away_abbr: string
  home_logo: string
  away_logo: string
  home_score: number
  away_score: number
  period: string | null
  clock: string | null
  status: string
  venue: string | null
  broadcast: string | null
  home_win_prob: string | null
  away_win_prob: string | null
  updated_at: string
}

export interface BreakingStory {
  headline: string
  hook: string
  team: string
  emotion: string
  viral_score: number
  article_type: string
  source: 'postiq' | 'news'
  url?: string
}

export interface CityPulse {
  aggregate_wins: number
  aggregate_losses: number
  aggregate_otl: number
  win_pct: number
  hottest: string
  coldest: string
  teams_active: number
}

export interface TeamCard {
  team_key: string
  team_name: string
  sport: string
  wins: number
  losses: number
  otl: number
  record: string
  win_pct: number
  postseason_record: string
  streak_type: string
  streak_count: number
  last10: string
  team_phase: string
  vibe_score: number
  vibe_label: string
  vibe_color: string
  next_game: {
    date: string
    time: string | null
    opponent: string
    opponent_full: string
    home: boolean
    type: string
    venue: string
  } | null
  last_game: {
    date: string
    opponent: string
    score: string
    result: string
  } | null
}

export interface TodaysDebate {
  id: string
  caption: string
  team: string
  score: number
  format: string
  vote_counts: Record<string, number>
  total_votes: number
}

export interface ScoutSays {
  headline: string
  hook: string
  team: string
  emotion: string
  viral_score: number
}

export interface DataCardSpotlight {
  title: string
  headline: string
  image_url: string
  team_key: string
  card_type: string
  chicago_take: string
}

export interface TrendingTake {
  headline: string
  hook: string
  angle: string
  team: string
  emotion: string
  viral_score: number
  article_type: string
}

export interface Injury {
  team_key: string
  player: string
  position: string
  status: string
  detail: string | null
  starter: boolean | null
}

export type FeedItem =
  | { type: 'article'; title: string; url: string; summary: string; topic: string; team: string; tone: string; ts: string }
  | { type: 'data_card'; title: string; image_url: string; team_key: string; card_type: string; chicago_take: string; ts: string }
  | { type: 'viral_post'; caption: string; team: string; score: number; format: string; ts: string }
  | { type: 'nextgen'; title: string; thumbnail_url: string; viral_score: number; ts: string }

export interface TodaysPoll {
  id: string
  caption: string
  team: string
  score: number
  format: string
}

export interface VoteResult {
  voted: boolean
  already_voted: boolean
  your_vote: number
  results: Record<string, number>
  total_votes: number
}

export interface LiveOverlayData {
  has_live: boolean
  games: (LiveGame & { plays: any[] })[]
  polled_at: string
  polled_at_central: string
}

export const TEAM_LOGOS: Record<string, string> = {
  bears: '/logos/bears.svg',
  bulls: '/logos/bulls.svg',
  blackhawks: '/logos/blackhawks.svg',
  cubs: '/logos/cubs.svg',
  whitesox: '/logos/whitesox.svg',
}

export function parseDebateOptions(caption: string): { question: string; options: string[] } {
  const lines = caption.split('\n').filter(l => l.trim())
  const emojiRegex = /^[\p{Emoji}]/u
  const options = lines.filter(l => emojiRegex.test(l.trim()))
  const optionStartIdx = lines.indexOf(options[0])
  const question = lines.slice(0, optionStartIdx).pop() || lines[0]
  return { question, options }
}
