'use client'

import { useEffect, useRef } from 'react'

interface CategoryHeaderProps {
  categorySlug: string
  categoryName: string
  postCount: number
  description?: string
  className?: string
}

// Team colors and gradients
function getTeamTheme(slug: string) {
  const themes: Record<string, { gradient: string; accent: string; icon: string }> = {
    'chicago-bears': {
      gradient: 'from-[#0B162A] via-[#0B162A] to-[#C83200]',
      accent: '#C83200',
      icon: '🐻',
    },
    bears: {
      gradient: 'from-[#0B162A] via-[#0B162A] to-[#C83200]',
      accent: '#C83200',
      icon: '🐻',
    },
    'chicago-bulls': {
      gradient: 'from-[#CE1141] via-[#CE1141] to-[#000000]',
      accent: '#CE1141',
      icon: '🏀',
    },
    bulls: {
      gradient: 'from-[#CE1141] via-[#CE1141] to-[#000000]',
      accent: '#CE1141',
      icon: '🏀',
    },
    'chicago-cubs': {
      gradient: 'from-[#0E3386] via-[#0E3386] to-[#CC3433]',
      accent: '#0E3386',
      icon: '⚾',
    },
    cubs: {
      gradient: 'from-[#0E3386] via-[#0E3386] to-[#CC3433]',
      accent: '#0E3386',
      icon: '⚾',
    },
    'chicago-white-sox': {
      gradient: 'from-[#27251F] via-[#27251F] to-[#4a4a4a]',
      accent: '#27251F',
      icon: '⚾',
    },
    'white-sox': {
      gradient: 'from-[#27251F] via-[#27251F] to-[#4a4a4a]',
      accent: '#27251F',
      icon: '⚾',
    },
    'chicago-blackhawks': {
      gradient: 'from-[#CF0A2C] via-[#CF0A2C] to-[#000000]',
      accent: '#CF0A2C',
      icon: '🏒',
    },
    blackhawks: {
      gradient: 'from-[#CF0A2C] via-[#CF0A2C] to-[#000000]',
      accent: '#CF0A2C',
      icon: '🏒',
    },
  }

  return themes[slug] || {
    gradient: 'from-[#8B0000] via-[#8B0000] to-[#FF0000]',
    accent: '#8B0000',
    icon: '🏆',
  }
}

export default function CategoryHeader({
  categorySlug,
  categoryName,
  postCount,
  description,
  className = '',
}: CategoryHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const theme = getTeamTheme(categorySlug)

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const scrollY = window.scrollY
        const parallaxOffset = scrollY * 0.4
        headerRef.current.style.backgroundPositionY = `${parallaxOffset}px`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      ref={headerRef}
      className={`relative overflow-hidden bg-gradient-to-br ${theme.gradient} py-16 lg:py-24 ${className}`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center text-center">
          {/* Team icon */}
          <div className="mb-4 text-6xl lg:text-8xl">{theme.icon}</div>

          {/* Category name */}
          <h1 className="mb-4 font-heading text-4xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
            {categoryName}
          </h1>

          {/* Description */}
          {description && (
            <p className="mb-6 max-w-2xl text-lg text-white/80">{description}</p>
          )}

          {/* Post count badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <span className="font-semibold text-white">
              {postCount.toLocaleString()} {postCount === 1 ? 'Article' : 'Articles'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute -bottom-1 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="h-8 w-full lg:h-16"
          fill="currentColor"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.1,118.92,156.63,69.08,321.39,56.44Z"
            className="text-zinc-50 dark:text-zinc-950"
          />
        </svg>
      </div>
    </header>
  )
}
