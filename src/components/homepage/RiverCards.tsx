"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MessageCircle, Share, Eye,
  TrendingUp, Play, Clock, Check, X, ChevronRight,
  BarChart3, Users, Activity
} from "lucide-react"
import { useAudioPlayer } from "@/context/AudioPlayerContext"
import { homepageTeams } from "@/lib/homepage-team-data"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
/** Pinwheels & Ivy logo — top right of PI cards. */
const PI_LOGO_SRC = "/youtubelogos/pi-logo.png"
/** Pinwheels & Ivy logo for top left of PI cards (pinwheel + "Pinwheels and Ivy" text). */
const PI_LOGO_LEFT_SRC = "/downloads/pinwheels-ivy-logo.png"
const PI_LOGO_LEFT_DARK_SRC = "/downloads/pinwheels-ivy-logo-dark.png"
/** Untold Chicago logo for video cards from Untold Chicago. */
const UNTOLD_LOGO_SRC = "/downloads/untold-logo.png"
const UNTOLD_LOGO_DARK_SRC = "/downloads/untold-logo-dark.png"

function isPinwheelsAndIvy(source: string | undefined): boolean {
  if (!source || typeof source !== 'string') return false
  const n = source.toLowerCase().replace(/\s+/g, ' ').trim()
  return (
    n.includes('pinwheels') ||
    (n.includes('pinwheel') && n.includes('ivy')) ||
    n.includes('pinwheels and ivy') ||
    n.includes('pinwheels & ivy') ||
    n.includes('p&i') ||
    (n.includes('cubs') && n.includes('white sox'))
  )
}

function isUntoldChicago(source: string | undefined): boolean {
  if (!source || typeof source !== 'string') return false
  return source.toLowerCase().replace(/\s+/g, ' ').trim().includes('untold')
}

// ============================================
// SHARED TYPES & UTILITIES
// ============================================

export interface BaseCardProps {
  team: string
  teamColor: string
  timestamp: string
}

// Scout Insight pill badge — displayed on AI-generated cards
export function ScoutInsightBadge() {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5"
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.03em",
        backgroundColor: "rgba(0, 0, 0, 0.06)",
        color: "#3a3a3a",
      }}
    >
      Scout Insight
    </span>
  )
}

// Trending context line — shown below headlines on high-traffic stories
export function TrendingContextLine({ context }: { context: string }) {
  return (
    <p
      className="mt-1.5 flex items-center gap-1"
      style={{ fontSize: 13, color: "var(--hp-muted-foreground)" }}
    >
      <TrendingUp className="h-3.5 w-3.5 inline flex-shrink-0" style={{ color: "#BC0000" }} />
      <span>Trending: {context}</span>
    </p>
  )
}

// Team tag component — now renders team logo instead of pill
function TeamTag({ team, teamHex }: { team: string; teamHex: string }) {
  const n = team.toLowerCase().replace(/\s+/g, ' ').trim()
  const meta = homepageTeams.find((t) => t.name.toLowerCase() === n)
  let logoSrc = meta?.logo

  // Handle non-team sources with their own logos
  if (!logoSrc) {
    if (isPinwheelsAndIvy(team)) {
      logoSrc = '/youtubelogos/pi-logo.png'
    } else if (isUntoldChicago(team)) {
      logoSrc = '/downloads/untold-logo.png'
    } else if (n.includes('sports mockery') || n.includes('sportsmockery') || n === 'sm') {
      logoSrc = '/downloads/sm-logo-star.png'
    }
  }

  if (!logoSrc) {
    // Fallback: simple initial pill
    return (
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{
          width: 28,
          height: 28,
          fontSize: 13,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          backgroundColor: teamHex || 'var(--hp-muted)',
          color: '#FAFAFB',
        }}
      >
        {team.charAt(0)}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt={`${team} logo`}
        width={26}
        height={26}
        style={{ width: 26, height: 26, objectFit: 'contain' }}
        crossOrigin="anonymous"
      />
    </span>
  )
}

/** Team accent color for feed card left border and insight box (matches team logo on top right). */
function getTeamAccentColor(team: string): string | undefined {
  const n = team.toLowerCase().replace(/\s+/g, ' ').trim()
  if (n.includes('bears')) return '#C83803'   // Bears orange
  if (n.includes('cubs')) return '#0E3386'    // Cubs blue
  if (n.includes('bulls')) return '#CE1141'   // Bulls red
  if (n.includes('blackhawks')) return '#00833E' // Blackhawks green
  if (n.includes('white sox') || n.includes('whitesox') || n.includes('white-sox')) return '#FFFFFF' // White Sox white
  return undefined
}

// Editorial label component
function CardLabel({ label, isBreaking = false }: { label: string; isBreaking?: boolean }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
      color: isBreaking ? '#BC0000' : 'var(--hp-muted-foreground)'
    }}>
      {label}
    </span>
  )
}

