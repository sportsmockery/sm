import Link from 'next/link'

export default function NotFound() {
  const teams = [
    { name: 'Bears', slug: 'chicago-bears' },
    { name: 'Bulls', slug: 'chicago-bulls' },
    { name: 'Cubs', slug: 'chicago-cubs' },
    { name: 'White Sox', slug: 'chicago-white-sox' },
    { name: 'Blackhawks', slug: 'chicago-blackhawks' },
  ]

  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="sm-grid-overlay" />
      <div className="glow-orb glow-red" style={{ top: '-100px', right: '-100px' }} />

      <div className="sm-container animate-fade-in-up" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 540, padding: '0 24px' }}>
        {/* 404 Number */}
        <div className="gradient-text" style={{
          fontSize: 'clamp(120px, 20vw, 200px)',
          fontWeight: 900,
          fontFamily: "Barlow, sans-serif",
          lineHeight: 1,
          marginBottom: 24,
        }}>
          404
        </div>

        {/* Error message */}
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          fontFamily: "Barlow, sans-serif",
          color: 'var(--sm-text)',
          marginBottom: 12,
        }}>
          Fumbled at the Goal Line
        </h1>
        <p style={{
          fontSize: 16,
          color: 'var(--sm-text-muted)',
          lineHeight: 1.6,
          marginBottom: 36,
        }}>
          Looks like this page went out of bounds. The content you&apos;re looking for
          might have been traded, waived, or simply doesn&apos;t exist.
        </p>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginBottom: 48 }}>
          <Link href="/" className="btn-primary">
            <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Back to Home
          </Link>
          <Link href="/search" className="btn-secondary">
            <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search Articles
          </Link>
        </div>

        {/* Team links */}
        <div style={{ paddingTop: 32, borderTop: '1px solid var(--sm-border)' }}>
          <p style={{ fontSize: 14, color: 'var(--sm-text-dim)', marginBottom: 16 }}>
            Or check out the latest from your team:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {teams.map((team) => (
              <Link key={team.slug} href={`/${team.slug}`} className="team-pill">
                {team.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
