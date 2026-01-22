# Team Submenu Pages - Full Code Listing

Generated: January 22, 2026

This document contains the full source code for all team submenu pages.

---

# CHICAGO BEARS

## News - /chicago-bears
File: `src/app/chicago-bears/page.tsx`

```tsx
import { Metadata } from 'next'
import { TeamHubLayout, TeamHubOverview } from '@/components/team'
import {
  BearsSeasonCard,
  BearsRosterHighlights,
  BearsTrendingTopics,
} from '@/components/bears'
import ARTourButton from '@/components/ar/ARTourButton'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import {
  getBearsSeasonOverview,
  getBearsKeyPlayers,
  getBearsTrends,
  getBearsPosts,
} from '@/lib/bears'

export const metadata: Metadata = {
  title: 'Chicago Bears | News, Stats, Schedule & Roster | SportsMockery',
  description: 'Complete Chicago Bears coverage including latest news, team stats, schedule, roster, player profiles, and expert analysis.',
  openGraph: {
    title: 'Chicago Bears Hub | Sports Mockery',
    description: 'Your #1 source for Chicago Bears news, stats, schedule, and analysis',
    type: 'website',
  },
}

// Revalidate every hour
export const revalidate = 3600

export default async function BearsHubPage() {
  const team = CHICAGO_TEAMS.bears

  // Fetch all Bears data in parallel
  const [
    record,
    nextGame,
    seasonOverview,
    keyPlayers,
    trends,
    posts,
  ] = await Promise.all([
    fetchTeamRecord('bears'),
    fetchNextGame('bears'),
    getBearsSeasonOverview(),
    getBearsKeyPlayers(),
    getBearsTrends(),
    getBearsPosts(12),
  ])

  // Transform posts for TeamHubOverview component
  const teamPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    featuredImage: post.featuredImage,
    category: 'Bears',
    categorySlug: post.categorySlug,
    author: {
      name: post.author?.displayName || 'Staff',
      avatar: post.author?.avatarUrl,
    },
    publishedAt: post.publishedAt,
  }))

  // Build season stats from overview
  const seasonStats = seasonOverview ? {
    record: `${seasonOverview.record?.wins || 0}-${seasonOverview.record?.losses || 0}`,
    standing: seasonOverview.standing,
  } : undefined

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="overview"
    >
      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Season Snapshot - Mobile Only */}
          <div className="lg:hidden">
            <BearsSeasonCard season={seasonOverview} />
          </div>

          {/* Latest Headlines */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-bold border-b-2 pb-1"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--text-primary)',
                  borderColor: team.secondaryColor,
                }}
              >
                Latest Bears News
              </h2>
              <a
                href="/chicago-bears/news"
                className="text-sm font-medium hover:underline"
                style={{ color: team.secondaryColor }}
              >
                View All
              </a>
            </div>

            <div className="space-y-4">
              {teamPosts.slice(0, 6).map((post, index) => (
                <ArticleCard
                  key={post.id}
                  post={post}
                  team={team}
                  isLarge={index === 0}
                />
              ))}
            </div>
          </section>

          {/* More Stories */}
          {teamPosts.length > 6 && (
            <section>
              <h2
                className="text-lg font-bold mb-4 border-b-2 pb-1"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--text-primary)',
                  borderColor: team.secondaryColor,
                }}
              >
                More Bears Stories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teamPosts.slice(6, 12).map((post) => (
                  <ArticleCard key={post.id} post={post} team={team} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Season Card - Desktop Only */}
          <div className="hidden lg:block">
            <BearsSeasonCard season={seasonOverview} />
          </div>

          {/* Key Players */}
          {keyPlayers && keyPlayers.length > 0 && (
            <BearsRosterHighlights players={keyPlayers} />
          )}

          {/* AR Stadium Tour */}
          <ARTourButton team="chicago-bears" />

          {/* Trending Topics */}
          {trends && trends.length > 0 && (
            <BearsTrendingTopics trends={trends} />
          )}

          {/* Ask AI Widget */}
          <AskAIWidget team={team} />

          {/* Fan Chat Widget */}
          <FanChatWidget team={team} />
        </div>
      </div>
    </TeamHubLayout>
  )
}

// Article Card Component
import Image from 'next/image'
import Link from 'next/link'

function ArticleCard({
  post,
  team,
  isLarge = false,
}: {
  post: any
  team: typeof CHICAGO_TEAMS.bears
  isLarge?: boolean
}) {
  const href = post.categorySlug
    ? `/${post.categorySlug}/${post.slug}`
    : `/bears/${post.slug}`

  if (isLarge) {
    return (
      <Link href={href} className="group block">
        <article
          className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
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
                  priority
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
                {post.category || 'Bears'}
              </span>
              <h3
                className="font-bold mt-1 line-clamp-3 group-hover:underline"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--text-primary)',
                  fontSize: '18px',
                  lineHeight: '1.3',
                }}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p
                  className="text-sm mt-2 line-clamp-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {post.excerpt}
                </p>
              )}
              <div
                className="flex items-center gap-2 mt-3 text-xs"
                style={{ color: 'var(--text-muted)' }}
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
        className="rounded-xl overflow-hidden flex gap-4 p-3 transition-colors hover:bg-[var(--bg-hover)]"
        style={{ backgroundColor: 'var(--bg-surface)' }}
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
              color: 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: '1.4',
            }}
          >
            {post.title}
          </h3>
          <div
            className="flex items-center gap-2 mt-2 text-xs"
            style={{ color: 'var(--text-muted)' }}
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

// Ask AI Widget
function AskAIWidget({ team }: { team: typeof CHICAGO_TEAMS.bears }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${team.secondaryColor}20` }}
        >
          <svg
            className="w-5 h-5"
            style={{ color: team.secondaryColor }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div>
          <h3
            className="font-bold"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: 'var(--text-primary)',
            }}
          >
            Ask Bears AI
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Get instant answers about the Bears
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <Link
          href="/ask-ai?team=chicago-bears&q=What%20is%20the%20Bears%20record%20this%20season"
          className="block px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
          }}
        >
          &quot;What&apos;s the Bears record?&quot;
        </Link>
        <Link
          href="/ask-ai?team=chicago-bears&q=Who%20is%20the%20Bears%20quarterback"
          className="block px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
          }}
        >
          &quot;Who is the Bears quarterback?&quot;
        </Link>
      </div>

      <Link
        href="/ask-ai?team=chicago-bears"
        className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white"
        style={{ backgroundColor: team.secondaryColor }}
      >
        Ask a Question
      </Link>
    </div>
  )
}

// Fan Chat Widget
function FanChatWidget({ team }: { team: typeof CHICAGO_TEAMS.bears }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
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
              color: 'var(--text-primary)',
            }}
          >
            Bears Fan Chat
          </h3>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>247 fans online</span>
          </div>
        </div>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        Join the conversation with fellow Bears fans.
      </p>

      <Link
        href="/fan-chat?channel=bears"
        className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white"
        style={{ backgroundColor: team.primaryColor }}
      >
        Join Bears Chat
      </Link>
    </div>
  )
}
```

---

## Schedule - /chicago-bears/schedule
File: `src/app/chicago-bears/schedule/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsSchedule, getAvailableSeasons, getPlayoffRoundName, type BearsGame } from '@/lib/bearsData'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'

// Bears logo URL
const BEARS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png'

export const metadata: Metadata = {
  title: 'Chicago Bears Schedule 2025 | Game Dates & Results | SportsMockery',
  description: 'Complete Chicago Bears 2025 schedule with game dates, times, opponents, scores, and results. View upcoming games and past results.',
}

export const revalidate = 3600

