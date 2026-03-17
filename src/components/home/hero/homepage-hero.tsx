"use client"

import { resolveHeroMode } from "./types"
import type { HomepageHeroProps } from "./types"
import { TrendingFeaturedHero } from "./modes/trending-featured-hero"
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
/*    2. Game Day Hero                                                 */
/*    3. Personalized Team Pulse Hero                                  */
/*    4. Fan Debate Hero                                               */
/*    5. Scout Briefing Hero (default)                                 */
/* ------------------------------------------------------------------ */

export function HomepageHero(props: HomepageHeroProps) {
  const mode = resolveHeroMode(props)

  switch (mode) {
    case "trending":
      return (
        <TrendingFeaturedHero
          story={props.featuredStory!}
          logo={props.logo}
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

export { resolveHeroMode } from "./types"
export type { HomepageHeroProps, HeroModeName } from "./types"
