'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const teams = [
  { name: 'Bears', slug: 'chicago-bears', color: '#C83200', emoji: '🐻' },
  { name: 'Bulls', slug: 'chicago-bulls', color: '#CE1141', emoji: '🐂' },
  { name: 'Cubs', slug: 'chicago-cubs', color: '#0E3386', emoji: '🧸' },
  { name: 'White Sox', slug: 'chicago-white-sox', color: '#27251F', emoji: '⚾' },
  { name: 'Blackhawks', slug: 'chicago-blackhawks', color: '#CF0A2C', emoji: '🦅' },
]

const links = [
  { name: 'Predictions', href: '/predictions' },
  { name: 'Authors', href: '/authors' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity
          ${isOpen ? 'visible opacity-100' : 'invisible opacity-0'}
        `}
        onClick={onClose}
      />

      {/* Menu panel */}
      <div
        className={`
          fixed right-0 top-0 z-50 flex h-full w-80 max-w-[90vw] flex-col
          shadow-xl transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{ backgroundColor: 'var(--sm-card)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--sm-border)' }}>
          <span className="font-heading text-lg font-bold" style={{ color: 'var(--sm-text)' }}>
            Menu
          </span>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--sm-text-muted)' }}
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Teams */}
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)' }}>
              Teams
            </h3>
            <div className="space-y-1">
              {teams.map((team, index) => (
                <Link
                  key={team.slug}
                  href={`/${team.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 transition-all animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-xl">{team.emoji}</span>
                  <span className="font-medium" style={{ color: 'var(--sm-text)' }}>{team.name}</span>
                  <div
                    className="ml-auto h-2 w-2 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Other links */}
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sm-text-muted)' }}>
              More
            </h3>
            <div className="space-y-1">
              {links.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="block rounded-lg px-3 py-3 font-medium transition-colors animate-slide-up"
                  style={{ color: 'var(--sm-text)', animationDelay: `${(teams.length + index) * 50}ms` }}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: '1px solid var(--sm-border)' }}>
          <Link
            href="/search"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition-colors"
            style={{ backgroundColor: '#8B0000' }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search
          </Link>
        </div>
      </div>
    </>
  )
}
