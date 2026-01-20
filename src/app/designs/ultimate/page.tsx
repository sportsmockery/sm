'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion'

// Chicago teams
const TEAMS = [
  { id: 'bears', name: 'Bears', fullName: 'Chicago Bears', league: 'NFL', record: '5-12', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', primary: '#0B162A', secondary: '#C83803' },
  { id: 'bulls', name: 'Bulls', fullName: 'Chicago Bulls', league: 'NBA', record: '22-30', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', primary: '#CE1141', secondary: '#000000' },
  { id: 'cubs', name: 'Cubs', fullName: 'Chicago Cubs', league: 'MLB', record: '83-79', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png', primary: '#0E3386', secondary: '#CC3433' },
  { id: 'blackhawks', name: 'Blackhawks', fullName: 'Chicago Blackhawks', league: 'NHL', record: '23-38-6', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png', primary: '#CF0A2C', secondary: '#000000' },
  { id: 'whitesox', name: 'White Sox', fullName: 'Chicago White Sox', league: 'MLB', record: '41-121', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png', primary: '#27251F', secondary: '#C4CED4' },
]

// Featured players
const PLAYERS = [
  { name: 'Caleb Williams', team: 'Bears', pos: 'QB', image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4432577.png&w=350&h=254', stat: '20', label: 'TD', color: '#C83803' },
  { name: 'Coby White', team: 'Bulls', pos: 'G', image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/4395725.png&w=350&h=254', stat: '19.1', label: 'PPG', color: '#CE1141' },
  { name: 'Connor Bedard', team: 'Blackhawks', pos: 'C', image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nhl/players/full/5161455.png&w=350&h=254', stat: '61', label: 'PTS', color: '#CF0A2C' },
  { name: 'Cody Bellinger', team: 'Cubs', pos: 'OF', image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/33912.png&w=350&h=254', stat: '18', label: 'HR', color: '#0E3386' },
]

// Live ticker
const TICKER = [
  { type: 'score', text: 'Bears 24 - Vikings 17 (Final)' },
  { type: 'news', text: 'BREAKING: Bears sign Pro Bowl linebacker to 3-year deal' },
  { type: 'score', text: 'Bulls 108 - Celtics 112 (Final)' },
  { type: 'news', text: 'Cubs acquire starting pitcher in blockbuster trade' },
  { type: 'score', text: 'Blackhawks 4 - Red Wings 2 (Final)' },
]

// Stories
const STORIES = [
  { id: 1, title: 'The Caleb Williams Era Begins', subtitle: 'How the #1 pick is transforming Bears football', category: 'Bears', image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80', time: '12 min', featured: true },
  { id: 2, title: 'Bulls at the Crossroads', subtitle: 'Trade deadline decisions loom large', category: 'Bulls', image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80', time: '8 min' },
  { id: 3, title: 'Cubs Offseason Moves', subtitle: 'Building for a playoff push', category: 'Cubs', image: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=800&q=80', time: '6 min' },
  { id: 4, title: "Bedard's Breakout Season", subtitle: 'Connor Bedard leads Blackhawks rebuild', category: 'Blackhawks', image: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800&q=80', time: '10 min' },
]

// Contests
const CONTESTS = [
  { title: 'Bears Home Opener', prize: '4 Premium Tickets + Field Access', date: new Date('2025-09-07'), team: 'bears' },
  { title: 'Bulls Courtside Experience', prize: '2 Courtside Seats + Meet & Greet', date: new Date('2025-10-22'), team: 'bulls' },
]

// Custom cursor
function CustomCursor() {
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX - 16); y.set(e.clientY - 16) }
    const hover = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      setHovering(t.tagName === 'A' || t.tagName === 'BUTTON' || !!t.closest('a,button'))
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', hover)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseover', hover) }
  }, [x, y])

  return <motion.div className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden lg:block" style={{ x, y, backgroundColor: hovering ? '#C83803' : 'white', scale: hovering ? 1.5 : 1 }} />
}

// Animated counter
function Counter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView) return
    const num = parseFloat(value.replace(/,/g, ''))
    const start = Date.now()
    const animate = () => {
      const progress = Math.min((Date.now() - start) / 2000, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(value.includes('.') ? (num * ease).toFixed(1) : Math.floor(num * ease).toLocaleString())
      if (progress < 1) requestAnimationFrame(animate)
      else setDisplay(value)
    }
    animate()
  }, [inView, value])

  return <span ref={ref} className="tabular-nums">{display}{suffix}</span>
}

// Countdown
function Countdown({ date }: { date: Date }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = date.getTime() - Date.now()
      if (diff > 0) setTime({ d: Math.floor(diff / 86400000), h: Math.floor((diff / 3600000) % 24), m: Math.floor((diff / 60000) % 60), s: Math.floor((diff / 1000) % 60) })
    }
    calc()
    const i = setInterval(calc, 1000)
    return () => clearInterval(i)
  }, [date])

  return (
    <div className="flex gap-2">
      {[{ v: time.d, l: 'D' }, { v: time.h, l: 'H' }, { v: time.m, l: 'M' }, { v: time.s, l: 'S' }].map(({ v, l }) => (
        <div key={l} className="text-center">
          <div className="bg-white/10 rounded-lg px-2 py-1 min-w-[36px]">
            <span className="text-lg font-bold tabular-nums">{String(v).padStart(2, '0')}</span>
          </div>
          <span className="text-[9px] text-white/50">{l}</span>
        </div>
      ))}
    </div>
  )
}

// Text reveal
function Reveal({ children, className = '' }: { children: string; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  return (
    <span ref={ref} className={`inline-block overflow-hidden ${className}`}>
      <motion.span initial={{ y: '100%' }} animate={inView ? { y: 0 } : {}} transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }} className="inline-block">
        {children}
      </motion.span>
    </span>
  )
}

