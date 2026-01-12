'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MediaItem } from '@/app/admin/media/page'

interface MediaDetailProps {
  media: MediaItem
  onClose: () => void
  onUpdate: (updates: Partial<MediaItem>) => void
  onDelete: () => void
}

export default function MediaDetail({ media, onClose, onUpdate, onDelete }: MediaDetailProps) {
  const [altText, setAltText] = useState(media.alt_text || '')
  const [copied, setCopied] = useState(false)

  const isImage = media.type.startsWith('image/')
  const isVideo = media.type.startsWith('video/')

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copyUrl = async () => {
    await navigator.clipboard.writeText(media.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveAltText = () => {
    if (altText !== media.alt_text) {
      onUpdate({ alt_text: altText })
    }
  }

  return (
    <div className="w-80 bg-gray-800 rounded-lg p-4 flex-shrink-0">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div className="mb-4 rounded-lg overflow-hidden bg-gray-900">
        {isImage ? (
          <div className="relative aspect-video">
            <Image
              src={media.url}
              alt={media.alt_text || media.name}
              fill
              className="object-contain"
            />
          </div>
        ) : isVideo ? (
          <video
            src={media.url}
            controls
            className="w-full"
          />
        ) : (
          <div className="aspect-video flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* File info */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs text-gray-500 uppercase">Filename</label>
          <p className="text-white text-sm break-all">{media.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 uppercase">Size</label>
            <p className="text-white text-sm">{formatFileSize(media.size)}</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase">Type</label>
            <p className="text-white text-sm">{media.type}</p>
          </div>
        </div>

        {media.width && media.height && (
          <div>
            <label className="text-xs text-gray-500 uppercase">Dimensions</label>
            <p className="text-white text-sm">{media.width} × {media.height}px</p>
          </div>
        )}

        <div>
          <label className="text-xs text-gray-500 uppercase">Uploaded</label>
          <p className="text-white text-sm">{formatDate(media.created_at)}</p>
        </div>
      </div>

      {/* Alt text */}
      {isImage && (
        <div className="mb-4">
          <label className="text-xs text-gray-500 uppercase block mb-1">Alt Text</label>
          <textarea
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            onBlur={handleSaveAltText}
            placeholder="Describe this image for accessibility..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-blue-500"
            rows={3}
          />
        </div>
      )}

      {/* URL */}
      <div className="mb-4">
        <label className="text-xs text-gray-500 uppercase block mb-1">URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={media.url}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none"
          />
          <button
            onClick={copyUrl}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors"
            title="Copy URL"
          >
            {copied ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-center text-sm"
        >
          Open Original
        </a>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
