'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { TeamSeasonOverview, TeamPlayer, TeamTrend, TEAM_INFO } from '@/lib/types'

interface FeedTeamSidebarProps {
  selectedTeam: string
}

const TEAM_ID_MAP: Record<string, { key: string; slug: string; espnLogo: string }> = {
  bears: { key: 'bears', slug: 'chicago-bears', espnLogo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
  bulls: { key: 'bulls', slug: 'chicago-bulls', espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
  cubs: { key: 'cubs', slug: 'chicago-cubs', espnLogo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png' },
  blackhawks: { key: 'blackhawks', slug: 'chicago-blackhawks', espnLogo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png' },
  whitesox: { key: 'whitesox', slug: 'chicago-white-sox', espnLogo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png' },
}

/** Strip city, keep team name only: "Los Angeles Rams" → "Rams", "New York Yankees" → "Yankees" */
function shortName(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  // Handle two-word team names: Red Sox, White Sox, Blue Jays, Trail Blazers, etc.
  const twoWord = ['Red Sox', 'White Sox', 'Blue Jays', 'Trail Blazers', 'Maple Leafs', 'Blue Jackets', 'Red Wings']
  for (const tw of twoWord) {
    if (fullName.endsWith(tw)) return tw
  }
  return parts[parts.length - 1] || fullName
}

function getTeamInfo(slug: string) {
  const teamKey = slug.replace('chicago-', '') as keyof typeof TEAM_INFO
  return TEAM_INFO[teamKey === 'white-sox' ? 'white-sox' : teamKey]
}

export default function FeedTeamSidebar({ selectedTeam }: FeedTeamSidebarProps) {
  const [data, setData] = useState<{
    season: TeamSeasonOverview | null
    players: TeamPlayer[]
    trends: TeamTrend[]
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const teamInfo = TEAM_ID_MAP[selectedTeam]

  useEffect(() => {
    if (!teamInfo) {
      setData(null)
      return
    }

    let cancelled = false
    setLoading(true)

    fetch(`/api/team-sidebar?team=${teamInfo.key}`)
      .then(res => res.json())
      .then(result => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null)
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [teamInfo?.key])

  if (!teamInfo) return null

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="rounded-lg animate-pulse"
            style={{ height: i === 1 ? 100 : 80, background: 'var(--hp-muted)' }}
          />
        ))}
      </div>
    )
  }

  const info = getTeamInfo(teamInfo.slug)
  if (!info) return null

  // If no data loaded, show empty state instead of rendering nothing
  if (!data) {
    return (
      <div className="hp-sidebar-card px-3 py-4 text-center">
        <p style={{ fontSize: 13, color: 'var(--hp-muted-foreground)', margin: 0 }}>
          Team data is loading...
        </p>
      </div>
    )
  }

  const { season, players, trends } = data

  return (
    <div className="flex flex-col gap-3">
      {/* Compact Season Card */}
      {season && <CompactSeasonCard season={season} info={info} espnLogo={teamInfo.espnLogo} />}

      {/* Compact Key Players — 5 category leaders */}
      {players && players.length > 0 && (
        <CompactRoster players={players.slice(0, 5)} slug={teamInfo.slug} info={info} />
      )}

      {/* Compact Trending — 3 max */}
      {trends && trends.length > 0 && (
        <CompactTrends trends={trends.slice(0, 3)} slug={teamInfo.slug} info={info} />
      )}
    </div>
  )
}

/* ---- Compact Season Card ---- */
function CompactSeasonCard({ season, info, espnLogo }: { season: TeamSeasonOverview; info: typeof TEAM_INFO[keyof typeof TEAM_INFO]; espnLogo: string }) {
  const { record, standing, nextGame, lastGame } = season
  const totalGames = record.wins + record.losses + (record.ties || 0)
  const winPct = totalGames > 0 ? ((record.wins / totalGames) * 100).toFixed(1) : '0.0'
  const recordStr = record.otl
    ? `${record.wins}-${record.losses}-${record.otl}`
    : record.ties
    ? `${record.wins}-${record.losses}-${record.ties}`
    : `${record.wins}-${record.losses}`

  return (
    <div className="hp-sidebar-card overflow-hidden" style={{ padding: 0 }}>
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: info.primaryColor }}>
        <Image
          src={espnLogo}
          alt={info.shortName}
          width={28}
          height={28}
          className="w-7 h-7 object-contain flex-shrink-0"
          unoptimized
        />
        <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-[13px] leading-tight">{info.shortName} {season.season}</div>
          <div className="text-white/60 text-[11px] leading-tight">{standing}</div>
        </div>
        <div className="text-right">
          <div className="text-white font-black text-[15px] leading-tight">{recordStr}</div>
          <div className="text-white/50 text-[10px] leading-tight">{winPct}%</div>
        </div>
      </div>

      {/* Next / Last game row */}
      <div className="grid grid-cols-2" style={{ borderTop: `1px solid rgba(255,255,255,0.1)` }}>
        <div className="px-3 py-2" style={{ borderRight: '1px solid var(--hp-border)' }}>
          <div style={{ fontSize: 9, color: 'var(--hp-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next</div>
          {nextGame ? (
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--hp-foreground)', marginTop: 1 }}>
              {nextGame.isHome ? 'vs' : '@'} {shortName(nextGame.opponent)}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--hp-muted-foreground)', marginTop: 1 }}>Offseason</div>
          )}
        </div>
        <div className="px-3 py-2">
          <div style={{ fontSize: 9, color: 'var(--hp-muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last</div>
          {lastGame ? (
            <div style={{ marginTop: 1 }}>
              <div className="flex items-center gap-1">
                <span
                  className="px-1 rounded text-[9px] font-bold"
                  style={{
                    color: lastGame.result === 'W' ? '#22c55e' : lastGame.result === 'L' ? '#ef4444' : '#eab308',
                    background: lastGame.result === 'W' ? 'rgba(34,197,94,0.1)' : lastGame.result === 'L' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                  }}
                >
                  {lastGame.result}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--hp-foreground)' }}>{shortName(lastGame.opponent)} {lastGame.score}</span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--hp-muted-foreground)', marginTop: 1 }}>—</div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex items-center justify-between px-3 py-1.5" style={{ borderTop: '1px solid var(--hp-border)', background: 'var(--hp-muted)' }}>
        <div className="flex gap-2">
          <Link href={`/${season.teamSlug}/roster`} style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }} className="hover:underline">Roster</Link>
          <Link href={`/${season.teamSlug}/stats`} style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }} className="hover:underline">Stats</Link>
          <Link href={`/${season.teamSlug}/schedule`} style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }} className="hover:underline">Schedule</Link>
        </div>
        <Link href={`/${season.teamSlug}/stats`} style={{ fontSize: 11, fontWeight: 600, color: '#BC0000' }} className="hover:underline">
          Team Stats →
        </Link>
      </div>
    </div>
  )
}

