'use client'

export type ChartType = 'bar' | 'line' | 'pie' | 'player-comparison' | 'team-stats'

interface ChartTypeOption {
  type: ChartType
  label: string
  description: string
  icon: React.ReactNode
}

const chartTypes: ChartTypeOption[] = [
  {
    type: 'bar',
    label: 'Bar Chart',
    description: 'Compare values (player stats, team rankings)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="6" width="4" height="15" rx="1" />
        <rect x="17" y="9" width="4" height="12" rx="1" />
      </svg>
    ),
  },
  {
    type: 'line',
    label: 'Line Chart',
    description: 'Show trends over time (season progress, ratings)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3,17 8,11 13,14 21,6" />
        <circle cx="3" cy="17" r="2" fill="currentColor" />
        <circle cx="8" cy="11" r="2" fill="currentColor" />
        <circle cx="13" cy="14" r="2" fill="currentColor" />
        <circle cx="21" cy="6" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    type: 'pie',
    label: 'Pie Chart',
    description: 'Show percentages (play distribution, snap counts)',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8v8l6.93 4.01C17.21 17.91 14.76 20 12 20z" />
      </svg>
    ),
  },
  {
    type: 'player-comparison',
    label: 'Player Comparison',
    description: 'Side-by-side player stats comparison',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="7" cy="7" r="4" />
        <circle cx="17" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 014-4h2" />
        <path d="M15 15h2a4 4 0 014 4v2" />
        <line x1="12" y1="11" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    type: 'team-stats',
    label: 'Team Stats',
    description: 'Team performance visualization',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L19 8l-7 3.5L5 8l7-3.5zM4 9.5l7 3.5v6.5l-7-3.5V9.5zm16 6.5l-7 3.5V13l7-3.5v6.5z" />
      </svg>
    ),
  },
]

interface ChartTypeSelectorProps {
  selected: ChartType
  onSelect: (type: ChartType) => void
}

export default function ChartTypeSelector({ selected, onSelect }: ChartTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-300">Chart Type</label>
      <div className="grid grid-cols-1 gap-2">
        {chartTypes.map((chart) => (
          <button
            key={chart.type}
            onClick={() => onSelect(chart.type)}
            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
              selected === chart.type
                ? 'border-[#8B0000] bg-[#8B0000]/10 text-white'
                : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
            }`}
          >
            <div className={`${selected === chart.type ? 'text-[#FF0000]' : 'text-zinc-500'}`}>
              {chart.icon}
            </div>
            <div>
              <div className="font-medium">{chart.label}</div>
              <div className="text-xs text-zinc-500">{chart.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