// Shared engagement row — reactions + play + comment + views + share
// Reactions use real data from props. When no DB-backed reaction data exists yet,
// counts will be 0 — this is intentional (no fake numbers).
// listenButtonStyle: "circle" = REPORT cards only — light gray circle, icon only; plays from feed via global audio.
export function EngagementRow({
  stats,
  articleUrl,
  listenButtonStyle = "pill",
  slug,
  headline,
}: {
  stats: { comments: number; retweets: number; likes: number; views: string }
  articleUrl?: string
  listenButtonStyle?: "pill" | "circle"
  slug?: string
  headline?: string
}) {
  const [reactions, setReactions] = useState<Record<string, boolean>>({})
  const [counts, setCounts] = useState({ smart: stats.likes, hot: stats.retweets })
  const audio = useAudioPlayer()

  const toggle = (key: "smart" | "hot") => {
    setReactions(prev => ({ ...prev, [key]: !prev[key] }))
    setCounts(prev => ({ ...prev, [key]: prev[key] + (reactions[key] ? -1 : 1) }))
  }

  const handleShare = async () => {
    const url = articleUrl ? `${window.location.origin}${articleUrl}` : window.location.href
    if (navigator.share) {
      try { await navigator.share({ url }) } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const reactionButtons = [
    { key: "smart" as const, emoji: "\uD83D\uDC4D", label: "Smart Take", count: counts.smart },
    { key: "hot" as const, emoji: "\uD83D\uDD25", label: "Hot", count: counts.hot },
  ]

  const listenUrl = articleUrl ? `${articleUrl}${articleUrl.includes('?') ? '&' : '?'}listen=true#article-audio` : null
  const isThisArticlePlaying = listenButtonStyle === "circle" && slug && audio.currentArticle?.slug === slug && audio.isPlaying

  return (
    <div className="mt-5 flex items-center justify-between" style={{ color: 'var(--hp-muted-foreground)' }}>
      {/* Left: Play button */}
      <div className="flex items-center gap-3">
        {listenUrl && listenButtonStyle === "circle" && slug && headline && (
          <button
            type="button"
            onClick={() => {
              if (isThisArticlePlaying) {
                audio.pause()
              } else {
                audio.play(
                  {
                    title: headline,
                    slug,
                    url: `/api/audio/${encodeURIComponent(slug)}?voice=will`,
                  },
                  'Will'
                )
              }
            }}
            className="group flex items-center justify-center rounded-full transition-opacity hp-tap-target hover:opacity-70"
            style={{ width: 32, height: 32, background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,212,255,0.04))', border: '1px solid rgba(0,212,255,0.4)', color: '#00D4FF', boxShadow: '0 0 8px rgba(0,212,255,0.15)' }}
            aria-label={isThisArticlePlaying ? 'Pause' : 'Listen to article'}
          >
            {isThisArticlePlaying ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="12" height="14" viewBox="0 0 20 24" fill="none" aria-hidden="true">
                <path d="M2 1L18 12L2 23V1Z" fill="currentColor" />
              </svg>
            )}
          </button>
        )}
        {listenUrl && listenButtonStyle === "pill" && (
          <Link
            href={listenUrl}
            className="group flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-opacity hp-tap-target hover:opacity-70"
            aria-label="Listen to article"
          >
            <svg width="12" height="14" viewBox="0 0 20 24" fill="none" className="flex-shrink-0" aria-hidden="true">
              <path d="M2 1L18 12L2 23V1Z" fill="currentColor" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 500 }}>Listen</span>
          </Link>
        )}
      </div>

      {/* Right: Reactions + Comments + Views + Share */}
      <div className="flex items-center gap-2">
        {reactionButtons.map(({ key, emoji, label, count }) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`group flex items-center gap-1 rounded-full px-2.5 py-1.5 transition-opacity hp-tap-target ${reactions[key] ? 'bg-[rgba(0,0,0,0.06)] dark:bg-[rgba(255,255,255,0.08)]' : 'hover:opacity-70'}`}
            aria-label={label}
          >
            <span style={{ fontSize: 14 }}>{emoji}</span>
            <span style={{ fontSize: 12, fontWeight: reactions[key] ? 600 : 400 }}>{count}</span>
          </button>
        ))}
        {articleUrl ? (
          <Link href={articleUrl} className="group flex items-center gap-1 transition-opacity hover:opacity-70 hp-tap-target" aria-label="Comments">
            <MessageCircle className="h-4 w-4" />
            <span style={{ fontSize: 12 }}>{stats.comments}</span>
          </Link>
        ) : (
          <span className="group flex items-center gap-1 hp-tap-target" aria-label="Comments">
            <MessageCircle className="h-4 w-4" />
            <span style={{ fontSize: 12 }}>{stats.comments}</span>
          </span>
        )}
        <span className="flex items-center gap-1 hp-tap-target" style={{ fontSize: 12 }} title="Views">
          <Eye className="h-4 w-4" />
          {stats.views && stats.views !== '0' ? stats.views : '0'}
        </span>
        <button onClick={handleShare} className="transition-opacity hover:opacity-70 hp-tap-target" aria-label="Share">
          <Share className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ============================================
// CARD 1: EDITORIAL POST CARD
// ============================================

interface EditorialCardProps extends BaseCardProps {
  author: { name: string; handle: string; avatar: string; verified: boolean }
  headline: string
  summary: string
  insight?: string
  author_name: string
  breakingIndicator?: "BREAKING" | "RUMOR" | "ANALYSIS" | "REPORT" | "TRENDING"
  stats: { comments: number; retweets: number; likes: number; views: string }
  gmQuestion?: string
  trendingContext?: string
  rumorCredibility?: "HIGH" | "MEDIUM" | "LOW"
  scoutStat?: string
  authorPhoto?: string
  slug?: string
  categorySlug?: string
  /** Featured image above headline; fades down into headline (like article pages, more prominent) */
  featuredImage?: string
}

