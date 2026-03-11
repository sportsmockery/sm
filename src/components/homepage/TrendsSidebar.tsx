"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { MoreHorizontal, ArrowRightLeft, ClipboardPen, MessageSquare, BarChart3, Video, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface TrendsSidebarProps {
  selectedTeam: string
}

const edgeTools = [
  {
    id: "trade-sim",
    title: "Trade Simulator",
    description: "Play GM and build trades now.",
    icon: ArrowRightLeft,
    href: "/gm",
  },
  {
    id: "mock-draft",
    title: "Mock Draft",
    description: "Run mock drafts with instant grades.",
    icon: ClipboardPen,
    href: "/mock-draft",
  },
  {
    id: "fan-hub",
    title: "Fan Chat",
    description: "Live chat and conversation.",
    icon: MessageSquare,
    href: "/fan-chat",
  },
  {
    id: "data-cosmos",
    title: "Data Cosmos",
    description: "Stats, rosters, scores, and more.",
    icon: BarChart3,
    href: "/chicago-bears",
  },
  {
    id: "shows",
    title: "Vision Theater",
    description: "Stream all the latest SM videos.",
    icon: Video,
    href: "/bears-film-room",
  },
]

export default function TrendsSidebar({ selectedTeam }: TrendsSidebarProps) {
  const { user, isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const username = user?.email?.split('@')[0] || 'Guest'
  const fullName = user?.name || ''

  return (
    <aside className="sticky top-0 pl-6 hidden h-screen w-[350px] flex-col gap-4 pt-4 pb-3 lg:flex overflow-y-auto">
      {/* User Profile */}
      <div className="hp-sidebar-card relative" ref={menuRef}>
        <div className="flex items-center gap-3 p-4">
          <div
            className="h-11 w-11 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
            style={{ background: user?.avatar ? 'transparent' : '#6b7280' }}
          >
            {user?.avatar ? (
              <Image src={user.avatar} alt={username} width={44} height={44} className="h-full w-full object-cover" />
            ) : (
              <User className="h-6 w-6" style={{ color: '#9ca3af' }} />
            )}
          </div>
          <div className="flex flex-1 flex-col text-left text-sm">
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--hp-foreground)' }}>{username}</span>
            {fullName && (
              <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>{fullName}</span>
            )}
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hp-tap-target"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <MoreHorizontal className="h-5 w-5" style={{ color: 'var(--hp-muted-foreground)' }} />
          </button>
        </div>
        {menuOpen && (
          <div
            className="absolute right-4 top-14 z-50 rounded-lg py-1 shadow-lg"
            style={{ background: 'var(--hp-card)', border: '1px solid var(--hp-border)', minWidth: 160 }}
          >
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-sm transition-colors"
              style={{ color: 'var(--hp-foreground)', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hp-muted)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              View Profile
            </Link>
          </div>
        )}
      </div>

      {/* Ask Scout - Quick Access */}
      <button className="hp-sidebar-card w-full p-4 flex items-center gap-3 group transition-all">
        <Image
          src="/downloads/scout-v2.png"
          alt="Scout AI"
          width={48}
          height={48}
          className="h-12 w-12 object-contain flex-shrink-0"
        />
        <div className="flex-1 text-left" style={{ lineHeight: 1.2 }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--hp-foreground)', margin: 0 }}>Ask Scout</p>
          <p style={{ fontSize: 14, color: 'var(--hp-muted-foreground)', margin: 0 }}>AI-powered sports analysis</p>
        </div>
        <span className="flex items-center gap-1.5" style={{ fontSize: 10, color: '#16a34a', fontWeight: 500 }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00D4FF' }} />
          Online
        </span>
      </button>

      {/* SM Edge Tools */}
      <div className="hp-sidebar-card overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--hp-foreground)' }}>SM Edge Tools</h2>
        </div>

        <div className="px-3 pb-4 flex flex-col gap-1.5">
          {edgeTools.map((tool) => (
            <a
              key={tool.id}
              href={tool.href}
              className="flex items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all hp-tap-target"
              style={{ textDecoration: 'none' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--hp-muted)'
                const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement
                if (icon) icon.style.color = '#BC0000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement
                if (icon) icon.style.color = 'var(--hp-muted-foreground)'
              }}
            >
              <div
                data-icon
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg self-center"
                style={{ background: 'var(--hp-muted)', color: 'var(--hp-muted-foreground)', transition: 'color 0.2s' }}
              >
                <tool.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0" style={{ lineHeight: 1.3 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--hp-foreground)', margin: 0 }}>{tool.title}</p>
                <p className="line-clamp-2" style={{ fontSize: 14, color: 'var(--hp-muted-foreground)', margin: 0 }}>{tool.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

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
