'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'

// Chicago teams data
const CHICAGO_TEAMS = [
  {
    name: 'Chicago Bears',
    slug: 'bears',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    primaryColor: '#0B162A',
    secondaryColor: '#C83803',
    league: 'NFL',
  },
  {
    name: 'Chicago Bulls',
    slug: 'bulls',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
    league: 'NBA',
  },
  {
    name: 'Chicago Cubs',
    slug: 'cubs',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    primaryColor: '#0E3386',
    secondaryColor: '#CC3433',
    league: 'MLB',
  },
  {
    name: 'Chicago White Sox',
    slug: 'white-sox',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    primaryColor: '#27251F',
    secondaryColor: '#C4CED4',
    league: 'MLB',
  },
  {
    name: 'Chicago Blackhawks',
    slug: 'blackhawks',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    primaryColor: '#CF0A2C',
    secondaryColor: '#000000',
    league: 'NHL',
  },
]

// Contest data
const CONTESTS = [
  {
    id: 1,
    title: 'Bears Home Opener',
    subtitle: 'Win 4 Tickets + Sideline Passes',
    image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&q=80',
    endDate: new Date('2025-09-07T18:00:00'),
    prize: '4 Premium Tickets + Field Access',
    team: 'bears',
  },
  {
    id: 2,
    title: 'Bulls Opening Night',
    subtitle: 'Courtside Experience Package',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80',
    endDate: new Date('2025-10-22T19:00:00'),
    prize: '2 Courtside Seats + Meet & Greet',
    team: 'bulls',
  },
  {
    id: 3,
    title: 'Cubs Playoff Run',
    subtitle: 'Postseason VIP Package',
    image: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=800&q=80',
    endDate: new Date('2025-10-01T13:00:00'),
    prize: 'Rooftop Suite for 10',
    team: 'cubs',
  },
  {
    id: 4,
    title: 'Blackhawks Winter Classic',
    subtitle: 'Outdoor Hockey Experience',
    image: 'https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800&q=80',
    endDate: new Date('2026-01-01T12:00:00'),
    prize: 'Ice-Level Seats + Warm-Up Access',
    team: 'blackhawks',
  },
]

// Featured players
const FEATURED_PLAYERS = [
  {
    name: 'Caleb Williams',
    team: 'Bears',
    position: 'QB',
    image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/4432577.png&w=350&h=254',
    stats: { label: 'TD', value: '20' },
    color: '#C83803',
  },
  {
    name: 'Coby White',
    team: 'Bulls',
    position: 'G',
    image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nba/players/full/4395725.png&w=350&h=254',
    stats: { label: 'PPG', value: '19.1' },
    color: '#CE1141',
  },
  {
    name: 'Cody Bellinger',
    team: 'Cubs',
    position: 'OF',
    image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/mlb/players/full/33912.png&w=350&h=254',
    stats: { label: 'HR', value: '18' },
    color: '#0E3386',
  },
  {
    name: 'Connor Bedard',
    team: 'Blackhawks',
    position: 'C',
    image: 'https://a.espncdn.com/combiner/i?img=/i/headshots/nhl/players/full/5161455.png&w=350&h=254',
    stats: { label: 'PTS', value: '61' },
    color: '#CF0A2C',
  },
]

// Countdown timer hook
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return timeLeft
}

