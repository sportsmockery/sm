'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export type ScenarioType =
  | 'player_improvement'
  | 'player_decline'
  | 'injury_impact'
  | 'add_pick'
  | 'remove_player'
  | 'age_progression'

export interface ScenarioParameters {
  improvement_pct?: number
  player_name?: string
  injured_player?: string
  injury_severity?: 'minor' | 'major' | 'season_ending'
  pick_year?: number
  pick_round?: number
  pick_side?: 'sent' | 'received'
  removed_player?: string
  removed_side?: 'sent' | 'received'
  years_forward?: number
}

interface ScenarioTabsProps {
  playersSent: Array<{ name: string }>
  playersReceived: Array<{ name: string }>
  onRunScenario: (type: ScenarioType, params: ScenarioParameters) => void
  loading: boolean
  sport: string
}

const SCENARIO_CONFIGS = [
  { type: 'player_improvement' as const, label: 'Player Improves', emoji: '📈', color: '#22c55e' },
  { type: 'player_decline' as const, label: 'Player Declines', emoji: '📉', color: '#ef4444' },
  { type: 'injury_impact' as const, label: 'Injury Risk', emoji: '🏥', color: '#f97316' },
  { type: 'add_pick' as const, label: 'Add Pick', emoji: '📄', color: '#3b82f6' },
  { type: 'remove_player' as const, label: 'Remove Player', emoji: '❌', color: '#8b5cf6' },
  { type: 'age_progression' as const, label: 'Time Forward', emoji: '⏳', color: '#6b7280' },
]

