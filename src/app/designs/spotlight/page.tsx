'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion'

// Featured player data (Caleb Williams as the spotlight)
const SPOTLIGHT_PLAYER = {
  name: 'Caleb Williams',
  firstName: 'Caleb',
  lastName: 'Williams',
  team: 'Chicago Bears',
  position: 'Quarterback',
  number: '18',
  tagline: 'The Future of Chicago Football',
  subline: 'Watch his story unfold',
  image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4432577.png&w=350&h=254',
  heroImage: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1920&q=80',
}

// Stats comparison data
const STATS_COMPARISON = [
  { stat: 'Passing Yards', williams: '3,541', rank: 1, icon: '🏈' },
  { stat: 'Touchdowns', williams: '20', rank: 1, icon: '🎯' },
  { stat: 'Passer Rating', williams: '93.2', rank: 2, icon: '📊' },
  { stat: 'Completions', williams: '298', rank: 1, icon: '✓' },
  { stat: 'Game-Winning Drives', williams: '4', rank: 1, icon: '🏆' },
  { stat: 'QB Rushes', williams: '68', rank: 1, icon: '🏃' },
]

// Season highlights / "reasons"
const HIGHLIGHTS = [
  { number: '01', title: 'Record-Breaking Debut', desc: 'Most passing yards by a Bears rookie QB in Week 1' },
  { number: '02', title: 'Dual-Threat Dominance', desc: '400+ total yards in multiple games' },
  { number: '03', title: 'Clutch Performances', desc: '4 game-winning drives in final 2 minutes' },
  { number: '04', title: 'Deep Ball Mastery', desc: 'League-leading 15+ yard completions' },
  { number: '05', title: 'Red Zone Efficiency', desc: '68% TD rate inside the 20' },
  { number: '06', title: 'Mobility & Vision', desc: 'Most rushing yards by Bears QB since 1985' },
]

// Animated number counter
function AnimatedNumber({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    if (isInView) {
      const numericValue = parseFloat(value.replace(/,/g, ''))
      const duration = 2000
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const current = numericValue * easeOut

        if (value.includes(',')) {
          setDisplayValue(Math.floor(current).toLocaleString())
        } else if (value.includes('.')) {
          setDisplayValue(current.toFixed(1))
        } else {
          setDisplayValue(Math.floor(current).toString())
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setDisplayValue(value)
        }
      }

      animate()
    }
  }, [isInView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}{suffix}
    </span>
  )
}

