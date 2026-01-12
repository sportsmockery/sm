'use client'

import { MediaItem } from '@/app/admin/media/page'
import MediaItemCard from './MediaItem'

interface MediaGridProps {
  media: MediaItem[]
  selectedItems: string[]
  onSelect: (id: string) => void
  onSelectAll: () => void
  onViewDetails: (item: MediaItem) => void
  onDelete: (id: string) => void
}

export default function MediaGrid({
  media,
  selectedItems,
  onSelect,
  onSelectAll,
  onViewDetails,
  onDelete
}: MediaGridProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedItems.length === media.length && media.length > 0}
            onChange={onSelectAll}
            className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
          />
          Select All
        </label>
        <span className="text-gray-500 text-sm">{media.length} files</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {media.map((item) => (
          <MediaItemCard
            key={item.id}
            item={item}
            isSelected={selectedItems.includes(item.id)}
            onSelect={() => onSelect(item.id)}
            onViewDetails={() => onViewDetails(item)}
            onDelete={() => onDelete(item.id)}
          />
        ))}
      </div>
    </div>
  )
}
