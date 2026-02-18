'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { TeamInfo, TeamRecord, NextGameInfo } from './TeamHubLayout'

/**
 * Team Hub Overview Component
 *
 * V10 Design System: Section 5.3 - Overview Tab
 * - Left: Latest Headlines, Analysis & Features
 * - Right: Season Snapshot card, compact Ask AI widget
 * - Mobile: Stack snapshot above headlines
 *
 * Design Sources:
 * - ESPN: Two-column layout with headlines left, stats right
 * - The Athletic: Featured article styling with hover effects
 * - CBS Sports: Compact stat cards with key metrics
 */

export interface TeamPost {
  id: string | number
  title: string
  slug: string
  excerpt?: string
  featuredImage?: string
  category?: string
  categorySlug?: string
  author?: {
    name: string
    avatar?: string
  }
  publishedAt: string
}

export interface SeasonStats {
  record?: string
  pointsPerGame?: number
  pointsAllowed?: number
  streak?: string
  lastFive?: string
  ranking?: string
  conferenceRank?: string
  divisionRank?: string
  [key: string]: any
}

interface TeamHubOverviewProps {
  team: TeamInfo
  record?: TeamRecord | null
  nextGame?: NextGameInfo | null
  posts: TeamPost[]
  seasonStats?: SeasonStats
  arEnabled?: boolean
}

export default function TeamHubOverview({
  team,
  record,
  nextGame,
  posts,
  seasonStats,
  arEnabled = true,
}: TeamHubOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Left Column: Headlines & Features - 2/3 width */}
      <div className="lg:col-span-2 space-y-6">
        {/* Season Snapshot - Mobile Only (appears first on mobile) */}
        <div className="lg:hidden">
          <SeasonSnapshotCard team={team} record={record} stats={seasonStats} />
        </div>

        {/* Latest Headlines */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-lg font-bold"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: 'var(--sm-text)',
              }}
            >
              Latest Headlines
            </h2>
            <Link
              href={`/${team.slug}/news`}
              className="text-sm font-medium hover:underline"
              style={{ color: team.secondaryColor }}
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {posts.slice(0, 5).map((post, index) => (
              <ArticleCard
                key={post.id}
                post={post}
                team={team}
                isLarge={index === 0}
              />
            ))}
          </div>
        </section>

        {/* Analysis & Features Section */}
        {posts.length > 5 && (
          <section>
            <h2
              className="text-lg font-bold mb-4"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                color: 'var(--sm-text)',
              }}
            >
              Analysis & Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {posts.slice(5, 9).map((post) => (
                <ArticleCard key={post.id} post={post} team={team} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Right Column: Season Snapshot & Ask AI - 1/3 width */}
      <div className="space-y-6">
        {/* Season Snapshot - Desktop Only */}
        <div className="hidden lg:block">
          <SeasonSnapshotCard team={team} record={record} stats={seasonStats} />
        </div>

        {/* Quick Links */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: 'var(--sm-surface)',
            border: '1px solid var(--sm-border)',
          }}
        >
          <h3
            className="font-bold mb-4"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: 'var(--sm-text)',
            }}
          >
            Quick Links
          </h3>
          <div className="space-y-2">
            <QuickLink
              href={`/${team.slug}/schedule`}
              icon={<CalendarIcon />}
              label="Schedule"
              team={team}
            />
            <QuickLink
              href={`/${team.slug}/roster`}
              icon={<RosterIcon />}
              label="Roster"
              team={team}
            />
            <QuickLink
              href={`/${team.slug}/stats`}
              icon={<StatsIcon />}
              label="Stats"
              team={team}
            />
            <QuickLink
              href={`/${team.slug}/players`}
              icon={<PlayersIcon />}
              label="All Players"
              team={team}
            />
          </div>
        </div>

        {/* Ask AI Widget */}
        <AskAIWidget team={team} />

        {/* Fan Chat Widget */}
        <FanChatWidget team={team} />

        {/* AR Experience - if enabled */}
        {arEnabled && <ARExperienceWidget team={team} />}
      </div>
    </div>
  )
}

