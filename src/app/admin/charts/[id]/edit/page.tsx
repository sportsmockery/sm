'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChartBuilderModal, type ChartConfig } from '@/components/admin/ChartBuilder'

interface EditChartPageProps {
  params: Promise<{ id: string }>
}

export default function EditChartPage({ params }: EditChartPageProps) {
  const { id } = use(params)
  const [showModal, setShowModal] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialConfig, setInitialConfig] = useState<ChartConfig | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/charts/${id}`)
        if (!response.ok) {
          throw new Error('Chart not found')
        }
        const data = await response.json()
        setInitialConfig(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chart')
      } finally {
        setLoading(false)
      }
    }
    fetchChart()
  }, [id])

  const handleInsert = async (config: ChartConfig) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/charts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update chart')
      }

      router.push('/admin/charts')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update chart')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-red)]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/charts"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Edit Chart</h1>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <Link
            href="/admin/charts"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-red-hover)] transition-colors"
          >
            Back to Charts
          </Link>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Edit Chart</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            Update your data visualization
          </p>
        </div>
      </div>

      {/* Full Page Chart Builder */}
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] min-h-[600px]">
        {showModal && initialConfig && (
          <ChartBuilderModalWithInitial
            isOpen={true}
            onClose={() => setShowModal(false)}
            onInsert={handleInsert}
            initialConfig={initialConfig}
            isEditing={true}
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

// Extended modal that accepts initial config
function ChartBuilderModalWithInitial({
  isOpen,
  onClose,
  onInsert,
  initialConfig,
  isEditing,
}: {
  isOpen: boolean
  onClose: () => void
  onInsert: (config: ChartConfig) => void
  initialConfig: ChartConfig
  isEditing?: boolean
}) {
  const [config, setConfig] = useState<ChartConfig>(initialConfig)
  const [activeTab, setActiveTab] = useState<'design' | 'data'>('design')

  const updateConfig = (updates: Partial<ChartConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  const handleDataChange = (data: ChartConfig['data']) => {
    updateConfig({ data })
  }

  const handleInsert = () => {
    if (!config.title.trim()) {
      alert('Please enter a chart title')
      return
    }
    if (config.data.length < 2 || config.data.some((d) => !d.label)) {
      alert('Please enter at least 2 data points with labels')
      return
    }
    onInsert(config)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Chart' : 'Create Chart'}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-140px)]">
          {/* Left Panel - Configuration */}
          <div className="w-1/2 border-r border-zinc-800 overflow-y-auto p-6 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-zinc-800 pb-4">
              <button
                onClick={() => setActiveTab('design')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'design'
                    ? 'bg-[#8B0000] text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                Design
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'data'
                    ? 'bg-[#8B0000] text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                Data
              </button>
            </div>

            {activeTab === 'design' && (
              <>
                {/* Chart Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Chart Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'bar', label: 'Bar' },
                      { value: 'line', label: 'Line' },
                      { value: 'pie', label: 'Pie' },
                      { value: 'player-comparison', label: 'Player' },
                      { value: 'team-stats', label: 'Team' },
                    ] as const).map((item) => (
                      <button
                        key={item.value}
                        onClick={() => updateConfig({ type: item.value as ChartConfig['type'] })}
                        className={`rounded-lg border px-3 py-2 text-sm capitalize transition-all ${
                          config.type === item.value
                            ? 'border-[#8B0000] bg-[#8B0000]/10 text-white'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    Chart Title
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => updateConfig({ title: e.target.value })}
                    placeholder="Bears Passing Yards by Game"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000]"
                  />
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Size</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['small', 'medium', 'large', 'full'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateConfig({ size })}
                        className={`rounded-lg border px-3 py-2 text-sm capitalize transition-all ${
                          config.size === size
                            ? 'border-[#8B0000] bg-[#8B0000]/10 text-white'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        {size === 'full' ? 'Full Width' : size}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'data' && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-300">Data Points</label>
                {config.data.map((entry, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={entry.label}
                      onChange={(e) => {
                        const newData = [...config.data]
                        newData[index] = { ...newData[index], label: e.target.value }
                        handleDataChange(newData)
                      }}
                      placeholder="Label"
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-[#8B0000] focus:outline-none"
                    />
                    <input
                      type="number"
                      value={entry.value}
                      onChange={(e) => {
                        const newData = [...config.data]
                        newData[index] = { ...newData[index], value: Number(e.target.value) }
                        handleDataChange(newData)
                      }}
                      placeholder="Value"
                      className="w-24 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-[#8B0000] focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const newData = config.data.filter((_, i) => i !== index)
                        handleDataChange(newData)
                      }}
                      className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => handleDataChange([...config.data, { label: '', value: 0 }])}
                  className="w-full rounded-lg border border-dashed border-zinc-700 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
                >
                  + Add Data Point
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 bg-zinc-950 p-6 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Preview</h3>
            </div>
            <div className="rounded-lg bg-zinc-900 p-4">
              <h4 className="text-lg font-semibold text-white mb-4">{config.title || 'Untitled Chart'}</h4>
              <div className="text-zinc-400 text-sm">
                {config.data.length} data points
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            className="rounded-lg bg-gradient-to-r from-[#FF0000] to-[#8B0000] px-6 py-2 text-sm font-medium text-white hover:from-[#FF0000] hover:to-[#a00000] transition-all shadow-lg"
          >
            {isEditing ? 'Save Changes' : 'Insert Chart'}
          </button>
        </div>
      </div>
    </div>
  )
}
