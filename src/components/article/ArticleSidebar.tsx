'use client'

import Image from 'next/image'
import Link from 'next/link'
import FeedTeamSidebar from '@/components/homepage/FeedTeamSidebar'

const CATEGORY_TO_TEAM: Record<string, string> = {
  'chicago-bears': 'bears',
  'chicago-bulls': 'bulls',
  'chicago-blackhawks': 'blackhawks',
  'chicago-cubs': 'cubs',
  'chicago-white-sox': 'whitesox',
}

interface ArticleSidebarProps {
  categoryName?: string
  categorySlug?: string
}

export default function ArticleSidebar({ categoryName, categorySlug }: ArticleSidebarProps) {
  const teamKey = categorySlug ? CATEGORY_TO_TEAM[categorySlug] : null

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
          style={{ width: 'auto', height: 'auto' }}
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

      {/* Team Sidebar — season card, key players, trending */}
      {teamKey && <FeedTeamSidebar selectedTeam={teamKey} />}
    </div>
  )
}
