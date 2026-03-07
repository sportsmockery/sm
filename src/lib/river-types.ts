// SM 2.0 Feed ("Sports Mockery River") — TypeScript types
// Used by T2 API route and T4/T5 components

export type CardType =
  | 'scout_summary'
  | 'hub_update'
  | 'trade_proposal'
  | 'vision_theater'
  | 'trending_article'
  | 'box_score'
  | 'trending_player'
  | 'fan_chat'
  | 'mock_draft'
  | 'sm_plus'
  | 'infographic'
  | 'chart'
  | 'poll'
  | 'comment_spotlight'
  | 'listen_now'
  | 'join_newsletter'
  | 'download_app';

export type TeamSlug = 'bears' | 'cubs' | 'bulls' | 'blackhawks' | 'white-sox' | 'all';

export type UserSegment = 'anonymous' | 'logged_in' | 'sm_plus';

export type FeedMode = 'for_you' | 'latest' | 'team';

export type GameStatus = 'scheduled' | 'live' | 'final';

export type InteractionAction =
  | 'dwell'
  | 'click'
  | 'hold_scout'
  | 'vote'
  | 'audio_play'
  | 'like'
  | 'share'
  | 'ignore';

// --- River Feed API response types ---

export interface RiverCard {
  card_id: string;
  card_type: CardType;
  tracking_token: string;
  timestamp: string | null;
  content: Record<string, unknown>;
  ui_directives: {
    accent: string;
    interactive_hold?: boolean;
  };
}

export interface FeedMeta {
  next_cursor: string;
  has_more: boolean;
  algorithm_state: string;
}

export interface RiverFeedResponse {
  feed_meta: FeedMeta;
  river_cards: RiverCard[];
}

// --- Table row types ---

export interface SmHubUpdate {
  id: string;
  team_slug: TeamSlug;
  category: string;
  author_name: string;
  author_avatar_url: string | null;
  content: string;
  confidence_pct: number | null;
  is_live: boolean;
  reply_count: number;
  like_count: number;
  feed_eligible: boolean;
  published_at: string;
  created_at: string;
}

export interface SmBoxScore {
  id: string;
  card_id: string;
  team_slug: TeamSlug;
  home_team_abbr: string;
  away_team_abbr: string;
  home_team_logo_url: string | null;
  away_team_logo_url: string | null;
  home_score: number;
  away_score: number;
  game_status: GameStatus;
  quarter_scores: Array<{ q: number; home: number; away: number }>;
  top_performers: Array<{ name: string; stat_line: string; team: string }>;
  game_narrative: string | null;
  game_date: string;
  feed_eligible: boolean;
  target_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SmTradeProposal {
  id: string;
  submitted_by_username: string;
  team_a_slug: string;
  team_b_slug: string;
  team_a_receives: Array<{ player_name: string; position: string; jersey_number: number }>;
  team_b_receives: Array<{ player_name: string; position: string; jersey_number: number }>;
  trade_score: number;
  ai_reasoning: string;
  editor_approved: boolean;
  approved_at: string | null;
  rejected: boolean;
  simulator_trade_id: string | null;
  created_at: string;
}

export interface SmFeedRule {
  id: string;
  card_type: CardType;
  max_per_n_cards: number;
  n_cards_window: number;
  min_gap_cards: number;
  enabled: boolean;
  notes: string | null;
  updated_at: string;
}

export interface SmFeedInteraction {
  id: string;
  tracking_token: string;
  card_id: string;
  card_type: CardType;
  user_segment: UserSegment;
  session_id: string;
  team_slug: TeamSlug | null;
  action: InteractionAction;
  dwell_ms: number | null;
  created_at: string;
}

export interface SmRiverCard {
  id: string;
  user_segment: UserSegment;
  team_filter: string;
  feed_mode: FeedMode;
  cards_json: RiverCard[];
  cursor: string;
  expires_at: string;
  created_at: string;
}
