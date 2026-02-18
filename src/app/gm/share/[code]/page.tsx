'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

interface TradeData {
  id: string
  chicago_team: string
  sport: string
  trade_partner: string
  players_sent: any[]
  players_received: any[]
  draft_picks_sent: any[]
  draft_picks_received: any[]
  grade: number
  grade_reasoning: string
  status: string
  is_dangerous: boolean
  improvement_score: number
  trade_summary: string
  talent_balance: number
  contract_value: number
  team_fit: number
  future_assets: number
  partner_team_key: string
  partner_team_logo: string
  chicago_team_logo: string
  created_at: string
  items: any[]
}

const TEAM_CONFIG: Record<string, { name: string; color: string; logo: string }> = {
  'chicago-bears': { name: 'Chicago Bears', color: '#0B162A', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
  'chicago-bulls': { name: 'Chicago Bulls', color: '#CE1141', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
  'chicago-blackhawks': { name: 'Chicago Blackhawks', color: '#CF0A2C', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png' },
  'chicago-cubs': { name: 'Chicago Cubs', color: '#0E3386', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png' },
  'chicago-white-sox': { name: 'Chicago White Sox', color: '#27251F', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png' },
}

export default function SharePage() {
  const params = useParams()
  const code = params?.code as string
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [trade, setTrade] = useState<TradeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return

    fetch(`/api/gm/share/${code}`)
      .then(res => {
        if (!res.ok) throw new Error('Trade not found')
        return res.json()
      })
      .then(data => {
        setTrade(data.trade)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [code])

  if (loading) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sm-grid-overlay" />
        <div style={{ width: 32, height: 32, border: '3px solid var(--sm-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-2030 1s linear infinite' }} />
      </div>
    )
  }

  if (error || !trade) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sm-grid-overlay" />
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--sm-text-dim)', marginBottom: 12, fontFamily: 'var(--sm-font-heading)' }}>404</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: 'var(--sm-text)' }}>Trade Not Found</h1>
          <p style={{ color: 'var(--sm-text-muted)', marginBottom: 24 }}>This trade link may have expired or doesn&apos;t exist.</p>
          <Link href="/gm" className="btn btn-primary btn-md">
            Build Your Own Trade
          </Link>
        </div>
      </div>
    )
  }

  const chicagoConfig = TEAM_CONFIG[trade.chicago_team] || { name: trade.chicago_team, color: '#bc0000', logo: trade.chicago_team_logo }
  const gradeColor = trade.grade >= 70 ? 'var(--sm-success)' : trade.grade >= 50 ? 'var(--sm-warning)' : 'var(--sm-error)'

  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />

      {/* Minimal Nav */}
      <div style={{
        background: 'var(--sm-surface)',
        borderBottom: '1px solid var(--sm-border)',
        padding: '16px 24px',
        position: 'relative', zIndex: 1,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/sm-icon.png" alt="SportsMockery" style={{ width: 32, height: 32 }} />
            <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--sm-red)' }}>SportsMockery</span>
          </Link>
          <Link href="/gm" className="btn btn-primary btn-sm">
            Build Your Trade
          </Link>
        </div>
      </div>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1 }}>
        {/* Trade Card - glass-card summary */}
        <div className="glass-card glass-card-static" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
          {/* Grade Header */}
          <div style={{
            background: `linear-gradient(135deg, ${chicagoConfig.color}20, transparent)`,
            padding: '32px 24px',
            textAlign: 'center',
            borderBottom: '1px solid var(--sm-border)',
          }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: gradeColor, lineHeight: 1, fontFamily: 'var(--sm-font-heading)' }}>
              {trade.grade}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <span className="sm-tag" style={{
                background: trade.status === 'accepted' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                color: trade.status === 'accepted' ? 'var(--sm-success)' : 'var(--sm-error)',
                borderColor: 'transparent',
              }}>
                {trade.status === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
              </span>
              {trade.is_dangerous && (
                <span className="sm-tag" style={{
                  background: 'rgba(234,179,8,0.15)',
                  color: 'var(--sm-warning)',
                  borderColor: 'transparent',
                }}>
                  DANGEROUS
                </span>
              )}
            </div>
          </div>

          {/* Trade Details */}
          <div style={{ padding: 24 }}>
            {/* Teams */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={chicagoConfig.logo || trade.chicago_team_logo}
                  alt={chicagoConfig.name}
                  style={{ width: 48, height: 48, objectFit: 'contain' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: chicagoConfig.color }}>{chicagoConfig.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--sm-text-muted)' }}>Sends</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={chicagoConfig.color} strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sm-text-dim)" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'right' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--sm-text)' }}>{trade.trade_partner}</div>
                  <div style={{ fontSize: 12, color: 'var(--sm-text-muted)' }}>Sends</div>
                </div>
                {trade.partner_team_logo && (
                  <img
                    src={trade.partner_team_logo}
                    alt={trade.trade_partner}
                    style={{ width: 48, height: 48, objectFit: 'contain' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
              </div>
            </div>

            {/* Assets */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {/* Chicago sends */}
              <div className="glass-card glass-card-sm glass-card-static">
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sm-text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {chicagoConfig.name} Sends
                </div>
                {trade.players_sent?.map((p: any, i: number) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--sm-border)' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--sm-text)' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--sm-text-muted)' }}>{p.position}</div>
                  </div>
                ))}
                {trade.draft_picks_sent?.map((pk: any, i: number) => (
                  <div key={`dp-${i}`} style={{ padding: '8px 0', borderBottom: '1px solid var(--sm-border)' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#8b5cf6' }}>
                      {pk.year} Round {pk.round} Pick
                    </div>
                  </div>
                ))}
              </div>

              {/* Opponent sends */}
              <div className="glass-card glass-card-sm glass-card-static">
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sm-text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {trade.trade_partner} Sends
                </div>
                {trade.players_received?.map((p: any, i: number) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--sm-border)' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--sm-text)' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--sm-text-muted)' }}>{p.position}</div>
                  </div>
                ))}
                {trade.draft_picks_received?.map((pk: any, i: number) => (
                  <div key={`dp-${i}`} style={{ padding: '8px 0', borderBottom: '1px solid var(--sm-border)' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#8b5cf6' }}>
                      {pk.year} Round {pk.round} Pick
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {trade.trade_summary && (
              <div className="glass-card-sm glass-card-static" style={{
                fontSize: 14,
                color: 'var(--sm-text-muted)',
                fontStyle: 'italic',
                textAlign: 'center',
                marginBottom: 16,
              }}>
                &ldquo;{trade.trade_summary}&rdquo;
              </div>
            )}

            {/* Reasoning */}
            <div className="glass-card-sm glass-card-static" style={{
              fontSize: 13,
              lineHeight: 1.7,
              color: 'var(--sm-text)',
            }}>
              {trade.grade_reasoning}
            </div>
          </div>
        </div>

        {/* CTA Card */}
        <div className="glass-card glass-card-static" style={{
          background: 'var(--sm-gradient)',
          borderColor: 'transparent',
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, fontFamily: 'var(--sm-font-heading)' }}>Think you can do better?</div>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 24 }}>
            Build your own trades and get AI-powered grades from our GM Trade Simulator
          </p>
          <Link href="/gm" className="btn btn-lg" style={{
            background: '#fff', color: 'var(--sm-red)',
            borderRadius: 'var(--sm-radius-md)', fontWeight: 800, fontSize: 16,
            border: 'none', display: 'inline-flex',
          }}>
            Try the Trade Simulator
          </Link>
          <div style={{ marginTop: 16, fontSize: 13, opacity: 0.8 }}>
            Free for all SportsMockery members
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 32,
          padding: '16px 0',
          borderTop: '1px solid var(--sm-border)',
          color: 'var(--sm-text-dim)',
          fontSize: 12,
        }}>
          <p>Created with SportsMockery GM Trade Simulator</p>
          <p style={{ marginTop: 4 }}>test.sportsmockery.com/gm</p>
        </div>
      </main>
    </div>
  )
}
