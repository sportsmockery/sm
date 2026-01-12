'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { MediaItem } from '@/app/admin/media/page'
import MediaUploader from './MediaUploader'

interface MediaModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: MediaItem) => void
  allowMultiple?: boolean
}

export default function MediaModal({ isOpen, onClose, onSelect, allowMultiple = false }: MediaModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'library' | 'upload'>('library')
  const [search, setSearch] = useState('')
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([])

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      let query = supabase
        .from('sm_media')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setMedia(data || [])
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    if (isOpen) {
      fetchMedia()
    }
  }, [isOpen, fetchMedia])

  const handleUploadComplete = (newMedia: MediaItem[]) => {
    setMedia(prev => [...newMedia, ...prev])
    setTab('library')
  }

  const handleSelect = (item: MediaItem) => {
    if (allowMultiple) {
      setSelectedItems(prev =>
        prev.find(i => i.id === item.id)
          ? prev.filter(i => i.id !== item.id)
          : [...prev, item]
      )
    } else {
      onSelect(item)
      onClose()
    }
  }

  const handleInsert = () => {
    if (selectedItems.length > 0) {
      selectedItems.forEach(item => onSelect(item))
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Select Media</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setTab('library')}
            className={`px-6 py-3 font-medium transition-colors ${
              tab === 'library'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Media Library
          </button>
          <button
            onClick={() => setTab('upload')}
            className={`px-6 py-3 font-medium transition-colors ${
              tab === 'upload'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Upload New
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'library' ? (
            <>
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search media..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Grid */}
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : media.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No media found</p>
                  <button
                    onClick={() => setTab('upload')}
                    className="mt-2 text-blue-500 hover:text-blue-400"
                  >
                    Upload new media
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {media.map((item) => {
                    const isSelected = selectedItems.find(i => i.id === item.id)
                    const isImage = item.type.startsWith('image/')

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          isSelected ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-transparent hover:border-gray-600'
                        }`}
                      >
                        {isImage ? (
                          <img
                            src={item.url}
                            alt={item.alt_text || item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <MediaUploader
              onUploadComplete={handleUploadComplete}
              onClose={() => setTab('library')}
            />
          )}
        </div>

        {/* Footer */}
        {allowMultiple && selectedItems.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-700">
            <span className="text-gray-400">{selectedItems.length} item(s) selected</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Clear
              </button>
              <button
                onClick={handleInsert}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Insert Selected
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
