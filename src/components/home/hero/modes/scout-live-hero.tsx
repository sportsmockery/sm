"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { HeroShell } from "../hero-shell"
import { HeroStatsOrbs } from "@/components/homepage/HeroStatsOrbs"
import type { ScoutLiveContext, LiveSignal, LiveSignalType, QuickAction } from "../types"
import type { ReactNode } from "react"

/* ------------------------------------------------------------------ */
/*  Scout Live Feed Hero                                               */
/*                                                                     */
/*  Real-time intelligence layer. Shows a controlled vertical stream   */
/*  of live signals — rumors, stats, updates, sentiment — with a      */
/*  dynamic headline and optional Scout input.                         */
/*                                                                     */
/*  Design intent: "calm urgency" — live and reactive but readable,   */
/*  structured, and premium. Not noisy, not a dashboard, not Twitter.  */
/* ------------------------------------------------------------------ */

const MAX_VISIBLE_SIGNALS = 5

const SIGNAL_COLORS: Record<LiveSignalType, { dot: string; label: string; bg: string }> = {
  rumor:     { dot: "#BC0000", label: "#BC0000", bg: "rgba(188, 0, 0, 0.06)" },
  scout:     { dot: "#00D4FF", label: "#00D4FF", bg: "rgba(0, 212, 255, 0.06)" },
  update:    { dot: "#D6B05E", label: "#D6B05E", bg: "rgba(214, 176, 94, 0.06)" },
  stat:      { dot: "#00D4FF", label: "#00D4FF", bg: "rgba(0, 212, 255, 0.06)" },
  sentiment: { dot: "#BC0000", label: "#BC0000", bg: "rgba(188, 0, 0, 0.06)" },
  news:      { dot: "#00D4FF", label: "#00D4FF", bg: "rgba(0, 212, 255, 0.06)" },
}

const SIGNAL_LABELS: Record<LiveSignalType, string> = {
  rumor: "Rumor",
  scout: "Scout",
  update: "Update",
  stat: "Stat",
  sentiment: "Fans",
  news: "News",
}

interface ScoutLiveHeroProps {
  context: ScoutLiveContext
  logo?: ReactNode
  quickActions?: QuickAction[]
  onScoutSubmit?: (query: string) => void | Promise<void>
}

