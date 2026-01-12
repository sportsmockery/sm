'use client'

import { useState, useCallback } from 'react'
import { ChartType } from './ChartTypeSelector'
import { ChartDataEntry } from './DataEntryForm'

export interface DataLabQuery {
  team: string
  dataType: 'player' | 'team' | 'game' | 'standings'
  statCategory: string
  timePeriod: 'single-game' | 'season' | 'last-5' | 'custom'
  season: number
  selectedStats: string[]
  player?: string
  game?: string
}

interface DataLabPickerProps {
  onLoad: (query: DataLabQuery, data: ChartDataEntry[]) => void
  chartType: ChartType
}

const teams = [
  { id: 'bears', name: 'Chicago Bears', sport: 'nfl' },
  { id: 'bulls', name: 'Chicago Bulls', sport: 'nba' },
  { id: 'cubs', name: 'Chicago Cubs', sport: 'mlb' },
  { id: 'whitesox', name: 'Chicago White Sox', sport: 'mlb' },
  { id: 'blackhawks', name: 'Chicago Blackhawks', sport: 'nhl' },
]

const statCategories: Record<string, string[]> = {
  nfl: ['Passing', 'Rushing', 'Receiving', 'Defense', 'Special Teams'],
  nba: ['Scoring', 'Rebounds', 'Assists', 'Defense', 'Efficiency'],
  mlb: ['Batting', 'Pitching', 'Fielding', 'Base Running'],
  nhl: ['Goals', 'Assists', 'Saves', 'Plus/Minus', 'Penalties'],
}

const statOptions: Record<string, string[]> = {
  Passing: ['Passing Yards', 'Passing TDs', 'Interceptions', 'Completion %', 'Passer Rating', 'Yards/Attempt'],
  Rushing: ['Rushing Yards', 'Rushing TDs', 'Carries', 'Yards/Carry', 'Fumbles'],
  Receiving: ['Receptions', 'Receiving Yards', 'Receiving TDs', 'Targets', 'Yards/Reception'],
  Defense: ['Tackles', 'Sacks', 'Interceptions', 'Forced Fumbles', 'Pass Deflections'],
  'Special Teams': ['Field Goals', 'Punts', 'Kickoff Returns', 'Punt Returns'],
  Scoring: ['Points', 'Field Goals', '3-Pointers', 'Free Throws', 'Points in Paint'],
  Rebounds: ['Total Rebounds', 'Offensive Rebounds', 'Defensive Rebounds'],
  Assists: ['Assists', 'Turnovers', 'Assist/TO Ratio'],
  Batting: ['Batting Average', 'Home Runs', 'RBIs', 'Hits', 'OPS'],
  Pitching: ['ERA', 'Strikeouts', 'WHIP', 'Wins', 'Saves'],
  Goals: ['Goals', 'Power Play Goals', 'Game-Winning Goals'],
}

// Mock data generator (in production, this would call the actual API)
const generateMockData = (query: DataLabQuery): ChartDataEntry[] => {
  const weeks = query.timePeriod === 'last-5' ? 5 : query.timePeriod === 'season' ? 17 : 1

  if (query.timePeriod === 'single-game') {
    return query.selectedStats.map((stat) => ({
      label: stat,
      value: Math.floor(Math.random() * 300),
    }))
  }

  return Array.from({ length: weeks }, (_, i) => ({
    label: `Week ${i + 1}`,
    value: Math.floor(Math.random() * 300) + 50,
  }))
}

export default function DataLabPicker({ onLoad, chartType }: DataLabPickerProps) {
  const [query, setQuery] = useState<DataLabQuery>({
    team: 'bears',
    dataType: 'team',
    statCategory: 'Passing',
    timePeriod: 'season',
    season: 2024,
    selectedStats: [],
  })
  const [loading, setLoading] = useState(false)

  const selectedTeam = teams.find((t) => t.id === query.team)
  const availableCategories = selectedTeam ? statCategories[selectedTeam.sport] || [] : []
  const availableStats = statOptions[query.statCategory] || []

  const toggleStat = useCallback((stat: string) => {
    setQuery((prev) => ({
      ...prev,
      selectedStats: prev.selectedStats.includes(stat)
        ? prev.selectedStats.filter((s) => s !== stat)
        : [...prev.selectedStats, stat],
    }))
  }, [])

  const handleLoad = async () => {
    if (query.selectedStats.length === 0) {
      alert('Please select at least one stat')
      return
    }

    setLoading(true)
    try {
      // In production, this would call the actual Data Lab API
      // const response = await fetch('https://datalab.sportsmockery.com/api/stats', { ... })
      await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API call
      const data = generateMockData(query)
      onLoad(query, data)
    } catch (error) {
      console.error('Failed to load data:', error)
      alert('Failed to load data from Data Lab')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
        <span>Pull from SM Data Lab</span>
      </div>

      {/* Team Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">Team</label>
        <select
          value={query.team}
          onChange={(e) => setQuery({ ...query, team: e.target.value, statCategory: '' })}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-[#8B0000] focus:outline-none"
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Data Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">Data Type</label>
        <div className="grid grid-cols-2 gap-2">
          {(['player', 'team', 'game', 'standings'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setQuery({ ...query, dataType: type })}
              className={`rounded-lg border px-3 py-2 text-sm capitalize transition-all ${
                query.dataType === type
                  ? 'border-[#8B0000] bg-[#8B0000]/10 text-white'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {type === 'standings' ? 'Season Standings' : `${type} Stats`}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Category */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">Stat Category</label>
        <select
          value={query.statCategory}
          onChange={(e) => setQuery({ ...query, statCategory: e.target.value, selectedStats: [] })}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-[#8B0000] focus:outline-none"
        >
          <option value="">Select category...</option>
          {availableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Time Period */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-300">Time Period</label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 'single-game', label: 'Single Game' },
            { value: 'season', label: `Season ${query.season}` },
            { value: 'last-5', label: 'Last 5 Games' },
            { value: 'custom', label: 'Custom Range' },
          ] as const).map((period) => (
            <button
              key={period.value}
              onClick={() => setQuery({ ...query, timePeriod: period.value })}
              className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                query.timePeriod === period.value
                  ? 'border-[#8B0000] bg-[#8B0000]/10 text-white'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Available Stats */}
      {query.statCategory && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">Available Stats</label>
          <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border border-zinc-700 bg-zinc-800/50 p-2">
            {availableStats.map((stat) => (
              <label
                key={stat}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={query.selectedStats.includes(stat)}
                  onChange={() => toggleStat(stat)}
                  className="rounded border-zinc-600 bg-zinc-700 text-[#8B0000] focus:ring-[#8B0000] focus:ring-offset-0"
                />
                <span className="text-sm text-zinc-300">{stat}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-zinc-500">
            {query.selectedStats.length} stats selected
          </p>
        </div>
      )}

      {/* Load Button */}
      <button
        onClick={handleLoad}
        disabled={loading || !query.statCategory || query.selectedStats.length === 0}
        className="w-full rounded-lg bg-gradient-to-r from-[#FF0000] to-[#8B0000] px-4 py-2.5 text-sm font-medium text-white hover:from-[#FF0000] hover:to-[#a00000] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Load Data
          </>
        )}
      </button>
    </div>
  )
}
