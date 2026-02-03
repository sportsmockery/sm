'use client'
import { useState } from 'react'
import type { AuditResult } from '@/types/gm-audit'

interface AuditButtonProps {
  tradeId: string
  onAuditComplete: (audit: AuditResult) => void
  isDark?: boolean
}

export function AuditButton({ tradeId, onAuditComplete, isDark = true }: AuditButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAudit = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gm/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade_id: tradeId })
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Audit failed')
      }

      const audit = await response.json()
      onAuditComplete(audit)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to audit trade')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleAudit}
        disabled={loading}
        style={{
          flex: 1,
          padding: '10px 12px',
          borderRadius: 8,
          border: `2px solid ${isDark ? '#3b82f6' : '#2563eb'}`,
          backgroundColor: loading ? (isDark ? '#1e3a5f' : '#dbeafe') : 'transparent',
          color: isDark ? '#3b82f6' : '#2563eb',
          fontWeight: 600,
          fontSize: 13,
          cursor: loading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          opacity: loading ? 0.7 : 1,
          whiteSpace: 'nowrap',
        }}
        title={error || undefined}
      >
        {loading ? (
          <>
            <svg
              style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }}
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            ...
          </>
        ) : (
          <>
            <svg
              style={{ width: 14, height: 14 }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Audit
          </>
        )}
      </button>
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
