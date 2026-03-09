"use client"

import Image from "next/image"
import { MoreHorizontal, ArrowRightLeft, Users, BarChart3, FileText, Play } from "lucide-react"

interface TrendsSidebarProps {
  selectedTeam: string
}

const edgeTools = [
  {
    id: "trade-sim",
    title: "Trade Simulator",
    description: "Build and grade trades with AI logic.",
    cta: "Open",
    icon: ArrowRightLeft,
    href: "/gm",
  },
  {
    id: "fan-hub",
    title: "Fan Hub",
    description: "Live chat, polls, and conversations.",
    cta: "Join",
    icon: Users,
    href: "/fan-chat",
  },
  {
    id: "data-cosmos",
    title: "Data Cosmos",
    description: "Stats, schedules, and leaderboards.",
    cta: "Explore",
    icon: BarChart3,
    href: "/chicago-bears",
  },
  {
    id: "mock-draft",
    title: "Mock Draft",
    description: "Run mocks with instant grades.",
    cta: "Start",
    icon: FileText,
    href: "/mock-draft",
  },
  {
    id: "shows",
    title: "Original Shows",
    description: "Exclusive series and breakdowns.",
    cta: "Watch",
    icon: Play,
    href: "/bears-film-room",
  },
]

export default function TrendsSidebar({ selectedTeam }: TrendsSidebarProps) {
  return (
    <aside className="sticky top-0 pl-6 hidden h-screen w-[350px] flex-col gap-4 pt-4 pb-3 lg:flex overflow-y-auto">
      {/* User Profile */}
      <button className="hp-sidebar-card flex items-center gap-3 p-4 hp-tap-target">
        <div
          className="h-11 w-11 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
          style={{ background: '#bc0000' }}
        >
          <span className="text-white font-bold">SM</span>
        </div>
        <div className="flex flex-1 flex-col text-left text-sm">
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--hp-foreground)' }}>Sports Mockery</span>
          <span style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>@SportsMockery</span>
        </div>
        <MoreHorizontal className="h-5 w-5" style={{ color: 'var(--hp-muted-foreground)' }} />
      </button>

      {/* Ask Scout - Quick Access */}
      <button className="hp-sidebar-card w-full p-4 flex items-center gap-3 group transition-all">
        <Image
          src="/downloads/scout-v2.png"
          alt="Scout AI"
          width={40}
          height={40}
          className="h-10 w-10 object-contain flex-shrink-0"
        />
        <div className="flex-1 text-left">
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--hp-foreground)' }}>Ask Scout</p>
          <p style={{ fontSize: 11, color: 'var(--hp-muted-foreground)' }}>AI-powered sports analysis</p>
        </div>
        <span className="flex items-center gap-1.5" style={{ fontSize: 10, color: '#16a34a', fontWeight: 500 }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
          Online
        </span>
      </button>

      {/* SM Edge Tools */}
      <div className="hp-sidebar-card overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--hp-foreground)' }}>SM Edge Tools</h2>
        </div>

        <div className="px-3 pb-4 flex flex-col gap-1.5">
          {edgeTools.map((tool) => (
            <a
              key={tool.id}
              href={tool.href}
              className="group flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all hp-tap-target"
              style={{ textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hp-muted)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                style={{ background: 'var(--hp-muted)', color: 'var(--hp-muted-foreground)' }}
              >
                <tool.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--hp-foreground)', lineHeight: 1.3 }}>{tool.title}</p>
                <p className="truncate" style={{ fontSize: 11, color: 'var(--hp-muted-foreground)', lineHeight: 1.3 }}>{tool.description}</p>
              </div>
              <span
                className="shrink-0 rounded-lg px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ fontSize: 10, fontWeight: 500, color: 'var(--hp-muted-foreground)', border: '1px solid var(--hp-border)' }}
              >
                {tool.cta}
              </span>
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