export function EditorialCard({
  headline, summary, insight, team, teamColor, timestamp, stats, author_name, breakingIndicator, gmQuestion, trendingContext, rumorCredibility, scoutStat, authorPhoto, slug, categorySlug, featuredImage,
}: EditorialCardProps) {
  const [vote, setVote] = useState<"yes" | "no" | null>(null)
  const [yesVotes, setYesVotes] = useState(Math.floor(Math.random() * 500) + 200)
  const [noVotes, setNoVotes] = useState(Math.floor(Math.random() * 300) + 100)
  const teamHex = teamColor
  const articleUrl = slug && categorySlug ? `/${categorySlug}/${slug}` : undefined

  const handleVote = (choice: "yes" | "no") => {
    if (vote) return
    setVote(choice)
    if (choice === "yes") setYesVotes((prev) => prev + 1)
    else setNoVotes((prev) => prev + 1)
  }

  const totalVotes = yesVotes + noVotes
  const yesPercentage = Math.round((yesVotes / totalVotes) * 100)
  const noPercentage = Math.round((noVotes / totalVotes) * 100)

  const cardAccentColor = getTeamAccentColor(team)

  return (
    <article
      className="hp-feed-card hp-card-enter group relative"
      style={cardAccentColor ? { borderLeft: `3px solid ${cardAccentColor}` } : undefined}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          {breakingIndicator === "REPORT" ? (
            <>
              {/* Sports Mockery wordmark — top left, swap per theme */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/downloads/sm-logo-wordmark.png"
                alt="Sports Mockery"
                width={160}
                height={32}
                className="dark:hidden"
                style={{ height: 32, width: 'auto', objectFit: 'contain' }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/downloads/sm-logo-wordmark-dark.png"
                alt="Sports Mockery"
                width={160}
                height={32}
                className="hidden dark:block"
                style={{ height: 32, width: 'auto', objectFit: 'contain' }}
              />
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  backgroundColor: "rgba(0,0,0,0.06)",
                  color: "#3a3a3a",
                  textTransform: "uppercase",
                }}
              >
                Report
              </span>
            </>
          ) : (
            <CardLabel label={breakingIndicator || "NEWS"} isBreaking={breakingIndicator === "BREAKING"} />
          )}
          <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
        </div>
        <TeamTag team={team} teamHex={teamHex} />
      </div>

      {/* Featured image above headline with prominent fade into headline (like article pages) */}
      {featuredImage && featuredImage.length > 0 && (
        <div className="relative mb-4 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={featuredImage}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
          {/* Strong gradient fade down into headline area — more prominent than article page */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 28%, rgba(0,0,0,0.15) 50%, transparent 72%)',
              borderRadius: 12,
            }}
          />
          {/* Headline overlaid at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4 pt-12">
            {articleUrl ? (
              <Link href={articleUrl}>
                <h2 className="hover:underline" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: '#FAFAFB', textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.9)' }}>{headline}</h2>
              </Link>
            ) : (
              <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: '#FAFAFB', textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.9)' }}>{headline}</h2>
            )}
          </div>
        </div>
      )}

      {!featuredImage || featuredImage.length === 0 ? (
        <>
          {articleUrl ? (
            <Link href={articleUrl}>
              <h2 className="hover:underline" style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>{headline}</h2>
            </Link>
          ) : (
            <h2 style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>{headline}</h2>
          )}
        </>
      ) : null}
      {rumorCredibility && breakingIndicator === "RUMOR" && <RumorCredibilityMeter level={rumorCredibility} />}
      {trendingContext && <TrendingContextLine context={trendingContext} />}
      <p className="mt-3 line-clamp-3" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--hp-foreground)', opacity: 0.7 }}>{summary}</p>

      {insight && (
        <div className="mt-5 rounded-2xl p-4" style={{ background: 'var(--hp-muted)', borderLeft: `3px solid ${cardAccentColor ?? teamHex}`, opacity: 0.9 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--hp-muted-foreground)' }}>Insight</span>
          <p className="mt-2" style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--hp-foreground)', opacity: 0.65 }}>{insight}</p>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        {authorPhoto && (
          <img src={authorPhoto} alt={author_name} className="h-5 w-5 rounded-full object-cover" />
        )}
        <span style={{ fontSize: 12, color: 'var(--hp-muted-foreground)' }}>By {author_name}</span>
      </div>

      {/* Scout Stat hover overlay */}
      {scoutStat && (
        <div
          className="pointer-events-none absolute right-4 top-14 z-10 max-w-[220px] rounded-xl px-3 py-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background: "var(--hp-card)",
            border: "1px solid var(--hp-border)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#00D4FF" }}>
            Scout Stat
          </span>
          <p className="mt-1" style={{ fontSize: 12, lineHeight: 1.4, color: "var(--hp-foreground)", opacity: 0.8 }}>
            {scoutStat}
          </p>
        </div>
      )}
      <EngagementRow stats={stats} articleUrl={articleUrl} listenButtonStyle={breakingIndicator === "REPORT" ? "circle" : "pill"} slug={slug} headline={headline} />

      {gmQuestion && (
        <div className="mt-5 rounded-2xl p-4" style={{ border: '1px solid var(--hp-border)', background: 'var(--hp-muted)', opacity: 0.9 }}>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#BC0000]" />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--hp-muted-foreground)' }}>GM Pulse</span>
          </div>
          <p className="mt-2" style={{ fontSize: 15, fontWeight: 500, color: 'var(--hp-foreground)' }}>{gmQuestion}</p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => handleVote("yes")}
              disabled={vote !== null}
              className="relative flex-1 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
              style={{
                border: `2px solid ${vote === "yes" ? '#00D4FF' : vote === "no" ? 'var(--hp-border)' : '#00D4FF'}`,
                background: vote === "yes" ? 'rgba(34,197,94,0.1)' : vote === "no" ? 'var(--hp-muted)' : 'transparent',
                color: vote === "no" ? 'var(--hp-muted-foreground)' : '#16a34a',
              }}
            >
              {vote && <span className="absolute inset-y-0 left-0 transition-all duration-500" style={{ width: `${yesPercentage}%`, background: 'rgba(34,197,94,0.2)' }} />}
              <span className="relative z-10 flex items-center justify-center gap-2">
                Yes {vote && <span style={{ fontSize: 12 }}>({yesPercentage}%)</span>}
              </span>
            </button>
            <button
              onClick={() => handleVote("no")}
              disabled={vote !== null}
              className="relative flex-1 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
              style={{
                border: `2px solid ${vote === "no" ? '#BC0000' : vote === "yes" ? 'var(--hp-border)' : '#BC0000'}`,
                background: vote === "no" ? 'rgba(239,68,68,0.1)' : vote === "yes" ? 'var(--hp-muted)' : 'transparent',
                color: vote === "yes" ? 'var(--hp-muted-foreground)' : '#BC0000',
              }}
            >
              {vote && <span className="absolute inset-y-0 left-0 transition-all duration-500" style={{ width: `${noPercentage}%`, background: 'rgba(239,68,68,0.2)' }} />}
              <span className="relative z-10 flex items-center justify-center gap-2">
                No {vote && <span style={{ fontSize: 12 }}>({noPercentage}%)</span>}
              </span>
            </button>
          </div>
          {vote && <p className="mt-2 text-center" style={{ fontSize: 12, color: 'var(--hp-muted-foreground)' }}>{totalVotes.toLocaleString()} votes</p>}
        </div>
      )}
    </article>
  )
}

// ============================================
// CARD 2: POLL CARD
// ============================================

interface PollCardProps extends BaseCardProps {
  question: string
  context: string
  options: string[]
  totalVotes: number
  status: "LIVE" | "CLOSED"
}

