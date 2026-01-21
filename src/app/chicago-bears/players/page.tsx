import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPlayerProfile, getBearsPlayers, getBearsStats, type BearsPlayer, type PlayerProfile, type PlayerSeasonStats, type PlayerGameLogEntry } from '@/lib/bearsData'

// Type for player stats map
type PlayerStatsMap = Map<string, { primaryStat: number; primaryLabel: string; secondaryStat: number | null; secondaryLabel: string | null }>

export const metadata: Metadata = {
  title: 'Chicago Bears Players | Caleb Williams & Full Roster Stats | SportsMockery',
  description: 'Explore Chicago Bears player profiles, stats, and game logs. Featuring Caleb Williams and the complete 2025 roster.',
  openGraph: {
    title: 'Chicago Bears Players | SportsMockery',
    description: 'View stats, profiles, and game logs for the entire Bears roster',
  },
}

export const revalidate = 3600 // Revalidate every hour

// Default player slug - Caleb Williams
const DEFAULT_PLAYER_SLUG = 'caleb-williams'

export default async function BearsPlayersPage() {
  // Fetch all players, Caleb Williams' profile, and team stats in parallel
  const [players, defaultProfile, bearsStats] = await Promise.all([
    getBearsPlayers(),
    getPlayerProfile(DEFAULT_PLAYER_SLUG),
    getBearsStats(),
  ])

  // If Caleb Williams not found, use the first QB or first player
  let featuredProfile = defaultProfile
  if (!featuredProfile) {
    const qb = players.find(p => p.position === 'QB')
    const fallbackSlug = qb?.slug || players[0]?.slug
    if (fallbackSlug) {
      featuredProfile = await getPlayerProfile(fallbackSlug)
    }
  }

  // Build a stats map from leaderboards for quick lookup
  const playerStatsMap: PlayerStatsMap = new Map()
  const { leaderboards } = bearsStats

  // Add passing leaders
  leaderboards.passing.forEach(entry => {
    playerStatsMap.set(entry.player.slug, {
      primaryStat: entry.primaryStat,
      primaryLabel: 'YDS',
      secondaryStat: entry.secondaryStat,
      secondaryLabel: 'TD',
    })
  })

  // Add rushing leaders
  leaderboards.rushing.forEach(entry => {
    if (!playerStatsMap.has(entry.player.slug)) {
      playerStatsMap.set(entry.player.slug, {
        primaryStat: entry.primaryStat,
        primaryLabel: 'YDS',
        secondaryStat: entry.secondaryStat,
        secondaryLabel: 'TD',
      })
    }
  })

  // Add receiving leaders
  leaderboards.receiving.forEach(entry => {
    if (!playerStatsMap.has(entry.player.slug)) {
      playerStatsMap.set(entry.player.slug, {
        primaryStat: entry.primaryStat,
        primaryLabel: 'YDS',
        secondaryStat: entry.secondaryStat,
        secondaryLabel: 'TD',
      })
    }
  })

  // Add defensive leaders
  leaderboards.defense.forEach(entry => {
    if (!playerStatsMap.has(entry.player.slug)) {
      playerStatsMap.set(entry.player.slug, {
        primaryStat: entry.primaryStat,
        primaryLabel: 'TKL',
        secondaryStat: entry.secondaryStat,
        secondaryLabel: 'SACK',
      })
    }
  })

  // Group other players for the selector (excluding the featured player)
  const otherPlayers = players.filter(p => p.slug !== featuredProfile?.player.slug)

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero Section with Featured Player */}
      {featuredProfile && (
        <FeaturedPlayerHero profile={featuredProfile} />
      )}

      {/* Player Stats Section */}
      {featuredProfile && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <FeaturedPlayerStats profile={featuredProfile} />
        </div>
      )}

      {/* Player Selection Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Select Another Player
          </h2>
          <p className="text-[var(--text-muted)] mt-1">
            Click on a player card to view their full profile and stats
          </p>
        </div>

        {/* Player Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {otherPlayers.map((player) => (
            <PlayerCard key={player.playerId} player={player} stats={playerStatsMap.get(player.slug)} />
          ))}
        </div>
      </div>
    </main>
  )
}

// Featured Player Hero Component
function FeaturedPlayerHero({ profile }: { profile: PlayerProfile }) {
  const { player, currentSeason } = profile

  return (
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
          <span className="text-white">Players</span>
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

            {/* View Full Profile Link */}
            <Link
              href={`/chicago-bears/players/${player.slug}`}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors"
            >
              View Full Profile & Game Log
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
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
  )
}

