'use client'

import Link from 'next/link'
import { TEAM_INFO } from '@/lib/types'

interface BearsStickyBarProps {
  className?: string
}

/**
 * Bears-focused sticky navigation bar
 * Shows Bears record, next game, and quick links
 * Height: 64px as specified in design spec
 */
export default function BearsStickyBar({ className = '' }: BearsStickyBarProps) {
  const bearsInfo = TEAM_INFO.bears

  // Stub data - would come from API in production
  const bearsData = {
    record: '4-8',
    nextGame: {
      opponent: 'vs GB',
      date: 'Sun',
      time: '12:00 PM',
    },
  }

  const quickLinks = [
    { name: 'News', href: '/chicago-bears' },
    { name: 'Data Hub', href: '/bears/data' },
    { name: 'Rumors', href: '/bears/rumors' },
    { name: 'Podcasts', href: '/podcasts?team=bears' },
  ]

  return (
    <div
      className={`h-[48px] bg-gradient-to-r from-[${bearsInfo.primaryColor}] to-[#1a2940] ${className}`}
      style={{
        background: `linear-gradient(to right, ${bearsInfo.primaryColor}, #1a2940)`,
      }}
    >
      <div className="max-w-[1110px] mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left: Bears badge + record */}
          <div className="flex items-center gap-3">
            {/* Bears logo/badge */}
            <Link
              href="/chicago-bears"
              className="flex items-center gap-2 group"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm"
                style={{ backgroundColor: bearsInfo.secondaryColor }}
              >
                <span className="font-montserrat">B</span>
              </div>
              <span
                className="hidden sm:inline text-white font-bold text-sm uppercase tracking-wide group-hover:text-orange-300 transition-colors"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Bears
              </span>
            </Link>

            {/* Record */}
            <div className="flex items-center gap-2 border-l border-white/20 pl-3">
              <span className="text-white/70 text-xs">Record:</span>
              <span
                className="text-white font-bold text-sm"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {bearsData.record}
              </span>
            </div>

            {/* Next game (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-2 border-l border-white/20 pl-3">
              <span className="text-white/70 text-xs">Next:</span>
              <span
                className="text-white font-semibold text-sm"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {bearsData.nextGame.opponent}
              </span>
              <span className="text-white/60 text-xs">
                {bearsData.nextGame.date} {bearsData.nextGame.time}
              </span>
            </div>
          </div>

          {/* Center: Quick links (hidden on small screens) */}
          <nav className="hidden lg:flex items-center gap-1">
            {quickLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-1.5 text-white/80 text-xs font-medium uppercase tracking-wide hover:text-white hover:bg-white/10 rounded transition-colors"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right: CTA button */}
          <Link
            href="/bears/subscribe"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide transition-all hover:scale-105"
            style={{
              backgroundColor: bearsInfo.secondaryColor,
              color: 'white',
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="hidden sm:inline">Get Bears Alerts</span>
            <span className="sm:hidden">Alerts</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
