'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightLeft, ClipboardPen, MessageSquare, BarChart3, Video, Volume2 } from 'lucide-react'

const edgeTools = [
  { id: 'gm', title: 'Trade Simulator', description: 'Play GM and build trades now.', href: '/gm', icon: ArrowRightLeft },
  { id: 'draft', title: 'Mock Draft', description: 'Run mock drafts with instant grades.', href: '/mock-draft', icon: ClipboardPen },
  { id: 'chat', title: 'Fan Chat', description: 'Live chat and conversation.', href: '/fan-chat', icon: MessageSquare },
  { id: 'analytics', title: 'Team Analytics', description: 'Stats, rosters, scores, and more.', href: '/chicago-bears', icon: BarChart3 },
  { id: 'vision', title: 'Vision Theater', description: 'Stream all the latest SM videos.', href: '/bears-film-room', icon: Video },
  { id: 'audio', title: 'Hands-Free Audio', description: 'Have articles continuously read to you.', href: '/audio', icon: Volume2 },
]

export default function ArticleSidebar() {
  return (
    <div className="flex flex-col gap-3">
      {/* Ask Scout */}
      <Link
        href="/scout-ai"
        className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all"
        style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-border)', textDecoration: 'none' }}
      >
        <Image
          src="/downloads/scout-v2.png"
          alt="Scout AI"
          width={48}
          height={48}
          className="h-12 w-12 object-contain flex-shrink-0"
        />
        <div className="flex-1 text-left" style={{ lineHeight: 1.2 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--sm-text)', margin: 0 }}>Ask Scout</p>
          <p style={{ fontSize: 13, color: 'var(--sm-text-muted)', margin: 0 }}>AI-powered sports analysis</p>
        </div>
        <span className="flex items-center gap-1.5" style={{ fontSize: 10, color: '#16a34a', fontWeight: 500 }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#16a34a' }} />
          Online
        </span>
      </Link>

      {/* SM EDGE Features */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-border)' }}>
        <div className="px-3 pt-3 pb-2">
          <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
            <span style={{ color: '#00D4FF' }}>SM</span>
            <span style={{ color: '#BC0000' }}>&#x2736;</span>
            <span style={{ color: '#00D4FF' }}>EDGE Features</span>
          </h2>
        </div>

        <div className="px-2.5 pb-3 flex flex-col gap-1">
          {edgeTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="flex items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-all"
              style={{ textDecoration: 'none' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--sm-surface)'
                const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement
                if (icon) icon.style.color = '#BC0000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                const icon = e.currentTarget.querySelector('[data-icon]') as HTMLElement
                if (icon) icon.style.color = '#00D4FF'
              }}
            >
              <div
                data-icon
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg self-center"
                style={{ background: 'var(--sm-card)', color: '#00D4FF', border: '1px solid #00D4FF', transition: 'color 0.2s' }}
              >
                <tool.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0" style={{ lineHeight: 1.3 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--sm-text)', margin: 0 }}>{tool.title}</p>
                <p className="line-clamp-2" style={{ fontSize: 12, color: 'var(--sm-text-muted)', margin: 0 }}>{tool.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
