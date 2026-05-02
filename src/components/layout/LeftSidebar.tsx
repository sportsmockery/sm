'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import type { Role } from '@/lib/roles'

const NAV_ITEMS = [
  {
    name: 'Scout AI',
    href: '/scout-ai',
    icon: (
      <Image src="/downloads/scout-v2.png" alt="Scout AI" width={20} height={20} style={{ borderRadius: '50%' }} />
    ),
  },
  {
    name: 'Simulators',
    href: '/gm',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M14 14l7 7M3 8V3h5M10 10L3 3" />
      </svg>
    ),
  },
  {
    name: 'Fan Hub',
    href: '/fan-zone',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    name: 'Data Cosmos',
    href: '/datahub',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
  {
    name: 'Original Shows',
    href: '/vision-theater',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
  },
  {
    name: 'Search',
    href: '/search',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
]

const TEAM_ITEMS = [
  { name: 'Bears', href: '/chicago-bears', abbr: 'CHI', color: '#0B162A' },
  { name: 'Bulls', href: '/chicago-bulls', abbr: 'CHI', color: '#CE1141' },
  { name: 'Cubs', href: '/chicago-cubs', abbr: 'CHC', color: '#0E3386' },
  { name: 'White Sox', href: '/chicago-white-sox', abbr: 'CWS', color: '#27251F' },
  { name: 'Blackhawks', href: '/chicago-blackhawks', abbr: 'CHI', color: '#CF0A2C' },
]

export default function LeftSidebar() {
  const pathname = usePathname()
  const { user, isAuthenticated, signOut } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [userRole, setUserRole] = useState<Role | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetch(`/api/user/role?email=${encodeURIComponent(user.email)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data?.role) setUserRole(data.role) })
        .catch(() => {})
    } else {
      setUserRole(null)
    }
  }, [isAuthenticated, user?.email])

  // Close profile popup on outside click
  useEffect(() => {
    if (!profileOpen) return
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [profileOpen])

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setExpanded(false); setProfileOpen(false) }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Don't render on standalone pages
  if (pathname?.startsWith('/home') || pathname === '/chicago-bears1' || pathname?.startsWith('/admin')) return null

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  return (
    <>
      <nav
        className="edge-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: expanded ? 240 : 75,
          background: 'rgba(12, 12, 18, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
         
        }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => { setExpanded(false); setProfileOpen(false) }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            height: expanded ? 156 : 72,
            padding: expanded ? '0 14px' : '0',
            textDecoration: 'none',
            flexShrink: 0,
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            gap: 8,
          }}
        >
          {expanded ? (
            <Image
              src="/downloads/edge-logo.png"
              alt="SM EDGE"
              width={540}
              height={144}
              unoptimized
              style={{ objectFit: 'contain', height: 132, width: 'auto' }}
            />
          ) : (
            <span
              className="edge-logo-collapsed"
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#FAFAFB',
                lineHeight: 1,
                transition: 'text-shadow 0.3s',
              }}
            >
              &#10038;
            </span>
          )}
        </Link>

        {/* Nav items */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                title={expanded ? undefined : item.name}
                className={`edge-nav-item${active ? ' edge-nav-active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  height: 40,
                  padding: expanded ? '0 14px' : '0',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  color: active ? '#00D4FF' : '#8899AA',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '0.01em',
                  transition: 'color 0.2s, background 0.2s',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                }}
              >
                <span style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  color: active ? '#00D4FF' : '#8899AA',
                  transition: 'color 0.2s',
                }}>
                  {item.icon}
                </span>
                {expanded && <span>{item.name}</span>}
                {active && (
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 20,
                    borderRadius: '0 3px 3px 0',
                    backgroundColor: '#00D4FF',
                  }} />
                )}
              </Link>
            )
          })}

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)', margin: '8px 10px' }} />

          {/* SM+ CTA */}
          <Link
            href="/pricing"
            title={expanded ? undefined : 'SM+ Premium'}
            className="edge-nav-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              height: 40,
              padding: expanded ? '0 14px' : '0',
              justifyContent: expanded ? 'flex-start' : 'center',
              color: '#FFD700',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'color 0.2s, background 0.2s',
            }}
          >
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20 }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </span>
            {expanded && <span>SM+ Premium</span>}
          </Link>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)', margin: '8px 10px' }} />

          {/* Teams section */}
          {expanded && (
            <div style={{
              padding: '4px 14px',
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#556677',
            }}>
              Teams
            </div>
          )}
          {TEAM_ITEMS.map((team) => {
            const active = isActive(team.href)
            return (
              <Link
                key={team.href}
                href={team.href}
                title={expanded ? undefined : team.name}
                className={`edge-nav-item${active ? ' edge-nav-active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  height: 36,
                  padding: expanded ? '0 14px' : '0',
                  justifyContent: expanded ? 'flex-start' : 'center',
                  color: active ? '#00D4FF' : '#8899AA',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s, background 0.2s',
                }}
              >
                <span style={{
                  flexShrink: 0,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: team.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 7,
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.02em',
                }}>
                  {team.name.charAt(0)}
                </span>
                {expanded && <span>{team.name}</span>}
              </Link>
            )
          })}
        </div>

        {/* Collapse chevron */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="edge-collapse-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'flex-end' : 'center',
            height: 36,
            padding: expanded ? '0 14px' : '0',
            background: 'none',
            border: 'none',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            cursor: 'pointer',
            color: '#556677',
            transition: 'color 0.2s',
            width: '100%',
          }}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              transition: 'transform 0.25s',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Bottom profile */}
        <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255, 255, 255, 0.06)', position: 'relative' }} ref={profileRef}>
          {isAuthenticated && user ? (
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: expanded ? '10px 12px' : '10px 0',
                justifyContent: expanded ? 'flex-start' : 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '2px solid #FFD700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name || 'User avatar'} width={24} height={24} unoptimized style={{ borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#FAFAFB' }}>
                    {(user.name || user.email)?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              {expanded && (
                <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#FAFAFB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name || user.email?.split('@')[0]}
                  </div>
                  <div style={{ fontSize: 10, color: '#556677', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </div>
                </div>
              )}
            </button>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: expanded ? '10px 12px' : '10px 0',
            }}>
              {expanded ? (
                <>
                  <Link href="/login" style={{ fontSize: 12, color: '#8899AA', textDecoration: 'none', fontWeight: 500 }}>Log in</Link>
                  <Link href="/signup" style={{
                    fontSize: 11, fontWeight: 700, color: '#121821',
                    backgroundColor: '#00D4FF', borderRadius: 6, padding: '4px 16px',
                    textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>Sign Up</Link>
                </>
              ) : (
                <Link href="/login" title="Log in" style={{ color: '#8899AA', display: 'flex' }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Link>
              )}
            </div>
          )}

          {/* Profile popup */}
          {profileOpen && isAuthenticated && user && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: expanded ? 8 : 52,
              marginBottom: 8,
              width: 200,
              borderRadius: 10,
              backgroundColor: 'rgba(12, 12, 18, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              zIndex: 1001,
            }}>
              <div style={{ padding: '8px 0' }}>
                {userRole === 'admin' && (
                  <Link href="/admin" onClick={() => setProfileOpen(false)} style={popupLinkStyle}>
                    Admin Dashboard
                  </Link>
                )}
                {(userRole === 'editor' || userRole === 'author') && (
                  <Link href="/studio" onClick={() => setProfileOpen(false)} style={popupLinkStyle}>
                    Creator Studio
                  </Link>
                )}
                <Link href="/profile" onClick={() => setProfileOpen(false)} style={popupLinkStyle}>
                  My Profile
                </Link>
                <Link href="/my-gm-score" onClick={() => setProfileOpen(false)} style={popupLinkStyle}>
                  My GM Score
                </Link>
                <div style={{ height: 1, background: 'rgba(255, 255, 255, 0.06)', margin: '4px 0' }} />
                <button
                  onClick={() => { setProfileOpen(false); signOut() }}
                  style={{
                    ...popupLinkStyle,
                    color: '#BC0000',
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar CSS */}
      <style>{`
        .edge-nav-item:hover {
          background: rgba(0, 212, 255, 0.06) !important;
          color: #00D4FF !important;
        }
        .edge-nav-item:hover svg { stroke: #00D4FF; }
        .edge-nav-active { background: rgba(0, 212, 255, 0.08); }
        @keyframes edgePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .edge-nav-active svg {
          animation: edgePulse 2.5s ease-in-out infinite;
        }
        .edge-collapse-btn:hover { color: #00D4FF !important; }
        .edge-logo-collapsed:hover { text-shadow: 0 0 12px #00D4FF, 0 0 24px rgba(0, 212, 255, 0.3) !important; }
        /* Hide sidebar on mobile — use MobileBottomNav instead */
        @media (max-width: 768px) {
          .edge-sidebar { display: none !important; }
        }
      `}</style>
    </>
  )
}

const popupLinkStyle: React.CSSProperties = {
  display: 'block',
  padding: '8px 16px',
  color: '#CCDDEE',
  fontSize: 13,
  textDecoration: 'none',
 
}
