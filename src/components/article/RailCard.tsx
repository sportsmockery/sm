import { ReactNode } from 'react'

interface RailCardProps {
  title?: string
  icon?: ReactNode
  children: ReactNode
}

export default function RailCard({ title, icon, children }: RailCardProps) {
  return (
    <div className="article-glass-card-sm">
      {title && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          paddingBottom: 12,
          borderBottom: '1px solid var(--sm-border)',
        }}>
          {icon}
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--sm-text)',
            fontFamily: "'Montserrat', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {title}
          </span>
        </div>
      )}
      {children}
    </div>
  )
}
