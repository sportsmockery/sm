'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const tabs = [
  {
    label: 'Home',
    href: '/',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Scout AI',
    href: '/scout-ai',
    icon: () => (
      <Image src="/downloads/scout-v2.png" alt="Scout AI" width={24} height={24} style={{ borderRadius: '50%' }} />
    ),
  },
  {
    label: 'GM',
    href: '/gm',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M14 14l7 7M3 8V3h5M10 10L3 3" />
      </svg>
    ),
  },
  {
    label: 'Fan Hub',
    href: '/fan-zone',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: 64,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'var(--sm-nav-bg-scrolled, rgba(10,10,15,0.97))',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid var(--sm-border)',
        alignItems: 'center',
        justifyContent: 'space-around',
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              flex: 1,
              height: '100%',
              minWidth: 48,
              textDecoration: 'none',
              color: active ? 'var(--sm-red, #bc0000)' : 'var(--sm-text-muted)',
              transition: 'color 0.15s ease, transform 0.15s ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 10,
              background: active ? 'rgba(188, 0, 0, 0.1)' : 'transparent',
              transition: 'background 0.15s ease',
            }}>
              {tab.icon(active)}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: active ? 600 : 500,
                lineHeight: 1,
                letterSpacing: '0.01em',
              }}
            >
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
