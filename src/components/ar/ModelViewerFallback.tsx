'use client'

import { useEffect, useRef } from 'react'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700'] })

// Stadium configurations
const STADIUM_CONFIG: Record<string, {
  name: string
  modelPath: string
  posterPath: string
  mockeryText: string
}> = {
  'chicago-bears': {
    name: 'Soldier Field',
    modelPath: '/models/soldier-field.glb',
    posterPath: '/images/soldier-field-poster.jpg',
    mockeryText: 'Home of Bears Heartbreak Since 1924!',
  },
  'chicago-cubs': {
    name: 'Wrigley Field',
    modelPath: '/models/wrigley-field.glb',
    posterPath: '/images/wrigley-field-poster.jpg',
    mockeryText: 'The Friendly Confines of Mediocrity!',
  },
  'chicago-white-sox': {
    name: 'Guaranteed Rate Field',
    modelPath: '/models/guaranteed-rate-field.glb',
    posterPath: '/images/guaranteed-rate-field-poster.jpg',
    mockeryText: 'Empty Seats, Full Disappointment!',
  },
  'chicago-bulls': {
    name: 'United Center',
    modelPath: '/models/united-center.glb',
    posterPath: '/images/united-center-poster.jpg',
    mockeryText: 'Where the Bulls Rebuild... Again!',
  },
  'chicago-blackhawks': {
    name: 'United Center',
    modelPath: '/models/united-center.glb',
    posterPath: '/images/united-center-poster.jpg',
    mockeryText: 'The Madhouse... Now a Library!',
  },
}

interface ModelViewerFallbackProps {
  team: string
  onClose?: () => void
  className?: string
}

/**
 * Model Viewer Fallback
 *
 * Desktop 3D viewer using Google's <model-viewer> web component:
 * - Interactive 3D rotation with mouse/touch
 * - No AR claim, just 3D viewing
 * - Works on all modern browsers
 *
 * Requires: npm install @google/model-viewer (or CDN script)
 */
export default function ModelViewerFallback({
  team,
  onClose,
  className = '',
}: ModelViewerFallbackProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const config = STADIUM_CONFIG[team]

  // Load model-viewer script dynamically
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js'
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  if (!config) {
    return (
      <div className={`bg-zinc-900 p-8 text-center ${className}`}>
        <p className="text-zinc-400">Stadium not found</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`bg-zinc-900 dark:bg-zinc-950 rounded-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h3 className={`text-white text-lg ${montserrat.className}`}>
          {config.name} - 3D View
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 rounded"
            aria-label="Close 3D viewer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Model viewer container */}
      <div className="relative aspect-video bg-zinc-800" ref={containerRef}>
        {/* Loading state */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Loading 3D model...</p>
            <p className="text-zinc-500 text-xs mt-2">Model viewer will appear here</p>
          </div>
        </div>

        {/* Mockery overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <p className={`text-red-500 text-center font-bold ${montserrat.className}`}>
            {config.mockeryText}
          </p>
        </div>
      </div>

      {/* Controls hint */}
      <div className="px-4 py-3 bg-zinc-800/50 text-center">
        <p className="text-zinc-500 text-sm">
          Click and drag to rotate • Scroll to zoom • Double-click to reset
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-800 text-center">
        <p className="text-zinc-500 text-xs">
          For the full AR experience, open on iPhone with Safari
        </p>
      </div>
    </div>
  )
}

// Note: For full 3D model viewing, integrate @google/model-viewer
// or use @react-three/fiber with GLTF loader
