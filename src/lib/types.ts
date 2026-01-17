/**
 * Core types for SportsMockery
 * Bears-first Chicago sports site architecture
 */

// Team slugs for Chicago sports
export type TeamSlug = 'bears' | 'cubs' | 'white-sox' | 'bulls' | 'blackhawks'

/**
 * Map category slugs from database to normalized team slugs
 */
export function categorySlugToTeam(slug: string | null | undefined): TeamSlug {
  if (!slug) return 'bears' // Default to Bears

  const normalized = slug.toLowerCase()

  if (normalized.includes('bear')) return 'bears'
  if (normalized.includes('cub')) return 'cubs'
  if (normalized.includes('white') || normalized.includes('sox')) return 'white-sox'
  if (normalized.includes('bull')) return 'bulls'
  if (normalized.includes('hawk') || normalized.includes('black')) return 'blackhawks'

  return 'bears' // Default to Bears for unknown categories
}

/**
 * Author information
 */
export interface Author {
  id: number
  displayName: string
  bio: string | null
  avatarUrl: string | null
  email?: string | null
  slug?: string | null
}

/**
 * Full post with all content
 */
export interface Post {
  id: number
  slug: string
  title: string
  excerpt: string | null
  contentHtml: string
  featuredImage: string | null
  publishedAt: string
  status: 'draft' | 'published'
  views: number
  importanceScore: number
  author: Author
  team: TeamSlug
  categorySlug: string
  categoryName: string
  seoTitle?: string | null
  seoDescription?: string | null
}

/**
 * Lightweight post for lists and cards
 */
export interface PostSummary {
  id: number
  slug: string
  title: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: string
  views: number
  author: {
    id: number
    displayName: string
    avatarUrl: string | null
  }
  team: TeamSlug
  categorySlug: string
  categoryName: string
}

/**
 * Team branding information
 */
export interface TeamInfo {
  slug: TeamSlug
  name: string
  shortName: string
  primaryColor: string
  secondaryColor: string
  logoUrl: string
  city: string
  sport: 'football' | 'baseball' | 'basketball' | 'hockey'
}

/**
 * Team information lookup
 */
export const TEAM_INFO: Record<TeamSlug, TeamInfo> = {
  bears: {
    slug: 'bears',
    name: 'Chicago Bears',
    shortName: 'Bears',
    primaryColor: '#0B162A', // Navy
    secondaryColor: '#C83803', // Orange
    logoUrl: '/images/teams/bears-logo.png',
    city: 'Chicago',
    sport: 'football',
  },
  cubs: {
    slug: 'cubs',
    name: 'Chicago Cubs',
    shortName: 'Cubs',
    primaryColor: '#0E3386', // Blue
    secondaryColor: '#CC3433', // Red
    logoUrl: '/images/teams/cubs-logo.png',
    city: 'Chicago',
    sport: 'baseball',
  },
  'white-sox': {
    slug: 'white-sox',
    name: 'Chicago White Sox',
    shortName: 'White Sox',
    primaryColor: '#27251F', // Black
    secondaryColor: '#C4CED4', // Silver
    logoUrl: '/images/teams/whitesox-logo.png',
    city: 'Chicago',
    sport: 'baseball',
  },
  bulls: {
    slug: 'bulls',
    name: 'Chicago Bulls',
    shortName: 'Bulls',
    primaryColor: '#CE1141', // Red
    secondaryColor: '#000000', // Black
    logoUrl: '/images/teams/bulls-logo.png',
    city: 'Chicago',
    sport: 'basketball',
  },
  blackhawks: {
    slug: 'blackhawks',
    name: 'Chicago Blackhawks',
    shortName: 'Blackhawks',
    primaryColor: '#CF0A2C', // Red
    secondaryColor: '#000000', // Black
    logoUrl: '/images/teams/blackhawks-logo.png',
    city: 'Chicago',
    sport: 'hockey',
  },
}

/**
 * Team spotlight data for homepage
 */
export interface TeamSpotlightData {
  team: TeamSlug
  latestPosts: PostSummary[]
  quickStats: {
    record?: string
    standing?: string
    streak?: string
    nextGame?: string
  }
}

/**
 * Homepage spotlight data for all teams
 */
export interface HomepageSpotlight {
  bears: TeamSpotlightData
  cubs: TeamSpotlightData
  'white-sox': TeamSpotlightData
  bulls: TeamSpotlightData
  blackhawks: TeamSpotlightData
}

/**
 * Timeline item for homepage feed
 */
export interface HomepageTimelineItem {
  id: number
  type: 'post' | 'breaking' | 'rumor'
  post: PostSummary
  timestamp: string
  isBreaking?: boolean
}

/**
 * Team hub data
 */
export interface TeamHubData {
  team: TeamSlug
  info: TeamInfo
  featuredPosts: PostSummary[]
  recentPosts: PostSummary[]
  totalPosts: number
}

/**
 * Bears-specific types
 */
export interface BearsSeasonOverview {
  season: number
  record: {
    wins: number
    losses: number
    ties: number
  }
  standing: string
  nextGame: {
    opponent: string
    date: string
    time: string
    isHome: boolean
  } | null
  lastGame: {
    opponent: string
    result: 'W' | 'L' | 'T'
    score: string
  } | null
}

export interface BearsPlayer {
  id: number
  name: string
  position: string
  number: number
  imageUrl?: string
  stats?: Record<string, string | number>
}

export interface BearsTrend {
  id: number
  title: string
  slug: string
  postCount: number
  isHot?: boolean
}

/**
 * User preferences for personalization
 */
export interface UserPreferences {
  userId: string
  favoriteTeams: TeamSlug[]
  notificationPrefs: Record<string, boolean>
  createdAt: string
  updatedAt: string
}
