'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GeneralSettingsProps {
  settings: {
    site_name: string
    site_description: string
    logo_url: string
    favicon_url: string
  }
  onSave: (settings: GeneralSettingsProps['settings']) => void
  saving: boolean
}

export default function GeneralSettings({ settings, onSave, saving }: GeneralSettingsProps) {
  const [formData, setFormData] = useState(settings)

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Site Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Site Name
            </label>
            <input
              type="text"
              value={formData.site_name}
              onChange={(e) => handleChange('site_name', e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="My Website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Site Description
            </label>
            <textarea
              value={formData.site_description}
              onChange={(e) => handleChange('site_description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="A brief description of your website"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Branding</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="https://example.com/logo.png"
            />
            {formData.logo_url && (
              <div className="mt-2 p-2 bg-gray-900 rounded-lg inline-block">
                <Image
                  src={formData.logo_url}
                  alt="Logo preview"
                  width={150}
                  height={50}
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Favicon URL
            </label>
            <input
              type="url"
              value={formData.favicon_url}
              onChange={(e) => handleChange('favicon_url', e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="https://example.com/favicon.ico"
            />
            {formData.favicon_url && (
              <div className="mt-2 p-2 bg-gray-900 rounded-lg inline-block">
                <Image
                  src={formData.favicon_url}
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
