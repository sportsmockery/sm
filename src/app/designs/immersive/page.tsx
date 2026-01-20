'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView, AnimatePresence } from 'framer-motion'

// Chicago teams with extended data
const TEAMS = [
  {
    id: 'bears',
    name: 'Bears',
    fullName: 'Chicago Bears',
    league: 'NFL',
    record: '5-12',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    primaryColor: '#0B162A',
    secondaryColor: '#C83803',
    gradient: 'from-[#0B162A] to-[#C83803]',
  },
  {
    id: 'bulls',
    name: 'Bulls',
    fullName: 'Chicago Bulls',
    league: 'NBA',
    record: '22-30',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
    gradient: 'from-[#CE1141] to-[#000000]',
  },
  {
    id: 'cubs',
    name: 'Cubs',
    fullName: 'Chicago Cubs',
    league: 'MLB',
    record: '83-79',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    primaryColor: '#0E3386',
    secondaryColor: '#CC3433',
    gradient: 'from-[#0E3386] to-[#CC3433]',
  },
  {
    id: 'blackhawks',
    name: 'Blackhawks',
    fullName: 'Chicago Blackhawks',
    league: 'NHL',
    record: '23-38-6',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    primaryColor: '#CF0A2C',
    secondaryColor: '#000000',
    gradient: 'from-[#CF0A2C] to-[#000000]',
  },
  {
    id: 'whitesox',
    name: 'White Sox',
    fullName: 'Chicago White Sox',
    league: 'MLB',
    record: '41-121',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    primaryColor: '#27251F',
    secondaryColor: '#C4CED4',
    gradient: 'from-[#27251F] to-[#C4CED4]',
  },
]

// Featured stories
const STORIES = [
  {
    id: 1,
    title: 'The Caleb Williams Era Begins',
    subtitle: 'How the #1 pick is transforming Bears football',
    category: 'Bears',
    image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80',
    readTime: '12 min',
    isFeature: true,
  },
  {
    id: 2,
    title: 'Bulls at the Crossroads',
    subtitle: 'Trade deadline decisions loom large',
    category: 'Bulls',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80',
    readTime: '8 min',
  },
  {
    id: 3,
    title: 'Cubs Offseason Moves',
    subtitle: 'Building for a playoff push',
    category: 'Cubs',
    image: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=800&q=80',
    readTime: '6 min',
  },
  {
    id: 4,
    title: 'Bedard\'s Breakout',
    subtitle: 'Connor Bedard leads Blackhawks rebuild',
    category: 'Blackhawks',
    image: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800&q=80',
    readTime: '10 min',
  },
]

// Live ticker data
const TICKER_ITEMS = [
  { type: 'score', teams: 'Bears 24 - Vikings 17', status: 'Final' },
  { type: 'news', text: 'BREAKING: Bears sign Pro Bowl linebacker' },
  { type: 'score', teams: 'Bulls 108 - Celtics 112', status: 'Final' },
  { type: 'news', text: 'Cubs acquire starting pitcher in trade' },
]

// Custom cursor component
function CustomCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16)
      cursorY.set(e.clientY - 16)
    }

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      setIsHovering(
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') !== null ||
        target.closest('button') !== null
      )
    }

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseover', handleHover)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseover', handleHover)
    }
  }, [cursorX, cursorY])

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden lg:block"
      style={{
        x: cursorX,
        y: cursorY,
        backgroundColor: isHovering ? '#C83803' : 'white',
        scale: isHovering ? 1.5 : 1,
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    />
  )
}

// Animated text reveal
function TextReveal({ children, className = '' }: { children: string; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <span ref={ref} className={`inline-block overflow-hidden ${className}`}>
      <motion.span
        initial={{ y: '100%' }}
        animate={isInView ? { y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </span>
  )
}

// Team card with magnetic effect
function TeamCard({ team, index }: { team: typeof TEAMS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / 10
    const y = (e.clientY - rect.top - rect.height / 2) / 10
    setPosition({ x, y })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 })
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      className="group relative cursor-pointer"
    >
      <div
        className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02]"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor} 0%, ${team.secondaryColor} 100%)`,
        }}
      >
        {/* Team logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0.3 }}
            whileHover={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={team.logo}
              alt={team.name}
              width={200}
              height={200}
              className="w-32 md:w-48 h-32 md:h-48 object-contain"
              unoptimized
            />
          </motion.div>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="text-white/60 text-xs uppercase tracking-wider">{team.league}</span>
          <h3 className="text-2xl md:text-3xl font-black text-white mt-1">{team.fullName}</h3>
          <p className="text-white/70 mt-2">{team.record}</p>

          {/* Arrow indicator */}
          <motion.div
            initial={{ x: 0, opacity: 0 }}
            whileHover={{ x: 10, opacity: 1 }}
            className="mt-4 inline-flex items-center gap-2 text-white"
          >
            <span className="text-sm font-medium">Explore</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// Story card component