// Team card with magnetic effect
function TeamCard({ team, i }: { team: typeof TEAMS[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const inView = useInView(ref, { once: true })

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setPos({ x: (e.clientX - r.left - r.width / 2) / 12, y: (e.clientY - r.top - r.height / 2) / 12 })
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      className="group cursor-pointer"
    >
      <Link href={`/chicago-${team.id}`}>
        <div className="relative h-[200px] md:h-[280px] rounded-2xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]" style={{ background: `linear-gradient(135deg, ${team.primary}, ${team.secondary})` }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Image src={team.logo} alt={team.name} width={120} height={120} className="w-20 md:w-28 h-20 md:h-28 object-contain opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-300" unoptimized />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <span className="text-white/50 text-xs uppercase tracking-wider">{team.league}</span>
            <h3 className="text-xl md:text-2xl font-black text-white">{team.fullName}</h3>
            <p className="text-white/60 text-sm mt-1">{team.record}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Player card
function PlayerCard({ player, i }: { player: typeof PLAYERS[0]; i: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: i * 0.1 }}
      className="group"
    >
      <div className="relative rounded-2xl overflow-hidden p-[2px]" style={{ background: `linear-gradient(135deg, ${player.color}, transparent)` }}>
        <div className="bg-[#0a0a0a] rounded-2xl p-4">
          <div className="relative h-40 mb-4 overflow-hidden rounded-xl bg-gradient-to-b from-white/5 to-transparent">
            <Image src={player.image} alt={player.name} fill className="object-contain object-bottom scale-125 group-hover:scale-130 transition-transform duration-500" unoptimized />
          </div>
          <div className="text-center">
            <p className="text-white/40 text-xs uppercase tracking-wider">{player.team} • {player.pos}</p>
            <h4 className="text-white font-bold mt-1">{player.name}</h4>
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full" style={{ backgroundColor: `${player.color}25` }}>
              <span className="text-2xl font-black" style={{ color: player.color }}><Counter value={player.stat} /></span>
              <span className="text-white/50 text-sm">{player.label}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Live ticker
function LiveTicker() {
  return (
    <div className="bg-[#C83803] py-2.5 overflow-hidden">
      <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }} className="flex whitespace-nowrap">
        {[...TICKER, ...TICKER].map((item, i) => (
          <div key={i} className="flex items-center gap-8 px-8">
            {item.type === 'score' ? (
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-white rounded-full" />
                <span className="text-white font-semibold">{item.text}</span>
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

export default function UltimatePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.85])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150])

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <CustomCursor />

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/"><Image src="/logo-white.png" alt="Sports Mockery" width={150} height={40} className="h-8 w-auto" /></Link>
          <nav className="hidden md:flex items-center gap-8">
            {['Teams', 'Stories', 'Contests', 'Podcasts'].map((item) => (
              <Link key={item} href="#" className="text-sm font-medium hover:text-[#C83803] transition-colors">{item}</Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0">
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src="https://player.vimeo.com/external/370467553.sd.mp4?s=7ccaa3c5c17b86c2c86a0f42c8ed4c42b4b76d80&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60" />
        </motion.div>

        <motion.div className="absolute inset-0 opacity-50" animate={{ background: ['radial-gradient(circle at 20% 80%, #C83803 0%, transparent 50%)', 'radial-gradient(circle at 80% 20%, #0E3386 0%, transparent 50%)', 'radial-gradient(circle at 20% 80%, #C83803 0%, transparent 50%)'] }} transition={{ duration: 8, repeat: Infinity }} />

        <motion.div style={{ opacity: heroOpacity }} className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="mb-6">
            <svg className="w-14 h-14 text-[#C83803]" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,0 14.5,8 24,8 16.5,13 19,22 12,17 5,22 7.5,13 0,8 9.5,8" /></svg>
          </motion.div>

          <div className="overflow-hidden mb-2">
            <motion.h1 initial={{ y: 100 }} animate={{ y: 0 }} transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.2 }} className="text-5xl md:text-7xl lg:text-[10rem] font-black tracking-tighter leading-none">CHICAGO</motion.h1>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.h1 initial={{ y: 100 }} animate={{ y: 0 }} transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.4 }} className="text-5xl md:text-7xl lg:text-[10rem] font-black tracking-tighter leading-none bg-gradient-to-r from-[#C83803] via-[#CE1141] to-[#0E3386] bg-clip-text text-transparent">SPORTS</motion.h1>
          </div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="text-lg md:text-xl text-white/70 max-w-xl mb-10">
            Your ultimate destination for Bears, Bulls, Cubs, White Sox & Blackhawks coverage
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="flex items-center gap-6">
            {TEAMS.map((team, i) => (
              <motion.div key={team.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.4 + i * 0.1 }} whileHover={{ scale: 1.2 }}>
                <Image src={team.logo} alt={team.name} width={44} height={44} className="w-9 h-9 md:w-11 md:h-11 object-contain opacity-60 hover:opacity-100 transition-opacity cursor-pointer" unoptimized />
              </motion.div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="absolute bottom-10">
            <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-7 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <motion.div animate={{ y: [0, 16, 0], opacity: [1, 0, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-2.5 bg-white rounded-full" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Live Ticker */}
      <LiveTicker />

      {/* Teams */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
            <Reveal className="text-[#C83803] text-sm uppercase tracking-[0.3em] block mb-3">Chicago Teams</Reveal>
            <h2 className="text-4xl md:text-6xl font-black"><Reveal>OUR CITY.</Reveal> <Reveal className="text-white/40">OUR TEAMS.</Reveal></h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEAMS.map((team, i) => <TeamCard key={team.id} team={team} i={i} />)}
          </div>
        </div>
      </section>

      {/* Players */}
      <section className="py-20 md:py-28 px-4 bg-gradient-to-b from-transparent via-[#0a0a0a] to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Reveal className="text-[#C83803] text-sm uppercase tracking-[0.3em] block mb-3">Player Spotlight</Reveal>
            <h2 className="text-4xl md:text-6xl font-black"><Reveal>STARS OF</Reveal> <Reveal className="text-white/40">THE CITY</Reveal></h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {PLAYERS.map((player, i) => <PlayerCard key={player.name} player={player} i={i} />)}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-12">
            <div>
              <Reveal className="text-[#C83803] text-sm uppercase tracking-[0.3em] block mb-3">Latest Stories</Reveal>
              <h2 className="text-4xl md:text-6xl font-black"><Reveal>DEEP</Reveal> <Reveal className="text-white/40">COVERAGE</Reveal></h2>
            </div>
            <Link href="#" className="hidden md:flex items-center gap-2 text-white/50 hover:text-white transition-colors">
              <span>View All</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STORIES.map((story, i) => (
              <motion.article
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group cursor-pointer ${story.featured ? 'md:col-span-2 lg:col-span-2' : ''}`}
              >
                <div className={`relative rounded-2xl overflow-hidden ${story.featured ? 'h-[350px] md:h-[420px]' : 'h-[220px]'}`}>
                  <Image src={story.image} alt={story.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full bg-[#C83803] text-white text-xs font-bold uppercase">{story.category}</span>
                      <span className="text-white/50 text-sm">{story.time} read</span>
                    </div>
                    <h3 className={`font-black text-white group-hover:text-[#C83803] transition-colors ${story.featured ? 'text-2xl md:text-4xl' : 'text-xl'}`}>{story.title}</h3>
                    <p className="text-white/60 mt-2">{story.subtitle}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Contests */}
      <section className="py-20 md:py-28 px-4 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Reveal className="text-[#C83803] text-sm uppercase tracking-[0.3em] block mb-3">Win Big</Reveal>
            <h2 className="text-4xl md:text-6xl font-black"><Reveal>ACTIVE</Reveal> <Reveal className="text-white/40">CONTESTS</Reveal></h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {CONTESTS.map((contest, i) => {
              const team = TEAMS.find(t => t.id === contest.team)
              return (
                <motion.div
                  key={contest.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative rounded-2xl overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${team?.primary}, #000)` }}
                >
                  <div className="absolute top-4 right-4">
                    <Image src={team?.logo || ''} alt="" width={48} height={48} className="w-12 h-12 object-contain opacity-50" unoptimized />
                  </div>
                  <div className="p-6 min-h-[280px] flex flex-col justify-end">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit" style={{ backgroundColor: team?.secondary }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {contest.prize}
                    </span>
                    <h3 className="text-2xl font-black text-white mb-4">{contest.title}</h3>
                    <div className="mb-6">
                      <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Entry Closes In</p>
                      <Countdown date={contest.date} />
                    </div>
                    <button className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: team?.secondary }}>Enter Now</button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="text-[80px] text-[#C83803]/20 font-serif leading-none">&ldquo;</div>
            <blockquote className="text-xl md:text-3xl font-medium text-white/90 italic leading-relaxed -mt-8">
              Sports Mockery delivers the most passionate, in-depth coverage of Chicago sports. If you&apos;re a true Chicago fan, this is your home.
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#C83803]" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,0 14.5,8 24,8 16.5,13 19,22 12,17 5,22 7.5,13 0,8 9.5,8" /></svg>
              </div>
              <div className="text-left">
                <p className="font-bold text-white">Chicago Sports Fan</p>
                <p className="text-white/50 text-sm">Since 2010</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C83803] via-[#8B0000] to-[#0B162A]" />
            <div className="relative p-8 md:p-12 text-center">
              <svg className="w-10 h-10 text-white/20 mx-auto mb-6" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,0 14.5,8 24,8 16.5,13 19,22 12,17 5,22 7.5,13 0,8 9.5,8" /></svg>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">JOIN THE CHICAGO FAN ZONE</h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">Get breaking news, exclusive content, and contest alerts delivered to your inbox.</p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input type="email" placeholder="Enter your email" className="flex-1 px-5 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50" />
                <button type="submit" className="px-8 py-4 rounded-xl bg-white text-[#0B162A] font-bold hover:bg-white/90 transition-colors">Subscribe</button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/"><Image src="/logo-white.png" alt="Sports Mockery" width={160} height={45} className="h-9 w-auto" /></Link>
          <div className="flex items-center gap-8">
            {TEAMS.map(team => (
              <Link key={team.id} href={`/chicago-${team.id}`}>
                <Image src={team.logo} alt={team.name} width={28} height={28} className="w-7 h-7 object-contain opacity-50 hover:opacity-100 transition-opacity" unoptimized />
              </Link>
            ))}
          </div>
          <p className="text-white/40 text-sm">&copy; {new Date().getFullYear()} Sports Mockery</p>
        </div>
      </footer>
    </div>
  )
}
