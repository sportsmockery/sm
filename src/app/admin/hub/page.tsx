'use client'

import { useState, useEffect } from 'react'
import type { HubItem, HubSlug, HubItemFormData } from '@/types/hub'
import { HUB_PAGES, TEAM_OPTIONS } from '@/types/hub'

const DEFAULT_TEAM = 'chicago-bears'

const EMPTY_FORM: HubItemFormData = {
  team_slug: DEFAULT_TEAM,
  hub_slug: 'trade-rumors',
  status: 'draft',
  headline: '',
  timestamp: '',
  source_name: '',
  source_url: '',
  summary: '',
  what_it_means: '',
  featured: false,
  hub_meta: {},
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function AdminHubPage() {
  const [items, setItems] = useState<HubItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [search, setSearch] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<string>('chicago-bears')
  const [selectedHub, setSelectedHub] = useState<HubSlug>('trade-rumors')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<HubItemFormData>({ ...EMPTY_FORM })

  useEffect(() => {
    fetchItems()
  }, [selectedHub, selectedTeam, filter])

  async function fetchItems() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        team_slug: selectedTeam,
        hub_slug: selectedHub,
      })
      if (filter !== 'all') params.set('status', filter)
      const res = await fetch(`/api/hub?${params}`)
      const data = await res.json()
      setItems(data.items || [])
    } catch (err) {
      console.error('Error fetching hub items:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleNewItem() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, team_slug: selectedTeam as any, hub_slug: selectedHub, timestamp: new Date().toISOString().slice(0, 16) })
    setShowForm(true)
  }

  function handleEdit(item: HubItem) {
    setEditingId(item.id)
    setForm({
      team_slug: item.team_slug,
      hub_slug: item.hub_slug,
      status: item.status,
      headline: item.headline,
      timestamp: item.timestamp ? new Date(item.timestamp).toISOString().slice(0, 16) : '',
      source_name: item.source_name || '',
      source_url: item.source_url || '',
      summary: item.summary,
      what_it_means: item.what_it_means,
      featured: item.featured,
      hub_meta: item.hub_meta || {},
    })
    setShowForm(true)
  }

  async function handleSave(asStatus: 'draft' | 'published') {
    try {
      setSaving(true)
      const payload = {
        ...form,
        status: asStatus,
        timestamp: form.timestamp ? new Date(form.timestamp).toISOString() : new Date().toISOString(),
      }

      const method = editingId ? 'PUT' : 'POST'
      const body = editingId ? { id: editingId, ...payload } : payload

      const res = await fetch('/api/hub', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setShowForm(false)
        setEditingId(null)
        setForm({ ...EMPTY_FORM })
        fetchItems()
      }
    } catch (err) {
      console.error('Error saving hub item:', err)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this hub item?')) return
    try {
      await fetch(`/api/hub?id=${id}`, { method: 'DELETE' })
      fetchItems()
    } catch (err) {
      console.error('Error deleting hub item:', err)
    }
  }

  async function handleToggleFeatured(id: string, featured: boolean) {
    try {
      await fetch('/api/hub/featured', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, featured: !featured }),
      })
      fetchItems()
    } catch (err) {
      console.error('Error toggling featured:', err)
    }
  }

  async function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    try {
      await fetch('/api/hub/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      fetchItems()
    } catch (err) {
      console.error('Error toggling status:', err)
    }
  }

  function updateMeta(key: string, value: string) {
    setForm(prev => ({ ...prev, hub_meta: { ...prev.hub_meta, [key]: value } }))
  }

  const filteredItems = items.filter(item =>
    !search || item.headline.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading, "Space Grotesk", sans-serif)' }}>Hub</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Create hub updates for team pages.</p>
      </div>

      {/* Controls Row 1: Team + Hub Page */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          value={selectedTeam}
          onChange={e => setSelectedTeam(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 8, fontSize: 14,
            background: 'var(--bg-card)', color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
          }}
        >
          {TEAM_OPTIONS.map(t => (
            <option key={t.slug} value={t.slug}>{t.label}</option>
          ))}
        </select>

        <select
          value={selectedHub}
          onChange={e => setSelectedHub(e.target.value as HubSlug)}
          style={{
            padding: '8px 12px', borderRadius: 8, fontSize: 14,
            background: 'var(--bg-card)', color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
          }}
        >
          {HUB_PAGES.map(h => (
            <option key={h.slug} value={h.slug}>{h.label}</option>
          ))}
        </select>

        <button
          onClick={handleNewItem}
          style={{
            marginLeft: 'auto', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            backgroundColor: '#bc0000', color: '#fff', border: 'none', cursor: 'pointer',
          }}
        >
          + New Update
        </button>
      </div>

      {/* Controls Row 2: Filters + Search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['all', 'published', 'draft'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              border: filter === f ? '1px solid #bc0000' : '1px solid var(--border-default)',
              backgroundColor: filter === f ? 'rgba(188, 0, 0, 0.1)' : 'transparent',
              color: filter === f ? '#bc0000' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search headlines..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            marginLeft: 'auto', padding: '7px 14px', borderRadius: 8, fontSize: 13,
            background: 'var(--bg-card)', color: 'var(--text-primary)',
            border: '1px solid var(--border-default)', width: 220,
          }}
        />
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          borderRadius: 12, padding: 24, marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
            {editingId ? 'Edit Update' : 'New Update'}
          </h2>

          <div style={{ display: 'grid', gap: 14 }}>
            {/* Headline */}
            <div>
              <label style={labelStyle}>Headline *</label>
              <input
                type="text"
                value={form.headline}
                onChange={e => setForm(prev => ({ ...prev, headline: e.target.value }))}
                placeholder="E.g., Bears exploring trade for veteran pass rusher"
                style={inputStyle}
              />
            </div>

            {/* Timestamp + Source row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Timestamp</label>
                <input
                  type="datetime-local"
                  value={form.timestamp}
                  onChange={e => setForm(prev => ({ ...prev, timestamp: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Source Name</label>
                <input
                  type="text"
                  value={form.source_name}
                  onChange={e => setForm(prev => ({ ...prev, source_name: e.target.value }))}
                  placeholder="E.g., Adam Schefter, ESPN"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Source URL</label>
                <input
                  type="url"
                  value={form.source_url}
                  onChange={e => setForm(prev => ({ ...prev, source_url: e.target.value }))}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label style={labelStyle}>Summary *</label>
              <textarea
                value={form.summary}
                onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="What happened — the facts of the update"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* What It Means */}
            <div>
              <label style={labelStyle}>What It Means *</label>
              <textarea
                value={form.what_it_means}
                onChange={e => setForm(prev => ({ ...prev, what_it_means: e.target.value }))}
                placeholder="Analysis — why this matters for the team"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Hub-specific meta fields */}
            <HubMetaFields hubSlug={form.hub_slug} meta={form.hub_meta} updateMeta={updateMeta} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  backgroundColor: 'var(--bg-hover)', color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)', cursor: 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  backgroundColor: '#bc0000', color: '#fff', border: 'none', cursor: 'pointer',
                }}
              >
                {saving ? 'Publishing...' : 'Publish'}
              </button>
              <button
                onClick={() => { setShowForm(false); setEditingId(null) }}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 14,
                  backgroundColor: 'transparent', color: 'var(--text-muted)',
                  border: '1px solid var(--border-default)', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 40, color: 'var(--text-muted)',
          background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-default)',
        }}>
          No hub items found. Create one to get started.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                background: 'var(--bg-card)', borderRadius: 10,
                border: '1px solid var(--border-default)',
              }}
            >
              {/* Featured indicator */}
              <button
                onClick={() => handleToggleFeatured(item.id, item.featured)}
                title={item.featured ? 'Unpin' : 'Pin to top'}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0,
                  color: item.featured ? '#f59e0b' : 'var(--text-muted)', opacity: item.featured ? 1 : 0.4,
                }}
              >
                &#9733;
              </button>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.headline}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {formatDate(item.timestamp)}
                  {item.author_name && <> &middot; {item.author_name}</>}
                </div>
              </div>

              {/* Status Badge */}
              <span style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                backgroundColor: item.status === 'published' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                color: item.status === 'published' ? '#16a34a' : '#ca8a04',
              }}>
                {item.status}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => handleToggleStatus(item.id, item.status)}
                  style={actionBtnStyle}
                  title={item.status === 'published' ? 'Unpublish' : 'Publish'}
                >
                  {item.status === 'published' ? '⬇' : '⬆'}
                </button>
                <button onClick={() => handleEdit(item)} style={actionBtnStyle} title="Edit">
                  ✎
                </button>
                <button onClick={() => handleDelete(item.id)} style={{ ...actionBtnStyle, color: '#dc2626' }} title="Delete">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
  marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 14,
  background: 'var(--bg-primary)', color: 'var(--text-primary)',
  border: '1px solid var(--border-default)',
}

