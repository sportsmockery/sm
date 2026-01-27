'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { GameData } from './hooks/useLiveGameData'
import { useScoreAnimation } from './hooks/useScoreAnimation'

interface ScoreHeaderProps {
  game: GameData
}

export default function ScoreHeader({ game }: ScoreHeaderProps) {
  const isLive = game.status === 'in_progress'
  const isFinal = game.status === 'final'
  const { homeAnimating, awayAnimating } = useScoreAnimation(game.home_team.score, game.away_team.score)

  const getPeriodDisplay = () => {
    if (!isLive) return isFinal ? 'FINAL' : game.status.toUpperCase()
    if (game.period_label && game.clock) return `${game.period_label} ${game.clock}`
    if (game.period_label) return game.period_label
    return 'LIVE'
  }

  return (
    <>
      <style jsx>{`
        @keyframes scoreFlash {
          0% { transform: scale(1); text-shadow: none; }
          25% { transform: scale(1.15); text-shadow: 0 0 20px rgba(250, 204, 21, 0.8); }
          50% { transform: scale(1.1); text-shadow: 0 0 15px rgba(74, 222, 128, 0.6); }
          100% { transform: scale(1); text-shadow: none; }
        }
        .score-flash {
          animation: scoreFlash 2s ease-out;
        }
      `}</style>
      <div className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Back link */}
          <div className="py-2 border-b border-white/10">
            <Link href="/" className="text-white/60 hover:text-white text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Score display */}
          <div className="py-4 flex items-center justify-between">
            {/* Away Team */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <Image
                src={game.away_team.logo_url}
                alt={game.away_team.name}
                width={40}
                height={40}
                className="object-contain sm:w-14 sm:h-14"
                unoptimized
              />
              <div>
                <div className="text-base sm:text-lg font-bold">{game.away_team.name}</div>
                <div className="text-white/60 text-xs sm:text-sm">{game.away_team.abbr}</div>
              </div>
            </div>

            {/* Score */}
            <div className="text-center px-4 sm:px-6">
              <div className="flex items-center gap-3 sm:gap-4 text-2xl sm:text-4xl font-bold">
                <span className={`transition-all ${game.away_team.score > game.home_team.score ? 'text-green-400' : ''} ${awayAnimating ? 'score-flash' : ''}`}>
                  {game.away_team.score}
                </span>
                <span className="text-white/30">-</span>
                <span className={`transition-all ${game.home_team.score > game.away_team.score ? 'text-green-400' : ''} ${homeAnimating ? 'score-flash' : ''}`}>
                  {game.home_team.score}
                </span>
              </div>
              <div className={`text-sm mt-1 ${isLive ? 'text-red-400' : 'text-white/60'}`}>
                {isLive && (
                  <span className="inline-flex items-center gap-1 mr-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
                    </span>
                  </span>
                )}
                {getPeriodDisplay()}
              </div>
            </div>

            {/* Home Team */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end text-right">
              <div>
                <div className="text-base sm:text-lg font-bold">{game.home_team.name}</div>
                <div className="text-white/60 text-xs sm:text-sm">{game.home_team.abbr}</div>
              </div>
              <Image
                src={game.home_team.logo_url}
                alt={game.home_team.name}
                width={40}
                height={40}
                className="object-contain sm:w-14 sm:h-14"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
