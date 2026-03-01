'use client'

import { useState, useEffect } from 'react'

// Sketchfab model IDs for Chicago stadiums (real models)
// These are publicly available 3D models on Sketchfab
const SKETCHFAB_MODELS: Record<string, string> = {
  'soldier-field': '0f80f0aad6fc4b028cbee457f97b3b9d',
  'wrigley-field': '9e331bdfd155418c911aa8a7d0097c10',
  'united-center': '9e8ea17d3fd247b6af4cf73de459ec74',
  'guaranteed-rate-field': '', // Need to find this one
}

// Stadium configurations for each team
const STADIUM_CONFIG: Record<string, {
  name: string
  buttonText: string
  previewImage: string
  usdzPath: string
  gltfPath: string
  mockeryText: string
  teamColor: string
  sketchfabId: string
}> = {
  'chicago-bears': {
    name: 'Soldier Field',
    buttonText: 'Tour Soldier Field in 3D',
    previewImage: '/models/soldier-field-preview.jpg',
    usdzPath: '/models/soldier-field.usdz',
    gltfPath: '/models/soldier-field.glb',
    mockeryText: 'Home of Bears Heartbreak Since 1924!',
    teamColor: '#0B162A',
    sketchfabId: '0f80f0aad6fc4b028cbee457f97b3b9d',
  },
  'chicago-cubs': {
    name: 'Wrigley Field',
    buttonText: 'Tour Wrigley Field in 3D',
    previewImage: '/models/wrigley-field-preview.jpg',
    usdzPath: '/models/wrigley-field.usdz',
    gltfPath: '/models/wrigley-field.glb',
    mockeryText: 'The Friendly Confines of Mediocrity!',
    teamColor: '#0E3386',
    sketchfabId: '9e331bdfd155418c911aa8a7d0097c10',
  },
  'chicago-white-sox': {
    name: 'Guaranteed Rate Field',
    buttonText: 'Tour The Rate in 3D',
    previewImage: '/models/guaranteed-rate-preview.jpg',
    usdzPath: '/models/guaranteed-rate-field.usdz',
    gltfPath: '/models/guaranteed-rate-field.glb',
    mockeryText: 'Empty Seats, Full Disappointment!',
    teamColor: '#27251F',
    sketchfabId: '', // Coming soon
  },
  'chicago-bulls': {
    name: 'United Center',
    buttonText: 'Tour United Center in 3D',
    previewImage: '/models/united-center-preview.jpg',
    usdzPath: '/models/united-center.usdz',
    gltfPath: '/models/united-center.glb',
    mockeryText: 'Where the Bulls Rebuild... Again!',
    teamColor: '#CE1141',
    sketchfabId: '9e8ea17d3fd247b6af4cf73de459ec74',
  },
  'chicago-blackhawks': {
    name: 'United Center',
    buttonText: 'Tour United Center in 3D',
    previewImage: '/models/united-center-preview.jpg',
    usdzPath: '/models/united-center.usdz',
    gltfPath: '/models/united-center.glb',
    mockeryText: 'The Madhouse... Now a Library!',
    teamColor: '#CF0A2C',
    sketchfabId: '9e8ea17d3fd247b6af4cf73de459ec74',
  },
}

type DeviceType = 'ios' | 'android' | 'desktop'

interface ARTourButtonProps {
  team: string
  className?: string
}

export default function ARTourButton({ team, className = '' }: ARTourButtonProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [showViewer, setShowViewer] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)

  const config = STADIUM_CONFIG[team]

  // Detect device type on mount
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()

    if (/iphone|ipad|ipod/.test(ua)) {
      setDeviceType('ios')
    } else if (/android/.test(ua)) {
      setDeviceType('android')
    } else {
      setDeviceType('desktop')
    }
  }, [])

  // If no config for this team, don't render
  if (!config) {
    return null
  }

  const handleOpenAR = () => {
    if (deviceType === 'ios') {
      // iOS: Open AR Quick Look directly via anchor
      const link = document.createElement('a')
      link.rel = 'ar'
      link.href = config.usdzPath
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // Desktop/Android: Show 3D viewer modal
      setShowViewer(true)
    }
  }

  return (
    <>
      <div className={`rounded-xl border overflow-hidden ${className}`} style={{ borderColor: config.teamColor, backgroundColor: 'var(--sm-surface)' }}>
        {/* Preview Image */}
        <div className="relative h-32 bg-zinc-800">
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${config.teamColor}44, ${config.teamColor}22)` }}
          >
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-white/60 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <p className="text-white/80 text-sm font-medium">{config.name}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--sm-text)', fontFamily: "Barlow, sans-serif" }}>
            {deviceType === 'desktop' ? '3D Stadium Tour' : 'AR Stadium Tour'}
          </h3>
          <p className="text-sm mb-3" style={{ color: 'var(--sm-text-muted)' }}>
            {deviceType === 'ios'
              ? `Place ${config.name} in your room!`
              : deviceType === 'android'
              ? `View ${config.name} in augmented reality`
              : `Explore ${config.name} in interactive 3D`
            }
          </p>

          <button
            onClick={handleOpenAR}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-bold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: config.teamColor,
              fontFamily: "Barlow, sans-serif"
            }}
          >
            {deviceType === 'desktop' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            )}
            {config.buttonText}
          </button>

          <p className="text-xs text-center mt-3" style={{ color: 'var(--sm-text-muted)' }}>
            {deviceType === 'ios'
              ? 'Best on iPhone Safari'
              : deviceType === 'android'
              ? 'Requires ARCore'
              : 'Click and drag to rotate • Scroll to zoom'
            }
          </p>
        </div>
      </div>

      {/* 3D Viewer Modal - Sketchfab Embed */}
      {showViewer && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl mx-4 bg-zinc-900 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Barlow, sans-serif" }}>
                  {config.name}
                </h2>
                <p className="text-sm text-zinc-400">{config.mockeryText}</p>
              </div>
              <button
                onClick={() => setShowViewer(false)}
                className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sketchfab 3D Viewer Embed */}
            <div className="relative aspect-video bg-zinc-950">
              {config.sketchfabId ? (
                <iframe
                  title={`3D model of ${config.name}`}
                  src={`https://sketchfab.com/models/${config.sketchfabId}/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_watermark=0`}
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  allowFullScreen
                  className="w-full h-full border-0"
                  onLoad={() => setModelLoaded(true)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <svg className="w-16 h-16 text-zinc-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-white text-lg font-semibold mb-2">3D Model Coming Soon</h3>
                    <p className="text-zinc-400 text-sm">
                      We&apos;re working on bringing you an ultra-realistic 3D tour of {config.name}.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls hint */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
              <div className="flex items-center justify-center gap-6 text-sm text-zinc-400">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  Drag to rotate
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  Scroll to zoom
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Double-click fullscreen
                </span>
              </div>
              <p className="text-center text-xs text-zinc-500 mt-2">
                3D model powered by Sketchfab
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
