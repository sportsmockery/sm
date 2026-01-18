import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBearsStats, type BearsStats, type LeaderboardEntry, type BearsPlayer } from '@/lib/bearsData'

export const metadata: Metadata = {
  title: 'Chicago Bears Stats 2025 | Team & Player Statistics | SportsMockery',
  description: 'Chicago Bears 2025 team and player statistics. View passing, rushing, receiving, and defensive leaderboards plus team stats.',
}

export const revalidate = 3600

export default async function BearsStatsPage() {
  // 2025-26 NFL season is stored as season = 2025
  const currentSeason = 2025
  const stats = await getBearsStats(currentSeason)

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B162A] to-[#0B162A]/90 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/chicago-bears" className="hover:text-white">Chicago Bears</Link>
            <span>/</span>
            <span className="text-white">Stats</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Chicago Bears Stats {currentSeason}
          </h1>
          <p className="text-white/70 mt-2">
            Team and player statistics for the {currentSeason} season.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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
    </main>
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
