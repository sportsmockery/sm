import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPlayerProfile, getBullsPlayers, type PlayerProfile, type PlayerGameLogEntry } from '@/lib/bullsData'
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
  const [profile, allPlayers] = await Promise.all([
    getPlayerProfile(slug),
    getBullsPlayers(),
  ])

  if (!profile) {
    notFound()
  }

  // Prepare players for switcher
  const switcherPlayers = allPlayers.map(p => ({
    slug: p.slug,
    fullName: p.fullName,
    jerseyNumber: p.jerseyNumber,
    position: p.position,
    headshotUrl: p.headshotUrl,
  }))

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)' }}>
      {/* Hero Section */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #CE1141 0%, #CE1141 70%, #000000 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb & Player Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <nav className="flex items-center gap-2 text-sm text-white/60">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <Link href="/chicago-bulls" className="hover:text-white">Chicago Bulls</Link>
              <span>/</span>
              <Link href="/chicago-bulls/players" className="hover:text-white">Players</Link>
              <span>/</span>
              <span className="text-white">{profile.player.fullName}</span>
            </nav>
            <PlayerSwitcher
              players={switcherPlayers}
              currentSlug={slug}
              teamPath="/chicago-bulls/players"
            />
          </div>

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
              <section className="rounded-2xl p-6" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
                <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--sm-text)' }}>
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
              <section className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
                <div className="p-6" style={{ borderBottom: '1px solid var(--sm-border)' }}>
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--sm-text)' }}>
                    Recent Games
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)', borderBottom: '1px solid var(--sm-border)' }}>
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
            <section className="rounded-2xl p-6" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--sm-text)' }}>
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/chicago-bulls/roster"
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{ color: 'var(--sm-text-muted)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Full Bulls Roster
                </Link>
                <Link
                  href="/chicago-bulls/stats"
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{ color: 'var(--sm-text-muted)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                  Team Stats
                </Link>
                <Link
                  href="/chicago-bulls/schedule"
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{ color: 'var(--sm-text-muted)' }}
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
    <div className="rounded-xl p-4 text-center" style={{ backgroundColor: 'var(--sm-surface)' }}>
      <div className="text-2xl font-bold" style={{ color: 'var(--sm-text)' }}>{value}</div>
      <div className="text-xs uppercase" style={{ color: 'var(--sm-text-muted)' }}>{label}</div>
    </div>
  )
}

function GameLogRow({ game }: { game: PlayerGameLogEntry }) {
  return (
    <tr className="last:border-0 transition-colors" style={{ borderBottom: '1px solid var(--sm-border)' }}>
      <td className="px-4 py-3 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
        {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </td>
      <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
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
      <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--sm-text)' }}>
        {game.points ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
        {game.rebounds ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
        {game.assists ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm hidden sm:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
        {game.minutes ?? '—'}
      </td>
    </tr>
  )
}
