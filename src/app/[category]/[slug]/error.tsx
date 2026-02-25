'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

function isChunkLoadError(error: Error): boolean {
  const msg = error.message || ''
  const name = error.name || ''
  return (
    name === 'ChunkLoadError' ||
    msg.includes('Loading chunk') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('Failed to load') ||
    // Next.js specific chunk errors
    msg.includes('Cannot find module') ||
    msg.includes('is not a function') && error.digest != null
  )
}

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const reloadAttempted = useRef(false)

  useEffect(() => {
    console.error('Article page error:', error)

    // Auto-recover from stale chunk errors after deployment
    // by doing a hard reload (clears cached JS)
    if (isChunkLoadError(error) && !reloadAttempted.current) {
      reloadAttempted.current = true
      window.location.reload()
      return
    }
  }, [error])

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--sm-text)' }}>
        Couldn&apos;t load article
      </h1>
      <p className="mb-8" style={{ color: 'var(--sm-text-muted)' }}>
        We had trouble loading this article. It may have been moved or deleted.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 font-medium rounded-lg transition-colors"
          style={{
            backgroundColor: '#bc0000',
            color: '#ffffff',
          }}
        >
          Reload page
        </button>
        <button
          onClick={reset}
          className="px-6 py-2 font-medium rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text)' }}
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-2 font-medium rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text)' }}
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
