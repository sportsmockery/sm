'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { MediaItem } from '@/app/admin/media/page'

interface UseMediaLibraryOptions {
  initialLimit?: number
}

interface MediaListResult {
  media: MediaItem[]
  total: number
  page: number
  totalPages: number
}

export function useMediaLibrary(options: UseMediaLibraryOptions = {}) {
  const { initialLimit = 50 } = options

  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fetchMedia = useCallback(async (params?: {
    page?: number
    limit?: number
    search?: string
    type?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<MediaListResult> => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      if (!supabase) throw new Error('Database not configured')
      const {
        page = 1,
        limit = initialLimit,
        search = '',
        type = 'all',
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = params || {}

      const offset = (page - 1) * limit

      let query = supabase
        .from('sm_media')
        .select('*', { count: 'exact' })

      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      if (type && type !== 'all') {
        query = query.ilike('type', `${type}%`)
      }

      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1)

      const { data, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      setMedia(data || [])

      return {
        media: data || [],
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch media'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [initialLimit])

  const uploadMedia = useCallback(async (file: File): Promise<MediaItem> => {
    setUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const supabase = createClient()
      if (!supabase) throw new Error('Database not configured')

      // Validate file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not allowed')
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large (max 10MB)')
      }

      // Generate unique filename
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

      setUploadProgress(30)

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      setUploadProgress(70)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filename)

      // Save to database
      const { data, error: dbError } = await supabase
        .from('sm_media')
        .insert({
          name: file.name,
          url: urlData.publicUrl,
          size: file.size,
          type: file.type,
          alt_text: ''
        })
        .select()
        .single()

      if (dbError) throw dbError

      setUploadProgress(100)

      // Add to local state
      setMedia(prev => [data, ...prev])

      return data as MediaItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      throw err
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [])

  const deleteMedia = useCallback(async (id: string): Promise<void> => {
    setError(null)

    try {
      const supabase = createClient()
      if (!supabase) throw new Error('Database not configured')

      // Get the media item first
      const item = media.find(m => m.id === id)
      if (!item) throw new Error('Media not found')

      // Extract filename from URL
      const filename = item.url.split('/').pop()

      // Delete from storage
      if (filename) {
        await supabase.storage
          .from('media')
          .remove([filename])
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('sm_media')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Remove from local state
      setMedia(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed'
      setError(errorMessage)
      throw err
    }
  }, [media])

  const updateMedia = useCallback(async (id: string, updates: Partial<MediaItem>): Promise<MediaItem> => {
    setError(null)

    try {
      const supabase = createClient()
      if (!supabase) throw new Error('Database not configured')

      const { data, error: updateError } = await supabase
        .from('sm_media')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      setMedia(prev => prev.map(m => m.id === id ? { ...m, ...data } : m))

      return data as MediaItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed'
      setError(errorMessage)
      throw err
    }
  }, [])

  return {
    media,
    loading,
    error,
    uploading,
    uploadProgress,
    fetchMedia,
    uploadMedia,
    deleteMedia,
    updateMedia
  }
}
