'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import ThemeToggle from '@/components/ThemeToggle'

export default function Home1Nav() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* System status pulse line — very top */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 101,
          background: 'linear-gradient(90deg, transparent 0%, #bc0000 50%, transparent 100%)',
          animation: 'h1-status-breathe 3s ease-in-out infinite',
        }}
      />

      <nav
        style={{
          position: 'fixed',
          top: 2, // Below status line
          left: 0,
          right: 0,
          height: 'calc(var(--h1-nav-height) - 2px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 100,
          transition: 'background 0.3s ease, box-shadow 0.3s ease',
          background: scrolled
            ? isDark
              ? 'rgba(0,0,0,0.9)'
              : 'rgba(255,255,255,0.95)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          boxShadow: scrolled
            ? isDark
              ? '0 1px 0 rgba(188,0,0,0.1)'
              : '0 1px 0 rgba(0,0,0,0.06)'
            : 'none',
        }}
      >
        {/* Logo — full and authoritative */}
        <Link
          href="/home1"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none',
          }}
        >
          <Image
            src="/sm-logo.png"
            alt="Sports Mockery"
            width={40}
            height={40}
            style={{
              borderRadius: 8,
              objectFit: 'contain',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: 16,
                fontWeight: 900,
                fontStyle: 'italic',
                letterSpacing: '-0.03em',
                color: isDark ? '#ffffff' : '#111111',
                lineHeight: 1,
              }}
            >
              SPORTS MOCKERY
            </span>
            <span
              style={{
                fontSize: 8,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#bc0000',
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                marginTop: 2,
              }}
            >
              Command Center
            </span>
          </div>
        </Link>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Mode indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              href="/"
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: isDark ? '#555' : '#999',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}
            >
              Classic
            </Link>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#bc0000',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                textShadow: isDark ? '0 0 10px rgba(188,0,0,0.4)' : 'none',
              }}
            >
              Modern
            </span>
          </div>

          <div
            style={{
              width: 1,
              height: 20,
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            }}
          />

          <ThemeToggle />
        </div>
      </nav>

      {/* Keyframe for status line breathing */}
      <style>{`
        @keyframes h1-status-breathe {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </>
  )
}
