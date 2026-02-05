'use client'

import { useState, useCallback, useEffect } from 'react'
import ChartTypeSelector, { ChartType } from './ChartTypeSelector'
import ChartColorPicker, { ColorConfig, teamColors, TeamColorScheme } from './ChartColorPicker'
import DataEntryForm, { ChartDataEntry } from './DataEntryForm'
import { DataLabQuery } from './DataLabPicker'
import ChartPreview from './ChartPreview'

export type ChartSize = 'small' | 'medium' | 'large' | 'full'
export type DataSource = 'manual' | 'datalab' | 'csv'

export interface ChartConfig {
  type: ChartType
  title: string
  size: ChartSize
  colors: ColorConfig
  data: ChartDataEntry[]
  dataSource: DataSource
  dataLabQuery?: DataLabQuery
}

export interface AISuggestion {
  reasoning: string
  chartTitle: string
  chartType: ChartType
  data: ChartDataEntry[]
  paragraphIndex: number
}

interface ChartBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (config: ChartConfig) => void
  onHighlightData?: () => void
  initialConfig?: Partial<ChartConfig>
  aiSuggestion?: AISuggestion | null
  isLoading?: boolean
  team?: string
}

const defaultConfig: ChartConfig = {
  type: 'bar',
  title: '',
  size: 'medium',
  colors: { scheme: 'team', team: 'bears' },
  data: [
    { label: '', value: 0 },
    { label: '', value: 0 },
  ],
  dataSource: 'manual',
}