// Countdown display component
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const timeLeft = useCountdown(targetDate)

  return (
    <div className="flex gap-3">
      {[
        { value: timeLeft.days, label: 'DAYS' },
        { value: timeLeft.hours, label: 'HRS' },
        { value: timeLeft.minutes, label: 'MIN' },
        { value: timeLeft.seconds, label: 'SEC' },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px]">
            <span className="text-2xl font-bold text-white tabular-nums">
              {String(item.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] text-white/60 font-medium tracking-wider mt-1 block">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// Contest card component
function ContestCard({ contest, index }: { contest: typeof CONTESTS[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const team = CHICAGO_TEAMS.find((t) => t.slug === contest.team)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${team?.primaryColor || '#000'} 0%, #000 100%)`,
      }}
    >
      {/* Background image */}
      <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity duration-500">
        <Image
          src={contest.image}
          alt={contest.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* Content */}
      <div className="relative p-6 min-h-[400px] flex flex-col justify-end">
        {/* Team badge */}
        {team && (
          <div className="absolute top-4 right-4">
            <Image
              src={team.logo}
              alt={team.name}
              width={48}
              height={48}
              className="w-12 h-12 object-contain opacity-80"
              unoptimized
            />
          </div>
        )}

        {/* Prize tag */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit"
          style={{ backgroundColor: team?.secondaryColor || '#C83803' }}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-white">{contest.prize}</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-1">{contest.title}</h3>
        <p className="text-white/70 mb-6">{contest.subtitle}</p>

        {/* Countdown */}
        <div className="mb-6">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Entry Closes In</p>
          <CountdownTimer targetDate={contest.endDate} />
        </div>

        {/* Enter button */}
        <button
          className="w-full py-3 rounded-xl font-bold text-white transition-all duration-300 group-hover:scale-[1.02]"
          style={{ backgroundColor: team?.secondaryColor || '#C83803' }}
        >
          Enter Now
        </button>
      </div>
    </motion.div>
  )
}

// Player card component
function PlayerCard({ player, index }: { player: typeof FEATURED_PLAYERS[0]; index: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative"
    >
      <div
        className="relative rounded-2xl overflow-hidden p-1"
        style={{
          background: `linear-gradient(135deg, ${player.color} 0%, transparent 100%)`,
        }}
      >
        <div className="rounded-xl p-4" style={{ backgroundColor: '#0a0a0a' }}>
          {/* Player image */}
          <div className="relative h-48 mb-4 overflow-hidden rounded-lg bg-gradient-to-b from-white/5 to-transparent">
            <Image
              src={player.image}
              alt={player.name}
              fill
              className="object-contain object-bottom scale-125 group-hover:scale-130 transition-transform duration-500"
              unoptimized
            />
          </div>

          {/* Player info */}
          <div className="text-center">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">
              {player.team} | {player.position}
            </p>
            <h4 className="text-white font-bold text-lg mb-3">{player.name}</h4>

            {/* Stat highlight */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: `${player.color}30` }}
            >
              <span className="text-2xl font-bold" style={{ color: player.color }}>
                {player.stats.value}
              </span>
              <span className="text-white/60 text-sm">{player.stats.label}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function FanZonePage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  const [selectedTeam, setSelectedTeam] = useState('')
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#050505' }}>
      {/* Hero Section with Video Background */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Video Background */}
        <motion.div style={{ scale: heroScale }} className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1461896836934- voices?w=1920&q=80"
          >
            <source
              src="https://player.vimeo.com/external/370467553.sd.mp4?s=7ccaa3c5c17b86c2c86a0f42c8ed4c42b4b76d80&profile_id=164&oauth2_token_id=57447761"
              type="video/mp4"
            />
          </video>
          {/* Fallback gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B162A] via-[#1a1a2e] to-[#C83803]/30" />
        </motion.div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

        {/* Chicago skyline silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent" />

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative h-full flex flex-col items-center justify-center text-center px-4"
        >
          {/* Chicago 6-point star */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6"
          >
            <svg className="w-16 h-16" style={{ color: '#C83803' }} viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,0 14.5,8 24,8 16.5,13 19,22 12,17 5,22 7.5,13 0,8 9.5,8" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight"
          >
            <span className="text-white">CHICAGO</span>
            <br />
            <span className="bg-gradient-to-r from-[#C83803] via-[#CE1141] to-[#0E3386] bg-clip-text text-transparent">
              FAN ZONE
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-white/80 max-w-2xl mb-8"
          >
            Your gateway to exclusive contests, VIP experiences, and insider access to Chicago&apos;s greatest teams.
          </motion.p>

          {/* Team logos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center gap-6 mb-12"
          >
            {CHICAGO_TEAMS.map((team) => (
              <Image
                key={team.slug}
                src={team.logo}
                alt={team.name}
                width={48}
                height={48}
                className="w-10 h-10 md:w-12 md:h-12 object-contain opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                unoptimized
              />
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="absolute bottom-12"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs uppercase tracking-widest text-white/50">Scroll to explore</span>
              <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Players Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-sm uppercase tracking-[0.3em] mb-4" style={{ color: '#C83803' }}>Chicago&apos;s Finest</h2>
            <p className="text-4xl md:text-5xl font-black">PLAYER SPOTLIGHT</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {FEATURED_PLAYERS.map((player, index) => (
              <PlayerCard key={player.name} player={player} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Contests Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-[#0a0a0a] to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-sm uppercase tracking-[0.3em] mb-4" style={{ color: '#C83803' }}>Win Big</h2>
            <p className="text-4xl md:text-5xl font-black mb-6">ACTIVE CONTESTS</p>
            <p className="text-white/60 max-w-2xl mx-auto">
              Enter for your chance to win exclusive experiences with your favorite Chicago teams.
              New contests added regularly.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {CONTESTS.map((contest, index) => (
              <ContestCard key={contest.id} contest={contest} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / Entry Form Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#C83803] via-[#8B0000] to-[#0B162A]" />
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            <div className="relative p-8 md:p-12 text-center">
              {/* Chicago star */}
              <div className="flex justify-center mb-6">
                <svg className="w-12 h-12 text-white/30" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12,0 14.5,8 24,8 16.5,13 19,22 12,17 5,22 7.5,13 0,8 9.5,8" />
                </svg>
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                JOIN THE CHICAGO FAN ZONE
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Get early access to contests, exclusive content, and special offers from Sports Mockery.
              </p>

              {/* Form */}
              <form className="max-w-md mx-auto space-y-4">
                <div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/50 transition-colors"
                  />
                </div>

                <div>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:border-white/50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" style={{ backgroundColor: '#1a1a1a' }}>Select your favorite team</option>
                    {CHICAGO_TEAMS.map((team) => (
                      <option key={team.slug} value={team.slug} style={{ backgroundColor: '#1a1a1a' }}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-lg hover:bg-white/90 transition-colors"
                  style={{ backgroundColor: '#ffffff', color: '#0B162A' }}
                >
                  Join Now
                </button>

                <p className="text-xs text-white/50">
                  By joining, you agree to receive emails from Sports Mockery. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Feed Section */}
      <section className="py-24 px-4" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-sm uppercase tracking-[0.3em] mb-4" style={{ color: '#C83803' }}>@SportsMockery</h2>
            <p className="text-4xl md:text-5xl font-black">FROM THE COMMUNITY</p>
          </motion.div>

          {/* Placeholder social grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="aspect-square bg-white/5 rounded-xl overflow-hidden group cursor-pointer"
              >
                <div className="w-full h-full flex items-center justify-center text-white/20 group-hover:text-white/40 transition-colors">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Sports Mockery</span>
        </Link>
      </section>
    </div>
  )
}
