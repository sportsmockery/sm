'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'
import { ThemeToggle } from '@/components/ThemeToggle'

// Team navigation items with submenus
const teamNavItems = [
  {
    name: 'Bears',
    href: '/bears',
    color: '#C83200',
    bgColor: '#0B162A',
    subItems: [
      { name: 'News', href: '/bears' },
      { name: 'Scores', href: '/bears/scores' },
      { name: 'Schedule', href: '/bears/schedule' },
      { name: 'Roster', href: '/bears/roster' },
      { name: 'Stats', href: '/bears/stats' },
    ],
  },
  {
    name: 'Bulls',
    href: '/bulls',
    color: '#ffffff',
    bgColor: '#CE1141',
    subItems: [
      { name: 'News', href: '/bulls' },
      { name: 'Scores', href: '/bulls/scores' },
      { name: 'Schedule', href: '/bulls/schedule' },
      { name: 'Roster', href: '/bulls/roster' },
      { name: 'Stats', href: '/bulls/stats' },
    ],
  },
  {
    name: 'Blackhawks',
    href: '/blackhawks',
    color: '#ffffff',
    bgColor: '#CF0A2C',
    subItems: [
      { name: 'News', href: '/blackhawks' },
      { name: 'Scores', href: '/blackhawks/scores' },
      { name: 'Schedule', href: '/blackhawks/schedule' },
      { name: 'Roster', href: '/blackhawks/roster' },
      { name: 'Stats', href: '/blackhawks/stats' },
    ],
  },
  {
    name: 'White Sox',
    href: '/white-sox',
    color: '#C4CED4',
    bgColor: '#27251F',
    subItems: [
      { name: 'News', href: '/white-sox' },
      { name: 'Scores', href: '/white-sox/scores' },
      { name: 'Schedule', href: '/white-sox/schedule' },
      { name: 'Roster', href: '/white-sox/roster' },
      { name: 'Stats', href: '/white-sox/stats' },
    ],
  },
  {
    name: 'Cubs',
    href: '/cubs',
    color: '#ffffff',
    bgColor: '#0E3386',
    subItems: [
      { name: 'News', href: '/cubs' },
      { name: 'Scores', href: '/cubs/scores' },
      { name: 'Schedule', href: '/cubs/schedule' },
      { name: 'Roster', href: '/cubs/roster' },
      { name: 'Stats', href: '/cubs/stats' },
    ],
  },
  {
    name: 'Podcasts',
    href: '/podcasts',
    color: '#bc0000',
    bgColor: 'transparent',
    subItems: [
      { name: 'Bears Film Room', href: '/podcasts/bears-film-room' },
      { name: 'Pinwheels and Ivy', href: '/podcasts/pinwheels-and-ivy' },
    ],
  },
]

// Social media links
const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/sportsmockery', icon: 'facebook' },
  { name: 'Twitter', href: 'https://twitter.com/sportsmockery', icon: 'twitter' },
  { name: 'Instagram', href: 'https://instagram.com/sportsmockery', icon: 'instagram' },
  { name: 'YouTube', href: 'https://youtube.com/sportsmockery', icon: 'youtube' },
]

// Social icon component
function SocialIcon({ icon, className = '' }: { icon: string; className?: string }) {
  const icons: Record<string, ReactNode> = {
    facebook: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
      </svg>
    ),
    twitter: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    instagram: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    youtube: (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  }
  return icons[icon] || null
}

// Dropdown menu component
function DropdownMenu({ items, isOpen }: { items: { name: string; href: string }[]; isOpen: boolean }) {
  return (
    <div
      className={`absolute left-0 top-full mt-0 w-48 bg-white dark:bg-[#1c1c1f] border border-gray-200 dark:border-[#27272a] shadow-lg z-50 transition-all duration-200 ${
        isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
      }`}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#27272a] hover:text-[#bc0000] transition-colors"
        >
          {item.name}
        </Link>
      ))}
    </div>
  )
}

export default function Header() {
  const { theme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        setSearchOpen(false)
        setActiveDropdown(null)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleMouseEnter = (name: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
    setActiveDropdown(name)
  }

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="bg-white dark:bg-[#0a0a0b] border-b border-gray-200 dark:border-[#27272a] sticky top-0 z-50">
      {/* Top bar with social and date */}
      <div className="border-b border-gray-100 dark:border-[#1c1c1f]">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-9">
            {/* Date */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 dark:text-gray-400 hover:text-[#bc0000] transition-colors"
                  aria-label={social.name}
                >
                  <SocialIcon icon={social.icon} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-[1800px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 dark:text-gray-200 hover:text-[#bc0000]"
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

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center">
              {/* Logo text - styled like SportsMockery */}
              <span className="text-xl lg:text-2xl font-black tracking-tight">
                <span className="text-[#bc0000]">SPORTS</span>
                <span className="text-gray-900 dark:text-white">MOCKERY</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {teamNavItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-[#bc0000] transition-colors uppercase tracking-wide"
                >
                  {item.name}
                  {item.subItems && (
                    <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>
                {item.subItems && (
                  <DropdownMenu items={item.subItems} isOpen={activeDropdown === item.name} />
                )}
              </div>
            ))}
          </nav>

          {/* Right side - Search, Theme Toggle, Sign In */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-48 lg:w-64 px-4 py-2 text-sm bg-gray-100 dark:bg-[#1c1c1f] border border-gray-200 dark:border-[#27272a] rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#bc0000]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className="px-3 py-2 bg-gray-100 dark:bg-[#1c1c1f] border border-l-0 border-gray-200 dark:border-[#27272a] rounded-r-lg text-gray-500 hover:text-[#bc0000]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-700 dark:text-gray-200 hover:text-[#bc0000] transition-colors"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Sign In */}
            <Link
              href="/login"
              className="hidden lg:block px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-[#bc0000] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`lg:hidden border-t border-gray-200 dark:border-[#27272a] overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="max-w-[1800px] mx-auto px-4 py-4 space-y-1 overflow-y-auto max-h-[70vh]">
          {teamNavItems.map((item) => (
            <div key={item.name} className="border-b border-gray-100 dark:border-[#27272a] pb-2 mb-2 last:border-0">
              <Link
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-semibold text-gray-900 dark:text-white hover:text-[#bc0000] uppercase"
              >
                {item.name}
              </Link>
              {item.subItems && (
                <div className="pl-4 space-y-1">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-[#bc0000]"
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-3 text-base font-semibold text-[#bc0000]"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  )
}
