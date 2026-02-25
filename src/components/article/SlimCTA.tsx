'use client'

import Link from 'next/link'

export default function SlimCTA() {
  return (
    <div
      className="article-glass-card-sm"
      style={{
        marginTop: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        background: 'var(--sm-surface)',
        padding: '14px 20px',
      }}
    >
      <span style={{ fontSize: 14, color: 'var(--sm-text-muted)', fontWeight: 500 }}>
        Never miss a Chicago sports take.
      </span>
      <Link
        href="/signup"
        style={{
          backgroundColor: '#bc0000',
          color: '#ffffff',
          border: 'none',
          outline: 'none',
          padding: '8px 20px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          transition: 'opacity 0.2s',
        }}
      >
        Sign Up
      </Link>
    </div>
  )
}
