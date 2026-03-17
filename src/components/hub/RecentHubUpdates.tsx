import Link from 'next/link'
import { datalabAdmin } from '@/lib/supabase-datalab'
import type { HubItem, HubSlug } from '@/types/hub'

const HUB_LABELS: Record<HubSlug, string> = {
  'trade-rumors': 'Trade Rumors',
  'draft-tracker': 'Draft Tracker',
  'cap-tracker': 'Cap Tracker',
  'depth-chart': 'Depth Chart',
  'game-center': 'Game Center',
}

const HUB_COLORS: Record<HubSlug, string> = {
  'trade-rumors': '#BC0000',
  'draft-tracker': '#D6B05E',
  'cap-tracker': '#00D4FF',
  'depth-chart': '#0B0F14',
  'game-center': '#BC0000',
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface RecentHubUpdatesProps {
  teamSlug: string
}

export default async function RecentHubUpdates({ teamSlug }: RecentHubUpdatesProps) {
  let items: HubItem[] = []

  try {
    const { data } = await datalabAdmin
      .from('hub_items')
      .select('*')
      .eq('team_slug', teamSlug)
      .eq('status', 'published')
      .order('timestamp', { ascending: false })
      .limit(5)

    items = (data || []) as HubItem[]
  } catch {
    // Silently fail
  }

  if (items.length === 0) return null

  return (
    <section style={{ marginBottom: '8px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <h2 style={{
          color: 'var(--sm-text)',
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '-0.3px',
          margin: 0,
        }}>
          Latest Intel
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item) => {
          const hubLabel = HUB_LABELS[item.hub_slug] || item.hub_slug
          const hubColor = HUB_COLORS[item.hub_slug] || '#BC0000'
          const hubHref = `/${teamSlug}/${item.hub_slug}`

          return (
            <Link
              key={item.id}
              href={hubHref}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                className="glass-card glass-card-sm"
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                {/* Hub type indicator */}
                <div style={{
                  width: 4,
                  minHeight: 32,
                  borderRadius: 2,
                  background: hubColor,
                  flexShrink: 0,
                  marginTop: 2,
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Hub tag + time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      color: hubColor,
                    }}>
                      {hubLabel}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--sm-text-muted)' }}>
                      {relativeTime(item.timestamp)}
                    </span>
                  </div>

                  {/* Headline */}
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--sm-text)',
                    margin: 0,
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {item.headline}
                  </p>
                </div>

                {/* Arrow */}
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="var(--sm-text-muted)"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  style={{ flexShrink: 0, marginTop: 4 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
