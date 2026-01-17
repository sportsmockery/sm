'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import { usePathname } from 'next/navigation'

// Team navigation items with submenus - matches SportsMockery.com exactly
const teamNavItems = [
  {
    name: 'Bears',
    href: '/bears',
    subItems: [
      { name: 'Scores', href: '/bears/scores' },
      { name: 'Schedule', href: '/bears/schedule' },
      { name: 'Roster', href: '/bears/roster' },
      { name: 'Stats', href: '/bears/stats' },
    ],
  },
  {
    name: 'Bulls',
    href: '/bulls',
    subItems: [
      { name: 'Scores', href: '/bulls/scores' },
      { name: 'Schedule', href: '/bulls/schedule' },
      { name: 'Roster', href: '/bulls/roster' },
      { name: 'Stats', href: '/bulls/stats' },
    ],
  },
  {
    name: 'Blackhawks',
    href: '/blackhawks',
    subItems: [
      { name: 'Scores', href: '/blackhawks/scores' },
      { name: 'Schedule', href: '/blackhawks/schedule' },
      { name: 'Roster', href: '/blackhawks/roster' },
      { name: 'Stats', href: '/blackhawks/stats' },
    ],
  },
  {
    name: 'White Sox',
    href: '/white-sox',
    subItems: [
      { name: 'Scores', href: '/white-sox/scores' },
      { name: 'Schedule', href: '/white-sox/schedule' },
      { name: 'Roster', href: '/white-sox/roster' },
      { name: 'Stats', href: '/white-sox/stats' },
    ],
  },
  {
    name: 'Cubs',
    href: '/cubs',
    subItems: [
      { name: 'Scores', href: '/cubs/scores' },
      { name: 'Schedule', href: '/cubs/schedule' },
      { name: 'Roster', href: '/cubs/roster' },
      { name: 'Stats', href: '/cubs/stats' },
    ],
  },
  {
    name: 'Podcasts',
    href: '/podcasts',
    subItems: [
      { name: 'Bears Film Room', href: '/podcasts/bears-film-room' },
      { name: 'Pinwheels and Ivy', href: '/podcasts/pinwheels-and-ivy' },
    ],
  },
]

// Social icon components
function FacebookIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 320 512">
      <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
    </svg>
  )
}

function InstagramIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 448 512">
      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
    </svg>
  )
}

function TwitterIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 512 512">
      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
    </svg>
  )
}

function YouTubeIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 576 512">
      <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
    </svg>
  )
}

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

// Dropdown menu component
function DropdownMenu({ items, isOpen }: { items: { name: string; href: string }[]; isOpen: boolean }) {
  return (
    <div
      className={`absolute left-0 top-full mt-0 w-48 bg-white shadow-lg z-50 transition-all duration-150 ${
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
      }`}
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block px-4 py-2.5 text-sm text-[#222] hover:bg-gray-50 hover:text-[#bc0000] transition-colors border-b border-gray-100 last:border-0"
          style={{ fontFamily: 'ABeeZee, sans-serif' }}
        >
          {item.name}
        </Link>
      ))}
    </div>
  )
}

// Format current date like SportsMockery.com
function formatDate() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const now = new Date()
  return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`
}

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Don't render this header on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }

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
    <header className="bg-white sticky top-0 z-50">
      {/* Top Bar: Date left, Social icons + Apply button right */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1110px] mx-auto px-4">
          <div className="flex items-center justify-between h-8">
            {/* Left: Date */}
            <span className="text-xs text-black" style={{ fontFamily: 'ABeeZee, sans-serif' }}>
              {formatDate()}
            </span>

            {/* Right: Social icons + Apply button */}
            <div className="flex items-center gap-4">
              {/* Social icons */}
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com/sportsmockery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-[#bc0000] transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://instagram.com/sportsmockery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-[#bc0000] transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://twitter.com/sportsmockery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-[#bc0000] transition-colors"
                  aria-label="Twitter"
                >
                  <TwitterIcon className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://youtube.com/sportsmockery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black hover:text-[#bc0000] transition-colors"
                  aria-label="YouTube"
                >
                  <YouTubeIcon className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Apply button */}
              <Link
                href="/apply"
                className="bg-black text-white text-xs font-medium px-3 py-1 hover:bg-[#bc0000] transition-colors"
                style={{ fontFamily: 'ABeeZee, sans-serif' }}
              >
                APPLY
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Row: Logo centered */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1110px] mx-auto px-4">
          <div className="flex items-center justify-center py-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="https://www.sportsmockery.com/wp-content/uploads/2020/12/272.png"
                alt="Sports Mockery - Chicago Sports News"
                width={272}
                height={90}
                className="h-16 md:h-[70px] w-auto"
                priority
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Row */}
      <div className="border-b-[3px] border-[#bc0000] bg-white">
        <div className="max-w-[1110px] mx-auto px-4">
          <div className="flex items-center justify-center h-12">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden absolute left-4 p-2 text-[#222] hover:text-[#bc0000]"
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
              {teamNavItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 px-4 py-3 text-[14px] font-normal text-[#222] hover:text-[#bc0000] transition-colors"
                    style={{ fontFamily: 'ABeeZee, sans-serif' }}
                  >
                    {item.name}
                    <svg className="w-2.5 h-2.5 opacity-60 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
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
            <div className="absolute right-4 lg:relative lg:right-auto lg:ml-4">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-40 lg:w-52 px-3 py-1.5 text-sm bg-white border border-gray-300 focus:outline-none focus:border-[#bc0000]"
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
                  className="p-2 text-[#222] hover:text-[#bc0000] transition-colors"
                  aria-label="Search"
                >
                  <SearchIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`lg:hidden bg-white border-b border-gray-200 overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-[80vh]' : 'max-h-0'
        }`}
      >
        <nav className="max-w-[1110px] mx-auto px-4 py-3 space-y-0">
          {teamNavItems.map((item) => (
            <div key={item.name} className="border-b border-gray-100 last:border-0">
              <Link
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 text-sm font-normal text-[#222] hover:text-[#bc0000]"
                style={{ fontFamily: 'ABeeZee, sans-serif' }}
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
                      className="block py-2 text-sm text-gray-500 hover:text-[#bc0000]"
                      style={{ fontFamily: 'ABeeZee, sans-serif' }}
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
