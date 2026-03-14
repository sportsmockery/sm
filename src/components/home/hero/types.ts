/* ------------------------------------------------------------------ */
/*  Homepage Hero System — Shared Types                                */
/* ------------------------------------------------------------------ */

import type { ReactNode } from "react"

/* ── Hero Modes ── */

export type HeroModeName =
  | "trending"
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
}

/* ── Team Pulse ── */

export interface TeamContext {
  teamName: string
  topics: string[]
  href: string
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
  gameContext?: GameContext | null
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
 *  1. Trending Article Featured Hero
 *  2. Game Day Hero
 *  3. Personalized Team Pulse Hero
 *  4. Fan Debate Hero
 *  5. Scout Briefing Hero (default)
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

  if (props.gameContext?.matchup && props.gameContext?.href) {
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