function StoryCard({ story, index }: { story: typeof STORIES[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  if (story.isFeature) {
    return (
      <motion.article
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="md:col-span-2 group cursor-pointer"
      >
        <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden">
          <Image
            src={story.image}
            alt={story.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-[#C83803] text-white text-xs font-bold uppercase">
                {story.category}
              </span>
              <span className="text-white/60 text-sm">{story.readTime} read</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 group-hover:text-[#C83803] transition-colors">
              {story.title}
            </h2>
            <p className="text-white/70 text-lg max-w-xl">{story.subtitle}</p>
          </div>
        </div>
      </motion.article>
    )
  }

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group cursor-pointer"
    >
      <div className="relative h-[250px] rounded-2xl overflow-hidden mb-4">
        <Image
          src={story.image}
          alt={story.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[#C83803] text-xs font-bold uppercase">{story.category}</span>
        <span className="text-white/40 text-xs">{story.readTime}</span>
      </div>
      <h3 className="text-xl font-bold text-white group-hover:text-[#C83803] transition-colors">
        {story.title}
      </h3>
      <p className="text-white/60 mt-2">{story.subtitle}</p>
    </motion.article>
  )
}

// Live ticker
function LiveTicker() {
  return (
    <div className="bg-[#C83803] py-2 overflow-hidden">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="flex whitespace-nowrap"
      >
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <div key={i} className="flex items-center gap-8 px-8">
            {item.type === 'score' ? (
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white font-bold">{item.teams}</span>
                <span className="text-white/70 text-sm">{item.status}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-white text-[#C83803] text-xs font-black rounded">LIVE</span>
                <span className="text-white">{item.text}</span>
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default function ImmersivePage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState(0)

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.8])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])

  // Smooth scroll for mouse wheel
  const smoothScroll = useSpring(0, { stiffness: 100, damping: 30 })

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white">
      <CustomCursor />

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/logo-white.png"
              alt="Sports Mockery"
              width={160}
              height={45}
              className="h-8 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {['Teams', 'Stories', 'Live', 'Podcasts'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-sm font-medium text-white hover:text-[#C83803] transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>
          <button className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 md:hidden">
            <span className="w-6 h-0.5 bg-white" />
            <span className="w-6 h-0.5 bg-white" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div
          style={{ scale: heroScale, y: heroY }}
          className="absolute inset-0"
        >
          {/* Video background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source
              src="https://player.vimeo.com/external/517090081.sd.mp4?s=95d42a4c5f5a2d5c7c80ecb2c9c5a5d5a5d5a5d5&profile_id=164&oauth2_token_id=57447761"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-black/60" />
        </motion.div>

        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-60"
          animate={{
            background: [
              'radial-gradient(circle at 20% 80%, #C83803 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, #C83803 0%, transparent 50%)',
              'radial-gradient(circle at 20% 80%, #C83803 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative h-full flex flex-col items-center justify-center text-center px-4"
        >
          {/* Main title with reveal animation */}
          <div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.2 }}
              className="text-6xl md:text-8xl lg:text-[12rem] font-black tracking-tighter leading-none"
            >
              SPORTS
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.h1
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.4 }}
              className="text-6xl md:text-8xl lg:text-[12rem] font-black tracking-tighter leading-none bg-gradient-to-r from-[#C83803] via-[#CE1141] to-[#0E3386] bg-clip-text text-transparent"
            >
              MOCKERY
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl md:text-2xl text-white/70 max-w-2xl mb-12"
          >
            Chicago&apos;s most passionate sports coverage. Deep analysis. Bold takes. Relentless coverage.
          </motion.p>

          {/* Team logos carousel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center gap-8"
          >
            {TEAMS.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + i * 0.1 }}
                whileHover={{ scale: 1.2 }}
                className="cursor-pointer"
              >
                <Image
                  src={team.logo}
                  alt={team.name}
                  width={50}
                  height={50}
                  className="w-10 h-10 md:w-14 md:h-14 object-contain opacity-70 hover:opacity-100 transition-opacity"
                  unoptimized
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-12"
          >
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-14 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
            >
              <motion.div
                animate={{ y: [0, 20, 0], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-3 bg-white rounded-full"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Live Ticker */}
      <LiveTicker />

      {/* Teams Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <TextReveal className="text-[#C83803] text-sm uppercase tracking-[0.3em] block mb-4">
              Our Teams
            </TextReveal>
            <h2 className="text-5xl md:text-7xl font-black">
              <TextReveal>CHICAGO&apos;S</TextReveal>
              <br />
              <TextReveal className="text-white/50">FINEST</TextReveal>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAMS.slice(0, 3).map((team, index) => (
              <TeamCard key={team.id} team={team} index={index} />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6 max-w-4xl mx-auto">
            {TEAMS.slice(3).map((team, index) => (
              <TeamCard key={team.id} team={team} index={index + 3} />
            ))}
          </div>
        </div>
      </section>

      {/* Stories Section */}
      <section className="py-24 md:py-32 px-4 bg-gradient-to-b from-transparent via-[#0a0a0a] to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-16"
          >
            <div>
              <TextReveal className="text-[#C83803] text-sm uppercase tracking-[0.3em] block mb-4">
                Latest Stories
              </TextReveal>
              <h2 className="text-5xl md:text-7xl font-black">
                <TextReveal>DEEP</TextReveal>
                <br />
                <TextReveal className="text-white/50">COVERAGE</TextReveal>
              </h2>
            </div>
            <Link
              href="#"
              className="hidden md:flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <span>View All</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STORIES.map((story, index) => (
              <StoryCard key={story.id} story={story} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-16 px-4 bg-[#C83803]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500K+', label: 'Monthly Readers' },
              { value: '5', label: 'Chicago Teams' },
              { value: '24/7', label: 'Coverage' },
              { value: '15+', label: 'Years Strong' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</p>
                <p className="text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              NEVER MISS A STORY
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
              Get breaking news, deep analysis, and exclusive content delivered to your inbox.
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#C83803] transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-4 rounded-full bg-[#C83803] text-white font-bold hover:bg-[#a52d02] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <Link href="/">
              <Image
                src="/logo-white.png"
                alt="Sports Mockery"
                width={180}
                height={50}
                className="h-10 w-auto"
              />
            </Link>

            <div className="flex items-center gap-6">
              {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-white/50 hover:text-white transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>

            <p className="text-white/40 text-sm">
              &copy; {new Date().getFullYear()} Sports Mockery. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
