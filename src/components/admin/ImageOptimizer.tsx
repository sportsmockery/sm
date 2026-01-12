'use client'

import { useState, useRef, useEffect } from 'react'
import { resizeImage, getImageDimensions } from '@/utils/imageUtils'

interface ImageOptimizerProps {
  file: File
  maxWidth?: number
  quality?: number
  onOptimized: (file: File) => void
  onCancel: () => void
}

interface ImageInfo {
  width: number
  height: number
  size: number
}

export default function ImageOptimizer({
  file,
  maxWidth = 2000,
  quality = 0.85,
  onOptimized,
  onCancel
}: ImageOptimizerProps) {
  const [originalInfo, setOriginalInfo] = useState<ImageInfo | null>(null)
  const [optimizedInfo, setOptimizedInfo] = useState<ImageInfo | null>(null)
  const [optimizedFile, setOptimizedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [targetWidth, setTargetWidth] = useState(maxWidth)
  const [processing, setProcessing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const loadImage = async () => {
      const dims = await getImageDimensions(file)
      setOriginalInfo({
        width: dims.width,
        height: dims.height,
        size: file.size
      })
      setTargetWidth(Math.min(dims.width, maxWidth))
      setPreview(URL.createObjectURL(file))
    }

    loadImage()

    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [file, maxWidth])

  const handleOptimize = async () => {
    setProcessing(true)
    try {
      const optimized = await resizeImage(file, targetWidth, quality)
      const dims = await getImageDimensions(optimized)

      setOptimizedFile(optimized)
      setOptimizedInfo({
        width: dims.width,
        height: dims.height,
        size: optimized.size
      })
    } catch (error) {
      console.error('Error optimizing image:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleApply = () => {
    if (optimizedFile) {
      onOptimized(optimizedFile)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getSavings = () => {
    if (!originalInfo || !optimizedInfo) return 0
    return Math.round((1 - optimizedInfo.size / originalInfo.size) * 100)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Optimize Image</h3>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Preview */}
        <div>
          <label className="text-sm text-gray-400 block mb-2">Preview</label>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          {/* Original */}
          {originalInfo && (
            <div className="bg-gray-900 rounded-lg p-4">
              <label className="text-xs text-gray-500 uppercase block mb-2">Original</label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white ml-2">{formatSize(originalInfo.size)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Dimensions:</span>
                  <span className="text-white ml-2">{originalInfo.width} × {originalInfo.height}</span>
                </div>
              </div>
            </div>
          )}

          {/* Optimized */}
          {optimizedInfo && (
            <div className="bg-green-900/30 border border-green-800 rounded-lg p-4">
              <label className="text-xs text-green-400 uppercase block mb-2">Optimized</label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white ml-2">{formatSize(optimizedInfo.size)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Dimensions:</span>
                  <span className="text-white ml-2">{optimizedInfo.width} × {optimizedInfo.height}</span>
                </div>
              </div>
              <div className="mt-2 text-green-400 text-sm">
                Savings: {getSavings()}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm text-gray-400 block mb-2">
            Max Width: {targetWidth}px
          </label>
          <input
            type="range"
            min={200}
            max={originalInfo?.width || 2000}
            value={targetWidth}
            onChange={(e) => setTargetWidth(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-400 hover:text-white"
        >
          Cancel
        </button>
        {!optimizedFile ? (
          <button
            onClick={handleOptimize}
            disabled={processing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Optimize'}
          </button>
        ) : (
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Use Optimized
          </button>
        )}
      </div>
    </div>
  )
}