const actionBtnStyle: React.CSSProperties = {
  padding: '4px 8px', borderRadius: 6, fontSize: 14,
  background: 'var(--bg-hover)', color: 'var(--text-secondary)',
  border: '1px solid var(--border-default)', cursor: 'pointer',
}

function HubMetaFields({ hubSlug, meta, updateMeta }: {
  hubSlug: HubSlug
  meta: Record<string, unknown>
  updateMeta: (key: string, value: string) => void
}) {
  const m = (key: string) => (meta[key] as string) || ''

  if (hubSlug === 'trade-rumors') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Player Name</label>
          <input type="text" value={m('playerName')} onChange={e => updateMeta('playerName', e.target.value)} placeholder="E.g., Khalil Mack" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Position</label>
          <select value={m('position')} onChange={e => updateMeta('position', e.target.value)} style={inputStyle}>
            <option value="">Select...</option>
            {['QB','RB','WR','TE','OL','DL','EDGE','LB','CB','S','K','P'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Other Team</label>
          <input type="text" value={m('otherTeam')} onChange={e => updateMeta('otherTeam', e.target.value)} placeholder="E.g., Las Vegas Raiders" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Estimated Cost</label>
          <input type="text" value={m('estimatedCost')} onChange={e => updateMeta('estimatedCost', e.target.value)} placeholder="E.g., 2nd round pick" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Cap Impact</label>
          <input type="text" value={m('capImpact')} onChange={e => updateMeta('capImpact', e.target.value)} placeholder="E.g., $12M/year" style={inputStyle} />
        </div>
      </div>
    )
  }

  if (hubSlug === 'draft-tracker') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Prospect Name</label>
          <input type="text" value={m('prospectName')} onChange={e => updateMeta('prospectName', e.target.value)} placeholder="E.g., Travis Hunter" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Position</label>
          <select value={m('position')} onChange={e => updateMeta('position', e.target.value)} style={inputStyle}>
            <option value="">Select...</option>
            {['QB','RB','WR','TE','OL','DL','EDGE','LB','CB','S','K','P'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>College</label>
          <input type="text" value={m('college')} onChange={e => updateMeta('college', e.target.value)} placeholder="E.g., Colorado" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Projected Round</label>
          <input type="text" value={m('projectedRound')} onChange={e => updateMeta('projectedRound', e.target.value)} placeholder="E.g., 1st" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Pick Range</label>
          <input type="text" value={m('pickRange')} onChange={e => updateMeta('pickRange', e.target.value)} placeholder="E.g., Top 10" style={inputStyle} />
        </div>
      </div>
    )
  }

  if (hubSlug === 'cap-tracker') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Player Name</label>
          <input type="text" value={m('playerName')} onChange={e => updateMeta('playerName', e.target.value)} placeholder="E.g., Jaylon Johnson" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Move Type</label>
          <select value={m('moveType')} onChange={e => updateMeta('moveType', e.target.value)} style={inputStyle}>
            <option value="">Select...</option>
            {['restructure','extension','cut','signing','trade'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Cap Change</label>
          <input type="text" value={m('capChange')} onChange={e => updateMeta('capChange', e.target.value)} placeholder="E.g., -$5.2M" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Year Impacted</label>
          <input type="text" value={m('yearImpacted')} onChange={e => updateMeta('yearImpacted', e.target.value)} placeholder="E.g., 2026" style={inputStyle} />
        </div>
      </div>
    )
  }

  if (hubSlug === 'depth-chart') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Position Group</label>
          <select value={m('positionGroup')} onChange={e => updateMeta('positionGroup', e.target.value)} style={inputStyle}>
            <option value="">Select...</option>
            {['Offense','Defense','Special Teams','QB','RB','WR','TE','OL','DL','LB','DB'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Players Involved</label>
          <input type="text" value={m('playersInvolved')} onChange={e => updateMeta('playersInvolved', e.target.value)} placeholder="E.g., Caleb Williams, Tyson Bagent" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select value={m('status')} onChange={e => updateMeta('status', e.target.value)} style={inputStyle}>
            <option value="">Select...</option>
            {['starter','backup','injured','questionable','out','IR'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>
    )
  }

  if (hubSlug === 'game-center') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Opponent</label>
          <input type="text" value={m('opponent')} onChange={e => updateMeta('opponent', e.target.value)} placeholder="E.g., Green Bay Packers" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Game Date</label>
          <input type="date" value={m('date')} onChange={e => updateMeta('date', e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Note Type</label>
          <select value={m('noteType')} onChange={e => updateMeta('noteType', e.target.value)} style={inputStyle}>
            <option value="">Select...</option>
            {['preview','in-game','postgame','injury','matchup'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
      </div>
    )
  }

  return null
}