export function ScenarioTabs({ playersSent, playersReceived, onRunScenario, loading, sport }: ScenarioTabsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<ScenarioType>('player_improvement')
  const [params, setParams] = useState<ScenarioParameters>({
    improvement_pct: 15,
    injury_severity: 'minor',
    pick_year: new Date().getFullYear() + 1,
    pick_round: 1,
    pick_side: 'received',
    removed_side: 'sent',
    years_forward: 1,
  })

  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'
  const inputBg = isDark ? '#374151' : '#fff'
  const inputBorder = isDark ? '#4b5563' : '#d1d5db'

  const allPlayers = [
    ...playersSent.map(p => ({ name: p.name, side: 'sent' as const })),
    ...playersReceived.map(p => ({ name: p.name, side: 'received' as const })),
  ]

  const activeConfig = SCENARIO_CONFIGS.find(c => c.type === activeTab)

  function handleRun() {
    onRunScenario(activeTab, params)
  }

  // Get max rounds based on sport
  const maxRounds = sport === 'nfl' ? 7 : sport === 'nba' ? 2 : sport === 'nhl' ? 7 : 20

  return (
    <div>
      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, flexWrap: 'wrap' }}>
        {SCENARIO_CONFIGS.map(config => (
          <button
            key={config.type}
            onClick={() => setActiveTab(config.type)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: activeTab === config.type ? `${config.color}20` : (isDark ? '#374151' : '#f3f4f6'),
              color: activeTab === config.type ? config.color : subText,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>{config.emoji}</span>
            <span>{config.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: 16,
          borderRadius: 10,
          backgroundColor: 'var(--sm-surface)',
          border: '1px solid var(--sm-border)',
        }}
      >
        {/* Player Improvement */}
        {activeTab === 'player_improvement' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Select Player
              </label>
              <select
                value={params.player_name || ''}
                onChange={e => setParams(p => ({ ...p, player_name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: '13px',
                }}
              >
                <option value="">Choose a player...</option>
                {allPlayers.map((p, i) => (
                  <option key={i} value={p.name}>{p.name} ({p.side === 'sent' ? 'Sending' : 'Receiving'})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Improvement: +{params.improvement_pct}%
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={params.improvement_pct || 15}
                onChange={e => setParams(p => ({ ...p, improvement_pct: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#22c55e' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: subText }}>
                <span>+5%</span>
                <span>+50%</span>
              </div>
            </div>
          </div>
        )}

        {/* Player Decline */}
        {activeTab === 'player_decline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Select Player
              </label>
              <select
                value={params.player_name || ''}
                onChange={e => setParams(p => ({ ...p, player_name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: '13px',
                }}
              >
                <option value="">Choose a player...</option>
                {allPlayers.map((p, i) => (
                  <option key={i} value={p.name}>{p.name} ({p.side === 'sent' ? 'Sending' : 'Receiving'})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Decline: -{Math.abs(params.improvement_pct || 15)}%
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={Math.abs(params.improvement_pct || 15)}
                onChange={e => setParams(p => ({ ...p, improvement_pct: -Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: subText }}>
                <span>-5%</span>
                <span>-50%</span>
              </div>
            </div>
          </div>
        )}

        {/* Injury Impact */}
        {activeTab === 'injury_impact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Injured Player
              </label>
              <select
                value={params.injured_player || ''}
                onChange={e => setParams(p => ({ ...p, injured_player: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: '13px',
                }}
              >
                <option value="">Choose a player...</option>
                {allPlayers.map((p, i) => (
                  <option key={i} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Injury Severity
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['minor', 'major', 'season_ending'] as const).map(severity => (
                  <button
                    key={severity}
                    onClick={() => setParams(p => ({ ...p, injury_severity: severity }))}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: `2px solid ${params.injury_severity === severity ? '#f97316' : inputBorder}`,
                      backgroundColor: params.injury_severity === severity ? '#f9731615' : 'transparent',
                      color: params.injury_severity === severity ? '#f97316' : textColor,
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {severity.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Pick */}
        {activeTab === 'add_pick' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                  Year
                </label>
                <select
                  value={params.pick_year || new Date().getFullYear() + 1}
                  onChange={e => setParams(p => ({ ...p, pick_year: Number(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${inputBorder}`,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: '13px',
                  }}
                >
                  {[0, 1, 2, 3].map(i => (
                    <option key={i} value={new Date().getFullYear() + i}>{new Date().getFullYear() + i}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                  Round
                </label>
                <select
                  value={params.pick_round || 1}
                  onChange={e => setParams(p => ({ ...p, pick_round: Number(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1px solid ${inputBorder}`,
                    backgroundColor: inputBg,
                    color: textColor,
                    fontSize: '13px',
                  }}
                >
                  {Array.from({ length: maxRounds }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Round {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Add to Side
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['received', 'sent'] as const).map(side => (
                  <button
                    key={side}
                    onClick={() => setParams(p => ({ ...p, pick_side: side }))}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: `2px solid ${params.pick_side === side ? '#3b82f6' : inputBorder}`,
                      backgroundColor: params.pick_side === side ? '#3b82f615' : 'transparent',
                      color: params.pick_side === side ? '#3b82f6' : textColor,
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {side === 'received' ? 'Receive Pick' : 'Send Pick'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Remove Player */}
        {activeTab === 'remove_player' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
                Player to Remove
              </label>
              <select
                value={params.removed_player || ''}
                onChange={e => {
                  const player = allPlayers.find(p => p.name === e.target.value)
                  setParams(p => ({ ...p, removed_player: e.target.value, removed_side: player?.side || 'sent' }))
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${inputBorder}`,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: '13px',
                }}
              >
                <option value="">Choose a player...</option>
                {allPlayers.map((p, i) => (
                  <option key={i} value={p.name}>{p.name} ({p.side === 'sent' ? 'Sending' : 'Receiving'})</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Age Progression */}
        {activeTab === 'age_progression' && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: 6 }}>
              Years Forward
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map(years => (
                <button
                  key={years}
                  onClick={() => setParams(p => ({ ...p, years_forward: years }))}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: `2px solid ${params.years_forward === years ? '#6b7280' : inputBorder}`,
                    backgroundColor: params.years_forward === years ? '#6b728015' : 'transparent',
                    color: params.years_forward === years ? textColor : subText,
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {years} Year{years > 1 ? 's' : ''}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: subText, marginTop: 8 }}>
              See how this trade looks after players age and contracts evolve.
            </p>
          </div>
        )}

        {/* Run button */}
        <button
          onClick={handleRun}
          disabled={loading}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '12px 24px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: activeConfig?.color || '#bc0000',
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Analyzing...' : `Run ${activeConfig?.label || 'Scenario'}`}
        </button>
      </motion.div>
    </div>
  )
}
