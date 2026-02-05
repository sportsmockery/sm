'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AdPlacement {
  id: number
  name: string
  placement_type: string
  html_code: string
  css_code?: string
  is_active: boolean
  priority: number
  conditions?: {
    categories?: string[]
    exclude_categories?: string[]
    min_paragraph?: number
    max_posts_per_page?: number
    device_type?: 'all' | 'mobile' | 'desktop'
  }
  created_at: string
  updated_at: string
}

const PLACEMENT_TYPES = [
  { value: 'AFTER_FEATURED_IMAGE', label: 'After Featured Image', description: 'Below the featured image on single post pages' },
  { value: 'IN_CONTENT_PARAGRAPH_3', label: 'After Paragraph 3', description: 'After the 3rd paragraph in article content' },
  { value: 'IN_CONTENT_PARAGRAPH_5', label: 'After Paragraph 5', description: 'After the 5th paragraph in article content' },
  { value: 'IN_CONTENT_PARAGRAPH_8', label: 'After Paragraph 8', description: 'After the 8th paragraph in article content' },
  { value: 'HOMEPAGE_HERO', label: 'Homepage Hero', description: 'In the hero region of the homepage' },
  { value: 'HOMEPAGE_FEATURED', label: 'Homepage Featured', description: 'Between featured posts on homepage' },
  { value: 'HOMEPAGE_LATEST', label: 'Homepage Latest', description: 'Within the latest posts stream' },
  { value: 'SIDEBAR', label: 'Sidebar', description: 'In the sidebar widget area' },
  { value: 'FOOTER', label: 'Footer', description: 'Above the site footer' },
  { value: 'MOBILE_STICKY', label: 'Mobile Sticky', description: 'Sticky ad at bottom of mobile screens' },
]

const DEVICE_TYPES = [
  { value: 'all', label: 'All Devices' },
  { value: 'mobile', label: 'Mobile Only' },
  { value: 'desktop', label: 'Desktop Only' },
]

/**
 * Ad Inserter Admin Page
 *
 * Similar to WordPress Ad Inserter plugin:
 * - Add custom HTML/JavaScript ad code
 * - Choose placement location
 * - Set priority and conditions
 * - Enable/disable ads
 * - Preview functionality
 */
