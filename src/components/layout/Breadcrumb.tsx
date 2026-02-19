'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LABEL_MAP: Record<string, string> = {
  'chicago-bears': 'Bears',
  'chicago-bulls': 'Bulls',
  'chicago-cubs': 'Cubs',
  'chicago-white-sox': 'White Sox',
  'chicago-blackhawks': 'Blackhawks',
  'scout-ai': 'Scout AI',
  'mock-draft': 'Mock Draft',
  'fan-zone': 'Fan Zone',
  'fan-chat': 'Fan Chat',
  gm: 'Trade Simulator',
  datahub: 'Data Cosmos',
  leaderboards: 'Leaderboards',
  polls: 'Polls',
  predictions: 'Predictions',
  roster: 'Roster',
  schedule: 'Schedule',
  scores: 'Scores',
  stats: 'Stats',
  players: 'Players',
  live: 'Live',
}

function getLabel(segment: string): string {
  return LABEL_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
}

export default function Breadcrumb() {
  const pathname = usePathname()

  if (!pathname || pathname === '/') return null

  const segments = pathname.split('/').filter(Boolean)

  // Only show on pages with at least 2 segments (e.g. /chicago-bears/roster)
  // or specific tool pages
  const showOn = [
    'chicago-bears', 'chicago-bulls', 'chicago-cubs', 'chicago-white-sox', 'chicago-blackhawks',
    'gm', 'mock-draft', 'scout-ai', 'fan-zone', 'datahub', 'leaderboards', 'polls', 'predictions',
  ]

  if (!showOn.includes(segments[0])) return null

  const crumbs: { label: string; href: string }[] = [{ label: 'Home', href: '/' }]

  segments.forEach((segment, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/')
    crumbs.push({ label: getLabel(segment), href })
  })

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={crumb.href} style={{ display: 'contents' }}>
            {i > 0 && <span className="bc-sep" aria-hidden="true">&rsaquo;</span>}
            {isLast ? (
              <span className="bc-current" aria-current="page">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="bc-link">{crumb.label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
