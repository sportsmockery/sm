'use client'

import React from 'react'

interface SegmentErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Catches errors in non-critical segments (e.g. comments, view counter)
 * so the rest of the page (e.g. article body) continues to render.
 */
export class SegmentErrorBoundary extends React.Component<
  SegmentErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: SegmentErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn('SegmentErrorBoundary caught:', error.message, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            className="glass-card glass-card-static"
            style={{
              padding: '28px',
              marginTop: '32px',
              fontSize: '14px',
              color: 'var(--sm-text-muted)',
            }}
          >
            This section could not be loaded.
          </div>
        )
      )
    }
    return this.props.children
  }
}
