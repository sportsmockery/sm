'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { datalabClient } from '@/lib/supabase-datalab'

interface StatCard {
  id: string
  created_at: string
  player_name: string
  headline: string
  subheadline: string | null
  hook: string | null
  insight: string | null
  chicago_take: string | null
  card_type: string
  svg_content: string
  thumbnail_url: string | null
  image_url: string | null
  video_url: string | null
  viral_score: number | null
  status: string
  tier: string | null
  confidence_level: string | null
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

interface VideoManifest {
  frames: { url: string; duration_ms: number }[]
  total_duration_ms: number
  width: number
  height: number
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
  offseason_trade_rumor: { bg: '#f9731615', text: '#f97316' },
  offseason_draft_prospect: { bg: '#a855f715', text: '#a855f7' },
  offseason_free_agent: { bg: '#14b8a615', text: '#14b8a6' },
  offseason_roster_projection: { bg: '#3b82f615', text: '#3b82f6' },
  offseason_historical: { bg: '#f59e0b15', text: '#f59e0b' },
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

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  S: { bg: '#fbbf2420', text: '#d97706' },
  A: { bg: '#22c55e20', text: '#16a34a' },
  B: { bg: '#3b82f620', text: '#2563eb' },
  C: { bg: '#6b728020', text: '#6b7280' },
  D: { bg: '#ef444420', text: '#ef4444' },
}

const CONFIDENCE_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: '#22c55e20', text: '#16a34a' },
  medium: { bg: '#f59e0b20', text: '#d97706' },
  low: { bg: '#ef444420', text: '#ef4444' },
}

