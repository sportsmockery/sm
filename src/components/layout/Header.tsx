'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import BearsStickyBar from './BearsStickyBar'

// Bears submenu items
const bearsSubmenu = [
  {
    name: 'Roster',
    href: '/chicago-bears/roster',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    description: 'Full team roster with player profiles',
  },
  {
    name: 'Scores',
    href: '/chicago-bears/scores',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    description: 'Recent game results and box scores',
  },
  {
    name: 'Schedule',
    href: '/chicago-bears/schedule',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    description: '2025 season schedule and results',
  },
  {
    name: 'Stats',
    href: '/chicago-bears/stats',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    description: 'Team and player statistics',
  },
]

// Navigation items per design spec
const navItems = [
  { name: 'HOME', href: '/' },
  { name: 'BEARS', href: '/chicago-bears', hasSubmenu: true },
  { name: 'BULLS', href: '/chicago-bulls' },
  { name: 'CUBS', href: '/chicago-cubs' },
  { name: 'WHITE SOX', href: '/chicago-white-sox' },
  { name: 'BLACKHAWKS', href: '/chicago-blackhawks' },
]

const moreItems = [
  { name: 'Podcasts', href: '/podcasts' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Privacy', href: '/privacy' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [bearsMenuOpen, setBearsMenuOpen] = useState(false)
  const [bearsExpanded, setBearsExpanded] = useState(false) // For mobile
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null)
  const bearsMenuRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useTheme()

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false)
      }
      if (bearsMenuRef.current && !bearsMenuRef.current.contains(e.target as Node)) {
        setBearsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close menus on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        setSearchOpen(false)
        setMoreMenuOpen(false)
        setBearsMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="sticky top-0 z-[200] bg-white dark:bg-[#0a0a0b]">
      {/* Top Header Bar - Logo and Social */}
      <div className="border-b border-[#e0e0e0] dark:border-[#27272a] bg-white dark:bg-[#0a0a0b]">
        <div className="max-w-[1110px] mx-auto px-4">
          <div className="flex items-center justify-between h-[60px]">
            {/* Left: Social icons */}
            <div className="flex items-center gap-4 w-[100px]">
              <a
                href="https://facebook.com/sportsmockery"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#222] dark:text-white hover:text-[#bc0000] transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 320 512">
                  <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                </svg>
              </a>
              <a
                href="https://twitter.com/sportsmockery"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#222] dark:text-white hover:text-[#bc0000] transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 512 512">
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/sportsmockery"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#222] dark:text-white hover:text-[#bc0000] transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                </svg>
              </a>
              <a
                href="https://youtube.com/sportsmockery"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#222] dark:text-white hover:text-[#bc0000] transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 576 512">
                  <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
                </svg>
              </a>
            </div>

            {/* Center: Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Sports Mockery"
                width={220}
                height={65}
                className="h-8 md:h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Right: Theme toggle - pill switch style */}
            <div className="flex items-center gap-4 w-[100px] justify-end">
              <button
                onClick={toggleTheme}
                className={`relative w-[52px] h-[26px] rounded-full border border-[#bc0000] transition-colors ${
                  theme === 'dark' ? 'bg-[#bc0000]' : 'bg-white'
                }`}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {/* Toggle circle with star icon */}
                <span
                  className={`absolute top-[2px] w-[20px] h-[20px] rounded-full flex items-center justify-center transition-all duration-200 ${
                    theme === 'dark' ? 'left-[28px] bg-white' : 'left-[2px] bg-[#bc0000]'
                  }`}
                >
                  {/* Chicago 6-pointed star */}
                  <svg
                    className={`w-3 h-3 ${theme === 'dark' ? 'text-[#bc0000]' : 'text-white'}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="12,0 14.5,8 24,8 16.5,13 19,22 12,17 5,22 7.5,13 0,8 9.5,8" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - with red underline */}
      <nav className="border-b-[3px] border-[#bc0000] bg-white dark:bg-[#0a0a0b]">
        <div className="max-w-[1110px] mx-auto px-4">
          <div className="flex items-center justify-between h-[50px]">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#222] dark:text-white hover:text-[#bc0000]"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0">
              {navItems.map((item) => (
                item.hasSubmenu ? (
                  // Bears with dropdown
                  <div key={item.name} className="relative" ref={bearsMenuRef}>
                    <button
                      onMouseEnter={() => setBearsMenuOpen(true)}
                      onFocus={() => setBearsMenuOpen(true)}
                      onClick={() => setBearsMenuOpen(!bearsMenuOpen)}
                      className="flex items-center gap-1 px-4 py-4 text-[14px] font-bold text-[#222] dark:text-white uppercase tracking-[0.5px] hover:text-[#C83200] transition-colors"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {item.name}
                      <svg className={`w-3 h-3 transition-transform ${bearsMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Bears Dropdown Panel */}
                    {bearsMenuOpen && (
                      <div
                        className="absolute top-full left-0 mt-0 w-[280px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-md p-3 z-[200]"
                        onMouseLeave={() => setBearsMenuOpen(false)}
                      >
                        {/* Quick link to main Bears page */}
                        <Link
                          href="/chicago-bears"
                          onClick={() => setBearsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors mb-1"
                        >
                          <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0B162A 0%, #C83200 100%)' }}>
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                          </span>
                          <div>
                            <span className="block text-[14px] font-bold text-[var(--text-primary)]">Bears Hub</span>
                            <span className="block text-[11px] text-[var(--text-muted)]">News, analysis & more</span>
                          </div>
                        </Link>

                        <div className="h-px bg-[var(--border-subtle)] my-2" />

                        {bearsSubmenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setBearsMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                          >
                            <span className="w-8 h-8 rounded-lg bg-[#0B162A]/10 dark:bg-[#C83200]/10 flex items-center justify-center text-[#C83200]">
                              {subItem.icon}
                            </span>
                            <div>
                              <span className="block text-[14px] font-bold text-[var(--text-primary)]">{subItem.name}</span>
                              <span className="block text-[11px] text-[var(--text-muted)]">{subItem.description}</span>
                            </div>
                          </Link>
                        ))}

                        <div className="h-px bg-[var(--border-subtle)] my-2" />

                        {/* Player Profiles link */}
                        <Link
                          href="/chicago-bears-player"
                          onClick={() => setBearsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                        >
                          <span className="w-8 h-8 rounded-lg bg-[#0B162A]/10 dark:bg-[#C83200]/10 flex items-center justify-center text-[#C83200]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </span>
                          <div>
                            <span className="block text-[14px] font-bold text-[var(--text-primary)]">Player Profiles</span>
                            <span className="block text-[11px] text-[var(--text-muted)]">Search and explore all players</span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-4 py-4 text-[14px] font-bold text-[#222] dark:text-white uppercase tracking-[0.5px] hover:text-[#bc0000] transition-colors"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {item.name}
                  </Link>
                )
              ))}

              {/* MORE dropdown */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                  className="flex items-center gap-1 px-4 py-4 text-[14px] font-bold text-[#222] dark:text-white uppercase tracking-[0.5px] hover:text-[#bc0000] transition-colors"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  MORE
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {moreMenuOpen && (
                  <div className="absolute top-full left-0 mt-0 w-48 bg-white dark:bg-[#222] border border-[#e0e0e0] dark:border-[#333] shadow-md z-[100]">
                    {moreItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMoreMenuOpen(false)}
                        className="block px-5 py-2 text-[14px] text-[#222] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#333] transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-40 lg:w-56 px-3 py-1.5 text-sm bg-white dark:bg-[#1a1a1a] border border-[#e0e0e0] dark:border-[#333] focus:outline-none focus:border-[#bc0000]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className="p-2 text-[#666] hover:text-[#bc0000]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-[#222] dark:text-white hover:text-[#bc0000] transition-colors"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0a0a0b] border-b border-[#e0e0e0] dark:border-[#27272a]">
          <div className="max-w-[1110px] mx-auto px-4 py-4">
            {navItems.map((item) => (
              item.hasSubmenu ? (
                // Bears with expandable submenu
                <div key={item.name} className="border-b border-[#e0e0e0] dark:border-[#27272a]">
                  <button
                    onClick={() => setBearsExpanded(!bearsExpanded)}
                    className="w-full flex items-center justify-between py-3 text-[14px] font-bold text-[#222] dark:text-white uppercase tracking-[0.5px] hover:text-[#C83200]"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {item.name}
                    <svg
                      className={`w-4 h-4 transition-transform ${bearsExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded submenu */}
                  {bearsExpanded && (
                    <div className="pb-3 pl-4 space-y-1">
                      <Link
                        href="/chicago-bears"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-2 text-[14px] text-[var(--text-primary)] hover:text-[#C83200]"
                      >
                        <span className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0B162A 0%, #C83200 100%)' }}>
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                        </span>
                        Bears Hub
                      </Link>
                      {bearsSubmenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 py-2 text-[14px] text-[var(--text-secondary)] hover:text-[#C83200]"
                        >
                          <span className="w-6 h-6 rounded bg-[#0B162A]/10 dark:bg-[#C83200]/10 flex items-center justify-center text-[#C83200]">
                            {subItem.icon}
                          </span>
                          {subItem.name}
                        </Link>
                      ))}
                      <Link
                        href="/chicago-bears-player"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 py-2 text-[14px] text-[var(--text-secondary)] hover:text-[#C83200]"
                      >
                        <span className="w-6 h-6 rounded bg-[#0B162A]/10 dark:bg-[#C83200]/10 flex items-center justify-center text-[#C83200]">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                        Player Profiles
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-[14px] font-bold text-[#222] dark:text-white uppercase tracking-[0.5px] hover:text-[#bc0000] border-b border-[#e0e0e0] dark:border-[#27272a] last:border-0"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {item.name}
                </Link>
              )
            ))}
            {moreItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-[14px] text-[#666] dark:text-gray-400 hover:text-[#bc0000] border-b border-[#e0e0e0] dark:border-[#27272a] last:border-0"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bears Sticky Bar - Bears-first navigation */}
      <BearsStickyBar />
    </header>
  )
}
