"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRightLeft, ClipboardPen, MessageSquare, BarChart3, Video, Volume2, Tv, MoreVertical } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import type { Role } from "@/lib/roles"

function ReportCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <text x="12" y="17" fill="currentColor" fontSize="16" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">A+</text>
    </svg>
  )
}
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
  { icon: ReportCardIcon, label: 'GM Report Cards', desc: 'Transparent, data-backed grades on every Chicago ownership group.', href: '/owner' },
]

export default function HomeSidebar({ selectedTeam, onSelectTeam }: HomeSidebarProps) {
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null)
  const [hasLiveGames, setHasLiveGames] = useState(false)
  const { user, isAuthenticated, signOut } = useAuth()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const profileMenuRef = useRef<HTMLDivElement>(null)

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

  // Fetch user role when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetch(`/api/user/role?email=${encodeURIComponent(user.email)}`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => { if (data?.role) setUserRole(data.role) })
        .catch(() => {})
    } else {
      setUserRole(null)
    }
  }, [isAuthenticated, user?.email])

  // Close profile menu on outside click
  useEffect(() => {
    if (!profileMenuOpen) return
    const handler = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileMenuOpen])

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
                  {/* No descriptions on left sidebar when team selected — keep descriptions on right (TrendsSidebar) */}
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

      {/* User profile — bottom */}
      {isAuthenticated && user && (
        <div
          style={{
            flexShrink: 0,
            marginTop: 'auto',
            padding: '12px 8px 16px',
            borderTop: '1px solid var(--hp-border)',
          }}
          ref={profileMenuRef}
        >
          <div
            style={{
              borderRadius: 12,
              background: 'var(--hp-muted)',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              position: 'relative',
            }}
          >
            <Link
              href="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flex: 1,
                minWidth: 0,
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--hp-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt=""
                    width={32}
                    height={32}
                    style={{ width: 32, height: 32, objectFit: 'cover' }}
                    unoptimized
                  />
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--hp-foreground)' }}>
                    {(user.name || user.email || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--hp-foreground)',
                    lineHeight: 1.2,
                  }}
                  className="truncate"
                >
                  {user.name || user.email?.split('@')[0] || 'Profile'}
                </p>
                <p
                  style={{
                    margin: 0,
                    marginTop: 2,
                    fontSize: 10,
                    color: 'var(--hp-foreground)',
                    opacity: 0.5,
                    lineHeight: 1.2,
                  }}
                  className="truncate"
                >
                  View profile & activity
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              aria-label="Profile options"
              style={{
                border: 'none',
                background: 'none',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                color: 'var(--hp-foreground)',
                opacity: 0.5,
              }}
            >
              <MoreVertical size={18} aria-hidden />
            </button>

            {profileMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  marginBottom: 8,
                  width: 220,
                  borderRadius: 12,
                  backgroundColor: 'var(--hp-card)',
                  border: '1px solid var(--hp-border)',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
                  overflow: 'hidden',
                  zIndex: 1000,
                }}
              >
                <div style={{ padding: '8px 0' }}>
                  {userRole === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '8px 14px',
                        fontSize: 13,
                        color: 'var(--hp-foreground)',
                        textDecoration: 'none',
                      }}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {(userRole === 'editor' || userRole === 'author') && (
                    <Link
                      href="/studio"
                      onClick={() => setProfileMenuOpen(false)}
                      style={{
                        display: 'block',
                        padding: '8px 14px',
                        fontSize: 13,
                        color: 'var(--hp-foreground)',
                        textDecoration: 'none',
                      }}
                    >
                      Creator Studio
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 14px',
                      fontSize: 13,
                      color: 'var(--hp-foreground)',
                      textDecoration: 'none',
                    }}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/my-gm-score"
                    onClick={() => setProfileMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 14px',
                      fontSize: 13,
                      color: 'var(--hp-foreground)',
                      textDecoration: 'none',
                    }}
                  >
                    My GM Score
                  </Link>
                  <div style={{ height: 1, background: 'var(--hp-border)', margin: '4px 0' }} />
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false)
                      signOut()
                    }}
                    style={{
                      display: 'block',
                      padding: '8px 14px',
                      fontSize: 13,
                      color: '#BC0000',
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
