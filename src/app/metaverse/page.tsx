import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Metaverse | Virtual Stadium Tours - Sports Mockery',
  description: 'Experience Chicago sports stadiums in the metaverse. Virtual tours, VR experiences, and immersive fan moments.',
}

const venues = [
  {
    name: 'Soldier Field',
    team: 'Bears',
    description: 'Walk the historic tunnels and feel the roar of 60,000 fans',
    status: 'coming-soon',
    gradient: 'linear-gradient(135deg, #0B162A, #C83200)',
  },
  {
    name: 'United Center',
    team: 'Bulls & Blackhawks',
    description: 'Explore the championship banners and legendary courts',
    status: 'coming-soon',
    gradient: 'linear-gradient(135deg, #CE1141, #000000)',
  },
  {
    name: 'Wrigley Field',
    team: 'Cubs',
    description: 'Step onto the ivy-covered walls and touch history',
    status: 'coming-soon',
    gradient: 'linear-gradient(135deg, #0E3386, #CC3433)',
  },
  {
    name: 'Guaranteed Rate Field',
    team: 'White Sox',
    description: 'Experience the South Side atmosphere in stunning VR',
    status: 'coming-soon',
    gradient: 'linear-gradient(135deg, #27251F, #4a4a4a)',
  },
]

const experiences = [
  {
    title: 'Game Day Simulation',
    description: 'Experience the full game day atmosphere from tailgate to final whistle',
    iconPath: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z',
  },
  {
    title: 'Historic Moments',
    description: 'Relive legendary plays and championship victories in 360 VR',
    iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Locker Room Access',
    description: 'Go behind the scenes where champions prepare for battle',
    iconPath: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
  },
  {
    title: 'Fan Meetups',
    description: 'Connect with fellow fans in virtual watch parties and events',
    iconPath: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  },
]

export default function MetaversePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--sm-dark)' }}>
      {/* Hero Section */}
      <section className="sm-hero-bg" style={{ position: 'relative', overflow: 'hidden', padding: '80px 0 96px' }}>
        <div className="sm-grid-overlay" />

        <div style={{ position: 'relative', maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
          {/* Badge */}
          <span className="sm-tag" style={{ marginBottom: '24px', display: 'inline-flex' }}>
            <span className="pulse-dot" />
            Experience the Future of Sports
          </span>

          {/* Title */}
          <h1 style={{
            marginBottom: '24px',
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 900,
            color: 'var(--sm-text)',
            fontFamily: 'var(--sm-font-heading)',
            lineHeight: 1.1,
          }}>
            Enter the{' '}
            <span style={{ background: 'var(--sm-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Metaverse
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{ maxWidth: '640px', margin: '0 auto 40px', fontSize: 'var(--text-lg)', color: 'var(--sm-text-muted)', lineHeight: 1.6 }}>
            Immerse yourself in Chicago sports like never before. Virtual stadium tours,
            historic moment replays, and fan experiences that transcend reality.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            <button className="btn btn-md btn-primary" style={{ borderRadius: 'var(--sm-radius-pill)', padding: '12px 32px' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
              </svg>
              Watch Trailer
            </button>
            <button className="btn btn-md btn-secondary" style={{ borderRadius: 'var(--sm-radius-pill)', padding: '12px 32px' }}>
              Join Waitlist
            </button>
          </div>
        </div>
      </section>

      {/* Venues Grid */}
      <section style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '64px 16px' }}>
        <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '6px', height: '32px', borderRadius: 'var(--sm-radius-pill)', background: 'var(--sm-gradient)' }} />
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em', color: 'var(--sm-text)' }}>
            Virtual Venues
          </h2>
        </div>

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {venues.map((venue) => (
            <div
              key={venue.name}
              className="glass-card"
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: venue.gradient,
                padding: '32px',
              }}
            >
              <div style={{ position: 'relative' }}>
                {/* Status badge */}
                <span className="sm-tag" style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.1)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--sm-warning)' }} />
                  Coming Soon
                </span>

                {/* Team */}
                <p style={{ marginBottom: '4px', fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.6)' }}>
                  {venue.team}
                </p>

                {/* Venue name */}
                <h3 style={{ marginBottom: '12px', fontSize: 'var(--text-2xl)', fontWeight: 900, color: '#fff' }}>{venue.name}</h3>

                {/* Description */}
                <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)' }}>{venue.description}</p>

                {/* CTA */}
                <button style={{
                  marginTop: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: '#fff',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}>
                  Notify Me
                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experiences */}
      <section style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '64px 16px' }}>
        <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '6px', height: '32px', borderRadius: 'var(--sm-radius-pill)', background: 'var(--sm-gradient)' }} />
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em', color: 'var(--sm-text)' }}>
            VR Experiences
          </h2>
        </div>

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {experiences.map((exp) => (
            <div
              key={exp.title}
              className="glass-card-sm"
              style={{ padding: '24px' }}
            >
              {/* Icon */}
              <div style={{
                marginBottom: '16px',
                display: 'flex',
                width: '48px',
                height: '48px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--sm-radius-md)',
                background: 'var(--sm-gradient-subtle)',
                color: 'var(--accent-red)',
              }}>
                <svg style={{ width: '24px', height: '24px' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={exp.iconPath} />
                </svg>
              </div>

              {/* Title */}
              <h3 style={{ marginBottom: '8px', fontWeight: 700, color: 'var(--sm-text)' }}>{exp.title}</h3>

              {/* Description */}
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--sm-text-muted)' }}>{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '64px 16px' }}>
        <div className="glass-card" style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--sm-gradient-subtle)',
          padding: 'clamp(32px, 5vw, 48px)',
          textAlign: 'center',
        }}>
          <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '16px', fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', fontWeight: 900, color: 'var(--sm-text)' }}>
              Be First in the Metaverse
            </h2>
            <p style={{ marginBottom: '32px', color: 'var(--sm-text-muted)' }}>
              Join our exclusive waitlist for early access to virtual stadium tours and VR experiences.
            </p>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email"
                placeholder="Enter your email"
                className="input"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn btn-md btn-primary"
                style={{ width: '100%' }}
              >
                Join Waitlist
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Back link */}
      <div style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '0 16px 64px' }}>
        <Link
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--sm-text-muted)', textDecoration: 'none' }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
