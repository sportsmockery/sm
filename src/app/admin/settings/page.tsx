'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface Settings {
  site_name: string
  site_description: string
  logo_url: string
  favicon_url: string
  meta_title_template: string
  meta_description: string
  google_analytics_id: string
  sitemap_enabled: boolean
  robots_txt: string
  twitter_handle: string
  facebook_page: string
  instagram_handle: string
  youtube_channel: string
  default_share_image: string
}

const defaultSettings: Settings = {
  site_name: '',
  site_description: '',
  logo_url: '',
  favicon_url: '',
  meta_title_template: '%title% | %site_name%',
  meta_description: '',
  google_analytics_id: '',
  sitemap_enabled: true,
  robots_txt: 'User-agent: *\nAllow: /',
  twitter_handle: '',
  facebook_page: '',
  instagram_handle: '',
  youtube_channel: '',
  default_share_image: ''
}

const tabs = [
  {
    id: 'general',
    label: 'General',
    description: 'Site name, logo, and branding',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    id: 'seo',
    label: 'SEO',
    description: 'Meta tags, analytics, and sitemap',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    )
  },
  {
    id: 'social',
    label: 'Social',
    description: 'Social media profiles and sharing',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
      </svg>
    )
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Cache, performance, and danger zone',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    )
  }
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = useCallback(async (updates: Partial<Settings>) => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, ...updates })
      })

      if (!res.ok) throw new Error('Failed to save')

      const data = await res.json()
      setSettings(data)
      setSaved(true)
      setHasChanges(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }, [settings])

  const handleChange = (field: keyof Settings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--bg-tertiary)]" />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--bg-tertiary)]" />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-xl bg-[var(--bg-tertiary)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            Manage your site configuration and preferences
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-emerald-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="text-sm font-medium">Settings saved</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar Navigation */}
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full rounded-xl p-4 text-left transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--accent-red)] text-white shadow-lg shadow-red-500/20'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={activeTab === tab.id ? 'text-white' : 'text-[var(--text-muted)]'}>
                  {tab.icon}
                </div>
                <div>
                  <p className="font-medium">{tab.label}</p>
                  <p className={`text-xs ${activeTab === tab.id ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                    {tab.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'general' && (
            <GeneralTab settings={settings} onChange={handleChange} onSave={saveSettings} saving={saving} hasChanges={hasChanges} />
          )}

          {activeTab === 'seo' && (
            <SEOTab settings={settings} onChange={handleChange} onSave={saveSettings} saving={saving} hasChanges={hasChanges} />
          )}

          {activeTab === 'social' && (
            <SocialTab settings={settings} onChange={handleChange} onSave={saveSettings} saving={saving} hasChanges={hasChanges} />
          )}

          {activeTab === 'advanced' && (
            <AdvancedTab />
          )}
        </div>
      </div>
    </div>
  )
}

// General Settings Tab
function GeneralTab({
  settings,
  onChange,
  onSave,
  saving,
  hasChanges
}: {
  settings: Settings
  onChange: (field: keyof Settings, value: string | boolean) => void
  onSave: (updates: Partial<Settings>) => void
  saving: boolean
  hasChanges: boolean
}) {
  return (
    <>
      {/* Site Information */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Site Information</h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">Basic details about your website</p>
        </div>
        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              Site Name
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => onChange('site_name', e.target.value)}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
              placeholder="Sports Mockery"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              Site Description
            </label>
            <textarea
              value={settings.site_description}
              onChange={(e) => onChange('site_description', e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
              placeholder="Chicago's home for irreverent sports commentary"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Branding</h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">Logo and favicon for your site</p>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              Logo URL
            </label>
            <input
              type="url"
              value={settings.logo_url}
              onChange={(e) => onChange('logo_url', e.target.value)}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
              placeholder="https://example.com/logo.png"
            />
            {settings.logo_url && (
              <div className="mt-3 inline-flex rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-3">
                <Image
                  src={settings.logo_url}
                  alt="Logo preview"
                  width={150}
                  height={50}
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              Favicon URL
            </label>
            <input
              type="url"
              value={settings.favicon_url}
              onChange={(e) => onChange('favicon_url', e.target.value)}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
              placeholder="https://example.com/favicon.ico"
            />
            {settings.favicon_url && (
              <div className="mt-3 inline-flex rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-3">
                <Image
                  src={settings.favicon_url}
                  alt="Favicon preview"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => onSave({
            site_name: settings.site_name,
            site_description: settings.site_description,
            logo_url: settings.logo_url,
            favicon_url: settings.favicon_url
          })}
          disabled={saving || !hasChanges}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] px-6 py-2.5 font-medium text-white transition-all hover:bg-[var(--accent-red-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>
    </>
  )
}

// SEO Settings Tab
function SEOTab({
  settings,
  onChange,
  onSave,
  saving,
  hasChanges
}: {
  settings: Settings
  onChange: (field: keyof Settings, value: string | boolean) => void
  onSave: (updates: Partial<Settings>) => void
  saving: boolean
  hasChanges: boolean
}) {
  return (
    <>
      {/* Meta Tags */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Meta Tags</h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">Default meta information for SEO</p>
        </div>
        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              Meta Title Template
            </label>
            <input
              type="text"
              value={settings.meta_title_template}
              onChange={(e) => onChange('meta_title_template', e.target.value)}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
              placeholder="%title% | %site_name%"
            />
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
              Use <code className="rounded bg-[var(--bg-tertiary)] px-1.5 py-0.5">%title%</code> for page title and <code className="rounded bg-[var(--bg-tertiary)] px-1.5 py-0.5">%site_name%</code> for site name
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              Default Meta Description
            </label>
            <textarea
              value={settings.meta_description}
              onChange={(e) => onChange('meta_description', e.target.value)}
              rows={3}
              maxLength={160}
              className="w-full resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
              placeholder="Default description for pages without a custom description"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Used when pages don&apos;t have custom descriptions</span>
              <span className={`font-medium ${settings.meta_description.length > 155 ? 'text-amber-500' : 'text-[var(--text-muted)]'}`}>
                {settings.meta_description.length}/160
              </span>
            </div>
          </div>

          {/* Search Preview */}
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Google Preview</p>
            <div className="space-y-1">
              <p className="text-lg text-[#1a0dab]">
                {settings.meta_title_template.replace('%title%', 'Example Page').replace('%site_name%', settings.site_name || 'Your Site')}
              </p>
              <p className="text-sm text-emerald-700">
                https://sportsmockery.com/example-page
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {settings.meta_description || 'Your meta description will appear here...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Analytics</h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">Track visitor behavior and engagement</p>
        </div>
        <div className="p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              Google Analytics ID
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg className="h-5 w-5 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.84 10.25c0-.69-.06-1.39-.17-2.05H12v3.87h6.08c-.26 1.38-1.04 2.55-2.21 3.33v2.77h3.57c2.09-1.93 3.3-4.77 3.3-7.92z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.05-3.71 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.71 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.71 1 4 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <input
                type="text"
                value={settings.google_analytics_id}
                onChange={(e) => onChange('google_analytics_id', e.target.value)}
                className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] py-2.5 pl-12 pr-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
                placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sitemap & Robots */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Sitemap & Robots</h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">Control how search engines crawl your site</p>
        </div>
        <div className="space-y-5 p-6">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-4 transition-colors hover:bg-[var(--bg-hover)]">
            <input
              type="checkbox"
              checked={settings.sitemap_enabled}
              onChange={(e) => onChange('sitemap_enabled', e.target.checked)}
              className="h-5 w-5 rounded border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--accent-red)] focus:ring-[var(--accent-red)]"
            />
            <div>
              <p className="font-medium text-[var(--text-primary)]">Enable XML Sitemap</p>
              <p className="text-sm text-[var(--text-muted)]">Automatically generate and serve a sitemap.xml</p>
            </div>
          </label>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              Custom robots.txt
            </label>
            <textarea
              value={settings.robots_txt}
              onChange={(e) => onChange('robots_txt', e.target.value)}
              rows={5}
              className="w-full resize-none rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 font-mono text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
              placeholder="User-agent: *
Allow: /"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => onSave({
            meta_title_template: settings.meta_title_template,
            meta_description: settings.meta_description,
            google_analytics_id: settings.google_analytics_id,
            sitemap_enabled: settings.sitemap_enabled,
            robots_txt: settings.robots_txt
          })}
          disabled={saving || !hasChanges}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] px-6 py-2.5 font-medium text-white transition-all hover:bg-[var(--accent-red-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>
    </>
  )
}

// Social Settings Tab
function SocialTab({
  settings,
  onChange,
  onSave,
  saving,
  hasChanges
}: {
  settings: Settings
  onChange: (field: keyof Settings, value: string | boolean) => void
  onSave: (updates: Partial<Settings>) => void
  saving: boolean
  hasChanges: boolean
}) {
  return (
    <>
      {/* Social Media Profiles */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Social Media Profiles</h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">Connect your social accounts</p>
        </div>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          {/* Twitter/X */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X (Twitter)
            </label>
            <div className="flex">
              <span className="flex items-center rounded-l-lg border border-r-0 border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 text-[var(--text-muted)]">@</span>
              <input
                type="text"
                value={settings.twitter_handle}
                onChange={(e) => onChange('twitter_handle', e.target.value)}
                className="w-full rounded-r-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
                placeholder="sportsmockery"
              />
            </div>
          </div>

          {/* Facebook */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
              <svg className="h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </label>
            <input
              type="url"
              value={settings.facebook_page}
              onChange={(e) => onChange('facebook_page', e.target.value)}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
              placeholder="https://facebook.com/sportsmockery"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
              <svg className="h-4 w-4 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
              </svg>
              Instagram
            </label>
            <div className="flex">
              <span className="flex items-center rounded-l-lg border border-r-0 border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 text-[var(--text-muted)]">@</span>
              <input
                type="text"
                value={settings.instagram_handle}
                onChange={(e) => onChange('instagram_handle', e.target.value)}
                className="w-full rounded-r-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
                placeholder="sportsmockery"
              />
            </div>
          </div>

          {/* YouTube */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
              <svg className="h-4 w-4 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </label>
            <input
              type="url"
              value={settings.youtube_channel}
              onChange={(e) => onChange('youtube_channel', e.target.value)}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
              placeholder="https://youtube.com/@sportsmockery"
            />
          </div>
        </div>
      </div>

      {/* Default Share Image */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Default Share Image</h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">Image shown when sharing on social media</p>
        </div>
        <div className="p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
              Default OG Image URL
            </label>
            <input
              type="url"
              value={settings.default_share_image}
              onChange={(e) => onChange('default_share_image', e.target.value)}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-colors focus:border-[var(--accent-red)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-red)]"
              placeholder="https://example.com/og-image.jpg"
            />
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
              Recommended size: 1200 x 630 pixels
            </p>
            {settings.default_share_image && (
              <div className="mt-3 inline-block overflow-hidden rounded-lg border border-[var(--border-default)]">
                <Image
                  src={settings.default_share_image}
                  alt="Share image preview"
                  width={300}
                  height={157}
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => onSave({
            twitter_handle: settings.twitter_handle,
            facebook_page: settings.facebook_page,
            instagram_handle: settings.instagram_handle,
            youtube_channel: settings.youtube_channel,
            default_share_image: settings.default_share_image
          })}
          disabled={saving || !hasChanges}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] px-6 py-2.5 font-medium text-white transition-all hover:bg-[var(--accent-red-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>
    </>
  )
}

// Advanced Settings Tab
function AdvancedTab() {
  return (
    <>
      {/* Cache Management */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Cache Management</h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">Manage cached content and regenerate pages</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]">
              <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Regenerate Static Pages
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]">
              <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Clear Image Cache
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]">
              <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
              Clear API Cache
            </button>
          </div>
        </div>
      </div>

      {/* Performance */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
        <div className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)] px-6 py-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Performance</h2>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">Optimize site performance</p>
        </div>
        <div className="space-y-4 p-6">
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-4 transition-colors hover:bg-[var(--bg-hover)]">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Image Optimization</p>
              <p className="text-sm text-[var(--text-muted)]">Automatically optimize images on upload</p>
            </div>
            <div className="relative">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <div className="h-6 w-11 rounded-full bg-[var(--bg-elevated)] transition-colors peer-checked:bg-[var(--accent-red)]" />
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
            </div>
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-4 transition-colors hover:bg-[var(--bg-hover)]">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Lazy Loading</p>
              <p className="text-sm text-[var(--text-muted)]">Load images only when they enter viewport</p>
            </div>
            <div className="relative">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <div className="h-6 w-11 rounded-full bg-[var(--bg-elevated)] transition-colors peer-checked:bg-[var(--accent-red)]" />
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
            </div>
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-4 transition-colors hover:bg-[var(--bg-hover)]">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Minify CSS/JS</p>
              <p className="text-sm text-[var(--text-muted)]">Compress assets for faster loading</p>
            </div>
            <div className="relative">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <div className="h-6 w-11 rounded-full bg-[var(--bg-elevated)] transition-colors peer-checked:bg-[var(--accent-red)]" />
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
            </div>
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="overflow-hidden rounded-xl border border-red-500/30 bg-red-500/5">
        <div className="border-b border-red-500/30 bg-red-500/10 px-6 py-4">
          <h2 className="font-semibold text-red-400">Danger Zone</h2>
          <p className="mt-0.5 text-sm text-red-400/70">Irreversible actions that affect your entire site</p>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-[var(--bg-tertiary)] p-4">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Reset All Settings</p>
              <p className="text-sm text-[var(--text-muted)]">Restore all settings to their default values</p>
            </div>
            <button className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10">
              Reset
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-[var(--bg-tertiary)] p-4">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Export Data</p>
              <p className="text-sm text-[var(--text-muted)]">Download all your data as a JSON file</p>
            </div>
            <button className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]">
              Export
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
