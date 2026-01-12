'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChartBuilderModal, type ChartConfig } from '@/components/admin/ChartBuilder'

export default function NewChartPage() {
  const [showModal, setShowModal] = useState(true)
  const router = useRouter()

  const handleInsert = (config: ChartConfig) => {
    // Save chart to database
    console.log('Saving chart:', config)
    // For now, just redirect to charts list
    router.push('/admin/charts')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/charts"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create New Chart</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            Build a data visualization for your articles
          </p>
        </div>
      </div>

      {/* Full Page Chart Builder */}
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
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-red-hover)] transition-colors"
            >
              Open Chart Builder
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
