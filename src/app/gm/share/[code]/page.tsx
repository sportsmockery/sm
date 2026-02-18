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

  const textColor = isDark ? '#f9fafb' : '#1f2937'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const pageBg = isDark ? '#111827' : '#f3f4f6'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: pageBg }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#bc0000', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error || !trade) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: pageBg, color: textColor }}>
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>404</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Trade Not Found</h1>
          <p style={{ color: subText, marginBottom: 24 }}>This trade link may have expired or doesn't exist.</p>
          <Link
            href="/gm"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#bc0000',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Build Your Own Trade
          </Link>
        </div>
      </div>
    )
  }

  const chicagoConfig = TEAM_CONFIG[trade.chicago_team] || { name: trade.chicago_team, color: '#bc0000', logo: trade.chicago_team_logo }
  const gradeColor = trade.grade >= 70 ? '#22c55e' : trade.grade >= 50 ? '#eab308' : '#ef4444'

  return (
    <div className="min-h-screen" style={{ backgroundColor: pageBg, color: textColor }}>
      {/* Header */}
      <div style={{
        backgroundColor: cardBg,
        borderBottom: `1px solid ${borderColor}`,
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <img src="/sm-icon.png" alt="SportsMockery" style={{ width: 32, height: 32 }} />
            <span style={{ fontWeight: 800, fontSize: 18, color: '#bc0000' }}>SportsMockery</span>
          </Link>
          <Link
            href="/gm"
            style={{
              padding: '8px 16px',
              backgroundColor: '#bc0000',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            Build Your Trade
          </Link>
        </div>
      </div>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        {/* Trade Card */}
        <div style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          {/* Grade Header */}
          <div style={{
            background: `linear-gradient(135deg, ${chicagoConfig.color}20, ${gradeColor}20)`,
            padding: '32px 24px',
            textAlign: 'center',
            borderBottom: `1px solid ${borderColor}`,
          }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: gradeColor, lineHeight: 1 }}>
              {trade.grade}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
              <span style={{
                padding: '6px 16px',
                borderRadius: 20,
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: '1px',
                backgroundColor: trade.status === 'accepted' ? '#22c55e20' : '#ef444420',
                color: trade.status === 'accepted' ? '#22c55e' : '#ef4444',
              }}>
                {trade.status === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
              </span>
              {trade.is_dangerous && (
                <span style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  fontWeight: 800,
                  fontSize: 12,
                  backgroundColor: '#eab30820',
                  color: '#eab308',
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
                  <div style={{ fontSize: 12, color: subText }}>Sends</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={chicagoConfig.color} strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={subText} strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'right' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: textColor }}>{trade.trade_partner}</div>
                  <div style={{ fontSize: 12, color: subText }}>Sends</div>
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
              <div style={{
                padding: 16,
                borderRadius: 12,
                backgroundColor: isDark ? '#111827' : '#f9fafb',
                border: `1px solid ${borderColor}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
                  {chicagoConfig.name} Sends
                </div>
                {trade.players_sent?.map((p: any, i: number) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: subText }}>{p.position}</div>
                  </div>
                ))}
                {trade.draft_picks_sent?.map((pk: any, i: number) => (
                  <div key={`dp-${i}`} style={{ padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#8b5cf6' }}>
                      {pk.year} Round {pk.round} Pick
                    </div>
                  </div>
                ))}
              </div>

              {/* Opponent sends */}
              <div style={{
                padding: 16,
                borderRadius: 12,
                backgroundColor: isDark ? '#111827' : '#f9fafb',
                border: `1px solid ${borderColor}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
                  {trade.trade_partner} Sends
                </div>
                {trade.players_received?.map((p: any, i: number) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: subText }}>{p.position}</div>
                  </div>
                ))}
                {trade.draft_picks_received?.map((pk: any, i: number) => (
                  <div key={`dp-${i}`} style={{ padding: '8px 0', borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#8b5cf6' }}>
                      {pk.year} Round {pk.round} Pick
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {trade.trade_summary && (
              <div style={{
                fontSize: 14,
                color: subText,
                fontStyle: 'italic',
                textAlign: 'center',
                marginBottom: 16,
                padding: '12px 16px',
                borderRadius: 8,
                backgroundColor: isDark ? '#111827' : '#f9fafb',
              }}>
                "{trade.trade_summary}"
              </div>
            )}

            {/* Reasoning */}
            <div style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: isDark ? '#111827' : '#f9fafb',
              fontSize: 13,
              lineHeight: 1.6,
              color: textColor,
            }}>
              {trade.grade_reasoning}
            </div>
          </div>
        </div>

        {/* CTA Card */}
        <div style={{
          backgroundColor: '#bc0000',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>Think you can do better?</div>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 24 }}>
            Build your own trades and get AI-powered grades from our GM Trade Simulator
          </p>
          <Link
            href="/gm"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#fff',
              color: '#bc0000',
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 16,
              textDecoration: 'none',
            }}
          >
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
          borderTop: `1px solid ${borderColor}`,
          color: subText,
          fontSize: 12,
        }}>
          <p>Created with SportsMockery GM Trade Simulator</p>
          <p style={{ marginTop: 4 }}>test.sportsmockery.com/gm</p>
        </div>
      </main>
    </div>
  )
}
