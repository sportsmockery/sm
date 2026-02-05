'use client'
import { motion } from 'framer-motion'
import type {
  HistoricalContext,
  SimilarTrade,
  LegacyHistoricalTradeRef,
  EnhancedSuggestedTrade,
  LegacySuggestedTrade,
  HistoricalPrecedent,
  isEnhancedHistoricalContext,
  isEnhancedSuggestedTrade,
} from '@/types/gm'

// =====================
// Similar Trades Display
// =====================

interface SimilarTradeCardProps {
  trade: SimilarTrade
  isDark: boolean
  index: number
}

function SimilarTradeCard({ trade, isDark, index }: SimilarTradeCardProps) {
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  const outcomeColors = {
    worked: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e', label: 'Worked' },
    failed: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: 'Failed' },
    neutral: { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308', label: 'Mixed Results' },
  }

  const outcome = outcomeColors[trade.outcome] || outcomeColors.neutral

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        padding: 14,
        borderRadius: 10,
        backgroundColor: isDark ? '#1f2937' : '#fff',
        border: `1px solid ${borderColor}`,
        marginBottom: 10,
      }}
    >
      {/* Header row with similarity score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: textColor, lineHeight: 1.4 }}>
            {trade.description}
          </div>
          <div style={{ fontSize: 11, color: subText, marginTop: 4 }}>
            {trade.date} {trade.teams.length > 0 && `• ${trade.teams.join(' & ')}`}
          </div>
        </div>
        {trade.similarity_score > 0 && (
          <div style={{
            padding: '4px 10px',
            borderRadius: 6,
            backgroundColor: isDark ? '#374151' : '#f3f4f6',
            fontSize: 11,
            fontWeight: 600,
            color: subText,
            marginLeft: 10,
            whiteSpace: 'nowrap',
          }}>
            {trade.similarity_score}% match
          </div>
        )}
      </div>

      {/* Outcome badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          borderRadius: 6,
          backgroundColor: outcome.bg,
          fontSize: 11,
          fontWeight: 600,
          color: outcome.text,
        }}>
          {trade.outcome === 'worked' ? '✓' : trade.outcome === 'failed' ? '✗' : '~'}
          {outcome.label}
        </span>
        {trade.grade_given && (
          <span style={{ fontSize: 11, color: subText }}>
            Grade: {trade.grade_given}
          </span>
        )}
      </div>

      {/* Key difference */}
      {trade.key_difference && (
        <div style={{
          marginTop: 10,
          padding: '8px 10px',
          borderRadius: 6,
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          fontSize: 11,
          color: isDark ? '#93c5fd' : '#3b82f6',
          lineHeight: 1.4,
        }}>
          <strong>Key difference:</strong> {trade.key_difference}
        </div>
      )}
    </motion.div>
  )
}

// =====================
// Legacy Format Display (backwards compatible)
// =====================

interface LegacyHistoricalDisplayProps {
  comparisons: LegacyHistoricalTradeRef[]
  isDark: boolean
}

function LegacyHistoricalDisplay({ comparisons, isDark }: LegacyHistoricalDisplayProps) {
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  if (!comparisons || comparisons.length === 0) return null

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#1f2937' : '#f9fafb',
      border: `1px solid ${borderColor}`,
    }}>
      <h4 style={{
        fontSize: 12,
        fontWeight: 700,
        color: subText,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Similar Historical Trades
      </h4>
      {comparisons.map((comp, i) => (
        <div key={i} style={{
          marginBottom: i < comparisons.length - 1 ? 12 : 0,
          paddingBottom: i < comparisons.length - 1 ? 12 : 0,
          borderBottom: i < comparisons.length - 1 ? `1px solid ${borderColor}` : 'none',
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: textColor }}>
            {comp.trade} <span style={{ color: subText, fontWeight: 400 }}>({comp.year})</span>
          </div>
          <div style={{ fontSize: 12, color: subText, marginTop: 2 }}>
            Haul: {comp.haul}
          </div>
          <div style={{ fontSize: 12, color: '#22c55e', marginTop: 2 }}>
            {comp.outcome}
          </div>
        </div>
      ))}
    </div>
  )
}

// =====================
// Enhanced Historical Context Panel
// =====================

interface EnhancedHistoricalContextPanelProps {
  context: HistoricalContext
  isDark: boolean
  isRejected?: boolean
}

