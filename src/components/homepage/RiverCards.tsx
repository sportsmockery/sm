"use client"

import { useState } from "react"
import {
  MessageCircle, Repeat2, Heart, Activity, Bookmark, Share,
  TrendingUp, Play, Clock, Check, X, ChevronRight, Bot,
  BarChart3, Users
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

// ============================================
// SHARED TYPES & UTILITIES
// ============================================

export interface BaseCardProps {
  team: string
  teamColor: string
  timestamp: string
}

// Team tag component
function TeamTag({ team, teamHex }: { team: string; teamHex: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-white shadow-sm"
      style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: 6, backgroundColor: teamHex }}
    >
      {team}
    </span>
  )
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

// Shared engagement row
function EngagementRow({ stats }: { stats: { comments: number; retweets: number; likes: number; views: string } }) {
  const [liked, setLiked] = useState(false)
  const [shared, setShared] = useState(false)
  const [saved, setSaved] = useState(false)

  return (
    <div className="mt-5 flex max-w-md justify-between" style={{ color: 'var(--hp-muted-foreground)' }}>
      <button className="group flex items-center gap-1 transition-colors hover:text-blue-500 hp-tap-target" aria-label="Discuss">
        <div className="rounded-full p-2 group-hover:bg-blue-500/10 transition-colors">
          <MessageCircle className="h-4 w-4" />
        </div>
        <span style={{ fontSize: 13 }}>{stats.comments}</span>
      </button>
      <button
        onClick={() => setShared(!shared)}
        className={`group flex items-center gap-1 transition-colors hp-tap-target ${shared ? 'text-green-500' : 'hover:text-green-500'}`}
        aria-label="Share"
      >
        <div className={`rounded-full p-2 transition-colors ${shared ? 'bg-green-500/10' : 'group-hover:bg-green-500/10'}`}>
          <Repeat2 className="h-4 w-4" />
        </div>
        <span style={{ fontSize: 13 }}>{stats.retweets}</span>
      </button>
      <button
        onClick={() => setLiked(!liked)}
        className={`group flex items-center gap-1 transition-colors hp-tap-target ${liked ? 'text-pink-500' : 'hover:text-pink-500'}`}
        aria-label="React"
      >
        <div className={`rounded-full p-2 transition-colors ${liked ? 'bg-pink-500/10' : 'group-hover:bg-pink-500/10'}`}>
          <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
        </div>
        <span style={{ fontSize: 13 }}>{liked ? stats.likes + 1 : stats.likes}</span>
      </button>
      <button className="group flex items-center gap-1 transition-colors hover:text-orange-500 hp-tap-target" aria-label="Views">
        <div className="rounded-full p-2 group-hover:bg-orange-500/10 transition-colors">
          <Activity className="h-4 w-4" />
        </div>
        <span style={{ fontSize: 13 }}>{stats.views}</span>
      </button>
      <div className="flex">
        <button
          onClick={() => setSaved(!saved)}
          className={`rounded-full p-2 transition-colors hp-tap-target ${saved ? 'text-blue-500 bg-blue-500/10' : 'hover:bg-blue-500/10 hover:text-blue-500'}`}
          aria-label="Save"
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </button>
        <button className="rounded-full p-2 transition-colors hover:bg-blue-500/10 hover:text-blue-500 hp-tap-target" aria-label="Share">
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
}

export function EditorialCard({
  headline, summary, insight, team, teamColor, timestamp, stats, author_name, breakingIndicator, gmQuestion,
}: EditorialCardProps) {
  const [vote, setVote] = useState<"yes" | "no" | null>(null)
  const [yesVotes, setYesVotes] = useState(Math.floor(Math.random() * 500) + 200)
  const [noVotes, setNoVotes] = useState(Math.floor(Math.random() * 300) + 100)
  const teamHex = teamColor

  const handleVote = (choice: "yes" | "no") => {
    if (vote) return
    setVote(choice)
    if (choice === "yes") setYesVotes((prev) => prev + 1)
    else setNoVotes((prev) => prev + 1)
  }

  const totalVotes = yesVotes + noVotes
  const yesPercentage = Math.round((yesVotes / totalVotes) * 100)
  const noPercentage = Math.round((noVotes / totalVotes) * 100)

  return (
    <article className="hp-feed-card hp-card-enter">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <CardLabel label={breakingIndicator || "NEWS"} isBreaking={breakingIndicator === "BREAKING"} />
          <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
        </div>
        <TeamTag team={team} teamHex={teamHex} />
      </div>

      <h2 style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>{headline}</h2>
      <p className="mt-3 line-clamp-3" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--hp-foreground)', opacity: 0.7 }}>{summary}</p>

      {insight && (
        <div className="mt-5 rounded-2xl p-4" style={{ background: 'var(--hp-muted)', borderLeft: `3px solid ${teamHex}`, opacity: 0.9 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--hp-muted-foreground)' }}>Insight</span>
          <p className="mt-2" style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--hp-foreground)', opacity: 0.65 }}>{insight}</p>
        </div>
      )}

      <p className="mt-4" style={{ fontSize: 12, color: 'var(--hp-muted-foreground)' }}>By {author_name}</p>
      <EngagementRow stats={stats} />

      {gmQuestion && (
        <div className="mt-5 rounded-2xl p-4" style={{ border: '1px solid var(--hp-border)', background: 'var(--hp-muted)', opacity: 0.9 }}>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-500" />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--hp-muted-foreground)' }}>GM Pulse</span>
          </div>
          <p className="mt-2" style={{ fontSize: 15, fontWeight: 500, color: 'var(--hp-foreground)' }}>{gmQuestion}</p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => handleVote("yes")}
              disabled={vote !== null}
              className="relative flex-1 overflow-hidden rounded-xl px-4 py-2.5 text-sm font-semibold transition-all"
              style={{
                border: `2px solid ${vote === "yes" ? '#22c55e' : vote === "no" ? 'var(--hp-border)' : '#22c55e'}`,
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
                border: `2px solid ${vote === "no" ? '#ef4444' : vote === "yes" ? 'var(--hp-border)' : '#ef4444'}`,
                background: vote === "no" ? 'rgba(239,68,68,0.1)' : vote === "yes" ? 'var(--hp-muted)' : 'transparent',
                color: vote === "yes" ? 'var(--hp-muted-foreground)' : '#dc2626',
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
                border: `2px solid ${isSelected ? '#3b82f6' : 'var(--hp-border)'}`,
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
                <span style={{ color: isSelected ? '#2563eb' : 'var(--hp-foreground)' }}>{option}</span>
                {isVoted && <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? '#2563eb' : 'var(--hp-muted-foreground)' }}>{percentage}%</span>}
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
      <EngagementRow stats={stats} />
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

      <button className="mt-4 flex items-center gap-1 transition-colors hp-tap-target" style={{ fontSize: 14, fontWeight: 600, color: '#2563eb' }}>
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
        <button className="hp-tap-target" style={{ fontSize: 14, fontWeight: 500, color: '#2563eb' }}>Recap</button>
        <button className="hp-tap-target" style={{ fontSize: 14, fontWeight: 500, color: '#2563eb' }}>Full box score</button>
        <button className="hp-tap-target" style={{ fontSize: 14, fontWeight: 500, color: '#2563eb' }}>Reactions</button>
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
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#22c55e' }} />
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
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#ef4444' }} />
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
                  <div className="h-full rounded-full" style={{ width: `${fairnessScore}%`, background: 'linear-gradient(to right, #ef4444, #eab308, #22c55e)' }} />
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
                background: userVote === "approve" ? '#22c55e' : 'var(--hp-card)',
                color: userVote === "approve" ? '#fff' : 'var(--hp-foreground)',
                border: `1px solid ${userVote === "approve" ? '#22c55e' : 'var(--hp-border)'}`,
              }}
            >
              <Check className="h-3.5 w-3.5" /> Approve
            </button>
            <button
              onClick={() => setUserVote("reject")}
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 transition-all hp-tap-target"
              style={{
                fontSize: 12, fontWeight: 600,
                background: userVote === "reject" ? '#ef4444' : 'var(--hp-card)',
                color: userVote === "reject" ? '#fff' : 'var(--hp-foreground)',
                border: `1px solid ${userVote === "reject" ? '#ef4444' : 'var(--hp-border)'}`,
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
}

export function ScoutSummaryCard({ summary, bullets, topic, team, teamColor, timestamp }: ScoutSummaryCardProps) {
  const teamHex = teamColor

  return (
    <article className="hp-feed-card hp-card-enter">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <CardLabel label="SCOUT AI" />
          <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
        </div>
        <TeamTag team={team} teamHex={teamHex} />
      </div>

      <p className="mb-2" style={{ fontSize: 12, fontWeight: 500, color: 'var(--hp-muted-foreground)' }}>Summary: {topic}</p>
      <p style={{ fontSize: 17, lineHeight: 1.5, fontWeight: 500, color: 'var(--hp-foreground)' }}>{summary}</p>

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

      <div className="mt-4 flex gap-4">
        <button className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition-colors hp-tap-target" style={{ fontSize: 14, fontWeight: 600, background: 'rgba(6,182,212,0.1)', color: '#0891b2' }}>
          <Bot className="h-4 w-4" /> Ask Scout
        </button>
        <button className="hp-tap-target transition-colors" style={{ fontSize: 14, fontWeight: 500, color: 'var(--hp-muted-foreground)' }}>
          View full analysis
        </button>
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
}

export function TrendingArticleCard({ headline, summary, trendMetric, team, teamColor, timestamp, stats }: TrendingArticleCardProps) {
  const teamHex = teamColor

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

      <h2 style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>{headline}</h2>
      <p className="mt-3 line-clamp-3" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--hp-foreground)', opacity: 0.7 }}>{summary}</p>

      <EngagementRow stats={stats} />
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
            border: `2px solid ${selectedSide === "b" ? '#3b82f6' : selectedSide === "a" ? 'var(--hp-border)' : 'var(--hp-border)'}`,
            background: selectedSide === "b" ? 'rgba(59,130,246,0.1)' : selectedSide === "a" ? 'var(--hp-muted)' : 'transparent',
          }}
        >
          {selectedSide && (
            <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: 'var(--hp-muted)' }}>
              <div className="h-full transition-all duration-500" style={{ width: `${percentB}%`, background: '#3b82f6' }} />
            </div>
          )}
          <p className="font-semibold" style={{ color: selectedSide === "b" ? '#2563eb' : 'var(--hp-foreground)' }}>{sideB}</p>
          {selectedSide && <p className="mt-2 text-2xl font-bold" style={{ color: '#2563eb' }}>{percentB}%</p>}
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between" style={{ fontSize: 14, color: 'var(--hp-muted-foreground)' }}>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{participantCount.toLocaleString()} participating</span>
        </div>
        <button className="font-medium hp-tap-target" style={{ color: '#2563eb' }}>Join discussion</button>
      </div>
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
}

