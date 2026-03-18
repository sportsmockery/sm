'use client'

import type { Meta } from './types'

interface Props {
  meta: Meta | null
  lastFetched: Date | null
  onRefresh: () => void
  loading: boolean
}

export default function GlobalControlBar({ meta, lastFetched, onRefresh, loading }: Props) {
  return (
    <div
      className="sticky top-0 z-50 flex items-center justify-between px-4 py-2.5 backdrop-blur-md border-b"
      style={{
        backgroundColor: 'rgba(11,15,20,0.92)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-bold tracking-wide" style={{ color: '#FAFAFB' }}>
          CHICAGO SPORTS INTELLIGENCE
        </h1>
        {meta?.live_mode && (
          <span
            className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: 'rgba(188,0,0,0.2)', color: '#BC0000' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#BC0000' }} />
            LIVE
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {meta && (
          <span className="text-xs hidden sm:block" style={{ color: 'rgba(250,250,251,0.4)' }}>
            v{meta.version} &middot; schema {meta.schema_version}
          </span>
        )}
        {lastFetched && (
          <span className="text-xs" style={{ color: 'rgba(250,250,251,0.5)' }}>
            {lastFetched.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            })}
          </span>
        )}
        {meta?.cache_hit && (
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}>
            CACHED
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded transition-colors"
          style={{ color: loading ? 'rgba(250,250,251,0.3)' : '#00D4FF' }}
          title="Refresh data"
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={loading ? 'animate-spin' : ''}
          >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