function EnhancedHistoricalContextPanel({ context, isDark, isRejected = false }: EnhancedHistoricalContextPanelProps) {
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  const successColor = context.success_rate >= 60 ? '#22c55e' : context.success_rate >= 40 ? '#eab308' : '#ef4444'

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#1f2937' : '#f9fafb',
      border: `1px solid ${borderColor}`,
    }}>
      {/* Header with success rate */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{
          fontSize: 12,
          fontWeight: 700,
          color: subText,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 16 }}>📊</span>
          Historical Analysis
        </h4>
        {context.success_rate !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            backgroundColor: isDark ? '#111827' : '#fff',
            border: `1px solid ${borderColor}`,
          }}>
            <span style={{ fontSize: 11, color: subText }}>Success Rate:</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: successColor }}>
              {context.success_rate}%
            </span>
          </div>
        )}
      </div>

      {/* Key Patterns */}
      {context.key_patterns && context.key_patterns.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
            Key Patterns from History
          </div>
          <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
            {context.key_patterns.map((pattern, i) => (
              <li key={i} style={{ fontSize: 12, color: textColor, marginBottom: 4, lineHeight: 1.5 }}>
                {pattern}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Why This Fails Historically (for rejected trades) */}
      {isRejected && context.why_this_fails_historically && (
        <div style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 10,
          backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#ef4444',
            marginBottom: 6,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span>⚠️</span>
            Why This Fails Historically
          </div>
          <div style={{ fontSize: 13, color: textColor, lineHeight: 1.5 }}>
            {context.why_this_fails_historically}
          </div>
        </div>
      )}

      {/* What Works Instead (for rejected trades) */}
      {isRejected && context.what_works_instead && (
        <div style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 10,
          backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
        }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#22c55e',
            marginBottom: 6,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <span>✓</span>
            What Works Instead
          </div>
          <div style={{ fontSize: 13, color: textColor, lineHeight: 1.5 }}>
            {context.what_works_instead}
          </div>
        </div>
      )}

      {/* Similar Trades */}
      {context.similar_trades && context.similar_trades.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: subText, marginBottom: 10, textTransform: 'uppercase' }}>
            Similar Historical Trades
          </div>
          {context.similar_trades.map((trade, i) => (
            <SimilarTradeCard key={trade.trade_id || i} trade={trade} isDark={isDark} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

// =====================
// Enhanced Suggested Trade Panel
// =====================

interface EnhancedSuggestedTradePanelProps {
  suggestion: EnhancedSuggestedTrade
  isDark: boolean
  chicagoTeam?: string
  opponentTeam?: string
}

function EnhancedSuggestedTradePanel({
  suggestion,
  isDark,
  chicagoTeam = 'Chicago',
  opponentTeam = 'Partner',
}: EnhancedSuggestedTradePanelProps) {
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  const formatTradeItem = (item: { type: string; name?: string; year?: number; round?: number; amount?: number; position?: string }) => {
    if (item.type === 'player') return `${item.name}${item.position ? ` (${item.position})` : ''}`
    if (item.type === 'pick') return `${item.year} Round ${item.round} Pick`
    if (item.type === 'prospect') return `${item.name} (Prospect)`
    if (item.type === 'cash') return `$${((item.amount || 0) / 1000000).toFixed(1)}M Cash`
    return item.name || 'Unknown'
  }

  const likelihoodColors: Record<string, { bg: string; text: string }> = {
    'very likely': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
    'likely': { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
    'possible': { bg: 'rgba(234, 179, 8, 0.15)', text: '#eab308' },
    'unlikely': { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
    'very unlikely': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
  }

  const likelihood = likelihoodColors[suggestion.likelihood?.toLowerCase()] || likelihoodColors['possible']

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
      border: '1px solid #3b82f6',
    }}>
      <h4 style={{
        fontWeight: 700,
        color: '#3b82f6',
        fontSize: 14,
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>💡</span>
        Suggested Trade Improvement
      </h4>

      {/* Description */}
      <p style={{ fontSize: 13, color: textColor, marginBottom: 16, lineHeight: 1.5 }}>
        {suggestion.description}
      </p>

      {/* Trade Structure */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: 12,
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        backgroundColor: isDark ? '#1f2937' : '#fff',
        border: `1px solid ${borderColor}`,
      }}>
        {/* Chicago Sends */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
            {chicagoTeam} Sends
          </div>
          {suggestion.chicago_sends.map((item, i) => (
            <div key={i} style={{ fontSize: 12, color: textColor, marginBottom: 4 }}>
              • {formatTradeItem(item)}
            </div>
          ))}
        </div>

        {/* Arrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20, color: subText }}>⇄</span>
        </div>

        {/* Chicago Receives */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
            {chicagoTeam} Receives
          </div>
          {suggestion.chicago_receives.map((item, i) => (
            <div key={i} style={{ fontSize: 12, color: textColor, marginBottom: 4 }}>
              • {formatTradeItem(item)}
            </div>
          ))}
        </div>
      </div>

      {/* Value Balance */}
      {suggestion.value_balance && (
        <div style={{
          marginBottom: 16,
          padding: 10,
          borderRadius: 8,
          backgroundColor: isDark ? '#111827' : '#f3f4f6',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
            <span style={{ color: subText }}>Value Balance</span>
            <span style={{
              fontWeight: 600,
              color: Math.abs(suggestion.value_balance.difference) < 10 ? '#22c55e' : '#eab308',
            }}>
              {suggestion.value_balance.difference > 0 ? '+' : ''}{suggestion.value_balance.difference} pts
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4, height: 8, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              flex: suggestion.value_balance.chicago_value,
              backgroundColor: '#3b82f6',
              borderRadius: '4px 0 0 4px',
            }} />
            <div style={{
              flex: suggestion.value_balance.partner_value,
              backgroundColor: '#22c55e',
              borderRadius: '0 4px 4px 0',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginTop: 4 }}>
            <span style={{ color: '#3b82f6' }}>{chicagoTeam}: {suggestion.value_balance.chicago_value}</span>
            <span style={{ color: '#22c55e' }}>{opponentTeam}: {suggestion.value_balance.partner_value}</span>
          </div>
        </div>
      )}

      {/* Cap/Salary Notes */}
      {suggestion.cap_salary_notes && (
        <div style={{
          marginBottom: 16,
          padding: 10,
          borderRadius: 8,
          backgroundColor: isDark ? '#1e293b' : '#f0fdf4',
          fontSize: 12,
          color: textColor,
          lineHeight: 1.5,
        }}>
          <span style={{ color: subText, fontWeight: 600 }}>💰 Cap Impact: </span>
          {suggestion.cap_salary_notes}
        </div>
      )}

      {/* Why This Works */}
      <div style={{
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', marginBottom: 6 }}>
          Why This Works
        </div>
        <div style={{ fontSize: 13, color: textColor, lineHeight: 1.5 }}>
          {suggestion.why_this_works}
        </div>
      </div>

      {/* Historical Precedent */}
      {suggestion.historical_precedent && (
        <div style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 8,
          backgroundColor: isDark ? '#1f2937' : '#fff',
          border: `1px solid ${borderColor}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
            📚 Historical Precedent
          </div>
          {suggestion.historical_precedent.example_trades.map((ex, i) => (
            <div key={i} style={{ fontSize: 12, color: textColor, marginBottom: 4 }}>
              • {ex}
            </div>
          ))}
          <div style={{
            marginTop: 10,
            padding: '8px 10px',
            borderRadius: 6,
            backgroundColor: isDark ? '#111827' : '#f3f4f6',
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div>
              <span style={{ color: subText }}>Structure Success Rate: </span>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>
                {suggestion.historical_precedent.success_rate_for_structure}%
              </span>
            </div>
          </div>
          {suggestion.historical_precedent.realistic_because && (
            <div style={{ fontSize: 11, color: subText, marginTop: 8, fontStyle: 'italic' }}>
              {suggestion.historical_precedent.realistic_because}
            </div>
          )}
        </div>
      )}

      {/* Likelihood Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          padding: '6px 12px',
          borderRadius: 6,
          backgroundColor: likelihood.bg,
          fontSize: 12,
          fontWeight: 600,
          color: likelihood.text,
        }}>
          Likelihood: {suggestion.likelihood}
        </span>
        {suggestion.estimated_grade_improvement && (
          <span style={{
            fontSize: 13,
            padding: '6px 12px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderRadius: 6,
          }}>
            <span style={{ color: subText }}>Est. improvement: </span>
            <span style={{ color: '#22c55e', fontWeight: 700 }}>
              +{suggestion.estimated_grade_improvement} pts
            </span>
          </span>
        )}
      </div>
    </div>
  )
}

// =====================
// Legacy Suggested Trade Panel (backwards compatible)
// =====================

interface LegacySuggestedTradePanelProps {
  suggestion: LegacySuggestedTrade
  isDark: boolean
}

function LegacySuggestedTradePanel({ suggestion, isDark }: LegacySuggestedTradePanelProps) {
  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  const typeLabels: Record<string, string> = {
    add_picks: 'Add Draft Picks',
    add_players: 'Add Players',
    remove_players: 'Remove Players',
    restructure: 'Restructure Deal',
    three_team: 'Three-Team Trade',
  }

  const typeIcons: Record<string, string> = {
    add_picks: '🎯',
    add_players: '👤',
    remove_players: '➖',
    restructure: '🔄',
    three_team: '🔀',
  }

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
      border: '1px solid #3b82f6',
    }}>
      <h4 style={{
        fontWeight: 700,
        color: '#3b82f6',
        fontSize: 14,
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 16 }}>{typeIcons[suggestion.type] || '💡'}</span>
        How to Improve This Trade
      </h4>

      <div style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 6,
        backgroundColor: isDark ? '#374151' : '#e5e7eb',
        fontSize: 11,
        fontWeight: 600,
        color: subText,
        marginBottom: 12,
      }}>
        {typeLabels[suggestion.type] || suggestion.type}
      </div>

      <p style={{ fontSize: 13, color: textColor, marginBottom: 12, lineHeight: 1.5 }}>
        {suggestion.summary}
      </p>

      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: subText, marginBottom: 6, fontWeight: 600 }}>Suggestions:</p>
        <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
          {suggestion.specific_suggestions.map((s, i) => (
            <li key={i} style={{ fontSize: 12, color: textColor, marginBottom: 4 }}>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {suggestion.historical_precedent && (
        <p style={{
          fontSize: 11,
          color: subText,
          fontStyle: 'italic',
          marginBottom: 12,
          padding: '8px 10px',
          backgroundColor: isDark ? '#1f2937' : '#fff',
          borderRadius: 6,
        }}>
          📚 {suggestion.historical_precedent}
        </p>
      )}

      <div style={{
        fontSize: 13,
        padding: '8px 12px',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 6,
        display: 'inline-block',
      }}>
        <span style={{ color: subText }}>Estimated improvement: </span>
        <span style={{ color: '#22c55e', fontWeight: 700 }}>
          +{suggestion.estimated_grade_improvement} points
        </span>
      </div>
    </div>
  )
}

// =====================
// Main Exported Component - Handles Both Formats
// =====================

export interface HistoricalContextPanelProps {
  // New enhanced format
  historicalContext?: HistoricalContext | null
  // Legacy format for backwards compatibility
  historicalComparisons?: LegacyHistoricalTradeRef[] | null
  isDark: boolean
  isRejected?: boolean
}

export function HistoricalContextPanel({
  historicalContext,
  historicalComparisons,
  isDark,
  isRejected = false,
}: HistoricalContextPanelProps) {
  // Prefer new enhanced format if available
  if (historicalContext && typeof historicalContext === 'object' && 'similar_trades' in historicalContext) {
    return (
      <EnhancedHistoricalContextPanel
        context={historicalContext}
        isDark={isDark}
        isRejected={isRejected}
      />
    )
  }

  // Fall back to legacy format
  if (historicalComparisons && Array.isArray(historicalComparisons) && historicalComparisons.length > 0) {
    return <LegacyHistoricalDisplay comparisons={historicalComparisons} isDark={isDark} />
  }

  return null
}

// =====================
// Suggested Trade Unified Component
// =====================

export interface SuggestedTradePanelProps {
  // New enhanced format
  enhancedSuggestion?: EnhancedSuggestedTrade | null
  // Legacy format for backwards compatibility
  legacySuggestion?: LegacySuggestedTrade | null
  isDark: boolean
  chicagoTeam?: string
  opponentTeam?: string
}

export function SuggestedTradePanel({
  enhancedSuggestion,
  legacySuggestion,
  isDark,
  chicagoTeam,
  opponentTeam,
}: SuggestedTradePanelProps) {
  // Prefer new enhanced format if available
  if (enhancedSuggestion && 'chicago_sends' in enhancedSuggestion) {
    return (
      <EnhancedSuggestedTradePanel
        suggestion={enhancedSuggestion}
        isDark={isDark}
        chicagoTeam={chicagoTeam}
        opponentTeam={opponentTeam}
      />
    )
  }

  // Fall back to legacy format
  if (legacySuggestion && 'type' in legacySuggestion) {
    return <LegacySuggestedTradePanel suggestion={legacySuggestion} isDark={isDark} />
  }

  return null
}

export {
  EnhancedHistoricalContextPanel,
  EnhancedSuggestedTradePanel,
  LegacyHistoricalDisplay,
  LegacySuggestedTradePanel,
  SimilarTradeCard,
}
