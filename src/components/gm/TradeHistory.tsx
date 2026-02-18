'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { ExportModal } from './ExportModal'

interface Trade {
  id: string
  chicago_team: string
  trade_partner: string
  players_sent: { name: string; position: string }[]
  players_received: { name: string; position: string }[]
  grade: number
  grade_reasoning: string
  status: string
  is_dangerous: boolean
  trade_summary?: string
  improvement_score?: number
  talent_balance?: number
  contract_value?: number
  team_fit?: number
  future_assets?: number
  chicago_team_logo?: string
  partner_team_logo?: string
  shared_code?: string
  created_at: string
}

interface TradeHistoryProps {
  trades: Trade[]
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TradeHistory({ trades, page, totalPages, onPageChange }: TradeHistoryProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)

  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'
  const cardBg = isDark ? '#1f2937' : '#fff'
  const borderColor = 'var(--sm-border)'

  if (trades.length === 0) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: textColor, margin: 0 }}>Trade History</h2>
        <button
          onClick={() => setShowExportModal(true)}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: `1px solid ${borderColor}`,
            backgroundColor: 'transparent',
            color: subText,
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>📤</span>
          Export All
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnimatePresence>
          {trades.map(t => {
            const isExpanded = expandedId === t.id
            const gradeColor = t.grade >= 70 ? '#22c55e' : t.grade >= 50 ? '#eab308' : '#ef4444'

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: cardBg,
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedId(isExpanded ? null : t.id)}
              >
                {/* Collapsed header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
                  {/* Team logos */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    {t.chicago_team_logo && (
                      <img src={t.chicago_team_logo} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                    <span style={{ fontSize: '11px', color: subText }}>&#x2194;</span>
                    {t.partner_team_logo && (
                      <img src={t.partner_team_logo} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                  </div>

                  {/* Players summary */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.players_sent.map(p => p.name).join(', ')} &#x2194; {t.players_received.map(p => p.name).join(', ')}
                    </div>
                    <div style={{ fontSize: '11px', color: subText }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Grade + status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <span style={{
                      width: 36, height: 36, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: `${gradeColor}20`, color: gradeColor,
                      fontWeight: 800, fontSize: '14px',
                    }}>
                      {t.grade}
                    </span>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      backgroundColor: t.status === 'accepted' ? '#22c55e15' : '#ef444415',
                      color: t.status === 'accepted' ? '#22c55e' : '#ef4444',
                      textTransform: 'uppercase',
                    }}>
                      {t.status}
                    </span>
                    {t.is_dangerous && (
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                        backgroundColor: '#eab30815', color: '#eab308',
                      }}>
                        !
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden', borderTop: `1px solid ${borderColor}` }}
                    >
                      <div style={{ padding: 16 }}>
                        {/* Reasoning */}
                        <div style={{ fontSize: '13px', color: textColor, lineHeight: 1.6, marginBottom: 12 }}>
                          {t.grade_reasoning}
                        </div>

                        {/* Breakdown scores */}
                        {t.talent_balance != null && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                            {[
                              { label: 'Talent', value: t.talent_balance },
                              { label: 'Contract', value: t.contract_value },
                              { label: 'Fit', value: t.team_fit },
                              { label: 'Future', value: t.future_assets },
                            ].map(b => (
                              <div key={b.label} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: gradeColor }}>
                                  {b.value != null ? Math.round(b.value * 100) : '-'}
                                </div>
                                <div style={{ fontSize: '10px', color: subText }}>{b.label}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Share */}
                        {t.shared_code && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              navigator.clipboard.writeText(`${window.location.origin}/gm/share/${t.shared_code}`)
                            }}
                            style={{
                              fontSize: '12px', color: '#3b82f6', background: 'none',
                              border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0,
                            }}
                          >
                            Copy share link
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: `1px solid ${borderColor}`,
              backgroundColor: 'transparent', color: textColor, cursor: page > 1 ? 'pointer' : 'not-allowed',
              fontSize: '12px', fontWeight: 600, opacity: page <= 1 ? 0.5 : 1,
            }}
          >
            Prev
          </button>
          <span style={{ padding: '6px 8px', fontSize: '12px', color: subText }}>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            style={{
              padding: '6px 14px', borderRadius: 8, border: `1px solid ${borderColor}`,
              backgroundColor: 'transparent', color: textColor, cursor: page < totalPages ? 'pointer' : 'not-allowed',
              fontSize: '12px', fontWeight: 600, opacity: page >= totalPages ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        tradeIds={trades.map(t => t.id)}
      />
    </div>
  )
}
