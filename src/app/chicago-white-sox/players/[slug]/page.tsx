import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPlayerProfile, getWhiteSoxPlayers, type PlayerProfile, type PlayerGameLogEntry } from '@/lib/whitesoxData'
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
  const [profile, allPlayers] = await Promise.all([
    getPlayerProfile(slug),
    getWhiteSoxPlayers(),
  ])

  if (!profile) {
    notFound()
  }

  const isPitcher = profile.player.positionGroup === 'pitchers'

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
        className="relative overflow-hidden team-hero-whitesox"
      >
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Breadcrumb & Player Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <nav className="flex items-center gap-2 text-sm text-white/60">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <Link href="/chicago-white-sox" className="hover:text-white">Chicago White Sox</Link>
              <span>/</span>
              <Link href="/chicago-white-sox/players" className="hover:text-white">Players</Link>
              <span>/</span>
              <span className="text-white">{profile.player.fullName}</span>
            </nav>
            <PlayerSwitcher
              players={switcherPlayers}
              currentSlug={slug}
              teamPath="/chicago-white-sox/players"
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

              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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
              <section className="glass-card glass-card-static">
                <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)' }}>
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
              <section className="glass-card glass-card-static" style={{ overflow: 'hidden', padding: 0 }}>
                <div className="p-6" style={{ borderBottom: '1px solid var(--sm-border)' }}>
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)' }}>
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
            <section className="glass-card glass-card-static">
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)' }}>
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/chicago-white-sox/roster"
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{ color: 'var(--sm-text-muted)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Full White Sox Roster
                </Link>
                <Link
                  href="/chicago-white-sox/stats"
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{ color: 'var(--sm-text-muted)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                  Team Stats
                </Link>
                <Link
                  href="/chicago-white-sox/schedule"
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

function GameLogRow({ game, isPitcher }: { game: PlayerGameLogEntry; isPitcher: boolean }) {
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
            {game.result} {game.whitesoxScore}-{game.oppScore}
          </span>
        )}
      </td>
      {isPitcher ? (
        <>
          <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--sm-text)' }}>
            {game.inningsPitched?.toFixed(1) ?? '-'}
            {game.pitchingDecision && (
              <span className="ml-1 text-xs" style={{ color: 'var(--sm-text-muted)' }}>({game.pitchingDecision})</span>
            )}
          </td>
          <td className="px-4 py-3 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
            {game.hitsAllowed ?? '-'}
          </td>
          <td className="px-4 py-3 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
            {game.earnedRuns ?? '-'}
          </td>
          <td className="px-4 py-3 text-sm hidden sm:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
            {game.strikeoutsPitched ?? '-'}
          </td>
        </>
      ) : (
        <>
          <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--sm-text)' }}>
            {game.atBats ?? '-'}
          </td>
          <td className="px-4 py-3 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
            {game.hits ?? '-'}
          </td>
          <td className="px-4 py-3 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
            {game.homeRuns ?? '-'}
          </td>
          <td className="px-4 py-3 text-sm hidden sm:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
            {game.rbi ?? '-'}
          </td>
        </>
      )}
    </tr>
  )
}
