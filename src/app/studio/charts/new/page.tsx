'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChartBuilderModal, type ChartConfig } from '@/components/admin/ChartBuilder'

export default function StudioNewChartPage() {
  const [showModal, setShowModal] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleInsert = async (config: ChartConfig) => {
    try {
      setSaving(true)
      const response = await fetch('/api/charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create chart')
      }

      router.push('/studio/charts')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create chart')
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/studio/charts"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create New Chart</h1>
          <p className="mt-1 text-[var(--text-muted)]">Build a data visualization for your articles</p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] min-h-[600px]">
        {showModal && (
          <ChartBuilderModal
            isOpen={true}
            onClose={() => setShowModal(false)}
            onInsert={handleInsert}
          />
        )}

        {!showModal && (
          <div className="flex flex-col items-center justify-center h-[600px]">
            <p className="text-[var(--text-muted)] mb-4">Chart builder closed</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium bg-[#bc0000] text-white dark:bg-white dark:text-[#bc0000]"
            >
              Open Chart Builder
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
