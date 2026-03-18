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
      className="sticky top-0 z-50 flex items-center justify-between px-4 lg:px-8 py-3 backdrop-blur-xl border-b"
      style={{
        backgroundColor: 'rgba(9,12,16,0.85)',
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-5 rounded-full" style={{ backgroundColor: '#00D4FF' }} />
          <h1 className="text-[13px] font-bold tracking-[0.12em] uppercase" style={{ color: '#E8EAED' }}>
            Chicago Sports Intelligence
          </h1>
        </div>
        {meta?.live_mode && (
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase"
            style={{ backgroundColor: 'rgba(188,0,0,0.15)', color: '#BC0000', border: '1px solid rgba(188,0,0,0.2)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#BC0000' }} />
            Live
          </span>
        )}
      </div>

      <div className="flex items-center gap-5">
        {meta && (
          <span className="text-[10px] tracking-wide hidden sm:block" style={{ color: 'rgba(232,234,237,0.2)' }}>
            v{meta.version}
          </span>
        )}
        {lastFetched && (
          <span className="text-[10px] tracking-wide" style={{ color: 'rgba(232,234,237,0.35)' }}>
            {lastFetched.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
          </span>
        )}
        {meta?.cache_hit && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-md font-medium tracking-wide"
            style={{ backgroundColor: 'rgba(0,212,255,0.08)', color: 'rgba(0,212,255,0.6)' }}
          >
            CACHED
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-lg transition-all"
          style={{
            color: loading ? 'rgba(232,234,237,0.15)' : '#00D4FF',
            backgroundColor: 'rgba(255,255,255,0.03)',
          }}
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