export default function ChartBuilderModal({
  isOpen,
  onClose,
  onInsert,
  onHighlightData,
  initialConfig,
  aiSuggestion,
  isLoading = false,
  team = 'bears'
}: ChartBuilderModalProps) {
  const [config, setConfig] = useState<ChartConfig>(defaultConfig)
  const [showDataEditor, setShowDataEditor] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Apply initial config when provided
  useEffect(() => {
    if (initialConfig && isOpen) {
      setConfig({
        ...defaultConfig,
        ...initialConfig,
      })
    }
  }, [initialConfig, isOpen])

  const updateConfig = useCallback((updates: Partial<ChartConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleDataChange = useCallback((data: ChartDataEntry[]) => {
    updateConfig({ data })
  }, [updateConfig])

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
    setConfig(defaultConfig)
    setShowDataEditor(false)
    setShowAdvanced(false)
    onClose()
  }

  const handleClose = () => {
    setConfig(defaultConfig)
    setShowDataEditor(false)
    setShowAdvanced(false)
    onClose()
  }

  const handleHighlightData = () => {
    handleClose()
    onHighlightData?.()
  }

  // Check if we have valid chart data
  const hasValidData = config.data.length >= 2 && config.data.every(d => d.label && d.value !== undefined)

  if (!isOpen) return null

  // Loading state - AI is analyzing
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Chart Builder Loading">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-md rounded-2xl bg-zinc-900 p-8 text-center shadow-2xl">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-[#8B0000] border-t-transparent" />
          <h3 className="mt-6 text-xl font-bold text-white">PostIQ is analyzing your article...</h3>
          <p className="mt-2 text-zinc-400">Finding chartable data in your content</p>
        </div>
      </div>
    )
  }

  // No data found state
  if (!hasValidData && !showDataEditor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="No Chart Data Found">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
        <div className="relative z-10 w-full max-w-lg rounded-2xl bg-zinc-900 p-8 shadow-2xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
              <svg className="h-8 w-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-xl font-bold text-white">No chartable data found</h3>
            <p className="mt-2 text-zinc-400">
              PostIQ couldn&apos;t find statistics or numbers to visualize in your article.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {onHighlightData && (
              <button
                onClick={handleHighlightData}
                className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-medium text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Highlight data in article
              </button>
            )}
            <button
              onClick={() => setShowDataEditor(true)}
              className="w-full rounded-lg border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Create chart manually
            </button>
            <button
              onClick={handleClose}
              className="w-full rounded-lg px-4 py-3 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Main chart view - PostIQ created a chart
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="PostIQ Chart Builder">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-700">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">PostIQ Chart</h2>
              <p className="text-sm text-zinc-400">AI-generated from your article</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* AI Reasoning Banner */}
        {aiSuggestion?.reasoning && (
          <div className="border-b border-zinc-800 bg-purple-500/10 px-6 py-3">
            <p className="text-sm text-purple-300">
              <span className="font-semibold">PostIQ:</span> {aiSuggestion.reasoning}
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row h-[calc(90vh-200px)] overflow-hidden">
          {/* Chart Preview - Primary Focus */}
          <div className="flex-1 bg-zinc-950 p-6 overflow-y-auto">
            {/* Chart Title Input */}
            <div className="mb-4">
              <input
                type="text"
                value={config.title}
                onChange={(e) => updateConfig({ title: e.target.value })}
                placeholder="Chart title..."
                className="w-full bg-transparent text-xl font-bold text-white placeholder:text-zinc-600 border-none focus:outline-none focus:ring-0"
              />
            </div>

            {/* Large Chart Preview */}
            <div className="rounded-xl bg-zinc-900 p-4">
              <ChartPreview config={config} />
            </div>
          </div>

          {/* Right Panel - Quick Controls */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-800 p-4 overflow-y-auto space-y-4">
            {/* Chart Type - Quick Pills */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Chart Type</label>
              <div className="flex flex-wrap gap-2">
                {(['bar', 'line', 'pie'] as ChartType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateConfig({ type })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      config.type === type
                        ? 'bg-[#8B0000] text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {type === 'bar' && '📊'} {type === 'line' && '📈'} {type === 'pie' && '🥧'} {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Team Colors - Quick Pills */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Team Colors</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(teamColors) as TeamColorScheme[]).map((teamKey) => (
                  <button
                    key={teamKey}
                    onClick={() => updateConfig({ colors: { scheme: 'team', team: teamKey } })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      config.colors.scheme === 'team' && config.colors.team === teamKey
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900'
                        : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: teamColors[teamKey].primary,
                      color: '#fff'
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: teamColors[teamKey].secondary }}
                    />
                    {teamKey.charAt(0).toUpperCase() + teamKey.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Size</label>
              <div className="grid grid-cols-4 gap-1">
                {(['small', 'medium', 'large', 'full'] as ChartSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateConfig({ size })}
                    className={`rounded-lg border px-2 py-1.5 text-xs capitalize transition-all ${
                      config.size === size
                        ? 'border-[#8B0000] bg-[#8B0000]/20 text-white'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {size === 'full' ? 'Full' : size.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-800 pt-4">
              {/* Edit Data Toggle */}
              <button
                onClick={() => setShowDataEditor(!showDataEditor)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Data
                </span>
                <svg className={`h-4 w-4 transition-transform ${showDataEditor ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Data Editor */}
              {showDataEditor && (
                <div className="mt-3 rounded-lg bg-zinc-800/50 p-3">
                  <DataEntryForm
                    data={config.data}
                    onChange={handleDataChange}
                    chartType={config.type}
                  />
                </div>
              )}
            </div>

            {/* Wrong Data Section */}
            {onHighlightData && (
              <div className="border-t border-zinc-800 pt-4">
                <p className="text-xs text-zinc-500 mb-2">Not the right data?</p>
                <button
                  onClick={handleHighlightData}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-purple-500/50 text-sm text-purple-400 hover:bg-purple-500/10 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Highlight data in article
                </button>
              </div>
            )}

            {/* Advanced Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              {showAdvanced ? 'Hide' : 'Show'} advanced options
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-2">
                <ChartTypeSelector
                  selected={config.type}
                  onSelect={(type) => updateConfig({ type })}
                />
                <ChartColorPicker
                  config={config.colors}
                  onChange={(colors) => updateConfig({ colors })}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-4">
          <button
            onClick={handleClose}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!hasValidData || !config.title.trim()}
            className="rounded-lg bg-gradient-to-r from-[#FF0000] to-[#8B0000] px-6 py-2 text-sm font-medium text-white hover:from-[#FF0000] hover:to-[#a00000] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert Chart
          </button>
        </div>
      </div>
    </div>
  )
}
