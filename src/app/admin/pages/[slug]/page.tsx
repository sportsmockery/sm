'use client'

import { use } from 'react'
import Link from 'next/link'
import { getPageBySlug, getPagesByCategory, getCategoryConfig, getCronJobById } from '@/lib/page-registry'

export default function AdminPageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const page = getPageBySlug(slug)

  if (!page) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          All Pages
        </Link>
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)]">Page not found: {slug}</p>
        </div>
      </div>
    )
  }

  const catConfig = getCategoryConfig(page.category)
  const cronJobs = page.cronJobs.map(getCronJobById).filter(Boolean)
  const relatedPages = getPagesByCategory(page.category)
    .filter(p => p.slug !== page.slug)
    .filter(p => (page.team ? p.team === page.team : true))
    .slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/pages"
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          All Pages
        </Link>
        <svg className="h-3 w-3 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-[var(--text-primary)] font-medium">{page.name}</span>
      </div>

      {/* Overview Card */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{page.name}</h1>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: catConfig.color + '20', color: catConfig.color }}
              >
                {catConfig.label}
              </span>
            </div>
            <code className="text-sm text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-1 rounded font-mono">
              {page.route}
            </code>
            <p className="text-sm text-[var(--text-secondary)] mt-3">{page.description}</p>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {page.requiresAdmin && (
            <Badge color="#ef4444" label="Admin Only" />
          )}
          {page.requiresAuth && !page.requiresAdmin && (
            <Badge color="#eab308" label="Auth Required" />
          )}
          {page.isDynamic && (
            <Badge color="#a855f7" label="Dynamic Route" />
          )}
          {page.sport && (
            <Badge color="#3b82f6" label={page.sport} />
          )}
          {page.team && (
            <Badge color="#22c55e" label={page.team} />
          )}
        </div>
      </div>

      {/* Data Sources */}
      {page.dataSources.length > 0 && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-default)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Data Sources ({page.dataSources.length})
            </h2>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {page.dataSources.map((ds, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-4">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
                  style={{
                    backgroundColor:
                      ds.type === 'supabase-table' ? '#3b82f620' :
                      ds.type === 'api-route' ? '#22c55e20' :
                      '#f59e0b20',
                    color:
                      ds.type === 'supabase-table' ? '#60a5fa' :
                      ds.type === 'api-route' ? '#4ade80' :
                      '#fbbf24',
                  }}
                >
                  {ds.type === 'supabase-table' ? 'table' : ds.type === 'api-route' ? 'api' : 'external'}
                </span>
                <div className="flex-1 min-w-0">
                  <code className="text-sm font-mono text-[var(--text-primary)]">{ds.name}</code>
                  {ds.description && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{ds.description}</p>
                  )}
                </div>
                {ds.database && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] shrink-0">
                    {ds.database}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cron Jobs */}
      {cronJobs.length > 0 && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-default)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Cron Jobs ({cronJobs.length})
            </h2>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {cronJobs.map(cron => cron && (
              <div key={cron.id} className="px-4 py-3">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{cron.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 font-mono">
                    {cron.humanSchedule}
                  </span>
                  {cron.schedule && (
                    <code className="text-[10px] text-[var(--text-muted)] font-mono">{cron.schedule}</code>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)]">{cron.description}</p>
                <code className="text-xs text-[var(--text-muted)] font-mono mt-1 block">{cron.path}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Files */}
      {page.keyFiles.length > 0 && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-default)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Key Files ({page.keyFiles.length})
            </h2>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {page.keyFiles.map((file, i) => (
              <div key={i} className="px-4 py-2.5">
                <code className="text-sm font-mono text-[var(--text-secondary)]">{file}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Components */}
      {page.keyComponents.length > 0 && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-default)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Key Components ({page.keyComponents.length})
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 p-4">
            {page.keyComponents.map((comp, i) => (
              <code
                key={i}
                className="text-xs font-mono px-2 py-1 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
              >
                {comp}
              </code>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {page.notes && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
          <h2 className="text-sm font-semibold text-yellow-400 mb-1">Notes</h2>
          <p className="text-sm text-[var(--text-secondary)]">{page.notes}</p>
        </div>
      )}

      {/* Related Pages */}
      {relatedPages.length > 0 && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-default)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Related Pages ({relatedPages.length})
            </h2>
          </div>
          <div className="divide-y divide-[var(--border-default)]">
            {relatedPages.map(related => (
              <Link
                key={related.slug}
                href={`/admin/pages/${related.slug}`}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--text-primary)]">{related.name}</span>
                  <code className="text-xs text-[var(--text-muted)] font-mono">{related.route}</code>
                </div>
                <svg
                  className="h-3 w-3 text-[var(--text-muted)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: color + '20', color }}
    >
      {label}
    </span>
  )
}