export function PollCard({ question, context, options, totalVotes, status, team, teamColor, timestamp }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [votes] = useState(() => options.map(() => Math.floor(Math.random() * 40) + 10))
  const teamHex = teamColor

  const total = votes.reduce((a, b) => a + b, 0)

  return (
    <article className="hp-feed-card hp-card-enter">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <CardLabel label="POLL" />
          <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
        </div>
        <TeamTag team={team} teamHex={teamHex} />
      </div>

      <h2 style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>{question}</h2>
      <p className="mt-2.5" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--hp-foreground)', opacity: 0.7 }}>{context}</p>

      <div className="mt-4 space-y-2.5">
        {options.map((option, index) => {
          const percentage = Math.round((votes[index] / total) * 100)
          const isSelected = selectedOption === index
          const isVoted = selectedOption !== null

          return (
            <button
              key={index}
              onClick={() => { if (!isVoted) setSelectedOption(index) }}
              disabled={isVoted}
              className="relative w-full overflow-hidden rounded-xl px-4 py-3.5 text-left transition-all hp-tap-target"
              style={{
                fontSize: 15, fontWeight: 500,
                border: `2px solid ${isSelected ? '#00D4FF' : 'var(--hp-border)'}`,
                background: isSelected ? 'rgba(59,130,246,0.1)' : isVoted ? 'var(--hp-muted)' : 'transparent',
              }}
            >
              {isVoted && (
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-500"
                  style={{ width: `${percentage}%`, background: isSelected ? 'rgba(59,130,246,0.2)' : 'var(--hp-muted)' }}
                />
              )}
              <span className="relative z-10 flex items-center justify-between">
                <span style={{ color: isSelected ? '#00D4FF' : 'var(--hp-foreground)' }}>{option}</span>
                {isVoted && <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#00D4FF' : 'var(--hp-muted-foreground)' }}>{percentage}%</span>}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between" style={{ fontSize: 14, color: 'var(--hp-muted-foreground)' }}>
        <span>{totalVotes.toLocaleString()} votes</span>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{status === "LIVE" ? "Live now" : "Poll closed"}</span>
        </div>
      </div>
    </article>
  )
}

// ============================================
// CARD 3: CHART/STATS INSIGHT CARD
// ============================================

interface ChartCardProps extends BaseCardProps {
  headline: string
  takeaway: string
  chartData: { label: string; value: number }[]
  statSource: string
  stats: { comments: number; retweets: number; likes: number; views: string }
}

export function ChartCard({ headline, takeaway, chartData, statSource, team, teamColor, timestamp, stats }: ChartCardProps) {
  const teamHex = teamColor
  const articleUrl = undefined

  return (
    <article className="hp-feed-card hp-card-enter">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <CardLabel label="STATS" />
          <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
        </div>
        <TeamTag team={team} teamHex={teamHex} />
      </div>

      <h2 style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>{headline}</h2>

      <div className="mt-4 h-32 w-full rounded-xl p-2" style={{ background: 'var(--hp-muted)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`hp-gradient-${team}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={teamHex} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={teamHex} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--hp-muted-foreground)' }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--hp-card)',
                border: '1px solid var(--hp-border)',
                borderRadius: 12,
                fontSize: 12
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={teamHex}
              strokeWidth={2}
              fill={`url(#hp-gradient-${team})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl p-3.5" style={{ background: 'var(--hp-muted)' }}>
        <BarChart3 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--hp-muted-foreground)' }} />
        <p style={{ fontSize: 14, color: 'var(--hp-foreground)', opacity: 0.8 }}>{takeaway}</p>
      </div>

      <p className="mt-3" style={{ fontSize: 12, color: 'var(--hp-muted-foreground)' }}>Source: {statSource}</p>
      <EngagementRow stats={stats} articleUrl={articleUrl} />
    </article>
  )
}

// ============================================
// CARD 4: HUB UPDATE CARD
// ============================================

interface HubUpdateCardProps extends BaseCardProps {
  updateText: string
  takeaway: string
  status: "LIVE" | "NEW" | "UPDATED"
}

export function HubUpdateCard({ updateText, takeaway, status, team, teamColor, timestamp }: HubUpdateCardProps) {
  const teamHex = teamColor
  const router = useRouter()
  const teamSlug = team.toLowerCase().replace(/\s+/g, "-").replace("chicago-", "")
  const teamHubUrl = `/chicago-${teamSlug}`

  return (
    <article className="hp-feed-card hp-card-enter">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <CardLabel label="UPDATE" isBreaking={status === "LIVE"} />
          {status === "LIVE" && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#BC0000' }} />}
          <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
        </div>
        <TeamTag team={team} teamHex={teamHex} />
      </div>

      <p style={{ fontSize: 18, lineHeight: 1.25, fontWeight: 700, color: 'var(--hp-foreground)' }}>{updateText}</p>
      <p className="mt-2.5" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--hp-foreground)', opacity: 0.7 }}>{takeaway}</p>

      <button onClick={() => router.push(teamHubUrl)} className="mt-4 flex items-center gap-1 transition-colors hp-tap-target hover:opacity-80" style={{ fontSize: 14, fontWeight: 600, color: '#00D4FF' }}>
        <span>View full update</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </article>
  )
}

// ============================================
// CARD 5: BOX SCORE CARD
// ============================================

interface BoxScoreCardProps extends BaseCardProps {
  homeTeam: { name: string; logo: string; score: number }
  awayTeam: { name: string; logo: string; score: number }
  status: "LIVE" | "FINAL"
  period: string
  keyPerformer: string
}

export function BoxScoreCard({ homeTeam, awayTeam, status, period, keyPerformer, team, teamColor, timestamp }: BoxScoreCardProps) {
  const teamHex = teamColor
  const router = useRouter()
  const teamSlug = team.toLowerCase().replace(/\s+/g, "-").replace("chicago-", "")
  const teamHubUrl = `/chicago-${teamSlug}`

  return (
    <article className="hp-feed-card hp-card-enter">
      <div className="flex items-center gap-3 mb-4">
        <CardLabel label="BOX SCORE" isBreaking={status === "LIVE"} />
        {status === "LIVE" && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#BC0000' }} />}
        <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
      </div>

      <div className="mt-4 rounded-2xl p-4" style={{ border: '1px solid var(--hp-border)', background: 'var(--hp-card)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={awayTeam.logo} alt={awayTeam.name} className="h-10 w-10 object-contain rounded-lg" crossOrigin="anonymous" />
            <div>
              <p style={{ fontWeight: 700, color: 'var(--hp-foreground)' }}>{awayTeam.name}</p>
              <p style={{ fontSize: 30, fontWeight: 700, color: 'var(--hp-foreground)' }}>{awayTeam.score}</p>
            </div>
          </div>

          <div className="text-center">
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--hp-muted-foreground)' }}>{period}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p style={{ fontWeight: 700, color: 'var(--hp-foreground)' }}>{homeTeam.name}</p>
              <p style={{ fontSize: 30, fontWeight: 700, color: 'var(--hp-foreground)' }}>{homeTeam.score}</p>
            </div>
            <img src={homeTeam.logo} alt={homeTeam.name} className="h-10 w-10 object-contain rounded-lg" crossOrigin="anonymous" />
          </div>
        </div>

        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--hp-border)' }}>
          <p style={{ fontSize: 15, color: 'var(--hp-foreground)', opacity: 0.8 }}>
            <span className="font-semibold">Key performer:</span> {keyPerformer}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-4">
        <button onClick={() => router.push(teamHubUrl)} className="hp-tap-target hover:opacity-80 transition-opacity" style={{ fontSize: 14, fontWeight: 500, color: '#00D4FF' }}>Recap</button>
        <button onClick={() => router.push(`${teamHubUrl}/schedule`)} className="hp-tap-target hover:opacity-80 transition-opacity" style={{ fontSize: 14, fontWeight: 500, color: '#00D4FF' }}>Full box score</button>
        <button onClick={() => router.push(`/scout-ai?q=${encodeURIComponent(`${awayTeam.name} vs ${homeTeam.name} reactions`)}`)} className="hp-tap-target hover:opacity-80 transition-opacity" style={{ fontSize: 14, fontWeight: 500, color: '#00D4FF' }}>Reactions</button>
      </div>
    </article>
  )
}

// ============================================
// CARD 6: TRADE PROPOSAL CARD
// ============================================

interface TradeProposalCardProps extends BaseCardProps {
  proposer: { name: string; handle: string }
  teamGets: { name: string; items: string[] }
  otherTeamGets: { name: string; items: string[] }
  fairnessScore: number
  isEditorApproved: boolean
}

export function TradeProposalCard({ proposer, teamGets, otherTeamGets, fairnessScore, isEditorApproved, team, teamColor, timestamp }: TradeProposalCardProps) {
  const teamHex = teamColor
  const [userVote, setUserVote] = useState<"approve" | "reject" | null>(null)

  return (
    <article className="hp-feed-card hp-card-enter">
      <div className="flex items-center gap-3 mb-4">
        <CardLabel label="TRADE" />
        <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--hp-muted-foreground)' }}>Proposed by {proposer.name}</p>

      <div className="mt-3 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--hp-border)', background: 'var(--hp-card)' }}>
        <div className="grid grid-cols-2" style={{ borderBottom: 'none' }}>
          <div className="p-4" style={{ borderRight: '1px solid var(--hp-border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-white" style={{ fontSize: 11, fontWeight: 600, backgroundColor: teamHex }}>
                {teamGets.name}
              </span>
              <span style={{ fontSize: 12, color: 'var(--hp-muted-foreground)' }}>receives</span>
            </div>
            <ul className="space-y-1.5">
              {teamGets.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2" style={{ fontSize: 15, fontWeight: 500, color: 'var(--hp-foreground)' }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#00D4FF' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center rounded-lg px-2.5 py-1" style={{ fontSize: 11, fontWeight: 600, background: 'var(--hp-muted-foreground)', color: 'var(--hp-background)' }}>
                {otherTeamGets.name}
              </span>
              <span style={{ fontSize: 12, color: 'var(--hp-muted-foreground)' }}>receives</span>
            </div>
            <ul className="space-y-1.5">
              {otherTeamGets.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2" style={{ fontSize: 15, fontWeight: 500, color: 'var(--hp-foreground)' }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#BC0000' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--hp-border)', background: 'var(--hp-muted)' }}>
          <div className="flex items-center gap-4">
            <div>
              <span style={{ fontSize: 12, color: 'var(--hp-muted-foreground)' }}>Fairness</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-24 rounded-full overflow-hidden" style={{ background: 'var(--hp-muted)' }}>
                  <div className="h-full rounded-full" style={{ width: `${fairnessScore}%`, background: 'linear-gradient(to right, #BC0000, #eab308, #00D4FF)' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--hp-foreground)' }}>{fairnessScore}%</span>
              </div>
            </div>
            {isEditorApproved && (
              <div className="flex items-center gap-1" style={{ color: '#16a34a' }}>
                <Check className="h-4 w-4" />
                <span style={{ fontSize: 12, fontWeight: 600 }}>Editor Approved</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setUserVote("approve")}
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 transition-all hp-tap-target"
              style={{
                fontSize: 12, fontWeight: 600,
                background: userVote === "approve" ? '#00D4FF' : 'var(--hp-card)',
                color: userVote === "approve" ? '#fff' : 'var(--hp-foreground)',
                border: `1px solid ${userVote === "approve" ? '#00D4FF' : 'var(--hp-border)'}`,
              }}
            >
              <Check className="h-3.5 w-3.5" /> Approve
            </button>
            <button
              onClick={() => setUserVote("reject")}
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 transition-all hp-tap-target"
              style={{
                fontSize: 12, fontWeight: 600,
                background: userVote === "reject" ? '#BC0000' : 'var(--hp-card)',
                color: userVote === "reject" ? '#fff' : 'var(--hp-foreground)',
                border: `1px solid ${userVote === "reject" ? '#BC0000' : 'var(--hp-border)'}`,
              }}
            >
              <X className="h-3.5 w-3.5" /> Reject
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

// ============================================
// CARD 7: SCOUT SUMMARY CARD
// ============================================

interface ScoutSummaryCardProps extends BaseCardProps {
  summary: string
  bullets: string[]
  topic: string
  slug?: string
  categorySlug?: string
  stats?: { views: string }
}

export function ScoutSummaryCard({ summary, bullets, topic, team, teamColor, timestamp, slug, categorySlug, stats }: ScoutSummaryCardProps) {
  const teamHex = teamColor
  const router = useRouter()
  const audio = useAudioPlayer()

  const normalizedTeam = team.toLowerCase()
  const edgeColor =
    normalizedTeam.includes('bear') ? '#C83803' :        // Bears
    normalizedTeam.includes('white sox') || normalizedTeam.includes('whitesox') ? '#000000' : // White Sox
    normalizedTeam.includes('cub') ? '#0E3386' :         // Cubs
    normalizedTeam.includes('bull') ? '#CE1141' :        // Bulls
    normalizedTeam.includes('blackhawk') ? '#00833E' :   // Blackhawks
    '#BC0000'

  const articleHref = slug && categorySlug ? `/${categorySlug}/${slug}` : null

  const insightAudioUrl = bullets?.length
    ? `/api/audio/scout-insight?${bullets.map((b) => `b=${encodeURIComponent(b)}`).join('&')}`
    : null
  const isPlaying = !!insightAudioUrl && audio.currentArticle?.url === insightAudioUrl && audio.isPlaying

  const handleScoutPlay = () => {
    if (!bullets?.length || !insightAudioUrl) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play(
        {
          title: 'Scout Insight',
          slug: 'scout-insight',
          url: insightAudioUrl,
        },
        'Scout'
      )
    }
  }

  return (
    <article className="hp-feed-card hp-card-enter" style={{ borderLeft: `3px solid ${edgeColor}` }}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <img
            src="/downloads/scout-v2.png"
            alt="Scout"
            className="h-6 w-6 rounded-full object-contain"
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--hp-foreground)",
            }}
          >
            Scout AI Insight
          </span>
          <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
        </div>
        <TeamTag team={team} teamHex={teamHex} />
      </div>

      <p
        className="mb-2"
        style={{
          fontSize: 17,
          fontWeight: 500,
          color: 'var(--hp-foreground)',
        }}
      >
        {topic}
      </p>
      <p
        style={{
          fontSize: 12,
          lineHeight: 1.5,
          fontWeight: 500,
          color: 'var(--hp-muted-foreground)',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical' as const,
        }}
      >
        {summary}
        {articleHref && (
          <>
            {' '}
            <Link
              href={articleHref}
              className="hp-tap-target transition-colors hover:opacity-80"
              style={{ fontSize: 13, fontWeight: 500, color: '#BC0000', textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Read article
            </Link>
          </>
        )}
      </p>

      {bullets.length > 0 && (
        <div className="mt-4 rounded-2xl p-4" style={{ background: 'var(--hp-muted)', border: '1px solid var(--hp-border)' }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--hp-muted-foreground)' }}>Key Insights</span>
          <ul className="mt-2.5 space-y-2">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5" style={{ fontSize: 14, color: 'var(--hp-foreground)', opacity: 0.8 }}>
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: '#06b6d4' }} />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between" style={{ color: 'var(--hp-muted-foreground)' }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleScoutPlay}
            className="hp-tap-target flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
            style={{ width: 32, height: 32, background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,212,255,0.04))', border: '1px solid rgba(0,212,255,0.4)', color: '#00D4FF', boxShadow: '0 0 8px rgba(0,212,255,0.15)' }}
            aria-label="Play Scout Insight"
          >
            {isPlaying ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="12" height="14" viewBox="0 0 20 24" fill="none" aria-hidden="true">
                <path d="M2 1L18 12L2 23V1Z" fill="currentColor" />
              </svg>
            )}
          </button>
          <button
            onClick={() => router.push(`/scout-ai?q=${encodeURIComponent(`${topic} ${team}`)}`)}
            className="flex items-center gap-1.5 transition-opacity hp-tap-target hover:opacity-70"
            style={{ fontSize: 12, fontWeight: 500 }}
          >
            <Image src="/downloads/scout-v2.png" alt="Scout" width={16} height={16} className="h-4 w-4 rounded-full object-contain" />
            <span>Ask Scout</span>
          </button>
        </div>
        <div className="flex items-center gap-1" style={{ fontSize: 12 }} title="Views">
          <Eye className="h-4 w-4" />
          <span>{stats?.views && stats.views !== '0' ? stats.views : '0'}</span>
        </div>
      </div>
    </article>
  )
}

// ============================================
// CARD 8: TRENDING ARTICLE CARD
// ============================================

interface TrendingArticleCardProps extends BaseCardProps {
  headline: string
  summary: string
  trendMetric: string
  stats: { comments: number; retweets: number; likes: number; views: string }
  slug?: string
  categorySlug?: string
}

export function TrendingArticleCard({ headline, summary, trendMetric, team, teamColor, timestamp, stats, slug, categorySlug }: TrendingArticleCardProps) {
  const teamHex = teamColor
  const articleUrl = slug && categorySlug ? `/${categorySlug}/${slug}` : undefined

  return (
    <article className="hp-feed-card hp-card-enter">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <CardLabel label="TRENDING" />
          <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
        </div>
        <TeamTag team={team} teamHex={teamHex} />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4" style={{ color: '#BC0000' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#BC0000' }}>{trendMetric}</span>
      </div>

      {articleUrl ? (
        <Link href={articleUrl}>
          <h2 className="hover:underline" style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>{headline}</h2>
        </Link>
      ) : (
        <h2 style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>{headline}</h2>
      )}
      <p className="mt-3 line-clamp-3" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--hp-foreground)', opacity: 0.7 }}>{summary}</p>

      <div className="mt-5 flex items-center justify-end gap-1" style={{ fontSize: 12, color: 'var(--hp-muted-foreground)' }} title="Views">
        <Eye className="h-4 w-4" />
        <span>{stats.views && stats.views !== '0' ? stats.views : '0'}</span>
      </div>
    </article>
  )
}

// ============================================
// CARD 9: DEBATE CARD
// ============================================

interface DebateCardProps extends BaseCardProps {
  prompt: string
  sideA: string
  sideB: string
  participantCount: number
}

export function DebateCard({ prompt, sideA, sideB, participantCount, team, teamColor, timestamp }: DebateCardProps) {
  const teamHex = teamColor
  const router = useRouter()
  const [selectedSide, setSelectedSide] = useState<"a" | "b" | null>(null)
  const [votesA] = useState(Math.floor(Math.random() * 60) + 20)
  const [votesB] = useState(Math.floor(Math.random() * 60) + 20)

  const total = votesA + votesB
  const percentA = Math.round((votesA / total) * 100)
  const percentB = Math.round((votesB / total) * 100)

  return (
    <article className="hp-feed-card hp-card-enter">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <CardLabel label="DEBATE" />
          <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
        </div>
        <TeamTag team={team} teamHex={teamHex} />
      </div>

      <h2 style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>{prompt}</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => setSelectedSide("a")}
          className="relative overflow-hidden rounded-2xl p-4 text-center transition-all hp-tap-target"
          style={{
            border: `2px solid ${selectedSide === "a" ? '#f43f5e' : selectedSide === "b" ? 'var(--hp-border)' : 'var(--hp-border)'}`,
            background: selectedSide === "a" ? 'rgba(244,63,94,0.1)' : selectedSide === "b" ? 'var(--hp-muted)' : 'transparent',
          }}
        >
          {selectedSide && (
            <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: 'var(--hp-muted)' }}>
              <div className="h-full transition-all duration-500" style={{ width: `${percentA}%`, background: '#f43f5e' }} />
            </div>
          )}
          <p className="font-semibold" style={{ color: selectedSide === "a" ? '#e11d48' : 'var(--hp-foreground)' }}>{sideA}</p>
          {selectedSide && <p className="mt-2 text-2xl font-bold" style={{ color: '#e11d48' }}>{percentA}%</p>}
        </button>
        <button
          onClick={() => setSelectedSide("b")}
          className="relative overflow-hidden rounded-2xl p-4 text-center transition-all hp-tap-target"
          style={{
            border: `2px solid ${selectedSide === "b" ? '#00D4FF' : selectedSide === "a" ? 'var(--hp-border)' : 'var(--hp-border)'}`,
            background: selectedSide === "b" ? 'rgba(59,130,246,0.1)' : selectedSide === "a" ? 'var(--hp-muted)' : 'transparent',
          }}
        >
          {selectedSide && (
            <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: 'var(--hp-muted)' }}>
              <div className="h-full transition-all duration-500" style={{ width: `${percentB}%`, background: '#00D4FF' }} />
            </div>
          )}
          <p className="font-semibold" style={{ color: selectedSide === "b" ? '#00D4FF' : 'var(--hp-foreground)' }}>{sideB}</p>
          {selectedSide && <p className="mt-2 text-2xl font-bold" style={{ color: '#00D4FF' }}>{percentB}%</p>}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between" style={{ fontSize: 14, color: 'var(--hp-muted-foreground)' }}>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{participantCount.toLocaleString()} participating</span>
        </div>
        <button onClick={() => router.push(`/scout-ai?q=${encodeURIComponent(prompt)}`)} className="font-medium hp-tap-target hover:opacity-80 transition-opacity" style={{ color: '#00D4FF' }}>Join discussion</button>
      </div>
    </article>
  )
}

// ============================================
// SCOUT BRIEFING CARD — prepended to homepage feed
// ============================================

const BRIEFING_BULLETS = [
  "Bears offensive line concerns continue",
  "Cubs trade talks heating up",
  "Bulls win behind Coby White",
  "Blackhawks youth movement showing promise",
]

const SCOUT_BRIEFING_AUDIO_URL = '/api/audio/scout-briefing?voice=scout'

export function ScoutBriefingCard() {
  const router = useRouter()
  const audio = useAudioPlayer()
  const isPlaying = audio.currentArticle?.slug === 'scout-briefing' && audio.isPlaying

  const handleBriefingPlay = () => {
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play(
        {
          title: 'Scout Briefing',
          slug: 'scout-briefing',
          url: SCOUT_BRIEFING_AUDIO_URL,
        },
        'Scout'
      )
    }
  }

  return (
    <article className="hp-feed-card hp-card-enter" style={{ borderLeft: "3px solid #00D4FF" }}>
      <div className="flex items-center gap-2.5 mb-4">
        <img
          src="/downloads/scout-v2.png"
          alt="Scout"
          className="h-6 w-6 rounded-full object-contain"
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "var(--hp-foreground)",
          }}
        >
          Scout Briefing
        </span>
        <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>23h</span>
      </div>

      <ul className="space-y-2">
        {BRIEFING_BULLETS.map((bullet, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5"
            style={{ fontSize: 15, lineHeight: 1.5, color: "var(--hp-foreground)", opacity: 0.8 }}
          >
            <span
              className="mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0"
              style={{ background: "#00D4FF" }}
            />
            {bullet}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-3" style={{ color: 'var(--hp-muted-foreground)' }}>
        <button
          type="button"
          onClick={handleBriefingPlay}
          className="hp-tap-target flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
          style={{ width: 32, height: 32, background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(0,212,255,0.04))', border: '1px solid rgba(0,212,255,0.4)', color: '#00D4FF', boxShadow: '0 0 8px rgba(0,212,255,0.15)' }}
          aria-label="Play Scout Briefing"
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="12" height="14" viewBox="0 0 20 24" fill="none" aria-hidden="true">
              <path d="M2 1L18 12L2 23V1Z" fill="currentColor" />
            </svg>
          )}
        </button>
        <button
          onClick={() => router.push("/scout-ai")}
          className="flex items-center gap-1.5 transition-opacity hp-tap-target hover:opacity-70"
          style={{ fontSize: 12, fontWeight: 500 }}
        >
          <Image src="/downloads/scout-v2.png" alt="Scout" width={16} height={16} className="h-4 w-4 rounded-full object-contain" />
          <span>Ask Scout</span>
        </button>
      </div>
    </article>
  )
}

// ============================================
// SCOUT ANALYSIS CARD — appears after major articles
// ============================================

interface ScoutAnalysisCardProps {
  analysis: string
}

export function ScoutAnalysisCard({ analysis }: ScoutAnalysisCardProps) {
  return (
    <article
      className="hp-feed-card hp-card-enter"
      style={{ borderLeft: "3px solid #00D4FF" }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <img
          src="/downloads/scout-v2.png"
          alt="Scout"
          className="h-5 w-5 rounded-full object-contain"
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#00D4FF",
          }}
        >
          Scout Insight
        </span>
      </div>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--hp-foreground)",
          opacity: 0.8,
        }}
      >
        {analysis}
      </p>
    </article>
  )
}

// ============================================
// CARD 10: VIDEO/MEDIA CARD
// ============================================

interface VideoCardProps extends BaseCardProps {
  title: string
  duration: string
  source: string
  teaser: string
  thumbnailUrl: string
  stats: { comments: number; retweets: number; likes: number; views: string }
  slug?: string
  categorySlug?: string
  videoId?: string
  isShort?: boolean
}

export function VideoCard({ title, duration, source, teaser, thumbnailUrl, team, teamColor, timestamp, stats, slug, categorySlug, videoId, isShort }: VideoCardProps) {
  const [playing, setPlaying] = useState(false)
  const teamHex = teamColor
  const articleUrl = slug && categorySlug ? `/${categorySlug}/${slug}` : undefined
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : undefined

  return (
    <article className="hp-feed-card hp-card-enter">
      <div
        className="flex items-center justify-between gap-3 mb-4"
        style={isUntoldChicago(source) ? { marginTop: -8 } : undefined}
      >
      {/* Top left: P&I or Untold logo on partner cards; VIDEO + timestamp on others */}
        <div className="flex items-center gap-3 flex-shrink-0" style={{ height: isUntoldChicago(source) ? 40 : 66 }}>
          {isPinwheelsAndIvy(source) ? (
            <>
              <div className="hp-pi-logo">
                <img
                  src={PI_LOGO_LEFT_SRC}
                  alt="Pinwheels and Ivy"
                  width={255}
                  height={66}
                  className="object-contain object-left dark:hidden"
                  style={{ maxHeight: 66, width: 'auto', height: 66 }}
                  loading="eager"
                />
                <img
                  src={PI_LOGO_LEFT_DARK_SRC}
                  alt="Pinwheels and Ivy"
                  width={255}
                  height={66}
                  className="object-contain object-left hidden dark:block"
                  style={{ maxHeight: 66, width: 'auto', height: 66 }}
                  loading="eager"
                />
              </div>
              <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
            </>
          ) : isUntoldChicago(source) ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={UNTOLD_LOGO_SRC}
                alt="Untold Chicago"
                width={150}
                height={40}
                className="dark:hidden"
                style={{ height: 40, width: 'auto', objectFit: 'contain' }}
                loading="eager"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={UNTOLD_LOGO_DARK_SRC}
                alt="Untold Chicago"
                width={150}
                height={40}
                className="hidden dark:block"
                style={{ height: 40, width: 'auto', objectFit: 'contain' }}
                loading="eager"
              />
              <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
            </>
          ) : (
            <>
              <CardLabel label="VIDEO" />
              <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
            </>
          )}
        </div>
      {/* Top right: YouTube subscribe button on P&I cards; team logo on others */}
      <div className="flex items-center justify-end flex-shrink-0" style={{ height: 32 }}>
        {isPinwheelsAndIvy(source) ? (
          <a
            href="https://www.youtube.com/@PinwheelsandIvyPodcast?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full px-3 py-1 transition-opacity hover:opacity-80"
            style={{
              backgroundColor: '#FF0000',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              textDecoration: 'none',
              lineHeight: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="14" height="10" viewBox="0 0 24 17" fill="#fff">
              <path d="M23.5 2.5a3 3 0 00-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.4A3 3 0 00.5 2.5 31.5 31.5 0 000 8.5a31.5 31.5 0 00.5 6 3 3 0 002.1 2.1c1.9.4 9.4.4 9.4.4s7.5 0 9.4-.4a3 3 0 002.1-2.1 31.5 31.5 0 00.5-6 31.5 31.5 0 00-.5-6zM9.6 12.1V4.9l6.3 3.6-6.3 3.6z" />
            </svg>
            Subscribe
          </a>
        ) : isUntoldChicago(source) ? (
          <a
            href="https://www.youtube.com/@untoldchicago?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full px-3 py-1 transition-opacity hover:opacity-80"
            style={{
              backgroundColor: '#FF0000',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              textDecoration: 'none',
              lineHeight: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="14" height="10" viewBox="0 0 24 17" fill="#fff">
              <path d="M23.5 2.5a3 3 0 00-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.4A3 3 0 00.5 2.5 31.5 31.5 0 000 8.5a31.5 31.5 0 00.5 6 3 3 0 002.1 2.1c1.9.4 9.4.4 9.4.4s7.5 0 9.4-.4a3 3 0 002.1-2.1 31.5 31.5 0 00.5-6 31.5 31.5 0 00-.5-6zM9.6 12.1V4.9l6.3 3.6-6.3 3.6z" />
            </svg>
            Subscribe
          </a>
        ) : (
          <TeamTag team={team} teamHex={teamHex} />
        )}
      </div>
      </div>

      {articleUrl ? (
        <Link href={articleUrl}>
          <h2 className="hover:underline" style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>{title}</h2>
        </Link>
      ) : (
        <h2 style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>{title}</h2>
      )}
      <p className="mt-2.5 line-clamp-2" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--hp-foreground)', opacity: 0.7 }}>{teaser}</p>

      {/* Video container — all YouTube embeds (live, shorts, regular) share one standard 16:9 size, full card width */}
      <div className="mt-4 flex justify-center">
        <div
          className="relative rounded-2xl overflow-hidden shadow-md w-full"
          style={{
            background: '#000',
            aspectRatio: '16/9',
          }}
        >
          {playing && embedUrl ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          ) : (
            <button
              type="button"
              className="w-full h-full absolute inset-0 group"
              onClick={() => embedUrl ? setPlaying(true) : undefined}
              aria-label={`Play ${title}`}
            >
              <img
                src={thumbnailUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                style={{ opacity: 0.9 }}
              />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent, transparent)' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-all" style={{ background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                  <svg width="24" height="28" viewBox="0 0 20 24" fill="none" className="ml-1" aria-hidden="true">
                    <path d="M2 1L18 12L2 23V1Z" fill="#0B0F14" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 rounded-lg px-2.5 py-1" style={{ background: 'rgba(0,0,0,0.8)', fontSize: 12, fontWeight: 500, color: '#fff' }}>
                {duration}
              </div>
              <div className="absolute top-3 left-3 rounded-lg px-2.5 py-1" style={{ background: 'rgba(0,0,0,0.6)', fontSize: 12, fontWeight: 500, color: '#fff' }}>
                {source}
              </div>
            </button>
          )}
        </div>
      </div>

      <EngagementRow stats={stats} articleUrl={articleUrl} />
    </article>
  )
}

// ============================================
// WHAT FANS ARE SAYING CARD
// ============================================

const FAN_REACTIONS = [
  { quote: "Bears offensive line is the real problem.", user: "ChiBears_Fan42" },
  { quote: "Caleb Williams is the franchise. Protect him.", user: "WindyCityQB" },
  { quote: "Cubs pitching depth is underrated this year.", user: "NorthSideFaithful" },
  { quote: "Coby White is a legit All-Star.", user: "BullsNation23" },
  { quote: "Bedard is going to be generational.", user: "HawksTalk_" },
  { quote: "White Sox rebuild might actually work.", user: "SouthSideHope" },
]

export function FanReactionsCard() {
  const [picks] = useState(() => {
    const shuffled = [...FAN_REACTIONS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  })

  return (
    <article className="hp-feed-card hp-card-enter">
      <Link href="/fan-chat" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer' }}>
        {/* Fan Chat icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          style={{ color: '#00D4FF' }}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          />
        </svg>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--hp-foreground)" }}>
          What Fans Are Saying
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: '#22c55e',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            background: 'rgba(34, 197, 94, 0.12)',
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
          LIVE
        </span>
      </Link>

      <div className="space-y-3">
        {picks.map((r, i) => (
          <div
            key={i}
            className="rounded-xl p-3"
            style={{ background: "var(--hp-muted)", border: "1px solid rgba(0, 212, 255, 0.3)" }}
          >
            <p style={{ fontSize: 14, lineHeight: 1.5, color: "var(--hp-foreground)", fontStyle: "italic" }}>
              &ldquo;{r.quote}&rdquo;
            </p>
            <p className="mt-1" style={{ fontSize: 12, color: "var(--hp-muted-foreground)" }}>
              &mdash; {r.user}
            </p>
          </div>
        ))}
      </div>
    </article>
  )
}

// ============================================
// SCOUT PREDICTION CARD
// ============================================

interface ScoutPredictionCardProps {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  winProbability: number
}

export function ScoutPredictionCard({ homeTeam, awayTeam, homeScore, awayScore, winProbability }: ScoutPredictionCardProps) {
  const [userVote, setUserVote] = useState<"agree" | "disagree" | null>(null)
  const [agreeCount, setAgreeCount] = useState(Math.floor(Math.random() * 300) + 50)
  const [disagreeCount, setDisagreeCount] = useState(Math.floor(Math.random() * 200) + 30)

  const handleVote = (v: "agree" | "disagree") => {
    if (userVote) return
    setUserVote(v)
    if (v === "agree") setAgreeCount(c => c + 1)
    else setDisagreeCount(c => c + 1)
  }

  const total = agreeCount + disagreeCount
  const agreePercent = Math.round((agreeCount / total) * 100)

  return (
    <article className="hp-feed-card hp-card-enter" style={{ borderLeft: "3px solid #00D4FF" }}>
      <div className="flex items-center gap-2.5 mb-4">
        <img src="/downloads/scout-v2.png" alt="Scout" className="h-5 w-5 rounded-full object-contain" />
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#00D4FF" }}>
          Scout Prediction
        </span>
        <ScoutInsightBadge />
      </div>

      <div className="flex items-center justify-center gap-8 py-3">
        <div className="text-center">
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--hp-foreground)" }}>{homeTeam}</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: "var(--hp-foreground)" }}>{homeScore}</p>
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--hp-muted-foreground)" }}>vs</span>
        <div className="text-center">
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--hp-foreground)" }}>{awayTeam}</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: "var(--hp-foreground)" }}>{awayScore}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-1">
        <span style={{ fontSize: 13, color: "var(--hp-muted-foreground)" }}>Win probability:</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#00D4FF" }}>{winProbability}%</span>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => handleVote("agree")}
          disabled={userVote !== null}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all hp-tap-target"
          style={{
            border: `2px solid ${userVote === "agree" ? "#00D4FF" : "var(--hp-border)"}`,
            background: userVote === "agree" ? "rgba(0,212,255,0.1)" : "transparent",
            color: userVote === "disagree" ? "var(--hp-muted-foreground)" : "var(--hp-foreground)",
          }}
        >
          {userVote ? `Agree (${agreePercent}%)` : "\uD83D\uDC4D Agree"}
        </button>
        <button
          onClick={() => handleVote("disagree")}
          disabled={userVote !== null}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all hp-tap-target"
          style={{
            border: `2px solid ${userVote === "disagree" ? "#BC0000" : "var(--hp-border)"}`,
            background: userVote === "disagree" ? "rgba(188,0,0,0.1)" : "transparent",
            color: userVote === "agree" ? "var(--hp-muted-foreground)" : "var(--hp-foreground)",
          }}
        >
          {userVote ? `Disagree (${100 - agreePercent}%)` : "\uD83D\uDC4E Disagree"}
        </button>
      </div>
      {userVote && (
        <p className="mt-2 text-center" style={{ fontSize: 12, color: "var(--hp-muted-foreground)" }}>
          {total.toLocaleString()} votes
        </p>
      )}
    </article>
  )
}

// ============================================
// RUMOR CREDIBILITY METER
// ============================================

type CredibilityLevel = "HIGH" | "MEDIUM" | "LOW"

export function RumorCredibilityMeter({ level }: { level: CredibilityLevel }) {
  const config = {
    HIGH: { color: "#16a34a", width: "100%", label: "HIGH" },
    MEDIUM: { color: "#D6B05E", width: "60%", label: "MEDIUM" },
    LOW: { color: "#BC0000", width: "30%", label: "LOW" },
  }
  const { color, width, label } = config[level]

  return (
    <div className="mt-2 flex items-center gap-2.5">
      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--hp-muted-foreground)" }}>
        Credibility
      </span>
      <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "var(--hp-muted)", maxWidth: 80 }}>
        <div className="h-full rounded-full transition-all" style={{ width, background: color }} />
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color }}>{label}</span>
    </div>
  )
}

// ============================================
// GAME MODE CARD
// ============================================

interface GameModeCardProps {
  homeTeam: string
  awayTeam: string
  kickoff: string
  scoutNote: string
}

export function GameModeCard({ homeTeam, awayTeam, kickoff, scoutNote }: GameModeCardProps) {
  return (
    <article className="hp-feed-card hp-card-enter" style={{ border: "2px solid rgba(188, 0, 0, 0.3)" }}>
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#BC0000" }} />
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BC0000" }}>
          Game Mode
        </span>
      </div>

      <h2 style={{ fontSize: 21, fontWeight: 700, color: "var(--hp-foreground)" }}>
        {homeTeam} vs {awayTeam}
      </h2>
      <p className="mt-1" style={{ fontSize: 14, color: "var(--hp-muted-foreground)" }}>
        Kickoff: {kickoff}
      </p>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl p-3" style={{ background: "var(--hp-muted)", borderLeft: "3px solid #00D4FF" }}>
        <img src="/downloads/scout-v2.png" alt="Scout" className="h-5 w-5 rounded-full object-contain mt-0.5" />
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#00D4FF" }}>Scout says:</span>
          <p className="mt-0.5" style={{ fontSize: 14, lineHeight: 1.5, color: "var(--hp-foreground)", opacity: 0.8 }}>
            {scoutNote}
          </p>
        </div>
      </div>
    </article>
  )
}
