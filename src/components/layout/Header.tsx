'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import TeamStickyBarRouter from './TeamStickyBarRouter'

// Navigation items - proper casing (not all caps) per spec
const navItems = [
  {
    name: 'Bears',
    href: '/chicago-bears',
    submenu: [
      { name: 'News', href: '/chicago-bears' },
      { name: 'Schedule', href: '/chicago-bears/schedule' },
      { name: 'Scores', href: '/chicago-bears/scores' },
      { name: 'Stats', href: '/chicago-bears/stats' },
      { name: 'Roster', href: '/chicago-bears/roster' },
    ]
  },
  {
    name: 'Bulls',
    href: '/chicago-bulls',
    submenu: [
      { name: 'News', href: '/chicago-bulls' },
      { name: 'Schedule', href: '/chicago-bulls/schedule' },
      { name: 'Scores', href: '/chicago-bulls/scores' },
      { name: 'Stats', href: '/chicago-bulls/stats' },
      { name: 'Roster', href: '/chicago-bulls/roster' },
    ]
  },
  {
    name: 'Cubs',
    href: '/chicago-cubs',
    submenu: [
      { name: 'News', href: '/chicago-cubs' },
      { name: 'Schedule', href: '/chicago-cubs/schedule' },
      { name: 'Scores', href: '/chicago-cubs/scores' },
      { name: 'Stats', href: '/chicago-cubs/stats' },
      { name: 'Roster', href: '/chicago-cubs/roster' },
    ]
  },
  {
    name: 'White Sox',
    href: '/chicago-white-sox',
    submenu: [
      { name: 'News', href: '/chicago-white-sox' },
      { name: 'Schedule', href: '/chicago-white-sox/schedule' },
      { name: 'Scores', href: '/chicago-white-sox/scores' },
      { name: 'Stats', href: '/chicago-white-sox/stats' },
      { name: 'Roster', href: '/chicago-white-sox/roster' },
    ]
  },
  {
    name: 'Blackhawks',
    href: '/chicago-blackhawks',
    submenu: [
      { name: 'News', href: '/chicago-blackhawks' },
      { name: 'Schedule', href: '/chicago-blackhawks/schedule' },
      { name: 'Scores', href: '/chicago-blackhawks/scores' },
      { name: 'Stats', href: '/chicago-blackhawks/stats' },
      { name: 'Roster', href: '/chicago-blackhawks/roster' },
    ]
  },
]

const videoLinks = [
  { name: 'Bears Film Room', href: '/bears-film-room', icon: '/logos/bfr_logo.png', darkIcon: '/downloads/bfr.png' },
  { name: 'Pinwheels & Ivy', href: '/pinwheels-and-ivy', icon: '/logos/PI_logo.png', darkIcon: '/downloads/PI_white.png' },
]

