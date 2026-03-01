import Link from 'next/link'

export default function FanChatWidget({ teamLabel, channel }: { teamLabel: string; channel: string }) {
  return (
    <div className="glass-card glass-card-static">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--sm-gradient-subtle)',
          }}
        >
          <svg width="20" height="20" style={{ color: 'var(--sm-red-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontFamily: "Barlow, sans-serif", color: 'var(--sm-text)', fontWeight: 700, fontSize: '16px', margin: 0 }}>
            {teamLabel} Fan Chat
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--sm-text-dim)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sm-success)', display: 'inline-block' }} />
            <span>Fans online</span>
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--sm-text-muted)', fontSize: '14px', margin: '0 0 16px 0' }}>
        Join the conversation with fellow {teamLabel} fans.
      </p>

      <Link
        href={`/fan-chat?channel=${channel}`}
        className="btn btn-md btn-secondary"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          textDecoration: 'none',
          borderRadius: 'var(--sm-radius-pill)',
        }}
      >
        Join {teamLabel} Chat
      </Link>
    </div>
  )
}
