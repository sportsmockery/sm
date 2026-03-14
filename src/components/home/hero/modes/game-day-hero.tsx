"use client"

import { HeroShell, HeroCta } from "../hero-shell"
import { HeroStatsOrbs } from "@/components/homepage/HeroStatsOrbs"
import type { GameContext } from "../types"
import type { ReactNode } from "react"

/* ------------------------------------------------------------------ */
/*  Game Day Hero                                                      */
/*  Shows matchup, game time, and a supporting storyline.              */
/* ------------------------------------------------------------------ */

interface GameDayHeroProps {
  game: GameContext
  logo?: ReactNode
}

export function GameDayHero({ game, logo }: GameDayHeroProps) {
  return (
    <HeroShell
      logo={logo}
      ariaLabel={`Game Day: ${game.matchup}`}
      background={<HeroStatsOrbs />}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Eyebrow */}
        <span
          className="mb-5 inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider"
          style={{
            backgroundColor: "rgba(188, 0, 0, 0.08)",
            color: "#BC0000",
            border: "1px solid rgba(188, 0, 0, 0.15)",
          }}
        >
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: "#BC0000" }}
          />
          Game Day
        </span>

        {/* Matchup headline */}
        <h1
          className="font-bold tracking-tight"
          style={{
            color: "var(--hp-foreground)",
            fontSize: "clamp(36px, 5vw, 64px)",
            lineHeight: 1.1,
          }}
        >
          {game.matchup}
        </h1>

        {/* Kickoff time */}
        <p
          className="mt-4 text-lg font-medium sm:text-xl"
          style={{ color: "#00D4FF" }}
        >
          {game.kickoffLabel}
        </p>

        {/* Storyline */}
        {game.storyline && (
          <p
            className="mt-3 max-w-lg text-base"
            style={{ color: "var(--hp-muted-foreground)", lineHeight: 1.5 }}
          >
            {game.storyline}
          </p>
        )}

        {/* CTA */}
        <div className="mt-8">
          <HeroCta href={game.href}>Open Game Hub</HeroCta>
        </div>
      </div>
    </HeroShell>
  )
}
