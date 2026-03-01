import Link from 'next/link'

export default function FeatureCard({
  href,
  icon,
  title,
  description,
  buttonText,
  accentColor,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  buttonText: string
  accentColor: string
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="team-feature-card">
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, rgba(0,0,0,0.3), ${accentColor}22)`,
            border: `1px solid ${accentColor}33`,
            color: accentColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontFamily: "Barlow, sans-serif",
              color: 'var(--sm-text)',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '-0.2px',
              margin: '0 0 2px 0',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              color: 'var(--sm-text-muted)',
              fontSize: '12px',
              lineHeight: 1.4,
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {description}
          </p>
        </div>
        <span
          className="team-feature-btn"
          style={{
            backgroundColor: accentColor,
            color: '#ffffff',
          }}
        >
          {buttonText}
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>
    </Link>
  )
}
