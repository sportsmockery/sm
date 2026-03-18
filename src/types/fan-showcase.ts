// Fan Showcase types

export const TEAMS = ['bears', 'bulls', 'cubs', 'white_sox', 'blackhawks'] as const
export type Team = (typeof TEAMS)[number]

export const CONTENT_TYPES = ['edit', 'art', 'take', 'fantasy_win'] as const
export type ContentType = (typeof CONTENT_TYPES)[number]

export const SUBMISSION_STATUSES = [
  'pending_review',
  'approved',
  'rejected',
  'changes_requested',
  'featured',
  'archived',
] as const
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

export const SOURCE_PLATFORMS = ['tiktok', 'instagram', 'youtube', 'x', 'other'] as const
export type SourcePlatform = (typeof SOURCE_PLATFORMS)[number]

export const SLOT_TYPES = ['edit_of_week', 'art_gallery', 'take_of_day', 'fantasy_champion'] as const
export type SlotType = (typeof SLOT_TYPES)[number]

export interface FanCreator {
  id: string
  display_name: string
  handle: string | null
  email: string
  bio: string | null
  profile_url: string | null
  avatar_url: string | null
  primary_team: Team
  content_focus: ContentType | null
  social_tag_permission: boolean
  newsletter_feature_permission: boolean
  created_at: string
  updated_at: string
}

export interface FanSubmission {
  id: string
  slug: string
  creator_id: string
  type: ContentType
  team: Team
  title: string
  description: string | null
  written_take: string | null
  source_platform: SourcePlatform | null
  source_url: string | null
  medium: string | null
  league_name: string | null
  fantasy_platform: string | null
  brag_line: string | null
  status: SubmissionStatus
  rights_agreed: boolean
  moderation_acknowledged: boolean
  ownership_confirmed: boolean
  non_infringement_confirmed: boolean
  ai_relevance_score: number | null
  ai_relevance_reason: string | null
  ai_non_chicago_flag: boolean
  ai_safety_flag: boolean
  ai_caption_1: string | null
  ai_caption_2: string | null
  ai_caption_3: string | null
  featured_at: string | null
  viewed_count: number
  submitted_at: string
  created_at: string
  updated_at: string
}

export interface FanSubmissionAsset {
  id: string
  submission_id: string
  asset_type: string
  asset_url: string
  thumbnail_url: string | null
  width: number | null
  height: number | null
  mime_type: string | null
  created_at: string
}

export interface FanSubmissionTag {
  id: string
  submission_id: string
  tag: string
}

export interface FanModerationEvent {
  id: string
  submission_id: string
  action: string
  previous_status: SubmissionStatus | null
  new_status: SubmissionStatus
  note: string | null
  acted_by: string | null
  created_at: string
}

export interface FanFeaturedSlot {
  id: string
  submission_id: string
  slot_type: SlotType
  starts_at: string
  ends_at: string | null
  active: boolean
  created_at: string
}

export interface FanCreatorSimilarityCache {
  id: string
  creator_id: string
  similar_creator_id: string
  score: number
  reason: string | null
  created_at: string
}

// Joined types for display
export interface FanSubmissionWithCreator extends FanSubmission {
  creator: FanCreator
  assets: FanSubmissionAsset[]
  tags: FanSubmissionTag[]
}

export interface FanCreatorWithSubmissions extends FanCreator {
  submissions: FanSubmission[]
}

// Form submission payload
export interface SubmitFormData {
  creator_name: string
  creator_handle: string
  email: string
  type: ContentType
  team: Team
  title: string
  description: string
  written_take?: string
  source_platform?: SourcePlatform
  source_url?: string
  medium?: string
  league_name?: string
  fantasy_platform?: string
  brag_line?: string
  creator_bio?: string
  profile_url?: string
  social_tag_permission: boolean
  newsletter_feature_permission: boolean
  rights_agreed: boolean
  moderation_acknowledged: boolean
  ownership_confirmed: boolean
  non_infringement_confirmed: boolean
}

// Filter params
export interface ShowcaseFilters {
  team?: Team | 'all'
  type?: ContentType | 'all'
  sort?: 'latest' | 'featured' | 'most_viewed'
}

// Display helpers
export const TEAM_LABELS: Record<Team, string> = {
  bears: 'Bears',
  bulls: 'Bulls',
  cubs: 'Cubs',
  white_sox: 'White Sox',
  blackhawks: 'Blackhawks',
}

export const TEAM_FULL_NAMES: Record<Team, string> = {
  bears: 'Chicago Bears',
  bulls: 'Chicago Bulls',
  cubs: 'Chicago Cubs',
  white_sox: 'Chicago White Sox',
  blackhawks: 'Chicago Blackhawks',
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  edit: 'Fan Edit',
  art: 'Fan Art',
  take: 'Fan Take',
  fantasy_win: 'Fantasy Win',
}

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Changes Requested',
  featured: 'Featured',
  archived: 'Archived',
}

export const TEAM_ACCENT_COLORS: Record<Team, string> = {
  bears: '#C83803',
  bulls: '#CE1141',
  cubs: '#0E3386',
  white_sox: '#FFFFFF',
  blackhawks: '#00833E',
}
