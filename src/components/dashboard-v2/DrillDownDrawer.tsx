'use client'

import { useEffect, type ReactNode } from 'react'

interface DrillDownDrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
}

export default function DrillDownDrawer({ open, onClose, title, subtitle, children }: DrillDownDrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end lg:items-stretch lg:justify-end">
      {/* Scrim */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{ backgroundColor: 'rgba(11,15,20,0.25)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full lg:w-[520px] max-h-[90vh] lg:max-h-full overflow-y-auto rounded-t-2xl lg:rounded-none animate-slide-up lg:animate-fade-in"
        style={{
          backgroundColor: 'rgba(250,250,251,0.97)',
          backdropFilter: 'blur(20px)',
          boxShadow: '-4px 0 32px rgba(11,15,20,0.08)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b"
          style={{
            backgroundColor: 'rgba(250,250,251,0.95)',
            borderColor: 'rgba(11,15,20,0.06)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div>
            {title && <h2 className="text-sm font-bold" style={{ color: '#0B0F14' }}>{title}</h2>}
            {subtitle && <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.4)' }}>{subtitle}</span>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(11,15,20,0.35)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
