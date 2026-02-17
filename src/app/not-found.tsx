import Link from 'next/link'

export default function NotFound() {
  const teams = [
    { name: 'Bears', slug: 'chicago-bears', color: '#0B162A' },
    { name: 'Bulls', slug: 'chicago-bulls', color: '#CE1141' },
    { name: 'Cubs', slug: 'chicago-cubs', color: '#0E3386' },
    { name: 'White Sox', slug: 'chicago-white-sox', color: '#27251F' },
    { name: 'Blackhawks', slug: 'chicago-blackhawks', color: '#CF0A2C' },
  ]

  return (
    <div
      className="flex items-center justify-center px-4"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--sm-dark)',
      }}
    >
      <div className="text-center" style={{ maxWidth: '540px' }}>
        {/* 404 Number with gradient */}
        <div style={{ marginBottom: '24px' }}>
          <span
            style={{
              fontSize: 'clamp(120px, 20vw, 200px)',
              fontWeight: 900,
              fontFamily: "'Montserrat', sans-serif",
              lineHeight: 1,
              display: 'block',
              background: 'linear-gradient(135deg, #bc0000, #ff4444)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              userSelect: 'none',
            }}
          >
            404
          </span>
        </div>

        {/* Error message */}
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--sm-text)',
            fontFamily: "'Montserrat', sans-serif",
            marginBottom: '12px',
          }}
        >
          Fumbled at the Goal Line
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--sm-text-muted)',
            lineHeight: 1.6,
            marginBottom: '36px',
          }}
        >
          Looks like this page went out of bounds. The content you&apos;re looking for
          might have been traded, waived, or simply doesn&apos;t exist.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ marginBottom: '48px' }}>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #bc0000, #ff4444)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '15px',
              padding: '14px 28px',
              borderRadius: '9999px',
              textDecoration: 'none',
              border: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Back to Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--sm-card)',
              border: '1px solid var(--sm-border)',
              color: 'var(--sm-text)',
              fontWeight: 600,
              fontSize: '15px',
              padding: '14px 28px',
              borderRadius: '9999px',
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search Articles
          </Link>
        </div>

        {/* Team links */}
        <div
          style={{
            paddingTop: '32px',
            borderTop: '1px solid var(--sm-border)',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: 'var(--sm-text-dim)',
              marginBottom: '16px',
            }}
          >
            Or check out the latest from your team:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {teams.map((team) => (
              <Link
                key={team.slug}
                href={`/${team.slug}`}
                className="px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: team.color,
                  color: '#ffffff',
                  borderRadius: '9999px',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
              >
                {team.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
