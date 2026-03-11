"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type QuickAction = {
  id: string
  label: string
  value: string
}

export type HeroMode = "default" | "breaking" | "team" | "analytics" | "debate"

export type EdgeHeroProps = {
  /** User first name — falls back to generic greeting */
  userName?: string
  /** Sub-greeting beneath the user name */
  welcomeMessage?: string
  /** Large headline text */
  headline?: string
  /** Input placeholder */
  placeholder?: string
  /** Chip suggestions under the input */
  quickActions?: QuickAction[]
  /** Override the EDGE logo slot */
  logo?: React.ReactNode
  /** Override the Scout avatar slot */
  scoutAvatar?: React.ReactNode
  /** Pre-fill the input */
  defaultQuery?: string
  /** Spinner / disabled state */
  isLoading?: boolean
  /** Called on submit — if omitted, routes to /ask-ai */
  onSubmit?: (query: string) => void | Promise<void>
  /** Future: switch hero visual mode */
  mode?: HeroMode
  /** Extra classes on the root element */
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EdgeHero({
  userName,
  welcomeMessage = "Welcome to SM\u2736EDGE, our AI-powered platform.",
  headline = "What can I help you with?",
  placeholder = "Ask Scout anything about Chicago sports\u2026",
  quickActions = [],
  logo,
  scoutAvatar,
  defaultQuery = "",
  isLoading = false,
  onSubmit,
  // mode = "default", // reserved for future use
  className,
}: EdgeHeroProps) {
  const [query, setQuery] = React.useState(defaultQuery)
  const router = useRouter()
  const helperId = React.useId()

  const greeting = userName ? `Hi ${userName},` : "Hi there,"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed || isLoading) return

    if (onSubmit) {
      await onSubmit(trimmed)
    } else {
      router.push(`/ask-ai?q=${encodeURIComponent(trimmed)}`)
    }
  }

  function applyQuickAction(value: string) {
    setQuery(value)
  }

  return (
    <section
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{ background: "var(--hp-background)", color: "var(--hp-foreground)" }}
      aria-labelledby="edge-hero-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-5 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16 lg:pt-6">
        {/* ── EDGE logo — top-left, visually light ── */}
        <div className="mb-10 flex items-center justify-start">
          {logo ?? (
            <Image
              src="/edge_logo.png"
              alt="EDGE"
              width={120}
              height={34}
              className="h-8 w-auto object-contain opacity-80"
              priority
            />
          )}
        </div>

        {/* ── Centered hero content ── */}
        <div className="mx-auto flex min-h-[380px] max-w-2xl flex-col items-center justify-center text-center sm:min-h-[420px]">
          {/* ── Scout identity pill ── */}
          <div
            className="mb-5 inline-flex items-center gap-3 rounded-full px-4 py-2"
            style={{
              background: "var(--hp-muted)",
              border: "1px solid var(--hp-border)",
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

            <div className="min-w-0 text-left">
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
                {welcomeMessage}
              </p>
            </div>
          </div>

          {/* ── Headline ── */}
          <div className="w-full max-w-3xl">
            <h1
              id="edge-hero-heading"
              className="mx-auto max-w-3xl text-balance font-bold tracking-tight"
              style={{
                color: "var(--hp-foreground)",
                fontSize: "clamp(48px, 5vw, 72px)",
                lineHeight: 1.1,
              }}
            >
              {headline}
            </h1>

            {/* ── Search input ── */}
            <form onSubmit={handleSubmit} className="mt-7">
              <label htmlFor="edge-hero-input" className="sr-only">
                Ask Scout a question
              </label>

              <div
                className="group relative flex items-center rounded-2xl transition-all duration-200"
                style={{
                  background: "var(--hp-card)",
                  border: "1px solid rgba(188, 0, 0, 0.25)",
                  boxShadow:
                    "0 0 0 0 transparent, 0 4px 20px rgba(0, 0, 0, 0.06)",
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
                  id="edge-hero-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  aria-describedby={helperId}
                  disabled={isLoading}
                  className="h-14 w-full bg-transparent px-5 pr-20 text-base outline-none placeholder:opacity-50 sm:h-16 sm:text-[15px]"
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
                Ask about rumors, players, depth charts, game outlooks, and more.
              </p>

              {/* ── Quick actions ── */}
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
                        border: "1px solid var(--hp-border)",
                        color: "var(--hp-foreground)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(188, 0, 0, 0.3)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--hp-border)"
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
      </div>
    </section>
  )
}
