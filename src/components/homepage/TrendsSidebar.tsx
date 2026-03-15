"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRightLeft, ClipboardPen, MessageSquare, BarChart3, Video, Volume2 } from "lucide-react"
import FeedTeamSidebar from "@/components/homepage/FeedTeamSidebar"

const EDGE_TOOLS = [
  { icon: ArrowRightLeft, label: 'Trade Simulator', href: '/gm' },
  { icon: ClipboardPen, label: 'Mock Draft', href: '/mock-draft' },
  { icon: MessageSquare, label: 'Fan Chat', href: '/fan-chat' },
  { icon: BarChart3, label: 'Team Analytics', href: '/chicago-bears' },
  { icon: Video, label: 'Vision Theater', href: '/bears-film-room' },
  { icon: Volume2, label: 'Hands-Free Audio', href: '/audio' },
]

interface TrendsSidebarProps {
  selectedTeam: string
}

export default function TrendsSidebar({ selectedTeam }: TrendsSidebarProps) {
  const isForYou = !selectedTeam || selectedTeam === 'all'

  return (
    <aside className="sticky top-0 pl-6 hidden h-screen w-[350px] flex-col gap-4 pt-4 pb-3 lg:flex overflow-y-auto">
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
          {EDGE_TOOLS.map((item) => (
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
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hp-muted)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--hp-muted)', color: '#00D4FF', border: '1px solid #00D4FF' }}>
                <item.icon className="h-5 w-5" />
              </div>
              <span>{item.label}</span>
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
