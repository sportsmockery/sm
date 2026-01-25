import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPlayerProfile, getSimilarPlayers, getBearsPlayers, type PlayerProfile, type BearsPlayer, type PlayerGameLogEntry } from '@/lib/bearsData'
import ScrollToTop from './ScrollToTop'
import { PlayerSwitcher } from '@/components/players'

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
  const [profile, allPlayers] = await Promise.all([
    getPlayerProfile(slug),
    getBearsPlayers(),
  ])

  if (!profile) {
    notFound()
  }

  const { player, currentSeason, gameLog } = profile
  const similarPlayers = await getSimilarPlayers(player, 3)

  // Prepare players for switcher
  const switcherPlayers = allPlayers.map(p => ({
    slug: p.slug,
    fullName: p.fullName,
    jerseyNumber: p.jerseyNumber,
    position: p.position,
    headshotUrl: p.headshotUrl,
  }))

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Scroll to top on page load */}
      <ScrollToTop />

      {/* Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B162A 0%, #0B162A 70%, #C83200 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Breadcrumb & Player Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/60">
              <Link href="/" className="hover:text-white py-1">Home</Link>
              <span>/</span>
              <Link href="/chicago-bears" className="hover:text-white py-1">Bears</Link>
              <span>/</span>
              <Link href="/chicago-bears/players" className="hover:text-white py-1">Players</Link>
              <span>/</span>
              <span className="text-white py-1">{player.fullName}</span>
            </nav>
            <PlayerSwitcher
              players={switcherPlayers}
              currentSlug={slug}
              teamPath="/chicago-bears/players"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 sm:gap-8 items-start">
            {/* Left: Headshot */}
            <div className="flex-shrink-0">
              {player.headshotUrl ? (
                <div className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-[#C83200]/30 shadow-2xl">
                  <Image
                    src={player.headshotUrl}
                    alt={player.fullName}
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                    style={{ maxWidth: '100%' }}
                    priority
                  />
                </div>
              ) : (
                <div className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-2xl bg-white/10 flex items-center justify-center">
                  <svg className="w-14 h-14 sm:w-20 sm:h-20 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Center: Player Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="px-2 sm:px-3 py-1 bg-white/20 rounded-lg text-base sm:text-lg font-bold">
                  #{player.jerseyNumber}
                </span>
                <span className="px-2 sm:px-3 py-1 bg-[#C83200] rounded-lg text-xs sm:text-sm font-semibold">
                  {player.position}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {player.fullName}
              </h1>

              <p className="text-white/70 text-sm sm:text-lg mb-3 sm:mb-4">
                Chicago Bears • {player.side === 'OFF' ? 'Offense' : player.side === 'DEF' ? 'Defense' : 'Special Teams'}
              </p>

              {/* Bio Line */}
              <div className="flex flex-wrap gap-x-3 sm:gap-x-6 gap-y-1 sm:gap-y-2 text-white/80 text-sm sm:text-base">
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Column: Stats & Game Log */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-8">
            {/* Season Overview */}
            {currentSeason && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  2025 Season Overview
                </h2>
                <SeasonOverviewCards player={player} stats={currentSeason} />
              </section>
            )}

            {/* Strength Profile */}
            {currentSeason && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-4 sm:mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Strength Profile
                </h2>
                <StrengthProfileBars player={player} stats={currentSeason} />
              </section>
            )}

            {/* Game Log */}
            {gameLog.length > 0 && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-[var(--border-subtle)]">
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Game Log 2025
                  </h2>
                </div>
                <GameLogTable player={player} gameLog={gameLog} />
              </section>
            )}
          </div>

          {/* Right Column: Similar Players & Links */}
          <div className="space-y-4 sm:space-y-6">
            {/* Similar Bears */}
            {similarPlayers.length > 0 && (
              <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-3 sm:mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Similar Bears
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {similarPlayers.map(p => (
                    <Link
                      key={p.playerId}
                      href={`/chicago-bears/players/${p.slug}`}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors group min-h-[44px]"
                    >
                      {p.headshotUrl ? (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={p.headshotUrl}
                            alt={p.fullName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                            style={{ maxWidth: '100%' }}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                          <span className="text-base sm:text-lg font-bold text-[var(--text-muted)]">
                            {p.jerseyNumber}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base text-[var(--text-primary)] group-hover:text-[#C83200] transition-colors truncate">
                          {p.fullName}
                        </div>
                        <div className="text-xs sm:text-sm text-[var(--text-muted)]">
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
            <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-3 sm:mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Quick Links
              </h3>
              <div className="space-y-1 sm:space-y-2">
                <Link
                  href="/chicago-bears/players"
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#C83200] min-h-[44px] text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  All Player Profiles
                </Link>
                <Link
                  href="/chicago-bears/roster"
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#C83200] min-h-[44px] text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Full Bears Roster
                </Link>
                <Link
                  href="/chicago-bears/stats"
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-secondary)] hover:text-[#C83200] min-h-[44px] text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
