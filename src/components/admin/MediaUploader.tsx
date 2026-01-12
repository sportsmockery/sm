'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase'
import { MediaItem } from '@/app/admin/media/page'
import UploadProgress from './UploadProgress'
import { validateFileType, getImageDimensions, resizeImage } from '@/utils/imageUtils'

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'complete' | 'error'
  error?: string
}

interface MediaUploaderProps {
  onUploadComplete: (media: MediaItem[]) => void
  onClose: () => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf']

export default function MediaUploader({ onUploadComplete, onClose }: MediaUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [completedMedia, setCompletedMedia] = useState<MediaItem[]>([])

  const uploadFile = async (file: File, fileId: string) => {
    const supabase = createClient()
    if (!supabase) throw new Error('Database not configured')

    try {
      // Validate file
      if (!validateFileType(file, ALLOWED_TYPES)) {
        throw new Error('File type not allowed')
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File too large (max 10MB)')
      }

      // Process image if needed
      let fileToUpload = file
      let dimensions: { width: number; height: number } | null = null

      if (file.type.startsWith('image/')) {
        dimensions = await getImageDimensions(file)

        // Resize if too large
        if (dimensions.width > 2000 || dimensions.height > 2000) {
          fileToUpload = await resizeImage(file, 2000)
          dimensions = await getImageDimensions(fileToUpload)
        }
      }

      // Generate unique filename
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filename, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(filename)

      // Save to database
      const mediaRecord = {
        name: file.name,
        url: urlData.publicUrl,
        size: fileToUpload.size,
        type: file.type,
        width: dimensions?.width,
        height: dimensions?.height,
        alt_text: ''
      }

      const { data: dbData, error: dbError } = await supabase
        .from('sm_media')
        .insert(mediaRecord)
        .select()
        .single()

      if (dbError) throw dbError

      setUploadingFiles(prev =>
        prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'complete' } : f)
      )

      return dbData as MediaItem
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadingFiles(prev =>
        prev.map(f => f.id === fileId ? { ...f, status: 'error', error: errorMessage } : f)
      )
      throw error
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadingFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'uploading' as const
    }))

    setUploadingFiles(prev => [...prev, ...newFiles])

    const uploadedMedia: MediaItem[] = []

    for (const uploadFile_ of newFiles) {
      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === uploadFile_.id && f.status === 'uploading' && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          )
        }, 200)

        const media = await uploadFile(uploadFile_.file, uploadFile_.id)
        clearInterval(progressInterval)
        uploadedMedia.push(media)
      } catch (error) {
        console.error('Error uploading file:', error)
      }
    }

    if (uploadedMedia.length > 0) {
      setCompletedMedia(prev => [...prev, ...uploadedMedia])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4'],
      'application/pdf': ['.pdf']
    },
    maxSize: MAX_FILE_SIZE
  })

  const handleCancel = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleDone = () => {
    onUploadComplete(completedMedia)
  }

  const allComplete = uploadingFiles.length > 0 && uploadingFiles.every(f => f.status !== 'uploading')

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Upload Media</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        {isDragActive ? (
          <p className="text-blue-400">Drop files here...</p>
        ) : (
          <>
            <p className="text-gray-300 mb-2">Drag & drop files here, or click to browse</p>
            <p className="text-gray-500 text-sm">Supports: JPG, PNG, GIF, WebP, MP4, PDF (max 10MB)</p>
          </>
        )}
      </div>

      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadingFiles.map(file => (
            <UploadProgress
              key={file.id}
              filename={file.file.name}
              progress={file.progress}
              status={file.status}
              error={file.error}
              onCancel={() => handleCancel(file.id)}
            />
          ))}
        </div>
      )}

      {allComplete && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleDone}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}
