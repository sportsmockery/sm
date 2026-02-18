import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getWhiteSoxStats, getWhiteSoxRecord, type WhiteSoxStats, type LeaderboardEntry, type WhiteSoxPlayer } from '@/lib/whitesoxData'

export const metadata: Metadata = {
  title: 'Chicago White Sox Stats 2025 | Team & Player Statistics | SportsMockery',
  description: 'Chicago White Sox 2025 team and player statistics. View batting averages, home runs, RBIs, and pitching stats.',
}

export const revalidate = 3600

export default async function WhiteSoxStatsPage() {
  const team = CHICAGO_TEAMS.whitesox

  const [stats, soxRecord, nextGame] = await Promise.all([
    getWhiteSoxStats(),
    getWhiteSoxRecord(),
    fetchNextGame('whitesox'),
  ])

  const record = {
    wins: soxRecord.wins,
    losses: soxRecord.losses,
  }

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="stats"
    >
      <div>
        {/* Team Overview */}
        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--sm-text)',
              marginBottom: 24,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
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
        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--sm-text)',
              marginBottom: 24,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
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
        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--sm-text)',
              marginBottom: 24,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          <Link
            href="/chicago-white-sox/roster"
            className="btn btn-md btn-secondary"
            style={{ display: 'inline-flex', textDecoration: 'none' }}
          >
            View Full Roster
          </Link>
          <Link
            href="/chicago-white-sox/players"
            className="btn btn-md btn-primary"
            style={{ display: 'inline-flex', textDecoration: 'none' }}
          >
            Search All Players
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
    <div className="glass-card glass-card-sm glass-card-static">
      <div style={{ fontSize: 14, color: 'var(--sm-text-muted)', marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: positive ? 'var(--sm-success)' : negative ? 'var(--sm-error)' : 'var(--sm-text)',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
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
    <div className="glass-card glass-card-static" style={{ overflow: 'hidden', padding: 0 }}>
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
            background: 'var(--sm-gradient-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--sm-red)',
          }}
        >
          {icon}
        </span>
        <h3
          style={{
            fontWeight: 700,
            color: 'var(--sm-text)',
            fontFamily: "'Space Grotesk', sans-serif",
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
      href={`/chicago-white-sox/players/${entry.player.slug}`}
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
            backgroundColor: 'var(--sm-red)',
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
              unoptimized
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
            className="font-medium group-hover:text-[var(--sm-red-light)] transition-colors truncate"
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
            {typeof entry.primaryStat === 'number'
              ? (entry.primaryLabel === 'AVG' || entry.primaryLabel === 'ERA'
                  ? entry.primaryStat.toFixed(3)
                  : entry.primaryStat)
              : entry.primaryStat}
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
        className="w-4 h-4 group-hover:text-[var(--sm-red-light)] transition-colors"
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
