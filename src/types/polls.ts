/**
 * Poll System Types
 * Chicago-sports themed poll system for SportsMockery
 */

// Chicago team identifiers for theming
export type ChicagoTeam = 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks' | 'fire' | 'sky' | null

// Poll types
export type PollType = 'single' | 'multiple' | 'scale' | 'emoji'

// Poll status
export type PollStatus = 'draft' | 'active' | 'scheduled' | 'closed' | 'archived'

// Emoji reaction options
export const EMOJI_OPTIONS = ['🔥', '😤', '😂', '😴', '💪', '🏆', '👎', '🤔'] as const
export type EmojiOption = typeof EMOJI_OPTIONS[number]

// Team color palette
export const TEAM_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  bears: { primary: '#0B162A', secondary: '#C83200', accent: '#FFFFFF' },
  bulls: { primary: '#CE1141', secondary: '#000000', accent: '#FFFFFF' },
  cubs: { primary: '#0E3386', secondary: '#CC3433', accent: '#FFFFFF' },
  whitesox: { primary: '#27251F', secondary: '#C4CED4', accent: '#FFFFFF' },
  blackhawks: { primary: '#CF0A2C', secondary: '#000000', accent: '#FFD100' },
  fire: { primary: '#AF2626', secondary: '#7CCDEF', accent: '#FFFFFF' },
  sky: { primary: '#5091CD', secondary: '#FED141', accent: '#FFFFFF' },
  default: { primary: '#1a1a2e', secondary: '#C83200', accent: '#FFFFFF' },
}

// Poll option interface
export interface PollOption {
  id: string
  poll_id: string
  option_text: string
  option_image?: string | null
  team_tag?: ChicagoTeam
  display_order: number
  vote_count: number
  emoji?: EmojiOption | null
  created_at: string
}

// Poll interface
export interface Poll {
  id: string
  title: string
  question: string
  poll_type: PollType
  status: PollStatus
  team_theme?: ChicagoTeam
  is_anonymous: boolean
  show_results: boolean
  show_live_results: boolean
  is_multi_select: boolean
  scale_min?: number
  scale_max?: number
  scale_labels?: { min: string; max: string }
  total_votes: number
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
  created_by?: string | null
  options: PollOption[]
}

// Poll response/vote interface
export interface PollResponse {
  id: string
  poll_id: string
  option_id: string
  user_id?: string | null
  anonymous_id?: string | null
  ip_hash?: string | null
  created_at: string
}

// Create poll input
export interface CreatePollInput {
  title: string
  question: string
  poll_type: PollType
  team_theme?: ChicagoTeam
  is_anonymous?: boolean
  show_results?: boolean
  show_live_results?: boolean
  is_multi_select?: boolean
  scale_min?: number
  scale_max?: number
  scale_labels?: { min: string; max: string }
  starts_at?: string | null
  ends_at?: string | null
  options: CreatePollOptionInput[]
}

// Create poll option input
export interface CreatePollOptionInput {
  option_text: string
  option_image?: string | null
  team_tag?: ChicagoTeam
  emoji?: EmojiOption | null
}

// Update poll input
export interface UpdatePollInput extends Partial<CreatePollInput> {
  status?: PollStatus
}

// Vote input
export interface VoteInput {
  option_ids: string[]
  user_id?: string | null
  anonymous_id?: string | null
}

// Poll results
export interface PollResults {
  poll: Poll
  total_votes: number
  options: PollOptionResult[]
  user_voted?: boolean
  user_votes?: string[]
}

export interface PollOptionResult {
  id: string
  option_text: string
  option_image?: string | null
  team_tag?: ChicagoTeam
  emoji?: EmojiOption | null
  vote_count: number
  percentage: number
}

// API response types
export interface PollsListResponse {
  polls: Poll[]
  total: number
  limit: number
  offset: number
}

export interface PollResponse {
  poll: Poll
  shortcode: string
  embed_url: string
}

// Chicago-themed microcopy
export const CHICAGO_MICROCOPY = {
  vote_cta: [
    "What's your take, Chicago?",
    "Vote now, this is your call.",
    "This one's for the city, cast your vote.",
    "Time to weigh in, Chi-Town.",
    "Make your voice heard, Chicago.",
    "The Windy City wants to know.",
  ],
  voted: [
    "You've made your call!",
    "Vote counted, Chicago!",
    "That's the Chicago spirit!",
    "Your voice has been heard!",
  ],
  results_header: [
    "Here's what Chicago thinks",
    "The fans have spoken",
    "Chi-Town's verdict",
    "The city has decided",
  ],
}

export function getRandomMicrocopy(type: keyof typeof CHICAGO_MICROCOPY): string {
  const options = CHICAGO_MICROCOPY[type]
  return options[Math.floor(Math.random() * options.length)]
}

// Helper to get team colors
export function getTeamColors(team: ChicagoTeam): { primary: string; secondary: string; accent: string } {
  return TEAM_COLORS[team || 'default'] || TEAM_COLORS.default
}
