/* ------------------------------------------------------------------ */
/*  Homepage Hero System — Shared Types                                */
/* ------------------------------------------------------------------ */

import type { ReactNode } from "react"

/* ── Hero Modes ── */

export type HeroModeName =
  | "trending"
  | "story-universe"
  | "scout-live"
  | "gameday"
  | "team-pulse"
  | "debate"
  | "scout"

/* ── Featured Story ── */

export interface FeaturedStory {
  id: string
  title: string
  dek?: string
  imageUrl: string
  href: string
  views: number
  team?: string
  publishedLabel?: string
  /** Editor override — forces trending hero regardless of views */
  forceHeroFeatured?: boolean
}

/* ── Game Day ── */

export interface GameContext {
  matchup: string
  kickoffLabel: string
  href: string
  storyline?: string
  /** Chicago team logo URL (e.g. ESPN logo) */
  teamLogoUrl?: string
  /** Sport for formatting (nfl, nba, nhl, mlb) */
  sport?: string
  /** Home team score */
  homeScore?: number
  /** Away team score */
  awayScore?: number
  /** Home team abbreviation */
  homeAbbr?: string
  /** Away team abbreviation */
  awayAbbr?: string
  /** Registry game ID for polling */
  gameId?: string
  /** Team slug for polling */
  teamSlug?: string
}

/* ── Team Pulse ── */

export interface TeamContext {
  teamName: string
  topics: string[]
  href: string
}

/* ── Story Universe ── */

export interface StoryUniverseRelatedStory {
  id: string
  title: string
  dek?: string
  href: string
  imageUrl?: string
  /** Optional type label — e.g. "Scout Insight", "Rumor Watch", "Key Stat" */
  label?: string
}

export interface StoryUniverseContext {
  mainStory: FeaturedStory
  relatedStories: [StoryUniverseRelatedStory, StoryUniverseRelatedStory]
}

/* ── Scout Live Feed ── */

export type LiveSignalType = "rumor" | "scout" | "update" | "stat" | "sentiment" | "news"

export interface LiveSignal {
  id: string
  type: LiveSignalType
  /** Optional type label override (e.g. "Rumor Watch") */
  label?: string
  message: string
  timestamp: string
  /** Optional value for stats/confidence (e.g. "68%", "Bottom 5") */
  value?: string
  href?: string
}

export interface ScoutLiveContext {
  headline: string
  summary: string
  signals: LiveSignal[]
}

/* ── Fan Debate ── */

export interface DebateContext {
  question: string
  sentimentLabel?: string
  href: string
}

/* ── Quick Action chips (Scout mode) ── */

export interface QuickAction {
  id: string
  label: string
  value: string
}

/* ── User ── */

export interface HeroUser {
  name?: string
  primaryTeam?: string
}

/* ── Composite props for the controller ── */

export interface HomepageHeroProps {
  user?: HeroUser
  featuredStory?: FeaturedStory | null
  storyUniverseContext?: StoryUniverseContext | null
  scoutLiveContext?: ScoutLiveContext | null
  gameContexts?: GameContext[]
  teamContext?: TeamContext | null
  debateContext?: DebateContext | null
  quickActions?: QuickAction[]
  logo?: ReactNode
  scoutAvatar?: ReactNode
  onScoutSubmit?: (query: string) => void | Promise<void>
  className?: string
}

/* ── Trending threshold ── */

export const TRENDING_VIEW_THRESHOLD = 2500

/**
 * Determines if a featured story qualifies for the Trending Article
 * Featured Hero. Uses hard view threshold + optional editor override.
 *
 * Designed to be expanded later with: views velocity, engagement
 * velocity, comments/reactions, recency weighting, user team weighting.
 */
export function isTrendingStory(story: FeaturedStory | null | undefined): boolean {
  if (!story) return false
  if (story.forceHeroFeatured) return true
  return story.views >= TRENDING_VIEW_THRESHOLD
}

/**
 * Resolve which hero mode should render.
 *
 * Priority:
 *  1. Trending Article Featured Hero (views >= 2500)
 *  2. Story Universe (editor-curated cluster)
 *  3. Scout Live Feed (3+ recent signals)
 *  4. Game Day Hero
 *  5. Personalized Team Pulse Hero
 *  6. Fan Debate Hero
 *  7. Scout Briefing Hero (default)
 */
export function resolveHeroMode(props: HomepageHeroProps): HeroModeName {
  if (
    props.featuredStory &&
    isTrendingStory(props.featuredStory) &&
    props.featuredStory.imageUrl &&
    props.featuredStory.href
  ) {
    return "trending"
  }

  // 2. Story Universe — editor-curated story cluster
  if (
    props.storyUniverseContext &&
    props.storyUniverseContext.mainStory &&
    props.storyUniverseContext.mainStory.imageUrl &&
    props.storyUniverseContext.mainStory.href &&
    props.storyUniverseContext.relatedStories?.length === 2
  ) {
    return "story-universe"
  }

  // 3. Scout Live Feed — real-time intelligence signals
  if (
    props.scoutLiveContext &&
    props.scoutLiveContext.headline &&
    props.scoutLiveContext.signals?.length >= 3
  ) {
    return "scout-live"
  }

  if (props.gameContexts && props.gameContexts.length > 0 && props.gameContexts[0].matchup && props.gameContexts[0].href) {
    return "gameday"
  }

  if (
    props.user?.primaryTeam &&
    props.teamContext?.teamName &&
    props.teamContext?.href
  ) {
    return "team-pulse"
  }

  if (props.debateContext?.question && props.debateContext?.href) {
    return "debate"
  }

  return "scout"
}