// Article Card Component
function ArticleCard({
  post,
  team,
  isLarge = false,
}: {
  post: TeamPost
  team: TeamInfo
  isLarge?: boolean
}) {
  const href = post.categorySlug
    ? `/${post.categorySlug}/${post.slug}`
    : `/${team.slug.replace('chicago-', '')}/${post.slug}`

  if (isLarge) {
    return (
      <Link href={href} className="group block">
        <article
          className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
          style={{
            backgroundColor: 'var(--sm-surface)',
            border: '1px solid var(--sm-border)',
          }}
        >
          <div className="flex flex-col md:flex-row">
            {post.featuredImage && (
              <div className="relative aspect-[16/9] md:aspect-auto md:w-1/2 overflow-hidden">
                <Image
                  src={post.featuredImage}
                  alt=""
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: team.secondaryColor }}
                />
              </div>
            )}
            <div className="p-4 md:p-5 flex-1">
              <span
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: team.secondaryColor }}
              >
                {post.category || team.shortName}
              </span>
              <h3
                className="font-bold mt-1 line-clamp-3 group-hover:underline"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--sm-text)',
                  fontSize: '18px',
                  lineHeight: '1.3',
                }}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p
                  className="text-sm mt-2 line-clamp-2"
                  style={{ color: 'var(--sm-text-muted)' }}
                >
                  {post.excerpt}
                </p>
              )}
              <div
                className="flex items-center gap-2 mt-3 text-xs"
                style={{ color: 'var(--sm-text-muted)' }}
              >
                {post.author && <span>{post.author.name}</span>}
                <span>•</span>
                <span>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={href} className="group block">
      <article
        className="rounded-xl overflow-hidden flex gap-4 p-3 transition-colors"
        style={{ backgroundColor: 'var(--sm-surface)' }}
      >
        {post.featuredImage && (
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={post.featuredImage}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold line-clamp-2 group-hover:underline"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: 'var(--sm-text)',
              fontSize: '14px',
              lineHeight: '1.4',
            }}
          >
            {post.title}
          </h3>
          <div
            className="flex items-center gap-2 mt-2 text-xs"
            style={{ color: 'var(--sm-text-muted)' }}
          >
            <span>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// Season Snapshot Card
function SeasonSnapshotCard({
  team,
  record,
  stats,
}: {
  team: TeamInfo
  record?: TeamRecord | null
  stats?: SeasonStats
}) {
  const formatRecord = () => {
    if (!record) return '--'
    if (team.league === 'NFL') {
      const tie = record.ties && record.ties > 0 ? `-${record.ties}` : ''
      return `${record.wins}-${record.losses}${tie}`
    }
    if (team.league === 'NHL') {
      const ot = record.otLosses && record.otLosses > 0 ? `-${record.otLosses}` : ''
      return `${record.wins}-${record.losses}${ot}`
    }
    return `${record.wins}-${record.losses}`
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--sm-surface)',
        border: '1px solid var(--sm-border)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4"
        style={{ backgroundColor: team.primaryColor }}
      >
        <div className="flex items-center gap-3">
          <Image
            src={team.logo}
            alt={team.name}
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
            unoptimized
          />
          <div>
            <h3
              className="font-bold text-white"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Season Snapshot
            </h3>
            <p className="text-xs text-white/70">2025 Season</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 space-y-4">
        {/* Record */}
        <div className="text-center pb-4" style={{ borderBottom: '1px solid var(--sm-border)' }}>
          <div
            className="text-4xl font-bold"
            style={{ color: team.secondaryColor }}
          >
            {formatRecord()}
          </div>
          <div className="text-sm text-[var(--sm-text-muted)] mt-1">Record</div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats?.pointsPerGame !== undefined && (
            <StatItem label="PPG" value={stats.pointsPerGame.toFixed(1)} />
          )}
          {stats?.pointsAllowed !== undefined && (
            <StatItem label="Opp PPG" value={stats.pointsAllowed.toFixed(1)} />
          )}
          {stats?.streak && (
            <StatItem label="Streak" value={stats.streak} />
          )}
          {stats?.lastFive && (
            <StatItem label="Last 5" value={stats.lastFive} />
          )}
          {stats?.conferenceRank && (
            <StatItem label="Conf. Rank" value={stats.conferenceRank} />
          )}
          {stats?.divisionRank && (
            <StatItem label="Div. Rank" value={stats.divisionRank} />
          )}
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold" style={{ color: 'var(--sm-text)' }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
        {label}
      </div>
    </div>
  )
}

