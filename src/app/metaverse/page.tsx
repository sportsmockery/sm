import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Metaverse | Virtual Stadium Tours - Sports Mockery',
  description: 'Experience Chicago sports stadiums in the metaverse. Virtual tours, VR experiences, and immersive fan moments.',
}

const venues = [
  {
    name: 'Soldier Field',
    team: 'Bears',
    description: 'Walk the historic tunnels and feel the roar of 60,000 fans',
    image: '/images/soldier-field-vr.jpg',
    status: 'coming-soon',
    gradient: 'from-[#0B162A] to-[#C83200]',
  },
  {
    name: 'United Center',
    team: 'Bulls & Blackhawks',
    description: 'Explore the championship banners and legendary courts',
    image: '/images/united-center-vr.jpg',
    status: 'coming-soon',
    gradient: 'from-[#CE1141] to-[#000000]',
  },
  {
    name: 'Wrigley Field',
    team: 'Cubs',
    description: 'Step onto the ivy-covered walls and touch history',
    image: '/images/wrigley-field-vr.jpg',
    status: 'coming-soon',
    gradient: 'from-[#0E3386] to-[#CC3433]',
  },
  {
    name: 'Guaranteed Rate Field',
    team: 'White Sox',
    description: 'Experience the South Side atmosphere in stunning VR',
    image: '/images/guaranteed-rate-vr.jpg',
    status: 'coming-soon',
    gradient: 'from-[#27251F] to-[#4a4a4a]',
  },
]

const experiences = [
  {
    title: 'Game Day Simulation',
    description: 'Experience the full game day atmosphere from tailgate to final whistle',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
      </svg>
    ),
  },
  {
    title: 'Historic Moments',
    description: 'Relive legendary plays and championship victories in 360 VR',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Locker Room Access',
    description: 'Go behind the scenes where champions prepare for battle',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: 'Fan Meetups',
    description: 'Connect with fellow fans in virtual watch parties and events',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
]

export default function MetaversePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-purple-950/20 to-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,0,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,0,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-4 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-500/20 px-4 py-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500" />
            </span>
            <span className="text-sm font-semibold text-purple-300">Experience the Future of Sports</span>
          </div>

          {/* Title */}
          <h1 className="mb-6 font-heading text-4xl font-black text-white sm:text-5xl lg:text-6xl">
            Enter the{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Metaverse
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-400">
            Immerse yourself in Chicago sports like never before. Virtual stadium tours,
            historic moment replays, and fan experiences that transcend reality.
          </p>

          {/* CTA */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 font-bold text-white transition-all hover:from-purple-500 hover:to-blue-500 hover:shadow-lg hover:shadow-purple-500/25">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
              </svg>
              Watch Trailer
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-8 py-4 font-bold text-purple-300 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-purple-500/20">
              Join Waitlist
            </button>
          </div>
        </div>
      </section>

      {/* Venues Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 flex items-center gap-4">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-purple-500 to-blue-500" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            Virtual Venues
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {venues.map((venue) => (
            <div
              key={venue.name}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${venue.gradient} p-8 transition-transform hover:scale-[1.02]`}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />

              {/* Glow effect */}
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl transition-all group-hover:bg-white/20" />

              <div className="relative">
                {/* Status badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                  Coming Soon
                </div>

                {/* Team */}
                <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-white/60">
                  {venue.team}
                </p>

                {/* Venue name */}
                <h3 className="mb-3 text-2xl font-black text-white">{venue.name}</h3>

                {/* Description */}
                <p className="text-sm text-white/70">{venue.description}</p>

                {/* CTA */}
                <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-white/80">
                  Notify Me
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experiences */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 flex items-center gap-4">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-purple-500 to-blue-500" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            VR Experiences
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.map((exp) => (
            <div
              key={exp.title}
              className="group rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 backdrop-blur-sm transition-all hover:border-purple-500/40 hover:bg-purple-500/10"
            >
              {/* Icon */}
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400 transition-colors group-hover:text-purple-300">
                {exp.icon}
              </div>

              {/* Title */}
              <h3 className="mb-2 font-bold text-white">{exp.title}</h3>

              {/* Description */}
              <p className="text-sm text-zinc-400">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 to-blue-900 p-8 sm:p-12">
          {/* Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="absolute -right-20 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative mx-auto max-w-xl text-center">
            <h2 className="mb-4 text-2xl font-black text-white sm:text-3xl">
              Be First in the Metaverse
            </h2>
            <p className="mb-8 text-purple-200/80">
              Join our exclusive waitlist for early access to virtual stadium tours and VR experiences.
            </p>

            <form className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-xl border border-white/10 bg-white/10 px-5 py-3 text-white placeholder:text-white/50 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <button
                type="submit"
                className="rounded-xl bg-white px-6 py-3 font-bold text-purple-900 transition-all hover:bg-purple-100"
              >
                Join Waitlist
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Back link */}
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