const appLinks = [
  { name: 'Apple', href: 'https://apps.apple.com/us/app/sports-mockery/id680797716', icon: 'apple' },
  { name: 'Google Play', href: 'https://play.google.com/store/search?q=sports%20mockery&c=apps&hl=en_US', icon: 'google-play' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [videoMenuOpen, setVideoMenuOpen] = useState(false)
  const [appMenuOpen, setAppMenuOpen] = useState(false)
  const [activeTeamMenu, setActiveTeamMenu] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const videoMenuRef = useRef<HTMLDivElement>(null)
  const appMenuRef = useRef<HTMLDivElement>(null)
  const teamMenuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useTheme()
  const { user, isAuthenticated, signOut } = useAuth()

  // Track scroll position for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (videoMenuRef.current && !videoMenuRef.current.contains(e.target as Node)) {
        setVideoMenuOpen(false)
      }
      if (appMenuRef.current && !appMenuRef.current.contains(e.target as Node)) {
        setAppMenuOpen(false)
      }
      // Check all team menu refs
      if (activeTeamMenu) {
        const activeRef = teamMenuRefs.current[activeTeamMenu]
        if (activeRef && !activeRef.contains(e.target as Node)) {
          setActiveTeamMenu(null)
        }
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeTeamMenu])

  // Close menus on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        setSearchOpen(false)
        setVideoMenuOpen(false)
        setAppMenuOpen(false)
        setActiveTeamMenu(null)
        setUserMenuOpen(false)
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
    <header
      className={`sticky top-0 z-[200] transition-all duration-300 ${
        isScrolled
          ? 'shadow-md backdrop-blur-md'
          : ''
      }`}
      style={{
        backgroundColor: isScrolled
          ? theme === 'dark'
            ? 'rgba(0, 0, 0, 0.85)'
            : 'rgba(255, 255, 255, 0.9)'
          : 'var(--bg-header)',
      }}
    >
      {/* Top Header Bar - Logo and Social */}
      <div
        className="border-b transition-colors duration-300"
        style={{
          borderColor: 'var(--border-color)',
          backgroundColor: isScrolled ? 'transparent' : 'var(--bg-header)',
        }}
      >
        <div className="max-w-[1110px] mx-auto px-4">
          <div className="flex items-center justify-between h-[52px]">
            {/* Left: Social icons - hidden on mobile, show on tablet+ */}
            <div className="hidden sm:flex items-center gap-1 w-[140px]">
              <a
                href="https://facebook.com/sportsmockery"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--link-color)] transition-colors p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                style={{ color: 'var(--text-primary)' }}
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
                className="hover:text-[var(--link-color)] transition-colors p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                style={{ color: 'var(--text-primary)' }}
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 512 512">
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@bearsfilmroom"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--link-color)] transition-colors p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                style={{ color: 'var(--text-primary)' }}
                aria-label="Bears Film Room YouTube"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 576 512">
                  <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@sportsmockerychi"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--link-color)] transition-colors p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                style={{ color: 'var(--text-primary)' }}
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                  <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
                </svg>
              </a>
            </div>
            {/* Mobile: Empty spacer for centering */}
            <div className="sm:hidden w-[44px]" />

            {/* Center: Logo - swaps based on theme with hover animation */}
            <Link href="/" className="flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <Image
                  src={theme === 'dark' ? '/logo-white.png' : '/logo.png'}
                  alt="Sports Mockery"
                  width={220}
                  height={65}
                  className="h-8 md:h-10 w-auto object-contain"
                  priority
                />
              </motion.div>
            </Link>

            {/* Right: Theme toggle and Login */}
            <div className="flex items-center gap-3 justify-end">
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
              {/* User Profile / Login */}
              {isAuthenticated && user ? (
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-[var(--bg-surface)] transition-colors"
                  >
                    {/* User Avatar - show image if available, otherwise initials */}
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || 'User'}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#bc0000] flex items-center justify-center text-white text-sm font-bold">
                        {(user.name || user.email)?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span
                      className="text-xs font-medium max-w-[100px] truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {user.name || user.email?.split('@')[0] || 'User'}
                    </span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div
                      className="absolute top-full right-0 mt-1 w-48 rounded-lg shadow-lg z-[100]"
                      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                    >
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[var(--card-hover-bg)] transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                        <div className="my-1" style={{ borderTop: '1px solid var(--border-color)' }} />
                        <button
                          onClick={() => {
                            setUserMenuOpen(false)
                            signOut()
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm w-full text-left hover:bg-[var(--card-hover-bg)] transition-colors text-red-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-[#bc0000] text-[#bc0000] hover:bg-[#bc0000] hover:text-white transition-colors"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar - with red underline */}
      <nav
        className="border-b-[3px] border-[#bc0000] transition-colors duration-300"
        style={{ backgroundColor: isScrolled ? 'transparent' : 'var(--bg-header)' }}
      >
        <div className="max-w-[1110px] mx-auto px-4">
          <div className="flex items-center justify-between h-[44px]">
            {/* Mobile menu button - 44px min tap target */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:text-[var(--link-color)] min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ color: 'var(--text-primary)' }}
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

            {/* Desktop Navigation - Centered */}
            <div className="hidden lg:flex items-center justify-center flex-1 gap-0">
              {navItems.map((item) => (
                item.submenu ? (
                  <div
                    key={item.name}
                    className="relative"
                    ref={(el) => { teamMenuRefs.current[item.name] = el }}
                  >
                    <button
                      onClick={() => setActiveTeamMenu(activeTeamMenu === item.name ? null : item.name)}
                      className="flex items-center gap-1 px-4 py-4 text-[14px] font-bold hover:text-[var(--link-color)] transition-colors"
                      style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}
                    >
                      {item.name}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {activeTeamMenu === item.name && (
                      <div
                        className="absolute top-full left-0 mt-0 w-48 shadow-md z-[100]"
                        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                      >
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => setActiveTeamMenu(null)}
                            className="block px-5 py-2 text-[14px] hover:bg-[var(--card-hover-bg)] transition-colors"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-4 py-4 text-[14px] font-bold hover:text-[var(--link-color)] transition-colors"
                    style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}
                  >
                    {item.name}
                  </Link>
                )
              ))}

              {/* Video dropdown */}
              <div className="relative" ref={videoMenuRef}>
                <button
                  onClick={() => setVideoMenuOpen(!videoMenuOpen)}
                  className="flex items-center gap-1 px-4 py-4 text-[14px] font-bold hover:text-[var(--link-color)] transition-colors"
                  style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}
                >
                  Video
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {videoMenuOpen && (
                  <div
                    className="absolute top-full left-0 mt-0 w-56 shadow-md z-[100]"
                    style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                  >
                    {videoLinks.map((video) => (
                      <Link
                        key={video.name}
                        href={video.href}
                        onClick={() => setVideoMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[14px] hover:bg-[var(--card-hover-bg)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <Image
                          src={theme === 'dark' ? video.darkIcon : video.icon}
                          alt={video.name}
                          width={28}
                          height={28}
                          className="rounded-md flex-shrink-0"
                        />
                        <span className="flex-1">{video.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* App dropdown */}
              <div className="relative" ref={appMenuRef}>
                <button
                  onClick={() => setAppMenuOpen(!appMenuOpen)}
                  className="flex items-center gap-1 px-4 py-4 text-[14px] font-bold hover:text-[var(--link-color)] transition-colors"
                  style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)' }}
                >
                  App
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {appMenuOpen && (
                  <div
                    className="absolute top-full left-0 mt-0 w-48 shadow-md z-[100]"
                    style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                  >
                    {appLinks.map((app) => (
                      <a
                        key={app.name}
                        href={app.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setAppMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[14px] hover:bg-[var(--card-hover-bg)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {app.icon === 'apple' ? (
                          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 384 512">
                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 512 512">
                            <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                          </svg>
                        )}
                        <span className="flex-1">{app.name}</span>
                        <svg className="w-3 h-3 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Search + CTAs */}
            <div className="flex items-center gap-2">
              {/* Search */}
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-40 lg:w-56 px-3 py-1.5 text-sm focus:outline-none focus:border-[#bc0000]"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--input-text)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className="p-2 hover:text-[var(--link-color)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 hover:text-[var(--link-color)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  style={{ color: 'var(--text-primary)' }}
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}

              {/* Fan Chat CTA - Red bg, white text in light mode; White bg, red text in dark mode */}
              <Link
                href="/fan-chat"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  backgroundColor: theme === 'dark' ? '#ffffff' : '#bc0000',
                  color: theme === 'dark' ? '#bc0000' : '#ffffff',
                  border: 'none',
                  outline: 'none',
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke={theme === 'dark' ? '#bc0000' : '#ffffff'}
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Fan Chat
              </Link>

              {/* Ask AI CTA - Red bg, white text in light mode; White bg, red text in dark mode */}
              <Link
                href="/ask-ai"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  backgroundColor: theme === 'dark' ? '#ffffff' : '#bc0000',
                  color: theme === 'dark' ? '#bc0000' : '#ffffff',
                  border: 'none',
                  outline: 'none',
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke={theme === 'dark' ? '#bc0000' : '#ffffff'}
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Ask AI
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden" style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="max-w-[1110px] mx-auto px-4 py-4">
            {/* Mobile CTAs at top */}
            <div className="flex gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <Link
                href="/fan-chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  backgroundColor: theme === 'dark' ? '#ffffff' : '#bc0000',
                  color: theme === 'dark' ? '#bc0000' : '#ffffff',
                  border: 'none',
                  outline: 'none',
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke={theme === 'dark' ? '#bc0000' : '#ffffff'}
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Fan Chat
              </Link>
              <Link
                href="/ask-ai"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  backgroundColor: theme === 'dark' ? '#ffffff' : '#bc0000',
                  color: theme === 'dark' ? '#bc0000' : '#ffffff',
                  border: 'none',
                  outline: 'none',
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke={theme === 'dark' ? '#bc0000' : '#ffffff'}
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Ask AI
              </Link>
            </div>

            {navItems.map((item) => (
              item.submenu ? (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-3 text-[14px] font-bold hover:text-[var(--link-color)]"
                    style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}
                  >
                    {item.name}
                  </Link>
                  <div className="pl-4 border-l-2 border-[#C83200] ml-2">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 text-[13px] hover:text-[var(--link-color)]"
                        style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-[14px] font-bold hover:text-[var(--link-color)] last:border-0"
                  style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}
                >
                  {item.name}
                </Link>
              )
            ))}
            {/* Video section */}
            <div>
              <div
                className="py-3 text-[14px] font-bold"
                style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}
              >
                Video
              </div>
              <div className="pl-4 border-l-2 border-[#C83200] ml-2">
                {videoLinks.map((video) => (
                  <Link
                    key={video.name}
                    href={video.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 text-[13px] hover:text-[var(--link-color)]"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}
                  >
                    <Image
                      src={theme === 'dark' ? video.darkIcon : video.icon}
                      alt={video.name}
                      width={24}
                      height={24}
                      className="rounded-md flex-shrink-0"
                    />
                    <span className="flex-1">{video.name}</span>
                  </Link>
                ))}
              </div>
            </div>
            {/* App section */}
            <div>
              <div
                className="py-3 text-[14px] font-bold"
                style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}
              >
                App
              </div>
              <div className="pl-4 border-l-2 border-[#C83200] ml-2">
                {appLinks.map((app) => (
                  <a
                    key={app.name}
                    href={app.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 text-[13px] hover:text-[var(--link-color)]"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}
                  >
                    {app.icon === 'apple' ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 384 512">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 512 512">
                        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/>
                      </svg>
                    )}
                    <span className="flex-1">{app.name}</span>
                    <svg className="w-3 h-3 opacity-50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile Account Section */}
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || 'User'}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#bc0000] flex items-center justify-center text-white font-bold">
                        {(user.name || user.email)?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {user.name || user.email?.split('@')[0] || 'User'}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 text-[14px] hover:text-[var(--link-color)]"
                    style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut()
                    }}
                    className="flex items-center gap-3 py-3 text-[14px] w-full text-left text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 text-[14px] font-semibold rounded-lg bg-[#bc0000] text-white"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Sticky Bar - Shows appropriate team bar based on current page */}
      <TeamStickyBarRouter />
    </header>
  )
}
