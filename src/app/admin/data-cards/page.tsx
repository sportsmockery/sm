'use client'

import { useState, useEffect, useCallback } from 'react'
import { datalabClient } from '@/lib/supabase-datalab'

interface StatCard {
  id: string
  created_at: string
  player_name: string
  headline: string
  card_type: string
  svg_content: string
  viral_score: number | null
  status: string
  template_id: string | null
  metadata: Record<string, unknown> | null
}

interface CardTemplate {
  id: string
  name: string
  card_type: string
  times_used: number
  avg_viral_score: number | null
  status: string
}

type Tab = 'library' | 'generate' | 'templates'
type StatusFilter = 'all' | 'draft' | 'review' | 'approved' | 'published' | 'archived'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#6b728015', text: '#6b7280' },
  review: { bg: '#f59e0b15', text: '#f59e0b' },
  approved: { bg: '#3b82f615', text: '#3b82f6' },
  published: { bg: '#22c55e15', text: '#22c55e' },
  archived: { bg: '#9ca3af15', text: '#9ca3af' },
}

const CARD_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  stat_comparison: { bg: '#8b5cf615', text: '#8b5cf6' },
  player_spotlight: { bg: '#3b82f615', text: '#3b82f6' },
  game_recap: { bg: '#ef444415', text: '#ef4444' },
  season_leader: { bg: '#f59e0b15', text: '#f59e0b' },
  trade_impact: { bg: '#06b6d415', text: '#06b6d4' },
}

const VIRAL_COLORS = [
  { min: 0, max: 30, color: '#ef4444' },
  { min: 30, max: 60, color: '#f59e0b' },
  { min: 60, max: 80, color: '#3b82f6' },
  { min: 80, max: 100, color: '#22c55e' },
]

function getViralColor(score: number): string {
  const match = VIRAL_COLORS.find(v => score >= v.min && score < v.max)
  return match?.color || '#22c55e'
}

