'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const orbLinks = [
  {
    label: 'Scout AI',
    href: '/scout-ai',
    icon: (
      <Image src="/downloads/scout-v2.png" alt="Scout AI" width={18} height={18} style={{ borderRadius: '50%' }} />
    ),
  },
  {
    label: 'Trade Sim',
    href: '/gm',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M14 14l7 7M3 8V3h5M10 10L3 3" />
      </svg>
    ),
  },
  {
    label: 'Mock Draft',
    href: '/mock-draft',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    label: 'Fan Hub',
    href: '/fan-zone',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Data Cosmos',
    href: '/datahub',
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
]

// Team page paths where NavigationOrb should be hidden (OrbNav handles navigation there)
const TEAM_PREFIXES = [
  '/chicago-bears',
  '/chicago-bulls',
  '/chicago-blackhawks',
  '/chicago-cubs',
  '/chicago-white-sox',
]

export default function NavigationOrb() {
  const [open, setOpen] = useState(false)
  const orbRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Hide on team pages where OrbNav already provides navigation
  const isTeamPage = TEAM_PREFIXES.some((prefix) => pathname?.startsWith(prefix))

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (orbRef.current && !orbRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  if (isTeamPage) return null

  return (
    <div ref={orbRef}>
      {/* Menu links */}
      <div className={`nav-orb-menu${open ? ' open' : ''}`}>
        {orbLinks.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            className="nav-orb-link"
            style={{
              transitionDelay: open ? `${i * 0.04}s` : '0s',
            }}
          >
            <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </div>

      {/* Orb button */}
      <button
        className="nav-orb"
        onClick={() => setOpen(!open)}
        aria-label="Quick navigation"
        aria-expanded={open}
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          style={{
            transition: 'transform 0.3s',
            transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          )}
        </svg>
      </button>
    </div>
  )
}
