import Image from 'next/image'
import Link from 'next/link'

export default function AskAIWidget({ teamSlug, teamLabel }: { teamSlug: string; teamLabel: string }) {
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
          <Image src="/downloads/scout-v2.png" alt="Scout AI" width={20} height={20} />
        </div>
        <div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)', fontWeight: 700, fontSize: '16px', margin: 0 }}>
            Scout AI
          </h3>
          <p style={{ color: 'var(--sm-text-dim)', fontSize: '12px', margin: 0 }}>
            Get instant answers about the {teamLabel}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        <Link
          href={`/scout-ai?team=${teamSlug}&q=What%20is%20the%20${teamLabel}%20record%20this%20season`}
          style={{
            display: 'block',
            padding: '8px 12px',
            borderRadius: 'var(--sm-radius-sm)',
            fontSize: '14px',
            background: 'var(--sm-surface)',
            color: 'var(--sm-text-muted)',
            border: '1px solid var(--sm-border)',
            textDecoration: 'none',
            transition: 'border-color 0.2s',
          }}
        >
          &quot;What&apos;s the {teamLabel} record?&quot;
        </Link>
      </div>

      <Link
        href={`/scout-ai?team=${teamSlug}`}
        className="btn btn-md btn-primary"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          textDecoration: 'none',
          borderRadius: 'var(--sm-radius-pill)',
        }}
      >
        Ask Scout
      </Link>
    </div>
  )
}
