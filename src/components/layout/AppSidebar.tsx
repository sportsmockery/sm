'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { homepageTeams } from '@/lib/homepage-team-data'
import { ArrowRightLeft, ClipboardPen, MessageSquare, BarChart3, Video, Volume2, MoreVertical, Tv } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
}

const EDGE_TOOLS: { id: string; title: string; href: string; icon: React.ComponentType<{ className?: string }>; liveOnly?: boolean }[] = [
  { id: 'game-center', title: 'Game Center', href: '/live', icon: Tv, liveOnly: true },
  { id: 'draft', title: 'War Room', href: '/gm', icon: ClipboardPen },
  { id: 'chat', title: 'Fan Chat', href: '/fan-chat', icon: MessageSquare },
  { id: 'analytics', title: 'Team Stats', href: '/chicago-bears', icon: BarChart3 },
  { id: 'vision', title: 'Vision Theater', href: '/bears-film-room', icon: Video },
  { id: 'audio', title: 'Hands-Free Audio', href: '/audio', icon: Volume2 },
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
  const { user, isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [hasLiveGames, setHasLiveGames] = useState(false)

  // Poll for live games to show/hide Game Center
  useEffect(() => {
    const check = () => {
      fetch('/api/hero-games')
        .then(r => r.json())
        .then(d => setHasLiveGames(d.games?.length > 0))
        .catch(() => {})
    }
    check()
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [])

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
          padding: '12px 14px 25px',
          textDecoration: 'none',
          flexShrink: 0,
        }}
        className="border-b border-[#0B0F14]/8 dark:border-[#FAFAFB]/8"
      >
        <Image
          src="/downloads/edge-logo-sidebar.png"
          alt="SM Edge"
          width={600}
          height={209}
          unoptimized
          style={{ objectFit: 'contain', height: 70, width: 'auto' }}
        />
      </Link>

      {/* Ask Scout — compact, replaces Primary */}
      <div style={{ padding: '12px 12px 8px', flexShrink: 0 }}>
        <Link
          href="/scout-ai"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 12,
            background: 'var(--sm-surface)',
            border: '1px solid var(--sm-border)',
            textDecoration: 'none',
          }}
        >
          <Image
            src="/downloads/scout-v2.png"
            alt="Scout"
            width={28}
            height={28}
            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'contain', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--sm-text)', margin: 0, lineHeight: 1.2 }}>Ask Scout</p>
            <p style={{ fontSize: 10, color: 'var(--sm-text-muted)', margin: 0, lineHeight: 1.2 }}>AI sports analysis</p>
          </div>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} title="Online" />
        </Link>
      </div>

      {/* Nav sections + SM EDGE Features — no scroll, compact */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <NavSection label="Teams" items={TEAM_ITEMS} isActive={isActive} />
        {/* SM EDGE Features — compact, fits without scroll */}
        <div style={{ marginTop: 12, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 16px 4px' }}>
            <span style={{ color: '#00D4FF' }}>SM</span>
            <span style={{ color: '#BC0000' }}> &#x2736; </span>
            <span style={{ color: '#00D4FF' }}>EDGE Features</span>
          </div>
          <div style={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-border)', borderRadius: 12, overflow: 'hidden' }}>
            {EDGE_TOOLS.filter(tool => !tool.liveOnly || hasLiveGames).map((tool, idx, arr) => (
              <Link
                key={tool.id}
                href={tool.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--sm-text)',
                  borderBottom: idx !== arr.length - 1 ? '1px solid var(--sm-border)' : 'none',
                  ...(tool.id === 'game-center' ? { border: '1px solid #00D4FF', borderRadius: 12, margin: 4, padding: '8px 10px' } : {}),
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    background: 'var(--sm-card)',
                    color: '#00D4FF',
                    border: '1px solid #00D4FF',
                  }}
                >
                  <tool.icon className="h-3 w-3" />
                </div>
                <span className="truncate" style={{ flex: 1, minWidth: 0 }}>{tool.title}</span>
                {(tool.id === 'chat' || tool.id === 'game-center') && (
                  <span
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 6px',
                      borderRadius: 'var(--sm-radius-pill)',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                      color: '#22c55e',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      background: 'rgba(34, 197, 94, 0.12)',
                    }}
                  >
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#22c55e' }} />
                    LIVE
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* User profile — bottom of sidebar, under Hands-Free Audio */}
      {isAuthenticated && user && (
        <div
          style={{
            flexShrink: 0,
            marginTop: 'auto',
            padding: '12px 8px 16px',
            borderTop: '1px solid var(--sm-border)',
          }}
        >
          <Link
            href="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 12,
              background: 'var(--sm-surface)',
              border: '1px solid var(--sm-border)',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                background: 'var(--sm-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt=""
                  width={36}
                  height={36}
                  style={{ width: 36, height: 36, objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--sm-text-muted)' }}>
                  {(user.name || user.email || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span
              className="truncate"
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--sm-text)',
              }}
            >
              {user.name || user.email?.split('@')[0] || 'Profile'}
            </span>
            <MoreVertical
              size={18}
              style={{ flexShrink: 0, color: 'var(--sm-text-muted)' }}
              aria-hidden
            />
          </Link>
        </div>
      )}
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

        @media (min-width: 1024px) {
          .app-sidebar-desktop { display: flex !important; }
          .app-sidebar-mobile { display: none !important; }
          .app-sidebar-hamburger { display: none !important; }
        }
        @media (max-width: 1023px) {
          .app-sidebar-desktop { display: none !important; }
          .app-sidebar-mobile { display: flex !important; }
          .app-sidebar-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  )
}