// Stat row component
function StatRow({ stat, index }: { stat: typeof STATS_COMPARISON[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="flex items-center justify-between py-5 border-b border-white/10 group-hover:border-[#C83803]/50 transition-colors">
        <div className="flex items-center gap-4">
          <span className="text-2xl">{stat.icon}</span>
          <span className="text-white/70 group-hover:text-white transition-colors">{stat.stat}</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-3xl font-black text-white">
            <AnimatedNumber value={stat.williams} />
          </span>
          {stat.rank === 1 && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#C83803] text-white text-xs font-bold">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              #1
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Highlight card component
function HighlightCard({ highlight, index }: { highlight: typeof HIGHLIGHTS[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C83803]/50 transition-all duration-300 hover:bg-white/[0.08]">
        {/* Number badge */}
        <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full bg-[#C83803] flex items-center justify-center">
          <span className="text-white font-black text-sm">{highlight.number}</span>
        </div>

        <div className="ml-6">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#C83803] transition-colors">
            {highlight.title}
          </h3>
          <p className="text-white/60">{highlight.desc}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function SpotlightPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const textY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -100]), { stiffness: 100, damping: 30 })

  return (
    <div className="min-h-screen bg-[#0B162A] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Background with parallax */}
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          {/* Video background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover scale-110"
            poster={SPOTLIGHT_PLAYER.heroImage}
          >
            <source
              src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=164&oauth2_token_id=57447761"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-[#0B162A]/70" />
        </motion.div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B162A] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B162A] via-transparent to-transparent" />

        {/* Content */}
        <motion.div
          style={{ y: textY, opacity: heroOpacity }}
          className="relative h-full flex items-center"
        >
          <div className="max-w-7xl mx-auto px-4 w-full grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Text content */}
            <div>
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <Link href="/">
                  <Image
                    src="/logo-white.png"
                    alt="Sports Mockery"
                    width={180}
                    height={50}
                    className="h-10 w-auto"
                  />
                </Link>
              </motion.div>

              {/* Tagline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <p className="text-[#C83803] text-sm uppercase tracking-[0.3em] mb-4 font-semibold">
                  {SPOTLIGHT_PLAYER.team} • #{SPOTLIGHT_PLAYER.number}
                </p>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-6">
                  <span className="block text-white/50">{SPOTLIGHT_PLAYER.firstName}</span>
                  <span className="block text-white">{SPOTLIGHT_PLAYER.lastName}</span>
                </h1>
                <p className="text-2xl md:text-3xl text-white/80 italic mb-8">
                  &ldquo;{SPOTLIGHT_PLAYER.tagline}&rdquo;
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="flex flex-wrap items-center gap-4"
              >
                <button className="group flex items-center gap-3 px-8 py-4 bg-[#C83803] rounded-full font-bold text-lg hover:bg-[#a52d02] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>{SPOTLIGHT_PLAYER.subline}</span>
                </button>
                <Link
                  href="/chicago-bears"
                  className="px-6 py-4 border-2 border-white/30 rounded-full font-bold hover:bg-white/10 transition-colors"
                >
                  Bears Coverage
                </Link>
              </motion.div>
            </div>

            {/* Right: Player image (visible on larger screens) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="relative h-[600px]">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#C83803]/30 via-transparent to-transparent rounded-full blur-3xl" />
                <Image
                  src={SPOTLIGHT_PLAYER.image}
                  alt={SPOTLIGHT_PLAYER.name}
                  fill
                  className="object-contain object-bottom scale-150"
                  unoptimized
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-white rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-sm uppercase tracking-[0.3em] text-[#C83803] mb-4">2024 Season Stats</h2>
            <p className="text-4xl md:text-5xl font-black">BY THE NUMBERS</p>
            <p className="text-white/50 mt-4">Caleb Williams&apos;s ranks among all 2024 NFL Rookies</p>
          </motion.div>

          <div className="space-y-0">
            {STATS_COMPARISON.map((stat, index) => (
              <StatRow key={stat.stat} stat={stat} index={index} />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#C83803] text-white text-xs">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                #1
              </span>
              <span>Leads all NFL rookies</span>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-[#0a1525] to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-sm uppercase tracking-[0.3em] text-[#C83803] mb-4">Season Highlights</h2>
            <p className="text-4xl md:text-5xl font-black">
              <span className="text-[#C83803]">6</span> REASONS
            </p>
            <p className="text-white/50 mt-4">Why Caleb Williams is the future</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HIGHLIGHTS.map((highlight, index) => (
              <HighlightCard key={highlight.number} highlight={highlight} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Large quote marks */}
            <div className="absolute -top-8 left-0 text-[120px] text-[#C83803]/20 font-serif leading-none">&ldquo;</div>

            <blockquote className="relative text-2xl md:text-3xl lg:text-4xl font-medium text-white/90 italic leading-relaxed">
              He has that &apos;it&apos; factor. The way he commands the huddle, the way he makes plays when things break down — he&apos;s special.
            </blockquote>

            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/10 overflow-hidden">
                <Image
                  src="https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/2330.png&w=350&h=254"
                  alt="Analyst"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Tony Romo</p>
                <p className="text-white/50 text-sm">NFL Analyst, CBS Sports</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Highlights Grid */}
      <section className="py-24 px-4 bg-[#050a12]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-sm uppercase tracking-[0.3em] text-[#C83803] mb-4">Watch</h2>
            <p className="text-4xl md:text-5xl font-black">HIGHLIGHTS</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative aspect-video bg-white/5 rounded-xl overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#C83803] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-bold">Week {i} Highlight</p>
                  <p className="text-white/60 text-sm">vs Opponent</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Image
              src="/logo-white.png"
              alt="Sports Mockery"
              width={200}
              height={60}
              className="h-12 w-auto mx-auto mb-8"
            />
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              Get the full Bears experience
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              In-depth analysis, breaking news, and exclusive content from Chicago&apos;s most passionate sports coverage.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/chicago-bears"
                className="px-8 py-4 bg-[#C83803] rounded-full font-bold text-lg hover:bg-[#a52d02] transition-colors"
              >
                Explore Bears Coverage
              </Link>
              <Link
                href="/"
                className="px-8 py-4 border-2 border-white/30 rounded-full font-bold text-lg hover:bg-white/10 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
