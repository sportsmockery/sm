'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { ScenarioTabs, ScenarioType, ScenarioParameters } from './ScenarioTabs'
import { SimulationChart } from './SimulationChart'

interface ScenarioResult {
  scenario_type: ScenarioType
  description: string
  original_grade: number
  adjusted_grade: number
  grade_delta: number
  reasoning: string
  breakdown_changes?: {
    talent_balance_delta: number
    contract_value_delta: number
    team_fit_delta: number
    future_assets_delta: number
  }
}

interface WhatIfPanelProps {
  tradeId: string
  originalGrade: number
  playersSent: Array<{ name: string; position: string }>
  playersReceived: Array<{ name: string; position: string }>
  sport: string
  show: boolean
  onClose: () => void
}

export function WhatIfPanel({
  tradeId,
  originalGrade,
  playersSent,
  playersReceived,
  sport,
  show,
  onClose,
}: WhatIfPanelProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScenarioResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<ScenarioResult[]>([])
  const [activeMode, setActiveMode] = useState<'scenarios' | 'simulate'>('scenarios')

  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'

  async function handleRunScenario(type: ScenarioType, params: ScenarioParameters) {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/gm/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_id: tradeId,
          original_grade: originalGrade,
          scenario_type: type,
          parameters: params,
        }),
      })

      if (!res.ok) throw new Error('Failed to analyze scenario')

      const data = await res.json()
      setResult(data)
      setHistory(prev => [data, ...prev].slice(0, 5))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to analyze scenario')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  const gradeColor = (grade: number) =>
    grade >= 70 ? '#22c55e' : grade >= 50 ? '#eab308' : '#ef4444'

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        marginTop: 20,
        padding: 20,
        borderRadius: 12,
        backgroundColor: 'var(--sm-surface)',
        border: '1px solid var(--sm-border)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: textColor, margin: 0 }}>
            What-If Analysis
          </h3>
          <p style={{ fontSize: '12px', color: subText, margin: '4px 0 0' }}>
            Explore scenarios and run simulations
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            color: subText,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          ×
        </button>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setActiveMode('scenarios')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: activeMode === 'scenarios' ? '#bc0000' : ('var(--sm-border)'),
            color: activeMode === 'scenarios' ? '#fff' : subText,
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Scenarios
        </button>
        <button
          onClick={() => setActiveMode('simulate')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: activeMode === 'simulate' ? '#3b82f6' : ('var(--sm-border)'),
            color: activeMode === 'simulate' ? '#fff' : subText,
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Monte Carlo
        </button>
      </div>

      {/* Scenario tabs */}
      {activeMode === 'scenarios' && (
        <ScenarioTabs
          playersSent={playersSent}
          playersReceived={playersReceived}
          onRunScenario={handleRunScenario}
          loading={loading}
          sport={sport}
        />
      )}

      {/* Monte Carlo Simulation */}
      {activeMode === 'simulate' && (
        <SimulationChart
          tradeId={tradeId}
          originalGrade={originalGrade}
          show={true}
          onClose={() => setActiveMode('scenarios')}
        />
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 8,
          backgroundColor: '#ef444420',
          color: '#ef4444',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 10,
              backgroundColor: 'var(--sm-card)',
              border: '1px solid var(--sm-border)',
            }}
          >
            {/* Grade comparison */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: subText, marginBottom: 4 }}>Original</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: gradeColor(result.original_grade) }}>
                  {result.original_grade}
                </div>
              </div>
              <div style={{ fontSize: '24px', color: subText }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: subText, marginBottom: 4 }}>Adjusted</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: gradeColor(result.adjusted_grade) }}>
                  {result.adjusted_grade}
                </div>
              </div>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                backgroundColor: result.grade_delta >= 0 ? '#22c55e20' : '#ef444420',
                color: result.grade_delta >= 0 ? '#22c55e' : '#ef4444',
                fontSize: '18px',
                fontWeight: 800,
              }}>
                {result.grade_delta >= 0 ? '+' : ''}{result.grade_delta}
              </div>
            </div>

            {/* Description */}
            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 600,
              color: textColor,
              marginBottom: 12,
            }}>
              {result.description}
            </div>

            {/* Reasoning */}
            <div style={{
              fontSize: '13px',
              color: subText,
              lineHeight: 1.6,
              textAlign: 'center',
            }}>
              {result.reasoning}
            </div>

            {/* Breakdown changes */}
            {result.breakdown_changes && (
              <div style={{
                marginTop: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
              }}>
                {[
                  { label: 'Talent', value: result.breakdown_changes.talent_balance_delta },
                  { label: 'Contract', value: result.breakdown_changes.contract_value_delta },
                  { label: 'Fit', value: result.breakdown_changes.team_fit_delta },
                  { label: 'Future', value: result.breakdown_changes.future_assets_delta },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: item.value >= 0 ? '#22c55e' : '#ef4444',
                    }}>
                      {item.value >= 0 ? '+' : ''}{item.value.toFixed(1)}
                    </div>
                    <div style={{ fontSize: '10px', color: subText }}>{item.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: subText, marginBottom: 8 }}>
            Recent Scenarios
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {history.slice(1).map((h, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 8,
                  backgroundColor: 'var(--sm-card)',
                  border: '1px solid var(--sm-border)',
                }}
              >
                <span style={{ fontSize: '12px', color: textColor }}>{h.description}</span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: h.grade_delta >= 0 ? '#22c55e' : '#ef4444',
                }}>
                  {h.grade_delta >= 0 ? '+' : ''}{h.grade_delta}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