export default function DataCardsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('library')
  const [cards, setCards] = useState<StatCard[]>([])
  const [templates, setTemplates] = useState<CardTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedCard, setSelectedCard] = useState<StatCard | null>(null)

  // Generate tab state
  const [playerName, setPlayerName] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generateResult, setGenerateResult] = useState<{ success: boolean; message: string } | null>(null)

  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      let query = datalabClient
        .from('stat_cards')
        .select('*')
        .order('created_at', { ascending: false })
      if (statusFilter !== 'all') query = query.eq('status', statusFilter)
      const { data, error } = await query
      if (error) throw error
      setCards(data || [])
    } catch (e) {
      console.error('Failed to fetch stat cards:', e)
    } finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }, [statusFilter])

  const fetchTemplates = useCallback(async () => {
    try {
      const { data, error } = await datalabClient
        .from('card_templates')
        .select('*')
        .order('times_used', { ascending: false })
      if (error) throw error
      setTemplates(data || [])
    } catch (e) {
      console.error('Failed to fetch templates:', e)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'library') fetchCards()
    if (activeTab === 'templates') fetchTemplates()
  }, [activeTab, fetchCards, fetchTemplates])

  const handleStatusUpdate = async (cardId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/data-cards/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status')
      // Refresh cards and update modal if open
      await fetchCards()
      if (selectedCard?.id === cardId) {
        setSelectedCard(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (e) {
      console.error('Status update failed:', e)
    }
  }

  const handleDelete = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return
    try {
      const res = await fetch('/api/admin/data-cards/status', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId }),
      })
      if (!res.ok) throw new Error('Failed to delete card')
      setSelectedCard(null)
      await fetchCards()
    } catch (e) {
      console.error('Delete failed:', e)
    }
  }

  const handleGenerate = async () => {
    if (!playerName.trim()) return
    setGenerating(true)
    setGenerateResult(null)
    try {
      const res = await fetch('/api/admin/data-cards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setGenerateResult({ success: true, message: data.message || `Cards generated for ${playerName}` })
      setPlayerName('')
    } catch (e) {
      setGenerateResult({ success: false, message: e instanceof Error ? e.message : 'Unknown error' })
    } finally {
      setGenerating(false)
    }
  }

  const getWorkflowButton = (status: string, cardId: string, size: 'small' | 'normal' = 'small') => {
    const padding = size === 'small' ? '4px 10px' : '8px 16px'
    const fontSize = size === 'small' ? '11px' : '13px'

    switch (status) {
      case 'draft':
        return (
          <button
            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(cardId, 'review') }}
            style={{ padding, borderRadius: 6, border: 'none', cursor: 'pointer', fontSize, fontWeight: 600, backgroundColor: '#f59e0b', color: '#fff' }}
          >
            Send to Review
          </button>
        )
      case 'review':
        return (
          <button
            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(cardId, 'approved') }}
            style={{ padding, borderRadius: 6, border: 'none', cursor: 'pointer', fontSize, fontWeight: 600, backgroundColor: '#3b82f6', color: '#fff' }}
          >
            Approve
          </button>
        )
      case 'approved':
        return (
          <button
            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(cardId, 'published') }}
            style={{ padding, borderRadius: 6, border: 'none', cursor: 'pointer', fontSize, fontWeight: 600, backgroundColor: '#22c55e', color: '#fff' }}
          >
            Publish
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1400 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Data Cards</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
            Browse, generate, and manage stat cards for social media
          </p>
        </div>
        {lastRefresh && (
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {(['library', 'generate', 'templates'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px', borderRadius: '8px 8px 0 0', border: 'none',
              backgroundColor: activeTab === tab ? '#fff' : '#f3f4f6',
              color: activeTab === tab ? '#bc0000' : '#6b7280',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #bc0000' : 'none',
              textTransform: 'capitalize',
            }}
          >
            {tab}
            {tab === 'library' && cards.length > 0 && (
              <span style={{ marginLeft: 6, backgroundColor: '#bc0000', color: '#fff', padding: '2px 6px', borderRadius: 10, fontSize: '11px' }}>
                {cards.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Library Tab */}
      {activeTab === 'library' && (
        <>
          {/* Status filter bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {(['all', 'draft', 'review', 'approved', 'published', 'archived'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600, textTransform: 'capitalize',
                  backgroundColor: statusFilter === s ? '#bc0000' : '#e5e7eb',
                  color: statusFilter === s ? '#fff' : '#6b7280',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Card grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading cards...</div>
          ) : cards.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: '14px' }}>
              No cards found{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}. Try generating some from the Generate tab.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {cards.map(card => {
                const statusColor = STATUS_COLORS[card.status] || STATUS_COLORS.draft
                const typeColor = CARD_TYPE_COLORS[card.card_type] || { bg: '#6b728015', text: '#6b7280' }
                const viralScore = card.viral_score ?? 0
                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    style={{
                      borderRadius: 10, border: '1px solid #e5e7eb', backgroundColor: '#fff',
                      cursor: 'pointer', overflow: 'hidden', transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    <div style={{ padding: '14px 16px' }}>
                      {/* Headline */}
                      <div style={{
                        fontSize: '14px', fontWeight: 700, color: '#1a1a1a', marginBottom: 10,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {card.headline || card.player_name}
                      </div>

                      {/* Badges row */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                          backgroundColor: typeColor.bg, color: typeColor.text,
                        }}>
                          {card.card_type}
                        </span>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                          backgroundColor: statusColor.bg, color: statusColor.text,
                          textTransform: 'uppercase',
                        }}>
                          {card.status}
                        </span>
                      </div>

                      {/* Viral score bar */}
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Viral Score</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: getViralColor(viralScore) }}>
                            {viralScore}
                          </span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, backgroundColor: '#f3f4f6', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 3,
                            width: `${viralScore}%`,
                            backgroundColor: getViralColor(viralScore),
                            transition: 'width 0.3s',
                          }} />
                        </div>
                      </div>

                      {/* Footer row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {new Date(card.created_at).toLocaleDateString()}
                        </span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {getWorkflowButton(card.status, card.id)}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(card.id) }}
                            style={{
                              padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                              fontSize: '11px', fontWeight: 600, backgroundColor: '#ef444415', color: '#ef4444',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div style={{ maxWidth: 500 }}>
          <div style={{
            padding: 24, borderRadius: 10, border: '1px solid #e5e7eb', backgroundColor: '#fff',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px' }}>Generate Stat Cards</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: 16 }}>
              Enter a player name to generate data-driven stat cards via DataLab.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Player Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. Caleb Williams"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid #d1d5db', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || !playerName.trim()}
              style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                backgroundColor: '#bc0000', color: '#fff',
                fontWeight: 700, fontSize: '14px',
                cursor: generating || !playerName.trim() ? 'not-allowed' : 'pointer',
                opacity: generating || !playerName.trim() ? 0.6 : 1,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {generating && (
                <span style={{
                  width: 14, height: 14, border: '2px solid #ffffff50',
                  borderTopColor: '#fff', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.8s linear infinite',
                }} />
              )}
              {generating ? 'Generating...' : 'Generate Cards'}
            </button>

            {generateResult && (
              <div style={{
                marginTop: 16, padding: '12px 14px', borderRadius: 8,
                backgroundColor: generateResult.success ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${generateResult.success ? '#bbf7d0' : '#fecaca'}`,
                fontSize: '13px', color: generateResult.success ? '#15803d' : '#dc2626',
              }}>
                {generateResult.message}
              </div>
            )}
          </div>

          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div style={{ overflow: 'auto' }}>
          {templates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: '14px' }}>
              No templates found.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  {['Name', 'Card Type', 'Times Used', 'Avg Viral Score', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', fontSize: '12px', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {templates.map(t => {
                  const typeColor = CARD_TYPE_COLORS[t.card_type] || { bg: '#6b728015', text: '#6b7280' }
                  const statusColor = STATUS_COLORS[t.status] || STATUS_COLORS.draft
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1a1a1a' }}>{t.name}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                          backgroundColor: typeColor.bg, color: typeColor.text,
                        }}>
                          {t.card_type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#374151' }}>{t.times_used}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {t.avg_viral_score != null ? (
                          <span style={{ fontWeight: 700, color: getViralColor(t.avg_viral_score) }}>
                            {Math.round(t.avg_viral_score)}
                          </span>
                        ) : (
                          <span style={{ color: '#9ca3af' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                          backgroundColor: statusColor.bg, color: statusColor.text,
                          textTransform: 'uppercase',
                        }}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* SVG Preview Modal */}
      {selectedCard && (
        <div
          onClick={() => setSelectedCard(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#fff', borderRadius: 12,
              maxWidth: 600, width: '100%', maxHeight: '90vh',
              overflow: 'auto', position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedCard(null)}
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 10,
                width: 32, height: 32, borderRadius: 8, border: 'none',
                backgroundColor: '#f3f4f6', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', color: '#6b7280',
              }}
            >
              X
            </button>

            {/* Card header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                {selectedCard.headline || selectedCard.player_name}
              </h3>
              <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center' }}>
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                  backgroundColor: (CARD_TYPE_COLORS[selectedCard.card_type] || { bg: '#6b728015' }).bg,
                  color: (CARD_TYPE_COLORS[selectedCard.card_type] || { text: '#6b7280' }).text,
                }}>
                  {selectedCard.card_type}
                </span>
                <span style={{
                  fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                  backgroundColor: (STATUS_COLORS[selectedCard.status] || STATUS_COLORS.draft).bg,
                  color: (STATUS_COLORS[selectedCard.status] || STATUS_COLORS.draft).text,
                  textTransform: 'uppercase',
                }}>
                  {selectedCard.status}
                </span>
                {selectedCard.viral_score != null && (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: getViralColor(selectedCard.viral_score), marginLeft: 'auto' }}>
                    Viral: {selectedCard.viral_score}
                  </span>
                )}
              </div>
            </div>

            {/* SVG preview */}
            {selectedCard.svg_content ? (
              <div
                style={{
                  padding: 24, display: 'flex', justifyContent: 'center',
                  backgroundColor: '#f9fafb',
                }}
                dangerouslySetInnerHTML={{ __html: selectedCard.svg_content }}
              />
            ) : (
              <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                No SVG content available for this card.
              </div>
            )}

            {/* Metadata */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid #f3f4f6', fontSize: '12px', color: '#6b7280' }}>
              Created: {new Date(selectedCard.created_at).toLocaleString()}
            </div>

            {/* Footer actions */}
            <div style={{
              padding: '16px 24px', borderTop: '1px solid #f3f4f6',
              display: 'flex', gap: 8, justifyContent: 'flex-end',
            }}>
              {getWorkflowButton(selectedCard.status, selectedCard.id, 'normal')}
              <button
                onClick={() => handleDelete(selectedCard.id)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, backgroundColor: '#ef4444', color: '#fff',
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedCard(null)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid #d1d5db',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  backgroundColor: '#fff', color: '#374151',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
