'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const orbLinks = [
  { label: 'Scout AI', href: '/scout-ai', icon: '🧠' },
  { label: 'Trade Sim', href: '/gm', icon: '🔄' },
  { label: 'Mock Draft', href: '/mock-draft', icon: '📋' },
  { label: 'Fan Hub', href: '/fan-zone', icon: '🏟' },
  { label: 'Data Cosmos', href: '/datahub', icon: '📊' },
]

export default function NavigationOrb() {
  const [open, setOpen] = useState(false)
  const orbRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

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
            <span style={{ fontSize: '14px' }}>{link.icon}</span>
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