export function ScoutLiveHero({
  context,
  logo,
  quickActions,
  onScoutSubmit,
}: ScoutLiveHeroProps) {
  const { headline, summary, signals } = context
  const [visibleSignals, setVisibleSignals] = useState<LiveSignal[]>(
    signals.slice(0, MAX_VISIBLE_SIGNALS)
  )
  const [inputValue, setInputValue] = useState("")
  const prevSignalsRef = useRef(signals)

  // Animate new signals in when the array changes (polling updates)
  useEffect(() => {
    if (signals === prevSignalsRef.current) return
    prevSignalsRef.current = signals

    setVisibleSignals(signals.slice(0, MAX_VISIBLE_SIGNALS))
  }, [signals])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = inputValue.trim()
    if (!q) return
    if (onScoutSubmit) {
      onScoutSubmit(q)
    } else {
      window.location.href = `/scout-ai?q=${encodeURIComponent(q)}`
    }
    setInputValue("")
  }

  return (
    <HeroShell
      logo={logo}
      height="full"
      forceLight
      ariaLabel="Scout Live Feed"
      background={<HeroStatsOrbs />}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        {/* Scout Live badge */}
        <div className="mb-6 flex items-center gap-2">
          <div style={{ borderRadius: '50%', boxShadow: '0 0 14px rgba(0, 212, 255, 0.5), 0 0 6px rgba(0, 212, 255, 0.3)' }}>
            <Image
              src="/downloads/scout-v2.png"
              alt="Scout"
              width={28}
              height={28}
              className="rounded-full"
            />
          </div>
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
            style={{
              backgroundColor: "rgba(0, 212, 255, 0.08)",
              color: "#00D4FF",
              border: "1px solid rgba(0, 212, 255, 0.2)",
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#00D4FF" }}
            />
            Scout Live
          </span>
        </div>

        {/* Dynamic headline */}
        <h1
          className="font-bold tracking-tight"
          style={{
            color: "#FAFAFB",
            fontSize: "clamp(24px, 4vw, 44px)",
            lineHeight: 1.15,
          }}
        >
          {headline}
        </h1>

        {/* Summary */}
        {summary && (
          <p
            className="mt-3 max-w-lg text-base"
            style={{ color: "rgba(250, 250, 251, 0.55)", lineHeight: 1.5 }}
          >
            {summary}
          </p>
        )}

        {/* Chicago flag stars */}
        <div className="mt-3 flex items-center justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#BC0000" aria-hidden="true">
              <polygon points="12,0 14.1,8.5 23.5,9.2 16.2,14.8 18.5,24 12,19 5.5,24 7.8,14.8 0.5,9.2 9.9,8.5" />
            </svg>
          ))}
        </div>

        {/* Signal stream */}
        <div className="mt-8 w-full max-w-xl">
          <div className="flex flex-col gap-2">
            {visibleSignals.map((signal, idx) => (
              <SignalRow key={signal.id} signal={signal} index={idx} />
            ))}
          </div>
        </div>

        {/* Scout input */}
        <form onSubmit={handleSubmit} className="mt-8 w-full max-w-lg">
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2.5"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(0, 212, 255, 0.35)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(250, 250, 251, 0.35)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Scout about this..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[rgba(250,250,251,0.3)]"
              style={{ color: "#FAFAFB" }}
            />
            <button
              type="submit"
              className="rounded-full px-4 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "#BC0000",
                color: "#FAFAFB",
              }}
            >
              Ask Scout
            </button>
          </div>
        </form>

        {/* Quick actions */}
        {quickActions && quickActions.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {quickActions.slice(0, 3).map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  if (onScoutSubmit) {
                    onScoutSubmit(action.value)
                  } else {
                    window.location.href = `/scout-ai?q=${encodeURIComponent(action.value)}`
                  }
                }}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: "transparent",
                  color: "rgba(250, 250, 251, 0.5)",
                  border: "1px solid rgba(0, 212, 255, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0, 212, 255, 0.3)"
                  e.currentTarget.style.color = "#00D4FF"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)"
                  e.currentTarget.style.color = "rgba(250, 250, 251, 0.5)"
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </HeroShell>
  )
}

/* ── Signal Row ── */

function SignalRow({ signal, index }: { signal: LiveSignal; index: number }) {
  const colors = SIGNAL_COLORS[signal.type] || SIGNAL_COLORS.news
  const typeLabel = signal.label || SIGNAL_LABELS[signal.type] || signal.type

  const content = (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-0.5 transition-colors duration-200"
      style={{
        backgroundColor: colors.bg,
        border: "1px solid rgba(0, 212, 255, 0.25)",
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Type indicator */}
      <div className="flex flex-shrink-0 items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: colors.dot }}
        />
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: colors.label, minWidth: 48 }}
        >
          {typeLabel}
        </span>
      </div>

      {/* Message */}
      <p
        className="flex-1 text-sm text-center"
        style={{ color: "rgba(250, 250, 251, 0.85)", margin: 0, lineHeight: 1.4 }}
      >
        {signal.message}
      </p>

      {/* Right side — value or timestamp */}
      <div className="flex flex-shrink-0 items-center gap-2">
        {signal.value && (
          <span
            className="text-xs font-semibold"
            style={{ color: colors.label }}
          >
            {signal.value}
          </span>
        )}
        <span
          className="text-[10px]"
          style={{ color: "rgba(250, 250, 251, 0.3)" }}
        >
          {signal.timestamp}
        </span>
      </div>
    </div>
  )

  if (signal.href) {
    return (
      <a
        href={signal.href}
        className="block rounded-xl transition-all duration-150 hover:scale-[1.005]"
        style={{ textDecoration: "none" }}
      >
        {content}
      </a>
    )
  }

  return content
}