export default function AdInserterPage() {
  const [ads, setAds] = useState<AdPlacement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [editingAd, setEditingAd] = useState<AdPlacement | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    placement_type: 'AFTER_FEATURED_IMAGE',
    html_code: '',
    css_code: '',
    is_active: true,
    priority: 10,
    device_type: 'all',
    min_paragraph: 3,
  })

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/admin/ads')
      const data = await res.json()

      if (data.needsSetup) {
        setNeedsSetup(true)
      }

      setAds(data.ads || [])
    } catch (error) {
      console.error('Fetch ads error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        ...(editingAd ? { id: editingAd.id } : {}),
        name: formData.name,
        placement_type: formData.placement_type,
        html_code: formData.html_code,
        css_code: formData.css_code || null,
        is_active: formData.is_active,
        priority: formData.priority,
        conditions: {
          device_type: formData.device_type,
          min_paragraph: formData.min_paragraph,
        },
      }

      const res = await fetch('/api/admin/ads', {
        method: editingAd ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to save ad')

      await fetchAds()
      resetForm()
    } catch (error) {
      console.error('Save ad error:', error)
      alert('Failed to save ad placement')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ad placement?')) return

    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete ad')

      await fetchAds()
    } catch (error) {
      console.error('Delete ad error:', error)
      alert('Failed to delete ad placement')
    }
  }

  const handleEdit = (ad: AdPlacement) => {
    setEditingAd(ad)
    setIsCreating(true)
    setFormData({
      name: ad.name,
      placement_type: ad.placement_type,
      html_code: ad.html_code,
      css_code: ad.css_code || '',
      is_active: ad.is_active,
      priority: ad.priority,
      device_type: ad.conditions?.device_type || 'all',
      min_paragraph: ad.conditions?.min_paragraph || 3,
    })
  }

  const handleToggleActive = async (ad: AdPlacement) => {
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, is_active: !ad.is_active }),
      })

      if (!res.ok) throw new Error('Failed to update ad')

      await fetchAds()
    } catch (error) {
      console.error('Toggle ad error:', error)
    }
  }

  const resetForm = () => {
    setEditingAd(null)
    setIsCreating(false)
    setFormData({
      name: '',
      placement_type: 'AFTER_FEATURED_IMAGE',
      html_code: '',
      css_code: '',
      is_active: true,
      priority: 10,
      device_type: 'all',
      min_paragraph: 3,
    })
  }

  const handlePreview = () => {
    setPreviewHtml(formData.html_code)
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--accent-red)' }} />
            <span className="ml-3" style={{ color: 'var(--text-muted)' }}>Loading ad placements...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Ad Inserter</h1>
            <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
              Manage ad placements across your site - similar to WordPress Ad Inserter
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-lg px-4 py-2 text-sm hover:opacity-80 transition-opacity"
              style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            >
              Back to Admin
            </Link>
            {!isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--accent-red)' }}
              >
                + New Ad Placement
              </button>
            )}
          </div>
        </div>

        {/* Setup Notice */}
        {needsSetup && (
          <div className="mb-6 rounded-lg border border-yellow-600/50 bg-yellow-600/10 p-4">
            <h3 className="font-semibold text-yellow-400">Database Setup Required</h3>
            <p className="mt-1 text-sm text-yellow-200">
              The sm_ad_placements table needs to be created. Run this SQL in Supabase:
            </p>
            <pre className="mt-2 overflow-x-auto rounded p-3 text-xs" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
{`CREATE TABLE sm_ad_placements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  placement_type VARCHAR(100) NOT NULL,
  html_code TEXT NOT NULL,
  css_code TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 10,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_placements_type ON sm_ad_placements(placement_type);
CREATE INDEX idx_ad_placements_active ON sm_ad_placements(is_active);`}
            </pre>
          </div>
        )}

        {/* Create/Edit Form */}
        {isCreating && (
          <div className="mb-8 rounded-xl p-6" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-card)' }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editingAd ? 'Edit Ad Placement' : 'New Ad Placement'}
              </h2>
              <button
                onClick={resetForm}
                className="hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Ad Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Google AdSense - Sidebar"
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>

                {/* Placement Type */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Placement Location
                  </label>
                  <select
                    value={formData.placement_type}
                    onChange={(e) => setFormData({ ...formData, placement_type: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    {PLACEMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {PLACEMENT_TYPES.find(t => t.value === formData.placement_type)?.description}
                  </p>
                </div>
              </div>

              {/* HTML Code */}
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  HTML/JavaScript Code
                </label>
                <textarea
                  value={formData.html_code}
                  onChange={(e) => setFormData({ ...formData, html_code: e.target.value })}
                  placeholder={`<!-- Paste your ad code here -->\n<script async src="..."></script>\n<ins class="adsbygoogle" ...></ins>`}
                  rows={8}
                  className="w-full rounded-lg px-3 py-2 font-mono text-sm focus:outline-none"
                  style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  required
                />
              </div>

              {/* CSS Code (Optional) */}
              <div>
                <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Custom CSS (Optional)
                </label>
                <textarea
                  value={formData.css_code}
                  onChange={(e) => setFormData({ ...formData, css_code: e.target.value })}
                  placeholder={`.ad-container { margin: 20px 0; text-align: center; }`}
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 font-mono text-sm focus:outline-none"
                  style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                {/* Priority */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Priority
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 10 })}
                    min={1}
                    max={100}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  />
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Lower = higher priority</p>
                </div>

                {/* Device Type */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Device Type
                  </label>
                  <select
                    value={formData.device_type}
                    onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none"
                    style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    {DEVICE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Paragraph (for in-content ads) */}
                {formData.placement_type.startsWith('IN_CONTENT') && (
                  <div>
                    <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Min Paragraphs Required
                    </label>
                    <input
                      type="number"
                      value={formData.min_paragraph}
                      onChange={(e) => setFormData({ ...formData, min_paragraph: parseInt(e.target.value) || 3 })}
                      min={1}
                      max={20}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                )}

                {/* Active Toggle */}
                <div>
                  <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Status
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-tertiary)' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: 'var(--accent-red)' }}
                    />
                    <span style={{ color: 'var(--text-primary)' }}>Active</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg px-6 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: 'var(--accent-red)' }}
                >
                  {saving ? 'Saving...' : editingAd ? 'Update Ad' : 'Create Ad'}
                </button>
                <button
                  type="button"
                  onClick={handlePreview}
                  className="rounded-lg px-4 py-2 hover:opacity-80 transition-opacity"
                  style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                >
                  Preview
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Preview Modal */}
        {previewHtml && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-2xl rounded-xl p-6" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-card)' }}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Ad Preview</h3>
                <button
                  onClick={() => setPreviewHtml(null)}
                  className="hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Close
                </button>
              </div>
              <div className="rounded-lg bg-white p-4" style={{ border: '1px solid var(--border-default)' }}>
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                Note: Some ad scripts may not render correctly in preview mode.
              </p>
            </div>
          </div>
        )}

        {/* Ad Placements List */}
        <div className="rounded-xl" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-card)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Active Ad Placements</h2>
          </div>

          {ads.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
              No ad placements yet. Click "New Ad Placement" to create one.
            </div>
          ) : (
            <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {ads.map((ad, index) => (
                <div key={ad.id} className="flex items-center justify-between p-4" style={{ borderTop: index > 0 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleActive(ad)}
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: ad.is_active ? '#22c55e' : 'var(--text-muted)' }}
                      title={ad.is_active ? 'Active - Click to disable' : 'Disabled - Click to enable'}
                    />
                    <div>
                      <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{ad.name}</h3>
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span className="rounded px-2 py-0.5 text-xs" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          {PLACEMENT_TYPES.find(t => t.value === ad.placement_type)?.label || ad.placement_type}
                        </span>
                        <span>Priority: {ad.priority}</span>
                        {ad.conditions?.device_type && ad.conditions.device_type !== 'all' && (
                          <span className="rounded px-2 py-0.5 text-xs" style={{ backgroundColor: 'var(--bg-hover)' }}>
                            {ad.conditions.device_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="rounded px-3 py-1 text-sm hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="rounded px-3 py-1 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 rounded-xl p-6" style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-card)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>How to Use Ad Inserter</h3>
          <div className="grid grid-cols-2 gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Supported Placements:</h4>
              <ul className="space-y-1">
                <li>- After Featured Image (single posts)</li>
                <li>- After Paragraph 3, 5, or 8 (in-content)</li>
                <li>- Homepage Hero, Featured, Latest sections</li>
                <li>- Sidebar and Footer areas</li>
                <li>- Mobile Sticky (bottom of mobile screens)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Tips:</h4>
              <ul className="space-y-1">
                <li>- Use lower priority numbers for higher priority ads</li>
                <li>- Test ads on staging before enabling</li>
                <li>- Use device targeting to optimize ad experience</li>
                <li>- In-content ads require minimum paragraph count</li>
                <li>- Custom CSS helps with ad styling and spacing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
