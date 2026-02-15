'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Scout AI', href: '/home/scout' },
  { label: 'Simulators', href: '/home/simulators' },
  { label: 'Fan Hub', href: '/home/fan-hub' },
  { label: 'Data Cosmos', href: '/home/data' },
  { label: 'SM+', href: '/home/premium' },
]

export default function HomeNav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 48px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(5,5,8,0.92)' : 'rgba(5,5,8,0.7)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transition: 'background 0.3s ease',
      }}
    >
      <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <Image src="/logos/v2_header_dark.png" alt="Sports Mockery" width={140} height={40} style={{ height: 'auto' }} priority />
      </Link>

      {/* Desktop links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hm-nav-desktop">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: pathname === link.href ? '#fff' : '#8a8a9a',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'color 0.2s',
              letterSpacing: -0.2,
            }}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/home"
          style={{
            background: 'linear-gradient(135deg, #bc0000, #ff4444)',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: 100,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
            transition: 'all 0.3s',
            boxShadow: '0 0 20px rgba(188,0,0,0.3)',
          }}
        >
          Enter the Experience
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="hm-nav-mobile-btn"
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: '#fff',
          fontSize: 24,
          cursor: 'pointer',
          padding: 8,
        }}
        aria-label="Toggle menu"
      >
        {menuOpen ? '\u2715' : '\u2630'}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="hm-nav-mobile-menu"
          style={{
            position: 'absolute',
            top: 72,
            left: 0,
            right: 0,
            background: 'rgba(5,5,8,0.97)',
            backdropFilter: 'blur(24px)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: pathname === link.href ? '#fff' : '#8a8a9a',
                fontSize: 15,
                fontWeight: 500,
                textDecoration: 'none',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/home"
            onClick={() => setMenuOpen(false)}
            style={{
              background: 'linear-gradient(135deg, #bc0000, #ff4444)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 100,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            Enter the Experience
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hm-nav-desktop { display: none !important; }
          .hm-nav-mobile-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}
