"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { HeroShell } from "../hero-shell"
import { HeroStatsOrbs } from "@/components/homepage/HeroStatsOrbs"
import type { HeroUser, QuickAction } from "../types"

/* ------------------------------------------------------------------ */
/*  Scout Briefing Hero                                                */
/*  Default fallback mode. Scout identity + search input.              */
/*  Preserves the spirit of the current edge-hero.tsx.                 */
/* ------------------------------------------------------------------ */

const FALLBACK_PLACEHOLDERS = [
  "Why did the Bears lose Sunday?",
  "Is Caleb Williams improving?",
  "Should the Cubs trade Bellinger?",
  "What\u2019s wrong with the Bulls defense?",
  "Are the Blackhawks rebuilding correctly?",
]

const ROTATION_INTERVAL = 5000

interface ScoutBriefingHeroProps {
  user?: HeroUser
  quickActions?: QuickAction[]
  scoutAvatar?: React.ReactNode
  logo?: React.ReactNode
  onSubmit?: (query: string) => void | Promise<void>
}

export function ScoutBriefingHero({
  user,
  quickActions = [],
  scoutAvatar,
  logo,
  onSubmit,
}: ScoutBriefingHeroProps) {
  const [query, setQuery] = React.useState("")
  const [placeholderIdx, setPlaceholderIdx] = React.useState(0)
  const [isFading, setIsFading] = React.useState(false)
  const [inputFocused, setInputFocused] = React.useState(false)
  const [prompts, setPrompts] = React.useState(FALLBACK_PLACEHOLDERS)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const helperId = React.useId()

  // Fetch daily Scout-generated prompts on mount
  React.useEffect(() => {
    fetch("/api/scout-prompts")
      .then((r) => r.json())
      .then((d) => {
        if (d.prompts?.length >= 5) setPrompts(d.prompts)
      })
      .catch(() => {})
  }, [])

  // Rotate placeholders
  React.useEffect(() => {
    if (inputFocused || query) return
    const id = setInterval(() => {
      setIsFading(true)
      setTimeout(() => {
        setPlaceholderIdx((i) => (i + 1) % prompts.length)
        setIsFading(false)
      }, 200)
    }, ROTATION_INTERVAL)
    return () => clearInterval(id)
  }, [inputFocused, query, prompts])

  const activePlaceholder = prompts[placeholderIdx]
  const greeting = user?.name ? `Hi ${user.name},` : "Hi there,"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed || isLoading) return

    setIsLoading(true)
    try {
      if (onSubmit) {
        await onSubmit(trimmed)
      } else {
        router.push(`/scout-ai?q=${encodeURIComponent(trimmed)}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  function applyQuickAction(value: string) {
    setQuery(value)
  }

  return (
    <HeroShell logo={logo} ariaLabel="Scout Briefing" background={<HeroStatsOrbs />}>
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {/* Scout identity pill — cyan border */}
        <div
          className="mb-5 inline-flex gap-3 rounded-full px-4 py-3"
          style={{
            background: "var(--hp-muted)",
            border: "1px solid #00D4FF",
            alignItems: "center",
          }}
        >
          <div className="shrink-0">
            {scoutAvatar ?? (
              <Image
                src="/downloads/scout-v2.png"
                alt="Scout"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-contain"
              />
            )}
          </div>

          <div className="min-w-0 text-left" style={{ transform: "translateY(9px)" }}>
            <div
              className="text-base font-semibold leading-tight sm:text-lg"
              style={{ color: "var(--hp-foreground)" }}
            >
              {greeting}
            </div>
            <p
              className="text-sm leading-snug sm:text-[15px]"
              style={{ color: "var(--hp-muted-foreground)" }}
            >
              Welcome to{" "}
              <span style={{ color: "#00D4FF" }}>SM</span>
              <span style={{ color: "#BC0000" }}>&#x2736;</span>
              <span style={{ color: "#00D4FF" }}>EDGE</span>, our{" "}
              <strong>NEW</strong> AI-powered platform.
            </p>
          </div>
        </div>

        {/* Headline */}
        <div className="w-full">
          <h1
            className="text-balance font-bold tracking-tight md:whitespace-nowrap md:-ml-[45px]"
            style={{
              color: "var(--hp-foreground)",
              fontSize: "clamp(48px, 5vw, 72px)",
              lineHeight: 1.1,
            }}
          >
            What can I help you with?
          </h1>

          {/* Search input */}
          <form onSubmit={handleSubmit} className="mt-7">
            <label htmlFor="scout-hero-input" className="sr-only">
              Ask Scout a question
            </label>

            <div
              className="group relative flex items-center rounded-2xl transition-all duration-200"
              style={{
                background: "var(--hp-card)",
                border: "1px solid rgba(188, 0, 0, 0.25)",
                boxShadow: "0 0 0 0 transparent, 0 4px 20px rgba(0, 0, 0, 0.06)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(188, 0, 0, 0.45)"
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(188, 0, 0, 0.08), 0 4px 20px rgba(0, 0, 0, 0.06)"
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  e.currentTarget.style.borderColor = "rgba(188, 0, 0, 0.25)"
                  e.currentTarget.style.boxShadow =
                    "0 0 0 0 transparent, 0 4px 20px rgba(0, 0, 0, 0.06)"
                }
              }}
            >
              <input
                id="scout-hero-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={activePlaceholder}
                aria-describedby={helperId}
                disabled={isLoading}
                className={`h-14 w-full bg-transparent px-5 pr-20 text-base outline-none sm:h-16 sm:text-[15px] placeholder:transition-opacity placeholder:duration-200 ${
                  isFading ? "placeholder:opacity-0" : "placeholder:opacity-50"
                }`}
                style={{ color: "var(--hp-foreground)" }}
              />

              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-2 inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:h-11"
                style={{
                  backgroundColor: "#BC0000",
                  color: "#FAFAFB",
                }}
                aria-label="Submit question"
              >
                {isLoading ? "\u2026" : "Ask"}
              </button>
            </div>

            <p
              id={helperId}
              className="mt-3 text-sm"
              style={{ color: "var(--hp-muted-foreground)" }}
            >
              Introducing{" "}
              <span style={{ color: "#BC0000", fontWeight: 700 }}>Scout</span> — the AI
              analyst for Chicago sports. Ask about news, rumors, stats, etc.
            </p>

            {/* Quick actions — cyan borders */}
            {quickActions.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => applyQuickAction(action.value)}
                    className="inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition-colors"
                    style={{
                      background: "var(--hp-muted)",
                      border: "1px solid #00D4FF",
                      color: "var(--hp-foreground)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#00B8DB"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#00D4FF"
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </HeroShell>
  )
}
