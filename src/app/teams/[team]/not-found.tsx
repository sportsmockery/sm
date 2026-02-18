import Link from 'next/link';

export default function TeamNotFound() {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      background: 'var(--sm-dark)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: '16px', fontSize: 'var(--text-6xl)', fontWeight: 900, color: 'var(--sm-text)' }}>404</h1>
        <h2 style={{ marginBottom: '16px', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--sm-text)' }}>
          Team Not Found
        </h2>
        <p style={{ marginBottom: '32px', color: 'var(--sm-text-muted)' }}>
          We couldn&apos;t find the team you&apos;re looking for.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <Link
            href="/teams"
            className="btn btn-md btn-primary"
            style={{ textDecoration: 'none' }}
          >
            View All Teams
          </Link>
          <Link
            href="/"
            className="btn btn-md btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
