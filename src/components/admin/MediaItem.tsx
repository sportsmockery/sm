'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MediaItem } from '@/app/admin/media/page'

interface MediaItemCardProps {
  item: MediaItem
  isSelected: boolean
  onSelect: () => void
  onViewDetails: () => void
  onDelete: () => void
}

export default function MediaItemCard({
  item,
  isSelected,
  onSelect,
  onViewDetails,
  onDelete
}: MediaItemCardProps) {
  const [imageError, setImageError] = useState(false)

  const isImage = item.type.startsWith('image/')
  const isVideo = item.type.startsWith('video/')
  const isPDF = item.type === 'application/pdf'

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const renderThumbnail = () => {
    if (isImage && !imageError) {
      return (
        <Image
          src={item.url}
          alt={item.alt_text || item.name}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
      )
    }

    if (isVideo) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-700">
          <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
      )
    }

    if (isPDF) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-700">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center h-full bg-gray-700">
        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={`relative group rounded-lg overflow-hidden bg-gray-800 border-2 transition-all cursor-pointer ${
        isSelected ? 'border-blue-500' : 'border-transparent hover:border-gray-600'
      }`}
    >
      {/* Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation()
            onSelect()
          }}
          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
        />
      </div>

      {/* Thumbnail */}
      <div
        className="aspect-square relative"
        onClick={onViewDetails}
      >
        {renderThumbnail()}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails()
            }}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            title="View details"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-2 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
            title="Delete"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-sm text-white truncate" title={item.name}>
          {item.name}
        </p>
        <p className="text-xs text-gray-500">
          {formatFileSize(item.size)}
          {item.width && item.height && ` • ${item.width}×${item.height}`}
        </p>
      </div>
    </div>
  )
}
