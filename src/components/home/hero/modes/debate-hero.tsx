"use client"

import { HeroShell, HeroCta } from "../hero-shell"
import { HeroStatsOrbs } from "@/components/homepage/HeroStatsOrbs"
import type { DebateContext } from "../types"
import type { ReactNode } from "react"

/* ------------------------------------------------------------------ */
/*  Fan Debate Hero                                                    */
/*  Bold debate question with optional sentiment indicator.            */
/* ------------------------------------------------------------------ */

interface DebateHeroProps {
  debate: DebateContext
  logo?: ReactNode
}

export function DebateHero({ debate, logo }: DebateHeroProps) {
  return (
    <HeroShell
      logo={logo}
      ariaLabel="Fan Debate"
      background={<HeroStatsOrbs />}
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Eyebrow */}
        <span
          className="mb-5 inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wider"
          style={{
            backgroundColor: "rgba(0, 212, 255, 0.08)",
            color: "#00D4FF",
            border: "1px solid rgba(0, 212, 255, 0.15)",
          }}
        >
          Fan Debate
        </span>

        {/* Debate question */}
        <h1
          className="font-bold tracking-tight"
          style={{
            color: "var(--hp-foreground)",
            fontSize: "clamp(32px, 4.5vw, 56px)",
            lineHeight: 1.15,
          }}
        >
          {debate.question}
        </h1>

        {/* Sentiment */}
        {debate.sentimentLabel && (
          <p
            className="mt-4 text-base font-medium sm:text-lg"
            style={{ color: "var(--hp-muted-foreground)" }}
          >
            {debate.sentimentLabel}
          </p>
        )}

        {/* CTA */}
        <div className="mt-8">
          <HeroCta href={debate.href}>Join Debate</HeroCta>
        </div>
      </div>
    </HeroShell>
  )
}
