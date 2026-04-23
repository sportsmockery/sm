"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightLeft, ClipboardPen, MessageSquare, BarChart3, Video, Volume2, Tv, MoreHorizontal, LogIn, Mail } from "lucide-react"
import FeedTeamSidebar from "@/components/homepage/FeedTeamSidebar"
import { useAuth } from "@/contexts/AuthContext"

function ReportCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <text x="12" y="17" fill="currentColor" fontSize="16" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">A+</text>
    </svg>
  )
}

const EDGE_TOOLS: { icon: React.ComponentType<{ className?: string }>; label: string; desc?: string; href: string; liveOnly?: boolean }[] = [
  { icon: MessageSquare, label: 'Fan Chat', desc: 'Skip the comments and argue it out live.', href: '/fan-chat' },
  { icon: Tv, label: 'Game Center', desc: 'Live play-by-play with the numbers behind it.', href: '/live', liveOnly: true },
  { icon: ClipboardPen, label: 'War Room', desc: 'Play GM — simulate trades, run mock drafts, and compete against other SM users.', href: '/gm' },
  { icon: BarChart3, label: 'Team Stats', desc: 'The numbers that explain the wins… and the excuses.', href: '/chicago-bears' },
  { icon: Video, label: 'Vision Theater', desc: 'All videos, no digging. Just press play.', href: '/vision-theater' },
  { icon: Volume2, label: 'Hands-Free Audio', desc: 'Sit back, choose a voice, and press play.', href: '/audio' },
  { icon: ReportCardIcon, label: 'GM Report Cards', desc: 'Transparent, data-backed grades on every Chicago ownership group.', href: '/owner' },
  { icon: Mail, label: 'Subscribe', desc: 'Chicago sports intelligence in your inbox every morning at 6 AM.', href: '/newsletter' },
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
    <aside className="sticky top-0 pl-6 hidden h-screen w-[350px] flex-col pt-4 pb-3 lg:flex">
      <div className="flex flex-col gap-4 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin' }}>
      {/* Login prompt for non-authenticated users */}
      {!isAuthenticated && (
        <div className="hp-sidebar-card px-3 py-3">
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
        </div>
      )}

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
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px',
            borderRadius: 999,
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
      </Link>

      {/* SM EDGE Features — right sidebar when For You is selected */}
      {isForYou && (
        <div className="hp-sidebar-card overflow-hidden" style={{ padding: 0, border: '1px solid rgba(0, 212, 255, 0.4)', boxShadow: '0 0 12px rgba(0, 212, 255, 0.15), 0 0 4px rgba(0, 212, 255, 0.1)' }}>
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

      </div>
      {/* Footer */}
      <div className="px-4 pt-2 pb-4 flex-shrink-0" style={{ fontSize: 11, color: 'var(--hp-muted-foreground)', whiteSpace: 'nowrap' }}>
        <p className="flex items-center gap-x-1.5" style={{ margin: 0 }}>
          <span>&copy; 2026 Sports Mockery Inc.</span>
          <span>|</span>
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/cookies" className="hover:underline">Cookies</a>
        </p>
      </div>
    </aside>
  )
}
