"use client"

import { HeroShell, HeroCta } from "../hero-shell"
import { HeroStatsOrbs } from "@/components/homepage/HeroStatsOrbs"
import type { TeamContext, HeroUser } from "../types"
import type { ReactNode } from "react"

/* ------------------------------------------------------------------ */
/*  Personalized Team Pulse Hero                                       */
/*  Team-centered hero for logged-in users with a primary team.        */
/* ------------------------------------------------------------------ */

interface TeamPulseHeroProps {
  team: TeamContext
  user: HeroUser
  logo?: ReactNode
}

export function TeamPulseHero({ team, user, logo }: TeamPulseHeroProps) {
  return (
    <HeroShell
      logo={logo}
      ariaLabel={`${team.teamName} Pulse`}
      background={<HeroStatsOrbs />}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Greeting */}
        <p
          className="mb-2 text-base sm:text-lg"
          style={{ color: "var(--hp-muted-foreground)" }}
        >
          {user.name ? `Welcome back, ${user.name}` : "Welcome back"}
        </p>

        {/* Team name headline */}
        <h1
          className="font-bold tracking-tight"
          style={{
            color: "var(--hp-foreground)",
            fontSize: "clamp(36px, 5vw, 64px)",
            lineHeight: 1.1,
          }}
        >
          {team.teamName}
        </h1>

        {/* Pulse label */}
        <p
          className="mt-2 text-sm font-medium uppercase tracking-wider"
          style={{ color: "#00D4FF" }}
        >
          Team Pulse
        </p>

        {/* Trending topics */}
        {team.topics.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {team.topics.map((topic, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
                style={{
                  background: "var(--hp-muted)",
                  border: "1px solid #00D4FF",
                  color: "var(--hp-foreground)",
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8">
          <HeroCta href={team.href}>
            Enter {team.teamName.split(" ").pop()} HQ
          </HeroCta>
        </div>
      </div>
    </HeroShell>
  )
}
