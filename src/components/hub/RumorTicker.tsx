'use client'

const TEAM_TICKERS: Record<string, string[]> = {
  bears: [
    'BREAKING: Bears targeting defensive end in free agency...',
    'Ryan Poles evaluating multiple trade scenarios...',
    'Bears exploring draft day trade-up possibilities...',
  ],
  bulls: [
    'BREAKING: Bulls exploring trade options at the deadline...',
    'Multiple teams calling about Bulls veteran guards...',
    'Bulls front office gauging market for expiring contracts...',
  ],
  blackhawks: [
    'BREAKING: Blackhawks fielding calls on pending UFAs...',
    'Hawks front office focused on prospect development...',
    'Trade deadline approaching with several Hawks on radar...',
  ],
  cubs: [
    'BREAKING: Cubs targeting pitching reinforcements...',
    'Jed Hoyer exploring multiple trade scenarios...',
    'Cubs prospect package drawing interest from rivals...',
  ],
  whitesox: [
    'BREAKING: White Sox rebuild continues with roster moves...',
    'Multiple teams calling about White Sox veterans...',
    'Sox front office evaluating all trade offers...',
  ],
}

export default function RumorTicker({ teamSlug }: { teamSlug: string }) {
  const key = teamSlug.replace('chicago-', '')
  const tickers = TEAM_TICKERS[key] || TEAM_TICKERS.bears

  return (
    <div className="rumor-ticker">
      <div className="rumor-ticker-text">
        {tickers.map((text, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px' }}>🚨</span>
            <span>{text}</span>
            {i < tickers.length - 1 && <span style={{ color: 'var(--sm-text-dim)', margin: '0 8px' }}>|</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
