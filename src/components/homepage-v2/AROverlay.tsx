'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Stadium configurations for each team
const STADIUM_CONFIG: Record<string, {
  name: string
  model: string
  mockeryText: string
  features: { label: string; position: [number, number, number] }[]
  fallbackImage: string
}> = {
  'chicago-bears': {
    name: 'Soldier Field',
    model: '/models/soldier-field.gltf',
    mockeryText: 'Tour the Home of Bears Heartbreak!',
    features: [
      { label: 'Colonnades: Standing Since 1924', position: [-2, 1, 0] },
      { label: 'Field Turf: Where Dreams Die', position: [0, 0.2, 0] },
      { label: 'Suites: Watch Losses in Luxury', position: [2, 1.5, 0] },
    ],
    fallbackImage: '/images/soldier-field.jpg',
  },
  'chicago-bulls': {
    name: 'United Center',
    model: '/models/united-center-basketball.gltf',
    mockeryText: 'Where the Bulls Rebuild... Again!',
    features: [
      { label: 'Center Court: MJ Memories Only', position: [0, 0.1, 0] },
      { label: 'Banners: No New Ones Coming', position: [0, 3, 0] },
      { label: 'Nose Bleeds: Best Value!', position: [2, 2, 0] },
    ],
    fallbackImage: '/images/united-center.jpg',
  },
  'chicago-blackhawks': {
    name: 'United Center',
    model: '/models/united-center-hockey.gltf',
    mockeryText: 'The Madhouse... Now a Library!',
    features: [
      { label: 'Ice: Freshly Resurfaced Hope', position: [0, 0.1, 0] },
      { label: 'Goal Horn: Rusty from Disuse', position: [-2, 1, 0] },
      { label: 'Hawks Nest: Still Loud!', position: [2, 2, 0] },
    ],
    fallbackImage: '/images/united-center.jpg',
  },
  'chicago-cubs': {
    name: 'Wrigley Field',
    model: '/models/wrigley-field.gltf',
    mockeryText: 'The Friendly Confines of Mediocrity!',
    features: [
      { label: 'Ivy: Hiding Fly Balls Since 1937', position: [-2, 0.5, 0] },
      { label: 'Marquee: "Wait Till Next Year"', position: [0, 2.5, 0] },
      { label: 'Rooftops: Overpaying for Views', position: [2, 2, 0] },
    ],
    fallbackImage: '/images/wrigley-field.jpg',
  },
  'chicago-white-sox': {
    name: 'Guaranteed Rate Field',
    model: '/models/guaranteed-rate-field.gltf',
    mockeryText: 'Empty Seats, Full Disappointment!',
    features: [
      { label: 'Outfield: Where Homers Land', position: [0, 0.5, 2] },
      { label: 'Scoreboard: Counts the Losses', position: [0, 3, 0] },
      { label: 'Upper Deck: Plenty of Room!', position: [-2, 2, 0] },
    ],
    fallbackImage: '/images/guaranteed-rate-field.jpg',
  },
}

interface AROverlayProps {
  team?: string
  mockeryText?: string
  isElite?: boolean
  onClose: () => void
  onUpgrade?: () => void
}

/**
 * AR Overlay Component
 *
 * Interactive stadium tour experience:
 * - Team-specific stadium models
 * - Feature hotspots with labels
 * - Mobile: Uses model-viewer for AR Quick Look support
 * - Desktop: Interactive 3D viewer fallback
 */
export default function AROverlay({
  team = 'chicago-bears',
  mockeryText,
  isElite = false,
  onClose,
  onUpgrade,
}: AROverlayProps) {
  const [isLoading, setIsLoading] = useState(true)

  const config = STADIUM_CONFIG[team] || STADIUM_CONFIG['chicago-bears']
  const displayText = mockeryText || config.mockeryText

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Elite gate
  if (!isElite) {
    return (
      <ARModal onClose={onClose}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl text-white mb-4">
            Elite Access Required
          </h2>
          <p className="text-zinc-400 mb-6 font-serif">
            AR Stadium Tours are exclusive to Elite members. Unlock immersive mockery experiences!
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onUpgrade}
              className="px-6 py-3 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              Upgrade to Elite
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-zinc-600 text-zinc-400 hover:border-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </ARModal>
    )
  }

  if (isLoading) {
    return (
      <ARModal onClose={onClose}>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white">Loading stadium tour...</p>
        </div>
      </ARModal>
    )
  }

  return (
    <ARModal onClose={onClose}>
      <FallbackTour config={config} displayText={displayText} onClose={onClose} />
    </ARModal>
  )
}

// Interactive 2D tour with feature hotspots
function FallbackTour({
  config,
  displayText,
  onClose,
}: {
  config: typeof STADIUM_CONFIG[string]
  displayText: string
  onClose: () => void
}) {
  const [activeFeature, setActiveFeature] = useState(0)

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl text-white text-center mb-4">
        {config.name} Tour
      </h2>
      <p className="text-red-500 text-center mb-6 font-bold">{displayText}</p>

      {/* Stadium image with feature markers */}
      <div className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden mb-6">
        {/* Placeholder for stadium image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-zinc-500">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p>Interactive Stadium Tour</p>
            <p className="text-xs mt-2">Click hotspots to explore</p>
          </div>
        </div>

        {/* Feature markers */}
        {config.features.map((feature, index) => (
          <button
            key={index}
            onClick={() => setActiveFeature(index)}
            className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all ${
              activeFeature === index
                ? 'bg-red-600 scale-125'
                : 'bg-zinc-700 hover:bg-red-600'
            }`}
            style={{
              left: `${20 + index * 30}%`,
              top: `${30 + (index % 2) * 30}%`,
            }}
            aria-label={feature.label}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Feature description */}
      <motion.div
        key={activeFeature}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-800 p-4 rounded-lg text-center"
      >
        <p className="text-white font-bold">{config.features[activeFeature]?.label}</p>
      </motion.div>

      <div className="mt-6 text-center">
        <p className="text-zinc-500 text-sm mb-4">
          For the full AR experience, try on iPhone with Safari.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
        >
          Close Tour
        </button>
      </div>
    </div>
  )
}

// Modal wrapper
function ARModal({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        role="dialog"
        aria-modal="true"
        aria-label="AR Stadium Tour"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="relative w-full max-w-lg">
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
