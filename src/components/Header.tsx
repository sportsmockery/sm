'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

const navLinks = [
  { name: 'Bears', href: '/chicago-bears', color: '#C83200', bg: '#0B162A' },
  { name: 'Bulls', href: '/chicago-bulls', color: '#CE1141', bg: '#000000' },
  { name: 'Cubs', href: '/chicago-cubs', color: '#0E3386', bg: '#CC3433' },
  { name: 'White Sox', href: '/chicago-white-sox', color: '#27251F', bg: '#C4CED4' },
  { name: 'Blackhawks', href: '/chicago-blackhawks', color: '#CF0A2C', bg: '#000000' },
]

const trendingHeadlines = [
  "Bears sign key free agent to bolster defense",
  "Bulls eyeing major trade deadline moves",
  "Cubs prospect called up to majors",
  "White Sox rebuilding ahead of schedule",
  "Blackhawks' young core showing promise",
]

export default function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [teamsDropdownOpen, setTeamsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTeamsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileMenuOpen(false)
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg shadow-lg'
          : 'bg-white dark:bg-zinc-950'
      }`}
    >
      {/* Red accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#FF0000] via-[#8B0000] to-[#FF0000]" />

      {/* Trending ticker */}
      <div className="bg-zinc-900 dark:bg-black overflow-hidden">
        <div className="flex items-center">
          <div className="shrink-0 bg-[#8B0000] px-3 py-1">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Trending</span>
          </div>
          <div className="relative flex-1 overflow-hidden">
            <div className="animate-ticker flex whitespace-nowrap py-1">
              {[...trendingHeadlines, ...trendingHeadlines].map((headline, i) => (
                <span
                  key={i}
                  className="inline-block px-8 text-xs text-zinc-300 hover:text-white cursor-pointer transition-colors"
                >
                  {headline}
                  <span className="mx-8 text-[#8B0000]">•</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-11 h-11 bg-gradient-to-br from-[#FF0000] to-[#8B0000] rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-white font-black text-xl tracking-tighter font-[var(--font-montserrat)]">SM</span>
              <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white font-[var(--font-montserrat)] leading-none">
                SPORTS
              </span>
              <span className="text-xl font-black tracking-tight text-[#8B0000] font-[var(--font-montserrat)] leading-none">
                MOCKERY
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-1">
            {/* Teams Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setTeamsDropdownOpen(!teamsDropdownOpen)}
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
              >
                Teams
                <svg
                  className={`w-4 h-4 transition-transform ${teamsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {teamsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-scale-in">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
                      onClick={() => setTeamsDropdownOpen(false)}
                    >
                      <span
                        className="w-3 h-3 rounded-full shadow-sm group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: link.color }}
                      />
                      <span className="font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">
                        {link.name}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="px-4 py-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="px-4 py-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm placeholder:text-zinc-400 focus:border-[#8B0000] focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#8B0000] transition-colors"
                  aria-label="Search"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* User icon placeholder */}
            <button
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label="User account"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-t border-zinc-200 py-4 lg:hidden dark:border-zinc-800 animate-slide-down">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm placeholder:text-zinc-400 focus:border-[#8B0000] focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#8B0000]"
                  aria-label="Search"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Teams section */}
            <div className="mb-4">
              <h3 className="px-3 mb-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Teams</h3>
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: link.color }}
                    />
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Other links */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
              <Link
                href="/about"
                className="block rounded-lg px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block rounded-lg px-3 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
