'use client'

import { useState } from 'react'

export type TeamColorScheme = 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks' | 'custom'

export interface ColorConfig {
  scheme: 'team' | 'custom'
  team?: TeamColorScheme
  customColors?: string[]
}

const teamColors: Record<string, { primary: string; secondary: string; name: string }> = {
  bears: { primary: '#C83200', secondary: '#0B162A', name: 'Chicago Bears' },
  bulls: { primary: '#CE1141', secondary: '#000000', name: 'Chicago Bulls' },
  cubs: { primary: '#0E3386', secondary: '#CC3433', name: 'Chicago Cubs' },
  whitesox: { primary: '#27251F', secondary: '#C4CED4', name: 'Chicago White Sox' },
  blackhawks: { primary: '#CF0A2C', secondary: '#000000', name: 'Chicago Blackhawks' },
}

const presetColors = [
  '#FF0000', '#8B0000', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
]

interface ChartColorPickerProps {
  config: ColorConfig
  onChange: (config: ColorConfig) => void
}

export default function ChartColorPicker({ config, onChange }: ChartColorPickerProps) {
  const [customColor, setCustomColor] = useState(config.customColors?.[0] || '#FF0000')

  const handleTeamSelect = (team: string) => {
    onChange({
      scheme: 'team',
      team: team as TeamColorScheme,
    })
  }

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color)
    onChange({
      scheme: 'custom',
      customColors: [color],
    })
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-300">Colors</label>

      {/* Scheme Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onChange({ ...config, scheme: 'team', team: config.team || 'bears' })}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
            config.scheme === 'team'
              ? 'border-[#8B0000] bg-[#8B0000]/10 text-white'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
          }`}
        >
          Team Colors (auto)
        </button>
        <button
          onClick={() => onChange({ ...config, scheme: 'custom', customColors: [customColor] })}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
            config.scheme === 'custom'
              ? 'border-[#8B0000] bg-[#8B0000]/10 text-white'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Team Colors */}
      {config.scheme === 'team' && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(teamColors).map(([key, team]) => (
            <button
              key={key}
              onClick={() => handleTeamSelect(key)}
              className={`flex items-center gap-2 rounded-lg border p-2 transition-all ${
                config.team === key
                  ? 'border-white bg-zinc-800'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <div className="flex gap-1">
                <div
                  className="h-4 w-4 rounded"
                  style={{ backgroundColor: team.primary }}
                />
                <div
                  className="h-4 w-4 rounded"
                  style={{ backgroundColor: team.secondary }}
                />
              </div>
              <span className="text-xs text-zinc-300">{team.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Custom Colors */}
      {config.scheme === 'custom' && (
        <div className="space-y-3">
          {/* Color Input */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              placeholder="#FF0000"
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#8B0000] focus:outline-none"
            />
          </div>

          {/* Preset Colors */}
          <div className="flex flex-wrap gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => handleCustomColorChange(color)}
                className={`h-8 w-8 rounded-lg border-2 transition-all ${
                  customColor === color ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
        <div className="text-xs text-zinc-500 mb-2">Preview:</div>
        <div className="flex gap-1 h-6">
          {config.scheme === 'team' && config.team ? (
            <>
              <div
                className="flex-1 rounded"
                style={{ backgroundColor: teamColors[config.team].primary }}
              />
              <div
                className="flex-1 rounded"
                style={{ backgroundColor: teamColors[config.team].secondary }}
              />
              <div
                className="flex-1 rounded opacity-70"
                style={{ backgroundColor: teamColors[config.team].primary }}
              />
            </>
          ) : (
            <>
              <div className="flex-1 rounded" style={{ backgroundColor: customColor }} />
              <div
                className="flex-1 rounded opacity-70"
                style={{ backgroundColor: customColor }}
              />
              <div
                className="flex-1 rounded opacity-40"
                style={{ backgroundColor: customColor }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export { teamColors }
