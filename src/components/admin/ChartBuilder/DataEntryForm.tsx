'use client'

import { useCallback } from 'react'
import { ChartType } from './ChartTypeSelector'

export interface ChartDataEntry {
  label: string
  value: number
  secondaryValue?: number // For comparison charts
  color?: string // Optional custom color per entry
}

interface DataEntryFormProps {
  data: ChartDataEntry[]
  onChange: (data: ChartDataEntry[]) => void
  chartType: ChartType
}

export default function DataEntryForm({ data, onChange, chartType }: DataEntryFormProps) {
  const showSecondaryValue = chartType === 'player-comparison' || chartType === 'line'

  const addRow = useCallback(() => {
    onChange([...data, { label: '', value: 0, secondaryValue: showSecondaryValue ? 0 : undefined }])
  }, [data, onChange, showSecondaryValue])

  const removeRow = useCallback((index: number) => {
    if (data.length <= 2) return // Minimum 2 rows
    onChange(data.filter((_, i) => i !== index))
  }, [data, onChange])

  const updateRow = useCallback((index: number, updates: Partial<ChartDataEntry>) => {
    onChange(data.map((entry, i) => (i === index ? { ...entry, ...updates } : entry)))
  }, [data, onChange])

  const getLabelPlaceholder = (index: number): string => {
    switch (chartType) {
      case 'bar':
      case 'line':
        return `Week ${index + 1}`
      case 'pie':
        return index === 0 ? 'Run Plays' : index === 1 ? 'Pass Plays' : `Category ${index + 1}`
      case 'player-comparison':
        return index === 0 ? 'Passing Yards' : index === 1 ? 'Touchdowns' : `Stat ${index + 1}`
      case 'team-stats':
        return index === 0 ? 'Offense' : index === 1 ? 'Defense' : `Category ${index + 1}`
      default:
        return `Item ${index + 1}`
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-zinc-300">Data Entry</label>
        <span className="text-xs text-zinc-500">{data.length} rows</span>
      </div>

      {/* Table Header */}
      <div className="grid gap-2" style={{ gridTemplateColumns: showSecondaryValue ? '1fr 80px 80px 40px' : '1fr 100px 40px' }}>
        <div className="text-xs font-medium text-zinc-500 px-2">Label</div>
        <div className="text-xs font-medium text-zinc-500 px-2">
          {chartType === 'player-comparison' ? 'Player 1' : 'Value'}
        </div>
        {showSecondaryValue && (
          <div className="text-xs font-medium text-zinc-500 px-2">Player 2</div>
        )}
        <div></div>
      </div>

      {/* Data Rows */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {data.map((entry, index) => (
          <div
            key={index}
            className="grid gap-2 items-center"
            style={{ gridTemplateColumns: showSecondaryValue ? '1fr 80px 80px 40px' : '1fr 100px 40px' }}
          >
            <input
              type="text"
              value={entry.label}
              onChange={(e) => updateRow(index, { label: e.target.value })}
              placeholder={getLabelPlaceholder(index)}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-[#8B0000] focus:outline-none"
            />
            <input
              type="number"
              value={entry.value || ''}
              onChange={(e) => updateRow(index, { value: parseFloat(e.target.value) || 0 })}
              placeholder="0"
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white text-center placeholder:text-zinc-600 focus:border-[#8B0000] focus:outline-none"
            />
            {showSecondaryValue && (
              <input
                type="number"
                value={entry.secondaryValue || ''}
                onChange={(e) => updateRow(index, { secondaryValue: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white text-center placeholder:text-zinc-600 focus:border-[#8B0000] focus:outline-none"
              />
            )}
            <button
              onClick={() => removeRow(index)}
              disabled={data.length <= 2}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Remove row"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Add Row Button */}
      <button
        onClick={addRow}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 py-2 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Row
      </button>

      {/* Quick Templates */}
      <div className="pt-4 border-t border-zinc-800">
        <div className="text-xs font-medium text-zinc-500 mb-2">Quick Fill</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChange([
              { label: 'Week 1', value: 0 },
              { label: 'Week 2', value: 0 },
              { label: 'Week 3', value: 0 },
              { label: 'Week 4', value: 0 },
            ])}
            className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
          >
            Weeks 1-4
          </button>
          <button
            onClick={() => onChange([
              { label: 'Q1', value: 0 },
              { label: 'Q2', value: 0 },
              { label: 'Q3', value: 0 },
              { label: 'Q4', value: 0 },
            ])}
            className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
          >
            Quarters
          </button>
          <button
            onClick={() => onChange([
              { label: 'Bears', value: 0 },
              { label: 'Packers', value: 0 },
              { label: 'Vikings', value: 0 },
              { label: 'Lions', value: 0 },
            ])}
            className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
          >
            NFC North
          </button>
          <button
            onClick={() => onChange([
              { label: 'Run', value: 0 },
              { label: 'Pass', value: 0 },
              { label: 'Screen', value: 0 },
            ])}
            className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
          >
            Play Types
          </button>
        </div>
      </div>
    </div>
  )
}
