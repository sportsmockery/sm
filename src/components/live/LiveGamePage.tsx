'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLiveGameData } from './hooks/useLiveGameData'
import { useGameState } from './hooks/useGameState'
import ScoreHeader from './ScoreHeader'
import GameInfo from './GameInfo'
import GameSwitcher from './GameSwitcher'
import Linescore from './Linescore'
import SituationIndicator from './SituationIndicator'
import WinProbabilityBar from './WinProbabilityBar'
import PlayByPlay from './PlayByPlay'
import TeamStatsComparison from './TeamStatsComparison'
import PreGameView from './PreGameView'
import PostGameView from './PostGameView'
import NBABoxScore from './boxscore/NBABoxScore'
import NFLBoxScore from './boxscore/NFLBoxScore'
import NHLBoxScore from './boxscore/NHLBoxScore'
import MLBBoxScore from './boxscore/MLBBoxScore'

interface LiveGamePageProps {
  sport: string
  gameId: string
}

export default function LiveGamePage({ sport, gameId }: LiveGamePageProps) {
  const { game, isLoading, error } = useLiveGameData(gameId)
  const gameState = useGameState(game)
  const [activeTab, setActiveTab] = useState<'plays' | 'boxscore' | 'stats'>('plays')

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sm-bg)' }}>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sm-bg)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--sm-text)' }}>
            {error || 'Game not found'}
          </h1>
          <p className="mb-4" style={{ color: 'var(--sm-text-muted)' }}>
            This game may have ended or is not available.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#bc0000', color: '#ffffff' }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const renderBoxScore = () => {
    switch (sport) {
      case 'nba':
        return <NBABoxScore homeTeam={game.home_team} awayTeam={game.away_team} players={game.players} />
      case 'nfl':
        return <NFLBoxScore homeTeam={game.home_team} awayTeam={game.away_team} players={game.players} />
      case 'nhl':
        return <NHLBoxScore homeTeam={game.home_team} awayTeam={game.away_team} players={game.players} />
      case 'mlb':
        return <MLBBoxScore homeTeam={game.home_team} awayTeam={game.away_team} players={game.players} />
      default:
        return <div style={{ color: 'var(--sm-text-muted)' }}>Box score not available</div>
    }
  }

  const tabs = ['plays', 'boxscore', 'stats'] as const
  const tabLabels = { plays: 'Play-by-Play', boxscore: 'Box Score', stats: 'Team Stats' }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-bg)' }}>
      {/* Game Switcher */}
      <GameSwitcher currentGameId={gameId} />

      {/* Score Header (always shown) */}
      <ScoreHeader game={game} />

      {/* Game Info bar inside header */}
      <div className="sticky top-[130px] sm:top-[140px] z-40 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-[1200px] mx-auto px-4">
          <GameInfo game={game} />
        </div>
      </div>

      {/* Pre-game state */}
      {gameState === 'pre_game' && <PreGameView game={game} />}

      {/* Post-game extras */}
      {gameState === 'post_game' && <PostGameView game={game} />}

      {/* Live-specific: linescore + situation + win probability */}
      {gameState === 'live' && (
        <>
          <Linescore game={game} />
          <SituationIndicator game={game} />
          <WinProbabilityBar game={game} />
        </>
      )}

      {/* Content tabs (shown for live and post-game) */}
      {gameState !== 'pre_game' && (
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          {/* Tab bar */}
          <div className="flex gap-2 mb-4 overflow-x-auto snap-x snap-mandatory" style={{ borderBottom: '1px solid var(--sm-border)' }}>
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap snap-start ${
                  activeTab === tab
                    ? 'border-[#bc0000]'
                    : 'border-transparent'
                }`}
                style={{
                  color: activeTab === tab ? '#bc0000' : 'var(--sm-text-muted)',
                }}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'plays' && <PlayByPlay plays={game.play_by_play} />}
          {activeTab === 'boxscore' && renderBoxScore()}
          {activeTab === 'stats' && <TeamStatsComparison game={game} />}
        </div>
      )}

      {/* Cache age indicator */}
      <div className="fixed bottom-2 right-2 text-xs px-2 py-1 rounded shadow" style={{ color: 'var(--sm-text-muted)', backgroundColor: 'var(--sm-card)' }}>
        {game.cache_age_seconds > 30 && (
          <span className="text-amber-500 mr-1">&#9888;</span>
        )}
        Updated {game.cache_age_seconds}s ago
      </div>
    </div>
  )
}
