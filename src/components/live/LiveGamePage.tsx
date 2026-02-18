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
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sm-grid-overlay" />
        <div style={{ width: 32, height: 32, border: '3px solid var(--sm-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-2030 1s linear infinite' }} />
      </div>
    )
  }

  // Error state
  if (error || !game) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sm-grid-overlay" />
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'var(--sm-font-heading)', fontSize: 24, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 8 }}>
            {error || 'Game not found'}
          </h1>
          <p style={{ color: 'var(--sm-text-muted)', marginBottom: 24 }}>
            This game may have ended or is not available.
          </p>
          <Link href="/" className="btn btn-primary btn-md">
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
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />
      {/* Game Switcher */}
      <GameSwitcher currentGameId={gameId} />

      {/* Score Header (always shown) */}
      <ScoreHeader game={game} />

      {/* Game Info bar inside header */}
      <div className="sticky top-[130px] sm:top-[140px] z-40" style={{ background: 'var(--sm-surface)', borderBottom: '1px solid var(--sm-border)', backdropFilter: 'blur(12px)' }}>
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
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 16px', position: 'relative', zIndex: 1 }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', borderBottom: '1px solid var(--sm-border)' }}>
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  borderBottom: activeTab === tab ? '3px solid var(--sm-red)' : '3px solid transparent',
                  color: activeTab === tab ? 'var(--sm-red)' : 'var(--sm-text-muted)',
                  background: 'transparent',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s',
                  cursor: 'pointer',
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
      <div style={{ position: 'fixed', bottom: 8, right: 8, fontSize: 12, padding: '4px 8px', borderRadius: 'var(--sm-radius-sm)', color: 'var(--sm-text-muted)', backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)', zIndex: 50 }}>
        {game.cache_age_seconds > 30 && (
          <span style={{ color: 'var(--sm-warning)', marginRight: 4 }}>&#9888;</span>
        )}
        Updated {game.cache_age_seconds}s ago
      </div>
    </div>
  )
}
