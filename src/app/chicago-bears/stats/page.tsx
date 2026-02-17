import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsStats, getBearsSeparatedRecord, type BearsStats, type LeaderboardEntry, type BearsPlayer } from '@/lib/bearsData'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'

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
  const [stats, separatedRecord, nextGame] = await Promise.all([
    getBearsStats(currentSeason),
    getBearsSeparatedRecord(currentSeason),
    fetchNextGame('bears'),
  ])

  // Build record object for TeamHubLayout (regular season only in main display)
  const record = {
    wins: separatedRecord.regularSeason.wins,
    losses: separatedRecord.regularSeason.losses,
    ties: separatedRecord.regularSeason.ties > 0 ? separatedRecord.regularSeason.ties : undefined,
    postseason: (separatedRecord.postseason.wins > 0 || separatedRecord.postseason.losses > 0)
      ? separatedRecord.postseason
      : undefined,
    divisionRank: separatedRecord.divisionRank || undefined,
  }

  // Format record string for display (regular season only)
  const recordString = `${separatedRecord.regularSeason.wins}-${separatedRecord.regularSeason.losses}${separatedRecord.regularSeason.ties > 0 ? `-${separatedRecord.regularSeason.ties}` : ''}`

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
        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--sm-text)',
              marginBottom: 24,
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            Team Overview — Regular Season
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TeamStatCard
              label="Record"
              value={recordString}
              sublabel={separatedRecord.divisionRank || 'Regular Season'}
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
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--sm-text)',
              marginBottom: 24,
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
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

        {/* Postseason Section (if applicable) */}
        {(separatedRecord.postseason.wins > 0 || separatedRecord.postseason.losses > 0) && (
          <section
            style={{
              marginTop: 40,
              padding: 24,
              borderRadius: 'var(--sm-radius-xl)',
              backgroundColor: 'rgba(200, 56, 3, 0.05)',
              border: '1px solid rgba(200, 56, 3, 0.2)',
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#C83803',
                marginBottom: 16,
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Postseason
            </h2>
            <div className="flex flex-wrap gap-6">
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--sm-text)' }}>
                  {separatedRecord.postseason.wins}-{separatedRecord.postseason.losses}
                </div>
                <div style={{ fontSize: 14, color: 'var(--sm-text-muted)' }}>Playoff Record</div>
              </div>
            </div>
          </section>
        )}

        {/* Links */}
        <div style={{ marginTop: 40, paddingBottom: 48, display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          <Link
            href="/chicago-bears/roster"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              backgroundColor: 'var(--sm-card)',
              border: '1px solid var(--sm-border)',
              borderRadius: '100px',
              color: 'var(--sm-text)',
              fontWeight: 500,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            View Full Roster
          </Link>
          <Link
            href="/chicago-bears/players"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              backgroundColor: '#C83803',
              border: '1px solid #C83803',
              borderRadius: '100px',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
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
    <div
      style={{
        backgroundColor: 'var(--sm-card)',
        border: '1px solid var(--sm-border)',
        borderRadius: 'var(--sm-radius-lg)',
        padding: '20px',
      }}
    >
      <div style={{ fontSize: 14, color: 'var(--sm-text-muted)', marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: positive ? '#10b981' : negative ? '#ef4444' : 'var(--sm-text)',
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {value}
      </div>
      {sublabel && (
        <div style={{ fontSize: 14, color: 'var(--sm-text-muted)', marginTop: 4 }}>{sublabel}</div>
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
    <div
      style={{
        backgroundColor: 'var(--sm-card)',
        border: '1px solid var(--sm-border)',
        borderRadius: 'var(--sm-radius-xl)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--sm-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: 'rgba(200, 56, 3, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#C83803',
          }}
        >
          {icon}
        </span>
        <h3
          style={{
            fontWeight: 700,
            color: 'var(--sm-text)',
            fontFamily: "'Montserrat', sans-serif",
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--sm-text-muted)' }}>
          {emptyText}
        </div>
      ) : (
        <div>
          {entries.map((entry, index) => (
            <LeaderboardRow key={entry.player?.playerId || index} entry={entry} rank={index + 1} isLast={index === entries.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function LeaderboardRow({ entry, rank, isLast }: { entry: LeaderboardEntry; rank: number; isLast?: boolean }) {
  if (!entry.player) return null

  return (
    <Link
      href={`/chicago-bears/players/${entry.player.slug}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--sm-card-hover)] transition-colors group"
      style={{
        borderBottom: isLast ? 'none' : '1px solid var(--sm-border)',
        textDecoration: 'none',
      }}
    >
      {/* Rank */}
      {rank === 1 ? (
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            backgroundColor: '#C83803',
            color: '#fff',
          }}
        >
          {rank}
        </span>
      ) : rank === 2 ? (
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            backgroundColor: 'var(--sm-surface)',
            color: 'var(--sm-text)',
          }}
        >
          {rank}
        </span>
      ) : (
        <span
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--sm-text-muted)',
          }}
        >
          {rank}
        </span>
      )}

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
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--sm-surface)' }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--sm-text-muted)' }}>
              {entry.player.jerseyNumber}
            </span>
          </div>
        )}
        <div className="min-w-0">
          <div
            className="font-medium group-hover:text-[#C83803] transition-colors truncate"
            style={{ color: 'var(--sm-text)' }}
          >
            {entry.player.fullName}
          </div>
          <div style={{ fontSize: 12, color: 'var(--sm-text-muted)' }}>
            {entry.player.position} #{entry.player.jerseyNumber}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-right flex-shrink-0">
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)' }}>
            {entry.primaryStat.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: 'var(--sm-text-muted)' }}>{entry.primaryLabel}</div>
        </div>
        {entry.secondaryStat !== null && (
          <div className="hidden sm:block">
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--sm-text-muted)' }}>
              {entry.secondaryStat}
            </div>
            <div style={{ fontSize: 12, color: 'var(--sm-text-muted)' }}>{entry.secondaryLabel}</div>
          </div>
        )}
      </div>

      {/* Arrow */}
      <svg
        className="w-4 h-4 group-hover:text-[#C83803] transition-colors"
        style={{ color: 'var(--sm-text-muted)' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
