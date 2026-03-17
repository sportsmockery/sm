"use client"

import { useState, useEffect } from "react"
import { ArrowRightLeft, ClipboardPen, MessageSquare, BarChart3, Video, Volume2, Tv } from "lucide-react"
import { homepageTeams } from "@/lib/homepage-team-data"

interface HomeSidebarProps {
  selectedTeam: string
  onSelectTeam: (teamId: string) => void
}

const edgeTools: { icon: React.ComponentType<{ className?: string }>; label: string; desc?: string; href: string; liveOnly?: boolean }[] = [
  { icon: Tv, label: 'Game Center', desc: 'Live play-by-play with the numbers behind it.', href: '/live', liveOnly: true },
  { icon: ClipboardPen, label: 'War Room', desc: 'Play GM — simulate trades, run mock drafts, and compete against other SM users.', href: '/gm' },
  { icon: MessageSquare, label: 'Fan Chat', desc: 'Skip the comments and argue it out live.', href: '/fan-chat' },
  { icon: BarChart3, label: 'Team Stats', desc: 'The numbers that explain the wins… and the excuses.', href: '/chicago-bears' },
  { icon: Video, label: 'Vision Theater', desc: 'All videos, no digging. Just press play.', href: '/vision-theater' },
  { icon: Volume2, label: 'Hands-Free Audio', desc: 'Sit back, choose a voice, and press play.', href: '/audio' },
]

export default function HomeSidebar({ selectedTeam, onSelectTeam }: HomeSidebarProps) {
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null)
  const [hasLiveGames, setHasLiveGames] = useState(false)

  // Poll for live games to show/hide Game Center
  useEffect(() => {
    const check = () => {
      fetch('/api/hero-games')
        .then(r => r.json())
        .then(d => setHasLiveGames(d.games?.length > 0))
        .catch(() => {})
    }
    check()
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [])

  // Update Team Stats link based on selected team
  const getToolHref = (tool: typeof edgeTools[0]) => {
    if (tool.label === 'Team Stats' && selectedTeam && selectedTeam !== 'all') {
      return `/${selectedTeam === 'whitesox' ? 'chicago-white-sox' : `chicago-${selectedTeam}`}`
    }
    return tool.href
  }

  return (
    <header className="sticky top-0 flex h-screen w-[275px] flex-col justify-between px-2 py-3">
      <div className="flex flex-col gap-1 pt-4">
        {/* Team Navigation */}
        <nav className="flex flex-col gap-1">
          {/* For You - All Teams */}
          <button
            onClick={() => onSelectTeam("all")}
            onMouseEnter={() => setHoveredTeam("all")}
            onMouseLeave={() => setHoveredTeam(null)}
            className="hp-tap-target"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 15,
              transition: 'all 0.15s',
              background: selectedTeam === "all" ? 'var(--hp-muted)' : 'transparent',
              fontWeight: selectedTeam === "all" ? 600 : 400,
            }}
          >
            <div className="flex h-6 w-6 items-center justify-center">
              <img
                src="/edge-dash.png"
                alt="For You"
                style={{
                  height: 24,
                  width: 24,
                  objectFit: 'contain',
                  transition: 'all 0.2s',
                  filter: selectedTeam === "all" ? 'none' : 'grayscale(1)',
                  opacity: selectedTeam === "all" ? 1 : 0.6,
                }}
              />
            </div>
            <span style={{ color: 'var(--hp-foreground)' }}>For You</span>
          </button>

          {homepageTeams.map((team) => {
            const isSelected = selectedTeam === team.id

            return (
              <button
                key={team.id}
                onClick={() => onSelectTeam(team.id)}
                onMouseEnter={() => setHoveredTeam(team.id)}
                onMouseLeave={() => setHoveredTeam(null)}
                className="hp-tap-target"
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  borderRadius: 12,
                  padding: '12px 16px',
                  fontSize: 15,
                  transition: 'all 0.15s',
                  background: isSelected ? 'var(--hp-muted)' : hoveredTeam === team.id ? 'var(--hp-muted)' : 'transparent',
                  fontWeight: isSelected ? 600 : 400,
                  opacity: isSelected ? 1 : hoveredTeam === team.id ? 0.9 : 1,
                }}
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  <img
                    src={team.logo}
                    alt={`${team.name} logo`}
                    style={{
                      height: 24,
                      width: 24,
                      objectFit: 'contain',
                      transition: 'all 0.2s',
                      filter: isSelected ? 'none' : 'grayscale(1)',
                      opacity: isSelected ? 1 : 0.6,
                    }}
                    crossOrigin="anonymous"
                  />
                </div>
                <span style={{ color: 'var(--hp-foreground)' }}>{team.name}</span>
              </button>
            )
          })}
        </nav>

        {/* SM Edge Features — left sidebar only when a team is selected */}
        {selectedTeam && selectedTeam !== 'all' && (
          <div style={{ marginTop: 8, borderTop: '1px solid var(--hp-border)', paddingTop: 8 }}>
            <div style={{ padding: '4px 16px', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
              <span style={{ color: '#00D4FF' }}>SM</span> <span style={{ color: '#BC0000' }}>&#x2736;</span> <span style={{ color: '#00D4FF' }}>EDGE Features</span>
            </div>
            {edgeTools.filter(item => !item.liveOnly || hasLiveGames).map((item) => (
              <a
                key={item.label}
                href={getToolHref(item)}
                className="hp-tap-target"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  borderRadius: 12,
                  padding: '8px 16px',
                  fontSize: 14,
                  color: 'var(--hp-foreground)',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                  ...(item.label === 'Game Center' ? { border: '1px solid #00D4FF', margin: '4px 0' } : {}),
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hp-muted)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--hp-muted)', color: '#00D4FF', border: '1px solid #00D4FF' }}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div style={{ flex: 1 }}>
                  <span>{item.label}</span>
                  {item.desc && <p style={{ fontSize: 11, color: 'var(--hp-muted-foreground)', margin: '2px 0 0', lineHeight: 1.3 }}>{item.desc}</p>}
                </div>
                {(item.label === 'Fan Chat' || item.label === 'Game Center') && (
                  <span
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '3px 8px',
                      borderRadius: 'var(--sm-radius-pill)',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      color: '#22c55e',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      background: 'rgba(34, 197, 94, 0.12)',
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e' }} />
                    LIVE
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
