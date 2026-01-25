'use client'

import { useState, useCallback, useEffect } from 'react'
import ChartTypeSelector, { ChartType } from './ChartTypeSelector'
import ChartColorPicker, { ColorConfig } from './ChartColorPicker'
import DataEntryForm, { ChartDataEntry } from './DataEntryForm'
import DataLabPicker, { DataLabQuery } from './DataLabPicker'
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

interface ChartBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (config: ChartConfig) => void
  initialConfig?: Partial<ChartConfig>
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

export default function ChartBuilderModal({ isOpen, onClose, onInsert, initialConfig }: ChartBuilderModalProps) {
  const [config, setConfig] = useState<ChartConfig>(defaultConfig)
  const [activeTab, setActiveTab] = useState<'design' | 'data'>('design')

  // Apply initial config when provided (e.g., from AI analysis)
  useEffect(() => {
    if (initialConfig && isOpen) {
      setConfig({
        ...defaultConfig,
        ...initialConfig,
      })
      // Switch to data tab if we have AI-suggested data
      if (initialConfig.data && initialConfig.data.length > 0) {
        setActiveTab('data')
      }
    }
  }, [initialConfig, isOpen])

  const updateConfig = useCallback((updates: Partial<ChartConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleDataChange = useCallback((data: ChartDataEntry[]) => {
    updateConfig({ data })
  }, [updateConfig])

  const handleDataLabLoad = useCallback((query: DataLabQuery, data: ChartDataEntry[]) => {
    updateConfig({ dataLabQuery: query, data, dataSource: 'datalab' })
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
    onClose()
  }

  const handleClose = () => {
    setConfig(defaultConfig)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <h2 className="text-xl font-bold text-white">Create Chart</h2>
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
                <ChartTypeSelector
                  selected={config.type}
                  onSelect={(type) => updateConfig({ type })}
                />

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
                    {(['small', 'medium', 'large', 'full'] as ChartSize[]).map((size) => (
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

                {/* Colors */}
                <ChartColorPicker
                  config={config.colors}
                  onChange={(colors) => updateConfig({ colors })}
                />
              </>
            )}

            {activeTab === 'data' && (
              <>
                {/* Data Source */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">Data Source</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: 'manual', label: 'Enter Manually' },
                      { value: 'datalab', label: 'Data Lab' },
                      { value: 'csv', label: 'Upload CSV' },
                    ] as const).map((source) => (
                      <button
                        key={source.value}
                        onClick={() => updateConfig({ dataSource: source.value })}
                        className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                          config.dataSource === source.value
                            ? 'border-[#8B0000] bg-[#8B0000]/10 text-white'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        {source.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data Entry */}
                {config.dataSource === 'manual' && (
                  <DataEntryForm
                    data={config.data}
                    onChange={handleDataChange}
                    chartType={config.type}
                  />
                )}

                {config.dataSource === 'datalab' && (
                  <DataLabPicker
                    onLoad={handleDataLabLoad}
                    chartType={config.type}
                  />
                )}

                {config.dataSource === 'csv' && (
                  <div className="rounded-lg border-2 border-dashed border-zinc-700 p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-4 text-sm text-zinc-400">
                      Drag and drop a CSV file, or click to browse
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      File should have &quot;label&quot; and &quot;value&quot; columns
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        // CSV parsing would go here
                        console.log(e.target.files)
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/2 bg-zinc-950 p-6 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Preview</h3>
            </div>
            <ChartPreview config={config} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4">
          <button
            onClick={handleClose}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            className="rounded-lg bg-gradient-to-r from-[#FF0000] to-[#8B0000] px-6 py-2 text-sm font-medium text-white hover:from-[#FF0000] hover:to-[#a00000] transition-all shadow-lg"
          >
            Insert Chart
          </button>
        </div>
      </div>
    </div>
  )
}