// --- Video Player Component ---
function VideoPlayer({ videoUrl }: { videoUrl: string }) {
  const [manifest, setManifest] = useState<VideoManifest | null>(null)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadManifest() {
      try {
        const res = await fetch(videoUrl)
        if (!res.ok) throw new Error(`Failed to load video manifest: ${res.status}`)
        const data = await res.json()
        if (!cancelled) setManifest(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load video')
      }
    }
    loadManifest()
    return () => { cancelled = true }
  }, [videoUrl])

  useEffect(() => {
    if (!playing || !manifest) return
    const frame = manifest.frames[currentFrame]
    if (!frame) {
      setPlaying(false)
      setCurrentFrame(0)
      return
    }
    timerRef.current = setTimeout(() => {
      setCurrentFrame(prev => {
        const next = prev + 1
        if (next >= manifest.frames.length) {
          setPlaying(false)
          return 0
        }
        return next
      })
    }, frame.duration_ms)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [playing, currentFrame, manifest])

  const togglePlay = () => {
    if (!manifest) return
    if (!playing && currentFrame >= manifest.frames.length - 1) {
      setCurrentFrame(0)
    }
    setPlaying(p => !p)
  }

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#ef4444', fontSize: '13px' }}>
        {error}
      </div>
    )
  }

  if (!manifest) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
        Loading video...
      </div>
    )
  }

  const progress = manifest.frames.length > 1
    ? (currentFrame / (manifest.frames.length - 1)) * 100
    : 100

  return (
    <div style={{ position: 'relative', backgroundColor: '#000' }}>
      {/* Frame display */}
      <img
        src={manifest.frames[currentFrame]?.url}
        alt={`Frame ${currentFrame + 1}`}
        style={{ width: '100%', display: 'block' }}
      />

      {/* Controls overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
        padding: '24px 16px 12px',
      }}>
        {/* Progress bar */}
        <div
          style={{
            height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)',
            marginBottom: 8, cursor: 'pointer',
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct = (e.clientX - rect.left) / rect.width
            const frameIdx = Math.round(pct * (manifest.frames.length - 1))
            setCurrentFrame(Math.max(0, Math.min(frameIdx, manifest.frames.length - 1)))
          }}
        >
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${progress}%`,
            backgroundColor: '#bc0000',
            transition: playing ? 'none' : 'width 0.2s',
          }} />
        </div>

        {/* Play/Pause + frame counter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={togglePlay}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: '14px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6, padding: 0,
            }}
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3" y="2" width="4" height="12" rx="1" />
                <rect x="9" y="2" width="4" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2l10 6-10 6V2z" />
              </svg>
            )}
            {playing ? 'Pause' : 'Play'}
          </button>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
            {currentFrame + 1} / {manifest.frames.length}
          </span>
        </div>
      </div>
    </div>
  )
}

// --- Media badge icons ---
function ImageIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="2" width="14" height="12" rx="2" />
      <circle cx="5.5" cy="6" r="1.5" />
      <path d="M1 12l4-4 2.5 2.5L11 7l4 5" />
    </svg>
  )
}

function VideoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="3" width="10" height="10" rx="2" />
      <path d="M11 6l4-2v8l-4-2" />
    </svg>
  )
}

// --- Main Page ---
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

  // Modal tab for switching between image and video
  const [modalView, setModalView] = useState<'image' | 'video'>('image')

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      let query = datalabClient
        .from('stat_cards')
        .select('id, created_at, player_name, headline, subheadline, hook, insight, chicago_take, card_type, svg_content, thumbnail_url, image_url, video_url, viral_score, status, tier, confidence_level, template_id, metadata')
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

  const openCardModal = (card: StatCard) => {
    setSelectedCard(card)
    setModalView(card.image_url ? 'image' : card.video_url ? 'video' : 'image')
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
                const hasImage = !!card.image_url
                const hasVideo = !!card.video_url
                return (
                  <div
                    key={card.id}
                    onClick={() => openCardModal(card)}
                    style={{
                      borderRadius: 10, border: '1px solid #e5e7eb', backgroundColor: '#fff',
                      cursor: 'pointer', overflow: 'hidden', transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                  >
                    {/* Thumbnail area */}
                    {card.thumbnail_url ? (
                      <div style={{ position: 'relative', aspectRatio: '9/16', maxHeight: 220, overflow: 'hidden', backgroundColor: '#111' }}>
                        <img
                          src={card.thumbnail_url}
                          alt={card.headline || card.player_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        {/* Media badges */}
                        {(hasImage || hasVideo) && (
                          <div style={{
                            position: 'absolute', top: 8, right: 8,
                            display: 'flex', gap: 4,
                          }}>
                            {hasImage && (
                              <span style={{
                                display: 'flex', alignItems: 'center', gap: 3,
                                padding: '2px 6px', borderRadius: 4,
                                backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff',
                                fontSize: '10px', fontWeight: 600,
                              }}>
                                <ImageIcon /> IMG
                              </span>
                            )}
                            {hasVideo && (
                              <span style={{
                                display: 'flex', alignItems: 'center', gap: 3,
                                padding: '2px 6px', borderRadius: 4,
                                backgroundColor: 'rgba(188,0,0,0.8)', color: '#fff',
                                fontSize: '10px', fontWeight: 600,
                              }}>
                                <VideoIcon /> VID
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* No thumbnail — show media badges inline if media exists */
                      (hasImage || hasVideo) && (
                        <div style={{ padding: '8px 16px 0', display: 'flex', gap: 4 }}>
                          {hasImage && (
                            <span style={{
                              display: 'flex', alignItems: 'center', gap: 3,
                              padding: '2px 6px', borderRadius: 4,
                              backgroundColor: '#3b82f615', color: '#3b82f6',
                              fontSize: '10px', fontWeight: 600,
                            }}>
                              <ImageIcon /> Image
                            </span>
                          )}
                          {hasVideo && (
                            <span style={{
                              display: 'flex', alignItems: 'center', gap: 3,
                              padding: '2px 6px', borderRadius: 4,
                              backgroundColor: '#bc000015', color: '#bc0000',
                              fontSize: '10px', fontWeight: 600,
                            }}>
                              <VideoIcon /> Video
                            </span>
                          )}
                        </div>
                      )
                    )}

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
                          <span style={{ color: '#9ca3af' }}>&mdash;</span>
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

      {/* Detail Modal */}
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
              maxWidth: 650, width: '100%', maxHeight: '90vh',
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
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, paddingRight: 40 }}>
                {selectedCard.headline || selectedCard.player_name}
              </h3>
              {selectedCard.subheadline && (
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                  {selectedCard.subheadline}
                </p>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
                {selectedCard.tier && (() => {
                  const tc = TIER_COLORS[selectedCard.tier] || { bg: '#6b728020', text: '#6b7280' }
                  return (
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      backgroundColor: tc.bg, color: tc.text,
                    }}>
                      Tier {selectedCard.tier}
                    </span>
                  )
                })()}
                {selectedCard.confidence_level && (() => {
                  const cc = CONFIDENCE_COLORS[selectedCard.confidence_level] || { bg: '#6b728020', text: '#6b7280' }
                  return (
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      backgroundColor: cc.bg, color: cc.text, textTransform: 'capitalize',
                    }}>
                      {selectedCard.confidence_level} confidence
                    </span>
                  )
                })()}
                {selectedCard.viral_score != null && (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: getViralColor(selectedCard.viral_score), marginLeft: 'auto' }}>
                    Viral: {selectedCard.viral_score}
                  </span>
                )}
              </div>
            </div>

            {/* Media view toggle (if both image and video available) */}
            {selectedCard.image_url && selectedCard.video_url && (
              <div style={{ display: 'flex', gap: 4, padding: '12px 24px 0' }}>
                <button
                  onClick={() => setModalView('image')}
                  style={{
                    padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600,
                    backgroundColor: modalView === 'image' ? '#bc0000' : '#e5e7eb',
                    color: modalView === 'image' ? '#fff' : '#6b7280',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <ImageIcon /> Image
                </button>
                <button
                  onClick={() => setModalView('video')}
                  style={{
                    padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600,
                    backgroundColor: modalView === 'video' ? '#bc0000' : '#e5e7eb',
                    color: modalView === 'video' ? '#fff' : '#6b7280',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <VideoIcon /> Video
                </button>
              </div>
            )}

            {/* Media content */}
            {modalView === 'video' && selectedCard.video_url ? (
              <div style={{ padding: '16px 24px' }}>
                <VideoPlayer videoUrl={selectedCard.video_url} />
              </div>
            ) : selectedCard.image_url ? (
              <div style={{ padding: 24, display: 'flex', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
                <img
                  src={selectedCard.image_url}
                  alt={selectedCard.headline || selectedCard.player_name}
                  style={{ maxWidth: '100%', maxHeight: 600, borderRadius: 8 }}
                />
              </div>
            ) : selectedCard.svg_content ? (
              <div
                style={{
                  padding: 24, display: 'flex', justifyContent: 'center',
                  backgroundColor: '#f9fafb',
                }}
                dangerouslySetInnerHTML={{ __html: selectedCard.svg_content }}
              />
            ) : (
              <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                No media available for this card.
              </div>
            )}

            {/* Only-video button (when no image but has video) */}
            {!selectedCard.image_url && selectedCard.video_url && modalView === 'image' && (
              <div style={{ padding: '0 24px 16px', textAlign: 'center' }}>
                <button
                  onClick={() => setModalView('video')}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600,
                    backgroundColor: '#bc0000', color: '#fff',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <VideoIcon /> Play Video
                </button>
              </div>
            )}

            {/* Text content fields */}
            {(selectedCard.hook || selectedCard.insight || selectedCard.chicago_take) && (
              <div style={{ padding: '0 24px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedCard.hook && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>Hook</div>
                    <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>{selectedCard.hook}</div>
                  </div>
                )}
                {selectedCard.insight && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>Insight</div>
                    <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>{selectedCard.insight}</div>
                  </div>
                )}
                {selectedCard.chicago_take && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>Chicago Take</div>
                    <div style={{ fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>{selectedCard.chicago_take}</div>
                  </div>
                )}
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