// Quick Link Component
function QuickLink({
  href,
  icon,
  label,
  team,
}: {
  href: string
  icon: React.ReactNode
  label: string
  team: TeamInfo
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--sm-card-hover)]"
    >
      <span style={{ color: team.secondaryColor }}>{icon}</span>
      <span
        className="text-sm font-medium"
        style={{ color: 'var(--sm-text)' }}
      >
        {label}
      </span>
      <svg
        className="w-4 h-4 ml-auto"
        style={{ color: 'var(--sm-text-muted)' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  )
}

// Scout AI Widget
function AskAIWidget({ team }: { team: TeamInfo }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--sm-surface)',
        border: '1px solid var(--sm-border)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${team.secondaryColor}20` }}
        >
          <Image
            src="/downloads/scout-v2.png"
            alt="Scout AI"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        </div>
        <div>
          <h3
            className="font-bold"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: 'var(--sm-text)',
            }}
          >
            Scout AI
          </h3>
          <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
            Get instant answers
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <SuggestedQuestion
          question={`What's the ${team.shortName} record this season?`}
          team={team}
        />
        <SuggestedQuestion
          question={`Who leads the ${team.shortName} in scoring?`}
          team={team}
        />
      </div>

      <Link
        href={`/scout-ai?team=${team.slug}`}
        className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white"
        style={{ backgroundColor: team.secondaryColor }}
      >
        Ask Scout
      </Link>
    </div>
  )
}

function SuggestedQuestion({ question, team }: { question: string; team: TeamInfo }) {
  return (
    <Link
      href={`/scout-ai?team=${team.slug}&q=${encodeURIComponent(question)}`}
      className="block px-3 py-2 rounded-lg text-sm transition-colors"
      style={{
        backgroundColor: 'var(--sm-surface)',
        color: 'var(--sm-text-dim)',
      }}
    >
      &quot;{question}&quot;
    </Link>
  )
}

// Fan Chat Widget
function FanChatWidget({ team }: { team: TeamInfo }) {
  const chatRoomId = team.slug.replace('chicago-', '')

  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--sm-surface)',
        border: '1px solid var(--sm-border)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${team.primaryColor}20` }}
        >
          <svg
            className="w-5 h-5"
            style={{ color: team.primaryColor }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
        </div>
        <div>
          <h3
            className="font-bold"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: 'var(--sm-text)',
            }}
          >
            {team.shortName} Fan Chat
          </h3>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>247 fans online</span>
          </div>
        </div>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--sm-text-dim)' }}>
        Join the conversation with fellow {team.shortName} fans.
      </p>

      <Link
        href={`/fan-chat?channel=${chatRoomId}`}
        className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white"
        style={{ backgroundColor: team.primaryColor }}
      >
        Join Chat
      </Link>
    </div>
  )
}

// AR Experience Widget
function ARExperienceWidget({ team }: { team: TeamInfo }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        border: '1px solid var(--sm-border)',
      }}
    >
      <div
        className="p-5"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor} 100%)`,
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              AR Stadium Tour
            </h3>
            <p className="text-xs text-white/70">
              Immersive experience
            </p>
          </div>
        </div>

        <p className="text-sm text-white/80 mb-4">
          Explore the stadium in augmented reality.
        </p>

        <Link
          href={`/ar-vr?team=${team.slug}`}
          className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors bg-white/20 text-white hover:bg-white/30"
        >
          Launch AR Tour
        </Link>
      </div>
    </div>
  )
}

// Icons
function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function RosterIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function StatsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  )
}

function PlayersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}
