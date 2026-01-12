'use client'

import { useState } from 'react'
import Image from 'next/image'
import RoleSelector from './RoleSelector'
import MediaModal from './MediaModal'
import { MediaItem } from '@/app/admin/media/page'

interface Author {
  id?: string
  name: string
  email: string
  bio: string
  avatar_url: string
  role: 'admin' | 'editor' | 'author'
  twitter?: string
  website?: string
}

interface AuthorFormProps {
  initialData?: Partial<Author>
  onSave: (data: Partial<Author>) => Promise<void>
  saving: boolean
}

export default function AuthorForm({ initialData, onSave, saving }: AuthorFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [bio, setBio] = useState(initialData?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || '')
  const [role, setRole] = useState<Author['role']>(initialData?.role || 'author')
  const [twitter, setTwitter] = useState(initialData?.twitter || '')
  const [website, setWebsite] = useState(initialData?.website || '')
  const [showMediaModal, setShowMediaModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({
      name,
      email,
      bio,
      avatar_url: avatarUrl,
      role,
      twitter,
      website
    })
  }

  const handleMediaSelect = (media: MediaItem) => {
    setAvatarUrl(media.url)
    setShowMediaModal(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-start gap-6">
        <div>
          {avatarUrl ? (
            <div className="relative w-24 h-24">
              <Image
                src={avatarUrl}
                alt={name || 'Author avatar'}
                fill
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-white text-3xl font-medium">
              {name.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowMediaModal(true)}
            className="px-4 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600"
          >
            {avatarUrl ? 'Change Avatar' : 'Upload Avatar'}
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setAvatarUrl('')}
              className="block px-4 py-2 text-red-400 text-sm hover:text-red-300"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          placeholder="Author name"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          placeholder="author@example.com"
        />
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Role
        </label>
        <RoleSelector value={role} onChange={setRole} />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
          placeholder="Brief author biography"
        />
      </div>

      {/* Social */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Twitter
          </label>
          <div className="flex">
            <span className="px-3 py-2 bg-gray-600 border border-r-0 border-gray-600 rounded-l-lg text-gray-400">@</span>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-r-lg text-white focus:outline-none focus:border-blue-500"
              placeholder="username"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-gray-400 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !name || !email}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : initialData?.id ? 'Update Author' : 'Create Author'}
        </button>
      </div>

      <MediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleMediaSelect}
      />
    </form>
  )
}