/* ---- Compact Roster (3 players) ---- */
function CompactRoster({ players, slug, info }: { players: TeamPlayer[]; slug: string; info: typeof TEAM_INFO[keyof typeof TEAM_INFO] }) {
  return (
    <div className="hp-sidebar-card overflow-hidden" style={{ padding: 0 }}>
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid var(--hp-border)' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--hp-foreground)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Key Players
        </span>
        <Link href={`/${slug}/roster`} style={{ fontSize: 11, color: '#BC0000' }} className="hover:underline">
          Full Roster →
        </Link>
      </div>
      {players.map((player, idx) => (
        <Link
          key={`${player.id}-${idx}`}
          href={`/${slug}/players/${player.id}`}
          className="group flex items-center gap-2 px-3 py-1.5 transition-colors"
          style={{ borderBottom: '1px solid var(--hp-border)', textDecoration: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hp-muted)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          {/* Avatar */}
          <div className="relative w-7 h-7 flex-shrink-0">
            {player.imageUrl ? (
              <Image src={player.imageUrl} alt={player.name} fill className="object-cover rounded-full" sizes="28px" />
            ) : (
              <div
                className="w-full h-full rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: info.secondaryColor, fontSize: 10 }}
              >
                #{player.number}
              </div>
            )}
          </div>
          {/* Name + position */}
          <div className="flex-1 min-w-0">
            <div className="truncate" style={{ fontSize: 12, fontWeight: 600, color: 'var(--hp-foreground)' }}>
              {player.name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--hp-muted-foreground)' }}>
              #{player.number} · {player.position}
            </div>
          </div>
          {/* Stat */}
          {player.stats && Object.keys(player.stats).length > 0 && (() => {
            const [label, value] = Object.entries(player.stats!)[0]
            return (
              <div className="text-right flex-shrink-0">
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--hp-foreground)' }}>
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                <div style={{ fontSize: 9, color: 'var(--hp-muted-foreground)', textTransform: 'uppercase' }}>
                  {label.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            )
          })()}
        </Link>
      ))}
    </div>
  )
}

/* ---- Compact Trends (3 items) ---- */
function CompactTrends({ trends, slug, info }: { trends: TeamTrend[]; slug: string; info: typeof TEAM_INFO[keyof typeof TEAM_INFO] }) {
  return (
    <div className="hp-sidebar-card overflow-hidden" style={{ padding: 0 }}>
      <div className="flex items-center gap-1.5 px-3 py-2" style={{ borderBottom: '1px solid var(--hp-border)' }}>
        <svg className="w-3.5 h-3.5" style={{ color: info.secondaryColor }} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
        </svg>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--hp-foreground)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          Trending
        </span>
      </div>
      {trends.map((trend, index) => (
        <Link
          key={trend.id}
          href={`/${slug}`}
          className="flex items-center gap-2 px-3 py-1.5 transition-colors"
          style={{ borderBottom: '1px solid var(--hp-border)', textDecoration: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hp-muted)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <div
            className="w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center font-bold"
            style={{
              fontSize: 10,
              backgroundColor: index < 3 ? info.secondaryColor : 'var(--hp-muted)',
              color: index < 3 ? 'white' : 'var(--hp-muted-foreground)',
            }}
          >
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="truncate" style={{ fontSize: 12, fontWeight: 600, color: 'var(--hp-foreground)' }}>
                {trend.title}
              </span>
              {trend.isHot && (
                <span style={{ fontSize: 8, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '1px 4px', borderRadius: 3, textTransform: 'uppercase', flexShrink: 0 }}>
                  Hot
                </span>
              )}
            </div>
          </div>
          <span style={{ fontSize: 10, color: 'var(--hp-muted-foreground)', flexShrink: 0 }}>
            {trend.postCount}
          </span>
        </Link>
      ))}
    </div>
  )
}
