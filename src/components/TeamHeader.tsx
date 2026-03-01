'use client'

import { useEffect, useState } from 'react'

interface TeamConfig {
  name: string
  gradient: string
  pattern: string
  textColor: string
}

const teamConfigs: Record<string, TeamConfig> = {
  'chicago-bears': {
    name: 'Chicago Bears',
    gradient: 'from-[#0B162A] via-[#0B162A] to-[#C83200]',
    pattern: 'bg-[radial-gradient(circle_at_50%_50%,rgba(200,50,0,0.1)_0%,transparent_50%)]',
    textColor: 'text-white',
  },
  'chicago-bulls': {
    name: 'Chicago Bulls',
    gradient: 'from-[#CE1141] via-[#9A0F31] to-[#000000]',
    pattern: 'bg-[radial-gradient(circle_at_30%_70%,rgba(206,17,65,0.2)_0%,transparent_50%)]',
    textColor: 'text-white',
  },
  'chicago-cubs': {
    name: 'Chicago Cubs',
    gradient: 'from-[#0E3386] via-[#0E3386] to-[#CC3433]',
    pattern: 'bg-[radial-gradient(circle_at_70%_30%,rgba(204,52,51,0.15)_0%,transparent_50%)]',
    textColor: 'text-white',
  },
  'chicago-white-sox': {
    name: 'Chicago White Sox',
    gradient: 'from-[#27251F] via-[#27251F] to-[#C4CED4]',
    pattern: 'bg-[radial-gradient(circle_at_80%_20%,rgba(196,206,212,0.1)_0%,transparent_50%)]',
    textColor: 'text-white',
  },
  'chicago-blackhawks': {
    name: 'Chicago Blackhawks',
    gradient: 'from-[#CF0A2C] via-[#9A0721] to-[#000000]',
    pattern: 'bg-[radial-gradient(circle_at_20%_80%,rgba(207,10,44,0.2)_0%,transparent_50%)]',
    textColor: 'text-white',
  },
}

interface TeamHeaderProps {
  categorySlug: string
  categoryName?: string
  postCount?: number
}

export default function TeamHeader({ categorySlug, categoryName, postCount }: TeamHeaderProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  const config = teamConfigs[categorySlug] || {
    name: categoryName || categorySlug,
    gradient: 'from-zinc-800 to-zinc-900',
    pattern: '',
    textColor: 'text-white',
  }

  useEffect(() => {
    setIsVisible(true)

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative overflow-hidden">
      {/* Parallax background */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${config.gradient} transition-transform duration-100`}
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      />

      {/* Pattern overlay */}
      <div className={`absolute inset-0 ${config.pattern}`} />

      {/* Animated lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div
          className={`transform transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <h1
            className={`font-montserrat text-4xl font-black tracking-tight sm:text-5xl md:text-6xl ${config.textColor}`}
            style={{ fontFamily: "Barlow, sans-serif" }}
          >
            {config.name}
          </h1>
          {postCount !== undefined && (
            <p
              className={`mt-4 text-lg ${config.textColor} opacity-80`}
              style={{
                transitionDelay: '200ms',
              }}
            >
              {postCount} article{postCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-50 to-transparent dark:from-zinc-950" />
    </div>
  )
}
