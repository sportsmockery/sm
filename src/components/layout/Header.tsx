'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'

// Team navigation items with submenus
const teamNavItems = [
  {
    name: 'BEARS',
    href: '/bears',
    subItems: [
      { name: 'News', href: '/bears' },
      { name: 'Scores', href: '/bears/scores' },
      { name: 'Schedule', href: '/bears/schedule' },
      { name: 'Roster', href: '/bears/roster' },
      { name: 'Stats', href: '/bears/stats' },
    ],
  },
  {
    name: 'BULLS',
    href: '/bulls',
    subItems: [
      { name: 'News', href: '/bulls' },
      { name: 'Scores', href: '/bulls/scores' },
      { name: 'Schedule', href: '/bulls/schedule' },
      { name: 'Roster', href: '/bulls/roster' },
      { name: 'Stats', href: '/bulls/stats' },
    ],
  },
  {
    name: 'BLACKHAWKS',
    href: '/blackhawks',
    subItems: [
      { name: 'News', href: '/blackhawks' },
      { name: 'Scores', href: '/blackhawks/scores' },
      { name: 'Schedule', href: '/blackhawks/schedule' },
      { name: 'Roster', href: '/blackhawks/roster' },
      { name: 'Stats', href: '/blackhawks/stats' },
    ],
  },
  {
    name: 'WHITE SOX',
    href: '/white-sox',
    subItems: [
      { name: 'News', href: '/white-sox' },
      { name: 'Scores', href: '/white-sox/scores' },
      { name: 'Schedule', href: '/white-sox/schedule' },
      { name: 'Roster', href: '/white-sox/roster' },
      { name: 'Stats', href: '/white-sox/stats' },
    ],
  },
  {
    name: 'CUBS',
    href: '/cubs',
    subItems: [
      { name: 'News', href: '/cubs' },
      { name: 'Scores', href: '/cubs/scores' },
      { name: 'Schedule', href: '/cubs/schedule' },
      { name: 'Roster', href: '/cubs/roster' },
      { name: 'Stats', href: '/cubs/stats' },
    ],
  },
  {
    name: 'PODCASTS',
    href: '/podcasts',
    subItems: [
      { name: 'Bears Film Room (BFR)', href: '/podcasts/bears-film-room' },
      { name: 'Pinwheels and Ivy', href: '/podcasts/pinwheels-and-ivy' },
    ],
  },
]

// Social icon component
function SocialIcon({ icon, className = '' }: { icon: string; className?: string }) {
  const icons: Record<string, ReactNode> = {
    facebook: (
      <svg className={className} fill="currentColor" viewBox="0 0 320 512">
        <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
      </svg>
    ),
    twitter: (
      <svg className={className} fill="currentColor" viewBox="0 0 512 512">
        <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
      </svg>
    ),
  }
  return icons[icon] || null
}

// Dropdown menu component
function DropdownMenu({ items, isOpen }: { items: { name: string; href: string }[]; isOpen: boolean }) {
  return (
    <div
      className={`absolute left-0 top-full mt-0 w-48 bg-white dark:bg-[#222] shadow-lg z-50 transition-all duration-150 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#333] hover:text-[#bc0000] transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
        >
          {item.name}
        </Link>
      ))}
    </div>
  )
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

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
    }, 100)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="bg-white dark:bg-[#0a0a0a] sticky top-0 z-50">
      {/* Main Header Row: Social icons | Logo | App Store buttons */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1110px] mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Left: Social icons */}
            <div className="flex items-center gap-5">
              <a
                href="https://facebook.com/sportsmockery"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black dark:text-white hover:text-[#bc0000] transition-colors"
                aria-label="Facebook"
              >
                <SocialIcon icon="facebook" className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/sportsmockery"
                target="_blank"
                rel="noopener noreferrer"
                className="text-black dark:text-white hover:text-[#bc0000] transition-colors"
                aria-label="X (Twitter)"
              >
                <SocialIcon icon="twitter" className="w-4 h-4" />
              </a>
            </div>

            {/* Center: Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="https://www.sportsmockery.com/wp-content/uploads/2020/12/272.png"
                alt="Sports Mockery - Chicago Sports News"
                width={272}
                height={90}
                className="h-16 md:h-20 w-auto dark:invert"
                priority
              />
            </Link>

            {/* Right: App store buttons + Theme toggle */}
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#bc0000] transition-colors"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* App Store buttons - hidden on small mobile */}
              <div className="hidden sm:flex flex-col gap-1">
                <a
                  href="#"
                  className="flex items-center gap-1.5 bg-black text-white text-[10px] px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="flex flex-col leading-none">
                    <span className="text-[7px] opacity-70">Download on the</span>
                    <span className="font-semibold text-[9px]">App Store</span>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-1.5 bg-black text-white text-[10px] px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                  </svg>
                  <div className="flex flex-col leading-none">
                    <span className="text-[7px] opacity-70">GET IT ON</span>
                    <span className="font-semibold text-[9px]">Google Play</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Row */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-[1110px] mx-auto px-4">
          <div className="flex items-center justify-center h-11">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden absolute left-4 p-2 text-gray-700 dark:text-gray-200 hover:text-[#bc0000]"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0">
              {teamNavItems.map((item, index) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 px-4 py-2.5 text-[13px] font-medium text-gray-800 dark:text-gray-200 hover:text-[#bc0000] transition-colors tracking-wide"
                    style={{ fontFamily: 'var(--font-montserrat), Montserrat, sans-serif' }}
                  >
                    {item.name}
                    <svg className="w-2.5 h-2.5 opacity-50 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  {item.subItems && (
                    <DropdownMenu items={item.subItems} isOpen={activeDropdown === item.name} />
                  )}
                </div>
              ))}
            </nav>

            {/* Search icon */}
            <div className="absolute right-4 lg:relative lg:right-auto lg:ml-2">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-40 lg:w-52 px-3 py-1.5 text-sm bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-[#bc0000]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className="p-1.5 text-gray-500 hover:text-[#bc0000]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-[#bc0000] transition-colors"
                  aria-label="Search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`lg:hidden bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-[80vh]' : 'max-h-0'
        }`}
      >
        <nav className="max-w-[1110px] mx-auto px-4 py-3 space-y-0">
          {teamNavItems.map((item) => (
            <div key={item.name} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
              <Link
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-sm font-medium text-gray-800 dark:text-white hover:text-[#bc0000]"
              >
                {item.name}
              </Link>
              {item.subItems && (
                <div className="pl-4 pb-2 space-y-0">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#bc0000]"
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  )
}
