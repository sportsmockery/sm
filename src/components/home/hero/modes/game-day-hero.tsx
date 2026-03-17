"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { HeroShell, HeroCta } from "../hero-shell"
import { HeroStatsOrbs } from "@/components/homepage/HeroStatsOrbs"
import type { GameContext } from "../types"
import type { ReactNode } from "react"

/* ------------------------------------------------------------------ */
/*  Game Day Hero                                                      */
/*  Shows matchup, game time, scores, and a supporting storyline.      */
/*  Rotates between multiple games with dot indicators.                */
/*  Polls /api/hero-games every 10s for live score updates.            */
/* ------------------------------------------------------------------ */

const ROTATION_INTERVAL = 10_000
const POLL_INTERVAL = 10_000

interface GameDayHeroProps {
  games: GameContext[]
  logo?: ReactNode
}

export function GameDayHero({ games: initialGames, logo }: GameDayHeroProps) {
  const [games, setGames] = useState(initialGames)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const count = games.length

  const rotateTo = useCallback(
    (next: number) => {
      setIsFading(true)
      setTimeout(() => {
        setActiveIndex((prev) => {
          // Ensure we don't go out of bounds if games array changed
          return next < count ? next : 0
        })
        setIsFading(false)
      }, 250)
    },
    [count],
  )

  // Auto-rotate every 10s when multiple games
  useEffect(() => {
    if (count <= 1) return
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % count
        setIsFading(true)
        setTimeout(() => setIsFading(false), 250)
        return next
      })
    }, ROTATION_INTERVAL)
    return () => clearInterval(id)
  }, [count])

  // Poll /api/hero-games every 10s for live updates
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/hero-games")
        if (!res.ok) return
        const data = await res.json()
        if (data.games && data.games.length > 0) {
          setGames(data.games)
        }
      } catch {
        // Silent — keep showing stale data
      }
    }

    pollRef.current = setInterval(poll, POLL_INTERVAL)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const game = games[activeIndex] || games[0]
  if (!game) return null

  // Determine if game is live (has scores to show)
  const isLive = game.kickoffLabel?.startsWith("LIVE")
  const hasScores = isLive && (game.homeScore !== undefined || game.awayScore !== undefined)

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
            backgroundColor: "rgba(34, 197, 94, 0.08)",
            color: "#22C55E",
            border: "1px solid rgba(34, 197, 94, 0.15)",
          }}
        >
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: "#22C55E" }}
          />
          Game Day
        </span>

        {/* Rotating content — fade transition */}
        <div
          style={{
            transition: "opacity 250ms ease-in-out",
            opacity: isFading ? 0 : 1,
          }}
        >
          {/* Team logo */}
          {game.teamLogoUrl && (
            <div className="mb-5 flex justify-center">
              <Image
                src={game.teamLogoUrl}
                alt=""
                width={72}
                height={72}
                className="h-[72px] w-[72px] object-contain"
                unoptimized
              />
            </div>
          )}

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

          {/* Kickoff time / live status */}
          <p
            className="mt-4 text-lg font-medium sm:text-xl"
            style={{ color: "#00D4FF" }}
          >
            {game.kickoffLabel}
          </p>

          {/* Score — cyan, shown for all games */}
          {hasScores && (
            <p
              className="mt-3 text-2xl font-bold sm:text-3xl"
              style={{ color: "#00D4FF" }}
            >
              {game.awayAbbr} {game.awayScore} — {game.homeAbbr} {game.homeScore}
            </p>
          )}

          {/* Storyline */}
          {game.storyline && (
            <p
              className="mt-3 max-w-lg text-base mx-auto"
              style={{ color: "var(--hp-muted-foreground)", lineHeight: 1.5 }}
            >
              {game.storyline}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8">
          <HeroCta href={game.href}>{isLive ? "Open Game Center" : "Go to Team Hub"}</HeroCta>
        </div>

        {/* Dot indicators — only when multiple games */}
        {count > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
            {games.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => rotateTo(i)}
                aria-label={`Show game ${i + 1}`}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === activeIndex ? 24 : 8,
                  height: 8,
                  backgroundColor:
                    i === activeIndex ? "#BC0000" : "var(--hp-muted-foreground, rgba(255,255,255,0.3))",
                  opacity: i === activeIndex ? 1 : 0.4,
                  cursor: "pointer",
                  border: "none",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </HeroShell>
  )
}
