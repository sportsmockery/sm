'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const teams = [
  { name: 'Bears', slug: 'chicago-bears', color: '#C83200', emoji: '🐻' },
  { name: 'Bulls', slug: 'chicago-bulls', color: '#CE1141', emoji: '🐂' },
  { name: 'Cubs', slug: 'chicago-cubs', color: '#0E3386', emoji: '🧸' },
  { name: 'White Sox', slug: 'chicago-white-sox', color: '#27251F', emoji: '⚾' },
  { name: 'Blackhawks', slug: 'chicago-blackhawks', color: '#CF0A2C', emoji: '🦅' },
]

export default function TeamDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--sm-text)' }}
      >
        Teams
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        className={`
          absolute left-0 top-full z-50 mt-1 w-56 origin-top-left overflow-hidden rounded-xl
          shadow-lg
          transition-all duration-200
          ${isOpen ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0'}
        `}
        style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}
      >
        <div className="p-2">
          {teams.map((team) => (
            <div key={team.slug} className="group">
              <Link
                href={`/teams/${team.slug}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors"
              >
                <span className="text-xl">{team.emoji}</span>
                <span className="font-medium" style={{ color: 'var(--sm-text)' }}>
                  {team.name}
                </span>
                <div
                  className="ml-auto h-2 w-2 rounded-full transition-transform group-hover:scale-150"
                  style={{ backgroundColor: team.color }}
                />
              </Link>
              {/* Sub-links */}
              <div className="ml-10 flex gap-2 pb-2">
                {['Schedule', 'Roster', 'Stats'].map((subPage) => (
                  <Link
                    key={subPage}
                    href={`/teams/${team.slug}/${subPage.toLowerCase()}`}
                    onClick={() => setIsOpen(false)}
                    className="text-xs"
                    style={{ color: 'var(--sm-text-dim)' }}
                  >
                    {subPage}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* View all link */}
        <div className="p-2" style={{ borderTop: '1px solid var(--sm-border)' }}>
          <Link
            href="/teams"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            style={{ color: '#8B0000' }}
          >
            View All Teams
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