// Featured Player Stats Section
function FeaturedPlayerStats({ profile }: { profile: PlayerProfile }) {
  const { player, currentSeason, gameLog } = profile

  if (!currentSeason) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Season Overview */}
      <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          2025 Season Overview
        </h2>
        <SeasonOverviewCards player={player} stats={currentSeason} />
      </section>

      {/* Recent Games */}
      {gameLog.length > 0 && (
        <section className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Recent Games
            </h2>
            <Link
              href={`/chicago-bears/players/${player.slug}`}
              className="text-sm text-[#C83200] hover:underline"
            >
              View All
            </Link>
          </div>
          <RecentGamesCompact player={player} gameLog={gameLog.slice(0, 3)} />
        </section>
      )}
    </div>
  )
}

// Season Snapshot Stats (in hero)
function SeasonSnapshotStats({ player, stats }: { player: BearsPlayer; stats: PlayerSeasonStats }) {
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
function SeasonOverviewCards({ player, stats }: { player: BearsPlayer; stats: PlayerSeasonStats }) {
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
    if (['RB', 'FB'].includes(player.position)) {
      return [
        { title: 'Rushing', stats: [
          { label: 'Yards', value: stats.rushYards ?? 0 },
          { label: 'TD', value: stats.rushTD ?? 0 },
          { label: 'Att', value: stats.rushAttempts ?? 0 },
          { label: 'YPC', value: stats.yardsPerCarry ?? '—' },
        ]},
        { title: 'Receiving', stats: [
          { label: 'Rec', value: stats.receptions ?? 0 },
          { label: 'Yards', value: stats.recYards ?? 0 },
          { label: 'TD', value: stats.recTD ?? 0 },
        ]},
      ]
    }
    if (['WR', 'TE'].includes(player.position)) {
      return [
        { title: 'Receiving', stats: [
          { label: 'Rec', value: stats.receptions ?? 0 },
          { label: 'Yards', value: stats.recYards ?? 0 },
          { label: 'TD', value: stats.recTD ?? 0 },
          { label: 'Targets', value: stats.targets ?? 0 },
        ]},
        { title: 'Efficiency', stats: [
          { label: 'Y/R', value: stats.yardsPerReception ?? '—' },
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

// Recent Games Compact View
function RecentGamesCompact({ player, gameLog }: { player: BearsPlayer; gameLog: PlayerGameLogEntry[] }) {
  const getStatDisplay = (game: PlayerGameLogEntry) => {
    if (player.position === 'QB') {
      return `${game.passCompletions ?? 0}/${game.passAttempts ?? 0}, ${game.passYards ?? 0} YDS, ${game.passTD ?? 0} TD`
    }
    if (['RB', 'FB'].includes(player.position)) {
      return `${game.rushAttempts ?? 0} ATT, ${game.rushYards ?? 0} YDS, ${game.rushTD ?? 0} TD`
    }
    if (['WR', 'TE'].includes(player.position)) {
      return `${game.receptions ?? 0} REC, ${game.recYards ?? 0} YDS, ${game.recTD ?? 0} TD`
    }
    return `${game.tackles ?? 0} TKL, ${game.sacks ?? 0} SACK`
  }

  return (
    <div className="space-y-3">
      {gameLog.map((game, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-xl">
          <div>
            <div className="text-sm text-[var(--text-muted)]">
              {game.date ? new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
            </div>
            <div className="font-medium text-[var(--text-primary)]">
              {game.isHome ? 'vs' : '@'} {game.opponent}
            </div>
          </div>
          <div className="text-right">
            {game.result && (
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${
                game.result === 'W' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {game.result} {game.bearsScore}-{game.oppScore}
              </span>
            )}
            <div className="text-sm text-[var(--text-secondary)]">
              {getStatDisplay(game)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Player Card Component for selection
function PlayerCard({
  player,
  stats
}: {
  player: BearsPlayer
  stats?: { primaryStat: number; primaryLabel: string; secondaryStat: number | null; secondaryLabel: string | null }
}) {
  const statLine = stats
    ? `${stats.primaryStat} ${stats.primaryLabel}${stats.secondaryStat !== null ? `, ${stats.secondaryStat} ${stats.secondaryLabel}` : ''}`
    : null

  return (
    <Link
      href={`/chicago-bears/players/${player.slug}`}
      className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl overflow-hidden hover:border-[#C83200] hover:shadow-lg transition-all"
    >
      {/* Player Image */}
      <div className="relative aspect-square bg-gradient-to-b from-[#0B162A] to-[#0B162A]/80">
        {player.headshotUrl ? (
          <Image
            src={player.headshotUrl}
            alt={player.fullName}
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white/30">
              {player.jerseyNumber ?? '?'}
            </span>
          </div>
        )}
        {/* Jersey Number Badge */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs font-bold">
          #{player.jerseyNumber}
        </div>
        {/* Position Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-[#C83200] rounded text-white text-xs font-semibold">
          {player.position}
        </div>
      </div>

      {/* Player Info */}
      <div className="p-3">
        <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[#C83200] transition-colors truncate">
          {player.fullName}
        </h3>
        {statLine && (
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {statLine}
          </p>
        )}
      </div>
    </Link>
  )
}
