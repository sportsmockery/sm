'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { homepageTeams } from '@/lib/homepage-team-data'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
}

const PRIMARY_ITEMS: NavItem[] = [
  {
    name: 'For You',
    href: '/feed',
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/edge-dash.png"
        alt="For You"
        width={22}
        height={22}
        style={{ width: 22, height: 22, objectFit: 'contain' }}
      />
    ),
  },
  {
    name: 'Scout',
    href: '/scout-ai',
    icon: (
      <Image src="/downloads/scout-v2.png" alt="Scout" width={22} height={22} style={{ borderRadius: '50%', width: 22, height: 22 }} />
    ),
  },
]

const TEAM_ID_TO_ROUTE: Record<string, string> = {
  bears: '/chicago-bears',
  bulls: '/chicago-bulls',
  cubs: '/chicago-cubs',
  blackhawks: '/chicago-blackhawks',
  whitesox: '/chicago-white-sox',
}

const TEAM_ITEMS: NavItem[] = homepageTeams.map((team) => ({
  name: team.name,
  href: TEAM_ID_TO_ROUTE[team.id] || `/chicago-${team.id}`,
  icon: (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={team.logo}
      alt={`${team.name} logo`}
      width={22}
      height={22}
      style={{ width: 22, height: 22, objectFit: 'contain' }}
      crossOrigin="anonymous"
    />
  ),
}))

const DISCOVER_ITEMS: NavItem[] = [
  {
    name: 'Trending',
    href: '/trending',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    name: 'Debates',
    href: '/debates',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    name: 'Rumors',
    href: '/rumors',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
]

const USER_ITEMS: NavItem[] = [
  {
    name: 'Profile',
    href: '/profile',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    name: 'Saved',
    href: '/saved',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
]

function NavSection({ label, items, isActive }: { label: string; items: NavItem[]; isActive: (href: string) => boolean }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        className="text-[#0B0F14]/50 dark:text-[#FAFAFB]/40"
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          padding: '8px 16px 4px',
        }}
      >
        {label}
      </div>
      {items.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`app-sidebar-item${active ? ' app-sidebar-active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              height: 38,
              padding: '0 16px',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: active ? 600 : 400,
              position: 'relative',
              transition: 'color 0.2s, background 0.2s',
            }}
          >
            <span
              className="app-sidebar-icon"
              style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                filter: active ? 'none' : 'grayscale(1)',
                opacity: active ? 1 : 0.6,
                transition: 'filter 0.2s, opacity 0.2s',
              }}
            >
              {item.icon}
            </span>
            <span>{item.name}</span>
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
    </div>
  )
}

export default function AppSidebar() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Close on outside click (mobile)
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed'
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 88,
          padding: '0 16px',
          textDecoration: 'none',
          flexShrink: 0,
        }}
        className="border-b border-[#0B0F14]/8 dark:border-[#FAFAFB]/8"
      >
        <Image
          src="/blitz_logo.svg"
          alt="SM Blitz"
          width={240}
          height={88}
          style={{ objectFit: 'contain', height: 72, width: 'auto' }}
        />
      </Link>

      {/* Nav sections */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
        <NavSection label="Primary" items={PRIMARY_ITEMS} isActive={isActive} />
        <NavSection label="Teams" items={TEAM_ITEMS} isActive={isActive} />
        <NavSection label="Discover" items={DISCOVER_ITEMS} isActive={isActive} />
        {isAuthenticated && (
          <NavSection label="User" items={USER_ITEMS} isActive={isActive} />
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="app-sidebar-desktop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 240,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 900,
          overflowX: 'hidden',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile hamburger button */}
      <button
        className="app-sidebar-hamburger"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 1100,
          width: 44,
          height: 44,
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
      >
        {mobileOpen ? (
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        ref={sidebarRef}
        className="app-sidebar-mobile"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: 260,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1050,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowX: 'hidden',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Styles */}
      <style>{`
        /* Desktop: show sidebar, hide hamburger */
        .app-sidebar-desktop {
          background-color: #FAFAFB;
          border-right: 1px solid rgba(11, 15, 20, 0.08);
          box-shadow: 4px 0 12px rgba(0, 212, 255, 0.08);
        }
        :root.dark .app-sidebar-desktop,
        .dark .app-sidebar-desktop {
          background-color: #0B0F14;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 4px 0 16px rgba(0, 212, 255, 0.12);
        }

        .app-sidebar-mobile {
          background-color: #FAFAFB;
          border-right: 1px solid rgba(11, 15, 20, 0.08);
        }
        :root.dark .app-sidebar-mobile,
        .dark .app-sidebar-mobile {
          background-color: #0B0F14;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .app-sidebar-hamburger {
          background-color: rgba(250, 250, 251, 0.9);
          color: #0B0F14;
        }
        :root.dark .app-sidebar-hamburger,
        .dark .app-sidebar-hamburger {
          background-color: rgba(11, 15, 20, 0.9);
          color: #FAFAFB;
        }

        .app-sidebar-item {
          color: #0B0F14;
        }
        :root.dark .app-sidebar-item,
        .dark .app-sidebar-item {
          color: #8899AA;
        }

        .app-sidebar-item:hover {
          background: rgba(0, 212, 255, 0.06) !important;
          color: #00D4FF !important;
        }
        .app-sidebar-item:hover svg {
          stroke: #00D4FF;
        }
        .app-sidebar-item:hover .app-sidebar-icon {
          filter: none !important;
          opacity: 1 !important;
        }

        .app-sidebar-active {
          color: #00D4FF !important;
          background: rgba(0, 212, 255, 0.08);
        }
        .app-sidebar-active .app-sidebar-icon {
          filter: none !important;
          opacity: 1 !important;
        }
        :root.dark .app-sidebar-active,
        .dark .app-sidebar-active {
          color: #00D4FF !important;
        }

        @media (min-width: 769px) {
          .app-sidebar-desktop { display: flex !important; }
          .app-sidebar-mobile { display: none !important; }
          .app-sidebar-hamburger { display: none !important; }
        }
        @media (max-width: 768px) {
          .app-sidebar-desktop { display: none !important; }
          .app-sidebar-mobile { display: flex !important; }
          .app-sidebar-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
