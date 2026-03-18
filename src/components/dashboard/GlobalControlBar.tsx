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
      className="sticky top-0 z-50 flex items-center justify-between px-4 lg:px-10 py-3 backdrop-blur-xl"
      style={{
        backgroundColor: 'rgba(248,249,251,0.88)',
        borderBottom: '1px solid rgba(11,15,20,0.06)',
        boxShadow: '0 1px 2px rgba(11,15,20,0.03)',
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#0B0F14' }} />
          <h1 className="text-[13px] font-bold tracking-[0.04em]" style={{ color: '#0B0F14' }}>
            Chicago Sports Intelligence
          </h1>
        </div>
        {meta?.live_mode && (
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase"
            style={{ backgroundColor: 'rgba(188,0,0,0.08)', color: '#BC0000' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#BC0000' }} />
            Live
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {lastFetched && (
          <span className="text-[11px] tabular-nums" style={{ color: 'rgba(11,15,20,0.35)' }}>
            {lastFetched.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </span>
        )}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{
            color: loading ? 'rgba(11,15,20,0.15)' : 'rgba(11,15,20,0.4)',
            backgroundColor: 'rgba(11,15,20,0.03)',
            border: '1px solid rgba(11,15,20,0.06)',
          }}
          title="Refresh"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'animate-spin' : ''}>
            <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
