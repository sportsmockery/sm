'use client'

import { useState, useEffect } from 'react'
import { TeamSlug, TEAM_INFO } from '@/lib/types'

interface FavoriteTeamsSelectorProps {
  initialTeams?: TeamSlug[]
  onChange?: (teams: TeamSlug[]) => void
  maxSelections?: number
  className?: string
}

/**
 * Multi-select favorite teams component
 * Bears is always first when selected (Bears-first design principle)
 */
export default function FavoriteTeamsSelector({
  initialTeams = ['bears'],
  onChange,
  maxSelections = 5,
  className = '',
}: FavoriteTeamsSelectorProps) {
  const [selectedTeams, setSelectedTeams] = useState<TeamSlug[]>(initialTeams)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const teams: TeamSlug[] = ['bears', 'cubs', 'white-sox', 'bulls', 'blackhawks']

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/user/preferences')
        if (response.ok) {
          const data = await response.json()
          if (data.preferences?.favoriteTeams) {
            setSelectedTeams(data.preferences.favoriteTeams)
          }
        }
      } catch (err) {
        // Silently fail - use default
        console.error('Failed to load preferences:', err)
      }
    }

    loadPreferences()
  }, [])

  const toggleTeam = (team: TeamSlug) => {
    let newTeams: TeamSlug[]

    if (selectedTeams.includes(team)) {
      // Don't allow removing all teams
      if (selectedTeams.length === 1) {
        return
      }
      newTeams = selectedTeams.filter(t => t !== team)
    } else {
      // Check max selections
      if (selectedTeams.length >= maxSelections) {
        setError(`You can select up to ${maxSelections} teams`)
        setTimeout(() => setError(null), 3000)
        return
      }
      newTeams = [...selectedTeams, team]
    }

    // Ensure Bears is first when selected
    if (newTeams.includes('bears')) {
      newTeams = ['bears', ...newTeams.filter(t => t !== 'bears')]
    }

    setSelectedTeams(newTeams)
    onChange?.(newTeams)
    setSaved(false)
  }

  const savePreferences = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          favoriteTeams: selectedTeams,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError('Failed to save. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`${className}`}>
      {/* Instructions */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Select your favorite Chicago teams. Content from your favorites will be prioritized in your feed.
        {selectedTeams.includes('bears') && (
          <span className="block mt-1 text-xs text-[#C83803]">
            Bears content is always shown first when selected.
          </span>
        )}
      </p>

      {/* Team grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {teams.map((team) => {
          const teamInfo = TEAM_INFO[team]
          const isSelected = selectedTeams.includes(team)
          const orderIndex = selectedTeams.indexOf(team)

          return (
            <button
              key={team}
              onClick={() => toggleTeam(team)}
              className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-opacity-100 bg-opacity-10'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              style={{
                borderColor: isSelected ? teamInfo.secondaryColor : undefined,
                backgroundColor: isSelected ? `${teamInfo.primaryColor}15` : undefined,
              }}
            >
              {/* Team color dot */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: teamInfo.primaryColor }}
              >
                {teamInfo.shortName.charAt(0)}
              </div>

              {/* Team name */}
              <div className="flex-1 text-left">
                <p className="font-semibold text-[#222] dark:text-white">
                  {teamInfo.name}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {teamInfo.sport}
                </p>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: teamInfo.secondaryColor }}
                >
                  {orderIndex === 0 ? '★' : orderIndex + 1}
                </div>
              )}

              {/* Check mark overlay */}
              {isSelected && (
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke={teamInfo.secondaryColor}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      {/* Selection summary */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {selectedTeams.length} of {maxSelections} teams selected
        </p>

        {/* Priority order */}
        {selectedTeams.length > 1 && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>Priority:</span>
            {selectedTeams.map((team, index) => (
              <span
                key={team}
                className="px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${TEAM_INFO[team].primaryColor}20`,
                  color: TEAM_INFO[team].primaryColor,
                }}
              >
                {index + 1}. {TEAM_INFO[team].shortName}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Save button */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={savePreferences}
          disabled={isLoading}
          className={`px-6 py-3 rounded-xl font-semibold text-white transition-all ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#bc0000] hover:bg-[#a00000] active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Save Favorites'
          )}
        </button>

        {/* Success message */}
        {saved && (
          <span className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Saved successfully!
          </span>
        )}
      </div>
    </div>
  )
}
