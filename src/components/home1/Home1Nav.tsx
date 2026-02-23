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
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--h1-nav-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 100,
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
        background: scrolled
          ? isDark
            ? 'rgba(0,0,0,0.85)'
            : 'rgba(255,255,255,0.9)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        boxShadow: scrolled
          ? isDark
            ? '0 1px 0 rgba(255,255,255,0.04)'
            : '0 1px 0 rgba(0,0,0,0.06)'
          : 'none',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Image
          src="/sm-logo.png"
          alt="Sports Mockery"
          width={36}
          height={36}
          style={{ borderRadius: 8 }}
        />
        <span
          style={{
            marginLeft: 10,
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: isDark ? '#ffffff' : '#111111',
          }}
        >
          SM
        </span>
      </Link>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link
          href="/"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: isDark ? '#888888' : '#666666',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
        >
          Classic
        </Link>
        <ThemeToggle />
      </div>
    </nav>
  )
}
