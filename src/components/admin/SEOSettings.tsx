'use client'

import { useState } from 'react'

interface SEOSettingsProps {
  settings: {
    meta_title_template: string
    meta_description: string
    google_analytics_id: string
    sitemap_enabled: boolean
    robots_txt: string
  }
  onSave: (settings: SEOSettingsProps['settings']) => void
  saving: boolean
}

export default function SEOSettings({ settings, onSave, saving }: SEOSettingsProps) {
  const [formData, setFormData] = useState(settings)

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Meta Tags</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Meta Title Template
            </label>
            <input
              type="text"
              value={formData.meta_title_template}
              onChange={(e) => handleChange('meta_title_template', e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="%title% | %site_name%"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use %title% for page title and %site_name% for site name
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Default Meta Description
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) => handleChange('meta_description', e.target.value)}
              rows={3}
              maxLength={160}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Default description for pages without a custom description"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.meta_description.length}/160 characters
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Analytics</h3>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Google Analytics ID
          </label>
          <input
            type="text"
            value={formData.google_analytics_id}
            onChange={(e) => handleChange('google_analytics_id', e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"
          />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sitemap & Robots</h3>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sitemap_enabled}
              onChange={(e) => handleChange('sitemap_enabled', e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-300">Enable XML Sitemap</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Custom robots.txt
            </label>
            <textarea
              value={formData.robots_txt}
              onChange={(e) => handleChange('robots_txt', e.target.value)}
              rows={5}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
              placeholder="User-agent: *
Allow: /"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
