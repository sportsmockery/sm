"use client"

import { useEffect, useMemo } from "react"
import { resolveHeroMode, isTrendingStory } from "./types"
import type { HomepageHeroProps, HeroModeName } from "./types"
import { TrendingFeaturedHero } from "./modes/trending-featured-hero"
import { StoryUniverseHero } from "./modes/story-universe-hero"
import { ScoutLiveHero } from "./modes/scout-live-hero"
import { GameDayHero } from "./modes/game-day-hero"
import { TeamPulseHero } from "./modes/team-pulse-hero"
import { DebateHero } from "./modes/debate-hero"
import { ScoutBriefingHero } from "./modes/scout-briefing-hero"

/* ------------------------------------------------------------------ */
/*  Homepage Hero Controller                                           */
/*                                                                     */
/*  Resolves the active hero mode from available context and renders   */
/*  the appropriate mode component. Only one mode renders at a time.   */
/*                                                                     */
/*  Priority:                                                          */
/*    1. Trending Article Featured Hero                                */
/*    2. Story Universe                                                */
/*    3. Scout Live Feed                                               */
/*    4. Game Day Hero                                                 */
/*    5. Personalized Team Pulse Hero                                  */
/*    6. Fan Debate Hero                                               */
/*    7. Scout Briefing Hero (default)                                 */
/*                                                                     */
/*  Visit cap: Logged-in users see a hero takeover (trending or        */
/*  story-universe) max 2 visits per article. If both qualify,         */
/*  they alternate across visits so the user sees both.                */
/* ------------------------------------------------------------------ */

const HERO_VIEWS_KEY = "sm_hero_takeover_views"

interface HeroViewRecord {
  [articleId: string]: number // visit count per article
}

function getHeroViews(): HeroViewRecord {
  try {
    const raw = localStorage.getItem(HERO_VIEWS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function recordHeroView(articleId: string): void {
  try {
    const views = getHeroViews()
    views[articleId] = (views[articleId] || 0) + 1
    localStorage.setItem(HERO_VIEWS_KEY, JSON.stringify(views))
  } catch {
    // localStorage unavailable
  }
}

function hasExceededViewCap(articleId: string, cap: number): boolean {
  const views = getHeroViews()
  return (views[articleId] || 0) >= cap
}

export function HomepageHero(props: HomepageHeroProps) {
  const isLoggedIn = !!props.user?.name

  // Determine the mode, applying visit-cap logic for logged-in users
  const mode = useMemo(() => {
    const baseMode = resolveHeroMode(props)

    // Visit cap only applies to logged-in users on takeover modes
    if (!isLoggedIn) return baseMode
    if (baseMode !== "trending" && baseMode !== "story-universe") return baseMode

    // Check if both takeover modes qualify
    const trendingQualifies =
      props.featuredStory &&
      isTrendingStory(props.featuredStory) &&
      props.featuredStory.imageUrl &&
      props.featuredStory.href
    const storyUniverseQualifies =
      props.storyUniverseContext?.mainStory?.imageUrl &&
      props.storyUniverseContext?.mainStory?.href &&
      props.storyUniverseContext?.relatedStories?.length === 2

    const trendingId = props.featuredStory?.id
    const storyUniverseId = props.storyUniverseContext?.mainStory?.id

    const trendingCapped = trendingId ? hasExceededViewCap(trendingId, 2) : true
    const storyUniverseCapped = storyUniverseId ? hasExceededViewCap(storyUniverseId, 2) : true

    // Both qualify — alternate between them
    if (trendingQualifies && storyUniverseQualifies) {
      if (baseMode === "trending" && trendingCapped && !storyUniverseCapped) {
        return "story-universe" as HeroModeName
      }
      if (baseMode === "story-universe" && storyUniverseCapped && !trendingCapped) {
        return "trending" as HeroModeName
      }
    }

    // Only one qualifies — check if it's capped
    if (baseMode === "trending" && trendingCapped) {
      // If story universe is available and not capped, show it instead
      if (storyUniverseQualifies && !storyUniverseCapped) {
        return "story-universe" as HeroModeName
      }
      // Both capped or only trending available — fall through to next priority
      return resolveHeroModeSkippingTakeovers(props)
    }
    if (baseMode === "story-universe" && storyUniverseCapped) {
      if (trendingQualifies && !trendingCapped) {
        return "trending" as HeroModeName
      }
      return resolveHeroModeSkippingTakeovers(props)
    }

    return baseMode
  }, [props, isLoggedIn])

  // Record the view for takeover modes (logged-in users only)
  useEffect(() => {
    if (!isLoggedIn) return
    if (mode === "trending" && props.featuredStory?.id) {
      recordHeroView(props.featuredStory.id)
    } else if (mode === "story-universe" && props.storyUniverseContext?.mainStory?.id) {
      recordHeroView(props.storyUniverseContext.mainStory.id)
    }
  }, [mode, isLoggedIn, props.featuredStory?.id, props.storyUniverseContext?.mainStory?.id])

  switch (mode) {
    case "trending":
      return (
        <TrendingFeaturedHero
          story={props.featuredStory!}
          logo={props.logo}
        />
      )

    case "story-universe":
      return (
        <StoryUniverseHero
          context={props.storyUniverseContext!}
          logo={props.logo}
        />
      )

    case "scout-live":
      return (
        <ScoutLiveHero
          context={props.scoutLiveContext!}
          logo={props.logo}
          quickActions={props.quickActions}
          onScoutSubmit={props.onScoutSubmit}
        />
      )

    case "gameday":
      return (
        <GameDayHero
          games={props.gameContexts!}
          logo={props.logo}
        />
      )

    case "team-pulse":
      return (
        <TeamPulseHero
          team={props.teamContext!}
          user={props.user!}
          logo={props.logo}
        />
      )

    case "debate":
      return (
        <DebateHero
          debate={props.debateContext!}
          logo={props.logo}
        />
      )

    case "scout":
    default:
      return (
        <ScoutBriefingHero
          user={props.user}
          quickActions={props.quickActions}
          scoutAvatar={props.scoutAvatar}
          logo={props.logo}
          onSubmit={props.onScoutSubmit}
        />
      )
  }
}

/**
 * Resolve hero mode skipping trending and story-universe (for when
 * a logged-in user has exceeded the view cap on all takeover articles).
 */
function resolveHeroModeSkippingTakeovers(props: HomepageHeroProps): HeroModeName {
  // 3. Scout Live Feed
  if (
    props.scoutLiveContext &&
    props.scoutLiveContext.headline &&
    props.scoutLiveContext.signals?.length >= 3
  ) {
    return "scout-live"
  }

  // 4. Game Day
  if (props.gameContexts && props.gameContexts.length > 0 && props.gameContexts[0].matchup && props.gameContexts[0].href) {
    return "gameday"
  }

  // 5. Team Pulse
  if (
    props.user?.primaryTeam &&
    props.teamContext?.teamName &&
    props.teamContext?.href
  ) {
    return "team-pulse"
  }

  // 6. Debate
  if (props.debateContext?.question && props.debateContext?.href) {
    return "debate"
  }

  // 7. Scout (default)
  return "scout"
}

export { resolveHeroMode } from "./types"
export type { HomepageHeroProps, HeroModeName } from "./types"
