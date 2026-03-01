import { datalabAdmin } from '@/lib/supabase-datalab'
import type { HubSlug, HubItem } from '@/types/hub'

interface HubUpdatesFeedProps {
  hubSlug: HubSlug
  teamSlug?: string
  title?: string
  emptyState?: string
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function renderMeta(meta: Record<string, unknown>, hubSlug: HubSlug) {
  const tags: string[] = []

  if (hubSlug === 'trade-rumors') {
    if (meta.playerName) tags.push(meta.playerName as string)
    if (meta.position) tags.push(meta.position as string)
    if (meta.otherTeam) tags.push(meta.otherTeam as string)
  } else if (hubSlug === 'draft-tracker') {
    if (meta.prospectName) tags.push(meta.prospectName as string)
    if (meta.position) tags.push(meta.position as string)
    if (meta.college) tags.push(meta.college as string)
    if (meta.projectedRound) tags.push(`Rd ${meta.projectedRound}`)
  } else if (hubSlug === 'cap-tracker') {
    if (meta.playerName) tags.push(meta.playerName as string)
    if (meta.moveType) tags.push((meta.moveType as string).charAt(0).toUpperCase() + (meta.moveType as string).slice(1))
    if (meta.capChange) tags.push(meta.capChange as string)
  } else if (hubSlug === 'depth-chart') {
    if (meta.positionGroup) tags.push(meta.positionGroup as string)
    if (meta.status) tags.push(meta.status as string)
  } else if (hubSlug === 'game-center') {
    if (meta.opponent) tags.push(meta.opponent as string)
    if (meta.noteType) tags.push(meta.noteType as string)
  }

  if (tags.length === 0) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
      {tags.map((tag, i) => (
        <span
          key={i}
          style={{
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 500,
            backgroundColor: 'rgba(188, 0, 0, 0.08)',
            color: 'var(--sm-text-muted)',
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

export default async function HubUpdatesFeed({
  hubSlug,
  teamSlug = 'chicago-bears',
  title = 'Live Updates',
  emptyState = 'No updates yet.',
}: HubUpdatesFeedProps) {
  let items: HubItem[] = []

  try {
    const { data } = await datalabAdmin
      .from('hub_items')
      .select('*')
      .eq('team_slug', teamSlug)
      .eq('hub_slug', hubSlug)
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('timestamp', { ascending: false })
      .limit(10)

    items = (data || []) as HubItem[]
  } catch {
    // Silently fail — page renders normally without feed
  }

  if (items.length === 0) return null

  return (
    <section style={{ marginBottom: '28px' }}>
      {/* Section Header */}
      <h2
        style={{
          fontFamily: "Barlow, sans-serif",
          color: 'var(--sm-text)',
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.5px',
          paddingBottom: '8px',
          borderBottom: '3px solid var(--sm-red)',
          marginBottom: '16px',
          marginTop: 0,
        }}
      >
        {title}
      </h2>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="glass-card glass-card-sm"
            style={{ position: 'relative' }}
          >
            {/* Featured pin */}
            {item.featured && (
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '10px',
                  fontSize: '14px',
                  color: '#f59e0b',
                }}
                title="Pinned"
              >
                &#9733;
              </span>
            )}

            {/* Meta row: time + source */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--sm-text-muted)', fontWeight: 500 }}>
                {relativeTime(item.timestamp)}
              </span>
              {item.source_name && (
                <>
                  <span style={{ fontSize: '10px', color: 'var(--sm-text-muted)' }}>&middot;</span>
                  {item.source_url ? (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#bc0000', textDecoration: 'none', fontWeight: 500 }}
                    >
                      {item.source_name}
                    </a>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--sm-text-muted)', fontWeight: 500 }}>
                      {item.source_name}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Headline */}
            <h3
              style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--sm-text)',
                margin: '0 0 6px 0',
                lineHeight: 1.3,
              }}
            >
              {item.headline}
            </h3>

            {/* Summary */}
            <p style={{ fontSize: '14px', color: 'var(--sm-text-muted)', margin: '0 0 8px 0', lineHeight: 1.5 }}>
              {item.summary}
            </p>

            {/* What it means */}
            <div style={{ borderTop: '1px solid var(--sm-border, rgba(255,255,255,0.08))', paddingTop: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#bc0000',
                }}
              >
                What it means
              </span>
              <p style={{ fontSize: '13px', color: 'var(--sm-text-muted)', margin: '4px 0 0 0', lineHeight: 1.5 }}>
                {item.what_it_means}
              </p>
            </div>

            {/* Hub-specific meta tags */}
            {item.hub_meta && Object.keys(item.hub_meta).length > 0 && renderMeta(item.hub_meta, hubSlug)}
          </div>
        ))}
      </div>
    </section>
  )
}