export default async function BearsSchedulePage() {
  // 2025-26 NFL season is stored as season = 2025
  const currentSeason = 2025
  const team = CHICAGO_TEAMS.bears

  // Fetch all data in parallel
  const [schedule, seasons, record, nextGame] = await Promise.all([
    getBearsSchedule(currentSeason),
    getAvailableSeasons(),
    fetchTeamRecord('bears'),
    fetchNextGame('bears'),
  ])

  // Calculate record
  const completedGames = schedule.filter(g => g.status === 'final')
  const wins = completedGames.filter(g => g.result === 'W').length
  const losses = completedGames.filter(g => g.result === 'L').length

  // Find next scheduled game
  const nextScheduledGame = schedule.find(g => g.status === 'scheduled')

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="schedule"
    >
      {/* Schedule Content */}
      <div>
        {/* Next Game Highlight - Compact */}
        {nextScheduledGame && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 bg-[#C83200]/10 text-[#C83200] text-xs font-semibold rounded">
                  UP NEXT
                </div>
                <div className="flex items-center gap-2">
                  {nextScheduledGame.opponentLogo && (
                    <Image
                      src={nextScheduledGame.opponentLogo}
                      alt={nextScheduledGame.opponent}
                      width={28}
                      height={28}
                      className="w-7 h-7"
                    />
                  )}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {nextScheduledGame.homeAway === 'home' ? 'vs' : '@'} {nextScheduledGame.opponentFullName || nextScheduledGame.opponent}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-[var(--text-primary)] font-medium">
                  {new Date(nextScheduledGame.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-[var(--text-muted)]">
                  {nextScheduledGame.time || 'TBD'} {nextScheduledGame.tv && `• ${nextScheduledGame.tv}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Schedule */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Full Schedule
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              {schedule.length} games
            </span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {schedule.map((game) => (
              <GameRow key={game.gameId} game={game} />
            ))}
          </div>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function GameRow({ game }: { game: BearsGame }) {
  const gameDate = new Date(game.date)
  const isPast = game.status === 'final'
  const isInProgress = game.status === 'in_progress'
  const playoffRound = game.isPlayoff ? getPlayoffRoundName(game.week) : null

  return (
    <div className={`p-4 hover:bg-[var(--bg-hover)] transition-colors ${isPast ? '' : 'bg-[var(--bg-tertiary)]/30'}`}>
      <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[100px_1fr_140px] gap-4 items-center">
        {/* Week & Date */}
        <div className="flex-shrink-0">
          {game.isPlayoff ? (
            <div className="px-2 py-1 bg-[#C83200]/10 text-[#C83200] text-xs rounded font-semibold inline-block mb-1">
              {playoffRound || 'Playoff'}
            </div>
          ) : (
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Week {game.week}
            </div>
          )}
          <div className="font-medium text-[var(--text-primary)]">
            {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {game.dayOfWeek}
          </div>
        </div>

        {/* Matchup - Compact Design */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Bears Logo */}
          <div className="w-7 h-7 flex-shrink-0">
            <Image
              src={BEARS_LOGO}
              alt="Chicago Bears"
              width={28}
              height={28}
              className="w-full h-full object-contain"
            />
          </div>

          <span className="text-xs text-[var(--text-muted)] font-medium flex-shrink-0">
            {game.homeAway === 'home' ? 'vs' : '@'}
          </span>

          {/* Opponent Logo */}
          {game.opponentLogo && (
            <div className="w-7 h-7 flex-shrink-0">
              <Image
                src={game.opponentLogo}
                alt={game.opponentFullName || game.opponent}
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)] truncate block">
              {game.opponentFullName || game.opponent}
            </span>
            {game.venue && (
              <div className="text-xs text-[var(--text-muted)] truncate hidden sm:block">
                {game.venue}
              </div>
            )}
          </div>
        </div>

        {/* Result / Time - Right aligned */}
        <div className="text-right flex-shrink-0">
          {isPast ? (
            <div className="flex items-center gap-2 justify-end">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                game.result === 'W'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {game.result}
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.bearsScore}-{game.oppScore}
              </span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-2 justify-end">
              <span className="px-2 py-0.5 bg-[#C83200]/10 text-[#C83200] rounded text-xs font-medium animate-pulse">
                LIVE
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.bearsScore}-{game.oppScore}
              </span>
            </div>
          ) : (
            <div>
              <div className="font-medium text-[var(--text-primary)] text-sm">
                {game.time || 'TBD'}
              </div>
              {game.tv && (
                <div className="text-xs text-[var(--text-muted)]">
                  {game.tv}
                </div>
              )}
            </div>
          )}
          {/* Recap Link inline */}
          {game.articleSlug && (
            <Link
              href={`/bears/${game.articleSlug}`}
              className="text-xs text-[#C83200] hover:underline mt-1 inline-block"
            >
              Recap →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Scores - /chicago-bears/scores
File: `src/app/chicago-bears/scores/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsRecentScores, getPlayoffRoundName, type BearsGame } from '@/lib/bearsData'
import BoxScoreClient from './BoxScoreClient'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'

// Bears logo URL
const BEARS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png'

export const metadata: Metadata = {
  title: 'Chicago Bears Scores 2025 | Box Scores & Results | SportsMockery',
  description: 'Full Chicago Bears box scores with detailed player stats. View passing, rushing, receiving, and defensive stats for every game.',
}

export const revalidate = 1800

export default async function BearsScoresPage() {
  const team = CHICAGO_TEAMS.bears

  // Fetch all data in parallel
  const [recentScores, record, nextGame] = await Promise.all([
    getBearsRecentScores(20),
    fetchTeamRecord('bears'),
    fetchNextGame('bears'),
  ])

  // Calculate record
  const wins = recentScores.filter(g => g.result === 'W').length
  const losses = recentScores.filter(g => g.result === 'L').length

  // Get latest game ID for initial box score
  const latestGame = recentScores[0]
  const initialGameId = latestGame?.gameId || null

  // Transform games for client component - most recent first
  const games = recentScores
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(game => ({
      gameId: game.gameId,
      week: game.week,
      date: game.date,
      opponent: game.opponent,
      opponentFullName: game.opponentFullName,
      opponentLogo: game.opponentLogo,
      bearsScore: game.bearsScore,
      oppScore: game.oppScore,
      result: game.result,
      isPlayoff: game.isPlayoff,
      playoffRound: game.isPlayoff ? getPlayoffRoundName(game.week) : null,
      homeAway: game.homeAway,
    }))

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="scores"
    >
      {/* Box Score Client Component */}
      <BoxScoreClient games={games} initialGameId={initialGameId} />

      {/* Footer Link */}
      <div className="mt-8 text-center">
        <Link
          href="/chicago-bears/schedule"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#C83200] hover:bg-[#a82900] text-white font-semibold rounded-xl transition-colors"
        >
          View Full Schedule
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </TeamHubLayout>
  )
}
```

---

## Stats - /chicago-bears/stats
File: `src/app/chicago-bears/stats/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsStats, type BearsStats, type LeaderboardEntry, type BearsPlayer } from '@/lib/bearsData'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'

export const metadata: Metadata = {
  title: 'Chicago Bears Stats 2025 | Team & Player Statistics | SportsMockery',
  description: 'Chicago Bears 2025 team and player statistics. View passing, rushing, receiving, and defensive leaderboards plus team stats.',
}

export const revalidate = 3600

export default async function BearsStatsPage() {
  // 2025-26 NFL season is stored as season = 2025
  const currentSeason = 2025
  const team = CHICAGO_TEAMS.bears

  // Fetch all data in parallel
  const [stats, record, nextGame] = await Promise.all([
    getBearsStats(currentSeason),
    fetchTeamRecord('bears'),
    fetchNextGame('bears'),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="stats"
    >
      {/* Stats Content */}
      <div>
        {/* Team Overview Cards */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Team Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TeamStatCard
              label="Record"
              value={stats.team.record}
              sublabel={`${stats.team.wins}W - ${stats.team.losses}L`}
            />
            <TeamStatCard
              label="Points/Game"
              value={stats.team.ppg.toFixed(1)}
              sublabel={`${stats.team.pointsFor} total pts`}
              positive
            />
            <TeamStatCard
              label="Points Allowed/Game"
              value={stats.team.papg.toFixed(1)}
              sublabel={`${stats.team.pointsAgainst} total pts`}
              negative={stats.team.papg > stats.team.ppg}
            />
            <TeamStatCard
              label="Point Diff"
              value={stats.team.pointDifferential > 0 ? `+${stats.team.pointDifferential}` : stats.team.pointDifferential.toString()}
              sublabel="Season total"
              positive={stats.team.pointDifferential > 0}
              negative={stats.team.pointDifferential < 0}
            />
          </div>
        </section>

        {/* Leaderboards */}
        <section>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Player Leaderboards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Passing Leaders */}
            <LeaderboardCard
              title="Passing Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              entries={stats.leaderboards.passing}
              emptyText="No passing stats available"
            />

            {/* Rushing Leaders */}
            <LeaderboardCard
              title="Rushing Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              entries={stats.leaderboards.rushing}
              emptyText="No rushing stats available"
            />

            {/* Receiving Leaders */}
            <LeaderboardCard
              title="Receiving Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              entries={stats.leaderboards.receiving}
              emptyText="No receiving stats available"
            />

            {/* Defense Leaders */}
            <LeaderboardCard
              title="Defense Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              entries={stats.leaderboards.defense}
              emptyText="No defensive stats available"
            />
          </div>
        </section>

        {/* Links */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            href="/chicago-bears/roster"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[#C83200] text-[var(--text-primary)] font-medium rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View Full Roster
          </Link>
          <Link
            href="/chicago-bears-player"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C83200] hover:bg-[#a82900] text-white font-semibold rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search All Players
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function TeamStatCard({
  label,
  value,
  sublabel,
  positive,
  negative,
}: {
  label: string
  value: string
  sublabel?: string
  positive?: boolean
  negative?: boolean
}) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
      <div className="text-sm text-[var(--text-muted)] mb-1">{label}</div>
      <div className={`text-3xl font-bold ${
        positive ? 'text-green-500' : negative ? 'text-red-500' : 'text-[var(--text-primary)]'
      }`}>
        {value}
      </div>
      {sublabel && (
        <div className="text-sm text-[var(--text-muted)] mt-1">{sublabel}</div>
      )}
    </div>
  )
}

function LeaderboardCard({
  title,
  icon,
  entries,
  emptyText,
}: {
  title: string
  icon: React.ReactNode
  entries: LeaderboardEntry[]
  emptyText: string
}) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-[#0B162A]/10 dark:bg-[#C83200]/10 flex items-center justify-center text-[#C83200]">
          {icon}
        </span>
        <h3 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {title}
        </h3>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="p-6 text-center text-[var(--text-muted)]">
          {emptyText}
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)]">
          {entries.map((entry, index) => (
            <LeaderboardRow key={entry.player?.playerId || index} entry={entry} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  if (!entry.player) return null

  return (
    <Link
      href={`/chicago-bears/players/${entry.player.slug}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-hover)] transition-colors group"
    >
      {/* Rank */}
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
        rank === 1
          ? 'bg-[#C83200] text-white'
          : rank === 2
            ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            : 'text-[var(--text-muted)]'
      }`}>
        {rank}
      </span>

      {/* Player Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {entry.player.headshotUrl ? (
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={entry.player.headshotUrl}
              alt={entry.player.fullName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[var(--text-muted)]">
              {entry.player.jerseyNumber}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <div className="font-medium text-[var(--text-primary)] group-hover:text-[#C83200] transition-colors truncate">
            {entry.player.fullName}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {entry.player.position} #{entry.player.jerseyNumber}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-right flex-shrink-0">
        <div>
          <div className="text-lg font-bold text-[var(--text-primary)]">
            {entry.primaryStat.toLocaleString()}
          </div>
          <div className="text-xs text-[var(--text-muted)]">{entry.primaryLabel}</div>
        </div>
        {entry.secondaryStat !== null && (
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-[var(--text-secondary)]">
              {entry.secondaryStat}
            </div>
            <div className="text-xs text-[var(--text-muted)]">{entry.secondaryLabel}</div>
          </div>
        )}
      </div>

      {/* Arrow */}
      <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#C83200] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
```

---

## Roster - /chicago-bears/roster
File: `src/app/chicago-bears/roster/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsRosterGrouped, type BearsPlayer, type PositionGroup } from '@/lib/bearsData'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'

export const metadata: Metadata = {
  title: 'Chicago Bears Roster 2025 | SportsMockery',
  description: 'Complete 2025 Chicago Bears roster with player profiles, positions, measurements, and stats. View all players by position group.',
}

// Revalidate every hour
export const revalidate = 3600

const POSITION_GROUP_NAMES: Record<PositionGroup, string> = {
  QB: 'Quarterbacks',
  RB: 'Running Backs',
  WR: 'Wide Receivers',
  TE: 'Tight Ends',
  OL: 'Offensive Line',
  DL: 'Defensive Line',
  LB: 'Linebackers',
  CB: 'Cornerbacks',
  S: 'Safeties',
  ST: 'Special Teams',
}

const POSITION_ORDER: PositionGroup[] = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'ST']

export default async function BearsRosterPage() {
  const team = CHICAGO_TEAMS.bears

  // Fetch all data in parallel
  const [roster, record, nextGame] = await Promise.all([
    getBearsRosterGrouped(),
    fetchTeamRecord('bears'),
    fetchNextGame('bears'),
  ])

  // Count by side
  const allPlayers = Object.values(roster).flat()
  const offenseCount = allPlayers.filter(p => ['QB', 'RB', 'WR', 'TE', 'OL'].includes(p.positionGroup || '')).length
  const defenseCount = allPlayers.filter(p => ['DL', 'LB', 'CB', 'S'].includes(p.positionGroup || '')).length
  const stCount = allPlayers.filter(p => p.positionGroup === 'ST').length

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="roster"
    >
      {/* Summary Bar */}
      <div
        className="rounded-xl p-4 mb-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total: </span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{allPlayers.length} players</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Offense: </span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{offenseCount}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Defense: </span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{defenseCount}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Special Teams: </span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{stCount}</span>
          </div>
        </div>

        {/* Position Count Chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {POSITION_ORDER.map(group => {
            const count = roster[group]?.length || 0
            if (count === 0) return null
            return (
              <span
                key={group}
                className="px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                }}
              >
                {count} {group}
                {count !== 1 && group !== 'OL' && group !== 'DL' && group !== 'ST' ? 's' : ''}
              </span>
            )
          })}
        </div>
      </div>

      {/* Roster Grid */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {POSITION_ORDER.map(group => {
            const players = roster[group]
            if (!players || players.length === 0) return null

            return (
              <PositionCard
                key={group}
                groupName={POSITION_GROUP_NAMES[group]}
                players={players}
              />
            )
          })}
        </div>
      </div>
    </TeamHubLayout>
  )
}

function PositionCard({
  groupName,
  players,
}: {
  groupName: string
  players: BearsPlayer[]
}) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] flex items-center justify-between">
        <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {groupName}
        </h2>
        <span className="text-sm text-[var(--text-muted)]">
          {players.length} player{players.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Player Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
              <th className="px-4 py-2 w-12">#</th>
              <th className="px-4 py-2">Player</th>
              <th className="px-4 py-2 hidden sm:table-cell">Size</th>
              <th className="px-4 py-2 hidden md:table-cell">College</th>
              <th className="px-4 py-2 hidden lg:table-cell">Exp</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => {
              const isStarter = player.primaryRole?.toLowerCase().includes('starter')

              return (
                <tr
                  key={player.playerId}
                  className={`border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors ${
                    isStarter ? 'bg-[#C83200]/5' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0B162A] text-white text-sm font-bold">
                      {player.jerseyNumber ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/chicago-bears/players/${player.slug}`}
                      className="flex items-center gap-3 group"
                    >
                      {player.headshotUrl ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--border-subtle)]">
                          <Image
                            src={player.headshotUrl}
                            alt={player.fullName}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-[var(--text-primary)] group-hover:text-[#C83200] transition-colors">
                          {player.fullName}
                        </span>
                        <div className="text-xs text-[var(--text-muted)]">
                          {player.position}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden sm:table-cell">
                    {player.height && player.weight
                      ? `${player.height} · ${player.weight} lbs`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">
                    {player.college || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">
                    {player.experience || 'R'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

## Players - /chicago-bears/players/[slug]
File: `src/app/chicago-bears/players/[slug]/page.tsx`

```tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPlayerProfile, getSimilarPlayers, getBearsPlayers, type PlayerProfile, type BearsPlayer, type PlayerGameLogEntry } from '@/lib/bearsData'
import ScrollToTop from './ScrollToTop'

interface PlayerPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params
  const profile = await getPlayerProfile(slug)

  if (!profile) {
    return { title: 'Player Not Found | SportsMockery' }
  }

  const { player } = profile

  return {
    title: `${player.fullName} Stats & Profile | Chicago Bears ${player.position} | SportsMockery`,
    description: `${player.fullName} statistics, game log, and player profile. #${player.jerseyNumber} ${player.position} for the Chicago Bears.`,
    openGraph: {
      title: `${player.fullName} | Chicago Bears`,
      description: `${player.position} #${player.jerseyNumber} - View stats, game log, and profile`,
      images: player.headshotUrl ? [player.headshotUrl] : [],
    },
  }
}

export async function generateStaticParams() {
  const players = await getBearsPlayers()
  return players.map(player => ({ slug: player.slug }))
}

export const revalidate = 3600 // Revalidate every hour

export default async function PlayerProfilePage({ params }: PlayerPageProps) {
  const { slug } = await params
  const profile = await getPlayerProfile(slug)

  if (!profile) {
    notFound()
  }

  const { player, currentSeason, gameLog } = profile
  const similarPlayers = await getSimilarPlayers(player, 3)

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Scroll to top on page load */}
      <ScrollToTop />

      {/* Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B162A 0%, #0B162A 70%, #C83200 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/chicago-bears" className="hover:text-white">Chicago Bears</Link>
            <span>/</span>
            <Link href="/chicago-bears-player" className="hover:text-white">Player Profiles</Link>
            <span>/</span>
            <span className="text-white">{player.fullName}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left: Headshot */}
            <div className="flex-shrink-0">
              {player.headshotUrl ? (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-[#C83200]/30 shadow-2xl">
                  <Image
                    src={player.headshotUrl}
                    alt={player.fullName}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-white/10 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Center: Player Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-lg font-bold">
                  #{player.jerseyNumber}
                </span>
                <span className="px-3 py-1 bg-[#C83200] rounded-lg text-sm font-semibold">
                  {player.position}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {player.fullName}
              </h1>

              <p className="text-white/70 text-lg mb-4">
                Chicago Bears • {player.side === 'OFF' ? 'Offense' : player.side === 'DEF' ? 'Defense' : 'Special Teams'}
              </p>

              {/* Bio Line */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/80">
                {player.age && (
                  <div>
                    <span className="text-white/50 text-sm">Age: </span>
                    <span>{player.age}</span>
                  </div>
                )}
                {player.height && (
                  <div>
                    <span className="text-white/50 text-sm">Height: </span>
                    <span>{player.height}</span>
                  </div>
                )}
                {player.weight && (
                  <div>
                    <span className="text-white/50 text-sm">Weight: </span>
                    <span>{player.weight} lbs</span>
                  </div>
                )}
                {player.experience && (
                  <div>
                    <span className="text-white/50 text-sm">Experience: </span>
                    <span>{player.experience}</span>
                  </div>
                )}
                {player.college && (
                  <div>
                    <span className="text-white/50 text-sm">College: </span>
                    <span>{player.college}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Season Snapshot */}
            {currentSeason && (
              <div className="w-full md:w-auto md:min-w-[280px]">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                  <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-4">
                    2025 Snapshot
                  </h3>
                  <SeasonSnapshotStats player={player} stats={currentSeason} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Game Log */}
          <div className="lg:col-span-2 space-y-8">
            {/* Season Overview */}
            {currentSeason && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  2025 Season Overview
                </h2>
                <SeasonOverviewCards player={player} stats={currentSeason} />
              </section>
            )}

            {/* Strength Profile */}
            {currentSeason && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Strength Profile
                </h2>
                <StrengthProfileBars player={player} stats={currentSeason} />
              </section>
            )}

            {/* Game Log */}
            {gameLog.length > 0 && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-[var(--border-subtle)]">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Game Log 2025
                  </h2>
                </div>
                <GameLogTable player={player} gameLog={gameLog} />
              </section>
            )}
          </div>

          {/* Right Column: Similar Players & Links */}
          <div className="space-y-6">
            {/* Similar Bears */}
            {similarPlayers.length > 0 && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Similar Bears
                </h3>
                <div className="space-y-3">
                  {similarPlayers.map(p => (
                    <Link
                      key={p.playerId}
                      href={`/chicago-bears/players/${p.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors group"
                    >
                      {p.headshotUrl ? (
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={p.headshotUrl}
                            alt={p.fullName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-[var(--text-muted)]">
                            {p.jerseyNumber}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[var(--text-primary)] group-hover:text-[#C83200] transition-colors truncate">
                          {p.fullName}
                        </div>
                        <div className="text-sm text-[var(--text-muted)]">
                          {p.position} #{p.jerseyNumber}
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Quick Links */}
            <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/chicago-bears-player"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#C83200]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  All Player Profiles
                </Link>
                <Link
                  href="/chicago-bears/roster"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#C83200]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Full Bears Roster
                </Link>
                <Link
                  href="/chicago-bears/stats"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#C83200]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                  Team Stats
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

// Season Snapshot Stats (in hero)
function SeasonSnapshotStats({ player, stats }: { player: BearsPlayer; stats: any }) {
  const getPositionStats = () => {
    if (player.position === 'QB') {
      return [
        { label: 'Pass YDS', value: stats.passYards ?? 0 },
        { label: 'Pass TD', value: stats.passTD ?? 0 },
        { label: 'Comp %', value: stats.completionPct ? `${stats.completionPct}%` : '—' },
      ]
    }
    if (['RB', 'FB'].includes(player.position)) {
      return [
        { label: 'Rush YDS', value: stats.rushYards ?? 0 },
        { label: 'Rush TD', value: stats.rushTD ?? 0 },
        { label: 'YPC', value: stats.yardsPerCarry ?? '—' },
      ]
    }
    if (['WR', 'TE'].includes(player.position)) {
      return [
        { label: 'Rec YDS', value: stats.recYards ?? 0 },
        { label: 'Rec TD', value: stats.recTD ?? 0 },
        { label: 'REC', value: stats.receptions ?? 0 },
      ]
    }
    if (['CB', 'S', 'FS', 'SS', 'DB'].includes(player.position)) {
      return [
        { label: 'Tackles', value: stats.tackles ?? 0 },
        { label: 'INT', value: stats.interceptions ?? 0 },
        { label: 'PD', value: stats.passesDefended ?? 0 },
      ]
    }
    if (['LB', 'ILB', 'OLB', 'MLB'].includes(player.position)) {
      return [
        { label: 'Tackles', value: stats.tackles ?? 0 },
        { label: 'Sacks', value: stats.sacks ?? 0 },
        { label: 'INT', value: stats.interceptions ?? 0 },
      ]
    }
    if (['DE', 'DT', 'NT', 'DL'].includes(player.position)) {
      return [
        { label: 'Tackles', value: stats.tackles ?? 0 },
        { label: 'Sacks', value: stats.sacks ?? 0 },
        { label: 'FF', value: stats.forcedFumbles ?? 0 },
      ]
    }
    return [
      { label: 'Games', value: stats.gamesPlayed ?? 0 },
      { label: 'Snaps', value: stats.snaps ?? '—' },
    ]
  }

  const positionStats = getPositionStats()

  return (
    <div className="grid grid-cols-3 gap-3">
      {positionStats.map((stat, i) => (
        <div key={i} className="text-center">
          <div className="text-2xl font-bold text-white">{stat.value}</div>
          <div className="text-xs text-white/60 uppercase">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

// Season Overview Cards
function SeasonOverviewCards({ player, stats }: { player: BearsPlayer; stats: any }) {
  const getCards = () => {
    if (player.position === 'QB') {
      return [
        { title: 'Passing', stats: [
          { label: 'Yards', value: stats.passYards ?? 0 },
          { label: 'TD', value: stats.passTD ?? 0 },
          { label: 'INT', value: stats.passINT ?? 0 },
          { label: 'Comp %', value: stats.completionPct ? `${stats.completionPct}%` : '—' },
        ]},
        { title: 'Rushing', stats: [
          { label: 'Yards', value: stats.rushYards ?? 0 },
          { label: 'TD', value: stats.rushTD ?? 0 },
          { label: 'Att', value: stats.rushAttempts ?? 0 },
        ]},
        { title: 'Efficiency', stats: [
          { label: 'Y/A', value: stats.yardsPerAttempt ?? '—' },
          { label: 'Games', value: stats.gamesPlayed ?? 0 },
        ]},
      ]
    }
    if (['CB', 'S', 'FS', 'SS', 'DB'].includes(player.position)) {
      return [
        { title: 'Coverage', stats: [
          { label: 'INT', value: stats.interceptions ?? 0 },
          { label: 'PD', value: stats.passesDefended ?? 0 },
        ]},
        { title: 'Tackling', stats: [
          { label: 'Tackles', value: stats.tackles ?? 0 },
          { label: 'Sacks', value: stats.sacks ?? 0 },
        ]},
        { title: 'Impact', stats: [
          { label: 'FF', value: stats.forcedFumbles ?? 0 },
          { label: 'FR', value: stats.fumbleRecoveries ?? 0 },
          { label: 'Games', value: stats.gamesPlayed ?? 0 },
        ]},
      ]
    }
    // Default for other positions
    return [
      { title: 'Performance', stats: [
        { label: 'Games', value: stats.gamesPlayed ?? 0 },
        { label: 'Snaps', value: stats.snaps ?? '—' },
      ]},
    ]
  }

  const cards = getCards()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-[var(--bg-tertiary)] rounded-xl p-4">
          <h4 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            {card.title}
          </h4>
          <div className="space-y-2">
            {card.stats.map((stat, j) => (
              <div key={j} className="flex justify-between">
                <span className="text-[var(--text-secondary)]">{stat.label}</span>
                <span className="font-semibold text-[var(--text-primary)]">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Strength Profile Bars
function StrengthProfileBars({ player, stats }: { player: BearsPlayer; stats: any }) {
  const getBars = () => {
    if (['CB', 'S', 'FS', 'SS', 'DB'].includes(player.position)) {
      const maxTackles = 100
      const maxInt = 8
      const maxPD = 20
      return [
        { label: 'Coverage', value: Math.min(((stats.interceptions ?? 0) / maxInt) * 100 + ((stats.passesDefended ?? 0) / maxPD) * 50, 100) },
        { label: 'Tackling', value: Math.min(((stats.tackles ?? 0) / maxTackles) * 100, 100) },
        { label: 'Ball Skills', value: Math.min(((stats.interceptions ?? 0) / maxInt) * 100, 100) },
        { label: 'Run Support', value: Math.min(((stats.tackles ?? 0) / maxTackles) * 80, 100) },
      ]
    }
    if (['LB', 'ILB', 'OLB', 'MLB'].includes(player.position)) {
      return [
        { label: 'Tackling', value: Math.min(((stats.tackles ?? 0) / 120) * 100, 100) },
        { label: 'Pass Rush', value: Math.min(((stats.sacks ?? 0) / 10) * 100, 100) },
        { label: 'Coverage', value: Math.min(((stats.interceptions ?? 0) / 4) * 100, 100) },
        { label: 'Run Defense', value: Math.min(((stats.tackles ?? 0) / 100) * 100, 100) },
      ]
    }
    if (player.position === 'QB') {
      return [
        { label: 'Accuracy', value: stats.completionPct ?? 0 },
        { label: 'Deep Ball', value: Math.min(((stats.passYards ?? 0) / 4000) * 100, 100) },
        { label: 'TD Production', value: Math.min(((stats.passTD ?? 0) / 35) * 100, 100) },
        { label: 'Ball Security', value: Math.max(100 - ((stats.passINT ?? 0) / 15) * 100, 20) },
      ]
    }
    // Default
    return [
      { label: 'Overall', value: 70 },
    ]
  }

  const bars = getBars()

  return (
    <div className="space-y-4">
      {bars.map((bar, i) => (
        <div key={i}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--text-secondary)]">{bar.label}</span>
            <span className="font-medium text-[var(--text-primary)]">{Math.round(bar.value)}%</span>
          </div>
          <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.max(bar.value, 5)}%`,
                background: 'linear-gradient(90deg, #0B162A 0%, #C83200 100%)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Game Log Table
function GameLogTable({ player, gameLog }: { player: BearsPlayer; gameLog: PlayerGameLogEntry[] }) {
  const getStatColumns = () => {
    if (player.position === 'QB') {
      return [
        { key: 'passing', label: 'C/A', render: (g: PlayerGameLogEntry) => `${g.passCompletions ?? 0}/${g.passAttempts ?? 0}` },
        { key: 'passYards', label: 'YDS', render: (g: PlayerGameLogEntry) => g.passYards ?? 0 },
        { key: 'passTD', label: 'TD', render: (g: PlayerGameLogEntry) => g.passTD ?? 0 },
        { key: 'passINT', label: 'INT', render: (g: PlayerGameLogEntry) => g.passINT ?? 0 },
      ]
    }
    if (['RB', 'FB'].includes(player.position)) {
      return [
        { key: 'rushAttempts', label: 'ATT', render: (g: PlayerGameLogEntry) => g.rushAttempts ?? 0 },
        { key: 'rushYards', label: 'YDS', render: (g: PlayerGameLogEntry) => g.rushYards ?? 0 },
        { key: 'rushTD', label: 'TD', render: (g: PlayerGameLogEntry) => g.rushTD ?? 0 },
      ]
    }
    if (['WR', 'TE'].includes(player.position)) {
      return [
        { key: 'rec', label: 'REC', render: (g: PlayerGameLogEntry) => g.receptions ?? 0 },
        { key: 'recYards', label: 'YDS', render: (g: PlayerGameLogEntry) => g.recYards ?? 0 },
        { key: 'recTD', label: 'TD', render: (g: PlayerGameLogEntry) => g.recTD ?? 0 },
      ]
    }
    // Defense
    return [
      { key: 'tackles', label: 'TKL', render: (g: PlayerGameLogEntry) => g.tackles ?? 0 },
      { key: 'sacks', label: 'SACK', render: (g: PlayerGameLogEntry) => g.sacks ?? 0 },
      { key: 'int', label: 'INT', render: (g: PlayerGameLogEntry) => g.interceptions ?? 0 },
    ]
  }

  const columns = getStatColumns()

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-[var(--bg-tertiary)]">
            <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider">
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Opp</th>
              <th className="px-6 py-3">Result</th>
              {columns.map(col => (
                <th key={col.key} className="px-6 py-3 text-right">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gameLog.map((game, i) => (
              <tr key={i} className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]">
                <td className="px-6 py-3 text-[var(--text-secondary)]">
                  {game.date ? new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </td>
                <td className="px-6 py-3 text-[var(--text-primary)] font-medium">
                  {game.isHome ? 'vs' : '@'} {game.opponent}
                </td>
                <td className="px-6 py-3">
                  {game.result && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium ${
                      game.result === 'W' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {game.result} {game.bearsScore}-{game.oppScore}
                    </span>
                  )}
                </td>
                {columns.map(col => (
                  <td key={col.key} className="px-6 py-3 text-right text-[var(--text-primary)]">
                    {col.render(game)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-3">
        {gameLog.map((game, i) => (
          <div key={i} className="bg-[var(--bg-tertiary)] rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="text-sm text-[var(--text-muted)]">
                  {game.date ? new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </div>
                <div className="font-medium text-[var(--text-primary)]">
                  {game.isHome ? 'vs' : '@'} {game.opponent}
                </div>
              </div>
              {game.result && (
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  game.result === 'W' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {game.result} {game.bearsScore}-{game.oppScore}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {columns.map(col => (
                <div key={col.key}>
                  <div className="text-lg font-semibold text-[var(--text-primary)]">{col.render(game)}</div>
                  <div className="text-xs text-[var(--text-muted)]">{col.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
```

---

# CHICAGO BULLS

## News - /chicago-bulls
File: `src/app/chicago-bulls/page.tsx`

```tsx
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TeamHubLayout } from '@/components/team'
import ARTourButton from '@/components/ar/ARTourButton'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { supabaseAdmin } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Chicago Bulls | News, Stats, Schedule & Roster | SportsMockery',
  description: 'Complete Chicago Bulls coverage including latest news, team stats, schedule, roster, and expert analysis.',
  openGraph: {
    title: 'Chicago Bulls Hub | Sports Mockery',
    description: 'Your #1 source for Chicago Bulls news, stats, schedule, and analysis',
    type: 'website',
  },
}

// Revalidate every hour
export const revalidate = 3600

// Fetch Bulls posts from database
async function getBullsPosts(limit: number = 12) {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('sm_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image,
        published_at,
        sm_categories!inner(slug, name)
      `)
      .eq('status', 'published')
      .eq('sm_categories.slug', 'chicago-bulls')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching Bulls posts:', error)
      return []
    }

    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featured_image,
      categorySlug: post.sm_categories?.slug || 'chicago-bulls',
      publishedAt: post.published_at,
    }))
  } catch (error) {
    console.error('Error fetching Bulls posts:', error)
    return []
  }
}

export default async function BullsHubPage() {
  const team = CHICAGO_TEAMS.bulls

  // Fetch all data in parallel
  const [record, nextGame, posts] = await Promise.all([
    fetchTeamRecord('bulls'),
    fetchNextGame('bulls'),
    getBullsPosts(12),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="overview"
    >
      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Latest Headlines */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-bold border-b-2 pb-1"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--text-primary)',
                  borderColor: team.secondaryColor,
                }}
              >
                Latest Bulls News
              </h2>
            </div>

            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.slice(0, 6).map((post, index) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    team={team}
                    isLarge={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div
                className="text-center py-12 rounded-xl"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <p style={{ color: 'var(--text-muted)' }}>
                  No Bulls articles found. Check back soon!
                </p>
              </div>
            )}
          </section>

          {/* More Stories */}
          {posts.length > 6 && (
            <section>
              <h2
                className="text-lg font-bold mb-4 border-b-2 pb-1"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--text-primary)',
                  borderColor: team.secondaryColor,
                }}
              >
                More Bulls Stories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.slice(6, 12).map((post) => (
                  <ArticleCard key={post.id} post={post} team={team} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Season Snapshot */}
          <SeasonSnapshotCard team={team} record={record} />

          {/* Quick Links */}
          <QuickLinksCard team={team} />

          {/* AR Stadium Tour */}
          <ARTourButton team="chicago-bulls" />

          {/* Ask AI Widget */}
          <AskAIWidget team={team} />

          {/* Fan Chat Widget */}
          <FanChatWidget team={team} />
        </div>
      </div>
    </TeamHubLayout>
  )
}

// Article Card Component
function ArticleCard({
  post,
  team,
  isLarge = false,
}: {
  post: any
  team: typeof CHICAGO_TEAMS.bulls
  isLarge?: boolean
}) {
  const href = `/${post.categorySlug}/${post.slug}`

  if (isLarge) {
    return (
      <Link href={href} className="group block">
        <article
          className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
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
                  priority
                />
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: team.primaryColor }}
                />
              </div>
            )}
            <div className="p-4 md:p-5 flex-1">
              <span
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: team.primaryColor }}
              >
                Bulls
              </span>
              <h3
                className="font-bold mt-1 line-clamp-3 group-hover:underline"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--text-primary)',
                  fontSize: '18px',
                  lineHeight: '1.3',
                }}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p
                  className="text-sm mt-2 line-clamp-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {post.excerpt}
                </p>
              )}
              <div
                className="flex items-center gap-2 mt-3 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
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
        className="rounded-xl overflow-hidden flex gap-4 p-3 transition-colors hover:bg-[var(--bg-hover)]"
        style={{ backgroundColor: 'var(--bg-surface)' }}
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
              color: 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: '1.4',
            }}
          >
            {post.title}
          </h3>
          <div
            className="flex items-center gap-2 mt-2 text-xs"
            style={{ color: 'var(--text-muted)' }}
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
}: {
  team: typeof CHICAGO_TEAMS.bulls
  record: { wins: number; losses: number } | null
}) {
  const formatRecord = () => {
    if (!record) return '--'
    return `${record.wins}-${record.losses}`
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="px-5 py-4" style={{ backgroundColor: team.primaryColor }}>
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
            <p className="text-xs text-white/70">2025-26 Season</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="text-center pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div
            className="text-4xl font-bold"
            style={{ color: team.primaryColor }}
          >
            {formatRecord()}
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-1">Record</div>
        </div>
      </div>
    </div>
  )
}

// Quick Links Card
function QuickLinksCard({ team }: { team: typeof CHICAGO_TEAMS.bulls }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
      }}
    >
      <h3
        className="font-bold mb-4"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          color: 'var(--text-primary)',
        }}
      >
        Quick Links
      </h3>
      <div className="space-y-2">
        <QuickLink href="/chicago-bulls" label="All Bulls News" team={team} />
      </div>
    </div>
  )
}

function QuickLink({
  href,
  label,
  team,
}: {
  href: string
  label: string
  team: typeof CHICAGO_TEAMS.bulls
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
    >
      <span
        className="text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
      </span>
      <svg
        className="w-4 h-4 ml-auto"
        style={{ color: 'var(--text-muted)' }}
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

// Ask AI Widget
function AskAIWidget({ team }: { team: typeof CHICAGO_TEAMS.bulls }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div>
          <h3
            className="font-bold"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: 'var(--text-primary)',
            }}
          >
            Ask Bulls AI
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Get instant answers about the Bulls
          </p>
        </div>
      </div>

      <Link
        href={`/ask-ai?team=${team.slug}`}
        className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white"
        style={{ backgroundColor: team.primaryColor }}
      >
        Ask a Question
      </Link>
    </div>
  )
}

// Fan Chat Widget
function FanChatWidget({ team }: { team: typeof CHICAGO_TEAMS.bulls }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${team.secondaryColor}20` }}
        >
          <svg
            className="w-5 h-5"
            style={{ color: team.secondaryColor }}
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
              color: 'var(--text-primary)',
            }}
          >
            Bulls Fan Chat
          </h3>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Fans online</span>
          </div>
        </div>
      </div>

      <Link
        href="/fan-chat?channel=bulls"
        className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white"
        style={{ backgroundColor: team.primaryColor }}
      >
        Join Bulls Chat
      </Link>
    </div>
  )
}
```

---

## Schedule - /chicago-bulls/schedule
File: `src/app/chicago-bulls/schedule/page.tsx`

```tsx
import { Metadata } from 'next'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getBullsSchedule, type BullsGame } from '@/lib/bullsData'

const BULLS_LOGO = 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png'

export const metadata: Metadata = {
  title: 'Chicago Bulls Schedule 2024-25 | Game Dates & Results | SportsMockery',
  description: 'Complete Chicago Bulls 2024-25 schedule with game dates, times, opponents, scores, and results. View upcoming games and past results.',
}

export const revalidate = 3600

export default async function BullsSchedulePage() {
  const team = CHICAGO_TEAMS.bulls

  const [schedule, record, nextGame] = await Promise.all([
    getBullsSchedule(),
    fetchTeamRecord('bulls'),
    fetchNextGame('bulls'),
  ])

  const nextScheduledGame = schedule.find(g => g.status === 'scheduled')

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="schedule"
    >
      <div>
        {nextScheduledGame && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 bg-[#CE1141]/10 text-[#CE1141] text-xs font-semibold rounded">
                  UP NEXT
                </div>
                <div className="flex items-center gap-2">
                  {nextScheduledGame.opponentLogo && (
                    <Image
                      src={nextScheduledGame.opponentLogo}
                      alt={nextScheduledGame.opponent}
                      width={28}
                      height={28}
                      className="w-7 h-7"
                      unoptimized
                    />
                  )}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {nextScheduledGame.homeAway === 'home' ? 'vs' : '@'} {nextScheduledGame.opponentFullName || nextScheduledGame.opponent}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-[var(--text-primary)] font-medium">
                  {new Date(nextScheduledGame.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-[var(--text-muted)]">
                  {nextScheduledGame.time || 'TBD'} {nextScheduledGame.tv && `• ${nextScheduledGame.tv}`}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Full Schedule
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              {schedule.length} games
            </span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {schedule.map((game) => (
              <GameRow key={game.gameId} game={game} />
            ))}
          </div>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function GameRow({ game }: { game: BullsGame }) {
  const gameDate = new Date(game.date)
  const isPast = game.status === 'final'
  const isInProgress = game.status === 'in_progress'

  return (
    <div className={`p-4 hover:bg-[var(--bg-hover)] transition-colors ${isPast ? '' : 'bg-[var(--bg-tertiary)]/30'}`}>
      <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[100px_1fr_140px] gap-4 items-center">
        <div className="flex-shrink-0">
          <div className="font-medium text-[var(--text-primary)]">
            {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {game.dayOfWeek}
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 flex-shrink-0">
            <Image
              src={BULLS_LOGO}
              alt="Chicago Bulls"
              width={28}
              height={28}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>

          <span className="text-xs text-[var(--text-muted)] font-medium flex-shrink-0">
            {game.homeAway === 'home' ? 'vs' : '@'}
          </span>

          {game.opponentLogo && (
            <div className="w-7 h-7 flex-shrink-0">
              <Image
                src={game.opponentLogo}
                alt={game.opponent}
                width={28}
                height={28}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)] truncate block">
              {game.opponentFullName || game.opponent}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          {isPast ? (
            <div className="flex items-center gap-2 justify-end">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                game.result === 'W'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {game.result}
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.bullsScore}-{game.oppScore}
              </span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-2 justify-end">
              <span className="px-2 py-0.5 bg-[#CE1141]/10 text-[#CE1141] rounded text-xs font-medium animate-pulse">
                LIVE
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.bullsScore}-{game.oppScore}
              </span>
            </div>
          ) : (
            <div>
              <div className="font-medium text-[var(--text-primary)] text-sm">
                {game.time || 'TBD'}
              </div>
              {game.tv && (
                <div className="text-xs text-[var(--text-muted)]">
                  {game.tv}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Scores - /chicago-bulls/scores
File: `src/app/chicago-bulls/scores/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getBullsRecentScores, type BullsGame } from '@/lib/bullsData'

const BULLS_LOGO = 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png'

export const metadata: Metadata = {
  title: 'Chicago Bulls Scores 2024-25 | Game Results & Box Scores | SportsMockery',
  description: 'Chicago Bulls game scores and results. View recent games, final scores, and game summaries.',
}

export const revalidate = 1800

export default async function BullsScoresPage() {
  const team = CHICAGO_TEAMS.bulls

  const [scores, record, nextGame] = await Promise.all([
    getBullsRecentScores(20),
    fetchTeamRecord('bulls'),
    fetchNextGame('bulls'),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="scores"
    >
      <div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Recent Games
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              Last {scores.length} games
            </span>
          </div>

          {scores.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No completed games yet this season.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {scores.map((game) => (
                <div key={game.gameId} className="p-4 hover:bg-[var(--bg-hover)] transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-[var(--text-muted)]">
                        {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>

                      <div className="flex items-center gap-3">
                        <Image
                          src={BULLS_LOGO}
                          alt="Chicago Bulls"
                          width={32}
                          height={32}
                          className="w-8 h-8"
                          unoptimized
                        />
                        <span className="text-xs text-[var(--text-muted)]">
                          {game.homeAway === 'home' ? 'vs' : '@'}
                        </span>
                        {game.opponentLogo && (
                          <Image
                            src={game.opponentLogo}
                            alt={game.opponent}
                            width={32}
                            height={32}
                            className="w-8 h-8"
                            unoptimized
                          />
                        )}
                        <span className="font-medium text-[var(--text-primary)]">
                          {game.opponentFullName || game.opponent}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${
                        game.result === 'W'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {game.result}
                      </span>
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        {game.bullsScore} - {game.oppScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/chicago-bulls/schedule"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#CE1141] hover:bg-[#a80d34] text-white font-semibold rounded-xl transition-colors"
          >
            View Full Schedule
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}
```

---

## Stats - /chicago-bulls/stats
File: `src/app/chicago-bulls/stats/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getBullsStats, type BullsStats, type LeaderboardEntry, type BullsPlayer } from '@/lib/bullsData'

export const metadata: Metadata = {
  title: 'Chicago Bulls Stats 2024-25 | Team & Player Statistics | SportsMockery',
  description: 'Chicago Bulls 2024-25 team and player statistics. View scoring, rebounding, assists, and defensive leaderboards.',
}

export const revalidate = 3600

export default async function BullsStatsPage() {
  const team = CHICAGO_TEAMS.bulls

  const [stats, record, nextGame] = await Promise.all([
    getBullsStats(),
    fetchTeamRecord('bulls'),
    fetchNextGame('bulls'),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="stats"
    >
      <div>
        {/* Team Overview */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Team Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Record" value={stats.team.record} />
            <StatCard label="Points/Game" value={stats.team.ppg.toFixed(1)} />
            <StatCard label="Rebounds/Game" value={stats.team.rpg.toFixed(1)} />
            <StatCard label="Assists/Game" value={stats.team.apg.toFixed(1)} />
            <StatCard label="Opp PPG" value={stats.team.oppg.toFixed(1)} />
            <StatCard
              label="Point Diff"
              value={`${(stats.team.ppg - stats.team.oppg) > 0 ? '+' : ''}${(stats.team.ppg - stats.team.oppg).toFixed(1)}`}
              positive={(stats.team.ppg - stats.team.oppg) > 0}
              negative={(stats.team.ppg - stats.team.oppg) < 0}
            />
            <StatCard label="FG%" value={stats.team.fgPct ? `${(stats.team.fgPct * 100).toFixed(1)}%` : '—'} />
            <StatCard label="3P%" value={stats.team.threePct ? `${(stats.team.threePct * 100).toFixed(1)}%` : '—'} />
          </div>
        </section>

        {/* Player Leaderboards */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Player Leaderboards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Scoring Leaders */}
            <LeaderboardCard
              title="Scoring Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              entries={stats.leaderboards.scoring}
              emptyText="No scoring stats available"
            />

            {/* Rebounding Leaders */}
            <LeaderboardCard
              title="Rebounding Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              entries={stats.leaderboards.rebounding}
              emptyText="No rebounding stats available"
            />

            {/* Assists Leaders */}
            <LeaderboardCard
              title="Assists Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              entries={stats.leaderboards.assists}
              emptyText="No assists stats available"
            />

            {/* Defense Leaders */}
            <LeaderboardCard
              title="Defense Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              entries={stats.leaderboards.defense}
              emptyText="No defensive stats available"
            />
          </div>
        </section>

        {/* Links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/chicago-bulls/roster"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[#CE1141] text-[var(--text-primary)] font-medium rounded-xl transition-colors"
          >
            View Full Roster
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function StatCard({
  label,
  value,
  positive,
  negative,
}: {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
}) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
      <div className="text-sm text-[var(--text-muted)] mb-1">{label}</div>
      <div className={`text-3xl font-bold ${
        positive ? 'text-green-500' : negative ? 'text-red-500' : 'text-[var(--text-primary)]'
      }`}>
        {value}
      </div>
    </div>
  )
}

function LeaderboardCard({
  title,
  icon,
  entries,
  emptyText,
}: {
  title: string
  icon: React.ReactNode
  entries: LeaderboardEntry[]
  emptyText: string
}) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-[#CE1141]/10 flex items-center justify-center text-[#CE1141]">
          {icon}
        </span>
        <h3 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {title}
        </h3>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="p-6 text-center text-[var(--text-muted)]">
          {emptyText}
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)]">
          {entries.map((entry, index) => (
            <LeaderboardRow key={entry.player?.playerId || index} entry={entry} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  if (!entry.player) return null

  return (
    <Link
      href={`/chicago-bulls/players/${entry.player.slug}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-hover)] transition-colors group"
    >
      {/* Rank */}
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
        rank === 1
          ? 'bg-[#CE1141] text-white'
          : rank === 2
            ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            : 'text-[var(--text-muted)]'
      }`}>
        {rank}
      </span>

      {/* Player Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {entry.player.headshotUrl ? (
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={entry.player.headshotUrl}
              alt={entry.player.fullName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[var(--text-muted)]">
              {entry.player.jerseyNumber}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <div className="font-medium text-[var(--text-primary)] group-hover:text-[#CE1141] transition-colors truncate">
            {entry.player.fullName}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {entry.player.position} #{entry.player.jerseyNumber}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-right flex-shrink-0">
        <div>
          <div className="text-lg font-bold text-[var(--text-primary)]">
            {typeof entry.primaryStat === 'number' ? entry.primaryStat.toFixed(1) : entry.primaryStat}
          </div>
          <div className="text-xs text-[var(--text-muted)]">{entry.primaryLabel}</div>
        </div>
        {entry.secondaryStat !== null && (
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-[var(--text-secondary)]">
              {typeof entry.secondaryStat === 'number' ? entry.secondaryStat.toFixed(1) : entry.secondaryStat}
            </div>
            <div className="text-xs text-[var(--text-muted)]">{entry.secondaryLabel}</div>
          </div>
        )}
      </div>

      {/* Arrow */}
      <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#CE1141] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
```

---

## Roster - /chicago-bulls/roster
File: `src/app/chicago-bulls/roster/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getBullsRosterGrouped, POSITION_GROUP_NAMES, type BullsPlayer, type PositionGroup } from '@/lib/bullsData'

export const metadata: Metadata = {
  title: 'Chicago Bulls Roster 2024-25 | SportsMockery',
  description: 'Complete 2024-25 Chicago Bulls roster with player profiles, positions, measurements, and stats.',
}

export const revalidate = 3600

const POSITION_ORDER: PositionGroup[] = ['guards', 'forwards', 'centers']

export default async function BullsRosterPage() {
  const team = CHICAGO_TEAMS.bulls

  const [roster, record, nextGame] = await Promise.all([
    getBullsRosterGrouped(),
    fetchTeamRecord('bulls'),
    fetchNextGame('bulls'),
  ])

  const allPlayers = Object.values(roster).flat()

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="roster"
    >
      {/* Summary Bar */}
      <div
        className="rounded-xl p-4 mb-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total: </span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{allPlayers.length} players</span>
          </div>
          {POSITION_ORDER.map(group => {
            const count = roster[group]?.length || 0
            if (count === 0) return null
            return (
              <div key={group}>
                <span style={{ color: 'var(--text-muted)' }}>{POSITION_GROUP_NAMES[group]}: </span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {POSITION_ORDER.map(group => {
          const players = roster[group]
          if (!players || players.length === 0) return null

          return (
            <div key={group} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {POSITION_GROUP_NAMES[group]}
                </h2>
                <span className="text-sm text-[var(--text-muted)]">
                  {players.length} player{players.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                      <th className="px-4 py-2 w-12">#</th>
                      <th className="px-4 py-2">Player</th>
                      <th className="px-4 py-2 hidden sm:table-cell">Size</th>
                      <th className="px-4 py-2 hidden md:table-cell">College</th>
                      <th className="px-4 py-2 hidden lg:table-cell">Exp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr
                        key={player.playerId}
                        className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#CE1141] text-white text-sm font-bold">
                            {player.jerseyNumber ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/chicago-bulls/players/${player.slug}`}
                            className="flex items-center gap-3 group"
                          >
                            {player.headshotUrl ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--border-subtle)]">
                                <Image
                                  src={player.headshotUrl}
                                  alt={player.fullName}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-[var(--text-primary)] group-hover:text-[#CE1141] transition-colors">
                                {player.fullName}
                              </span>
                              <div className="text-xs text-[var(--text-muted)]">
                                {player.position}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden sm:table-cell">
                          {player.height && player.weight
                            ? `${player.height} · ${player.weight} lbs`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">
                          {player.college || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">
                          {player.experience || 'R'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </TeamHubLayout>
  )
}
```

---

## Players - /chicago-bulls/players/[slug]
File: `src/app/chicago-bulls/players/[slug]/page.tsx`

```tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPlayerProfile, type PlayerProfile, type PlayerGameLogEntry } from '@/lib/bullsData'

interface PlayerPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params
  const profile = await getPlayerProfile(slug)

  if (!profile) {
    return { title: 'Player Not Found | SportsMockery' }
  }

  return {
    title: `${profile.player.fullName} Stats & Profile | Chicago Bulls ${profile.player.position} | SportsMockery`,
    description: `${profile.player.fullName} statistics, game log, and player profile. #${profile.player.jerseyNumber} ${profile.player.position} for the Chicago Bulls.`,
    openGraph: {
      title: `${profile.player.fullName} | Chicago Bulls`,
      description: `${profile.player.position} #${profile.player.jerseyNumber} - View stats and profile`,
      images: profile.player.headshotUrl ? [profile.player.headshotUrl] : [],
    },
  }
}

export const revalidate = 3600

export default async function BullsPlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params
  const profile = await getPlayerProfile(slug)

  if (!profile) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #CE1141 0%, #CE1141 70%, #000000 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/chicago-bulls" className="hover:text-white">Chicago Bulls</Link>
            <span>/</span>
            <Link href="/chicago-bulls/roster" className="hover:text-white">Roster</Link>
            <span>/</span>
            <span className="text-white">{profile.player.fullName}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Headshot */}
            <div className="flex-shrink-0">
              {profile.player.headshotUrl ? (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl">
                  <Image
                    src={profile.player.headshotUrl}
                    alt={profile.player.fullName}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                    priority
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-white/10 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-lg font-bold">
                  #{profile.player.jerseyNumber}
                </span>
                <span className="px-3 py-1 bg-black rounded-lg text-sm font-semibold">
                  {profile.player.position}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {profile.player.fullName}
              </h1>

              <p className="text-white/70 text-lg mb-4">
                Chicago Bulls
              </p>

              {/* Bio Line */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/80">
                {profile.player.age && (
                  <div>
                    <span className="text-white/50 text-sm">Age: </span>
                    <span>{profile.player.age}</span>
                  </div>
                )}
                {profile.player.height && (
                  <div>
                    <span className="text-white/50 text-sm">Height: </span>
                    <span>{profile.player.height}</span>
                  </div>
                )}
                {profile.player.weight && (
                  <div>
                    <span className="text-white/50 text-sm">Weight: </span>
                    <span>{profile.player.weight} lbs</span>
                  </div>
                )}
                {profile.player.experience && (
                  <div>
                    <span className="text-white/50 text-sm">Experience: </span>
                    <span>{profile.player.experience}</span>
                  </div>
                )}
                {profile.player.college && (
                  <div>
                    <span className="text-white/50 text-sm">College: </span>
                    <span>{profile.player.college}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Season Snapshot */}
            {profile.currentSeason && (
              <div className="w-full md:w-auto md:min-w-[280px]">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                  <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-4">
                    2024-25 Season
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{profile.currentSeason.ppg?.toFixed(1) || '—'}</div>
                      <div className="text-xs text-white/60 uppercase">PPG</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{profile.currentSeason.rpg?.toFixed(1) || '—'}</div>
                      <div className="text-xs text-white/60 uppercase">RPG</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{profile.currentSeason.apg?.toFixed(1) || '—'}</div>
                      <div className="text-xs text-white/60 uppercase">APG</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Season Stats */}
            {profile.currentSeason && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  2024-25 Season Stats
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard label="PPG" value={profile.currentSeason.ppg?.toFixed(1) || '—'} />
                  <StatCard label="RPG" value={profile.currentSeason.rpg?.toFixed(1) || '—'} />
                  <StatCard label="APG" value={profile.currentSeason.apg?.toFixed(1) || '—'} />
                  <StatCard label="SPG" value={profile.currentSeason.spg?.toFixed(1) || '—'} />
                  <StatCard label="BPG" value={profile.currentSeason.bpg?.toFixed(1) || '—'} />
                  <StatCard label="FG%" value={profile.currentSeason.fgPct ? `${profile.currentSeason.fgPct.toFixed(1)}%` : '—'} />
                  <StatCard label="3P%" value={profile.currentSeason.threePct ? `${profile.currentSeason.threePct.toFixed(1)}%` : '—'} />
                  <StatCard label="FT%" value={profile.currentSeason.ftPct ? `${profile.currentSeason.ftPct.toFixed(1)}%` : '—'} />
                </div>
              </section>
            )}

            {/* Game Log */}
            {profile.gameLog.length > 0 && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-[var(--border-subtle)]">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Recent Games
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Opp</th>
                        <th className="px-4 py-3">Result</th>
                        <th className="px-4 py-3">PTS</th>
                        <th className="px-4 py-3">REB</th>
                        <th className="px-4 py-3">AST</th>
                        <th className="px-4 py-3 hidden sm:table-cell">MIN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.gameLog.slice(0, 10).map((game) => (
                        <GameLogRow key={game.gameId} game={game} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/chicago-bulls/roster"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#CE1141]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Full Bulls Roster
                </Link>
                <Link
                  href="/chicago-bulls/stats"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#CE1141]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                  Team Stats
                </Link>
                <Link
                  href="/chicago-bulls/schedule"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#CE1141]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
      <div className="text-xs text-[var(--text-muted)] uppercase">{label}</div>
    </div>
  )
}

function GameLogRow({ game }: { game: PlayerGameLogEntry }) {
  return (
    <tr className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors">
      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
        {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-primary)] font-medium">
        {game.isHome ? 'vs' : '@'} {game.opponent}
      </td>
      <td className="px-4 py-3">
        {game.result && (
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            game.result === 'W'
              ? 'bg-green-500/10 text-green-500'
              : 'bg-red-500/10 text-red-500'
          }`}>
            {game.result}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">
        {game.points ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
        {game.rebounds ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
        {game.assists ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden sm:table-cell">
        {game.minutes ?? '—'}
      </td>
    </tr>
  )
}
```

---

# CHICAGO CUBS

## News - /chicago-cubs
File: `src/app/chicago-cubs/page.tsx`

```tsx
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TeamHubLayout } from '@/components/team'
import ARTourButton from '@/components/ar/ARTourButton'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { supabaseAdmin } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Chicago Cubs | News, Stats, Schedule & Roster | SportsMockery',
  description: 'Complete Chicago Cubs coverage including latest news, team stats, schedule, roster, and expert analysis.',
  openGraph: {
    title: 'Chicago Cubs Hub | Sports Mockery',
    description: 'Your #1 source for Chicago Cubs news, stats, schedule, and analysis',
    type: 'website',
  },
}

// Revalidate every hour
export const revalidate = 3600

// Fetch Cubs posts from database
async function getCubsPosts(limit: number = 12) {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('sm_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image,
        published_at,
        sm_categories!inner(slug, name)
      `)
      .eq('status', 'published')
      .eq('sm_categories.slug', 'chicago-cubs')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching Cubs posts:', error)
      return []
    }

    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featured_image,
      categorySlug: post.sm_categories?.slug || 'chicago-cubs',
      publishedAt: post.published_at,
    }))
  } catch (error) {
    console.error('Error fetching Cubs posts:', error)
    return []
  }
}

export default async function CubsHubPage() {
  const team = CHICAGO_TEAMS.cubs

  // Fetch all data in parallel
  const [record, nextGame, posts] = await Promise.all([
    fetchTeamRecord('cubs'),
    fetchNextGame('cubs'),
    getCubsPosts(12),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="overview"
    >
      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Latest Headlines */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-bold border-b-2 pb-1"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--text-primary)',
                  borderColor: team.secondaryColor,
                }}
              >
                Latest Cubs News
              </h2>
            </div>

            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.slice(0, 6).map((post, index) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    team={team}
                    isLarge={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div
                className="text-center py-12 rounded-xl"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <p style={{ color: 'var(--text-muted)' }}>
                  No Cubs articles found. Check back soon!
                </p>
              </div>
            )}
          </section>

          {posts.length > 6 && (
            <section>
              <h2
                className="text-lg font-bold mb-4 border-b-2 pb-1"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--text-primary)',
                  borderColor: team.secondaryColor,
                }}
              >
                More Cubs Stories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.slice(6, 12).map((post) => (
                  <ArticleCard key={post.id} post={post} team={team} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          <SeasonSnapshotCard team={team} record={record} />
          <QuickLinksCard team={team} />
          <ARTourButton team="chicago-cubs" />
          <AskAIWidget team={team} />
          <FanChatWidget team={team} />
        </div>
      </div>
    </TeamHubLayout>
  )
}

// Reuse the same component patterns as Bulls page
function ArticleCard({ post, team, isLarge = false }: { post: any; team: typeof CHICAGO_TEAMS.cubs; isLarge?: boolean }) {
  const href = `/${post.categorySlug}/${post.slug}`

  if (isLarge) {
    return (
      <Link href={href} className="group block">
        <article className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          <div className="flex flex-col md:flex-row">
            {post.featuredImage && (
              <div className="relative aspect-[16/9] md:aspect-auto md:w-1/2 overflow-hidden">
                <Image src={post.featuredImage} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" priority />
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: team.primaryColor }} />
              </div>
            )}
            <div className="p-4 md:p-5 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: team.primaryColor }}>Cubs</span>
              <h3 className="font-bold mt-1 line-clamp-3 group-hover:underline" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', fontSize: '18px', lineHeight: '1.3' }}>{post.title}</h3>
              {post.excerpt && <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{post.excerpt}</p>}
              <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={href} className="group block">
      <article className="rounded-xl overflow-hidden flex gap-4 p-3 transition-colors hover:bg-[var(--bg-hover)]" style={{ backgroundColor: 'var(--bg-surface)' }}>
        {post.featuredImage && (
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <Image src={post.featuredImage} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold line-clamp-2 group-hover:underline" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.4' }}>{post.title}</h3>
          <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function SeasonSnapshotCard({ team, record }: { team: typeof CHICAGO_TEAMS.cubs; record: { wins: number; losses: number } | null }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <div className="px-5 py-4" style={{ backgroundColor: team.primaryColor }}>
        <div className="flex items-center gap-3">
          <Image src={team.logo} alt={team.name} width={40} height={40} className="w-10 h-10 object-contain" unoptimized />
          <div>
            <h3 className="font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>Season Snapshot</h3>
            <p className="text-xs text-white/70">2025 Season</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="text-center pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="text-4xl font-bold" style={{ color: team.primaryColor }}>{record ? `${record.wins}-${record.losses}` : '--'}</div>
          <div className="text-sm text-[var(--text-muted)] mt-1">Record</div>
        </div>
      </div>
    </div>
  )
}

function QuickLinksCard({ team }: { team: typeof CHICAGO_TEAMS.cubs }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <h3 className="font-bold mb-4" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}>Quick Links</h3>
      <div className="space-y-2">
        <Link href="/chicago-cubs" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>All Cubs News</span>
          <svg className="w-4 h-4 ml-auto" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </div>
  )
}

function AskAIWidget({ team }: { team: typeof CHICAGO_TEAMS.cubs }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${team.primaryColor}20` }}>
          <svg className="w-5 h-5" style={{ color: team.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
        <div>
          <h3 className="font-bold" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}>Ask Cubs AI</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Get instant answers</p>
        </div>
      </div>
      <Link href={`/ask-ai?team=${team.slug}`} className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white" style={{ backgroundColor: team.primaryColor }}>Ask a Question</Link>
    </div>
  )
}

function FanChatWidget({ team }: { team: typeof CHICAGO_TEAMS.cubs }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${team.secondaryColor}20` }}>
          <svg className="w-5 h-5" style={{ color: team.secondaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
        </div>
        <div>
          <h3 className="font-bold" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}>Cubs Fan Chat</h3>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span>Fans online</span>
          </div>
        </div>
      </div>
      <Link href="/fan-chat?channel=cubs" className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white" style={{ backgroundColor: team.primaryColor }}>Join Cubs Chat</Link>
    </div>
  )
}
```

---

## Schedule - /chicago-cubs/schedule
File: `src/app/chicago-cubs/schedule/page.tsx`

```tsx
import { Metadata } from 'next'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getCubsSchedule, type CubsGame } from '@/lib/cubsData'

const CUBS_LOGO = 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png'

export const metadata: Metadata = {
  title: 'Chicago Cubs Schedule 2025 | Game Dates & Results | SportsMockery',
  description: 'Complete Chicago Cubs 2025 schedule with game dates, times, opponents, scores, and results. View upcoming games and past results.',
}

export const revalidate = 3600

export default async function CubsSchedulePage() {
  const team = CHICAGO_TEAMS.cubs

  const [schedule, record, nextGame] = await Promise.all([
    getCubsSchedule(),
    fetchTeamRecord('cubs'),
    fetchNextGame('cubs'),
  ])

  const nextScheduledGame = schedule.find(g => g.status === 'scheduled')

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="schedule"
    >
      <div>
        {nextScheduledGame && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 bg-[#0E3386]/10 text-[#0E3386] dark:bg-[#CC3433]/10 dark:text-[#CC3433] text-xs font-semibold rounded">
                  UP NEXT
                </div>
                <div className="flex items-center gap-2">
                  {nextScheduledGame.opponentLogo && (
                    <Image
                      src={nextScheduledGame.opponentLogo}
                      alt={nextScheduledGame.opponent}
                      width={28}
                      height={28}
                      className="w-7 h-7"
                      unoptimized
                    />
                  )}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {nextScheduledGame.homeAway === 'home' ? 'vs' : '@'} {nextScheduledGame.opponentFullName || nextScheduledGame.opponent}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-[var(--text-primary)] font-medium">
                  {new Date(nextScheduledGame.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-[var(--text-muted)]">
                  {nextScheduledGame.time || 'TBD'} {nextScheduledGame.tv && `• ${nextScheduledGame.tv}`}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Full Schedule
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              {schedule.length} games
            </span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {schedule.map((game) => (
              <GameRow key={game.gameId} game={game} />
            ))}
          </div>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function GameRow({ game }: { game: CubsGame }) {
  const gameDate = new Date(game.date)
  const isPast = game.status === 'final'
  const isInProgress = game.status === 'in_progress'

  return (
    <div className={`p-4 hover:bg-[var(--bg-hover)] transition-colors ${isPast ? '' : 'bg-[var(--bg-tertiary)]/30'}`}>
      <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[100px_1fr_140px] gap-4 items-center">
        <div className="flex-shrink-0">
          <div className="font-medium text-[var(--text-primary)]">
            {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {game.dayOfWeek}
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 flex-shrink-0">
            <Image
              src={CUBS_LOGO}
              alt="Chicago Cubs"
              width={28}
              height={28}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>

          <span className="text-xs text-[var(--text-muted)] font-medium flex-shrink-0">
            {game.homeAway === 'home' ? 'vs' : '@'}
          </span>

          {game.opponentLogo && (
            <div className="w-7 h-7 flex-shrink-0">
              <Image
                src={game.opponentLogo}
                alt={game.opponent}
                width={28}
                height={28}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)] truncate block">
              {game.opponentFullName || game.opponent}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          {isPast ? (
            <div className="flex items-center gap-2 justify-end">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                game.result === 'W'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {game.result}
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.cubsScore}-{game.oppScore}{game.innings && game.innings > 9 ? ` (${game.innings})` : ''}
              </span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-2 justify-end">
              <span className="px-2 py-0.5 bg-[#0E3386]/10 text-[#0E3386] dark:bg-[#CC3433]/10 dark:text-[#CC3433] rounded text-xs font-medium animate-pulse">
                LIVE
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.cubsScore}-{game.oppScore}
              </span>
            </div>
          ) : (
            <div>
              <div className="font-medium text-[var(--text-primary)] text-sm">
                {game.time || 'TBD'}
              </div>
              {game.tv && (
                <div className="text-xs text-[var(--text-muted)]">
                  {game.tv}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Scores - /chicago-cubs/scores
File: `src/app/chicago-cubs/scores/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getCubsRecentScores, type CubsGame } from '@/lib/cubsData'

const CUBS_LOGO = 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png'

export const metadata: Metadata = {
  title: 'Chicago Cubs Scores 2025 | Game Results | SportsMockery',
  description: 'Chicago Cubs game scores and results. View recent games, final scores, and game summaries.',
}

export const revalidate = 1800

export default async function CubsScoresPage() {
  const team = CHICAGO_TEAMS.cubs

  const [scores, record, nextGame] = await Promise.all([
    getCubsRecentScores(20),
    fetchTeamRecord('cubs'),
    fetchNextGame('cubs'),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="scores"
    >
      <div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Recent Games
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              Last {scores.length} games
            </span>
          </div>

          {scores.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No completed games yet this season.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {scores.map((game) => (
                <div key={game.gameId} className="p-4 hover:bg-[var(--bg-hover)] transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-[var(--text-muted)]">
                        {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>

                      <div className="flex items-center gap-3">
                        <Image
                          src={CUBS_LOGO}
                          alt="Chicago Cubs"
                          width={32}
                          height={32}
                          className="w-8 h-8"
                          unoptimized
                        />
                        <span className="text-xs text-[var(--text-muted)]">
                          {game.homeAway === 'home' ? 'vs' : '@'}
                        </span>
                        {game.opponentLogo && (
                          <Image
                            src={game.opponentLogo}
                            alt={game.opponent}
                            width={32}
                            height={32}
                            className="w-8 h-8"
                            unoptimized
                          />
                        )}
                        <span className="font-medium text-[var(--text-primary)]">
                          {game.opponentFullName || game.opponent}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${
                        game.result === 'W'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {game.result}
                      </span>
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        {game.cubsScore} - {game.oppScore}{game.innings && game.innings > 9 ? ` (${game.innings})` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/chicago-cubs/schedule"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0E3386] hover:bg-[#0a2668] text-white font-semibold rounded-xl transition-colors"
          >
            View Full Schedule
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}
```

---

## Stats - /chicago-cubs/stats
File: `src/app/chicago-cubs/stats/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getCubsStats, type CubsStats, type LeaderboardEntry, type CubsPlayer } from '@/lib/cubsData'

export const metadata: Metadata = {
  title: 'Chicago Cubs Stats 2025 | Team & Player Statistics | SportsMockery',
  description: 'Chicago Cubs 2025 team and player statistics. View batting averages, home runs, RBIs, and pitching stats.',
}

export const revalidate = 3600

export default async function CubsStatsPage() {
  const team = CHICAGO_TEAMS.cubs

  const [stats, record, nextGame] = await Promise.all([
    getCubsStats(),
    fetchTeamRecord('cubs'),
    fetchNextGame('cubs'),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="stats"
    >
      <div>
        {/* Team Overview */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Team Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Record" value={stats.team.record} />
            <StatCard label="Win %" value={stats.team.pct.toFixed(3)} />
            <StatCard label="Runs Scored" value={stats.team.runsScored.toString()} />
            <StatCard label="Runs Allowed" value={stats.team.runsAllowed.toString()} />
            <StatCard
              label="Run Diff"
              value={`${stats.team.runDiff > 0 ? '+' : ''}${stats.team.runDiff}`}
              positive={stats.team.runDiff > 0}
              negative={stats.team.runDiff < 0}
            />
            <StatCard label="Team AVG" value={stats.team.teamAvg ? stats.team.teamAvg.toFixed(3) : '—'} />
            <StatCard label="Team ERA" value={stats.team.teamEra ? stats.team.teamEra.toFixed(2) : '—'} />
            <StatCard label="Team OPS" value={stats.team.teamOps ? stats.team.teamOps.toFixed(3) : '—'} />
          </div>
        </section>

        {/* Player Leaderboards */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Player Leaderboards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batting Leaders */}
            <LeaderboardCard
              title="Batting Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              entries={stats.leaderboards.batting}
              emptyText="No batting stats available"
            />

            {/* Home Run Leaders */}
            <LeaderboardCard
              title="Home Run Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              entries={stats.leaderboards.homeRuns}
              emptyText="No home run stats available"
            />

            {/* Pitching Leaders */}
            <LeaderboardCard
              title="Pitching Leaders (ERA)"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              entries={stats.leaderboards.pitching}
              emptyText="No pitching stats available"
            />

            {/* Saves Leaders */}
            <LeaderboardCard
              title="Saves Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              entries={stats.leaderboards.saves}
              emptyText="No saves stats available"
            />
          </div>
        </section>

        {/* Links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/chicago-cubs/roster"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[#0E3386] dark:hover:border-[#CC3433] text-[var(--text-primary)] font-medium rounded-xl transition-colors"
          >
            View Full Roster
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function StatCard({
  label,
  value,
  positive,
  negative,
}: {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
}) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
      <div className="text-sm text-[var(--text-muted)] mb-1">{label}</div>
      <div className={`text-3xl font-bold ${
        positive ? 'text-green-500' : negative ? 'text-red-500' : 'text-[var(--text-primary)]'
      }`}>
        {value}
      </div>
    </div>
  )
}

function LeaderboardCard({
  title,
  icon,
  entries,
  emptyText,
}: {
  title: string
  icon: React.ReactNode
  entries: LeaderboardEntry[]
  emptyText: string
}) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-[#0E3386]/10 dark:bg-[#CC3433]/10 flex items-center justify-center text-[#0E3386] dark:text-[#CC3433]">
          {icon}
        </span>
        <h3 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {title}
        </h3>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="p-6 text-center text-[var(--text-muted)]">
          {emptyText}
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)]">
          {entries.map((entry, index) => (
            <LeaderboardRow key={entry.player?.playerId || index} entry={entry} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  if (!entry.player) return null

  return (
    <Link
      href={`/chicago-cubs/players/${entry.player.slug}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-hover)] transition-colors group"
    >
      {/* Rank */}
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
        rank === 1
          ? 'bg-[#0E3386] dark:bg-[#CC3433] text-white'
          : rank === 2
            ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            : 'text-[var(--text-muted)]'
      }`}>
        {rank}
      </span>

      {/* Player Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {entry.player.headshotUrl ? (
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={entry.player.headshotUrl}
              alt={entry.player.fullName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[var(--text-muted)]">
              {entry.player.jerseyNumber}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <div className="font-medium text-[var(--text-primary)] group-hover:text-[#0E3386] dark:group-hover:text-[#CC3433] transition-colors truncate">
            {entry.player.fullName}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {entry.player.position} #{entry.player.jerseyNumber}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-right flex-shrink-0">
        <div>
          <div className="text-lg font-bold text-[var(--text-primary)]">
            {typeof entry.primaryStat === 'number'
              ? (entry.primaryLabel === 'AVG' || entry.primaryLabel === 'ERA')
                ? entry.primaryStat.toFixed(3).replace(/^0/, '')
                : entry.primaryStat
              : entry.primaryStat}
          </div>
          <div className="text-xs text-[var(--text-muted)]">{entry.primaryLabel}</div>
        </div>
        {entry.secondaryStat !== null && (
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-[var(--text-secondary)]">
              {entry.secondaryStat}
            </div>
            <div className="text-xs text-[var(--text-muted)]">{entry.secondaryLabel}</div>
          </div>
        )}
      </div>

      {/* Arrow */}
      <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#0E3386] dark:group-hover:text-[#CC3433] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
```

---

## Roster - /chicago-cubs/roster
File: `src/app/chicago-cubs/roster/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getCubsRosterGrouped, POSITION_GROUP_NAMES, type CubsPlayer, type PositionGroup } from '@/lib/cubsData'

export const metadata: Metadata = {
  title: 'Chicago Cubs Roster 2025 | SportsMockery',
  description: 'Complete 2025 Chicago Cubs roster with player profiles, positions, measurements, and stats.',
}

export const revalidate = 3600

const POSITION_ORDER: PositionGroup[] = ['pitchers', 'catchers', 'infielders', 'outfielders']

export default async function CubsRosterPage() {
  const team = CHICAGO_TEAMS.cubs

  const [roster, record, nextGame] = await Promise.all([
    getCubsRosterGrouped(),
    fetchTeamRecord('cubs'),
    fetchNextGame('cubs'),
  ])

  const allPlayers = Object.values(roster).flat()

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="roster"
    >
      {/* Summary Bar */}
      <div
        className="rounded-xl p-4 mb-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total: </span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{allPlayers.length} players</span>
          </div>
          {POSITION_ORDER.map(group => {
            const count = roster[group]?.length || 0
            if (count === 0) return null
            return (
              <div key={group}>
                <span style={{ color: 'var(--text-muted)' }}>{POSITION_GROUP_NAMES[group]}: </span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {POSITION_ORDER.map(group => {
          const players = roster[group]
          if (!players || players.length === 0) return null

          return (
            <div key={group} className={`bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden ${group === 'pitchers' ? 'lg:col-span-2' : ''}`}>
              <div className="px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {POSITION_GROUP_NAMES[group]}
                </h2>
                <span className="text-sm text-[var(--text-muted)]">
                  {players.length} player{players.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                      <th className="px-4 py-2 w-12">#</th>
                      <th className="px-4 py-2">Player</th>
                      <th className="px-4 py-2 hidden sm:table-cell">Size</th>
                      <th className="px-4 py-2 hidden md:table-cell">B/T</th>
                      <th className="px-4 py-2 hidden lg:table-cell">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr
                        key={player.playerId}
                        className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0E3386] text-white text-sm font-bold">
                            {player.jerseyNumber ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/chicago-cubs/players/${player.slug}`}
                            className="flex items-center gap-3 group"
                          >
                            {player.headshotUrl ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--border-subtle)]">
                                <Image
                                  src={player.headshotUrl}
                                  alt={player.fullName}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-[var(--text-primary)] group-hover:text-[#0E3386] dark:group-hover:text-[#CC3433] transition-colors">
                                {player.fullName}
                              </span>
                              <div className="text-xs text-[var(--text-muted)]">
                                {player.position}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden sm:table-cell">
                          {player.height && player.weight
                            ? `${player.height} · ${player.weight} lbs`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">
                          {player.bats && player.throws
                            ? `${player.bats}/${player.throws}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">
                          {player.age || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </TeamHubLayout>
  )
}
```

---

## Players - /chicago-cubs/players/[slug]
File: `src/app/chicago-cubs/players/[slug]/page.tsx`

```tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPlayerProfile, type PlayerProfile, type PlayerGameLogEntry } from '@/lib/cubsData'

interface PlayerPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params
  const profile = await getPlayerProfile(slug)

  if (!profile) {
    return { title: 'Player Not Found | SportsMockery' }
  }

  return {
    title: `${profile.player.fullName} Stats & Profile | Chicago Cubs ${profile.player.position} | SportsMockery`,
    description: `${profile.player.fullName} statistics, game log, and player profile. #${profile.player.jerseyNumber} ${profile.player.position} for the Chicago Cubs.`,
    openGraph: {
      title: `${profile.player.fullName} | Chicago Cubs`,
      description: `${profile.player.position} #${profile.player.jerseyNumber} - View stats and profile`,
      images: profile.player.headshotUrl ? [profile.player.headshotUrl] : [],
    },
  }
}

export const revalidate = 3600

export default async function CubsPlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params
  const profile = await getPlayerProfile(slug)

  if (!profile) {
    notFound()
  }

  const isPitcher = profile.player.positionGroup === 'pitchers'

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0E3386 0%, #0E3386 70%, #CC3433 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/chicago-cubs" className="hover:text-white">Chicago Cubs</Link>
            <span>/</span>
            <Link href="/chicago-cubs/roster" className="hover:text-white">Roster</Link>
            <span>/</span>
            <span className="text-white">{profile.player.fullName}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Headshot */}
            <div className="flex-shrink-0">
              {profile.player.headshotUrl ? (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl">
                  <Image
                    src={profile.player.headshotUrl}
                    alt={profile.player.fullName}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                    priority
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-white/10 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-lg font-bold">
                  #{profile.player.jerseyNumber}
                </span>
                <span className="px-3 py-1 bg-[#CC3433] rounded-lg text-sm font-semibold">
                  {profile.player.position}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {profile.player.fullName}
              </h1>

              <p className="text-white/70 text-lg mb-4">
                Chicago Cubs
              </p>

              {/* Bio Line */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/80">
                {profile.player.age && (
                  <div>
                    <span className="text-white/50 text-sm">Age: </span>
                    <span>{profile.player.age}</span>
                  </div>
                )}
                {profile.player.height && (
                  <div>
                    <span className="text-white/50 text-sm">Height: </span>
                    <span>{profile.player.height}</span>
                  </div>
                )}
                {profile.player.weight && (
                  <div>
                    <span className="text-white/50 text-sm">Weight: </span>
                    <span>{profile.player.weight} lbs</span>
                  </div>
                )}
                {profile.player.bats && profile.player.throws && (
                  <div>
                    <span className="text-white/50 text-sm">B/T: </span>
                    <span>{profile.player.bats}/{profile.player.throws}</span>
                  </div>
                )}
                {profile.player.experience && (
                  <div>
                    <span className="text-white/50 text-sm">Experience: </span>
                    <span>{profile.player.experience}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Season Snapshot */}
            {profile.currentSeason && (
              <div className="w-full md:w-auto md:min-w-[280px]">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                  <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-4">
                    2025 Season
                  </h3>
                  {isPitcher ? (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.wins ?? 0}-{profile.currentSeason.losses ?? 0}
                        </div>
                        <div className="text-xs text-white/60 uppercase">W-L</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.era?.toFixed(2) || '—'}
                        </div>
                        <div className="text-xs text-white/60 uppercase">ERA</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.strikeoutsPitched ?? '—'}
                        </div>
                        <div className="text-xs text-white/60 uppercase">SO</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.avg?.toFixed(3).replace(/^0/, '') || '—'}
                        </div>
                        <div className="text-xs text-white/60 uppercase">AVG</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.homeRuns ?? '—'}
                        </div>
                        <div className="text-xs text-white/60 uppercase">HR</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.rbi ?? '—'}
                        </div>
                        <div className="text-xs text-white/60 uppercase">RBI</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Season Stats */}
            {profile.currentSeason && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  2025 Season Stats
                </h2>
                {isPitcher ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="W-L" value={`${profile.currentSeason.wins ?? 0}-${profile.currentSeason.losses ?? 0}`} />
                    <StatCard label="ERA" value={profile.currentSeason.era?.toFixed(2) || '—'} />
                    <StatCard label="SO" value={(profile.currentSeason.strikeoutsPitched ?? 0).toString()} />
                    <StatCard label="IP" value={(profile.currentSeason.inningsPitched ?? 0).toFixed(1)} />
                    <StatCard label="WHIP" value={profile.currentSeason.whip?.toFixed(2) || '—'} />
                    <StatCard label="Saves" value={(profile.currentSeason.saves ?? 0).toString()} />
                    <StatCard label="Games" value={profile.currentSeason.gamesPlayed.toString()} />
                    <StatCard label="GS" value={(profile.currentSeason.gamesStarted ?? 0).toString()} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="AVG" value={profile.currentSeason.avg?.toFixed(3).replace(/^0/, '') || '—'} />
                    <StatCard label="HR" value={(profile.currentSeason.homeRuns ?? 0).toString()} />
                    <StatCard label="RBI" value={(profile.currentSeason.rbi ?? 0).toString()} />
                    <StatCard label="R" value={(profile.currentSeason.runs ?? 0).toString()} />
                    <StatCard label="H" value={(profile.currentSeason.hits ?? 0).toString()} />
                    <StatCard label="OBP" value={profile.currentSeason.obp?.toFixed(3).replace(/^0/, '') || '—'} />
                    <StatCard label="SLG" value={profile.currentSeason.slg?.toFixed(3).replace(/^0/, '') || '—'} />
                    <StatCard label="OPS" value={profile.currentSeason.ops?.toFixed(3).replace(/^0/, '') || '—'} />
                    <StatCard label="SB" value={(profile.currentSeason.stolenBases ?? 0).toString()} />
                    <StatCard label="AB" value={(profile.currentSeason.atBats ?? 0).toString()} />
                    <StatCard label="2B" value={(profile.currentSeason.doubles ?? 0).toString()} />
                    <StatCard label="3B" value={(profile.currentSeason.triples ?? 0).toString()} />
                  </div>
                )}
              </section>
            )}

            {/* Game Log */}
            {profile.gameLog.length > 0 && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-[var(--border-subtle)]">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Recent Games
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Opp</th>
                        <th className="px-4 py-3">Result</th>
                        {isPitcher ? (
                          <>
                            <th className="px-4 py-3">IP</th>
                            <th className="px-4 py-3">H</th>
                            <th className="px-4 py-3">ER</th>
                            <th className="px-4 py-3 hidden sm:table-cell">K</th>
                            <th className="px-4 py-3 hidden sm:table-cell">Dec</th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-3">AB</th>
                            <th className="px-4 py-3">H</th>
                            <th className="px-4 py-3">HR</th>
                            <th className="px-4 py-3 hidden sm:table-cell">RBI</th>
                            <th className="px-4 py-3 hidden sm:table-cell">R</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {profile.gameLog.slice(0, 10).map((game) => (
                        <GameLogRow key={game.gameId} game={game} isPitcher={isPitcher} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/chicago-cubs/roster"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#0E3386] dark:hover:text-[#CC3433]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Full Cubs Roster
                </Link>
                <Link
                  href="/chicago-cubs/stats"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#0E3386] dark:hover:text-[#CC3433]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                  Team Stats
                </Link>
                <Link
                  href="/chicago-cubs/schedule"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#0E3386] dark:hover:text-[#CC3433]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
      <div className="text-xs text-[var(--text-muted)] uppercase">{label}</div>
    </div>
  )
}

function GameLogRow({ game, isPitcher }: { game: PlayerGameLogEntry; isPitcher: boolean }) {
  return (
    <tr className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors">
      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
        {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-primary)] font-medium">
        {game.isHome ? 'vs' : '@'} {game.opponent}
      </td>
      <td className="px-4 py-3">
        {game.result && (
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            game.result === 'W'
              ? 'bg-green-500/10 text-green-500'
              : 'bg-red-500/10 text-red-500'
          }`}>
            {game.result}
          </span>
        )}
      </td>
      {isPitcher ? (
        <>
          <td className="px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">
            {game.inningsPitched ?? '—'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
            {game.hitsAllowed ?? '—'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
            {game.earnedRuns ?? '—'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden sm:table-cell">
            {game.strikeoutsPitched ?? '—'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden sm:table-cell">
            {game.pitchingDecision || '—'}
          </td>
        </>
      ) : (
        <>
          <td className="px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">
            {game.atBats ?? '—'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
            {game.hits ?? '—'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
            {game.homeRuns ?? '—'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden sm:table-cell">
            {game.rbi ?? '—'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden sm:table-cell">
            {game.runs ?? '—'}
          </td>
        </>
      )}
    </tr>
  )
}
```

---

# CHICAGO WHITE SOX

## News - /chicago-white-sox
File: `src/app/chicago-white-sox/page.tsx`

```tsx
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TeamHubLayout } from '@/components/team'
import ARTourButton from '@/components/ar/ARTourButton'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { supabaseAdmin } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Chicago White Sox | News, Stats, Schedule & Roster | SportsMockery',
  description: 'Complete Chicago White Sox coverage including latest news, team stats, schedule, roster, and expert analysis.',
  openGraph: {
    title: 'Chicago White Sox Hub | Sports Mockery',
    description: 'Your #1 source for White Sox news, stats, schedule, and analysis',
    type: 'website',
  },
}

export const revalidate = 3600

async function getWhiteSoxPosts(limit: number = 12) {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('sm_posts')
      .select(`
        id, title, slug, excerpt, featured_image, published_at,
        sm_categories!inner(slug, name)
      `)
      .eq('status', 'published')
      .eq('sm_categories.slug', 'chicago-white-sox')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) return []
    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featured_image,
      categorySlug: post.sm_categories?.slug || 'chicago-white-sox',
      publishedAt: post.published_at,
    }))
  } catch {
    return []
  }
}

export default async function WhiteSoxHubPage() {
  const team = CHICAGO_TEAMS.whitesox

  const [record, nextGame, posts] = await Promise.all([
    fetchTeamRecord('whitesox'),
    fetchNextGame('whitesox'),
    getWhiteSoxPosts(12),
  ])

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="overview">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold border-b-2 pb-1" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', borderColor: team.secondaryColor }}>
                Latest White Sox News
              </h2>
            </div>

            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.slice(0, 6).map((post, index) => (
                  <ArticleCard key={post.id} post={post} team={team} isLarge={index === 0} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-muted)' }}>No White Sox articles found. Check back soon!</p>
              </div>
            )}
          </section>

          {posts.length > 6 && (
            <section>
              <h2 className="text-lg font-bold mb-4 border-b-2 pb-1" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', borderColor: team.secondaryColor }}>
                More White Sox Stories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.slice(6, 12).map((post) => <ArticleCard key={post.id} post={post} team={team} />)}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <SeasonSnapshotCard team={team} record={record} />
          <QuickLinksCard team={team} />
          <ARTourButton team="chicago-white-sox" />
          <AskAIWidget team={team} />
          <FanChatWidget team={team} />
        </div>
      </div>
    </TeamHubLayout>
  )
}

function ArticleCard({ post, team, isLarge = false }: { post: any; team: typeof CHICAGO_TEAMS.whitesox; isLarge?: boolean }) {
  const href = `/${post.categorySlug}/${post.slug}`

  if (isLarge) {
    return (
      <Link href={href} className="group block">
        <article className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          <div className="flex flex-col md:flex-row">
            {post.featuredImage && (
              <div className="relative aspect-[16/9] md:aspect-auto md:w-1/2 overflow-hidden">
                <Image src={post.featuredImage} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" priority />
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: team.primaryColor }} />
              </div>
            )}
            <div className="p-4 md:p-5 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: team.secondaryColor }}>White Sox</span>
              <h3 className="font-bold mt-1 line-clamp-3 group-hover:underline" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', fontSize: '18px', lineHeight: '1.3' }}>{post.title}</h3>
              {post.excerpt && <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{post.excerpt}</p>}
              <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={href} className="group block">
      <article className="rounded-xl overflow-hidden flex gap-4 p-3 transition-colors hover:bg-[var(--bg-hover)]" style={{ backgroundColor: 'var(--bg-surface)' }}>
        {post.featuredImage && (
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <Image src={post.featuredImage} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold line-clamp-2 group-hover:underline" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.4' }}>{post.title}</h3>
          <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function SeasonSnapshotCard({ team, record }: { team: typeof CHICAGO_TEAMS.whitesox; record: { wins: number; losses: number } | null }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <div className="px-5 py-4" style={{ backgroundColor: team.primaryColor }}>
        <div className="flex items-center gap-3">
          <Image src={team.logo} alt={team.name} width={40} height={40} className="w-10 h-10 object-contain" unoptimized />
          <div>
            <h3 className="font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>Season Snapshot</h3>
            <p className="text-xs text-white/70">2025 Season</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="text-center pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="text-4xl font-bold" style={{ color: team.secondaryColor }}>{record ? `${record.wins}-${record.losses}` : '--'}</div>
          <div className="text-sm text-[var(--text-muted)] mt-1">Record</div>
        </div>
      </div>
    </div>
  )
}

function QuickLinksCard({ team }: { team: typeof CHICAGO_TEAMS.whitesox }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <h3 className="font-bold mb-4" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}>Quick Links</h3>
      <Link href="/chicago-white-sox" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]">
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>All White Sox News</span>
        <svg className="w-4 h-4 ml-auto" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </Link>
    </div>
  )
}

function AskAIWidget({ team }: { team: typeof CHICAGO_TEAMS.whitesox }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${team.primaryColor}20` }}>
          <svg className="w-5 h-5" style={{ color: team.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
        <div>
          <h3 className="font-bold" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}>Ask White Sox AI</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Get instant answers</p>
        </div>
      </div>
      <Link href={`/ask-ai?team=${team.slug}`} className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white" style={{ backgroundColor: team.primaryColor }}>Ask a Question</Link>
    </div>
  )
}

function FanChatWidget({ team }: { team: typeof CHICAGO_TEAMS.whitesox }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${team.secondaryColor}20` }}>
          <svg className="w-5 h-5" style={{ color: team.secondaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
        </div>
        <div>
          <h3 className="font-bold" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}>White Sox Fan Chat</h3>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span>Fans online</span>
          </div>
        </div>
      </div>
      <Link href="/fan-chat?channel=whitesox" className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white" style={{ backgroundColor: team.primaryColor }}>Join Sox Chat</Link>
    </div>
  )
}
```

---

## Schedule - /chicago-white-sox/schedule
File: `src/app/chicago-white-sox/schedule/page.tsx`

```tsx
import { Metadata } from 'next'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getWhiteSoxSchedule, type WhiteSoxGame } from '@/lib/whitesoxData'

const WHITE_SOX_LOGO = 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png'

export const metadata: Metadata = {
  title: 'Chicago White Sox Schedule 2025 | Game Dates & Results | SportsMockery',
  description: 'Complete Chicago White Sox 2025 schedule with game dates, times, opponents, scores, and results. View upcoming games and past results.',
}

export const revalidate = 3600

export default async function WhiteSoxSchedulePage() {
  const team = CHICAGO_TEAMS.whitesox

  const [schedule, record, nextGame] = await Promise.all([
    getWhiteSoxSchedule(),
    fetchTeamRecord('whitesox'),
    fetchNextGame('whitesox'),
  ])

  const nextScheduledGame = schedule.find(g => g.status === 'scheduled')

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="schedule"
    >
      <div>
        {nextScheduledGame && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 bg-[#27251F]/10 text-[#27251F] dark:bg-[#C4CED4]/10 dark:text-[#C4CED4] text-xs font-semibold rounded">
                  UP NEXT
                </div>
                <div className="flex items-center gap-2">
                  {nextScheduledGame.opponentLogo && (
                    <Image
                      src={nextScheduledGame.opponentLogo}
                      alt={nextScheduledGame.opponent}
                      width={28}
                      height={28}
                      className="w-7 h-7"
                      unoptimized
                    />
                  )}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {nextScheduledGame.homeAway === 'home' ? 'vs' : '@'} {nextScheduledGame.opponentFullName || nextScheduledGame.opponent}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-[var(--text-primary)] font-medium">
                  {new Date(nextScheduledGame.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-[var(--text-muted)]">
                  {nextScheduledGame.time || 'TBD'} {nextScheduledGame.tv && `• ${nextScheduledGame.tv}`}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Full Schedule
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              {schedule.length} games
            </span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {schedule.map((game) => (
              <GameRow key={game.gameId} game={game} />
            ))}
          </div>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function GameRow({ game }: { game: WhiteSoxGame }) {
  const gameDate = new Date(game.date)
  const isPast = game.status === 'final'
  const isInProgress = game.status === 'in_progress'

  return (
    <div className={`p-4 hover:bg-[var(--bg-hover)] transition-colors ${isPast ? '' : 'bg-[var(--bg-tertiary)]/30'}`}>
      <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[100px_1fr_140px] gap-4 items-center">
        <div className="flex-shrink-0">
          <div className="font-medium text-[var(--text-primary)]">
            {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {game.dayOfWeek}
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 flex-shrink-0">
            <Image
              src={WHITE_SOX_LOGO}
              alt="Chicago White Sox"
              width={28}
              height={28}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>

          <span className="text-xs text-[var(--text-muted)] font-medium flex-shrink-0">
            {game.homeAway === 'home' ? 'vs' : '@'}
          </span>

          {game.opponentLogo && (
            <div className="w-7 h-7 flex-shrink-0">
              <Image
                src={game.opponentLogo}
                alt={game.opponent}
                width={28}
                height={28}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)] truncate block">
              {game.opponentFullName || game.opponent}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          {isPast ? (
            <div className="flex items-center gap-2 justify-end">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                game.result === 'W'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {game.result}
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.whitesoxScore}-{game.oppScore}{game.innings && game.innings > 9 ? ` (${game.innings})` : ''}
              </span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-2 justify-end">
              <span className="px-2 py-0.5 bg-[#27251F]/10 text-[#27251F] dark:bg-[#C4CED4]/10 dark:text-[#C4CED4] rounded text-xs font-medium animate-pulse">
                LIVE
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.whitesoxScore}-{game.oppScore}
              </span>
            </div>
          ) : (
            <div>
              <div className="font-medium text-[var(--text-primary)] text-sm">
                {game.time || 'TBD'}
              </div>
              {game.tv && (
                <div className="text-xs text-[var(--text-muted)]">
                  {game.tv}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Scores - /chicago-white-sox/scores
File: `src/app/chicago-white-sox/scores/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getWhiteSoxRecentScores, type WhiteSoxGame } from '@/lib/whitesoxData'

const WHITE_SOX_LOGO = 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png'

export const metadata: Metadata = {
  title: 'Chicago White Sox Scores 2025 | Game Results | SportsMockery',
  description: 'Chicago White Sox game scores and results. View recent games, final scores, and game summaries.',
}

export const revalidate = 1800

export default async function WhiteSoxScoresPage() {
  const team = CHICAGO_TEAMS.whitesox

  const [scores, record, nextGame] = await Promise.all([
    getWhiteSoxRecentScores(20),
    fetchTeamRecord('whitesox'),
    fetchNextGame('whitesox'),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="scores"
    >
      <div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Recent Games
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              Last {scores.length} games
            </span>
          </div>

          {scores.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No completed games yet this season.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {scores.map((game) => (
                <div key={game.gameId} className="p-4 hover:bg-[var(--bg-hover)] transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-[var(--text-muted)]">
                        {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>

                      <div className="flex items-center gap-3">
                        <Image
                          src={WHITE_SOX_LOGO}
                          alt="Chicago White Sox"
                          width={32}
                          height={32}
                          className="w-8 h-8"
                          unoptimized
                        />
                        <span className="text-xs text-[var(--text-muted)]">
                          {game.homeAway === 'home' ? 'vs' : '@'}
                        </span>
                        {game.opponentLogo && (
                          <Image
                            src={game.opponentLogo}
                            alt={game.opponent}
                            width={32}
                            height={32}
                            className="w-8 h-8"
                            unoptimized
                          />
                        )}
                        <span className="font-medium text-[var(--text-primary)]">
                          {game.opponentFullName || game.opponent}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${
                        game.result === 'W'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {game.result}
                      </span>
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        {game.whitesoxScore} - {game.oppScore}{game.innings && game.innings > 9 ? ` (${game.innings})` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/chicago-white-sox/schedule"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#27251F] hover:bg-[#1a1918] text-white font-semibold rounded-xl transition-colors"
          >
            View Full Schedule
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}
```

---

## Stats - /chicago-white-sox/stats
File: `src/app/chicago-white-sox/stats/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getWhiteSoxStats, type WhiteSoxStats, type LeaderboardEntry, type WhiteSoxPlayer } from '@/lib/whitesoxData'

export const metadata: Metadata = {
  title: 'Chicago White Sox Stats 2025 | Team & Player Statistics | SportsMockery',
  description: 'Chicago White Sox 2025 team and player statistics. View batting averages, home runs, RBIs, and pitching stats.',
}

export const revalidate = 3600

export default async function WhiteSoxStatsPage() {
  const team = CHICAGO_TEAMS.whitesox

  const [stats, record, nextGame] = await Promise.all([
    getWhiteSoxStats(),
    fetchTeamRecord('whitesox'),
    fetchNextGame('whitesox'),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="stats"
    >
      <div>
        {/* Team Overview */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Team Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Record" value={stats.team.record} />
            <StatCard label="Runs Scored" value={stats.team.runsScored.toString()} />
            <StatCard label="Runs Allowed" value={stats.team.runsAllowed.toString()} />
            <StatCard
              label="Run Diff"
              value={`${stats.team.runDiff > 0 ? '+' : ''}${stats.team.runDiff}`}
              positive={stats.team.runDiff > 0}
              negative={stats.team.runDiff < 0}
            />
            <StatCard label="Win %" value={stats.team.pct.toFixed(3)} />
            <StatCard label="Team AVG" value={stats.team.teamAvg ? `.${Math.round(stats.team.teamAvg * 1000).toString().padStart(3, '0')}` : '---'} />
            <StatCard label="Team ERA" value={stats.team.teamEra?.toFixed(2) || '---'} />
            <StatCard label="Team OPS" value={stats.team.teamOps?.toFixed(3) || '---'} />
          </div>
        </section>

        {/* Batting Leaderboards */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Batting Leaders
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AVG Leaders */}
            <LeaderboardCard
              title="Batting Average"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              entries={stats.leaderboards.batting}
              emptyText="No batting stats available"
            />

            {/* HR Leaders */}
            <LeaderboardCard
              title="Home Run Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              entries={stats.leaderboards.homeRuns}
              emptyText="No home run stats available"
            />
          </div>
        </section>

        {/* Pitching Leaderboards */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Pitching Leaders
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ERA Leaders */}
            <LeaderboardCard
              title="ERA Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              entries={stats.leaderboards.pitching}
              emptyText="No pitching stats available"
            />

            {/* Saves Leaders */}
            <LeaderboardCard
              title="Saves Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              entries={stats.leaderboards.saves}
              emptyText="No saves stats available"
            />
          </div>
        </section>

        {/* Links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/chicago-white-sox/roster"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[#27251F] dark:hover:border-[#C4CED4] text-[var(--text-primary)] font-medium rounded-xl transition-colors"
          >
            View Full Roster
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function StatCard({
  label,
  value,
  positive,
  negative,
}: {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
}) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
      <div className="text-sm text-[var(--text-muted)] mb-1">{label}</div>
      <div className={`text-3xl font-bold ${
        positive ? 'text-green-500' : negative ? 'text-red-500' : 'text-[var(--text-primary)]'
      }`}>
        {value}
      </div>
    </div>
  )
}

function LeaderboardCard({
  title,
  icon,
  entries,
  emptyText,
}: {
  title: string
  icon: React.ReactNode
  entries: LeaderboardEntry[]
  emptyText: string
}) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-[#27251F]/10 dark:bg-[#C4CED4]/10 flex items-center justify-center text-[#27251F] dark:text-[#C4CED4]">
          {icon}
        </span>
        <h3 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {title}
        </h3>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="p-6 text-center text-[var(--text-muted)]">
          {emptyText}
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)]">
          {entries.map((entry, index) => (
            <LeaderboardRow key={entry.player?.playerId || index} entry={entry} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  if (!entry.player) return null

  return (
    <Link
      href={`/chicago-white-sox/players/${entry.player.slug}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-hover)] transition-colors group"
    >
      {/* Rank */}
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
        rank === 1
          ? 'bg-[#27251F] text-white dark:bg-[#C4CED4] dark:text-[#27251F]'
          : rank === 2
            ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            : 'text-[var(--text-muted)]'
      }`}>
        {rank}
      </span>

      {/* Player Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {entry.player.headshotUrl ? (
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={entry.player.headshotUrl}
              alt={entry.player.fullName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[var(--text-muted)]">
              {entry.player.jerseyNumber}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <div className="font-medium text-[var(--text-primary)] group-hover:text-[#27251F] dark:group-hover:text-[#C4CED4] transition-colors truncate">
            {entry.player.fullName}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {entry.player.position} #{entry.player.jerseyNumber}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-right flex-shrink-0">
        <div>
          <div className="text-lg font-bold text-[var(--text-primary)]">
            {typeof entry.primaryStat === 'number'
              ? (entry.primaryLabel === 'AVG' || entry.primaryLabel === 'ERA'
                  ? entry.primaryStat.toFixed(3)
                  : entry.primaryStat)
              : entry.primaryStat}
          </div>
          <div className="text-xs text-[var(--text-muted)]">{entry.primaryLabel}</div>
        </div>
        {entry.secondaryStat !== null && (
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-[var(--text-secondary)]">
              {entry.secondaryStat}
            </div>
            <div className="text-xs text-[var(--text-muted)]">{entry.secondaryLabel}</div>
          </div>
        )}
      </div>

      {/* Arrow */}
      <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#27251F] dark:group-hover:text-[#C4CED4] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
```

---

## Roster - /chicago-white-sox/roster
File: `src/app/chicago-white-sox/roster/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getWhiteSoxRosterGrouped, POSITION_GROUP_NAMES, type WhiteSoxPlayer, type PositionGroup } from '@/lib/whitesoxData'

export const metadata: Metadata = {
  title: 'Chicago White Sox Roster 2025 | SportsMockery',
  description: 'Complete 2025 Chicago White Sox roster with player profiles, positions, measurements, and stats.',
}

export const revalidate = 3600

const POSITION_ORDER: PositionGroup[] = ['pitchers', 'catchers', 'infielders', 'outfielders']

export default async function WhiteSoxRosterPage() {
  const team = CHICAGO_TEAMS.whitesox

  const [roster, record, nextGame] = await Promise.all([
    getWhiteSoxRosterGrouped(),
    fetchTeamRecord('whitesox'),
    fetchNextGame('whitesox'),
  ])

  const allPlayers = Object.values(roster).flat()

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="roster"
    >
      {/* Summary Bar */}
      <div
        className="rounded-xl p-4 mb-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total: </span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{allPlayers.length} players</span>
          </div>
          {POSITION_ORDER.map(group => {
            const count = roster[group]?.length || 0
            if (count === 0) return null
            return (
              <div key={group}>
                <span style={{ color: 'var(--text-muted)' }}>{POSITION_GROUP_NAMES[group]}: </span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {POSITION_ORDER.map(group => {
          const players = roster[group]
          if (!players || players.length === 0) return null

          return (
            <div key={group} className={`bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden ${group === 'pitchers' ? 'lg:col-span-2' : ''}`}>
              <div className="px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {POSITION_GROUP_NAMES[group]}
                </h2>
                <span className="text-sm text-[var(--text-muted)]">
                  {players.length} player{players.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                      <th className="px-4 py-2 w-12">#</th>
                      <th className="px-4 py-2">Player</th>
                      <th className="px-4 py-2 hidden sm:table-cell">Size</th>
                      <th className="px-4 py-2 hidden md:table-cell">B/T</th>
                      <th className="px-4 py-2 hidden lg:table-cell">Age</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr
                        key={player.playerId}
                        className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#27251F] text-white text-sm font-bold">
                            {player.jerseyNumber ?? '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/chicago-white-sox/players/${player.slug}`}
                            className="flex items-center gap-3 group"
                          >
                            {player.headshotUrl ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--border-subtle)]">
                                <Image
                                  src={player.headshotUrl}
                                  alt={player.fullName}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-[var(--text-primary)] group-hover:text-[#27251F] dark:group-hover:text-[#C4CED4] transition-colors">
                                {player.fullName}
                              </span>
                              <div className="text-xs text-[var(--text-muted)]">
                                {player.position}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden sm:table-cell">
                          {player.height && player.weight
                            ? `${player.height} · ${player.weight} lbs`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">
                          {player.bats && player.throws
                            ? `${player.bats}/${player.throws}`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">
                          {player.age || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </TeamHubLayout>
  )
}
```

---

## Players - /chicago-white-sox/players/[slug]
File: `src/app/chicago-white-sox/players/[slug]/page.tsx`

```tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPlayerProfile, type PlayerProfile, type PlayerGameLogEntry } from '@/lib/whitesoxData'

interface PlayerPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params
  const profile = await getPlayerProfile(slug)

  if (!profile) {
    return { title: 'Player Not Found | SportsMockery' }
  }

  return {
    title: `${profile.player.fullName} Stats & Profile | Chicago White Sox ${profile.player.position} | SportsMockery`,
    description: `${profile.player.fullName} statistics, game log, and player profile. #${profile.player.jerseyNumber} ${profile.player.position} for the Chicago White Sox.`,
    openGraph: {
      title: `${profile.player.fullName} | Chicago White Sox`,
      description: `${profile.player.position} #${profile.player.jerseyNumber} - View stats and profile`,
      images: profile.player.headshotUrl ? [profile.player.headshotUrl] : [],
    },
  }
}

export const revalidate = 3600

export default async function WhiteSoxPlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params
  const profile = await getPlayerProfile(slug)

  if (!profile) {
    notFound()
  }

  const isPitcher = profile.player.positionGroup === 'pitchers'

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #27251F 0%, #27251F 70%, #C4CED4 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/chicago-white-sox" className="hover:text-white">Chicago White Sox</Link>
            <span>/</span>
            <Link href="/chicago-white-sox/roster" className="hover:text-white">Roster</Link>
            <span>/</span>
            <span className="text-white">{profile.player.fullName}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Headshot */}
            <div className="flex-shrink-0">
              {profile.player.headshotUrl ? (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl">
                  <Image
                    src={profile.player.headshotUrl}
                    alt={profile.player.fullName}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                    priority
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-white/10 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-lg font-bold">
                  #{profile.player.jerseyNumber}
                </span>
                <span className="px-3 py-1 bg-[#C4CED4] text-[#27251F] rounded-lg text-sm font-semibold">
                  {profile.player.position}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {profile.player.fullName}
              </h1>

              <p className="text-white/70 text-lg mb-4">
                Chicago White Sox
              </p>

              {/* Bio Line */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/80">
                {profile.player.age && (
                  <div>
                    <span className="text-white/50 text-sm">Age: </span>
                    <span>{profile.player.age}</span>
                  </div>
                )}
                {profile.player.height && (
                  <div>
                    <span className="text-white/50 text-sm">Height: </span>
                    <span>{profile.player.height}</span>
                  </div>
                )}
                {profile.player.weight && (
                  <div>
                    <span className="text-white/50 text-sm">Weight: </span>
                    <span>{profile.player.weight} lbs</span>
                  </div>
                )}
                {profile.player.bats && profile.player.throws && (
                  <div>
                    <span className="text-white/50 text-sm">B/T: </span>
                    <span>{profile.player.bats}/{profile.player.throws}</span>
                  </div>
                )}
                {profile.player.experience && (
                  <div>
                    <span className="text-white/50 text-sm">Experience: </span>
                    <span>{profile.player.experience}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Season Snapshot */}
            {profile.currentSeason && (
              <div className="w-full md:w-auto md:min-w-[280px]">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                  <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-4">
                    2025 Season
                  </h3>
                  {isPitcher ? (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.wins || 0}-{profile.currentSeason.losses || 0}
                        </div>
                        <div className="text-xs text-white/60 uppercase">W-L</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.era?.toFixed(2) || '-'}
                        </div>
                        <div className="text-xs text-white/60 uppercase">ERA</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.strikeoutsPitched || 0}
                        </div>
                        <div className="text-xs text-white/60 uppercase">K</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.avg?.toFixed(3) || '-'}
                        </div>
                        <div className="text-xs text-white/60 uppercase">AVG</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.homeRuns || 0}
                        </div>
                        <div className="text-xs text-white/60 uppercase">HR</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.rbi || 0}
                        </div>
                        <div className="text-xs text-white/60 uppercase">RBI</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Season Stats */}
            {profile.currentSeason && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  2025 Season Stats
                </h2>
                {isPitcher ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="W-L" value={`${profile.currentSeason.wins || 0}-${profile.currentSeason.losses || 0}`} />
                    <StatCard label="ERA" value={profile.currentSeason.era?.toFixed(2) || '-'} />
                    <StatCard label="Games" value={(profile.currentSeason.gamesPlayed || 0).toString()} />
                    <StatCard label="Starts" value={(profile.currentSeason.gamesStarted || 0).toString()} />
                    <StatCard label="IP" value={(profile.currentSeason.inningsPitched || 0).toFixed(1)} />
                    <StatCard label="K" value={(profile.currentSeason.strikeoutsPitched || 0).toString()} />
                    <StatCard label="WHIP" value={profile.currentSeason.whip?.toFixed(2) || '-'} />
                    <StatCard label="Saves" value={(profile.currentSeason.saves || 0).toString()} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="AVG" value={profile.currentSeason.avg?.toFixed(3) || '-'} />
                    <StatCard label="HR" value={(profile.currentSeason.homeRuns || 0).toString()} />
                    <StatCard label="RBI" value={(profile.currentSeason.rbi || 0).toString()} />
                    <StatCard label="R" value={(profile.currentSeason.runs || 0).toString()} />
                    <StatCard label="H" value={(profile.currentSeason.hits || 0).toString()} />
                    <StatCard label="OBP" value={profile.currentSeason.obp?.toFixed(3) || '-'} />
                    <StatCard label="SLG" value={profile.currentSeason.slg?.toFixed(3) || '-'} />
                    <StatCard label="OPS" value={profile.currentSeason.ops?.toFixed(3) || '-'} />
                  </div>
                )}
              </section>
            )}

            {/* Game Log */}
            {profile.gameLog.length > 0 && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-[var(--border-subtle)]">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Recent Games
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Opp</th>
                        <th className="px-4 py-3">Result</th>
                        {isPitcher ? (
                          <>
                            <th className="px-4 py-3">IP</th>
                            <th className="px-4 py-3">H</th>
                            <th className="px-4 py-3">ER</th>
                            <th className="px-4 py-3 hidden sm:table-cell">K</th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-3">AB</th>
                            <th className="px-4 py-3">H</th>
                            <th className="px-4 py-3">HR</th>
                            <th className="px-4 py-3 hidden sm:table-cell">RBI</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {profile.gameLog.slice(0, 10).map((game) => (
                        <GameLogRow key={game.gameId} game={game} isPitcher={isPitcher} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/chicago-white-sox/roster"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#27251F] dark:hover:text-[#C4CED4]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Full White Sox Roster
                </Link>
                <Link
                  href="/chicago-white-sox/stats"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#27251F] dark:hover:text-[#C4CED4]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                  Team Stats
                </Link>
                <Link
                  href="/chicago-white-sox/schedule"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#27251F] dark:hover:text-[#C4CED4]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
      <div className="text-xs text-[var(--text-muted)] uppercase">{label}</div>
    </div>
  )
}

function GameLogRow({ game, isPitcher }: { game: PlayerGameLogEntry; isPitcher: boolean }) {
  return (
    <tr className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors">
      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
        {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-primary)] font-medium">
        {game.isHome ? 'vs' : '@'} {game.opponent}
      </td>
      <td className="px-4 py-3">
        {game.result && (
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            game.result === 'W'
              ? 'bg-green-500/10 text-green-500'
              : 'bg-red-500/10 text-red-500'
          }`}>
            {game.result} {game.whitesoxScore}-{game.oppScore}
          </span>
        )}
      </td>
      {isPitcher ? (
        <>
          <td className="px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">
            {game.inningsPitched?.toFixed(1) ?? '-'}
            {game.pitchingDecision && (
              <span className="ml-1 text-xs text-[var(--text-muted)]">({game.pitchingDecision})</span>
            )}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
            {game.hitsAllowed ?? '-'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
            {game.earnedRuns ?? '-'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden sm:table-cell">
            {game.strikeoutsPitched ?? '-'}
          </td>
        </>
      ) : (
        <>
          <td className="px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">
            {game.atBats ?? '-'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
            {game.hits ?? '-'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
            {game.homeRuns ?? '-'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden sm:table-cell">
            {game.rbi ?? '-'}
          </td>
        </>
      )}
    </tr>
  )
}
```

---

# CHICAGO BLACKHAWKS

## News - /chicago-blackhawks
File: `src/app/chicago-blackhawks/page.tsx`

```tsx
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TeamHubLayout } from '@/components/team'
import ARTourButton from '@/components/ar/ARTourButton'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { supabaseAdmin } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Chicago Blackhawks | News, Stats, Schedule & Roster | SportsMockery',
  description: 'Complete Chicago Blackhawks coverage including latest news, team stats, schedule, roster, and expert analysis.',
  openGraph: {
    title: 'Chicago Blackhawks Hub | Sports Mockery',
    description: 'Your #1 source for Blackhawks news, stats, schedule, and analysis',
    type: 'website',
  },
}

export const revalidate = 3600

async function getBlackhawksPosts(limit: number = 12) {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('sm_posts')
      .select(`
        id, title, slug, excerpt, featured_image, published_at,
        sm_categories!inner(slug, name)
      `)
      .eq('status', 'published')
      .eq('sm_categories.slug', 'chicago-blackhawks')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) return []
    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featured_image,
      categorySlug: post.sm_categories?.slug || 'chicago-blackhawks',
      publishedAt: post.published_at,
    }))
  } catch {
    return []
  }
}

export default async function BlackhawksHubPage() {
  const team = CHICAGO_TEAMS.blackhawks

  const [record, nextGame, posts] = await Promise.all([
    fetchTeamRecord('blackhawks'),
    fetchNextGame('blackhawks'),
    getBlackhawksPosts(12),
  ])

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="overview">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold border-b-2 pb-1" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', borderColor: team.primaryColor }}>
                Latest Blackhawks News
              </h2>
            </div>

            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.slice(0, 6).map((post, index) => (
                  <ArticleCard key={post.id} post={post} team={team} isLarge={index === 0} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-muted)' }}>No Blackhawks articles found. Check back soon!</p>
              </div>
            )}
          </section>

          {posts.length > 6 && (
            <section>
              <h2 className="text-lg font-bold mb-4 border-b-2 pb-1" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', borderColor: team.primaryColor }}>
                More Blackhawks Stories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.slice(6, 12).map((post) => <ArticleCard key={post.id} post={post} team={team} />)}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <SeasonSnapshotCard team={team} record={record} />
          <QuickLinksCard team={team} />
          <ARTourButton team="chicago-blackhawks" />
          <AskAIWidget team={team} />
          <FanChatWidget team={team} />
        </div>
      </div>
    </TeamHubLayout>
  )
}

function ArticleCard({ post, team, isLarge = false }: { post: any; team: typeof CHICAGO_TEAMS.blackhawks; isLarge?: boolean }) {
  const href = `/${post.categorySlug}/${post.slug}`

  if (isLarge) {
    return (
      <Link href={href} className="group block">
        <article className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
          <div className="flex flex-col md:flex-row">
            {post.featuredImage && (
              <div className="relative aspect-[16/9] md:aspect-auto md:w-1/2 overflow-hidden">
                <Image src={post.featuredImage} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" priority />
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: team.primaryColor }} />
              </div>
            )}
            <div className="p-4 md:p-5 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: team.primaryColor }}>Blackhawks</span>
              <h3 className="font-bold mt-1 line-clamp-3 group-hover:underline" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', fontSize: '18px', lineHeight: '1.3' }}>{post.title}</h3>
              {post.excerpt && <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{post.excerpt}</p>}
              <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={href} className="group block">
      <article className="rounded-xl overflow-hidden flex gap-4 p-3 transition-colors hover:bg-[var(--bg-hover)]" style={{ backgroundColor: 'var(--bg-surface)' }}>
        {post.featuredImage && (
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <Image src={post.featuredImage} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold line-clamp-2 group-hover:underline" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', fontSize: '14px', lineHeight: '1.4' }}>{post.title}</h3>
          <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function SeasonSnapshotCard({ team, record }: { team: typeof CHICAGO_TEAMS.blackhawks; record: { wins: number; losses: number; otLosses?: number } | null }) {
  const formatRecord = () => {
    if (!record) return '--'
    const ot = record.otLosses ? `-${record.otLosses}` : ''
    return `${record.wins}-${record.losses}${ot}`
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <div className="px-5 py-4" style={{ backgroundColor: team.primaryColor }}>
        <div className="flex items-center gap-3">
          <Image src={team.logo} alt={team.name} width={40} height={40} className="w-10 h-10 object-contain" unoptimized />
          <div>
            <h3 className="font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>Season Snapshot</h3>
            <p className="text-xs text-white/70">2025-26 Season</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="text-center pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="text-4xl font-bold" style={{ color: team.primaryColor }}>{formatRecord()}</div>
          <div className="text-sm text-[var(--text-muted)] mt-1">Record</div>
        </div>
      </div>
    </div>
  )
}

function QuickLinksCard({ team }: { team: typeof CHICAGO_TEAMS.blackhawks }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <h3 className="font-bold mb-4" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}>Quick Links</h3>
      <Link href="/chicago-blackhawks" className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]">
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>All Blackhawks News</span>
        <svg className="w-4 h-4 ml-auto" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </Link>
    </div>
  )
}

function AskAIWidget({ team }: { team: typeof CHICAGO_TEAMS.blackhawks }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${team.primaryColor}20` }}>
          <svg className="w-5 h-5" style={{ color: team.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </div>
        <div>
          <h3 className="font-bold" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}>Ask Hawks AI</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Get instant answers</p>
        </div>
      </div>
      <Link href={`/ask-ai?team=${team.slug}`} className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white" style={{ backgroundColor: team.primaryColor }}>Ask a Question</Link>
    </div>
  )
}

function FanChatWidget({ team }: { team: typeof CHICAGO_TEAMS.blackhawks }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${team.primaryColor}20` }}>
          <svg className="w-5 h-5" style={{ color: team.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
        </div>
        <div>
          <h3 className="font-bold" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}>Hawks Fan Chat</h3>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span>Fans online</span>
          </div>
        </div>
      </div>
      <Link href="/fan-chat?channel=blackhawks" className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white" style={{ backgroundColor: team.primaryColor }}>Join Hawks Chat</Link>
    </div>
  )
}
```

---

## Schedule - /chicago-blackhawks/schedule
File: `src/app/chicago-blackhawks/schedule/page.tsx`

```tsx
import { Metadata } from 'next'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getBlackhawksSchedule, type BlackhawksGame } from '@/lib/blackhawksData'

const BLACKHAWKS_LOGO = 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png'

export const metadata: Metadata = {
  title: 'Chicago Blackhawks Schedule 2024-25 | Game Dates & Results | SportsMockery',
  description: 'Complete Chicago Blackhawks 2024-25 schedule with game dates, times, opponents, scores, and results. View upcoming games and past results.',
}

export const revalidate = 3600

export default async function BlackhawksSchedulePage() {
  const team = CHICAGO_TEAMS.blackhawks

  const [schedule, record, nextGame] = await Promise.all([
    getBlackhawksSchedule(),
    fetchTeamRecord('blackhawks'),
    fetchNextGame('blackhawks'),
  ])

  const nextScheduledGame = schedule.find(g => g.status === 'scheduled')

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="schedule"
    >
      <div>
        {nextScheduledGame && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="px-2 py-1 bg-[#CF0A2C]/10 text-[#CF0A2C] text-xs font-semibold rounded">
                  UP NEXT
                </div>
                <div className="flex items-center gap-2">
                  {nextScheduledGame.opponentLogo && (
                    <Image
                      src={nextScheduledGame.opponentLogo}
                      alt={nextScheduledGame.opponent}
                      width={28}
                      height={28}
                      className="w-7 h-7"
                      unoptimized
                    />
                  )}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {nextScheduledGame.homeAway === 'home' ? 'vs' : '@'} {nextScheduledGame.opponentFullName || nextScheduledGame.opponent}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-[var(--text-primary)] font-medium">
                  {new Date(nextScheduledGame.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-[var(--text-muted)]">
                  {nextScheduledGame.time || 'TBD'} {nextScheduledGame.tv && `• ${nextScheduledGame.tv}`}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Full Schedule
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              {schedule.length} games
            </span>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {schedule.map((game) => (
              <GameRow key={game.gameId} game={game} />
            ))}
          </div>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function GameRow({ game }: { game: BlackhawksGame }) {
  const gameDate = new Date(game.date)
  const isPast = game.status === 'final'
  const isInProgress = game.status === 'in_progress'

  return (
    <div className={`p-4 hover:bg-[var(--bg-hover)] transition-colors ${isPast ? '' : 'bg-[var(--bg-tertiary)]/30'}`}>
      <div className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[100px_1fr_140px] gap-4 items-center">
        <div className="flex-shrink-0">
          <div className="font-medium text-[var(--text-primary)]">
            {gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {game.dayOfWeek}
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 flex-shrink-0">
            <Image
              src={BLACKHAWKS_LOGO}
              alt="Chicago Blackhawks"
              width={28}
              height={28}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>

          <span className="text-xs text-[var(--text-muted)] font-medium flex-shrink-0">
            {game.homeAway === 'home' ? 'vs' : '@'}
          </span>

          {game.opponentLogo && (
            <div className="w-7 h-7 flex-shrink-0">
              <Image
                src={game.opponentLogo}
                alt={game.opponent}
                width={28}
                height={28}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)] truncate block">
              {game.opponentFullName || game.opponent}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          {isPast ? (
            <div className="flex items-center gap-2 justify-end">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                game.result === 'W'
                  ? 'bg-green-500/10 text-green-500'
                  : game.result === 'OTL'
                    ? 'bg-yellow-500/10 text-yellow-500'
                    : 'bg-red-500/10 text-red-500'
              }`}>
                {game.result}{game.overtime ? ' (OT)' : ''}{game.shootout ? ' (SO)' : ''}
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.blackhawksScore}-{game.oppScore}
              </span>
            </div>
          ) : isInProgress ? (
            <div className="flex items-center gap-2 justify-end">
              <span className="px-2 py-0.5 bg-[#CF0A2C]/10 text-[#CF0A2C] rounded text-xs font-medium animate-pulse">
                LIVE
              </span>
              <span className="font-semibold text-[var(--text-primary)] text-sm">
                {game.blackhawksScore}-{game.oppScore}
              </span>
            </div>
          ) : (
            <div>
              <div className="font-medium text-[var(--text-primary)] text-sm">
                {game.time || 'TBD'}
              </div>
              {game.tv && (
                <div className="text-xs text-[var(--text-muted)]">
                  {game.tv}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Scores - /chicago-blackhawks/scores
File: `src/app/chicago-blackhawks/scores/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getBlackhawksRecentScores, type BlackhawksGame } from '@/lib/blackhawksData'

const BLACKHAWKS_LOGO = 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png'

export const metadata: Metadata = {
  title: 'Chicago Blackhawks Scores 2024-25 | Game Results | SportsMockery',
  description: 'Chicago Blackhawks game scores and results. View recent games, final scores, and game summaries.',
}

export const revalidate = 1800

export default async function BlackhawksScoresPage() {
  const team = CHICAGO_TEAMS.blackhawks

  const [scores, record, nextGame] = await Promise.all([
    getBlackhawksRecentScores(20),
    fetchTeamRecord('blackhawks'),
    fetchNextGame('blackhawks'),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="scores"
    >
      <div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Recent Games
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              Last {scores.length} games
            </span>
          </div>

          {scores.length === 0 ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              No completed games yet this season.
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {scores.map((game) => (
                <div key={game.gameId} className="p-4 hover:bg-[var(--bg-hover)] transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-[var(--text-muted)]">
                        {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>

                      <div className="flex items-center gap-3">
                        <Image
                          src={BLACKHAWKS_LOGO}
                          alt="Chicago Blackhawks"
                          width={32}
                          height={32}
                          className="w-8 h-8"
                          unoptimized
                        />
                        <span className="text-xs text-[var(--text-muted)]">
                          {game.homeAway === 'home' ? 'vs' : '@'}
                        </span>
                        {game.opponentLogo && (
                          <Image
                            src={game.opponentLogo}
                            alt={game.opponent}
                            width={32}
                            height={32}
                            className="w-8 h-8"
                            unoptimized
                          />
                        )}
                        <span className="font-medium text-[var(--text-primary)]">
                          {game.opponentFullName || game.opponent}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${
                        game.result === 'W'
                          ? 'bg-green-500/10 text-green-500'
                          : game.result === 'OTL'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-red-500/10 text-red-500'
                      }`}>
                        {game.result}{game.overtime ? ' (OT)' : ''}{game.shootout ? ' (SO)' : ''}
                      </span>
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        {game.blackhawksScore} - {game.oppScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/chicago-blackhawks/schedule"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#CF0A2C] hover:bg-[#a50823] text-white font-semibold rounded-xl transition-colors"
          >
            View Full Schedule
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}
```

---

## Stats - /chicago-blackhawks/stats
File: `src/app/chicago-blackhawks/stats/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getBlackhawksStats, type BlackhawksStats, type LeaderboardEntry, type BlackhawksPlayer } from '@/lib/blackhawksData'

export const metadata: Metadata = {
  title: 'Chicago Blackhawks Stats 2024-25 | Team & Player Statistics | SportsMockery',
  description: 'Chicago Blackhawks 2024-25 team and player statistics. View goals, assists, points, and goaltending leaderboards.',
}

export const revalidate = 3600

export default async function BlackhawksStatsPage() {
  const team = CHICAGO_TEAMS.blackhawks

  const [stats, record, nextGame] = await Promise.all([
    getBlackhawksStats(),
    fetchTeamRecord('blackhawks'),
    fetchNextGame('blackhawks'),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="stats"
    >
      <div>
        {/* Team Overview */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Team Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Record" value={stats.team.record} />
            <StatCard label="Points" value={stats.team.points.toString()} />
            <StatCard label="Goals For" value={stats.team.goalsFor.toString()} />
            <StatCard label="Goals Against" value={stats.team.goalsAgainst.toString()} />
            <StatCard label="GF/Game" value={stats.team.gfpg.toFixed(2)} />
            <StatCard label="GA/Game" value={stats.team.gapg.toFixed(2)} />
            <StatCard
              label="Goal Diff"
              value={`${(stats.team.goalsFor - stats.team.goalsAgainst) > 0 ? '+' : ''}${stats.team.goalsFor - stats.team.goalsAgainst}`}
              positive={(stats.team.goalsFor - stats.team.goalsAgainst) > 0}
              negative={(stats.team.goalsFor - stats.team.goalsAgainst) < 0}
            />
            {stats.team.ppPct !== null && (
              <StatCard label="Power Play %" value={`${stats.team.ppPct.toFixed(1)}%`} />
            )}
            {stats.team.pkPct !== null && (
              <StatCard label="Penalty Kill %" value={`${stats.team.pkPct.toFixed(1)}%`} />
            )}
          </div>
        </section>

        {/* Player Leaderboards */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Player Leaderboards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Points Leaders */}
            <LeaderboardCard
              title="Points Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              entries={stats.leaderboards.points}
              emptyText="No points stats available"
            />

            {/* Goals Leaders */}
            <LeaderboardCard
              title="Goals Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              entries={stats.leaderboards.goals}
              emptyText="No goals stats available"
            />

            {/* Assists Leaders */}
            <LeaderboardCard
              title="Assists Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              entries={stats.leaderboards.assists}
              emptyText="No assists stats available"
            />

            {/* Goaltending Leaders */}
            <LeaderboardCard
              title="Goaltending Leaders"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              entries={stats.leaderboards.goaltending}
              emptyText="No goaltending stats available"
              isGoaltending
            />
          </div>
        </section>

        {/* Links */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/chicago-blackhawks/roster"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[#CF0A2C] text-[var(--text-primary)] font-medium rounded-xl transition-colors"
          >
            View Full Roster
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function StatCard({
  label,
  value,
  positive,
  negative,
}: {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
}) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
      <div className="text-sm text-[var(--text-muted)] mb-1">{label}</div>
      <div className={`text-3xl font-bold ${
        positive ? 'text-green-500' : negative ? 'text-red-500' : 'text-[var(--text-primary)]'
      }`}>
        {value}
      </div>
    </div>
  )
}

function LeaderboardCard({
  title,
  icon,
  entries,
  emptyText,
  isGoaltending,
}: {
  title: string
  icon: React.ReactNode
  entries: LeaderboardEntry[]
  emptyText: string
  isGoaltending?: boolean
}) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-[#CF0A2C]/10 flex items-center justify-center text-[#CF0A2C]">
          {icon}
        </span>
        <h3 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {title}
        </h3>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="p-6 text-center text-[var(--text-muted)]">
          {emptyText}
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)]">
          {entries.map((entry, index) => (
            <LeaderboardRow key={entry.player?.playerId || index} entry={entry} rank={index + 1} isGoaltending={isGoaltending} />
          ))}
        </div>
      )}
    </div>
  )
}

function LeaderboardRow({ entry, rank, isGoaltending }: { entry: LeaderboardEntry; rank: number; isGoaltending?: boolean }) {
  if (!entry.player) return null

  return (
    <Link
      href={`/chicago-blackhawks/players/${entry.player.slug}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-hover)] transition-colors group"
    >
      {/* Rank */}
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
        rank === 1
          ? 'bg-[#CF0A2C] text-white'
          : rank === 2
            ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            : 'text-[var(--text-muted)]'
      }`}>
        {rank}
      </span>

      {/* Player Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {entry.player.headshotUrl ? (
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={entry.player.headshotUrl}
              alt={entry.player.fullName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[var(--text-muted)]">
              {entry.player.jerseyNumber}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <div className="font-medium text-[var(--text-primary)] group-hover:text-[#CF0A2C] transition-colors truncate">
            {entry.player.fullName}
          </div>
          <div className="text-xs text-[var(--text-muted)]">
            {entry.player.position} #{entry.player.jerseyNumber}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-right flex-shrink-0">
        <div>
          <div className="text-lg font-bold text-[var(--text-primary)]">
            {isGoaltending && entry.primaryLabel === 'SV%'
              ? `.${Math.round(entry.primaryStat * 1000)}`
              : entry.primaryStat}
          </div>
          <div className="text-xs text-[var(--text-muted)]">{entry.primaryLabel}</div>
        </div>
        {entry.secondaryStat !== null && (
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-[var(--text-secondary)]">
              {isGoaltending && entry.secondaryLabel === 'GAA'
                ? entry.secondaryStat.toFixed(2)
                : entry.secondaryStat}
            </div>
            <div className="text-xs text-[var(--text-muted)]">{entry.secondaryLabel}</div>
          </div>
        )}
      </div>

      {/* Arrow */}
      <svg className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[#CF0A2C] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
```

---

## Roster - /chicago-blackhawks/roster
File: `src/app/chicago-blackhawks/roster/page.tsx`

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { getBlackhawksRosterGrouped, POSITION_GROUP_NAMES, type BlackhawksPlayer, type PositionGroup } from '@/lib/blackhawksData'

export const metadata: Metadata = {
  title: 'Chicago Blackhawks Roster 2024-25 | SportsMockery',
  description: 'Complete 2024-25 Chicago Blackhawks roster with player profiles, positions, measurements, and stats.',
}

export const revalidate = 3600

const POSITION_ORDER: PositionGroup[] = ['forwards', 'defensemen', 'goalies']

export default async function BlackhawksRosterPage() {
  const team = CHICAGO_TEAMS.blackhawks

  const [roster, record, nextGame] = await Promise.all([
    getBlackhawksRosterGrouped(),
    fetchTeamRecord('blackhawks'),
    fetchNextGame('blackhawks'),
  ])

  const allPlayers = Object.values(roster).flat()

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="roster"
    >
      {/* Summary Bar */}
      <div
        className="rounded-xl p-4 mb-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total: </span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{allPlayers.length} players</span>
          </div>
          {POSITION_ORDER.map(group => {
            const count = roster[group]?.length || 0
            if (count === 0) return null
            return (
              <div key={group}>
                <span style={{ color: 'var(--text-muted)' }}>{POSITION_GROUP_NAMES[group]}: </span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {POSITION_ORDER.map(group => {
          const players = roster[group]
          if (!players || players.length === 0) return null

          return (
            <div key={group} className={`bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden ${group === 'forwards' ? 'lg:col-span-2' : ''}`}>
              <div className="px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] flex items-center justify-between">
                <h2 className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {POSITION_GROUP_NAMES[group]}
                </h2>
                <span className="text-sm text-[var(--text-muted)]">
                  {players.length} player{players.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                      <th className="px-4 py-2 w-12">#</th>
                      <th className="px-4 py-2">Player</th>
                      <th className="px-4 py-2 hidden sm:table-cell">Size</th>
                      <th className="px-4 py-2 hidden md:table-cell">Birthplace</th>
                      <th className="px-4 py-2 hidden lg:table-cell">Exp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr
                        key={player.playerId}
                        className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#CF0A2C] text-white text-sm font-bold">
                            {player.jerseyNumber ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/chicago-blackhawks/players/${player.slug}`}
                            className="flex items-center gap-3 group"
                          >
                            {player.headshotUrl ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[var(--border-subtle)]">
                                <Image
                                  src={player.headshotUrl}
                                  alt={player.fullName}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-[var(--text-primary)] group-hover:text-[#CF0A2C] transition-colors">
                                {player.fullName}
                              </span>
                              <div className="text-xs text-[var(--text-muted)]">
                                {player.position}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden sm:table-cell">
                          {player.height && player.weight
                            ? `${player.height} · ${player.weight} lbs`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">
                          {player.birthCountry || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">
                          {player.experience || 'R'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </TeamHubLayout>
  )
}
```

---

## Players - /chicago-blackhawks/players/[slug]
File: `src/app/chicago-blackhawks/players/[slug]/page.tsx`

```tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPlayerProfile, type PlayerProfile, type PlayerGameLogEntry } from '@/lib/blackhawksData'

interface PlayerPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { slug } = await params
  const profile = await getPlayerProfile(slug)

  if (!profile) {
    return { title: 'Player Not Found | SportsMockery' }
  }

  return {
    title: `${profile.player.fullName} Stats & Profile | Chicago Blackhawks ${profile.player.position} | SportsMockery`,
    description: `${profile.player.fullName} statistics, game log, and player profile. #${profile.player.jerseyNumber} ${profile.player.position} for the Chicago Blackhawks.`,
    openGraph: {
      title: `${profile.player.fullName} | Chicago Blackhawks`,
      description: `${profile.player.position} #${profile.player.jerseyNumber} - View stats and profile`,
      images: profile.player.headshotUrl ? [profile.player.headshotUrl] : [],
    },
  }
}

export const revalidate = 3600

export default async function BlackhawksPlayerPage({ params }: PlayerPageProps) {
  const { slug } = await params
  const profile = await getPlayerProfile(slug)

  if (!profile) {
    notFound()
  }

  const isGoalie = profile.player.positionGroup === 'goalies'

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #CF0A2C 0%, #CF0A2C 70%, #000000 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/chicago-blackhawks" className="hover:text-white">Chicago Blackhawks</Link>
            <span>/</span>
            <Link href="/chicago-blackhawks/roster" className="hover:text-white">Roster</Link>
            <span>/</span>
            <span className="text-white">{profile.player.fullName}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Headshot */}
            <div className="flex-shrink-0">
              {profile.player.headshotUrl ? (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl">
                  <Image
                    src={profile.player.headshotUrl}
                    alt={profile.player.fullName}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                    priority
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-white/10 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Player Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-lg font-bold">
                  #{profile.player.jerseyNumber}
                </span>
                <span className="px-3 py-1 bg-black rounded-lg text-sm font-semibold">
                  {profile.player.position}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {profile.player.fullName}
              </h1>

              <p className="text-white/70 text-lg mb-4">
                Chicago Blackhawks
              </p>

              {/* Bio Line */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/80">
                {profile.player.age && (
                  <div>
                    <span className="text-white/50 text-sm">Age: </span>
                    <span>{profile.player.age}</span>
                  </div>
                )}
                {profile.player.height && (
                  <div>
                    <span className="text-white/50 text-sm">Height: </span>
                    <span>{profile.player.height}</span>
                  </div>
                )}
                {profile.player.weight && (
                  <div>
                    <span className="text-white/50 text-sm">Weight: </span>
                    <span>{profile.player.weight} lbs</span>
                  </div>
                )}
                {profile.player.experience && (
                  <div>
                    <span className="text-white/50 text-sm">Experience: </span>
                    <span>{profile.player.experience}</span>
                  </div>
                )}
                {profile.player.birthCountry && (
                  <div>
                    <span className="text-white/50 text-sm">From: </span>
                    <span>{profile.player.birthCountry}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Season Snapshot */}
            {profile.currentSeason && (
              <div className="w-full md:w-auto md:min-w-[280px]">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                  <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-4">
                    2024-25 Season
                  </h3>
                  {isGoalie ? (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.savePct ? `.${Math.round(profile.currentSeason.savePct * 1000)}` : '—'}
                        </div>
                        <div className="text-xs text-white/60 uppercase">SV%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.gaa?.toFixed(2) || '—'}
                        </div>
                        <div className="text-xs text-white/60 uppercase">GAA</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {profile.currentSeason.gamesPlayed || '—'}
                        </div>
                        <div className="text-xs text-white/60 uppercase">GP</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{profile.currentSeason.goals ?? '—'}</div>
                        <div className="text-xs text-white/60 uppercase">Goals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{profile.currentSeason.assists ?? '—'}</div>
                        <div className="text-xs text-white/60 uppercase">Assists</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{profile.currentSeason.points ?? '—'}</div>
                        <div className="text-xs text-white/60 uppercase">Points</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Season Stats */}
            {profile.currentSeason && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  2024-25 Season Stats
                </h2>
                {isGoalie ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="Games" value={profile.currentSeason.gamesPlayed?.toString() || '—'} />
                    <StatCard label="Save %" value={profile.currentSeason.savePct ? `.${Math.round(profile.currentSeason.savePct * 1000)}` : '—'} />
                    <StatCard label="GAA" value={profile.currentSeason.gaa?.toFixed(2) || '—'} />
                    <StatCard label="Saves" value={profile.currentSeason.saves?.toString() || '—'} />
                    <StatCard label="Goals Against" value={profile.currentSeason.goalsAgainst?.toString() || '—'} />
                    <StatCard label="Shutouts" value={profile.currentSeason.shutouts?.toString() || '—'} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="Games" value={profile.currentSeason.gamesPlayed?.toString() || '—'} />
                    <StatCard label="Goals" value={profile.currentSeason.goals?.toString() || '—'} />
                    <StatCard label="Assists" value={profile.currentSeason.assists?.toString() || '—'} />
                    <StatCard label="Points" value={profile.currentSeason.points?.toString() || '—'} />
                    <StatCard
                      label="+/-"
                      value={profile.currentSeason.plusMinus !== null ? `${profile.currentSeason.plusMinus > 0 ? '+' : ''}${profile.currentSeason.plusMinus}` : '—'}
                      positive={profile.currentSeason.plusMinus !== null && profile.currentSeason.plusMinus > 0}
                      negative={profile.currentSeason.plusMinus !== null && profile.currentSeason.plusMinus < 0}
                    />
                    <StatCard label="PIM" value={profile.currentSeason.pim?.toString() || '—'} />
                    <StatCard label="Shots" value={profile.currentSeason.shots?.toString() || '—'} />
                    <StatCard label="Shot %" value={profile.currentSeason.shotPct ? `${profile.currentSeason.shotPct.toFixed(1)}%` : '—'} />
                  </div>
                )}
              </section>
            )}

            {/* Game Log */}
            {profile.gameLog.length > 0 && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-[var(--border-subtle)]">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Recent Games
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Opp</th>
                        <th className="px-4 py-3">Result</th>
                        {isGoalie ? (
                          <>
                            <th className="px-4 py-3">SV</th>
                            <th className="px-4 py-3">GA</th>
                            <th className="px-4 py-3 hidden sm:table-cell">TOI</th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-3">G</th>
                            <th className="px-4 py-3">A</th>
                            <th className="px-4 py-3">PTS</th>
                            <th className="px-4 py-3 hidden sm:table-cell">+/-</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {profile.gameLog.slice(0, 10).map((game) => (
                        <GameLogRow key={game.gameId} game={game} isGoalie={isGoalie} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/chicago-blackhawks/roster"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#CF0A2C]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Full Blackhawks Roster
                </Link>
                <Link
                  href="/chicago-blackhawks/stats"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#CF0A2C]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                  Team Stats
                </Link>
                <Link
                  href="/chicago-blackhawks/schedule"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#CF0A2C]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value, positive, negative }: { label: string; value: string; positive?: boolean; negative?: boolean }) {
  return (
    <div className="bg-[var(--bg-tertiary)] rounded-xl p-4 text-center">
      <div className={`text-2xl font-bold ${positive ? 'text-green-500' : negative ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>{value}</div>
      <div className="text-xs text-[var(--text-muted)] uppercase">{label}</div>
    </div>
  )
}

function GameLogRow({ game, isGoalie }: { game: PlayerGameLogEntry; isGoalie: boolean }) {
  return (
    <tr className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors">
      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
        {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </td>
      <td className="px-4 py-3 text-sm text-[var(--text-primary)] font-medium">
        {game.isHome ? 'vs' : '@'} {game.opponent}
      </td>
      <td className="px-4 py-3">
        {game.result && (
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            game.result === 'W'
              ? 'bg-green-500/10 text-green-500'
              : game.result === 'OTL'
                ? 'bg-yellow-500/10 text-yellow-500'
                : 'bg-red-500/10 text-red-500'
          }`}>
            {game.result}
          </span>
        )}
      </td>
      {isGoalie ? (
        <>
          <td className="px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">
            {game.saves ?? '—'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
            {game.goalsAgainst ?? '—'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden sm:table-cell">
            {game.toi ?? '—'}
          </td>
        </>
      ) : (
        <>
          <td className="px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">
            {game.goals ?? '—'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
            {game.assists ?? '—'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">
            {game.points ?? '—'}
          </td>
          <td className="px-4 py-3 text-sm text-[var(--text-muted)] hidden sm:table-cell">
            {game.plusMinus !== null ? (game.plusMinus > 0 ? `+${game.plusMinus}` : game.plusMinus) : '—'}
          </td>
        </>
      )}
    </tr>
  )
}
```

---
