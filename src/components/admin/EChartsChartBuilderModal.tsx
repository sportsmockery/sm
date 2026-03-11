'use client'

import { useState, useRef, useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { EChartsOption } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { useTheme } from '@/contexts/ThemeContext'

type ChartBuilderTab = 'data' | 'visualize' | 'preview'

interface TemplateOption {
  id: string
  name: string
  options: EChartsOption
}

interface ChartBuilderModalProps {
  onSave: (embedCode: string) => void
  onClose: () => void
}

const BRAND_COLORS = ['#bc0000', '#111827', '#6b7280', '#f59e0b', '#00D4FF', '#00D4FF', '#ec4899']

const EMPTY_OPTIONS: EChartsOption = {
  title: { text: '' },
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: [] },
  yAxis: { type: 'value' },
  series: [],
}

export default function ChartBuilderModal({ onSave, onClose }: ChartBuilderModalProps) {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<ChartBuilderTab>('data')
  const [options, setOptions] = useState<EChartsOption>({
    ...EMPTY_OPTIONS,
    backgroundColor: theme === 'dark' ? '#050509' : '#FAFAFB',
  })
  const chartRef: MutableRefObject<any> = useRef(null)

  const [labelsInput, setLabelsInput] = useState('')
  const [valuesInput, setValuesInput] = useState('')
  const [rawInput, setRawInput] = useState('')
  const [rawMode, setRawMode] = useState<'csv' | 'json'>('csv')
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radar'>('bar')
  const [colorIndex, setColorIndex] = useState(0)
  const [templates, setTemplates] = useState<TemplateOption[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

  // Sync background color with site theme
  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      backgroundColor: theme === 'dark' ? '#050509' : '#FAFAFB',
    }))
  }, [theme])

  // Fetch templates once when modal mounts
  useEffect(() => {
    let cancelled = false
    async function loadTemplates() {
      setIsLoadingTemplates(true)
      try {
        const res = await fetch('/api/templates')
        if (!res.ok) throw new Error(`Failed to load templates: ${res.status}`)
        const data = await res.json()
        if (!cancelled && Array.isArray(data)) {
          setTemplates(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setIsLoadingTemplates(false)
      }
    }
    loadTemplates()
    return () => {
      cancelled = true
    }
  }, [])

  // Build series from structured labels/values inputs
  const applyStructuredData = () => {
    const labels = labelsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const values = valuesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((v) => Number(v))

    if (!labels.length || !values.length || labels.length !== values.length) {
      alert('Labels and values must be comma-separated lists with the same number of entries.')
      return
    }

    const baseType = chartType === 'area' ? 'line' : chartType

    const next: EChartsOption = {
      ...options,
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value' },
      series: [
        {
          type: baseType,
          ...(chartType === 'area' ? { areaStyle: {} } : {}),
          data: values,
          itemStyle: { color: BRAND_COLORS[colorIndex] },
        } as any,
      ],
    }
    setOptions(next)
    setActiveTab('visualize')
  }

  // Apply raw CSV or JSON data into options
  const applyRawData = () => {
    try {
      if (rawMode === 'json') {
        const parsed = JSON.parse(rawInput)
        if (Array.isArray(parsed)) {
          // Assume [{ label, value }]
          const labels = parsed.map((p) => p.label)
          const values = parsed.map((p) => p.value)
          const baseType = chartType === 'area' ? 'line' : chartType
          setOptions({
            ...options,
            xAxis: { type: 'category', data: labels },
            yAxis: { type: 'value' },
            series: [
              {
                type: baseType,
                areaStyle: chartType === 'area' ? {} : undefined,
                data: values,
                itemStyle: { color: BRAND_COLORS[colorIndex] },
              },
            ],
          })
        } else {
          // Assume full ECharts option
          setOptions(parsed)
        }
      } else {
        // CSV: label,value per line
        const rows = rawInput
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean)
        const labels: string[] = []
        const values: number[] = []
        for (const row of rows) {
          const [label, value] = row.split(',').map((s) => s.trim())
          if (!label || value === undefined) continue
          labels.push(label)
          values.push(Number(value))
        }
        if (!labels.length) {
          alert('No valid CSV rows found. Use "Label,Value" per line.')
          return
        }
        const baseType = chartType === 'area' ? 'line' : chartType
        setOptions({
          ...options,
          xAxis: { type: 'category', data: labels },
          yAxis: { type: 'value' },
          series: [
            {
              type: baseType,
              ...(chartType === 'area' ? { areaStyle: {} } : {}),
              data: values,
              itemStyle: { color: BRAND_COLORS[colorIndex] },
            } as any,
          ],
        })
      }
      setActiveTab('visualize')
    } catch (e) {
      alert('Failed to parse data. Please check your input.')
    }
  }

  // Update series type when chartType changes
  const handleChartTypeChange = (nextType: typeof chartType) => {
    setChartType(nextType)
    const baseType = nextType === 'area' ? 'line' : nextType
    setOptions((prev) => ({
      ...prev,
      series: (Array.isArray(prev.series) ? prev.series : []).map((s: any) => ({
        ...s,
        type: baseType,
        areaStyle: nextType === 'area' ? {} : undefined,
      })),
    }))
  }

  // Apply color selection to first series
  const handleColorChange = (idx: number) => {
    setColorIndex(idx)
    setOptions((prev) => ({
      ...prev,
      series: (Array.isArray(prev.series) ? prev.series : []).map((s: any, i: number) => ({
        ...s,
        itemStyle: {
          ...(s.itemStyle || {}),
          color: i === 0 ? BRAND_COLORS[idx] : (s.itemStyle && s.itemStyle.color) || BRAND_COLORS[idx],
        },
      })),
    }))
  }

  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId)
    const tmpl = templates.find((t) => t.id === templateId)
    if (tmpl) {
      setOptions({
        ...tmpl.options,
        backgroundColor: theme === 'dark' ? '#050509' : '#FAFAFB',
      })
      setActiveTab('visualize')
    }
  }

  const handlePreviewRefresh = () => {
    if (!chartRef.current) return
    try {
      const instance = chartRef.current.getEchartsInstance()
      instance.setOption(options, true)
    } catch (e) {
      console.error('Failed to refresh preview', e)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/charts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      })
      const data = await res.json()
      if (!res.ok || !data?.id) {
        throw new Error(data?.error || 'Failed to save chart')
      }
      onSave(`[chart:${data.id}]`)
      onClose()
    } catch (e) {
      console.error(e)
      alert('Failed to save chart. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const hasSeries = Array.isArray(options.series) && options.series.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-zinc-900 text-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold">Chart Builder</h2>
            <p className="text-xs text-zinc-400">Create a custom ECharts visualization</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            aria-label="Close chart builder"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Template selector */}
        <div className="flex items-center gap-3 border-b border-zinc-800 px-6 py-3">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Template</span>
          <select
            value={selectedTemplateId}
            onChange={(e) => handleApplyTemplate(e.target.value)}
            className="flex-1 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#bc0000]"
          >
            <option value="">{isLoadingTemplates ? 'Loading templates...' : 'Start from scratch or choose a template'}</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 px-6 pt-3 space-x-4 text-sm">
          <button
            className={`pb-3 border-b-2 ${
              activeTab === 'data' ? 'border-[#bc0000] text-white' : 'border-transparent text-zinc-400'
            }`}
            onClick={() => setActiveTab('data')}
          >
            Data Entry
          </button>
          <button
            className={`pb-3 border-b-2 ${
              activeTab === 'visualize' ? 'border-[#bc0000] text-white' : 'border-transparent text-zinc-400'
            }`}
            onClick={() => setActiveTab('visualize')}
          >
            Visualize
          </button>
          <button
            className={`pb-3 border-b-2 ${
              activeTab === 'preview' ? 'border-[#bc0000] text-white' : 'border-transparent text-zinc-400'
            }`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeTab === 'data' && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Structured entry */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Structured Fields</h3>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Labels (comma-separated)</label>
                  <input
                    type="text"
                    value={labelsInput}
                    onChange={(e) => setLabelsInput(e.target.value)}
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#bc0000]"
                    placeholder="Week 1, Week 2, Week 3"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Values (comma-separated)</label>
                  <input
                    type="text"
                    value={valuesInput}
                    onChange={(e) => setValuesInput(e.target.value)}
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#bc0000]"
                    placeholder="28, 35, 22"
                  />
                </div>
                <button
                  onClick={applyStructuredData}
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm"
                  style={{ backgroundColor: '#bc0000', color: '#FAFAFB' }}
                >
                  Apply Structured Data
                </button>
              </div>

              {/* Raw input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Paste Data</h3>
                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => setRawMode('csv')}
                      className={`px-2 py-1 rounded ${
                        rawMode === 'csv' ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => setRawMode('json')}
                      className={`px-2 py-1 rounded ${
                        rawMode === 'json' ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      JSON
                    </button>
                  </div>
                </div>
                <textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  className="w-full h-40 rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#bc0000]"
                  placeholder={
                    rawMode === 'csv'
                      ? 'Label 1,10\nLabel 2,20'
                      : '[\n  { "label": "Week 1", "value": 10 },\n  { "label": "Week 2", "value": 20 }\n]\n\nor full ECharts option JSON'
                  }
                />
                <button
                  onClick={applyRawData}
                  className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium shadow-sm"
                  style={{ backgroundColor: '#111827', color: '#FAFAFB' }}
                >
                  Apply Pasted Data
                </button>
              </div>
            </div>
          )}

          {activeTab === 'visualize' && (
            <div className="space-y-4">
              {/* Chart type selector */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Chart Type</h3>
                <div className="flex flex-wrap gap-2">
                  {(['bar', 'line', 'pie', 'scatter', 'area', 'radar'] as typeof chartType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleChartTypeChange(type)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                        chartType === type ? 'bg-zinc-100 text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                      }`}
                      style={chartType === type ? { backgroundColor: '#bc0000', color: '#FAFAFB' } : undefined}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Color / Theme</h3>
                <div className="flex flex-wrap gap-3">
                  {BRAND_COLORS.map((color, idx) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(idx)}
                      className="relative h-8 w-8 rounded-full border border-zinc-700 flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      {colorIndex === idx && (
                        <span className="block h-3 w-3 rounded-full border border-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Preview</h3>
                <button
                  onClick={handlePreviewRefresh}
                  className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm"
                  style={{ backgroundColor: '#111827', color: '#FAFAFB' }}
                >
                  Refresh Preview
                </button>
              </div>
              <div className="w-full rounded-xl bg-zinc-900 border border-zinc-800">
                <ReactECharts
                  ref={chartRef}
                  option={options}
                  style={{ height: '400px', width: '100%' }}
                  notMerge={false}
                  lazyUpdate={true}
                  theme={theme === 'dark' ? 'dark' : undefined}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasSeries}
            className="rounded-lg px-6 py-2 text-sm font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#bc0000', color: '#FAFAFB' }}
          >
            {isSaving ? 'Saving…' : 'Save & Insert'}
          </button>
        </div>
      </div>
    </div>
  )
}