export function VideoCard({ title, duration, source, teaser, thumbnailUrl, team, teamColor, timestamp, stats }: VideoCardProps) {
  const teamHex = teamColor

  return (
    <article className="hp-feed-card hp-card-enter">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <CardLabel label="VIDEO" />
          <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{timestamp}</span>
        </div>
        <TeamTag team={team} teamHex={teamHex} />
      </div>

      <h2 style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.02em', color: 'var(--hp-foreground)' }}>{title}</h2>
      <p className="mt-2.5 line-clamp-2" style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--hp-foreground)', opacity: 0.7 }}>{teaser}</p>

      <div className="mt-4 relative rounded-2xl overflow-hidden group shadow-md" style={{ background: '#000', aspectRatio: '16/9' }}>
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
          style={{ opacity: 0.9 }}
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent, transparent)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'rgba(255,255,255,0.95)' }}>
            <Play className="h-7 w-7 ml-1" style={{ color: '#000' }} fill="#000" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg px-2.5 py-1" style={{ background: 'rgba(0,0,0,0.8)', fontSize: 12, fontWeight: 500, color: '#fff' }}>
          {duration}
        </div>
        <div className="absolute top-3 left-3 rounded-lg px-2.5 py-1" style={{ background: 'rgba(0,0,0,0.6)', fontSize: 12, fontWeight: 500, color: '#fff' }}>
          {source}
        </div>
      </div>

      <EngagementRow stats={stats} />
    </article>
  )
}
