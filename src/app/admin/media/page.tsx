'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import Image from 'next/image'

export interface MediaItem {
  id: string
  name: string
  url: string
  size: number
  type: string
  width?: number
  height?: number
  alt_text?: string
  created_at: string
}

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'image' | 'video' | 'audio' | 'document'

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showUploader, setShowUploader] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'size'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      let query = supabase
        .from('sm_media')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' })

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      if (typeFilter !== 'all') {
        query = query.ilike('type', `${typeFilter}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setMedia(data || [])
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }, [search, typeFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const supabase = createClient()
    const uploaded: MediaItem[] = []

    try {
      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(uploadData.path)

        // Get image dimensions if it's an image
        let width, height
        if (file.type.startsWith('image/')) {
          const dimensions = await getImageDimensions(file)
          width = dimensions.width
          height = dimensions.height
        }

        const { data: mediaData, error: dbError } = await supabase
          .from('sm_media')
          .insert({
            name: file.name,
            url: publicUrl,
            size: file.size,
            type: file.type,
            width,
            height,
          })
          .select()
          .single()

        if (!dbError && mediaData) {
          uploaded.push(mediaData)
        }
      }

      setMedia(prev => [...uploaded, ...prev])
      setShowUploader(false)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = document.createElement('img')
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
        URL.revokeObjectURL(img.src)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleUpload(e.dataTransfer.files)
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const selectAll = () => {
    if (selectedItems.size === media.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(media.map(m => m.id)))
    }
  }

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Delete ${ids.length} item(s)?`)) return

    try {
      const supabase = createClient()
      const itemsToDelete = media.filter(m => ids.includes(m.id))

      for (const item of itemsToDelete) {
        const path = item.url.split('/').pop()
        if (path) {
          await supabase.storage.from('media').remove([path])
        }
      }

      const { error } = await supabase
        .from('sm_media')
        .delete()
        .in('id', ids)

      if (error) throw error

      setMedia(prev => prev.filter(m => !ids.includes(m.id)))
      setSelectedItems(new Set())
      setSelectedMedia(null)
    } catch (error) {
      console.error('Error deleting media:', error)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type.startsWith('video/')) return '🎬'
    if (type.startsWith('audio/')) return '🎵'
    if (type.includes('pdf')) return '📄'
    return '📁'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Media Library</h1>
          <p className="mt-1 text-[var(--text-muted)]">
            {media.length} files · {formatFileSize(media.reduce((acc, m) => acc + m.size, 0))} total
          </p>
        </div>
        <button
          onClick={() => setShowUploader(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-red)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-red-hover)] transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload Files
        </button>
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Upload Files</h2>
              <button
                onClick={() => setShowUploader(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
                dragActive
                  ? 'border-[var(--accent-red)] bg-[var(--accent-red-muted)]'
                  : 'border-[var(--border-default)] hover:border-[var(--accent-red)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <svg className="h-8 w-8 animate-spin text-[var(--accent-red)]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="mt-3 text-sm text-[var(--text-muted)]">Uploading...</p>
                </div>
              ) : (
                <>
                  <svg className="mb-4 h-12 w-12 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Drag and drop files here</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">or click to browse</p>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleUpload(e.target.files)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters & View Controls */}
      <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="search"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent-red)] focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FilterType)}
            className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-red)] focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="document">Documents</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
              setSortBy(by)
              setSortOrder(order)
            }}
            className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent-red)] focus:outline-none"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-[var(--bg-tertiary)] p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-md p-2 transition-colors ${
              viewMode === 'grid'
                ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-md p-2 transition-colors ${
              viewMode === 'list'
                ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-[var(--accent-red)] bg-[var(--accent-red-muted)] p-4">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {selectedItems.size} file{selectedItems.size > 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedItems(new Set())}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Clear
            </button>
            <button
              onClick={() => handleDelete(Array.from(selectedItems))}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--error)] px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex gap-6">
        {/* Media Grid/List */}
        <div className="flex-1">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <svg className="h-8 w-8 animate-spin text-[var(--accent-red)]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="mb-4 h-16 w-16 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className="text-[var(--text-muted)]">No media files found</p>
              <button
                onClick={() => setShowUploader(true)}
                className="mt-4 text-[var(--accent-red)] hover:underline"
              >
                Upload your first file
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {media.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className={`group relative cursor-pointer overflow-hidden rounded-xl border bg-[var(--bg-card)] transition-all hover:shadow-lg ${
                    selectedItems.has(item.id)
                      ? 'border-[var(--accent-red)] ring-2 ring-[var(--accent-red)]'
                      : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="absolute left-2 top-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={(e) => {
                        e.stopPropagation()
                        toggleSelect(item.id)
                      }}
                      className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--accent-red)] opacity-0 transition-opacity focus:ring-[var(--accent-red)] group-hover:opacity-100"
                      style={{ opacity: selectedItems.has(item.id) ? 1 : undefined }}
                    />
                  </div>

                  {/* Preview */}
                  <div className="aspect-square bg-[var(--bg-tertiary)]">
                    {item.type.startsWith('image/') ? (
                      <Image
                        src={item.url}
                        alt={item.alt_text || item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        {getFileIcon(item.type)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">{item.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{formatFileSize(item.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
              <table className="w-full">
                <thead className="border-b border-[var(--border-default)] bg-[var(--bg-tertiary)]">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === media.length && media.length > 0}
                        onChange={selectAll}
                        className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--accent-red)] focus:ring-[var(--accent-red)]"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      File
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] md:table-cell">
                      Type
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] sm:table-cell">
                      Size
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] lg:table-cell">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {media.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--bg-hover)]">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--accent-red)] focus:ring-[var(--accent-red)]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex cursor-pointer items-center gap-3"
                          onClick={() => setSelectedMedia(item)}
                        >
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-[var(--bg-tertiary)]">
                            {item.type.startsWith('image/') ? (
                              <Image src={item.url} alt="" fill className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xl">
                                {getFileIcon(item.type)}
                              </div>
                            )}
                          </div>
                          <span className="truncate text-sm font-medium text-[var(--text-primary)]">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-[var(--text-secondary)] md:table-cell">
                        {item.type.split('/')[1]?.toUpperCase() || item.type}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-[var(--text-secondary)] sm:table-cell">
                        {formatFileSize(item.size)}
                      </td>
                      <td className="hidden px-4 py-3 text-sm text-[var(--text-secondary)] lg:table-cell">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => copyToClipboard(item.url)}
                            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                            title="Copy URL"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete([item.id])}
                            className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--error-muted)] hover:text-[var(--error)]"
                            title="Delete"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Sidebar */}
        {selectedMedia && (
          <div className="hidden w-80 flex-shrink-0 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] lg:block">
            <div className="border-b border-[var(--border-default)] p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text-primary)]">File Details</h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4">
              {/* Preview */}
              <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-[var(--bg-tertiary)]">
                {selectedMedia.type.startsWith('image/') ? (
                  <Image
                    src={selectedMedia.url}
                    alt={selectedMedia.alt_text || selectedMedia.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl">
                    {getFileIcon(selectedMedia.type)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)]">Name</label>
                  <p className="mt-1 text-sm text-[var(--text-primary)]">{selectedMedia.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)]">Type</label>
                  <p className="mt-1 text-sm text-[var(--text-primary)]">{selectedMedia.type}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)]">Size</label>
                  <p className="mt-1 text-sm text-[var(--text-primary)]">{formatFileSize(selectedMedia.size)}</p>
                </div>
                {selectedMedia.width && selectedMedia.height && (
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)]">Dimensions</label>
                    <p className="mt-1 text-sm text-[var(--text-primary)]">
                      {selectedMedia.width} x {selectedMedia.height}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)]">Uploaded</label>
                  <p className="mt-1 text-sm text-[var(--text-primary)]">
                    {new Date(selectedMedia.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => copyToClipboard(selectedMedia.url)}
                  className="w-full rounded-lg border border-[var(--border-default)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                >
                  Copy URL
                </button>
                <a
                  href={selectedMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-lg border border-[var(--border-default)] px-4 py-2 text-center text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={() => handleDelete([selectedMedia.id])}
                  className="w-full rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                >
                  Delete File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
