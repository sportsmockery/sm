'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLiveGamesList, type LiveGameSummary } from './hooks/useLiveGamesList'

interface GameSwitcherProps {
  currentGameId: string
}

export default function GameSwitcher({ currentGameId }: GameSwitcherProps) {
  const { games, isLoading } = useLiveGamesList()
  const router = useRouter()

  if (isLoading || games.length <= 1) return null

  const getStatusLabel = (game: LiveGameSummary): string => {
    if (game.status === 'in_progress') {
      if (game.period_label && game.clock) return `${game.period_label} ${game.clock}`
      if (game.period_label) return game.period_label
      return 'LIVE'
    }
    if (game.status === 'upcoming' && game.game_start_time) {
      const diff = new Date(game.game_start_time).getTime() - Date.now()
      if (diff <= 0) return 'Starting...'
      const mins = Math.ceil(diff / 60000)
      return `${mins}m`
    }
    return ''
  }

  return (
    <>
      <div className="bg-gray-950 border-b border-white/10 overflow-x-auto hide-scrollbar-gs">
        <div className="max-w-[1200px] mx-auto flex items-center gap-1 px-2 py-2">
          {games.map(game => {
            const isCurrent = game.game_id === currentGameId
            const isUpcoming = game.status === 'upcoming'

            return (
              <button
                key={game.game_id}
                onClick={() => router.push(`/live/${game.sport}/${game.game_id}`)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all flex-shrink-0 ${
                  isCurrent
                    ? 'bg-white/15 text-white'
                    : isUpcoming
                    ? 'bg-white/5 text-white/40 hover:bg-white/10'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
                style={isCurrent ? { borderBottom: '2px solid #bc0000' } : undefined}
              >
                {/* Logos */}
                <div className="flex items-center -space-x-1">
                  <Image src={game.away_logo_url} alt="" width={20} height={20} className="object-contain rounded-full" unoptimized />
                  <Image src={game.home_logo_url} alt="" width={20} height={20} className="object-contain rounded-full" unoptimized />
                </div>
                {/* Score / abbr */}
                <span className="hidden sm:inline font-medium">
                  {game.status === 'in_progress'
                    ? `${game.away_team_abbr} ${game.away_score}-${game.home_score} ${game.home_team_abbr}`
                    : `${game.away_team_abbr} vs ${game.home_team_abbr}`
                  }
                </span>
                <span className="sm:hidden font-medium">
                  {game.status === 'in_progress'
                    ? `${game.away_score}-${game.home_score}`
                    : 'vs'
                  }
                </span>
                {/* Status */}
                <span className={`text-[10px] ${game.status === 'in_progress' ? 'text-red-400' : 'text-white/40'}`}>
                  {getStatusLabel(game)}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <style jsx>{`
        .hide-scrollbar-gs::-webkit-scrollbar { display: none; }
        .hide-scrollbar-gs { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  )
}
