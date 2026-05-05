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

// Hardcoded top-level directories under src/app/ that own their own 2-segment
// routes (e.g. /admin/users, /author/jane). When the first segment is one of
// these AND the URL has 2 segments, it's NOT an article.
// (Team-hub slugs are intentionally NOT in this set — see TEAM_HUB_SLUGS below.)
const NON_ARTICLE_TOP_LEVEL = new Set([
  'about', 'admin', 'api', 'apply', 'ar', 'ar2', 'ar3', 'audio',
  'author', 'authors', 'bears', 'bears-film-room', 'chat',
  'chicago-bears-player', 'chicago-bears1',
  'collectibles', 'contact', 'datahub', 'designs',
  'edge', 'editorial-standards', 'fan-chat', 'fan-zone', 'feed',
  'forgot-password', 'game-center', 'gm', 'governance', 'home', 'home1',
  'home2', 'leaderboard', 'leaderboards', 'live', 'login', 'masters',
  'metaverse', 'mock-draft', 'my-gm-score', 'newsletter', 'notifications',
  'owner', 'pinwheels-and-ivy', 'players', 'polls', 'predictions',
  'pricing', 'privacy', 'profile', 'reset-password', 'river', 'scout-ai',
  'search', 'signup', 'sitemaps', 'southside-behavior', 'studio',
  'subscription', 'tag', 'teams', 'terms', 'testing', 'training',
  'untold-chicago-stories', 'vision-theater',
])

// Team-hub slugs are special: they have hardcoded subroutes (roster, schedule,
// etc.) but ALSO serve articles at /<team>/<article-slug> via the dynamic
// [category]/[slug] fallback. So a URL like /chicago-bears/some-headline IS
// an article, but /chicago-bears/roster is NOT.
const TEAM_HUB_SLUGS = new Set([
  'chicago-bears', 'chicago-bulls', 'chicago-cubs',
  'chicago-blackhawks', 'chicago-white-sox',
])

const TEAM_SUBROUTES = new Set([
  'cap-tracker', 'depth-chart', 'draft-tracker', 'game-center', 'live',
  'news', 'players', 'roster', 'schedule', 'scores', 'stats', 'trade-rumors',
])

function isArticleRoute(pathname: string | null): boolean {
  if (!pathname) return false
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length !== 2) return false
  const [first, second] = segments
  // Team-hub URL — article unless second segment is a known subroute.
  if (TEAM_HUB_SLUGS.has(first)) {
    return !TEAM_SUBROUTES.has(second)
  }
  // Otherwise: article unless first segment is a non-article hardcoded dir.
  return !NON_ARTICLE_TOP_LEVEL.has(first)
}

export default function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, signOut } = useAuth()

  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

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

  // Don't render header on immersive article routes — the article page
  // mounts its own ArticleProgressHeader for reader-mode chrome.
  // Articles live at /[category]/[slug] (exactly 2 path segments where the
  // first is NOT a hardcoded top-level directory). When you add a new
  // top-level route to src/app/, add its segment to NON_ARTICLE_TOP_LEVEL
  // (or TEAM_SUBROUTES if it's a new sub-page under a team hub).
  if (isArticleRoute(pathname)) {
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

        {/* RIGHT: Theme toggle + Auth + Search + Hamburger */}
        <div className="nav-right">
          {/* Search icon */}
          <Link
            href="/search"
            aria-label="Search"
            className="tap-target focus-ring"
            style={{
              color: 'var(--sm-text-muted)',
              borderRadius: '10px',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                aria-label="Account menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="focus-ring"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  minHeight: '44px',
                  borderRadius: '999px',
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
                <svg width="14" height="14" fill="none" stroke="var(--sm-text-muted)" viewBox="0 0 24 24" aria-hidden="true">
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
                        color: '#BC0000',
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
            className="nav-hamburger focus-ring"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen}
            aria-controls="primary-mobile-drawer"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* ===== MOBILE DRAWER (slides in from right) ===== */}
      <div
        id="primary-mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={`mobile-drawer${drawerOpen ? ' open' : ''}`}
      >
        <div className="drawer-overlay" onClick={closeDrawer} />
        <div className="drawer-panel safe-right">
          {/* Close button at top of drawer */}
          <button
            onClick={closeDrawer}
            aria-label="Close menu"
            className="tap-target focus-ring"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--sm-text-muted)',
              borderRadius: '10px',
            }}
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Nav links in drawer */}
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
                  color: '#BC0000',
                  fontSize: '16px',
                  fontWeight: 500,
                 
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
