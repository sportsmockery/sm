'use client'

import { useEffect, useRef } from 'react'

function isChunkLoadError(error: Error): boolean {
  const msg = error.message || ''
  const name = error.name || ''
  return (
    name === 'ChunkLoadError' ||
    msg.includes('Loading chunk') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('Failed to load')
  )
}

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  const reloadAttempted = useRef(false)

  useEffect(() => {
    console.error('Application error:', error)

    // Auto-recover from stale chunk errors after deployment
    if (isChunkLoadError(error) && !reloadAttempted.current) {
      reloadAttempted.current = true
      window.location.reload()
      return
    }
  }, [error])

  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="sm-grid-overlay" />

      <div className="sm-container animate-fade-in-up" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 540, padding: '0 24px' }}>
        {/* Error icon */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--sm-gradient-subtle)',
          border: '1px solid rgba(188,0,0,0.2)',
          marginBottom: 32,
        }}>
          <svg style={{ width: 40, height: 40, color: 'var(--sm-red-light)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        {/* Error message */}
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          color: 'var(--sm-text)',
          marginBottom: 12,
        }}>
          Technical Difficulties
        </h1>
        <p style={{ color: 'var(--sm-text-muted)', marginBottom: 8, fontSize: 16, lineHeight: 1.6 }}>
          Looks like we threw an interception. Something went wrong on our end.
        </p>
        <p style={{ color: 'var(--sm-text-dim)', fontSize: 14, marginBottom: 32 }}>
          Our team has been notified and is working on it. Please try again.
        </p>

        {/* Dev error details */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="glass-card glass-card-static" style={{ textAlign: 'left', marginBottom: 32, padding: 20 }}>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: 'var(--sm-text-muted)', wordBreak: 'break-all' }}>
              {error.message}
            </p>
            {error.digest && (
              <p style={{ marginTop: 8, fontSize: 12, color: 'var(--sm-text-dim)' }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          <button onClick={reset} className="btn-primary">
            <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Try Again
          </button>
          <a href="/" className="btn-secondary">
            <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Go Home
          </a>
        </div>

        <p style={{ marginTop: 32, fontSize: 14, color: 'var(--sm-text-dim)' }}>
          If this problem persists,{' '}
          <a href="/contact" style={{ color: 'var(--sm-red-light)', textDecoration: 'underline' }}>
            contact our support team
          </a>
          .
        </p>
      </div>
    </div>
  )
}
