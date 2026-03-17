"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightLeft, ClipboardPen, MessageSquare, BarChart3, Video, Volume2, Tv, MoreHorizontal, LogIn } from "lucide-react"
import FeedTeamSidebar from "@/components/homepage/FeedTeamSidebar"
import { useAuth } from "@/contexts/AuthContext"

const EDGE_TOOLS: { icon: React.ComponentType<{ className?: string }>; label: string; desc?: string; href: string; liveOnly?: boolean }[] = [
  { icon: Tv, label: 'Game Center', desc: 'Live play-by-play with the numbers behind it.', href: '/live', liveOnly: true },
  { icon: ClipboardPen, label: 'War Room', desc: 'Play GM — simulate trades, run mock drafts, and compete against other SM users.', href: '/gm' },
  { icon: MessageSquare, label: 'Fan Chat', desc: 'Skip the comments and argue it out live.', href: '/fan-chat' },
  { icon: BarChart3, label: 'Team Stats', desc: 'The numbers that explain the wins… and the excuses.', href: '/chicago-bears' },
  { icon: Video, label: 'Vision Theater', desc: 'All videos, no digging. Just press play.', href: '/vision-theater' },
  { icon: Volume2, label: 'Hands-Free Audio', desc: 'Sit back, choose a voice, and press play.', href: '/audio' },
]

interface TrendsSidebarProps {
  selectedTeam: string
}

export default function TrendsSidebar({ selectedTeam }: TrendsSidebarProps) {
  const { user, isAuthenticated } = useAuth()
  const isForYou = !selectedTeam || selectedTeam === 'all'
  const [hasLiveGames, setHasLiveGames] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

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

  return (
    <aside className="sticky top-0 pl-6 hidden h-screen w-[350px] flex-col gap-4 pt-4 pb-3 lg:flex overflow-y-auto">
      {/* Profile / Login */}
      <div className="hp-sidebar-card px-3 py-3">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 relative">
            <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0" style={{ textDecoration: 'none' }}>
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name || ''} width={40} height={40} className="rounded-full object-cover shrink-0" style={{ width: 40, height: 40 }} />
              ) : (
                <div className="shrink-0 flex items-center justify-center rounded-full" style={{ width: 40, height: 40, backgroundColor: 'var(--hp-muted)', color: 'var(--hp-foreground)', fontSize: 14, fontWeight: 600 }}>
                  {(user.name || user.email)?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate" style={{ fontSize: 14, fontWeight: 600, color: 'var(--hp-foreground)', margin: 0, lineHeight: 1.2 }}>{user.name || user.email?.split('@')[0]}</p>
                <p className="truncate" style={{ fontSize: 12, color: 'var(--hp-muted-foreground)', margin: 0 }}>{user.email}</p>
              </div>
            </Link>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="shrink-0 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--hp-muted)]"
              style={{ width: 32, height: 32 }}
            >
              <MoreHorizontal className="w-5 h-5" style={{ color: 'var(--hp-muted-foreground)' }} />
            </button>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl shadow-xl overflow-hidden" style={{ backgroundColor: 'var(--hp-card)', border: '1px solid var(--hp-border)' }}>
                  <div className="p-1.5">
                    <Link href="/profile" className="block px-3 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[var(--hp-muted)]" style={{ color: 'var(--hp-foreground)', textDecoration: 'none' }} onClick={() => setShowProfileMenu(false)}>
                      Profile
                    </Link>
                    <Link href="/profile?tab=settings" className="block px-3 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[var(--hp-muted)]" style={{ color: 'var(--hp-foreground)', textDecoration: 'none' }} onClick={() => setShowProfileMenu(false)}>
                      Settings
                    </Link>
                    <Link href="/profile?tab=favorites" className="block px-3 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[var(--hp-muted)]" style={{ color: 'var(--hp-foreground)', textDecoration: 'none' }} onClick={() => setShowProfileMenu(false)}>
                      Favorites
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--hp-foreground)', margin: 0 }}>Welcome to SM Edge</p>
              <p style={{ fontSize: 12, color: 'var(--hp-muted-foreground)', margin: '2px 0 0' }}>Log in to save favorites and personalize your feed.</p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-[13px] font-medium"
              style={{
                backgroundColor: "#BC0000",
                color: "#FAFAFB",
                border: "1px solid transparent",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              <LogIn className="w-3.5 h-3.5 mr-1" />
              Login
            </Link>
          </div>
        )}
      </div>

      {/* Ask Scout - Quick Access */}
      <Link href="/scout-ai" className="hp-sidebar-card w-full px-3 py-2.5 flex items-center gap-3 group transition-all" style={{ textDecoration: 'none' }}>
        <Image
          src="/downloads/scout-v2.png"
          alt="Scout AI"
          width={48}
          height={48}
          className="h-12 w-12 object-contain flex-shrink-0"
        />
        <div className="flex-1 text-left" style={{ lineHeight: 1.2 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--hp-foreground)', margin: 0 }}>Ask Scout</p>
          <p style={{ fontSize: 13, color: 'var(--hp-muted-foreground)', margin: 0 }}>AI-powered sports analysis</p>
        </div>
        <span className="flex items-center gap-1.5" style={{ fontSize: 10, color: '#16a34a', fontWeight: 500 }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#16a34a' }} />
          Online
        </span>
      </Link>

      {/* SM EDGE Features — right sidebar when For You is selected */}
      {isForYou && (
        <div className="hp-sidebar-card overflow-hidden" style={{ padding: 0 }}>
          <div style={{ padding: '12px 16px 8px', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
            <span style={{ color: '#00D4FF' }}>SM</span> <span style={{ color: '#BC0000' }}>&#x2736;</span> <span style={{ color: '#00D4FF' }}>EDGE Features</span>
          </div>
          {EDGE_TOOLS.filter(item => !item.liveOnly || hasLiveGames).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="hp-tap-target"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 16px',
                fontSize: 14,
                color: 'var(--hp-foreground)',
                textDecoration: 'none',
                transition: 'background 0.15s',
                ...(item.label === 'Game Center' ? { border: '1px solid #00D4FF', borderRadius: 12, margin: '4px 0' } : {}),
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
            </Link>
          ))}
        </div>
      )}

      {/* Team Sidebar - shown when a team is selected */}
      {!isForYou && selectedTeam && (
        <FeedTeamSidebar selectedTeam={selectedTeam} />
      )}

      {/* Footer */}
      <div className="px-4 mt-auto pb-4" style={{ fontSize: 13, color: 'var(--hp-muted-foreground)' }}>
        <p className="flex flex-wrap gap-x-2">
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/cookies" className="hover:underline">Cookies</a>
        </p>
        <p className="mt-1">&copy; 2026 Sports Mockery</p>
      </div>
    </aside>
  )
}
