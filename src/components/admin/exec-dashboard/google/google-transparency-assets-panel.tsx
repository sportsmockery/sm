'use client'

// Surface for /about, author pages, contact, publisher identity, editorial
// policy, and disclosure assets. Reads scored rows from
// google_transparency_assets via the Google tab payload.

import React, { useMemo, useState } from 'react'
import type { TransparencyAsset, TransparencyAssetEvaluation, GoogleTabPayload } from '@/lib/google/types'

const C = { cyan: '#00D4FF', red: '#BC0000', gold: '#D6B05E' }

const TYPE_LABEL: Record<TransparencyAsset['assetType'], string> = {
  about_page:           'About',
  author_page:          'Author',
  contact_page:         'Contact',
  publisher_identity:   'Publisher',
  editorial_policy_page:'Editorial Policy',
  disclosure_page:      'Disclosure',
}

export function GoogleTransparencyAssetsPanel({ data }: { data: GoogleTabPayload }) {
  const { transparencyAssets, transparencyEvaluations, siteTrust } = data
  const [openAssetId, setOpenAssetId] = useState<string | null>(null)
  const [filter, setFilter] = useState<TransparencyAsset['assetType'] | 'all'>('all')

  const visible = useMemo(
    () => filter === 'all' ? transparencyAssets : transparencyAssets.filter((a) => a.assetType === filter),
    [transparencyAssets, filter],
  )
  const types = useMemo(() => Array.from(new Set(transparencyAssets.map((a) => a.assetType))), [transparencyAssets])
  const evalsByAsset = useMemo(() => {
    const m = new Map<string, TransparencyAssetEvaluation[]>()
    for (const e of transparencyEvaluations) {
      const arr = m.get(e.assetId) ?? []
      arr.push(e)
      m.set(e.assetId, arr)
    }
    return m
  }, [transparencyEvaluations])

  return (
    <div className="rounded-lg border" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--sm-border)' }}>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>Transparency Assets</h3>
          <span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>
            {transparencyAssets.length} assets · site trust {siteTrust.siteTransparencyScore.toFixed(1)} / 15
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill active={filter === 'all'} onClick={() => setFilter('all')} label="all" />
          {types.map((t) => (
            <Pill key={t} active={filter === t} onClick={() => setFilter(t)} label={TYPE_LABEL[t]} />
          ))}
        </div>
      </div>

      {/* Composition tiles ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-b" style={{ borderColor: 'var(--sm-border)' }}>
        <Tile label="About / 100"           value={`${siteTrust.aboutScore}`}            tone={tone100(siteTrust.aboutScore)} />
        <Tile label="Avg Author Page / 100" value={`${siteTrust.avgAuthorPageScore}`}    tone={tone100(siteTrust.avgAuthorPageScore)} />
        <Tile label="Site Transparency /15" value={`${siteTrust.siteTransparencyScore.toFixed(1)}`} tone={tone15(siteTrust.siteTransparencyScore)} />
        <Tile label="Assets scored"         value={`${siteTrust.assetsScored}`} />
      </div>

      {/* Asset table ───────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <Th>Type</Th>
              <Th>Asset</Th>
              <Th>URL</Th>
              <Th align="right">Score</Th>
              <Th align="right">Findings</Th>
              <Th align="right">Recs</Th>
              <Th align="right">Last evaluated</Th>
              <Th align="center">Status</Th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--sm-text-dim)' }}>No transparency assets match the current filter.</td></tr>
            )}
            {visible.map((a) => {
              const isOpen = openAssetId === a.id
              const evs = evalsByAsset.get(a.id) ?? []
              return (
                <React.Fragment key={a.id}>
                  <tr className="transition-colors cursor-pointer" style={{ borderBottom: '1px solid var(--sm-border)' }}
                      onClick={() => setOpenAssetId(isOpen ? null : a.id)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sm-card-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <Td>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--sm-text-dim)' }}>
                        {TYPE_LABEL[a.assetType]}
                      </span>
                    </Td>
                    <Td><span className="font-medium" style={{ color: 'var(--sm-text)' }}>{a.label}</span></Td>
                    <Td>
                      <a href={a.url} target="_blank" rel="noreferrer noopener" onClick={(e) => e.stopPropagation()}
                         className="text-[12px] font-mono truncate inline-block" style={{ color: C.cyan, maxWidth: 320 }}>
                        {a.url}
                      </a>
                    </Td>
                    <Td align="right"><strong style={{ color: tone100(a.total) }}>{a.total}</strong></Td>
                    <Td align="right"><span className="tabular-nums" style={{ color: a.findingsCount > 0 ? C.gold : 'var(--sm-text)' }}>{a.findingsCount}</span></Td>
                    <Td align="right"><span className="tabular-nums" style={{ color: a.recommendationCount > 0 ? C.red : 'var(--sm-text)' }}>{a.recommendationCount}</span></Td>
                    <Td align="right" muted>{relTime(a.lastEvaluatedAt)}</Td>
                    <Td align="center"><StatusDot status={a.status} /></Td>
                  </tr>
                  {isOpen && (
                    <tr style={{ background: 'var(--sm-surface)', borderBottom: '1px solid var(--sm-border)' }}>
                      <td colSpan={8} className="px-4 py-3">
                        {evs.length === 0 ? (
                          <p className="text-sm" style={{ color: 'var(--sm-text-dim)' }}>No non-passing evaluations recorded for this asset.</p>
                        ) : (
                          <ul className="space-y-2">
                            {evs.map((ev) => (
                              <li key={ev.id} className="flex items-start gap-3">
                                <StatusBadge status={ev.status} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-[12px]" style={{ color: 'var(--sm-text)' }}>{ev.ruleId}</span>
                                    {ev.impactedField && (
                                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.08)', color: C.cyan }}>
                                        {ev.impactedField}
                                      </span>
                                    )}
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: bgForSource(ev.sourceType), color: fgForSource(ev.sourceType) }}>
                                      {labelForSource(ev.sourceType)}
                                    </span>
                                    <span className="text-[10px] tabular-nums ml-auto" style={{ color: 'var(--sm-text-dim)' }}>
                                      conf {(ev.confidence * 100).toFixed(0)}%
                                    </span>
                                  </div>
                                  <p className="text-sm mt-1" style={{ color: 'var(--sm-text-muted)' }}>{ev.explanation}</p>
                                  {ev.remediation && (
                                    <p className="text-sm mt-1 italic" style={{ color: C.cyan }}>→ {ev.remediation}</p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── primitives ──────────────────────────────────────────────────────────────
function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return <th className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'}`} style={{ color: 'var(--sm-text-dim)' }}>{children}</th>
}
function Td({ children, align = 'left', muted }: { children: React.ReactNode; align?: 'left' | 'right' | 'center'; muted?: boolean }) {
  return <td className={`px-3 py-2.5 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} tabular-nums`} style={{ color: muted ? 'var(--sm-text-muted)' : 'var(--sm-text)' }}>{children}</td>
}
function Tile({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-lg border p-3" style={{ background: 'var(--sm-surface)', borderColor: 'var(--sm-border)' }}>
      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--sm-text-dim)' }}>{label}</p>
      <p className="mt-1 text-base font-extrabold tabular-nums" style={{ color: tone ?? 'var(--sm-text)' }}>{value}</p>
    </div>
  )
}
function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors"
      style={{
        background: active ? 'rgba(188,0,0,0.12)' : 'transparent',
        color: active ? 'var(--sm-red-light)' : 'var(--sm-text-dim)',
        border: '1px solid var(--sm-border)',
      }}>
      {label}
    </button>
  )
}
function StatusDot({ status }: { status: 'green' | 'amber' | 'red' }) {
  const m = { green: '#00D4FF', amber: C.gold, red: C.red }
  return <span className="inline-block w-2 h-2 rounded-full" style={{ background: m[status] }} />
}
function StatusBadge({ status }: { status: TransparencyAssetEvaluation['status'] }) {
  const m: Record<TransparencyAssetEvaluation['status'], { label: string; bg: string; fg: string }> = {
    pass:           { label: 'PASS', bg: 'rgba(0,212,255,0.12)', fg: C.cyan },
    warn:           { label: 'WARN', bg: 'rgba(214,176,94,0.12)', fg: C.gold },
    fail:           { label: 'FAIL', bg: 'rgba(188,0,0,0.12)',   fg: C.red },
    not_applicable: { label: 'N/A',  bg: 'rgba(255,255,255,0.04)', fg: 'var(--sm-text-dim)' },
  }
  const v = m[status]
  return <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded" style={{ background: v.bg, color: v.fg, minWidth: 48, textAlign: 'center' }}>{v.label}</span>
}
function bgForSource(s: string): string { return s === 'official-policy' ? 'rgba(0,212,255,0.12)' : s === 'internal-heuristic' ? 'rgba(214,176,94,0.12)' : 'rgba(188,0,0,0.12)' }
function fgForSource(s: string): string { return s === 'official-policy' ? C.cyan : s === 'internal-heuristic' ? C.gold : C.red }
function labelForSource(s: string): string { return s === 'official-policy' ? 'Policy' : s === 'internal-heuristic' ? 'Heuristic' : 'SM' }
function tone100(v: number): string { if (v >= 80) return '#00D4FF'; if (v >= 60) return C.gold; return C.red }
function tone15(v: number): string  { if (v >= 12) return '#00D4FF'; if (v >= 9)  return C.gold; return C.red }
function relTime(iso: string | null): string {
  if (!iso) return '—'
  const s = Math.floor((Date.now() - Date.parse(iso)) / 1000)
  if (Number.isNaN(s)) return '—'
  if (s < 60)    return 'just now'
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
