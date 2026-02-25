'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/contexts/AuthContext'
import TeamStickyBarRouter from './TeamStickyBarRouter'
import LiveGamesTopBar from './LiveGamesTopBar'
import type { Role } from '@/lib/roles'

// 2030 nav links (center section)
const navLinks = [
  { name: 'Scout AI', href: '/scout-ai' },
  { name: 'Simulators', href: '/gm' },
  { name: 'Fan Hub', href: '/fan-zone' },
  { name: 'Data Cosmos', href: '/datahub' },
  { name: 'Vision Theater', href: '/vision-theater' },
  { name: 'SM+ Premium', href: '/pricing', cta: true },
]

// Team links for mobile drawer
const teamLinks = [
  { name: 'Bears', href: '/chicago-bears' },
  { name: 'Bulls', href: '/chicago-bulls' },
  { name: 'Cubs', href: '/chicago-cubs' },
  { name: 'White Sox', href: '/chicago-white-sox' },
  { name: 'Blackhawks', href: '/chicago-blackhawks' },
]

export default function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, signOut } = useAuth()

  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [myChicagoMode, setMyChicagoMode] = useState<'all' | 'my-teams'>('all')
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Load "My Chicago" mode from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sm-chicago-mode')
      if (saved === 'my-teams') setMyChicagoMode('my-teams')
    } catch {}
  }, [])

  // Toggle "My Chicago" mode and broadcast to homepage
  const toggleMyChicagoMode = () => {
    const next = myChicagoMode === 'all' ? 'my-teams' : 'all'
    setMyChicagoMode(next)
    try { localStorage.setItem('sm-chicago-mode', next) } catch {}
    window.dispatchEvent(new CustomEvent('sm-chicago-mode-change', { detail: next }))
  }

  // Fetch user role when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetch(`/api/user/role?email=${encodeURIComponent(user.email)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.role) setUserRole(data.role)
        })
        .catch(() => {})
    } else {
      setUserRole(null)
    }
  }, [isAuthenticated, user?.email])

  // Scroll detection: add .scrolled class when > 50px
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false)
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  // Don't render header on standalone landing pages
  if (pathname?.startsWith('/home') || pathname === '/chicago-bears1') {
    return null
  }

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <>
      {/* ===== FIXED NAV BAR (72px, frosted glass) ===== */}
      <nav className={`sm-nav${scrolled ? ' scrolled' : ''}`} aria-label="Main navigation">
        {/* LEFT: Logo */}
        <Link href="/" className="nav-logo">
          <Image
            src="/downloads/sm-logo-dark.png"
            alt="Sports Mockery"
            width={200}
            height={50}
            className="nav-logo-img nav-logo-light"
            priority
          />
          <Image
            src="/downloads/sm-logo-light.png"
            alt="Sports Mockery"
            width={200}
            height={50}
            className="nav-logo-img nav-logo-dark"
            priority
          />
        </Link>

        {/* CENTER: Nav links (hidden at <=768px by CSS) */}
        <div className="nav-links">
          {isAuthenticated && (
            <Link href="/feed" className="nav-feed-link">
              <span style={{ flexShrink: 0, fontSize: '14px', lineHeight: 1 }}>&#10038;</span>
              For You
            </Link>
          )}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={link.cta ? 'nav-cta' : ''}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* RIGHT: Mode toggle + Theme toggle + Auth + Search + Hamburger */}
        <div className="nav-right">
          {/* "My Chicago" mode toggle */}
          <button
            onClick={toggleMyChicagoMode}
            aria-label={myChicagoMode === 'all' ? 'Switch to My Teams' : 'Switch to Chicago'}
            className="my-chicago-toggle"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0',
              background: 'var(--sm-surface)',
              border: '1px solid var(--sm-border)',
              borderRadius: '100px',
              padding: '2px',
              cursor: 'pointer',
              position: 'relative',
              height: '28px',
              width: '120px',
              flexShrink: 0,
            }}
          >
            <span
              className="my-chicago-slider"
              style={{
                position: 'absolute',
                top: '2px',
                left: myChicagoMode === 'all' ? '2px' : 'calc(50% + 1px)',
                width: 'calc(50% - 3px)',
                height: 'calc(100% - 4px)',
                borderRadius: '100px',
                backgroundColor: '#bc0000',
                transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
            <span
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                color: myChicagoMode === 'all' ? '#ffffff' : 'var(--sm-text-muted)',
                position: 'relative',
                zIndex: 1,
                transition: 'color 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              Chicago
            </span>
            <span
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                color: myChicagoMode === 'my-teams' ? '#ffffff' : 'var(--sm-text-muted)',
                position: 'relative',
                zIndex: 1,
                transition: 'color 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              My Teams
            </span>
          </button>

          {/* Search icon */}
          <Link
            href="/search"
            aria-label="Search"
            style={{
              color: 'var(--sm-text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Theme toggle (Chicago star) */}
          <ThemeToggle />

          {/* Auth: User menu or Login/Sign Up */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || 'User'}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    style={{ width: '32px', height: '32px' }}
                    unoptimized
                  />
                ) : (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#bc0000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  >
                    {(user.name || user.email)?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <svg width="12" height="12" fill="none" stroke="var(--sm-text-muted)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User dropdown */}
              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '200px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--sm-surface)',
                    border: '1px solid var(--sm-border)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    zIndex: 1001,
                    overflow: 'hidden',
                  }}
                >
                  {/* User info header */}
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--sm-border)',
                    }}
                  >
                    <div style={{ color: 'var(--sm-text)', fontWeight: 600, fontSize: '14px' }}>
                      {user.name || user.email?.split('@')[0] || 'User'}
                    </div>
                    <div style={{ color: 'var(--sm-text-muted)', fontSize: '12px', marginTop: '2px' }}>
                      {user.email}
                    </div>
                  </div>

                  <div style={{ padding: '4px 0' }}>
                    {/* Admin Dashboard link */}
                    {userRole === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          color: 'var(--sm-text)',
                          fontSize: '14px',
                          textDecoration: 'none',
                        }}
                        className="hover:bg-[var(--sm-card-hover)] transition-colors"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}
                    {/* Creator Studio link for editors/authors */}
                    {(userRole === 'editor' || userRole === 'author') && (
                      <Link
                        href="/studio"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          color: 'var(--sm-text)',
                          fontSize: '14px',
                          textDecoration: 'none',
                        }}
                        className="hover:bg-[var(--sm-card-hover)] transition-colors"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Creator Studio
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        color: 'var(--sm-text)',
                        fontSize: '14px',
                        textDecoration: 'none',
                      }}
                      className="hover:bg-[var(--sm-card-hover)] transition-colors"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      href="/my-gm-score"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        color: 'var(--sm-text)',
                        fontSize: '14px',
                        textDecoration: 'none',
                      }}
                      className="hover:bg-[var(--sm-card-hover)] transition-colors"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      My GM Score
                    </Link>

                    <div style={{ borderTop: '1px solid var(--sm-border)', margin: '4px 0' }} />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        signOut()
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        color: '#ef4444',
                        fontSize: '14px',
                        width: '100%',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      className="hover:bg-[var(--sm-card-hover)] transition-colors"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Login / Sign Up buttons when not authenticated */
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                href="/login"
                style={{
                  color: 'var(--sm-text-muted)',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="nav-cta"
                style={{
                  fontSize: '13px',
                  padding: '8px 18px',
                  textDecoration: 'none',
                }}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Hamburger (shown at <=768px by CSS) */}
          <button
            className="nav-hamburger"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* ===== MOBILE DRAWER (slides in from right) ===== */}
      <div className={`mobile-drawer${drawerOpen ? ' open' : ''}`}>
        <div className="drawer-overlay" onClick={closeDrawer} />
        <div className="drawer-panel">
          {/* Close button at top of drawer */}
          <button
            onClick={closeDrawer}
            aria-label="Close menu"
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--sm-text-muted)',
              padding: '4px',
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Nav links in drawer */}
          {isAuthenticated && (
            <Link
              href="/feed"
              onClick={closeDrawer}
              className="nav-feed-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ flexShrink: 0, fontSize: '14px', lineHeight: 1 }}>&#10038;</span>
              For You
            </Link>
          )}
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={closeDrawer}>
              {link.name}
            </Link>
          ))}

          <hr />

          {/* Team links section header */}
          <div
            style={{
              color: 'var(--sm-text-muted)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              padding: '4px 0',
            }}
          >
            Teams
          </div>
          {teamLinks.map((team) => (
            <Link key={team.href} href={team.href} onClick={closeDrawer}>
              {team.name}
            </Link>
          ))}

          <hr />

          {/* Auth section in drawer */}
          {isAuthenticated && user ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                }}
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || 'User'}
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                    style={{ width: '36px', height: '36px' }}
                    unoptimized
                  />
                ) : (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#bc0000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {(user.name || user.email)?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <div style={{ color: 'var(--sm-text)', fontWeight: 600, fontSize: '14px' }}>
                    {user.name || user.email?.split('@')[0] || 'User'}
                  </div>
                  <div style={{ color: 'var(--sm-text-muted)', fontSize: '12px' }}>
                    {user.email}
                  </div>
                </div>
              </div>

              {userRole === 'admin' && (
                <Link href="/admin" onClick={closeDrawer}>
                  Admin Dashboard
                </Link>
              )}
              {(userRole === 'editor' || userRole === 'author') && (
                <Link href="/studio" onClick={closeDrawer}>
                  Creator Studio
                </Link>
              )}
              <Link href="/profile" onClick={closeDrawer}>
                My Profile
              </Link>
              <Link href="/my-gm-score" onClick={closeDrawer}>
                My GM Score
              </Link>
              <button
                onClick={() => {
                  closeDrawer()
                  signOut()
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ef4444',
                  fontSize: '16px',
                  fontWeight: 500,
                  fontFamily: "'Space Grotesk', sans-serif",
                  padding: '12px 0',
                  textAlign: 'left',
                  borderBottom: '1px solid var(--sm-border)',
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
              <Link
                href="/login"
                onClick={closeDrawer}
                style={{
                  textAlign: 'center',
                  padding: '12px',
                  border: '1px solid var(--sm-border)',
                  borderRadius: '8px',
                  color: 'var(--sm-text)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={closeDrawer}
                className="nav-cta"
                style={{
                  textAlign: 'center',
                  display: 'block',
                  textDecoration: 'none',
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ===== SPACER for fixed nav (72px) ===== */}
      <div style={{ height: 'var(--sm-nav-height)' }} />

      {/* ===== Live Games Top Bar - renders BELOW the nav ===== */}
      <LiveGamesTopBar isHomepage />

      {/* ===== Team Sticky Bar - contextual per team page ===== */}
      <TeamStickyBarRouter />
    </>
  )
}
