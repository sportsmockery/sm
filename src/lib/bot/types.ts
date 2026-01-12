/**
 * X Bot Types for SportsMockery Twitter Communities
 */

// =============================================================================
// TEAM CONFIGURATION
// =============================================================================

export type TeamSlug =
  | 'chicago-bears'
  | 'chicago-bulls'
  | 'chicago-cubs'
  | 'chicago-white-sox'
  | 'chicago-blackhawks'

export const TEAM_SLUGS: TeamSlug[] = [
  'chicago-bears',
  'chicago-bulls',
  'chicago-cubs',
  'chicago-white-sox',
  'chicago-blackhawks',
]

export const TEAM_DISPLAY_NAMES: Record<TeamSlug, string> = {
  'chicago-bears': 'Chicago Bears',
  'chicago-bulls': 'Chicago Bulls',
  'chicago-cubs': 'Chicago Cubs',
  'chicago-white-sox': 'Chicago White Sox',
  'chicago-blackhawks': 'Chicago Blackhawks',
}

export const TEAM_SHORT_NAMES: Record<TeamSlug, string> = {
  'chicago-bears': 'Bears',
  'chicago-bulls': 'Bulls',
  'chicago-cubs': 'Cubs',
  'chicago-white-sox': 'White Sox',
  'chicago-blackhawks': 'Blackhawks',
}

export const TEAM_SPORTS: Record<TeamSlug, string> = {
  'chicago-bears': 'NFL',
  'chicago-bulls': 'NBA',
  'chicago-cubs': 'MLB',
  'chicago-white-sox': 'MLB',
  'chicago-blackhawks': 'NHL',
}

export const TEAM_EMOJIS: Record<TeamSlug, string> = {
  'chicago-bears': '🐻',
  'chicago-bulls': '🐂',
  'chicago-cubs': '🧸',
  'chicago-white-sox': '⚾',
  'chicago-blackhawks': '🏒',
}

// =============================================================================
// BOT CONFIG
// =============================================================================

export interface BotConfig {
  id: number
  team_slug: TeamSlug
  community_id: string | null
  enabled: boolean
  daily_reply_limit: number
  daily_post_limit: number
  min_delay_seconds: number
  max_delay_seconds: number
  system_prompt: string | null
  created_at: string
  updated_at: string
}

export interface BotDailyActivity {
  id: number
  team_slug: TeamSlug
  activity_date: string
  replies_sent: number
  original_posts: number
  tweets_monitored: number
  total_tokens_used: number
}

// =============================================================================
// MONITORED TWEETS
// =============================================================================

export interface MonitoredTweet {
  id: number
  tweet_id: string
  community_id: string | null
  team_slug: TeamSlug | null
  author_username: string | null
  author_id: string | null
  content: string | null
  likes_count: number
  reply_count: number
  retweet_count: number
  processed: boolean
  should_reply: boolean
  reply_priority: number
  tweet_created_at: string | null
  discovered_at: string
  processed_at: string | null
}

export interface MonitoredTweetInsert {
  tweet_id: string
  community_id?: string
  team_slug?: TeamSlug
  author_username?: string
  author_id?: string
  content?: string
  likes_count?: number
  reply_count?: number
  retweet_count?: number
  reply_priority?: number
  tweet_created_at?: string
}

// =============================================================================
// BOT RESPONSES
// =============================================================================

export type ResponseType = 'reply' | 'original_post' | 'quote_tweet'
export type ResponseStatus = 'pending' | 'posted' | 'failed' | 'cancelled'

export interface BotResponse {
  id: number
  team_slug: TeamSlug
  response_type: ResponseType
  in_reply_to_tweet_id: string | null
  our_tweet_id: string | null
  content: string
  claude_model: string
  prompt_used: string | null
  tokens_used: number | null
  article_id: number | null
  status: ResponseStatus
  error_message: string | null
  engagement_likes: number
  engagement_replies: number
  engagement_retweets: number
  created_at: string
  posted_at: string | null
}

export interface BotResponseInsert {
  team_slug: TeamSlug
  response_type: ResponseType
  content: string
  in_reply_to_tweet_id?: string
  claude_model?: string
  prompt_used?: string
  tokens_used?: number
  article_id?: number
}

// =============================================================================
// KEYWORDS
// =============================================================================

export interface BotKeyword {
  id: number
  team_slug: TeamSlug | null
  keyword: string
  priority_boost: number
  is_negative: boolean
  created_at: string
}

// =============================================================================
// BLOCKED USERS
// =============================================================================

export interface BlockedUser {
  id: number
  twitter_user_id: string
  twitter_username: string | null
  reason: string | null
  blocked_at: string
  blocked_by: string | null
}

// =============================================================================
// BOT LOGS
// =============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface BotLog {
  id: number
  team_slug: TeamSlug | null
  log_level: LogLevel
  action: string
  message: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface BotLogInsert {
  team_slug?: TeamSlug
  log_level?: LogLevel
  action: string
  message?: string
  metadata?: Record<string, unknown>
}

// =============================================================================
// X/TWITTER API TYPES
// =============================================================================

export interface XTweet {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics?: {
    retweet_count: number
    reply_count: number
    like_count: number
    quote_count: number
  }
  conversation_id?: string
  in_reply_to_user_id?: string
  referenced_tweets?: Array<{
    type: 'replied_to' | 'quoted' | 'retweeted'
    id: string
  }>
}

export interface XUser {
  id: string
  name: string
  username: string
  description?: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
  }
}

export interface XSearchResponse {
  data: XTweet[]
  includes?: {
    users?: XUser[]
  }
  meta?: {
    newest_id: string
    oldest_id: string
    result_count: number
    next_token?: string
  }
}

// =============================================================================
// CLAUDE RESPONSE GENERATION
// =============================================================================

export interface GenerateResponseParams {
  team_slug: TeamSlug
  tweet_content: string
  tweet_author?: string
  context?: {
    recent_articles?: Array<{ title: string; url: string }>
    team_stats?: Record<string, unknown>
    current_events?: string[]
  }
  response_type: ResponseType
  max_tokens?: number
}

export interface GeneratedResponse {
  content: string
  tokens_used: number
  model: string
  prompt_used: string
}

// =============================================================================
// BOT OPERATION RESULTS
// =============================================================================

export interface MonitorResult {
  team_slug: TeamSlug
  tweets_found: number
  tweets_processed: number
  replies_queued: number
  errors: string[]
}

export interface PostResult {
  success: boolean
  tweet_id?: string
  error?: string
  response_id?: number
}

export interface BotStatus {
  team_slug: TeamSlug
  enabled: boolean
  community_id: string | null
  today_replies: number
  today_posts: number
  daily_reply_limit: number
  daily_post_limit: number
  can_reply: boolean
  can_post: boolean
  last_activity?: string
  pending_responses: number
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

export interface MonitorRequest {
  team_slug?: TeamSlug
  limit?: number
}

export interface MonitorResponse {
  success: boolean
  results: MonitorResult[]
  timestamp: string
}

export interface GenerateRequest {
  team_slug: TeamSlug
  tweet_id: string
  tweet_content: string
  tweet_author?: string
  force?: boolean
}

export interface GenerateResponse {
  success: boolean
  response_id?: number
  content?: string
  error?: string
}

export interface PostRequest {
  response_id: number
}

export interface PostResponse {
  success: boolean
  tweet_id?: string
  error?: string
}

export interface StatusRequest {
  team_slug?: TeamSlug
}

export interface StatusResponse {
  success: boolean
  statuses: BotStatus[]
}
