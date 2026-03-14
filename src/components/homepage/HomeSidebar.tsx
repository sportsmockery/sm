"use client"

import { useState } from "react"
import { Search, ArrowRightLeft, ClipboardPen, MessageSquare, BarChart3, Video, Volume2 } from "lucide-react"
import { homepageTeams } from "@/lib/homepage-team-data"

interface HomeSidebarProps {
  selectedTeam: string
  onSelectTeam: (teamId: string) => void
}

export default function HomeSidebar({ selectedTeam, onSelectTeam }: HomeSidebarProps) {
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null)

  return (
    <header className="sticky top-0 flex h-screen w-[275px] flex-col justify-between px-2 py-3">
      <div className="flex flex-col gap-1 pt-4">
        {/* Navigation */}
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
            {/* Chicago Six-Pointed Star */}
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
                {/* Team Logo */}
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

        {/* Blitz Features — shown when a team is selected */}
        {selectedTeam && selectedTeam !== 'all' && (
          <div style={{ marginTop: 8, borderTop: '1px solid var(--hp-border)', paddingTop: 8 }}>
            <div style={{ padding: '4px 16px', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
              <span style={{ color: '#00D4FF' }}>SM</span><span style={{ color: '#BC0000' }}>&#x2736;</span><span style={{ color: '#00D4FF' }}>EDGE Features</span>
            </div>
            {[
              { icon: ArrowRightLeft, label: 'Trade Simulator', href: '/gm' },
              { icon: ClipboardPen, label: 'Mock Draft', href: '/mock-draft' },
              { icon: MessageSquare, label: 'Fan Chat', href: '/fan-chat' },
              { icon: BarChart3, label: 'Team Analytics', href: `/${selectedTeam === 'whitesox' ? 'chicago-white-sox' : `chicago-${selectedTeam}`}` },
              { icon: Video, label: 'Vision Theater', href: '/bears-film-room' },
              { icon: Volume2, label: 'Hands-Free Audio', href: '/audio' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
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
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hp-muted)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--hp-muted)', color: '#00D4FF', border: '1px solid #00D4FF' }}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative px-2">
        <Search
          className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2"
          style={{ color: 'var(--hp-muted-foreground)' }}
        />
        <input
          type="text"
          placeholder="Search"
          style={{
            width: '100%',
            borderRadius: 16,
            border: 0,
            background: 'var(--hp-muted)',
            padding: '14px 16px 14px 48px',
            fontSize: 15,
            color: 'var(--hp-foreground)',
            outline: 'none',
            transition: 'all 0.2s',
          }}
        />
      </div>
    </header>
  )
}
