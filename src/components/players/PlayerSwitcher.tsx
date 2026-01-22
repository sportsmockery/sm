'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Player {
  slug: string
  fullName: string
  jerseyNumber: string | number | null
  position: string
  headshotUrl: string | null
}

interface PlayerSwitcherProps {
  players: Player[]
  currentSlug: string
  teamPath: string // e.g., '/chicago-bears/players'
}

export default function PlayerSwitcher({ players, currentSlug, teamPath }: PlayerSwitcherProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  // Sort players by jersey number
  const sortedPlayers = [...players].sort((a, b) => {
    const numA = typeof a.jerseyNumber === 'number' ? a.jerseyNumber : parseInt(String(a.jerseyNumber)) || 999
    const numB = typeof b.jerseyNumber === 'number' ? b.jerseyNumber : parseInt(String(b.jerseyNumber)) || 999
    return numA - numB
  })

  const currentPlayer = players.find(p => p.slug === currentSlug)

  const handleSelect = (slug: string) => {
    setIsOpen(false)
    router.push(`${teamPath}/${slug}`)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
        Switch Player
        <span className="text-white/60">
          ({sortedPlayers.length} players)
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl z-50">
            <div className="p-2">
              <div className="text-xs text-zinc-500 uppercase tracking-wider px-3 py-2">
                Select Player
              </div>
              {sortedPlayers.map(player => (
                <button
                  key={player.slug}
                  onClick={() => handleSelect(player.slug)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                    player.slug === currentSlug
                      ? 'bg-[#C83200]/20 text-white'
                      : 'hover:bg-white/5 text-zinc-300'
                  }`}
                >
                  {player.headshotUrl ? (
                    <img
                      src={player.headshotUrl}
                      alt={player.fullName}
                      className="w-8 h-8 rounded-full object-cover bg-zinc-800"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                      {player.jerseyNumber ?? '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{player.fullName}</div>
                    <div className="text-xs text-zinc-500">
                      #{player.jerseyNumber ?? '?'} · {player.position}
                    </div>
                  </div>
                  {player.slug === currentSlug && (
                    <svg className="w-4 h-4 text-[#C83200]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
