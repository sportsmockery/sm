import Link from 'next/link'

export default function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: 'var(--sm-text)',
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.5px',
          paddingBottom: '8px',
          borderBottom: '3px solid var(--sm-red)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="btn btn-sm btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          View All
        </Link>
      )}
    </div>
  )
}
